// src/pages/helpers.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
  BanknotesIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  IdentificationIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { 
  DUMMY_HELPERS,
  DUMMY_CASES,
  DUMMY_SERVICES,
  HELPER_AVAILABILITY,
  QUALIFICATION_TYPES,
  formatCurrency,
  formatDateTime
} from '@/lib/types'

export default function Helpers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHelper, setSelectedHelper] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    availability: 'all',
    qualification: 'all',
    location: 'all'
  })

  // Enhanced helpers data with calculated stats
  const enhancedHelpers = useMemo(() => {
    return DUMMY_HELPERS.map(helper => {
      const helperCases = DUMMY_CASES.filter(case_ => 
        case_.assignedHelpers.includes(helper.id)
      )
      const helperServices = DUMMY_SERVICES.filter(service => 
        service.helperId === helper.id
      )
      
      // Calculate this month's stats
      const thisMonth = new Date()
      const thisMonthServices = helperServices.filter(service => {
        const serviceDate = new Date(service.date)
        return serviceDate.getMonth() === thisMonth.getMonth() &&
               serviceDate.getFullYear() === thisMonth.getFullYear()
      })
      
      const thisMonthHours = thisMonthServices.reduce((sum, service) => sum + service.duration, 0)
      const thisMonthRevenue = thisMonthHours * helper.hourlyRate
      
      // Last activity
      const lastActivity = helperServices.length > 0 
        ? Math.max(...helperServices.map(s => new Date(s.createdAt).getTime()))
        : new Date(helper.updatedAt).getTime()
      
      // Document compliance
      const expiredDocs = helper.documents.filter(doc => 
        new Date(doc.validUntil) < new Date()
      ).length
      
      const expiringSoonDocs = helper.documents.filter(doc => {
        const validUntil = new Date(doc.validUntil)
        const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        return validUntil > new Date() && validUntil <= in30Days
      }).length

      return {
        ...helper,
        activeCases: helperCases.filter(c => c.status === 'active').length,
        thisMonthHours: Math.round(thisMonthHours * 10) / 10,
        thisMonthRevenue,
        lastActivity: new Date(lastActivity),
        complianceStatus: expiredDocs > 0 ? 'expired' : expiringSoonDocs > 0 ? 'expiring' : 'valid'
      }
    })
  }, [])

  // Filter helpers
  const filteredHelpers = useMemo(() => {
    return enhancedHelpers.filter(helper => {
      const matchesSearch = 
        helper.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        helper.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        helper.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        helper.address.city.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesAvailability = selectedFilters.availability === 'all' || 
        helper.availability === selectedFilters.availability
        
      const matchesQualification = selectedFilters.qualification === 'all' ||
        helper.qualifications.includes(selectedFilters.qualification)

      return matchesSearch && matchesAvailability && matchesQualification
    })
  }, [enhancedHelpers, searchTerm, selectedFilters])

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case HELPER_AVAILABILITY.AVAILABLE:
        return 'bg-green-100 text-green-800'
      case HELPER_AVAILABILITY.PARTIALLY_AVAILABLE:
        return 'bg-yellow-100 text-yellow-800'
      case HELPER_AVAILABILITY.UNAVAILABLE:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplianceIcon = (status) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'expiring':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
      case 'expired':
        return <XMarkIcon className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  return (
    <Layout>
      <Head>
        <title>Helfer - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Helfer</h1>
            <p className="text-gray-600 mt-1">Verwalten Sie Ihre Helfer und deren Verfügbarkeit</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5" />
            Neuer Helfer
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Helfer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedFilters.availability}
                onChange={(e) => setSelectedFilters({...selectedFilters, availability: e.target.value})}
                className="input w-auto min-w-[150px]"
              >
                <option value="all">Alle Verfügbarkeiten</option>
                <option value={HELPER_AVAILABILITY.AVAILABLE}>Verfügbar</option>
                <option value={HELPER_AVAILABILITY.PARTIALLY_AVAILABLE}>Teilweise verfügbar</option>
                <option value={HELPER_AVAILABILITY.UNAVAILABLE}>Nicht verfügbar</option>
              </select>

              <select
                value={selectedFilters.qualification}
                onChange={(e) => setSelectedFilters({...selectedFilters, qualification: e.target.value})}
                className="input w-auto min-w-[150px]"
              >
                <option value="all">Alle Qualifikationen</option>
                {QUALIFICATION_TYPES.map(qual => (
                  <option key={qual} value={qual}>{qual}</option>
                ))}
              </select>

              <button className="btn-secondary">
                <FunnelIcon className="w-5 h-5" />
                Weitere Filter
              </button>
            </div>
          </div>
        </div>

        {/* Helpers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHelpers.map((helper) => (
            <div 
              key={helper.id} 
              className="card card-hover cursor-pointer relative"
              onClick={() => setSelectedHelper(helper)}
            >
              {/* Compliance indicator */}
              <div className="absolute top-4 right-4">
                {getComplianceIcon(helper.complianceStatus)}
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                    <span className="text-xl font-semibold text-blue-600">
                      {helper.firstName[0]}{helper.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {helper.firstName} {helper.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{helper.rating}</span>
                      <span className="text-xs text-gray-500">({helper.totalCases} Fälle)</span>
                    </div>
                    <span className={`badge ${getAvailabilityColor(helper.availability)} text-xs`}>
                      {helper.availability === HELPER_AVAILABILITY.AVAILABLE ? 'Verfügbar' :
                       helper.availability === HELPER_AVAILABILITY.PARTIALLY_AVAILABLE ? 'Teilweise verfügbar' :
                       'Nicht verfügbar'}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{helper.address.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{helper.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{helper.phone}</span>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {helper.qualifications.slice(0, 2).map((skill, index) => (
                      <span key={index} className="badge badge-blue text-xs">
                        {skill}
                      </span>
                    ))}
                    {helper.qualifications.length > 2 && (
                      <span className="badge badge-gray text-xs">
                        +{helper.qualifications.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{helper.activeCases}</p>
                    <p className="text-xs text-gray-600">Aktive Fälle</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{helper.thisMonthHours}h</p>
                    <p className="text-xs text-gray-600">Diesen Monat</p>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    Letzte Aktivität: {helper.lastActivity.toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredHelpers.length === 0 && (
          <div className="text-center py-12">
            <UserCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Helfer gefunden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Fügen Sie Ihren ersten Helfer hinzu'}
            </p>
          </div>
        )}
      </div>

      {/* Helper Detail Modal */}
      {selectedHelper && (
        <>
          <div className="modal-backdrop" onClick={() => setSelectedHelper(null)} />
          <div className="fixed inset-4 lg:inset-8 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {selectedHelper.firstName[0]}{selectedHelper.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {selectedHelper.firstName} {selectedHelper.lastName}
                    </h2>
                    <p className="text-blue-100">{selectedHelper.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHelper(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Personal Info */}
                <div className="space-y-6">
                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Persönliche Informationen</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">Bewertung:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="font-medium">{selectedHelper.rating}</span>
                          <span className="text-gray-500">({selectedHelper.totalCases} Fälle)</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Verfügbarkeit:</span>
                        <span className={`badge ${getAvailabilityColor(selectedHelper.availability)} ml-2`}>
                          {selectedHelper.availability}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Stundensatz:</span>
                        <p className="font-medium mt-1">{formatCurrency(selectedHelper.hourlyRate)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Mitglied seit:</span>
                        <p className="font-medium mt-1">
                          {new Date(selectedHelper.createdAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Kontaktdaten</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">E-Mail:</span>
                        <p className="font-medium mt-1">{selectedHelper.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Telefon:</span>
                        <p className="font-medium mt-1">{selectedHelper.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Adresse:</span>
                        <p className="font-medium mt-1">
                          {selectedHelper.address.street}<br />
                          {selectedHelper.address.zipCode} {selectedHelper.address.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Bankdaten</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">IBAN:</span>
                        <p className="font-mono text-xs mt-1">{selectedHelper.bankDetails.iban}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">BIC:</span>
                        <p className="font-mono text-xs mt-1">{selectedHelper.bankDetails.bic}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualifications & Documents */}
                <div className="space-y-6">
                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Qualifikationen</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHelper.qualifications.map((qualification, index) => (
                        <span key={index} className="badge badge-blue">
                          {qualification}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Dokumente</h3>
                      {getComplianceIcon(selectedHelper.complianceStatus)}
                    </div>
                    <div className="space-y-3">
                      {selectedHelper.documents.map((doc, index) => {
                        const isExpired = new Date(doc.validUntil) < new Date()
                        const isExpiringSoon = new Date(doc.validUntil) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        
                        return (
                          <div key={index} className={`p-3 rounded-lg border ${
                            isExpired ? 'border-red-200 bg-red-50' :
                            isExpiringSoon ? 'border-yellow-200 bg-yellow-50' :
                            'border-green-200 bg-green-50'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{doc.type}</p>
                                <p className="text-xs text-gray-600">
                                  Gültig bis: {new Date(doc.validUntil).toLocaleDateString('de-DE')}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {doc.verified && <ShieldCheckIcon className="w-4 h-4 text-green-600" />}
                                <DocumentCheckIcon className={`w-4 h-4 ${
                                  isExpired ? 'text-red-600' :
                                  isExpiringSoon ? 'text-yellow-600' :
                                  'text-green-600'
                                }`} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-6">
                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Statistiken</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-semibold text-blue-600">{selectedHelper.activeCases}</p>
                        <p className="text-xs text-blue-600">Aktive Fälle</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-semibold text-green-600">{selectedHelper.totalHours}</p>
                        <p className="text-xs text-green-600">Stunden gesamt</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-semibold text-yellow-600">{selectedHelper.thisMonthHours}</p>
                        <p className="text-xs text-yellow-600">Stunden/Monat</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-lg font-semibold text-purple-600">
                          {formatCurrency(selectedHelper.thisMonthRevenue)}
                        </p>
                        <p className="text-xs text-purple-600">Umsatz/Monat</p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Aktionen</h3>
                    <div className="space-y-3">
                      <button className="btn-primary w-full">
                        <ClockIcon className="w-5 h-5" />
                        Fall zuweisen
                      </button>
                      <button className="btn-secondary w-full">
                        <CalendarIcon className="w-5 h-5" />
                        Verfügbarkeit ändern
                      </button>
                      <button className="btn-secondary w-full">
                        <CurrencyEuroIcon className="w-5 h-5" />
                        Stundensatz anpassen
                      </button>
                      <button className="btn-secondary w-full">
                        <IdentificationIcon className="w-5 h-5" />
                        Profil bearbeiten
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Helper Modal Placeholder */}
      {showAddModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)} />
          <div className="modal-content max-w-2xl animate-slide-up">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Neuen Helfer hinzufügen</h2>
              <p className="text-gray-600">Diese Funktionalität wird in der finalen Version implementiert.</p>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-primary mt-4"
              >
                Schließen
              </button>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}