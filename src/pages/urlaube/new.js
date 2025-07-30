// src/pages/urlaube/new.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { useAuth } from '@/lib/auth'
import { useCreateVacation } from '@/hooks/useData'
import { useHelpers } from '@/hooks/useData'
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  XCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export default function NewVacation() {
  const router = useRouter()
  const { userRole, hasPermission, userProfile } = useAuth()
  const { helpers } = useHelpers()
  const { createVacation, isLoading, error } = useCreateVacation()

  const [formData, setFormData] = useState({
    von_datum: '',
    bis_datum: '',
    vertretung: '',
    notiz: ''
  })

  const [validationErrors, setValidationErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.von_datum) {
      errors.von_datum = 'Startdatum ist erforderlich'
    }

    if (!formData.bis_datum) {
      errors.bis_datum = 'Enddatum ist erforderlich'
    }

    if (formData.von_datum && formData.bis_datum) {
      const fromDate = new Date(formData.von_datum)
      const toDate = new Date(formData.bis_datum)
      
      if (fromDate >= toDate) {
        errors.bis_datum = 'Enddatum muss nach dem Startdatum liegen'
      }

      if (fromDate < new Date()) {
        errors.von_datum = 'Urlaub kann nicht in der Vergangenheit beginnen'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Check if userProfile and helfer_id exist
    if (!userProfile?.helfer_id) {
      console.error('No helfer_id found in userProfile:', userProfile)
      alert('Fehler: Benutzerprofil nicht gefunden. Bitte melden Sie sich erneut an.')
      return
    }

    try {
      console.log('Creating vacation with data:', {
        ...formData,
        helfer_id: userProfile.helfer_id
      })

      await createVacation({
        ...formData,
        helfer_id: userProfile.helfer_id
      })
      
      // Redirect to vacations list
      router.push('/urlaube')
    } catch (error) {
      console.error('Error creating vacation:', error)
      alert(`Fehler beim Erstellen des Urlaubs: ${error.message}`)
    }
  }

  const calculateDays = () => {
    if (formData.von_datum && formData.bis_datum) {
      const fromDate = new Date(formData.von_datum)
      const toDate = new Date(formData.bis_datum)
      const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1
      return days
    }
    return 0
  }

  // Check permissions
  if (!hasPermission('create_vacations')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Urlaubsanträge zu erstellen.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Neuer Urlaubsantrag - Edupe Digital</title>
      </Head>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/urlaube')}
            className="btn-secondary"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Zurück
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Neuer Urlaubsantrag</h1>
            <p className="text-gray-600 mt-1">Erstellen Sie einen neuen Urlaubsantrag</p>
          </div>
        </div>

        {/* Form */}
        <div className="card rounded p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Von Datum <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="von_datum"
                    required
                    value={formData.von_datum}
                    onChange={handleInputChange}
                    className={`input pl-10 w-full ${validationErrors.von_datum ? 'input-error' : ''}`}
                  />
                </div>
                {validationErrors.von_datum && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.von_datum}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bis Datum <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="bis_datum"
                    required
                    value={formData.bis_datum}
                    onChange={handleInputChange}
                    className={`input pl-10 w-full ${validationErrors.bis_datum ? 'input-error' : ''}`}
                  />
                </div>
                {validationErrors.bis_datum && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.bis_datum}</p>
                )}
              </div>
            </div>

            {/* Days Summary */}
            {calculateDays() > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Urlaubsdauer: {calculateDays()} {calculateDays() === 1 ? 'Tag' : 'Tage'}
                  </span>
                </div>
              </div>
            )}

            {/* Substitute */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vertretung (optional)
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="vertretung"
                  value={formData.vertretung}
                  onChange={handleInputChange}
                  className="input pl-10 w-full"
                >
                  <option value="">Keine Vertretung</option>
                  {helpers?.map(helper => (
                    <option key={helper.id} value={helper.id}>
                      {helper.firstName} {helper.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Wählen Sie einen Kollegen aus, der Sie während Ihres Urlaubs vertritt
              </p>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notiz (optional)
              </label>
              <textarea
                name="notiz"
                value={formData.notiz}
                onChange={handleInputChange}
                rows={4}
                className="input w-full"
                placeholder="Zusätzliche Informationen zu Ihrem Urlaubsantrag..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Hier können Sie wichtige Informationen oder Gründe für Ihren Urlaub angeben
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="flex items-center gap-2">
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-900">
                    Fehler beim Erstellen des Urlaubsantrags
                  </span>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/urlaube')}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Erstelle...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Urlaubsantrag erstellen
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="card bg-blue-50 border-blue-200 rounded p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Wichtige Hinweise</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Urlaubsanträge müssen mindestens 2 Wochen im Voraus eingereicht werden</li>
                <li>• Überlappende Urlaubsanträge werden automatisch abgelehnt</li>
                <li>• Urlaub kann nicht in der Vergangenheit beginnen</li>
                <li>• Nach dem Erstellen können Sie den Antrag noch bearbeiten</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 