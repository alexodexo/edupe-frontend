// src/pages/reports.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
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
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { 
  DUMMY_CASES,
  DUMMY_SERVICES,
  DUMMY_HELPERS,
  formatDateTime,
  formatCurrency,
  formatDuration
} from '@/lib/types'

// Dummy reports data
const DUMMY_REPORTS = [
  {
    id: 'report_001',
    title: 'Monatsbericht März 2024 - Familie Meyer',
    caseId: 'case_001',
    caseNumber: 'F-2024-001',
    jugendamt: 'Jugendamt Frankfurt',
    reportType: 'monthly',
    period: { start: '2024-03-01', end: '2024-03-31' },
    status: 'completed',
    isProtected: true,
    author: 'Anna Schmidt',
    helperId: 'helper_001',
    createdAt: '2024-04-01T10:00:00Z',
    generatedByAI: true,
    wordCount: 1250,
    pageCount: 4,
    includedServices: 12,
    totalHours: 48.5
  },
  {
    id: 'report_002',
    title: 'Zwischenbericht - Erziehungsbeistand Tim Schmidt',
    caseId: 'case_002',
    caseNumber: 'F-2024-002',
    jugendamt: 'Jugendamt Offenbach',
    reportType: 'interim',
    period: { start: '2024-02-01', end: '2024-03-28' },
    status: 'draft',
    isProtected: false,
    author: 'Michael Weber',
    helperId: 'helper_002',
    createdAt: '2024-03-28T15:30:00Z',
    generatedByAI: true,
    wordCount: 980,
    pageCount: 3,
    includedServices: 8,
    totalHours: 32.0
  },
  {
    id: 'report_003',
    title: 'Abschlussbericht - Familienbetreuung Johnson',
    caseId: 'case_003',
    caseNumber: 'F-2024-003',
    jugendamt: 'Jugendamt Hanau',
    reportType: 'final',
    period: { start: '2024-01-01', end: '2024-03-31' },
    status: 'pending_approval',
    isProtected: false,
    author: 'Sarah Johnson',
    helperId: 'helper_003',
    createdAt: '2024-03-25T12:00:00Z',
    generatedByAI: false,
    wordCount: 2100,
    pageCount: 6,
    includedServices: 24,
    totalHours: 96.0
  }
]

