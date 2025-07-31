// src/pages/h/urlaube/new.js - Helfer Urlaub beantragen
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import HelperLayout from '@/components/HelperLayout'
import { useAuth } from '@/lib/auth'
import { useCreateVacation, useHelpers } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  XCircleIcon,
  CheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export default function NewHelperVacation() {
  const router = useRouter()
  const { userRole, hasPermission, userProfile } = useAuth()
  const { helpers } = useHelpers()
  const { createVacation, isLoading, error } = useCreateVacation()
  const { success, error: showError } = useNotifications()

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
      const startDate = new Date(formData.von_datum)
      const endDate = new Date(formData.bis_datum)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (startDate < today) {
        errors.von_datum = 'Startdatum kann nicht in der Vergangenheit liegen'
      }

      if (endDate < startDate) {
        errors.bis_datum = 'Enddatum muss nach dem Startdatum liegen'
      }
    }

    return errors
  }

  const calculateDuration = () => {
    if (formData.von_datum && formData.bis_datum) {
      const startDate = new Date(formData.von_datum)
      const endDate = new Date(formData.bis_datum)
      const timeDiff = endDate.getTime() - startDate.getTime()
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
      return dayDiff > 0 ? dayDiff : 0
    }
    return 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      const vacationData = {
        ...formData,
        helfer_id: userProfile?.helfer_id
      }
      
      await createVacation(vacationData)
      success('Urlaubsantrag wurde erfolgreich eingereicht! 🏖️')
      router.push('/h/urlaube')
    } catch (error) {
      console.error('Error creating vacation:', error)
      showError('Fehler beim Einreichen des Urlaubsantrags')
    }
  }

  // Available helpers for substitution (excluding current helper)
  const availableHelpers = helpers?.filter(helper => 
    helper.id !== userProfile?.helfer_id && helper.availability !== 'unavailable'
  ) || []

  // Check permissions
  if (!hasPermission('create_vacations')) {
    return (
      <HelperLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung, Urlaube zu beantragen.</p>
          </div>
        </div>
      </HelperLayout>
    )
  }

  const duration = calculateDuration()

  return (
    <HelperLayout title="Urlaub beantragen - Edupe Digital">
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/h/urlaube')}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 ml-2">Urlaub beantragen</h1>
          </div>
          <p className="text-gray-600">
            Reichen Sie Ihren Urlaubsantrag ein. Ihr Antrag wird zur Prüfung weitergeleitet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vacation Period */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Urlaubszeitraum</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Von Datum *
                </label>
                <input
                  type="date"
                  name="von_datum"
                  value={formData.von_datum}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.von_datum ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.von_datum && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.von_datum}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bis Datum *
                </label>
                <input
                  type="date"
                  name="bis_datum"
                  value={formData.bis_datum}
                  onChange={handleInputChange}
                  min={formData.von_datum || new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.bis_datum ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.bis_datum && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.bis_datum}</p>
                )}
              </div>
            </div>

            {duration > 0 && (
              <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">
                    Urlaubsdauer: {duration} Tag{duration !== 1 ? 'e' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Substitute */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Vertretung</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vertretung auswählen (optional)
              </label>
              <select
                name="vertretung"
                value={formData.vertretung}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Keine Vertretung</option>
                {availableHelpers.map((helper) => (
                  <option key={helper.id} value={helper.id}>
                    {helper.firstName} {helper.lastName}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Wählen Sie optional einen Kollegen als Vertretung aus.
              </p>
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Notiz</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zusätzliche Informationen (optional)
              </label>
              <textarea
                name="notiz"
                value={formData.notiz}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Grund für den Urlaub, besondere Hinweise..."
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push('/h/urlaube')}
              className="flex-1 py-3 px-6 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading || Object.keys(validationErrors).length > 0}
              className="flex-1 py-3 px-6 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Wird eingereicht...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Urlaub beantragen
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </HelperLayout>
  )
}