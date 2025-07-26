// src/pages/billing.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useServices } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
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
  PencilIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import {
  SERVICE_STATUS,
  SERVICE_TYPES,
  formatCurrency,
  formatDateTime,
  formatDuration
} from '@/lib/types'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Billing() {
  const { userRole, userProfile, hasPermission } = useAuth()
  const { success, error: showError } = useNotifications()
  
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

  // Fetch services with real API
  const { data: services, error: servicesError, mutate: refreshServices } = useSWR(
    userProfile ? `/api/services?userId=${userProfile.helfer_id || userProfile.ansprechpartner_id}&userRole=${userRole}` : null,
    fetcher
  )

  // Fetch invoices with real API
  const { data: invoices, error: invoicesError, mutate: refreshInvoices } = useSWR(
    userProfile ? `/api/billing?userId=${userProfile.helfer_id || userProfile.ansprechpartner_id}&userRole=${userRole}` : null,
    fetcher
  )

  // Filter services for approval
  const pendingServices = useMemo(() => {
    if (!services) return []
    
    return services.filter(service => {
      const matchesSearch = 
        service.case?.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.helper?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.helper?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedFilters.status === 'all' || service.status === selectedFilters.status
      const matchesHelper = selectedFilters.helper === 'all' || service.helperId === selectedFilters.helper
      const matchesCase = selectedFilters.case === 'all' || service.caseId === selectedFilters.case

      return matchesSearch && matchesStatus && matchesHelper && matchesCase
    })
  }, [services, searchTerm, selectedFilters])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!invoices) return {
      totalRevenue: 0,
      paidInvoices: 0,
      pendingAmount: 0,
      pendingApprovals: 0
    }

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const paidInvoices = invoices.filter(inv => inv.status === 'paid')
    const pendingAmount = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const pendingApprovals = pendingServices?.filter(s => s.status === 'submitted').length || 0

    return {
      totalRevenue,
      paidInvoices: paidInvoices.length,
      pendingAmount,
      pendingApprovals
    }
  }, [invoices, pendingServices])

  const handleServiceToggle = (serviceId) => {
    const newSelected = new Set(selectedServices)
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId)
    } else {
      newSelected.add(serviceId)
    }
    setSelectedServices(newSelected)
  }

  const handleApproveService = async (serviceId) => {
    try {
      const response = await fetch(`/api/services/${serviceId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved: true,
          freigegeben_von: userProfile.helfer_id || userProfile.ansprechpartner_id
        })
      })

      if (!response.ok) throw new Error('Fehler beim Freigeben')

      success('Service wurde freigegeben')
      refreshServices()
    } catch (error) {
      showError('Fehler beim Freigeben des Services')
    }
  }

  const handleRejectService = async (serviceId) => {
    const reason = prompt('Grund für Ablehnung (optional):')
    
    try {
      const response = await fetch(`/api/services/${serviceId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved: false,
          freigegeben_von: userProfile.helfer_id || userProfile.ansprechpartner_id,
          reason
        })
      })

      if (!response.ok) throw new Error('Fehler beim Ablehnen')

      success('Service wurde abgelehnt')
      refreshServices()
    } catch (error) {
      showError('Fehler beim Ablehnen des Services')
    }
  }

  const handleBulkApprove = async () => {
    if (selectedServices.size === 0) return
    
    try {
      const response = await fetch('/api/services/bulk-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceIds: Array.from(selectedServices),
          freigegeben_von: userProfile.helfer_id || userProfile.ansprechpartner_id,
          approved: true
        })
      })

      if (!response.ok) throw new Error('Fehler bei Bulk-Freigabe')

      success(`${selectedServices.size} Services wurden freigegeben`)
      setSelectedServices(new Set())
      refreshServices()
    } catch (error) {
      showError('Fehler bei der Bulk-Freigabe')
    }
  }

  const handleBulkReject = async () => {
    if (selectedServices.size === 0) return
    
    const reason = prompt('Grund für Ablehnung (optional):')
    
    try {
      const response = await fetch('/api/services/bulk-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceIds: Array.from(selectedServices),
          freigegeben_von: userProfile.helfer_id || userProfile.ansprechpartner_id,
          approved: false,
          reason
        })
      })

      if (!response.ok) throw new Error('Fehler bei Bulk-Ablehnung')

      success(`${selectedServices.size} Services wurden abgelehnt`)
      setSelectedServices(new Set())
      refreshServices()
    } catch (error) {
      showError('Fehler bei der Bulk-Ablehnung')
    }
  }

  const handleCreateInvoice = async (invoiceData) => {
    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...invoiceData,
          erstellt_von: userProfile.helfer_id || userProfile.ansprechpartner_id
        })
      })

      if (!response.ok) throw new Error('Fehler beim Erstellen der Rechnung')

      success('Rechnung wurde erfolgreich erstellt')
      setShowInvoiceModal(false)
      refreshInvoices()
    } catch (error) {
      showError('Fehler beim Erstellen der Rechnung')
    }
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
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
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

  // Check permissions
  if (!hasPermission('view_billing')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung für Abrechnungen.</p>
        </div>
      </Layout>
    )
  }

  if ((!services && !servicesError) || (!invoices && !invoicesError)) {
    return (
      <Layout>
        <LoadingPage message="Lade Abrechnungsdaten..." />
      </Layout>
    )
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
          {hasPermission('create_invoices') && (
            <button 
              onClick={() => setShowInvoiceModal(true)}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5" />
              Rechnung erstellen
            </button>
          )}
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
            {hasPermission('approve_services') && (
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
            )}
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
        {activeTab === 'services' && hasPermission('approve_services') && (
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
                    <option value="submitted">Zur Freigabe</option>
                    <option value="approved">Freigegeben</option>
                    <option value="rejected">Abgelehnt</option>
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
              {pendingServices && pendingServices.map((service) => (
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
                                {service.status === 'submitted' ? 'Zur Freigabe' :
                                 service.status === 'approved' ? 'Freigegeben' :
                                 service.status === 'rejected' ? 'Abgelehnt' : service.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Fall {service.case?.caseNumber} • {service.case?.title}
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

                        {/* Actions */}
                        {service.status === 'submitted' && (
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
            {(!pendingServices || pendingServices.length === 0) && (
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
                  {invoices && invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-medium">{invoice.invoiceNumber}</td>
                      <td>{invoice.periodLabel || 'N/A'}</td>
                      <td>
                        <div>
                          <p className="font-medium">{invoice.case?.jugendamt || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{invoice.serviceCount} Services • {invoice.workHours}h</p>
                        </div>
                      </td>
                      <td className="font-medium">{formatCurrency(invoice.totalAmount)}</td>
                      <td>
                        <span className={`badge ${getStatusColor(invoice.status)}`}>
                          {invoice.status === 'paid' ? 'Bezahlt' :
                           invoice.status === 'pending' ? 'Offen' :
                           invoice.status === 'overdue' ? 'Überfällig' : invoice.status}
                        </span>
                      </td>
                      <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('de-DE') : 'N/A'}</td>
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

            {/* Empty State für Invoices */}
            {(!invoices || invoices.length === 0) && (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Rechnungen gefunden</h3>
                <p className="text-gray-600">Erstellen Sie Ihre erste Rechnung</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals hier falls nötig */}
      {showInvoiceModal && (
        <CreateInvoiceModal 
          onClose={() => setShowInvoiceModal(false)}
          onSave={handleCreateInvoice}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </Layout>
  )
}

// Create Invoice Modal Component
function CreateInvoiceModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    fall_id: '',
    arbeitsstunden: 0,
    leistungsanzahl: 0,
    stundensatz: 25.50,
    rechnungsdatum: new Date().toISOString().split('T')[0],
    notiz: ''
  })
  
  const [loading, setLoading] = useState(false)
  const { data: cases } = useSWR('/api/cases', fetcher)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error creating invoice:', error)
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
            <h2 className="text-xl font-semibold text-white">Rechnung erstellen</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fall auswählen *
              </label>
              <select
                value={formData.fall_id}
                onChange={(e) => setFormData({...formData, fall_id: e.target.value})}
                className="input"
                required
              >
                <option value="">Bitte wählen...</option>
                {cases && cases.map(case_ => (
                  <option key={case_.id} value={case_.id}>
                    {case_.caseNumber} - {case_.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arbeitsstunden *
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.arbeitsstunden}
                  onChange={(e) => setFormData({...formData, arbeitsstunden: parseFloat(e.target.value)})}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anzahl Leistungen *
                </label>
                <input
                  type="number"
                  value={formData.leistungsanzahl}
                  onChange={(e) => setFormData({...formData, leistungsanzahl: parseInt(e.target.value)})}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stundensatz (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.stundensatz}
                  onChange={(e) => setFormData({...formData, stundensatz: parseFloat(e.target.value)})}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechnungsdatum *
                </label>
                <input
                  type="date"
                  value={formData.rechnungsdatum}
                  onChange={(e) => setFormData({...formData, rechnungsdatum: e.target.value})}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notiz
              </label>
              <textarea
                value={formData.notiz}
                onChange={(e) => setFormData({...formData, notiz: e.target.value})}
                className="input"
                rows="3"
                placeholder="Zusätzliche Anmerkungen..."
              />
            </div>

            {/* Calculation */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Berechnung</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Stunden:</span>
                  <span>{formData.arbeitsstunden || 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Stundensatz:</span>
                  <span>{formatCurrency(formData.stundensatz || 0)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Gesamtbetrag:</span>
                  <span>{formatCurrency((formData.arbeitsstunden || 0) * (formData.stundensatz || 0))}</span>
                </div>
              </div>
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
                {loading ? 'Erstellen...' : 'Rechnung erstellen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

// Invoice Detail Modal Component
function InvoiceDetailModal({ invoice, onClose }) {
  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="fixed inset-4 lg:inset-8 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Rechnung {invoice.invoiceNumber}</h2>
              <p className="text-blue-100">{invoice.periodLabel || ''} • {invoice.case?.jugendamt || ''}</p>
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

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Invoice Header */}
            <div className="text-center pb-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Rechnung</h1>
              <p className="text-gray-600">
                Rechnungsnummer: {invoice.invoiceNumber} • {invoice.periodLabel || 'N/A'}
              </p>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Rechnungsempfänger</h3>
                <div className="space-y-2">
                  <p className="font-medium">{invoice.case?.jugendamt || 'N/A'}</p>
                </div>
              </div>

              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Rechnungsdetails</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Betrag:</dt>
                    <dd className="font-medium">{formatCurrency(invoice.totalAmount || 0)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Gesamtstunden:</dt>
                    <dd className="font-medium">{invoice.workHours || 0}h</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Services:</dt>
                    <dd className="font-medium">{invoice.serviceCount || 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Fällig am:</dt>
                    <dd className="font-medium">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('de-DE') : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}