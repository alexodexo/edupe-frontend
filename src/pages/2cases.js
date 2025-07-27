// src/pages/cases.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import ServiceBooking from '@/components/ServiceBooking'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useCases, useHelpers, useServices, useCreateCase, useCreateService } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  MapPinIcon,
  FunnelIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PauseIcon,
  PlayIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { 
  CASE_STATUS,
  SERVICE_TYPES,
  PRIORITY_LEVELS,
  formatCurrency,
  formatDateTime,
  formatDuration
} from '@/lib/types'

export default function Cases() {
  const { userRole, userProfile, hasPermission } = useAuth()
  const { cases, isLoading: casesLoading, error: casesError, refresh: refreshCases } = useCases()
  const { helpers, isLoading: helpersLoading } = useHelpers()
  const { services } = useServices()
  const createCase = useCreateCase()
  const createService = useCreateService()
  const { success, error: showError } = useNotifications()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCase, setSelectedCase] = useState(null)
  const [showServiceBooking, setShowServiceBooking] = useState(false)
  const [showNewCaseModal, setShowNewCaseModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    priority: 'all',
    jugendamt: 'all'
  })

  // Filter cases based on search and filters
  const filteredCases = useMemo(() => {
    if (!cases) return []
    
    return cases.filter(case_ => {
      const matchesSearch = 
        case_.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (case_.jugendamt && case_.jugendamt.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = selectedFilters.status === 'all' || case_.status === selectedFilters.status
      const matchesPriority = selectedFilters.priority === 'all' || case_.priority === selectedFilters.priority

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [cases, searchTerm, selectedFilters])

  // Get services for selected case
  const caseServices = useMemo(() => {
    if (!selectedCase || !services) return []
    return services.filter(service => service.caseId === selectedCase.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [selectedCase, services])

  // Get last service for travel time validation
  const lastService = useMemo(() => {
    if (caseServices.length === 0) return null
    return caseServices[0] // Most recent service
  }, [caseServices])

  // Get assigned helper
  const assignedHelper = useMemo(() => {
    if (!selectedCase || !helpers) return null
    return helpers.find(helper => 
      selectedCase.assignedHelpers && selectedCase.assignedHelpers.includes(helper.id)
    )
  }, [selectedCase, helpers])

  const handleServiceSave = async (serviceData) => {
    try {
      await createService(serviceData)
      success('Leistung wurde erfolgreich gebucht')
      setShowServiceBooking(false)
      refreshCases()
    } catch (error) {
      showError('Fehler beim Buchen der Leistung')
    }
  }

  const handleCreateCase = async (caseData) => {
    try {
      await createCase(caseData)
      success('Fall wurde erfolgreich erstellt')
      setShowNewCaseModal(false)
      refreshCases()
    } catch (error) {
      showError('Fehler beim Erstellen des Falls')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case CASE_STATUS.IN_BEARBEITUNG:
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case CASE_STATUS.WARTEND:
        return <PauseIcon className="w-5 h-5 text-yellow-600" />
      case CASE_STATUS.ABGESCHLOSSEN:
        return <CheckCircleIcon className="w-5 h-5 text-blue-600" />
      case CASE_STATUS.OFFEN:
        return <ClockIcon className="w-5 h-5 text-orange-600" />
      default:
        return <XMarkIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getServiceTypeIcon = (type) => {
    switch (type) {
      case SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE:
        return <UserIcon className="w-4 h-4" />
      case SERVICE_TYPES.WITH_CLIENT_REMOTE:
        return <UserIcon className="w-4 h-4" />
      default:
        return <BuildingOfficeIcon className="w-4 h-4" />
    }
  }

  // Check permissions
  if (!hasPermission('view_cases')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Fälle zu verwalten.</p>
        </div>
      </Layout>
    )
  }

  if (casesLoading || helpersLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Fälle..." />
      </Layout>
    )
  }

  if (casesError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Fehler beim Laden</h3>
          <p className="text-red-600 mb-4">{casesError.message}</p>
          <button onClick={refreshCases} className="btn-primary">
            Erneut versuchen
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Fälle - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Fälle</h1>
            <p className="text-gray-600 mt-1">Verwaltung aller Betreuungsfälle</p>
          </div>
          {hasPermission('create_cases') && (
            <button 
              onClick={() => setShowNewCaseModal(true)}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5" />
              Neuer Fall
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Fall suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select 
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
                className="input w-auto min-w-[120px]"
              >
                <option value="all">Alle Status</option>
                <option value={CASE_STATUS.OFFEN}>Offen</option>
                <option value={CASE_STATUS.IN_BEARBEITUNG}>In Bearbeitung</option>
                <option value={CASE_STATUS.WARTEND}>Wartend</option>
                <option value={CASE_STATUS.ABGESCHLOSSEN}>Abgeschlossen</option>
              </select>
              
              <select 
                value={selectedFilters.priority}
                onChange={(e) => setSelectedFilters({...selectedFilters, priority: e.target.value})}
                className="input w-auto min-w-[120px]"
              >
                <option value="all">Alle Prioritäten</option>
                <option value="urgent">Dringend</option>
                <option value="high">Hoch</option>
                <option value="medium">Mittel</option>
                <option value="low">Niedrig</option>
              </select>

              <button className="btn-secondary">
                <FunnelIcon className="w-5 h-5" />
                Weitere Filter
              </button>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredCases.map((case_) => {
            const helper = helpers?.find(h => case_.assignedHelpers?.includes(h.id))
            const progressPercentage = case_.plannedHours > 0 ? (case_.usedHours / case_.plannedHours) * 100 : 0

            return (
              <div 
                key={case_.id} 
                className="card card-hover cursor-pointer"
                onClick={() => setSelectedCase(case_)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(case_.status)}
                        <span className="text-sm font-medium text-gray-600">
                          {case_.caseNumber}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{case_.title}</h3>
                      <p className="text-sm text-gray-600">{case_.client?.school}</p>
                    </div>
                    {case_.priority && (
                      <span className={`badge ${getPriorityColor(case_.priority)}`}>
                        {case_.priority}
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Fortschritt</span>
                      <span className="font-medium">
                        {case_.usedHours || 0}h / {case_.plannedHours || 0}h
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserIcon className="w-4 h-4" />
                      <span>{helper?.firstName} {helper?.lastName || 'Kein Helfer zugewiesen'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Seit {new Date(case_.createdAt).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CurrencyEuroIcon className="w-4 h-4" />
                      <span>{formatCurrency(case_.totalCosts || 0)}</span>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Letzte Aktivität: {formatDateTime(case_.lastActivity || case_.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Fälle gefunden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Erstellen Sie Ihren ersten Fall'}
            </p>
          </div>
        )}
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal 
          case_={selectedCase}
          caseServices={caseServices}
          assignedHelper={assignedHelper}
          onClose={() => setSelectedCase(null)}
          onShowServiceBooking={() => setShowServiceBooking(true)}
        />
      )}

      {/* Service Booking Modal */}
      {showServiceBooking && selectedCase && assignedHelper && (
        <>
          <div className="modal-backdrop" onClick={() => setShowServiceBooking(false)} />
          <div className="fixed inset-4 lg:inset-8 z-60 overflow-auto">
            <ServiceBooking
              caseData={selectedCase}
              helper={assignedHelper}
              lastService={lastService}
              onSave={handleServiceSave}
              onCancel={() => setShowServiceBooking(false)}
            />
          </div>
        </>
      )}

      {/* New Case Modal */}
      {showNewCaseModal && (
        <NewCaseModal 
          onClose={() => setShowNewCaseModal(false)}
          onSave={handleCreateCase}
        />
      )}
    </Layout>
  )
}
// Case Detail Modal Component
function CaseDetailModal({ case_, caseServices, assignedHelper, onClose, onShowServiceBooking }) {
  const getServiceTypeIcon = (type) => {
    switch (type) {
      case SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE:
        return <UserIcon className="w-4 h-4" />
      case SERVICE_TYPES.WITH_CLIENT_REMOTE:
        return <UserIcon className="w-4 h-4" />
      default:
        return <BuildingOfficeIcon className="w-4 h-4" />
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="fixed inset-4 lg:inset-8 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{case_.title}</h2>
              <p className="text-blue-100">{case_.caseNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              {assignedHelper && (
                <button
                  onClick={onShowServiceBooking}
                  className="btn bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <ClockIcon className="w-5 h-5" />
                  Leistung buchen
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Case Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Fall-Informationen</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">{case_.status}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Schule/Kita:</span>
                    <p className="font-medium mt-1">{case_.client?.school}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Zugewiesener Helfer:</span>
                    <p className="font-medium mt-1">
                      {assignedHelper ? `${assignedHelper.firstName} ${assignedHelper.lastName}` : 'Kein Helfer zugewiesen'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Stundensatz:</span>
                    <p className="font-medium mt-1">{formatCurrency(25.50)}</p>
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Klient</h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{case_.client?.firstName} {case_.client?.lastName}</p>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{case_.client?.address}</span>
                  </div>
                  {case_.client?.birthDate && (
                    <div className="text-gray-600">
                      <span>Geburtsdatum: {new Date(case_.client.birthDate).toLocaleDateString('de-DE')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Geleistete Services</h3>
                </div>
                <div className="max-h-96 overflow-auto">
                  {caseServices.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {caseServices.map((service) => (
                        <div key={service.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getServiceTypeIcon(service.type)}
                              <span className="font-medium text-gray-900">
                                {new Date(service.date).toLocaleDateString('de-DE')}
                              </span>
                              <span className="text-gray-500">
                                {service.startTime} - {service.endTime}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {formatDuration(service.duration)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(service.costs)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{service.description}</p>
                          {service.activities && service.activities.length > 0 && (
                            <div className="text-xs text-gray-600">
                              <strong>Aktivitäten:</strong>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {service.activities.map((activity, index) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Noch keine Services gebucht</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// New Case Modal Component
function NewCaseModal({ onClose, onSave }) {
  const { helpers } = useHelpers()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    street: '',
    zipCode: '',
    city: '',
    school: '',
    firstContactText: '',
    helperId: ''
  })
  
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const caseData = {
        vorname: formData.firstName,
        nachname: formData.lastName,
        geburtsdatum: formData.birthDate || null,
        strasse: formData.street,
        plz: formData.zipCode,
        stadt: formData.city,
        schule_oder_kita: formData.school,
        erstkontakt_text: formData.firstContactText,
        helfer_id: formData.helperId || null
      }
      
      await onSave(caseData)
    } catch (error) {
      console.error('Error creating case:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="fixed inset-4 lg:inset-8 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-w-2xl mx-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Neuen Fall erstellen</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Klient-Informationen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nachname *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geburtsdatum
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  className="input"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Adresse</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Straße
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stadt
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* School/Kita */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schule/Kita
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({...formData, school: e.target.value})}
                className="input"
              />
            </div>

            {/* Helper Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Helfer zuweisen (optional)
              </label>
              <select
                value={formData.helperId}
                onChange={(e) => setFormData({...formData, helperId: e.target.value})}
                className="input"
              >
                <option value="">Kein Helfer zuweisen</option>
                {helpers?.map(helper => (
                  <option key={helper.id} value={helper.id}>
                    {helper.firstName} {helper.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* First Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Erstkontakt-Notizen
              </label>
              <textarea
                value={formData.firstContactText}
                onChange={(e) => setFormData({...formData, firstContactText: e.target.value})}
                className="input"
                rows="4"
                placeholder="Notizen zum ersten Kontakt..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Abbrechen
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Erstellen...' : 'Fall erstellen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
