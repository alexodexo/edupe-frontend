// src/pages/reports/[id]/edit.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useNotifications } from '@/lib/notifications'
import {
  ArrowLeftIcon,
  PencilIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { BERICHT_STATUS } from '@/lib/types'
import useSWR from 'swr'

export default function EditReport() {
  const router = useRouter()
  const { id } = router.query
  const { userProfile, userRole, hasPermission } = useAuth()
  const { success, error } = useNotifications()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: BERICHT_STATUS.ENTWURF,
    visibleToJugendamt: false
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch report data
  const { data: report, error: reportError, mutate: refreshReport } = useSWR(
    id ? [`/api/reports/${id}`, userProfile?.helfer_id || userProfile?.ansprechpartner_id, userRole] : null,
    async ([url, userId, userRole]) => {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (userRole) params.append('userRole', userRole)
      
      const response = await fetch(`${url}?${params.toString()}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Bericht nicht gefunden')
        }
        throw new Error('Failed to fetch report')
      }
      return response.json()
    }
  )

  // Load report data into form when report is loaded
  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || '',
        content: report.content || '',
        status: report.status || BERICHT_STATUS.ENTWURF,
        visibleToJugendamt: report.visibleToJugendamt || false
      })
    }
  }, [report])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Titel ist erforderlich'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      error('Bitte korrigieren Sie die Eingabefehler')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          status: formData.status,
          visibleToJugendamt: formData.visibleToJugendamt
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update report')
      }

      success('Bericht wurde erfolgreich aktualisiert')
      router.push(`/reports/${id}`)
    } catch (err) {
      error('Fehler beim Aktualisieren: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Check permissions
  if (!hasPermission('edit_reports')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Berichte zu bearbeiten.</p>
        </div>
      </Layout>
    )
  }

  if (reportError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Fehler beim Laden</h3>
          <p className="text-red-600 mb-4">{reportError.message}</p>
          <Link href="/reports" className="btn-primary">
            Zurück zu Berichten
          </Link>
        </div>
      </Layout>
    )
  }

  if (!report) {
    return (
      <Layout>
        <LoadingPage message="Lade Bericht..." />
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Bericht bearbeiten - {report.title} - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/reports/${id}`} className="btn-secondary">
            <ArrowLeftIcon className="w-5 h-5" />
            Zurück
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Bericht bearbeiten</h1>
            <p className="text-gray-600 mt-1">
              Fall {report.case?.caseNumber} - {report.case?.school}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`input ${errors.title ? 'border-red-300' : ''}`}
                required
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Berichtsinhalt
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="input"
                rows="12"
                placeholder="Berichtsinhalt..."
              />
            </div>

            {/* Status & Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="input"
                >
                  <option value={BERICHT_STATUS.ENTWURF}>Entwurf</option>
                  <option value={BERICHT_STATUS.FINAL}>Final</option>
                  <option value={BERICHT_STATUS.UEBERMITTELT}>Übermittelt</option>
                </select>
              </div>

              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="visibleToJugendamt"
                  checked={formData.visibleToJugendamt}
                  onChange={(e) => setFormData({...formData, visibleToJugendamt: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="visibleToJugendamt" className="ml-2 text-sm text-gray-700">
                  Für Jugendamt sichtbar
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Link href={`/reports/${id}`} className="btn-secondary flex-1">
                Abbrechen
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  'Speichert...'
                ) : (
                  <>
                    <PencilIcon className="w-5 h-5" />
                    Änderungen speichern
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