const REPORT_TYPES = [
  { value: 'monthly', label: 'Monatsbericht', description: 'Regelmäßiger monatlicher Bericht' },
  { value: 'interim', label: 'Zwischenbericht', description: 'Bericht zu bestimmten Meilensteinen' },
  { value: 'final', label: 'Abschlussbericht', description: 'Bericht bei Fallabschluss' },
  { value: 'custom', label: 'Individueller Bericht', description: 'Benutzerdefinierter Zeitraum' }
]

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    type: 'all',
    jugendamt: 'all'
  })

  // Enhanced reports with additional calculated data
  const enhancedReports = useMemo(() => {
    return DUMMY_REPORTS.map(report => {
      const case_ = DUMMY_CASES.find(c => c.id === report.caseId)
      const helper = DUMMY_HELPERS.find(h => h.id === report.helperId)
      
      return {
        ...report,
        case: case_,
        helper: helper,
        estimatedReadingTime: Math.ceil(report.wordCount / 200) // 200 words per minute
      }
    })
  }, [])

  // Filter reports
  const filteredReports = useMemo(() => {
    return enhancedReports.filter(report => {
      const matchesSearch = 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.jugendamt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.author.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedFilters.status === 'all' || report.status === selectedFilters.status
      const matchesType = selectedFilters.type === 'all' || report.reportType === selectedFilters.type
      const matchesJugendamt = selectedFilters.jugendamt === 'all' || report.jugendamt === selectedFilters.jugendamt

      return matchesSearch && matchesStatus && matchesType && matchesJugendamt
    })
  }, [enhancedReports, searchTerm, selectedFilters])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-blue-100 text-blue-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'draft':
        return <PencilIcon className="w-5 h-5 text-blue-600" />
      case 'pending_approval':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'monthly':
        return 'text-blue-600 bg-blue-50'
      case 'interim':
        return 'text-purple-600 bg-purple-50'
      case 'final':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
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
            <p className="text-gray-600 mt-1">KI-gestützte Berichtsgenerierung für Jugendämter</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <SparklesIcon className="w-5 h-5" />
            KI-Bericht erstellen
          </button>
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
                <option value="completed">Fertiggestellt</option>
                <option value="draft">Entwurf</option>
                <option value="pending_approval">Zur Freigabe</option>
              </select>
              
              <select 
                value={selectedFilters.type}
                onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
                className="input w-auto min-w-[150px]"
              >
                <option value="all">Alle Typen</option>
                {REPORT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

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
                      {report.generatedByAI && (
                        <SparklesIcon className="w-4 h-4 text-purple-500 flex-shrink-0" title="KI-generiert" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Fall {report.caseNumber} • {report.jugendamt}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${getStatusColor(report.status)}`}>
                        {report.status === 'completed' ? 'Fertiggestellt' :
                         report.status === 'draft' ? 'Entwurf' :
                         report.status === 'pending_approval' ? 'Zur Freigabe' : report.status}
                      </span>
                      <span className={`badge ${getReportTypeColor(report.reportType)}`}>
                        {REPORT_TYPES.find(t => t.value === report.reportType)?.label}
                      </span>
                    </div>
                  </div>
                  {report.isProtected && (
                    <LockClosedIcon className="w-5 h-5 text-green-600 flex-shrink-0" title="Passwortgeschützt" />
                  )}
                </div>

                {/* Period */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {new Date(report.period.start).toLocaleDateString('de-DE')} - {' '}
                    {new Date(report.period.end).toLocaleDateString('de-DE')}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{report.pageCount}</p>
                    <p className="text-xs text-gray-600">Seiten</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{report.includedServices}</p>
                    <p className="text-xs text-gray-600">Services</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{report.totalHours}h</p>
                    <p className="text-xs text-gray-600">Stunden</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{report.estimatedReadingTime} Min</p>
                    <p className="text-xs text-gray-600">Lesezeit</p>
                  </div>
                </div>

                {/* Author & Date */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>{report.author}</span>
                  </div>
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
                  {report.status === 'completed' && (
                    <button className="btn-secondary flex-1">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </button>
                  )}
                  {report.status === 'draft' && (
                    <button className="btn-secondary flex-1">
                      <PencilIcon className="w-4 h-4" />
                      Bearbeiten
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
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Erstellen Sie Ihren ersten KI-Bericht'}
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
                  <h2 className="text-xl font-semibold text-white">KI-Bericht erstellen</h2>
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
              <ReportCreationForm onClose={() => setShowCreateModal(false)} />
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
                  <p className="text-blue-100">{selectedReport.caseNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="btn bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Download PDF
                  </button>
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
function ReportCreationForm({ onClose }) {
  const [formData, setFormData] = useState({
    caseId: '',
    reportType: 'monthly',
    periodStart: '',
    periodEnd: '',
    includeAttachments: true,
    passwordProtect: false,
    customPrompt: ''
  })

  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsGenerating(true)
    
    // Simulate AI report generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsGenerating(false)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <SparklesIcon className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">KI-gestützte Berichtsgenerierung</h3>
            <p className="text-sm text-purple-800">
              Unser KI-System analysiert automatisch alle relevanten Services und Aktivitäten im gewählten Zeitraum 
              und erstellt einen strukturierten, professionellen Bericht für das Jugendamt.
            </p>
          </div>
        </div>
      </div>

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
          {DUMMY_CASES.map(case_ => (
            <option key={case_.id} value={case_.id}>
              {case_.caseNumber} - {case_.title}
            </option>
          ))}
        </select>
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
          Berichtszeitraum
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

      {/* Custom Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zusätzliche Anweisungen (optional)
        </label>
        <textarea
          value={formData.customPrompt}
          onChange={(e) => setFormData({...formData, customPrompt: e.target.value})}
          className="input"
          rows="3"
          placeholder="Spezielle Schwerpunkte, die im Bericht behandelt werden sollen..."
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="includeAttachments"
            checked={formData.includeAttachments}
            onChange={(e) => setFormData({...formData, includeAttachments: e.target.checked})}
            className="rounded"
          />
          <label htmlFor="includeAttachments" className="text-sm text-gray-700">
            Anhänge und Dokumentation einschließen
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="passwordProtect"
            checked={formData.passwordProtect}
            onChange={(e) => setFormData({...formData, passwordProtect: e.target.checked})}
            className="rounded"
          />
          <label htmlFor="passwordProtect" className="text-sm text-gray-700">
            Bericht mit Passwort schützen
          </label>
        </div>
      </div>

      {/* Generation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Automatische Generierung umfasst:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Zusammenfassung aller geleisteten Services</li>
              <li>Entwicklungsfortschritte und Zielerreichung</li>
              <li>Empfehlungen für weitere Maßnahmen</li>
              <li>Statistische Auswertung der Betreuungszeit</li>
            </ul>
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
          disabled={isGenerating}
          className="btn-primary flex-1"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              KI generiert Bericht...
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
          Berichtszeitraum: {new Date(report.period.start).toLocaleDateString('de-DE')} - {' '}
          {new Date(report.period.end).toLocaleDateString('de-DE')}
        </p>
      </div>

      {/* Report Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Falldetails</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Fall-Nr.:</dt>
              <dd className="font-medium">{report.caseNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Jugendamt:</dt>
              <dd className="font-medium">{report.jugendamt}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Helfer:</dt>
              <dd className="font-medium">{report.author}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Erstellt am:</dt>
              <dd className="font-medium">{formatDateTime(report.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Berichtsstatistiken</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Enthaltene Services:</dt>
              <dd className="font-medium">{report.includedServices}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Gesamtstunden:</dt>
              <dd className="font-medium">{report.totalHours}h</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Seitenzahl:</dt>
              <dd className="font-medium">{report.pageCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Wörter:</dt>
              <dd className="font-medium">{report.wordCount.toLocaleString('de-DE')}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Report Content Preview */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Berichtsvorschau</h3>
        <div className="prose prose-sm max-w-none">
          <h4>Zusammenfassung</h4>
          <p className="text-gray-700">
            Im Berichtszeitraum wurden insgesamt {report.includedServices} Betreuungseinheiten 
            mit einer Gesamtdauer von {report.totalHours} Stunden durchgeführt. 
            Die Betreuung erfolgte sowohl in persönlichen Terminen als auch über 
            telefonische Kontakte...
          </p>
          
          <h4>Entwicklungsfortschritte</h4>
          <p className="text-gray-700">
            Der Klient zeigte im Verlauf des Berichtszeitraums deutliche Fortschritte 
            in den vereinbarten Zielbereichen. Besonders hervorzuheben ist die 
            verbesserte Kommunikation und die gestiegene Motivation...
          </p>
          
          <h4>Empfehlungen</h4>
          <p className="text-gray-700">
            Für die weitere Betreuung wird empfohlen, den eingeschlagenen Weg 
            fortzusetzen und die Betreuungsintensität entsprechend anzupassen...
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button className="btn-secondary">
          <PencilIcon className="w-5 h-5" />
          Bericht bearbeiten
        </button>
        <button className="btn-primary">
          <ArrowDownTrayIcon className="w-5 h-5" />
          Als PDF herunterladen
        </button>
      </div>
    </div>
  )
}