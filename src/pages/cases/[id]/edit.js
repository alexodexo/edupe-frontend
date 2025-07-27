// src/pages/cases/[id]/edit.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useCase, useHelpers, useUpdateCase } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import {
  ArrowLeftIcon,
  PencilIcon,
  UserIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CalendarIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { CASE_STATUS } from '@/lib/types'

export default function EditCase() {
  const router = useRouter()
  const { id } = router.query
  const { hasPermission } = useAuth()
  const { case: caseData, isLoading: caseLoading, error: caseError } = useCase(id)
  const { helpers } = useHelpers()
  const updateCase = useUpdateCase()
  const { success, error: showError } = useNotifications()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    street: '',
    zipCode: '',
    city: '',
    school: '',
    firstContactText: '',
    helperId: '',
    status: '',
    priority: 'medium',
    plannedHours: ''
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Load case data into form when case is loaded
  useEffect(() => {
    if (caseData) {
      // Parse address if it exists
      const addressParts = caseData.client?.address?.split(', ') || []
      const streetPart = addressParts[0] || ''
      const cityPart = addressParts[1] || ''
      const zipCityMatch = cityPart.match(/^(\d{5})\s+(.+)$/)
      
      setFormData({
        firstName: caseData.client?.firstName || '',
        lastName: caseData.client?.lastName || '',
        birthDate: caseData.client?.birthDate || '',
        street: streetPart,
        zipCode: zipCityMatch ? zipCityMatch[1] : '',
        city: zipCityMatch ? zipCityMatch[2] : cityPart,
        school: caseData.client?.school || '',
        firstContactText: caseData.description || '',
        helperId: caseData.assignedHelpers?.[0] || '',
        status: caseData.status || 'offen',
        priority: caseData.priority || 'medium',
        plannedHours: caseData.plannedHours || ''
      })
    }
  }, [caseData])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'Vorname ist erforderlich'
    if (!formData.lastName.trim()) newErrors.lastName = 'Nachname ist erforderlich'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showError('Bitte korrigieren Sie die Eingabefehler')
      return
    }

    setLoading(true)

    try {
      const updateData = {
        vorname: formData.firstName,
        nachname: formData.lastName,
        geburtsdatum: formData.birthDate || null,
        strasse: formData.street,
        plz: formData.zipCode,
        stadt: formData.city,
        schule_oder_kita: formData.school,
        erstkontakt_text: formData.firstContactText,
        status: formData.status,
        priority: formData.priority,
        planned_hours: formData.plannedHours ? parseInt(formData.plannedHours) : null,
        helfer_id: formData.helperId || null
      }

      await updateCase(id, updateData)
      success('Fall wurde erfolgreich aktualisiert')
      router.push(`/cases/${id}`)
    } catch (error) {
      console.error('Error updating case:', error)
      showError('Fehler beim Aktualisieren des Falls')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  // Check permissions
  if (!hasPermission('edit_cases')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Fälle zu bearbeiten.</p>
        </div>
      </Layout>
    )
  }

  if (caseLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Fall-Details..." />
      </Layout>
    )
  }

  if (caseError || !caseData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Fall nicht gefunden</h3>
          <p className="text-red-600 mb-4">
            {caseError?.message || 'Der angeforderte Fall konnte nicht gefunden werden.'}
          </p>
          <Link href="/cases" className="btn-primary">
            Zurück zur Übersicht
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{caseData.title} bearbeiten - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header mit Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link 
            href={`/cases/${id}`} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Zurück zu {caseData.title}</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <PencilIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white mb-1">
                  {caseData.title} bearbeiten
                </h1>
                <p className="text-orange-100">Fall-Informationen aktualisieren</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Client Info Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-blue-600" />
              Klient-Informationen
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vorname *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`input ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="Anna"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nachname *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Schmidt"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geburtsdatum
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schule/Kita
                </label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  className="input"
                  placeholder="Grundschule Musterstraße"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MapPinIcon className="w-6 h-6 text-blue-600" />
              Adresse
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Straße und Hausnummer
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className="input"
                  placeholder="Musterstraße 123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="input"
                    placeholder="12345"
                    maxLength="5"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stadt
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="input"
                    placeholder="Musterstadt"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Case Management Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
              Fall-Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="input"
                >
                  <option value={CASE_STATUS.OFFEN}>Offen</option>
                  <option value={CASE_STATUS.IN_BEARBEITUNG}>In Bearbeitung</option>
                  <option value={CASE_STATUS.WARTEND}>Wartend</option>
                  <option value={CASE_STATUS.ABGESCHLOSSEN}>Abgeschlossen</option>
                  <option value={CASE_STATUS.ABGELEHNT}>Abgelehnt</option>
                  <option value={CASE_STATUS.STORNIERT}>Storniert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorität
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="input"
                >
                  <option value="low">Niedrig</option>
                  <option value="medium">Mittel</option>
                  <option value="high">Hoch</option>
                  <option value="urgent">Dringend</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zugewiesener Helfer
                </label>
                <select
                  value={formData.helperId}
                  onChange={(e) => handleInputChange('helperId', e.target.value)}
                  className="input"
                >
                  <option value="">Kein Helfer zugewiesen</option>
                  {helpers?.map(helper => (
                    <option key={helper.id} value={helper.id}>
                      {helper.firstName} {helper.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geplante Stunden
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.plannedHours}
                  onChange={(e) => handleInputChange('plannedHours', e.target.value)}
                  className="input"
                  placeholder="200"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              Erstkontakt-Notizen
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notizen zum ersten Kontakt
              </label>
              <textarea
                value={formData.firstContactText}
                onChange={(e) => handleInputChange('firstContactText', e.target.value)}
                className="input"
                rows="6"
                placeholder="Beschreiben Sie den ersten Kontakt, besondere Bedürfnisse, wichtige Informationen..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Link href={`/cases/${id}`} className="btn-secondary flex-1 justify-center">
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Speichern...
                </div>
              ) : (
                'Änderungen speichern'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}