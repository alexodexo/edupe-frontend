// src/pages/ansprechpartner/[id]/edit.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useAnsprechpartnerDetail, useUpdateAnsprechpartner, useCases } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import {
  ArrowLeftIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  BriefcaseIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

export default function EditAnsprechpartner() {
  const router = useRouter()
  const { id } = router.query
  const { hasPermission } = useAuth()
  const { ansprechpartner, isLoading, error, refresh } = useAnsprechpartnerDetail(id)
  const updateAnsprechpartner = useUpdateAnsprechpartner()
  const { cases } = useCases()
  const { success, error: showError } = useNotifications()

  const [formData, setFormData] = useState({
    jugendamt: '',
    name: '',
    email: '',
    telefon: '',
    assignedFaelle: []
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showCaseSelection, setShowCaseSelection] = useState(false)

  // Initialize form data when ansprechpartner data loads
  useEffect(() => {
    if (ansprechpartner) {
      setFormData({
        jugendamt: ansprechpartner.jugendamt || '',
        name: ansprechpartner.name || '',
        email: ansprechpartner.email || '',
        telefon: ansprechpartner.phone || '',
        assignedFaelle: ansprechpartner.assignedCases?.map(c => c.fall_id) || []
      })
    }
  }, [ansprechpartner])

  // Filter available cases (not already assigned to other ansprechpartner, except current ones)
  const availableCases = cases.filter(case_ => 
    case_.status !== 'abgeschlossen' && 
    (!case_.ansprechpartner_id || formData.assignedFaelle.includes(case_.fall_id))
  )

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.jugendamt.trim()) newErrors.jugendamt = 'Jugendamt ist erforderlich'
    if (!formData.name.trim()) newErrors.name = 'Name ist erforderlich'
    if (!formData.email.trim()) newErrors.email = 'E-Mail ist erforderlich'
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse'
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
      await updateAnsprechpartner(id, {
        jugendamt: formData.jugendamt.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        telefon: formData.telefon.trim() || null,
        assignedFaelle: formData.assignedFaelle
      })

      success('Ansprechpartner wurde erfolgreich aktualisiert')
      router.push(`/ansprechpartner/${id}`)
    } catch (error) {
      console.error('Error updating ansprechpartner:', error)
      showError(error.message || 'Fehler beim Aktualisieren des Ansprechpartners')
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

  const handleCaseToggle = (caseId) => {
    setFormData(prev => ({
      ...prev,
      assignedFaelle: prev.assignedFaelle.includes(caseId)
        ? prev.assignedFaelle.filter(id => id !== caseId)
        : [...prev.assignedFaelle, caseId]
    }))
  }

  const getSelectedCasesInfo = () => {
    if (formData.assignedFaelle.length === 0) return 'Keine Fälle ausgewählt'
    
    const selectedCases = cases.filter(case_ => 
      formData.assignedFaelle.includes(case_.fall_id)
    )
    
    if (selectedCases.length === 1) {
      const case_ = selectedCases[0]
      return `1 Fall: ${case_.aktenzeichen} - ${case_.vorname} ${case_.nachname}`
    }
    
    return `${selectedCases.length} Fälle ausgewählt`
  }

  // Check permissions
  if (!hasPermission('edit_ansprechpartner')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Ansprechpartner zu bearbeiten.</p>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Ansprechpartner-Details..." />
      </Layout>
    )
  }

  if (error || !ansprechpartner) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Ansprechpartner nicht gefunden</h3>
          <p className="text-red-600 mb-4">
            {error?.message || 'Der angeforderte Ansprechpartner konnte nicht gefunden werden.'}
          </p>
          <Link href="/ansprechpartner" className="btn-primary">
            Zurück zur Übersicht
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{ansprechpartner.name} bearbeiten - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header mit Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link 
            href={`/ansprechpartner/${id}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Zurück zu {ansprechpartner.name}</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <PencilIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white mb-1">
                  {ansprechpartner.name} bearbeiten
                </h1>
                <p className="text-purple-100">Ansprechpartner-Daten und Fallzuordnungen aktualisieren</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Info Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <IdentificationIcon className="w-6 h-6 text-purple-600" />
              Grunddaten
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jugendamt *
                </label>
                <input
                  type="text"
                  value={formData.jugendamt}
                  onChange={(e) => handleInputChange('jugendamt', e.target.value)}
                  className={`input ${errors.jugendamt ? 'border-red-500' : ''}`}
                  placeholder="z.B. Jugendamt München"
                />
                {errors.jugendamt && (
                  <p className="text-red-500 text-sm mt-1">{errors.jugendamt}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Max Mustermann"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <EnvelopeIcon className="w-6 h-6 text-purple-600" />
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
                  placeholder="max.mustermann@jugendamt-beispiel.de"
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
                  value={formData.telefon}
                  onChange={(e) => handleInputChange('telefon', e.target.value)}
                  className="input"
                  placeholder="+49 89 123456"
                />
              </div>
            </div>
          </div>

          {/* Case Assignment Section */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BriefcaseIcon className="w-6 h-6 text-purple-600" />
              Fallzuordnung
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Fälle zuordnen</p>
                  <p className="text-sm text-gray-600">
                    {getSelectedCasesInfo()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCaseSelection(!showCaseSelection)}
                  className="btn-secondary"
                >
                  {showCaseSelection ? 'Auswahl schließen' : 'Fälle verwalten'}
                </button>
              </div>

              {showCaseSelection && (
                <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {availableCases.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">
                      Keine verfügbaren Fälle für Zuordnung
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableCases.map((case_) => (
                        <div 
                          key={case_.fall_id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => handleCaseToggle(case_.fall_id)}
                        >
                          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                            formData.assignedFaelle.includes(case_.fall_id)
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-gray-300'
                          }`}>
                            {formData.assignedFaelle.includes(case_.fall_id) && (
                              <CheckIcon className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {case_.aktenzeichen} - {case_.vorname} {case_.nachname}
                            </p>
                            <p className="text-xs text-gray-600">
                              Status: {case_.status} • Erstellt: {new Date(case_.erstellt_am).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {formData.assignedFaelle.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Zugeordnete Fälle:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.assignedFaelle.map(fallId => {
                      const case_ = cases.find(c => c.fall_id === fallId)
                      return case_ ? (
                        <span
                          key={fallId}
                          className="badge badge-purple text-xs flex items-center gap-1"
                        >
                          {case_.aktenzeichen}
                          <button
                            type="button"
                            onClick={() => handleCaseToggle(fallId)}
                            className="hover:bg-purple-700 rounded-full p-0.5"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Link 
              href={`/ansprechpartner/${id}`} 
              className="btn-secondary flex-1 justify-center"
            >
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