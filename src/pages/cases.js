// src/pages/cases.js
import { useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

// Dummy data
const cases = [
  {
    id: 'F-2024-001',
    title: 'Familienbetreuung Meyer',
    jugendamt: 'Jugendamt Frankfurt',
    helper: 'Anna Schmidt',
    startDate: '2024-01-15',
    status: 'Aktiv',
    type: 'Familienhelfer',
    hours: 156,
    lastActivity: 'vor 2 Stunden',
  },
  {
    id: 'F-2024-002',
    title: 'Erziehungsbeistand Schmidt',
    jugendamt: 'Jugendamt Offenbach',
    helper: 'Michael Weber',
    startDate: '2024-02-01',
    status: 'Aktiv',
    type: 'Erziehungsbeistand',
    hours: 89,
    lastActivity: 'vor 1 Tag',
  },
  {
    id: 'F-2024-003',
    title: 'Sozialpädagogische Betreuung',
    jugendamt: 'Jugendamt Hanau',
    helper: 'Sarah Johnson',
    startDate: '2024-01-20',
    status: 'Pausiert',
    type: 'Sozialpädagoge',
    hours: 234,
    lastActivity: 'vor 3 Tagen',
  },
  {
    id: 'F-2024-004',
    title: 'Familienunterstützung Weber',
    jugendamt: 'Jugendamt Darmstadt',
    helper: 'Thomas Müller',
    startDate: '2024-03-01',
    status: 'Abgeschlossen',
    type: 'Familienhelfer',
    hours: 45,
    lastActivity: 'vor 1 Woche',
  },
]

export default function Cases() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCase, setSelectedCase] = useState(null)

  const filteredCases = cases.filter(case_ =>
    case_.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.jugendamt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.helper.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <p className="text-gray-600 mt-1">Übersicht aller aktiven und abgeschlossenen Fälle</p>
          </div>
          <button className="btn-primary">
            <PlusIcon className="w-5 h-5" />
            Neuer Fall
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
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
          <select className="input w-full sm:w-auto">
            <option>Alle Status</option>
            <option>Aktiv</option>
            <option>Pausiert</option>
            <option>Abgeschlossen</option>
          </select>
          <select className="input w-full sm:w-auto">
            <option>Alle Jugendämter</option>
            <option>Jugendamt Frankfurt</option>
            <option>Jugendamt Offenbach</option>
            <option>Jugendamt Hanau</option>
            <option>Jugendamt Darmstadt</option>
          </select>
        </div>

        {/* Cases Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fall-ID</th>
                <th>Titel</th>
                <th>Jugendamt</th>
                <th>Helfer</th>
                <th>Status</th>
                <th>Stunden</th>
                <th>Letzte Aktivität</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((case_) => (
                <tr key={case_.id} className="cursor-pointer" onClick={() => setSelectedCase(case_)}>
                  <td className="font-medium">{case_.id}</td>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{case_.title}</p>
                      <p className="text-sm text-gray-500">{case_.type}</p>
                    </div>
                  </td>
                  <td>{case_.jugendamt}</td>
                  <td>{case_.helper}</td>
                  <td>
                    <span className={`badge ${
                      case_.status === 'Aktiv' ? 'badge-green' :
                      case_.status === 'Pausiert' ? 'badge-yellow' :
                      'badge-gray'
                    }`}>
                      {case_.status}
                    </span>
                  </td>
                  <td>{case_.hours}</td>
                  <td className="text-gray-500">{case_.lastActivity}</td>
                  <td>
                    <button className="p-1 rounded hover:bg-gray-100">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <>
          <div className="modal-backdrop" onClick={() => setSelectedCase(null)} />
          <div className="modal-content max-w-4xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedCase.title}</h2>
                <p className="text-gray-600">{selectedCase.id}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Case Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 text-gray-600 mb-1">
                    <BuildingOfficeIcon className="w-5 h-5" />
                    <span className="text-sm">Jugendamt</span>
                  </div>
                  <p className="font-medium text-gray-900">{selectedCase.jugendamt}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 text-gray-600 mb-1">
                    <UserIcon className="w-5 h-5" />
                    <span className="text-sm">Helfer</span>
                  </div>
                  <p className="font-medium text-gray-900">{selectedCase.helper}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 text-gray-600 mb-1">
                    <CalendarIcon className="w-5 h-5" />
                    <span className="text-sm">Startdatum</span>
                  </div>
                  <p className="font-medium text-gray-900">{selectedCase.startDate}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 text-gray-600 mb-1">
                    <ClockIcon className="w-5 h-5" />
                    <span className="text-sm">Gesamtstunden</span>
                  </div>
                  <p className="font-medium text-gray-900">{selectedCase.hours} Stunden</p>
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte Aktivitäten</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Stundeneintrag hinzugefügt</p>
                      <p className="text-xs text-gray-500">vor 2 Stunden • 3.5 Stunden</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Bericht eingereicht</p>
                      <p className="text-xs text-gray-500">vor 1 Tag • Monatsbericht März</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Fall pausiert</p>
                      <p className="text-xs text-gray-500">vor 3 Tagen • Urlaub des Helfers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="btn-primary">
                  <ClockIcon className="w-5 h-5" />
                  Stunden erfassen
                </button>
                <button className="btn-secondary">
                  <DocumentTextIcon className="w-5 h-5" />
                  Bericht erstellen
                </button>
                <button className="btn-secondary">
                  Fall bearbeiten
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}