// src/pages/reports/new.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { useAuth } from '@/lib/auth'
import { useNotifications } from '@/lib/notifications'
import { LoadingSpinner } from '@/components/Loading'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { BERICHT_STATUS } from '@/lib/types'
import useSWR from 'swr'

const REPORT_TYPES = [
  { value: 'monthly', label: 'Monatsbericht' },
  { value: 'interim', label: 'Zwischenbericht' },
  { value: 'final', label: 'Abschlussbericht' },
  { value: 'custom', label: 'Individueller Bericht' }
]

export default function NewReport() {
  const router = useRouter()
  const { userProfile, userRole, hasPermission } = useAuth()
  const { success, error } = useNotifications()

  const [formData, setFormData] = useState({
    caseId: '',
    title: '',
    reportType: 'monthly',
    periodStart: '',
    periodEnd: '',
    visibleToJugendamt: false,
    content: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch cases for selection
  const { data: cases } = useSWR(
    ['/api/cases', userProfile?.helfer_id || userProfile?.ansprechpartner_id, userRole],
    async ([url, userId, userRole]) => {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (userRole) params.append('userRole', userRole)
      
      const response = await fetch(`${url}?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch cases')
      return response.json()
    }
  )

  const validateForm = () => {
    const newErrors = {}

    if (!formData.caseId) newErrors.caseId = 'Fall ist erforderlich'
    if (!formData.periodStart) newErrors.periodStart = 'Startdatum ist erforderlich'
    if (!formData.periodEnd) newErrors.periodEnd = 'Enddatum ist erforderlich'
    
    if (formData.periodStart && formData.periodEnd && formData.periodStart > formData.periodEnd) {
      newErrors.periodEnd = 'Enddatum muss nach dem Startdatum liegen'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      error('Bitte korrigieren Sie die Eingabefehler')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Get services for the selected case and period
      const servicesResponse = await fetch(
        `/api/services?fall_id=${formData.caseId}&startDate=${formData.periodStart}&endDate=${formData.periodEnd}`
      )
      const services = await servicesResponse.json()

      // Calculate statistics
      const serviceCount = services.length
      const totalHours = services.reduce((sum, service) => sum + (service.duration || 0), 0)

      // Generate automatic title if not provided
      const selectedCase = cases?.find(c => c.id === formData.caseId)
      const autoTitle = formData.title || 
        `${REPORT_TYPES.find(t => t.value === formData.reportType)?.label} - ${selectedCase?.title} - ${new Date(formData.periodStart).toLocaleDateString('de-DE')}`

      // Create report
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titel: autoTitle,
          inhalt: formData.content || `Bericht für den Zeitraum vom ${new Date(formData.periodStart).toLocaleDateString('de-DE')} bis ${new Date(formData.periodEnd).toLocaleDateString('de-DE')}.`,
          fall_id: formData.caseId,
          status: BERICHT_STATUS.ENTWURF,
          sichtbar_fuer_jugendamt: formData.visibleToJugendamt,
          erstellt_von: userProfile?.helfer_id,
          anzahl_leistungen: serviceCount,
          gesamtstunden: totalHours
        })
      })

      if (!response.ok) throw new Error('Failed to create report')

      const newReport = await response.json()
      success('Bericht wurde erfolgreich erstellt')
      router.push(`/reports/${newReport.id}`)
    } catch (err) {
      error('Fehler beim Erstellen des Berichts: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check permissions
  if (!hasPermission('create_reports')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Berichte zu erstellen.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Neuer Bericht - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/reports" className="btn-secondary">
            <ArrowLeftIcon className="w-5 h-5" />
            Zurück
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Neuer Bericht</h1>
            <p className="text-gray-600 mt-1">Erstellen Sie einen neuen Bericht für einen Fall</p>
          </div>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fall auswählen *
                </label>
                <select 
                  value={formData.caseId}
                  onChange={(e) => setFormData({...formData, caseId: e.target.value})}
                  className={`input ${errors.caseId ? 'border-red-300' : ''}`}
                  required
                >
                  <option value="">Bitte wählen...</option>
                  {cases?.map(case_ => (
                    <option key={case_.id} value={case_.id}>
                      {case_.caseNumber} - {case_.title}
                    </option>
                  ))}
                </select>
                {errors.caseId && (
                  <p className="text-sm text-red-600 mt-1">{errors.caseId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Berichtstyp
                </label>
                <select
                  value={formData.reportType}
                  onChange={(e) => setFormData({...formData, reportType: e.target.value})}
                  className="input"
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel (optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input"
                placeholder="Wird automatisch generiert wenn leer gelassen"
              />
            </div>

            {/* Time Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Berichtszeitraum *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Von</label>
                  <input 
                    type="date"
                    value={formData.periodStart}
                    onChange={(e) => setFormData({...formData, periodStart: e.target.value})}
                    className={`input ${errors.periodStart ? 'border-red-300' : ''}`}
                    required
                  />
                  {errors.periodStart && (
                    <p className="text-sm text-red-600 mt-1">{errors.periodStart}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Bis</label>
                  <input 
                    type="date"
                    value={formData.periodEnd}
                    onChange={(e) => setFormData({...formData, periodEnd: e.target.value})}
                    className={`input ${errors.periodEnd ? 'border-red-300' : ''}`}
                    required
                  />
                  {errors.periodEnd && (
                    <p className="text-sm text-red-600 mt-1">{errors.periodEnd}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Berichtsinhalt (optional)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="input"
                rows="4"
                placeholder="Zusätzlicher Inhalt für den Bericht..."
              />
            </div>

            {/* Options */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="visibleToJugendamt"
                checked={formData.visibleToJugendamt}
                onChange={(e) => setFormData({...formData, visibleToJugendamt: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="visibleToJugendamt" className="text-sm text-gray-700">
                Für Jugendamt sichtbar machen
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Link href="/reports" className="btn-secondary flex-1">
                Abbrechen
              </Link>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary flex-1"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    Erstelle...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="w-5 h-5" />
                    Bericht erstellen
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
} 