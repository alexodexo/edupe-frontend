// src/pages/billing.js
import { useState } from 'react'
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
} from '@heroicons/react/24/outline'

// Dummy data
const invoices = [
  {
    id: 'R-2024-0156',
    period: 'März 2024',
    jugendamt: 'Jugendamt Frankfurt',
    amount: 4567.89,
    hours: 156,
    status: 'Bezahlt',
    dueDate: '2024-04-15',
    paidDate: '2024-04-10',
  },
  {
    id: 'R-2024-0155',
    period: 'März 2024',
    jugendamt: 'Jugendamt Offenbach',
    amount: 3234.50,
    hours: 112,
    status: 'Offen',
    dueDate: '2024-04-20',
    paidDate: null,
  },
  {
    id: 'R-2024-0154',
    period: 'Februar 2024',
    jugendamt: 'Jugendamt Hanau',
    amount: 5678.90,
    hours: 189,
    status: 'Überfällig',
    dueDate: '2024-03-15',
    paidDate: null,
  },
  {
    id: 'R-2024-0153',
    period: 'Februar 2024',
    jugendamt: 'Jugendamt Frankfurt',
    amount: 4123.45,
    hours: 134,
    status: 'Bezahlt',
    dueDate: '2024-03-15',
    paidDate: '2024-03-12',
  },
]

const pendingHours = [
  {
    id: 1,
    helper: 'Anna Schmidt',
    case: 'F-2024-001',
    date: '2024-04-01',
    hours: 8.5,
    description: 'Familienbetreuung',
    status: 'Zur Prüfung',
  },
  {
    id: 2,
    helper: 'Michael Weber',
    case: 'F-2024-002',
    date: '2024-04-01',
    hours: 6.0,
    description: 'Erziehungsbeistand',
    status: 'Geprüft',
  },
  {
    id: 3,
    helper: 'Sarah Johnson',
    case: 'F-2024-003',
    date: '2024-03-31',
    hours: 7.5,
    description: 'Beratungsgespräch',
    status: 'Zur Prüfung',
  },
]

export default function Billing() {
  const [activeTab, setActiveTab] = useState('invoices')
  const [searchTerm, setSearchTerm] = useState('')

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidInvoices = invoices.filter(inv => inv.status === 'Bezahlt')
  const openAmount = invoices.filter(inv => inv.status !== 'Bezahlt').reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <Layout>
      <Head>
        <title>Abrechnungen - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Abrechnungen</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Rechnungen und Stundenabrechnungen</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <CurrencyEuroIcon className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Gesamt</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">€{totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">Gesamtumsatz</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <span className="text-sm text-gray-500">Bezahlt</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{paidInvoices.length}</p>
            <p className="text-sm text-gray-600 mt-1">Bezahlte Rechnungen</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
              <span className="text-sm text-gray-500">Offen</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">€{openAmount.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">Offene Beträge</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <DocumentTextIcon className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{invoices.length}</p>
            <p className="text-sm text-gray-600 mt-1">Rechnungen gesamt</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rechnungen
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hours'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stundenfreigabe
              <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                {pendingHours.filter(h => h.status === 'Zur Prüfung').length}
              </span>
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'invoices' ? (
          <>
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechnungen suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-medium">{invoice.id}</td>
                      <td>{invoice.period}</td>
                      <td>{invoice.jugendamt}</td>
                      <td className="font-medium">€{invoice.amount.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${
                          invoice.status === 'Bezahlt' ? 'badge-green' :
                          invoice.status === 'Offen' ? 'badge-yellow' :
                          'badge-red'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td>{invoice.dueDate}</td>
                      <td>
                        <button className="btn-ghost p-2">
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Pending Hours */}
            <div className="space-y-4">
              {pendingHours.map((entry) => (
                <div key={entry.id} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900">{entry.helper}</h3>
                        <span className={`badge ${
                          entry.status === 'Geprüft' ? 'badge-green' : 'badge-yellow'
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Fall:</span>
                          <span className="ml-2 font-medium">{entry.case}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Datum:</span>
                          <span className="ml-2 font-medium">{entry.date}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Stunden:</span>
                          <span className="ml-2 font-medium">{entry.hours}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tätigkeit:</span>
                          <span className="ml-2 font-medium">{entry.description}</span>
                        </div>
                      </div>
                    </div>
                    {entry.status === 'Zur Prüfung' && (
                      <div className="flex gap-2 ml-4">
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                          <CheckCircleIcon className="w-6 h-6" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <XCircleIcon className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button className="btn-secondary">
                Alle ablehnen
              </button>
              <button className="btn-primary">
                Alle freigeben
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}