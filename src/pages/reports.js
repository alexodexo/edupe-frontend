// src/pages/reports.js
import { useState } from 'react'
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
} from '@heroicons/react/24/outline'

// Dummy data
const reports = [
  {
    id: 1,
    title: 'Monatsbericht März 2024 - Familie Meyer',
    caseId: 'F-2024-001',
    jugendamt: 'Jugendamt Frankfurt',
    createdDate: '2024-04-01',
    status: 'Fertiggestellt',
    type: 'Monatsbericht',
    protected: true,
    author: 'Anna Schmidt',
  },
  {
    id: 2,
    title: 'Zwischenbericht - Erziehungsbeistand Schmidt',
    caseId: 'F-2024-002',
    jugendamt: 'Jugendamt Offenbach',
    createdDate: '2024-03-28',
    status: 'In Bearbeitung',
    type: 'Zwischenbericht',
    protected: false,
    author: 'Michael Weber',
  },
  {
    id: 3,
    title: 'Abschlussbericht - Sozialpädagogische Betreuung',
    caseId: 'F-2024-003',
    jugendamt: 'Jugendamt Hanau',
    createdDate: '2024-03-25',
    status: 'Zur Freigabe',
    type: 'Abschlussbericht',
    protected: false,
    author: 'Sarah Johnson',
  },
  {
    id: 4,
    title: 'Monatsbericht Februar 2024 - Familie Meyer',
    caseId: 'F-2024-001',
    jugendamt: 'Jugendamt Frankfurt',
    createdDate: '2024-03-01',
    status: 'Fertiggestellt',
    type: 'Monatsbericht',
    protected: true,
    author: 'Anna Schmidt',
  },
]

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.jugendamt.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <p className="text-gray-600 mt-1">Erstellen und verwalten Sie Berichte für Jugendämter</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Bericht erstellen
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <ArrowDownTrayIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Berichte suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select className="input w-full sm:w-auto">
            <option>Alle Status</option>
            <option>Fertiggestellt</option>
            <option>In Bearbeitung</option>
            <option>Zur Freigabe</option>
          </select>
          <select className="input w-full sm:w-auto">
            <option>Alle Typen</option>
            <option>Monatsbericht</option>
            <option>Zwischenbericht</option>
            <option>Abschlussbericht</option>
          </select>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="card card-hover">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Fall {report.caseId} • {report.jugendamt}</p>
                  </div>
                  <span className={`badge ${
                    report.status === 'Fertiggestellt' ? 'badge-green' :
                    report.status === 'In Bearbeitung' ? 'badge-blue' :
                    'badge-yellow'
                  }`}>
                    {report.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Typ:</span>
                    <span className="font-medium text-gray-900">{report.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Erstellt am:</span>
                    <span className="font-medium text-gray-900">{report.createdDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Autor:</span>
                    <span className="font-medium text-gray-900">{report.author}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Passwortschutz:</span>
                    <span className="flex items-center gap-1">
                      {report.protected ? (
                        <>
                          <LockClosedIcon className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium">Aktiv</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Nicht aktiv</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button className="btn-secondary flex-1">
                    <EyeIcon className="w-4 h-4" />
                    Ansehen
                  </button>
                  {report.status !== 'Fertiggestellt' && (
                    <button className="btn-secondary flex-1">
                      <PencilIcon className="w-4 h-4" />
                      Bearbeiten
                    </button>
                  )}
                  {report.status === 'Fertiggestellt' && (
                    <button className="btn-secondary flex-1">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)} />
          <div className="modal-content max-w-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Neuen Bericht erstellen</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fall auswählen</label>
                <select className="input">
                  <option>F-2024-001 - Familienbetreuung Meyer</option>
                  <option>F-2024-002 - Erziehungsbeistand Schmidt</option>
                  <option>F-2024-003 - Sozialpädagogische Betreuung</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berichtstyp</label>
                <select className="input">
                  <option>Monatsbericht</option>
                  <option>Zwischenbericht</option>
                  <option>Abschlussbericht</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berichtszeitraum</label>
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" className="input" />
                  <input type="date" className="input" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KI-gestützte Erstellung
                </label>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Das System wird automatisch alle relevanten Informationen aus dem gewählten Zeitraum sammeln 
                    und einen Berichtsentwurf erstellen, den Sie anschließend bearbeiten können.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="password-protect" className="rounded" />
                <label htmlFor="password-protect" className="text-sm text-gray-700">
                  Bericht mit Passwort schützen
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                  Abbrechen
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Bericht erstellen
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </Layout>
  )
}