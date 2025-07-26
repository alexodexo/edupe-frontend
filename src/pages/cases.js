// src/pages/cases.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import ServiceBooking from '@/components/ServiceBooking'
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
  DUMMY_CASES, 
  DUMMY_SERVICES, 
  DUMMY_HELPERS,
  CASE_STATUS,
  SERVICE_TYPES,
  PRIORITY_LEVELS,
  formatCurrency,
  formatDateTime,
  formatDuration
} from '@/lib/types'

export default function Cases() {
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
    return DUMMY_CASES.filter(case_ => {
      const matchesSearch = 
        case_.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.jugendamt.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedFilters.status === 'all' || case_.status === selectedFilters.status
      const matchesPriority = selectedFilters.priority === 'all' || case_.priority === selectedFilters.priority
      const matchesJugendamt = selectedFilters.jugendamt === 'all' || case_.jugendamt.id === selectedFilters.jugendamt

      return matchesSearch && matchesStatus && matchesPriority && matchesJugendamt
    })
  }, [searchTerm, selectedFilters])

  // Get services for selected case
  const caseServices = useMemo(() => {
    if (!selectedCase) return []
    return DUMMY_SERVICES.filter(service => service.caseId === selectedCase.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [selectedCase])

  // Get last service for travel time validation
  const lastService = useMemo(() => {
    if (caseServices.length === 0) return null
    return caseServices[0] // Most recent service
  }, [caseServices])

  // Get assigned helper
  const assignedHelper = useMemo(() => {
    if (!selectedCase) return null
    return DUMMY_HELPERS.find(helper => 
      selectedCase.assignedHelpers.includes(helper.id)
    )
  }, [selectedCase])

  const handleServiceSave = (serviceData) => {
    // In real app: save to database
    console.log('Saving service:', serviceData)
    setShowServiceBooking(false)
    // Update local state or refetch data
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case CASE_STATUS.ACTIVE:
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case CASE_STATUS.PAUSED:
        return <PauseIcon className="w-5 h-5 text-yellow-600" />
      case CASE_STATUS.COMPLETED:
        return <CheckCircleIcon className="w-5 h-5 text-blue-600" />
      default:
        return <XMarkIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case PRIORITY_LEVELS.URGENT:
        return 'bg-red-100 text-red-800'
      case PRIORITY_LEVELS.HIGH:
        return 'bg-orange-100 text-orange-800'
      case PRIORITY_LEVELS.MEDIUM:
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
          <button 
            onClick={() => setShowNewCaseModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5" />
            Neuer Fall
          </button>
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
                <option value={CASE_STATUS.ACTIVE}>Aktiv</option>
                <option value={CASE_STATUS.PAUSED}>Pausiert</option>
                <option value={CASE_STATUS.COMPLETED}>Abgeschlossen</option>
              </select>
              
              <select 
                value={selectedFilters.priority}
                onChange={(e) => setSelectedFilters({...selectedFilters, priority: e.target.value})}
                className="input w-auto min-w-[120px]"
              >
                <option value="all">Alle Prioritäten</option>
                <option value={PRIORITY_LEVELS.URGENT}>Dringend</option>
                <option value={PRIORITY_LEVELS.HIGH}>Hoch</option>
                <option value={PRIORITY_LEVELS.MEDIUM}>Mittel</option>
                <option value={PRIORITY_LEVELS.LOW}>Niedrig</option>
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
            const helper = DUMMY_HELPERS.find(h => case_.assignedHelpers.includes(h.id))
            const progressPercentage = (case_.usedHours / case_.plannedHours) * 100

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
                      <p className="text-sm text-gray-600">{case_.jugendamt.name}</p>
                    </div>
                    <span className={`badge ${getPriorityColor(case_.priority)}`}>
                      {case_.priority}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Fortschritt</span>
                      <span className="font-medium">
                        {case_.usedHours}h / {case_.plannedHours}h
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
                      <span>{helper?.firstName} {helper?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Seit {new Date(case_.startDate).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CurrencyEuroIcon className="w-4 h-4" />
                      <span>{formatCurrency(case_.usedHours * case_.hourlyRate)}</span>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Letzte Aktivität: {formatDateTime(case_.lastActivity)}
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
        <>
          <div className="modal-backdrop" onClick={() => setSelectedCase(null)} />
          <div className="fixed inset-4 lg:inset-8 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedCase.title}</h2>
                  <p className="text-blue-100">{selectedCase.caseNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowServiceBooking(true)}
                    className="btn bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <ClockIcon className="w-5 h-5" />
                    Leistung buchen
                  </button>
                  <button
                    onClick={() => setSelectedCase(null)}
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
                          {getStatusIcon(selectedCase.status)}
                          <span className="font-medium">{selectedCase.status}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Priorität:</span>
                        <span className={`badge ${getPriorityColor(selectedCase.priority)} ml-2`}>
                          {selectedCase.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Jugendamt:</span>
                        <p className="font-medium mt-1">{selectedCase.jugendamt.name}</p>
                        <p className="text-gray-500">{selectedCase.jugendamt.contactPerson}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Zugewiesener Helfer:</span>
                        <p className="font-medium mt-1">
                          {assignedHelper?.firstName} {assignedHelper?.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Stundensatz:</span>
                        <p className="font-medium mt-1">{formatCurrency(selectedCase.hourlyRate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Klient</h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">{selectedCase.client.firstName} {selectedCase.client.lastName}</p>
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{selectedCase.client.address}</span>
                      </div>
                      {selectedCase.client.children?.length > 0 && (
                        <div className="mt-3">
                          <span className="text-gray-600">Kinder:</span>
                          <ul className="mt-1 space-y-1">
                            {selectedCase.client.children.map((child, index) => (
                              <li key={index} className="text-gray-800">
                                {child.name} ({child.age} Jahre) - {child.school}
                              </li>
                            ))}
                          </ul>
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
                              {service.activities && (
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
    </Layout>
  )
}