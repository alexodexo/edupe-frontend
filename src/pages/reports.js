// src/pages/reports.js
import { useState, useMemo, useEffect } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { useAuth } from '@/lib/auth'
import { useNotifications } from '@/lib/notifications'
import { 
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { formatDateTime, formatCurrency, formatDuration, BERICHT_STATUS } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner, LoadingPage } from '@/components/Loading'
import useSWR from 'swr'

const REPORT_TYPES = [
  { value: 'monthly', label: 'Monatsbericht', description: 'Regelmäßiger monatlicher Bericht' },
  { value: 'interim', label: 'Zwischenbericht', description: 'Bericht zu bestimmten Meilensteinen' },
  { value: 'final', label: 'Abschlussbericht', description: 'Bericht bei Fallabschluss' },
  { value: 'custom', label: 'Individueller Bericht', description: 'Benutzerdefinierter Zeitraum' }
]

export default function Reports() {
  const { userProfile, userRole } = useAuth()
  const { success, error } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    type: 'all',
    caseId: 'all'
  })

  // Fetch reports using SWR
  const { data: reports, error: reportsError, mutate: refreshReports } = useSWR(
    ['/api/reports', userProfile?.helfer_id || userProfile?.ansprechpartner_id, userRole],
    async ([url, userId, userRole]) => {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (userRole) params.append('userRole', userRole)
      if (selectedFilters.status !== 'all') params.append('status', selectedFilters.status)
      if (selectedFilters.caseId !== 'all') params.append('caseId', selectedFilters.caseId)
      
      const response = await fetch(`${url}?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      return response.json()
    },
    {
      revalidateOnFocus: false,
      onError: (err) => error('Fehler beim Laden der Berichte: ' + err.message)
    }
  )

  // Fetch cases for filter dropdown
  const { data: cases } = useSWR(
    ['/api/cases', userProfile?.helfer_id || userProfile?.ansprechpartner_id, userRole],
    async ([url, userId, userRole]) => {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (userRole) params.append('userRole', userRole)
      
      const response = await fetch(`${url}?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch cases')
      return response.json()
    }
  )

  // Filter reports
  const filteredReports = useMemo(() => {
    if (!reports) return []
    
    return reports.filter(report => {
      const matchesSearch = 
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.case?.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.case?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.author?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.author?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedFilters.status === 'all' || report.status === selectedFilters.status
      const matchesCase = selectedFilters.caseId === 'all' || report.case?.id === selectedFilters.caseId

      return matchesSearch && matchesStatus && matchesCase
    })
  }, [reports, searchTerm, selectedFilters])

  const getStatusColor = (status) => {
    switch (status) {
      case BERICHT_STATUS.UEBERMITTELT:
        return 'bg-green-100 text-green-800'
      case BERICHT_STATUS.FINAL:
        return 'bg-blue-100 text-blue-800'
      case BERICHT_STATUS.ENTWURF:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case BERICHT_STATUS.UEBERMITTELT:
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case BERICHT_STATUS.FINAL:
        return <DocumentTextIcon className="w-5 h-5 text-blue-600" />
      case BERICHT_STATUS.ENTWURF:
        return <PencilIcon className="w-5 h-5 text-yellow-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case BERICHT_STATUS.UEBERMITTELT:
        return 'Übermittelt'
      case BERICHT_STATUS.FINAL:
        return 'Final'
      case BERICHT_STATUS.ENTWURF:
        return 'Entwurf'
      default:
        return status
    }
  }

  const deleteReport = async (reportId) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Bericht löschen möchten?')) return

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete report')

      success('Bericht wurde erfolgreich gelöscht')
      refreshReports()
    } catch (err) {
      error('Fehler beim Löschen des Berichts: ' + err.message)
    }
  }

  const downloadReport = async (reportId, title) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/pdf`)
      if (!response.ok) throw new Error('Failed to download report')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      success('Bericht wurde heruntergeladen')
    } catch (err) {
      error('Fehler beim Herunterladen: ' + err.message)
    }
  }

  if (reportsError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fehler beim Laden der Berichte</h3>
          <p className="text-gray-600">{reportsError.message}</p>
        </div>
      </Layout>
    )
  }

  if (!reports) {
    return (
      <Layout>
        <LoadingPage message="Lade Berichte..." />
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Berichte - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Berichte</h1>
            <p className="text-gray-600 mt-1">
              {userRole === 'jugendamt' ? 'Berichte für Ihre Fälle' : 'Erstellen und verwalten Sie Berichte'}
            </p>
          </div>
          {userRole !== 'jugendamt' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <SparklesIcon className="w-5 h-5" />
              Neuen Bericht erstellen
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
                placeholder="Berichte suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select 
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
                className="input w-auto min-w-[150px]"
              >
                <option value="all">Alle Status</option>
                <option value={BERICHT_STATUS.ENTWURF}>Entwurf</option>
                <option value={BERICHT_STATUS.FINAL}>Final</option>
                <option value={BERICHT_STATUS.UEBERMITTELT}>Übermittelt</option>
              </select>
              
              {cases && (
                <select 
                  value={selectedFilters.caseId}
                  onChange={(e) => setSelectedFilters({...selectedFilters, caseId: e.target.value})}
                  className="input w-auto min-w-[150px]"
                >
                  <option value="all">Alle Fälle</option>
                  {cases.map(case_ => (
                    <option key={case_.id} value={case_.id}>
                      {case_.caseNumber} - {case_.title}
                    </option>
                  ))}
                </select>
              )}

              <button className="btn-secondary">
                <FunnelIcon className="w-5 h-5" />
                Weitere Filter
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="card card-hover">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(report.status)}
                      <h3 className="font-semibold text-gray-900 truncate">{report.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Fall {report.case?.caseNumber} • {report.case?.school || 'Unbekannt'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                      {report.visibleToJugendamt && (
                        <span className="badge badge-blue">
                          Für Jugendamt sichtbar
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {(report.serviceCount || report.totalHours) && (
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{report.serviceCount || 0}</p>
                      <p className="text-xs text-gray-600">Services</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{report.totalHours || 0}h</p>
                      <p className="text-xs text-gray-600">Stunden</p>
                    </div>
                  </div>
                )}

                {/* Author & Date */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  {report.author && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span>{report.author.firstName} {report.author.lastName}</span>
                    </div>
                  )}
                  <span>{formatDateTime(report.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedReport(report)}
                    className="btn-secondary flex-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Ansehen
                  </button>
                  
                  {report.status === BERICHT_STATUS.UEBERMITTELT && report.pdfUrl && (
                    <button 
                      onClick={() => downloadReport(report.id, report.title)}
                      className="btn-secondary flex-1"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </button>
                  )}
                  
                  {userRole !== 'jugendamt' && report.status === BERICHT_STATUS.ENTWURF && (
                    <button 
                      onClick={() => {/* Edit logic */}}
                      className="btn-secondary flex-1"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Bearbeiten
                    </button>
                  )}

                  {userRole === 'admin' && (
                    <button 
                      onClick={() => deleteReport(report.id)}
                      className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berichte gefunden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Erstellen Sie Ihren ersten Bericht'}
            </p>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-4 lg:inset-8 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-w-2xl mx-auto">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Neuen Bericht erstellen</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <ReportCreationForm 
                onClose={() => setShowCreateModal(false)} 
                onSuccess={refreshReports}
                cases={cases || []}
              />
            </div>
          </div>
        </>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <>
          <div className="modal-backdrop" onClick={() => setSelectedReport(null)} />
          <div className="fixed inset-4 lg:inset-8 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedReport.title}</h2>
                  <p className="text-blue-100">{selectedReport.case?.caseNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedReport.pdfUrl && (
                    <button 
                      onClick={() => downloadReport(selectedReport.id, selectedReport.title)}
                      className="btn bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      Download PDF
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <ReportPreview report={selectedReport} />
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}

// Report Creation Form Component
function ReportCreationForm({ onClose, onSuccess, cases }) {
  const { userProfile } = useAuth()
  const { success, error } = useNotifications()
  const [formData, setFormData] = useState({
    caseId: '',
    title: '',
    reportType: 'monthly',
    periodStart: '',
    periodEnd: '',
    includeAttachments: true,
    visibleToJugendamt: false,
    content: ''
  })

  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsGenerating(true)
    
    try {
      // Get services for the selected case and period
      const servicesResponse = await fetch(
        `/api/services?fall_id=${formData.caseId}&startDate=${formData.periodStart}&endDate=${formData.periodEnd}`
      )
      const services = await servicesResponse.json()

      // Calculate statistics
      const serviceCount = services.length
      const totalHours = services.reduce((sum, service) => sum + (service.duration || 0), 0)

      // Generate automatic title if not provided
      const selectedCase = cases.find(c => c.id === formData.caseId)
      const autoTitle = formData.title || 
        `${REPORT_TYPES.find(t => t.value === formData.reportType)?.label} - ${selectedCase?.title} - ${new Date(formData.periodStart).toLocaleDateString('de-DE')}`

      // Create report
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titel: autoTitle,
          inhalt: formData.content || `Bericht für den Zeitraum vom ${new Date(formData.periodStart).toLocaleDateString('de-DE')} bis ${new Date(formData.periodEnd).toLocaleDateString('de-DE')}.`,
          fall_id: formData.caseId,
          status: BERICHT_STATUS.ENTWURF,
          sichtbar_fuer_jugendamt: formData.visibleToJugendamt,
          erstellt_von: userProfile?.helfer_id,
          anzahl_leistungen: serviceCount,
          gesamtstunden: totalHours
        })
      })

      if (!response.ok) throw new Error('Failed to create report')

      success('Bericht wurde erfolgreich erstellt')
      onSuccess()
      onClose()
    } catch (err) {
      error('Fehler beim Erstellen des Berichts: ' + err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Case Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fall auswählen *
        </label>
        <select 
          value={formData.caseId}
          onChange={(e) => setFormData({...formData, caseId: e.target.value})}
          className="input"
          required
        >
          <option value="">Bitte wählen...</option>
          {cases.map(case_ => (
            <option key={case_.id} value={case_.id}>
              {case_.caseNumber} - {case_.title}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titel (optional)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="input"
          placeholder="Wird automatisch generiert wenn leer gelassen"
        />
      </div>

      {/* Report Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Berichtstyp
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({...formData, reportType: type.value})}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                formData.reportType === type.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-medium text-gray-900 mb-1">{type.label}</h4>
              <p className="text-xs text-gray-600">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Time Period */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Berichtszeitraum *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Von</label>
            <input 
              type="date"
              value={formData.periodStart}
              onChange={(e) => setFormData({...formData, periodStart: e.target.value})}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Bis</label>
            <input 
              type="date"
              value={formData.periodEnd}
              onChange={(e) => setFormData({...formData, periodEnd: e.target.value})}
              className="input"
              required
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Berichtsinhalt (optional)
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          className="input"
          rows="4"
          placeholder="Zusätzlicher Inhalt für den Bericht..."
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="visibleToJugendamt"
            checked={formData.visibleToJugendamt}
            onChange={(e) => setFormData({...formData, visibleToJugendamt: e.target.checked})}
            className="rounded"
          />
          <label htmlFor="visibleToJugendamt" className="text-sm text-gray-700">
            Für Jugendamt sichtbar machen
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          Abbrechen
        </button>
        <button 
          type="submit" 
          disabled={isGenerating}
          className="btn-primary flex-1"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="small" />
              Erstelle Bericht...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Bericht erstellen
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Report Preview Component
function ReportPreview({ report }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Report Header */}
      <div className="text-center pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h1>
        <p className="text-gray-600">
          Fall: {report.case?.caseNumber} - {report.case?.title}
        </p>
      </div>

      {/* Report Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Berichtsdetails</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Status:</dt>
              <dd className="font-medium">{getStatusLabel(report.status)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Erstellt am:</dt>
              <dd className="font-medium">{formatDateTime(report.createdAt)}</dd>
            </div>
            {report.author && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Erstellt von:</dt>
                <dd className="font-medium">{report.author.firstName} {report.author.lastName}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-600">Sichtbar für Jugendamt:</dt>
              <dd className="font-medium">{report.visibleToJugendamt ? 'Ja' : 'Nein'}</dd>
            </div>
          </dl>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Statistiken</h3>
          <dl className="space-y-2 text-sm">
            {report.serviceCount && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Enthaltene Services:</dt>
                <dd className="font-medium">{report.serviceCount}</dd>
              </div>
            )}
            {report.totalHours && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Gesamtstunden:</dt>
                <dd className="font-medium">{report.totalHours}h</dd>
              </div>
            )}
            {report.estimatedReadingTime && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Lesezeit:</dt>
                <dd className="font-medium">{report.estimatedReadingTime} Min</dd>
              </div>
            )}
            {report.wordCount && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Wörter:</dt>
                <dd className="font-medium">{report.wordCount.toLocaleString('de-DE')}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Report Content */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Berichtsinhalt</h3>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700">
            {report.content || 'Kein Inhalt verfügbar.'}
          </div>
        </div>
      </div>
    </div>
  )
}

function getStatusLabel(status) {
  switch (status) {
    case BERICHT_STATUS.UEBERMITTELT:
      return 'Übermittelt'
    case BERICHT_STATUS.FINAL:
      return 'Final'
    case BERICHT_STATUS.ENTWURF:
      return 'Entwurf'
    default:
      return status
  }
}