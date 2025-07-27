// src/pages/helpers/[id]/edit.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useHelper, useUpdateHelper } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import {
  ArrowLeftIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  CreditCardIcon,
  LanguageIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

export default function EditHelper() {
  const router = useRouter()
  const { id } = router.query
  const { hasPermission } = useAuth()
  const { helper, isLoading: helperLoading, error: helperError } = useHelper(id)
  const updateHelper = useUpdateHelper()
  const { success, error: showError } = useNotifications()

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
    bic: '',
    taxNumber: '',
    hourlyRate: '',
    availability: 'available'
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Load helper data into form when helper is loaded
  useEffect(() => {
    if (helper) {
      setFormData({
        firstName: helper.firstName || '',
        lastName: helper.lastName || '',
        email: helper.email || '',
        phone: helper.phone || '',
        street: helper.address?.street || '',
        zipCode: helper.address?.zipCode || '',
        city: helper.address?.city || '',
        birthDate: helper.birthDate || '',
        gender: helper.gender || '',
        qualifications: helper.qualifications || [],
        languages: helper.languages || '',
        iban: helper.bankDetails?.iban || '',
        bic: helper.bankDetails?.bic || '',
        taxNumber: helper.taxNumber || '',
        hourlyRate: helper.hourlyRate || '',
        availability: helper.availability || 'available'
      })
    }
  }, [helper])

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'Vorname ist erforderlich'
    if (!formData.lastName.trim()) newErrors.lastName = 'Nachname ist erforderlich'
    if (!formData.email.trim()) newErrors.email = 'E-Mail ist erforderlich'
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse'
    }

    // IBAN validation (basic)
    if (formData.iban && formData.iban.replace(/\s/g, '').length < 15) {
      newErrors.iban = 'IBAN ist zu kurz'
    }

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
      // Format data for API
      const helperData = {
        ...formData,
        address: {
          street: formData.street,
          zipCode: formData.zipCode,
          city: formData.city
        },
        bankDetails: formData.iban ? {
          iban: formData.iban,
          bic: formData.bic
        } : null,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        qualifications: formData.qualifications.filter(q => q.trim())
      }

      await updateHelper(id, helperData)
      success('Helfer wurde erfolgreich aktualisiert')
      router.push(`/helpers/${id}`)
    } catch (error) {
      console.error('Error updating helper:', error)
      showError('Fehler beim Aktualisieren des Helfers')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleQualificationChange = (index, value) => {
    const newQualifications = [...formData.qualifications]
    newQualifications[index] = value
    setFormData(prev => ({ ...prev, qualifications: newQualifications }))
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

  // Check permissions
  if (!hasPermission('edit_helpers')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Helfer zu bearbeiten.</p>
        </div>
      </Layout>
    )
  }

  if (helperLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Helfer-Details..." />
      </Layout>
    )
  }

  if (helperError || !helper) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Helfer nicht gefunden</h3>
          <p className="text-red-600 mb-4">
            {helperError?.message || 'Der angeforderte Helfer konnte nicht gefunden werden.'}
          </p>
          <Link href="/helpers" className="btn-primary">
            Zurück zur Übersicht
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{helper.firstName} {helper.lastName} bearbeiten - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header mit Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link 
            href={`/helpers/${id}`} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Zurück zu {helper.firstName} {helper.lastName}</span>
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
                  {helper.firstName} {helper.lastName} bearbeiten
                </h1>
                <p className="text-orange-100">Helfer-Informationen aktualisieren</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Personal Info Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <IdentificationIcon className="w-6 h-6 text-blue-600" />
              Persönliche Daten
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
                  placeholder="Max"
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
                  placeholder="Mustermann"
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
                  Geschlecht
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="input"
                >
                  <option value="">Bitte wählen</option>
                  <option value="maennlich">Männlich</option>
                  <option value="weiblich">Weiblich</option>
                  <option value="divers">Divers</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <EnvelopeIcon className="w-6 h-6 text-blue-600" />
              Kontaktdaten
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="max.mustermann@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="input"
                  placeholder="+49 123 456789"
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

          {/* Professional Info Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <LanguageIcon className="w-6 h-6 text-blue-600" />
              Berufliche Informationen
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stundensatz (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    className="input"
                    placeholder="25.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verfügbarkeit
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="input"
                  >
                    <option value="available">Verfügbar</option>
                    <option value="partially_available">Teilweise verfügbar</option>
                    <option value="unavailable">Nicht verfügbar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sprachen
                </label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                  className="input"
                  placeholder="Deutsch, Englisch, Spanisch..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifikationen
                </label>
                <div className="space-y-3">
                  {formData.qualifications.map((qualification, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => handleQualificationChange(index, e.target.value)}
                        className="input flex-1"
                        placeholder="z.B. Pflegehelfer, Haushaltsführung..."
                      />
                      <button
                        type="button"
                        onClick={() => removeQualification(index)}
                        className="btn-secondary text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addQualification}
                    className="btn-secondary"
                  >
                    Qualifikation hinzufügen
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banking Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCardIcon className="w-6 h-6 text-blue-600" />
              Bankdaten & Steuern
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN
                </label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => handleInputChange('iban', e.target.value.toUpperCase())}
                  className={`input font-mono text-sm ${errors.iban ? 'border-red-500' : ''}`}
                  placeholder="DE89 3704 0044 0532 0130 00"
                />
                {errors.iban && (
                  <p className="text-red-500 text-sm mt-1">{errors.iban}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BIC
                </label>
                <input
                  type="text"
                  value={formData.bic}
                  onChange={(e) => handleInputChange('bic', e.target.value.toUpperCase())}
                  className="input font-mono text-sm"
                  placeholder="COBADEFFXXX"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steuernummer
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                  className="input"
                  placeholder="123/456/78901"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Link href={`/helpers/${id}`} className="btn-secondary flex-1 justify-center">
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