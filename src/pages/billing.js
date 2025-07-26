// src/pages/billing.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { 
  CurrencyEuroIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BanknotesIcon,
  CalculatorIcon,
  PlusIcon,
  EyeIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import {
  DUMMY_SERVICES,
  DUMMY_CASES,
  DUMMY_HELPERS,
  SERVICE_STATUS,
  SERVICE_TYPES,
  formatCurrency,
  formatDateTime,
  formatDuration
} from '@/lib/types'

// Dummy invoices data
const DUMMY_INVOICES = [
  {
    id: 'inv_001',
    invoiceNumber: 'R-2024-0156',
    period: '2024-03',
    periodLabel: 'März 2024',
    jugendamt: {
      id: 'ja_frankfurt',
      name: 'Jugendamt Frankfurt',
      email: 'abrechnung@jugendamt-frankfurt.de'
    },
    amount: 4567.89,
    totalHours: 156.5,
    servicesCount: 42,
    status: 'paid',
    dueDate: '2024-04-15',
    paidDate: '2024-04-10',
    createdAt: '2024-04-01T10:00:00Z',
    cases: ['case_001'],
    helpers: ['helper_001']
  },
  {
    id: 'inv_002',
    invoiceNumber: 'R-2024-0155',
    period: '2024-03',
    periodLabel: 'März 2024',
    jugendamt: {
      id: 'ja_offenbach',
      name: 'Jugendamt Offenbach',
      email: 'abrechnung@jugendamt-offenbach.de'
    },
    amount: 3234.50,
    totalHours: 112.0,
    servicesCount: 28,
    status: 'pending',
    dueDate: '2024-04-20',
    paidDate: null,
    createdAt: '2024-03-31T15:30:00Z',
    cases: ['case_002'],
    helpers: ['helper_002']
  },
  {
    id: 'inv_003',
    invoiceNumber: 'R-2024-0154',
    period: '2024-02',
    periodLabel: 'Februar 2024',
    jugendamt: {
      id: 'ja_hanau',
      name: 'Jugendamt Hanau',
      email: 'abrechnung@jugendamt-hanau.de'
    },
    amount: 5678.90,
    totalHours: 189.5,
    servicesCount: 56,
    status: 'overdue',
    dueDate: '2024-03-15',
    paidDate: null,
    createdAt: '2024-02-29T12:00:00Z',
    cases: ['case_003'],
    helpers: ['helper_003']
  }
]

