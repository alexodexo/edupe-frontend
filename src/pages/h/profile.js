// src/pages/h/profile.js - Helfer Profil Bearbeitung
import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import HelperLayout from '@/components/HelperLayout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useHelpers, useUpdateHelper } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

export default function HelperProfile() {
  const router = useRouter()
  const { user, userProfile, userRole, hasPermission } = useAuth()
  const { helpers, isLoading: helpersLoading, error: helpersError } = useHelpers()
  const updateHelper = useUpdateHelper()
  const { success, error: showError } = useNotifications()

  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSensitiveData, setShowSensitiveData] = useState(false)

  // Find current helper profile
  const helperProfile = useMemo(() => {
    if (!helpers || !userProfile?.helfer_id) return null
    return helpers.find(h => h.id === userProfile.helfer_id)
  }, [helpers, userProfile])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    zipCode: '',
    city: '',
    birthDate: '',
    gender: '',
    qualifications: [],
    languages: '',
    iban: '',
    taxNumber: ''
  })

  // Load helper data into form when available
  useEffect(() => {
    if (helperProfile) {
      setFormData({
        firstName: helperProfile.firstName || '',
        lastName: helperProfile.lastName || '',
        email: helperProfile.email || '',
        phone: helperProfile.phone || '',
        street: helperProfile.address?.street || '',
        zipCode: helperProfile.address?.zipCode || '',
        city: helperProfile.address?.city || '',
        birthDate: helperProfile.birthDate || '',
        gender: helperProfile.gender || '',
        qualifications: helperProfile.qualifications || [],
        languages: helperProfile.languages || '',
        iban: helperProfile.bankDetails?.iban || '',
        taxNumber: helperProfile.taxNumber || ''
      })
    }
  }, [helperProfile])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleQualificationChange = (index, value) => {
    const newQualifications = [...formData.qualifications]
    newQualifications[index] = value
    setFormData(prev => ({
      ...prev,
      qualifications: newQualifications.filter(q => q.trim() !== '')
    }))
  }

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, '']
    }))
  }

  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!helperProfile) return

    setIsSubmitting(true)
    try {
      await updateHelper(helperProfile.id, formData)
      success('Profil wurde erfolgreich aktualisiert')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      showError('Fehler beim Aktualisieren des Profils')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (helperProfile) {
      setFormData({
        firstName: helperProfile.firstName || '',
        lastName: helperProfile.lastName || '',
        email: helperProfile.email || '',
        phone: helperProfile.phone || '',
        street: helperProfile.address?.street || '',
        zipCode: helperProfile.address?.zipCode || '',
        city: helperProfile.address?.city || '',
        birthDate: helperProfile.birthDate || '',
        gender: helperProfile.gender || '',
        qualifications: helperProfile.qualifications || [],
        languages: helperProfile.languages || '',
        iban: helperProfile.bankDetails?.iban || '',
        taxNumber: helperProfile.taxNumber || ''
      })
    }
    setIsEditing(false)
  }

  // Check if user is helper
  if (!userRole || userRole !== 'helper') {
    return (
      <HelperLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung für den Helfer-Bereich.</p>
          </div>
        </div>
      </HelperLayout>
    )
  }

  if (helpersLoading) {
    return (
      <HelperLayout>
        <LoadingPage message="Lade Profil..." />
      </HelperLayout>
    )
  }

  if (helpersError || !helperProfile) {
    return (
      <HelperLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-900 mb-2">Fehler beim Laden</h3>
            <p className="text-red-600 mb-4">
              {helpersError?.message || 'Profil konnte nicht geladen werden'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </HelperLayout>
    )
  }

  return (
    <HelperLayout title="Profil - Edupe Digital">
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Mein Profil</h1>
              <p className="text-gray-600">
                Verwalten Sie Ihre persönlichen Daten und Kontaktinformationen.
              </p>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Bearbeiten
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Speichert...' : 'Speichern'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Persönliche Daten</h2>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vorname *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {formData.firstName || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nachname *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {formData.lastName || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Geburtsdatum
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('de-DE') : '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Geschlecht
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Bitte wählen</option>
                      <option value="male">Männlich</option>
                      <option value="female">Weiblich</option>
                      <option value="diverse">Divers</option>
                    </select>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {formData.gender === 'male' ? 'Männlich' : 
                       formData.gender === 'female' ? 'Weiblich' : 
                       formData.gender === 'diverse' ? 'Divers' : '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Kontaktdaten</h2>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail *
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {formData.email || '-'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {formData.phone || '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Adresse</h2>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Straße und Hausnummer
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {formData.street || '-'}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PLZ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {formData.zipCode || '-'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stadt
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {formData.city || '-'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Qualifikationen & Sprachen</h2>
              </div>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zusätzliche Qualifikationen
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    {formData.qualifications.map((qualification, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={qualification}
                          onChange={(e) => handleQualificationChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="z.B. Erste Hilfe Kurs"
                        />
                        <button
                          type="button"
                          onClick={() => removeQualification(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addQualification}
                      className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      + Qualifikation hinzufügen
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    {formData.qualifications.length > 0 ? (
                      <ul className="space-y-1">
                        {formData.qualifications.map((qualification, index) => (
                          <li key={index} className="text-gray-900">• {qualification}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-900">-</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sprachen
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => handleInputChange('languages', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. Deutsch (Muttersprache), Englisch (fließend)"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {formData.languages || '-'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Finanzielle Angaben</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSensitiveData(!showSensitiveData)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  {showSensitiveData ? (
                    <>
                      <EyeSlashIcon className="h-4 w-4 mr-1" />
                      Ausblenden
                    </>
                  ) : (
                    <>
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Anzeigen
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) => handleInputChange('iban', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="DE89 3704 0044 0532 0130 00"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-mono">
                      {showSensitiveData 
                        ? (formData.iban || '-')
                        : (formData.iban ? '••••••••••••••' + formData.iban.slice(-4) : '-')
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Steuernummer
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                      {showSensitiveData 
                        ? (formData.taxNumber || '-')
                        : (formData.taxNumber ? '•••••••••' + formData.taxNumber.slice(-3) : '-')
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile completeness indicator */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">
                  Profil Vollständigkeit
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Ihr Profil ist {helperProfile?.complianceStatus === 'valid' ? 'vollständig' : 'unvollständig'}.</p>
                  {helperProfile?.complianceStatus !== 'valid' && (
                    <p className="mt-1">Bitte füllen Sie alle erforderlichen Felder aus.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </HelperLayout>
  )
}