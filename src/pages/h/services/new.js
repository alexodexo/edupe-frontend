// src/pages/h/services/new.js - Mobile-optimierte Leistungsbuchung für Helfer
import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import HelperLayout from '@/components/HelperLayout'
import { LoadingPage } from '@/components/Loading'
import GooglePlacesAutocomplete from '@/components/GooglePlacesAutocomplete'
import { useAuth } from '@/lib/auth'
import { useHelpers, useServices, useCreateService } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import { SERVICE_TYPES } from '@/lib/types'
import {
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

export default function NewHelperService() {
  const router = useRouter()
  const { caseId } = router.query
  const { user, userProfile, userRole, hasPermission } = useAuth()
  const { helpers, isLoading: helpersLoading } = useHelpers()
  const { services } = useServices()
  const createService = useCreateService()
  const { success, error: showError } = useNotifications()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Find current helper profile
  const helperProfile = useMemo(() => {
    if (!helpers || !userProfile?.helfer_id) return null
    return helpers.find(h => h.id === userProfile.helfer_id)
  }, [helpers, userProfile])

  // Get active cases for this helper from the API data
  const activeCases = useMemo(() => {
    if (!helperProfile || !helperProfile.assignedCases) return []
    return helperProfile.assignedCases.map(caseData => ({
      id: caseData.id,
      caseNumber: caseData.caseNumber,
      clientName: `${caseData.firstName} ${caseData.lastName}`,
      clientAddress: `${caseData.address || ''} ${caseData.zipCode || ''} ${caseData.city || ''}`.trim()
    }))
  }, [helperProfile])

  const [formData, setFormData] = useState({
    caseId: caseId || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    type: SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE,
    location: '',
    description: '',
    activities: [''],
    achievements: '',
    nextSteps: ''
  })

  // Service type options optimized for mobile
  const serviceTypeOptions = [
    {
      value: SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE,
      label: 'Persönliches Treffen',
      shortLabel: 'Face-to-Face',
      icon: UserIcon,
      description: 'Direkter Kontakt mit dem Klienten',
      color: 'blue'
    },
    {
      value: SERVICE_TYPES.WITH_CLIENT_REMOTE,
      label: 'Telefon/Video',
      shortLabel: 'Remote',
      icon: PhoneIcon,
      description: 'Telefonat oder Videocall',
      color: 'green'
    },
    {
      value: SERVICE_TYPES.WITHOUT_CLIENT,
      label: 'Ohne Klient',
      shortLabel: 'Admin',
      icon: BuildingOfficeIcon,
      description: 'Vorbereitung oder Dokumentation',
      color: 'purple'
    }
  ]

  // Calculate duration
  const duration = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return 0
    const start = new Date(`2000-01-01T${formData.startTime}:00`)
    const end = new Date(`2000-01-01T${formData.endTime}:00`)
    return Math.max(0, (end - start) / (1000 * 60 * 60))
  }, [formData.startTime, formData.endTime])

  // Validation
  const validation = useMemo(() => {
    const errors = []
    const warnings = []

    if (!formData.caseId) errors.push('Bitte wählen Sie einen Fall aus')
    if (!formData.startTime) errors.push('Startzeit ist erforderlich')
    if (!formData.endTime) errors.push('Endzeit ist erforderlich')
    if (duration <= 0) errors.push('Endzeit muss nach Startzeit liegen')
    if (duration > 8) warnings.push('Arbeitszeit über 8 Stunden')
    if (!formData.description.trim()) errors.push('Beschreibung ist erforderlich')

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [formData, duration])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleActivityChange = (index, value) => {
    const newActivities = [...formData.activities]
    newActivities[index] = value
    setFormData(prev => ({
      ...prev,
      activities: newActivities
    }))
  }

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, '']
    }))
  }

  const removeActivity = (index) => {
    if (formData.activities.length > 1) {
      setFormData(prev => ({
        ...prev,
        activities: prev.activities.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async () => {
    if (!validation.isValid) return

    setIsSubmitting(true)
    try {
      // Transform data to match API expectations (database field names)
      const serviceData = {
        fall_id: formData.caseId,
        helfer_id: helperProfile.id,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        typ: formData.type,
        standort: formData.location,
        notiz: formData.description,
        erstellt_von: helperProfile.id
      }
      
      await createService(serviceData)
      success('Leistung wurde erfolgreich eingereicht! ✅')
      router.push('/h')
    } catch (error) {
      console.error('Error creating service:', error)
      showError('Fehler beim Einreichen der Leistung')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
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
        <LoadingPage message="Lade Daten..." />
      </HelperLayout>
    )
  }

  if (!helperProfile || activeCases.length === 0) {
    return (
      <HelperLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center px-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine aktiven Fälle</h3>
            <p className="text-gray-600 mb-6">
              Sie haben derzeit keine zugewiesenen Fälle, für die Sie Leistungen buchen können.
            </p>
            <button
              onClick={() => router.push('/h')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      </HelperLayout>
    )
  }

  return (
    <HelperLayout title="Leistung buchen - Edupe Digital">
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/h')}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 ml-2">Leistung eintragen</h1>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-0.5 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Schritt {currentStep} von 3: {
              currentStep === 1 ? 'Grunddaten' :
              currentStep === 2 ? 'Details' :
              'Zusammenfassung'
            }
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Case Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Fall auswählen *
              </label>
              <div className="space-y-3">
                {activeCases.map((case_) => (
                  <button
                    key={case_.id}
                    onClick={() => handleInputChange('caseId', case_.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.caseId === case_.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{case_.caseNumber}</div>
                    <div className="text-sm text-gray-600">{case_.clientName}</div>
                    <div className="text-xs text-gray-500 mt-1">{case_.clientAddress}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Service Type */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Art der Leistung *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {serviceTypeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('type', option.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.type === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          formData.type === option.value
                            ? `bg-${option.color}-100`
                            : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            formData.type === option.value
                              ? `text-${option.color}-600`
                              : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date and Time */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Von *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bis *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      required
                    />
                  </div>
                </div>

                {duration > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">
                        Dauer: {duration.toFixed(1)} Stunden
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Debug validation */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded mb-2">
                Debug: caseId={formData.caseId ? '✓' : '✗'} | 
                startTime={formData.startTime ? '✓' : '✗'} | 
                endTime={formData.endTime ? '✓' : '✗'} | 
                duration={duration}h ({duration > 0 ? '✓' : '✗'})
              </div>
            )}

            <button
              onClick={nextStep}
              disabled={!formData.caseId || !formData.startTime || !formData.endTime || duration <= 0}
              className="w-full py-4 px-6 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Location */}
            {formData.type === SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ort der Leistung
                </label>
                <GooglePlacesAutocomplete
                  value={formData.location}
                  onChange={(address) => handleInputChange('location', address)}
                  placeholder="z.B. Musterstraße 1, 12345 Berlin"
                  onPlaceSelect={(place) => {
                    // Store additional place details if needed
                    console.log('Selected place:', place)
                  }}
                />
                <p className="mt-2 text-xs text-gray-500">
                  🔒 Sichere Adresssuche - Beginnen Sie zu tippen für Adressvorschläge
                </p>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Beschreibung der Leistung *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Was wurde gemacht? Kurze Beschreibung der erbrachten Leistung..."
                required
              />
            </div>

            {/* Activities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Durchgeführte Aktivitäten
              </label>
              <div className="space-y-3">
                {formData.activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={activity}
                      onChange={(e) => handleActivityChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Aktivität ${index + 1}`}
                    />
                    {formData.activities.length > 1 && (
                      <button
                        onClick={() => removeActivity(index)}
                        className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addActivity}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Aktivität hinzufügen
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={prevStep}
                className="flex-1 py-4 px-6 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
              >
                Zurück
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.description.trim()}
                className="flex-1 py-4 px-6 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Zusammenfassung</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fall:</span>
                  <span className="font-medium">
                    {activeCases.find(c => c.id === formData.caseId)?.caseNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Typ:</span>
                  <span className="font-medium">
                    {serviceTypeOptions.find(t => t.value === formData.type)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Datum:</span>
                  <span className="font-medium">
                    {new Date(formData.date).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zeit:</span>
                  <span className="font-medium">
                    {formData.startTime} - {formData.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dauer:</span>
                  <span className="font-medium">{duration.toFixed(1)} Stunden</span>
                </div>
                {formData.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ort:</span>
                    <span className="font-medium">{formData.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Errors/Warnings */}
            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="space-y-3">
                {validation.errors.map((error, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-sm text-red-800">{error}</span>
                    </div>
                  </div>
                ))}
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800">{warning}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={prevStep}
                className="flex-1 py-4 px-6 border border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
              >
                Zurück
              </button>
              <button
                onClick={handleSubmit}
                disabled={!validation.isValid || isSubmitting}
                className="flex-1 py-4 px-6 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Wird eingereicht...' : 'Leistung einreichen'}
              </button>
            </div>
          </div>
        )}
      </div>
    </HelperLayout>
  )
}