export default function Billing() {
  const [activeTab, setActiveTab] = useState('services') // services, invoices
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedServices, setSelectedServices] = useState(new Set())
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    helper: 'all',
    case: 'all'
  })

  // Enhanced services with additional data
  const enhancedServices = useMemo(() => {
    return DUMMY_SERVICES.map(service => {
      const case_ = DUMMY_CASES.find(c => c.id === service.caseId)
      const helper = DUMMY_HELPERS.find(h => h.id === service.helperId)
      
      return {
        ...service,
        case: case_,
        helper: helper,
        isPendingApproval: service.status === SERVICE_STATUS.SUBMITTED,
        isApproved: service.status === SERVICE_STATUS.APPROVED,
        isRejected: service.status === SERVICE_STATUS.REJECTED
      }
    })
  }, [])

  // Filter services for approval
  const pendingServices = useMemo(() => {
    return enhancedServices.filter(service => {
      const matchesSearch = 
        service.case?.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.helper?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.helper?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedFilters.status === 'all' || service.status === selectedFilters.status
      const matchesHelper = selectedFilters.helper === 'all' || service.helperId === selectedFilters.helper
      const matchesCase = selectedFilters.case === 'all' || service.caseId === selectedFilters.case

      return matchesSearch && matchesStatus && matchesHelper && matchesCase
    })
  }, [enhancedServices, searchTerm, selectedFilters])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = DUMMY_INVOICES.reduce((sum, inv) => sum + inv.amount, 0)
    const paidInvoices = DUMMY_INVOICES.filter(inv => inv.status === 'paid')
    const pendingAmount = DUMMY_INVOICES.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.amount, 0)
    const pendingApprovals = pendingServices.filter(s => s.status === SERVICE_STATUS.SUBMITTED).length

    return {
      totalRevenue,
      paidInvoices: paidInvoices.length,
      pendingAmount,
      pendingApprovals
    }
  }, [pendingServices])

  const handleServiceToggle = (serviceId) => {
    const newSelected = new Set(selectedServices)
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId)
    } else {
      newSelected.add(serviceId)
    }
    setSelectedServices(newSelected)
  }

  const handleApproveService = (serviceId) => {
    // In real app: API call to approve service
    console.log('Approving service:', serviceId)
  }

  const handleRejectService = (serviceId) => {
    // In real app: API call to reject service
    console.log('Rejecting service:', serviceId)
  }

  const handleBulkApprove = () => {
    if (selectedServices.size === 0) return
    // In real app: API call to bulk approve services
    console.log('Bulk approving services:', Array.from(selectedServices))
    setSelectedServices(new Set())
  }

  const handleBulkReject = () => {
    if (selectedServices.size === 0) return
    // In real app: API call to bulk reject services
    console.log('Bulk rejecting services:', Array.from(selectedServices))
    setSelectedServices(new Set())
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getServiceStatusColor = (status) => {
    switch (status) {
      case SERVICE_STATUS.APPROVED:
        return 'bg-green-100 text-green-800'
      case SERVICE_STATUS.SUBMITTED:
        return 'bg-yellow-100 text-yellow-800'
      case SERVICE_STATUS.REJECTED:
        return 'bg-red-100 text-red-800'
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
        <title>Abrechnungen - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Abrechnungen</h1>
            <p className="text-gray-600 mt-1">Stundenfreigabe und Rechnungsverwaltung</p>
          </div>
          <button 
            onClick={() => setShowInvoiceModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5" />
            Rechnung erstellen
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <CurrencyEuroIcon className="w-8 h-8 text-green-600" />
              <span className="text-sm text-gray-500">Gesamt</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-gray-600 mt-1">Gesamtumsatz</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Bezahlt</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.paidInvoices}</p>
            <p className="text-sm text-gray-600 mt-1">Bezahlte Rechnungen</p>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
              <span className="text-sm text-gray-500">Offen</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
            <p className="text-sm text-gray-600 mt-1">Offene Beträge</p>
          </div>
          
          <div className="card p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
              {stats.pendingApprovals > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full">
                  {stats.pendingApprovals}
                </span>
              )}
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.pendingApprovals}</p>
            <p className="text-sm text-gray-600 mt-1">Zur Freigabe</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stundenfreigabe
              {stats.pendingApprovals > 0 && (
                <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">
                  {stats.pendingApprovals}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rechnungen
            </button>
          </nav>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Services suchen..."
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
                    <option value={SERVICE_STATUS.SUBMITTED}>Zur Freigabe</option>
                    <option value={SERVICE_STATUS.APPROVED}>Freigegeben</option>
                    <option value={SERVICE_STATUS.REJECTED}>Abgelehnt</option>
                  </select>
                  
                  <select 
                    value={selectedFilters.helper}
                    onChange={(e) => setSelectedFilters({...selectedFilters, helper: e.target.value})}
                    className="input w-auto min-w-[150px]"
                  >
                    <option value="all">Alle Helfer</option>
                    {DUMMY_HELPERS.map(helper => (
                      <option key={helper.id} value={helper.id}>
                        {helper.firstName} {helper.lastName}
                      </option>
                    ))}
                  </select>

                  <button className="btn-secondary">
                    <FunnelIcon className="w-5 h-5" />
                    Weitere Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedServices.size > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-blue-900 font-medium">
                    {selectedServices.size} Service(s) ausgewählt
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleBulkReject}
                      className="btn bg-red-600 text-white hover:bg-red-700"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Alle ablehnen
                    </button>
                    <button 
                      onClick={handleBulkApprove}
                      className="btn-primary"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Alle freigeben
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Services List */}
            <div className="space-y-4">
              {pendingServices.map((service) => (
                <div key={service.id} className="card">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedServices.has(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="mt-1 rounded"
                      />

                      {/* Service Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              {getServiceTypeIcon(service.type)}
                              <h3 className="font-semibold text-gray-900">
                                {service.helper?.firstName} {service.helper?.lastName}
                              </h3>
                              <span className={`badge ${getServiceStatusColor(service.status)}`}>
                                {service.status === SERVICE_STATUS.SUBMITTED ? 'Zur Freigabe' :
                                 service.status === SERVICE_STATUS.APPROVED ? 'Freigegeben' :
                                 service.status === SERVICE_STATUS.REJECTED ? 'Abgelehnt' : service.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Fall {service.case?.caseNumber} • {service.case?.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {service.case?.jugendamt.name}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatDuration(service.duration)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(service.costs)}
                            </p>
                          </div>
                        </div>

                        {/* Service Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-600">Datum:</span>
                            <p className="font-medium">{new Date(service.date).toLocaleDateString('de-DE')}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Zeit:</span>
                            <p className="font-medium">{service.startTime} - {service.endTime}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Typ:</span>
                            <p className="font-medium">
                              {service.type === SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE ? 'Face-to-Face' :
                               service.type === SERVICE_TYPES.WITH_CLIENT_REMOTE ? 'Remote' :
                               'Ohne Klient'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Ort:</span>
                            <p className="font-medium truncate">{service.location}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700">{service.description}</p>
                        </div>

                        {/* Activities */}
                        {service.activities && service.activities.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 text-sm mb-2">Durchgeführte Aktivitäten:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                              {service.activities.map((activity, index) => (
                                <li key={index}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Travel Time Warning */}
                        {service.travelTime && (
                          <div className="flex items-center gap-2 text-sm text-orange-600 mb-4">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>Fahrtzeit: {service.travelTime} Minuten berücksichtigt</span>
                          </div>
                        )}

                        {/* Actions */}
                        {service.status === SERVICE_STATUS.SUBMITTED && (
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleRejectService(service.id)}
                              className="btn bg-red-600 text-white hover:bg-red-700"
                            >
                              <XCircleIcon className="w-4 h-4" />
                              Ablehnen
                            </button>
                            <button 
                              onClick={() => handleApproveService(service.id)}
                              className="btn-primary"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              Freigeben
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {pendingServices.length === 0 && (
              <div className="text-center py-12">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Services gefunden</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Alle Services sind bearbeitet'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechnungen suchen..."
                className="input pl-10"
              />
            </div>

            {/* Invoices Table */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rechnungsnummer</th>
                    <th>Periode</th>
                    <th>Jugendamt</th>
                    <th>Betrag</th>
                    <th>Status</th>
                    <th>Fällig am</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {DUMMY_INVOICES.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-medium">{invoice.invoiceNumber}</td>
                      <td>{invoice.periodLabel}</td>
                      <td>
                        <div>
                          <p className="font-medium">{invoice.jugendamt.name}</p>
                          <p className="text-sm text-gray-500">{invoice.servicesCount} Services • {invoice.totalHours}h</p>
                        </div>
                      </td>
                      <td className="font-medium">{formatCurrency(invoice.amount)}</td>
                      <td>
                        <span className={`badge ${getStatusColor(invoice.status)}`}>
                          {invoice.status === 'paid' ? 'Bezahlt' :
                           invoice.status === 'pending' ? 'Offen' :
                           invoice.status === 'overdue' ? 'Überfällig' : invoice.status}
                        </span>
                      </td>
                      <td>{new Date(invoice.dueDate).toLocaleDateString('de-DE')}</td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedInvoice(invoice)}
                            className="btn-ghost p-2"
                            title="Ansehen"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button className="btn-ghost p-2" title="Download">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <>
          <div className="modal-backdrop" onClick={() => setSelectedInvoice(null)} />
          <div className="fixed inset-4 lg:inset-8 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
            <InvoiceDetail 
              invoice={selectedInvoice} 
              onClose={() => setSelectedInvoice(null)} 
            />
          </div>
        </>
      )}

      {/* Create Invoice Modal Placeholder */}
      {showInvoiceModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowInvoiceModal(false)} />
          <div className="modal-content max-w-2xl animate-slide-up">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Rechnung erstellen</h2>
              <p className="text-gray-600">Diese Funktionalität wird in der finalen Version implementiert.</p>
              <button
                onClick={() => setShowInvoiceModal(false)}
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

// Invoice Detail Component
function InvoiceDetail({ invoice, onClose }) {
  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Rechnung {invoice.invoiceNumber}</h2>
            <p className="text-blue-100">{invoice.periodLabel} • {invoice.jugendamt.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn bg-white/10 hover:bg-white/20 text-white border-white/20">
              <ArrowDownTrayIcon className="w-5 h-5" />
              PDF Download
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Invoice Header */}
          <div className="text-center pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Rechnung</h1>
            <p className="text-gray-600">
              Rechnungsnummer: {invoice.invoiceNumber} • Periode: {invoice.periodLabel}
            </p>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Rechnungsempfänger</h3>
              <div className="space-y-2">
                <p className="font-medium">{invoice.jugendamt.name}</p>
                <p className="text-sm text-gray-600">{invoice.jugendamt.email}</p>
              </div>
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Rechnungsdetails</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Betrag:</dt>
                  <dd className="font-medium">{formatCurrency(invoice.amount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Gesamtstunden:</dt>
                  <dd className="font-medium">{invoice.totalHours}h</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Services:</dt>
                  <dd className="font-medium">{invoice.servicesCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Fällig am:</dt>
                  <dd className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('de-DE')}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Services Summary */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Leistungsübersicht</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Datum</th>
                    <th className="text-left p-3">Helfer</th>
                    <th className="text-left p-3">Fall</th>
                    <th className="text-right p-3">Stunden</th>
                    <th className="text-right p-3">Betrag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Mock service entries */}
                  <tr>
                    <td className="p-3">01.03.2024</td>
                    <td className="p-3">Anna Schmidt</td>
                    <td className="p-3">F-2024-001</td>
                    <td className="p-3 text-right">3.5h</td>
                    <td className="p-3 text-right">{formatCurrency(89.25)}</td>
                  </tr>
                  <tr>
                    <td className="p-3">03.03.2024</td>
                    <td className="p-3">Anna Schmidt</td>
                    <td className="p-3">F-2024-001</td>
                    <td className="p-3 text-right">2.0h</td>
                    <td className="p-3 text-right">{formatCurrency(51.00)}</td>
                  </tr>
                  {/* More entries would be rendered here */}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td colSpan="3" className="p-3">Gesamt</td>
                    <td className="p-3 text-right">{invoice.totalHours}h</td>
                    <td className="p-3 text-right">{formatCurrency(invoice.amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}