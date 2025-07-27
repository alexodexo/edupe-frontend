// src/components/ServiceBooking.js
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { SERVICE_TYPES, formatDuration, formatCurrency } from '@/lib/types'

export default function ServiceBooking({ 
  caseData, 
  helper,
  onSave, 
  onCancel,
  lastService = null 
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    type: SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE,
    location: caseData?.client?.address || '',
    description: '',
    activities: [''],
    achievements: '',
    nextSteps: ''
  })

  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
    travelTime: null,
    suggestedStartTime: null
  })

  const [isCalculatingTravel, setIsCalculatingTravel] = useState(false)

  // Service type options
  const serviceTypeOptions = [
    {
      value: SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE,
      label: 'Face-to-Face',
      icon: UserIcon,
      description: 'Persönliches Treffen mit dem Klienten'
    },
    {
      value: SERVICE_TYPES.WITH_CLIENT_REMOTE,
      label: 'Remote',
      icon: PhoneIcon,
      description: 'Telefonat oder Videocall'
    },
    {
      value: SERVICE_TYPES.WITHOUT_CLIENT,
      label: 'Ohne Klient',
      icon: BuildingOfficeIcon,
      description: 'Besprechung oder administrative Tätigkeit'
    }
  ]

  // Calculate duration
  const duration = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return 0
    
    const start = new Date(`${formData.date}T${formData.startTime}`)
    const end = new Date(`${formData.date}T${formData.endTime}`)
    
    if (end <= start) return 0
    
    return (end - start) / (1000 * 60 * 60) // hours
  }, [formData.date, formData.startTime, formData.endTime])

  // Calculate costs
  const costs = duration * (helper?.hourlyRate || 0)

  // Mock travel time calculation (würde in der echten App eine Maps API nutzen)
  const calculateTravelTime = async (fromLocation, toLocation) => {
    setIsCalculatingTravel(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock calculation - in reality würde Google Maps/OpenStreetMap API genutzt
    const mockTravelTime = Math.floor(Math.random() * 45) + 15 // 15-60 minutes
    
    setIsCalculatingTravel(false)
    return mockTravelTime
  }

  // Validate service booking
  useEffect(() => {
    const validateBooking = async () => {
      const errors = []
      const warnings = []
      let travelTime = null
      let suggestedStartTime = null

      // Basic validation
      if (!formData.date) errors.push('Datum ist erforderlich')
      if (!formData.startTime) errors.push('Startzeit ist erforderlich')
      if (!formData.endTime) errors.push('Endzeit ist erforderlich')
      if (!formData.description.trim()) errors.push('Beschreibung ist erforderlich')
      if (duration <= 0) errors.push('Endzeit muss nach Startzeit liegen')
      if (duration > 12) warnings.push('Einsatz länger als 12 Stunden')

      // Travel time validation for face-to-face services
      if (formData.type === SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE && lastService) {
        const currentDateTime = new Date(`${formData.date}T${formData.startTime}`)
        const lastServiceEnd = new Date(`${lastService.date}T${lastService.endTime}`)
        
        // Only check if this service is after the last one
        if (currentDateTime > lastServiceEnd) {
          const timeDifference = (currentDateTime - lastServiceEnd) / (1000 * 60) // minutes
          
          // Calculate travel time if locations are different
          if (lastService.location !== formData.location) {
            travelTime = await calculateTravelTime(lastService.location, formData.location)
            
            if (timeDifference < travelTime) {
              errors.push(`Zu wenig Zeit für Anfahrt. Mindestens ${travelTime} Minuten erforderlich.`)
              
              // Suggest new start time
              const suggestedTime = new Date(lastServiceEnd.getTime() + travelTime * 60000)
              suggestedStartTime = suggestedTime.toTimeString().slice(0, 5)
            }
          } else if (timeDifference < 15) {
            warnings.push('Weniger als 15 Minuten seit letzter Buchung am gleichen Ort')
          }
        }
      }

      setValidation({
        isValid: errors.length === 0,
        errors,
        warnings,
        travelTime,
        suggestedStartTime
      })
    }

    if (formData.date && formData.startTime && formData.type) {
      validateBooking()
    }
  }, [formData, lastService, duration])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validation.isValid) return
    
    const serviceData = {
      ...formData,
      duration,
      costs,
      helperId: helper.id,
      caseId: caseData.id,
      status: 'submitted',
      travelTime: validation.travelTime,
      createdAt: new Date().toISOString()
    }
    
    onSave(serviceData)
  }

  const addActivity = () => {
    setFormData({
      ...formData,
      activities: [...formData.activities, '']
    })
  }

  const updateActivity = (index, value) => {
    const newActivities = [...formData.activities]
    newActivities[index] = value
    setFormData({
      ...formData,
      activities: newActivities
    })
  }

  const removeActivity = (index) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter((_, i) => i !== index)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-blue-600" />
            Leistung erfassen
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Fall: {caseData.caseNumber} • {helper.vorname} {helper.nachname}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Art der Leistung
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {serviceTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: option.value })}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  formData.type === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <option.icon className={`w-5 h-5 ${
                    formData.type === option.value ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className="font-medium text-gray-900">{option.label}</span>
                </div>
                <p className="text-xs text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Startzeit
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endzeit
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="input"
              required
            />
          </div>
        </div>

        {/* Duration and Cost Display */}
        {duration > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-gray-900">{formatDuration(duration)}</p>
                <p className="text-sm text-gray-600">Dauer</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(helper.hourlyRate)}</p>
                <p className="text-sm text-gray-600">Stundensatz</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-blue-600">{formatCurrency(costs)}</p>
                <p className="text-sm text-gray-600">Gesamtkosten</p>
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        {formData.type === SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPinIcon className="w-4 h-4 inline mr-1" />
              Ort der Leistung
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input"
              placeholder="Vollständige Adresse eingeben"
              required
            />
          </div>
        )}

        {/* Validation Messages */}
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <div className="space-y-2">
            {validation.errors.map((error, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ))}
            
            {validation.warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">{warning}</p>
              </div>
            ))}

            {validation.suggestedStartTime && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <ClockIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    Vorgeschlagene Startzeit: <strong>{validation.suggestedStartTime}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, startTime: validation.suggestedStartTime })}
                    className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                  >
                    Zeit übernehmen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beschreibung der durchgeführten Tätigkeit *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows="4"
            placeholder="Detaillierte Beschreibung der Aktivitäten und Beobachtungen..."
            required
          />
        </div>

        {/* Activities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durchgeführte Aktivitäten
          </label>
          <div className="space-y-2">
            {formData.activities.map((activity, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => updateActivity(index, e.target.value)}
                  className="input flex-1"
                  placeholder={`Aktivität ${index + 1}`}
                />
                {formData.activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addActivity}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Weitere Aktivität hinzufügen
            </button>
          </div>
        </div>

        {/* Achievements and Next Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Erreichte Ziele / Fortschritte
            </label>
            <textarea
              value={formData.achievements}
              onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
              className="input"
              rows="3"
              placeholder="Was wurde erreicht? Welche Fortschritte gab es?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nächste Schritte
            </label>
            <textarea
              value={formData.nextSteps}
              onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
              className="input"
              rows="3"
              placeholder="Was ist für die nächsten Termine geplant?"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={!validation.isValid || isCalculatingTravel}
            className="btn-primary flex-1"
          >
            {isCalculatingTravel ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Prüfe Fahrtzeit...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Leistung buchen
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}