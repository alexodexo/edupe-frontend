// src/pages/index.js
import Head from 'next/head'
import { 
  UsersIcon, 
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CurrencyEuroIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import Layout from '@/components/Layout'

// Dummy data
const stats = [
  { name: 'Aktive Helfer', value: '156', change: '+12%', changeType: 'increase', icon: UsersIcon },
  { name: 'Offene Fälle', value: '23', change: '-5%', changeType: 'decrease', icon: ClipboardDocumentCheckIcon },
  { name: 'Stunden diese Woche', value: '1,234', change: '+18%', changeType: 'increase', icon: ClockIcon },
  { name: 'Umsatz diesen Monat', value: '€45,678', change: '+23%', changeType: 'increase', icon: CurrencyEuroIcon },
]

const recentRequests = [
  { id: 1, jugendamt: 'Jugendamt Frankfurt', type: 'Familienhelfer', status: 'Neu', priority: 'Hoch', time: 'vor 5 Min.' },
  { id: 2, jugendamt: 'Jugendamt Offenbach', type: 'Erziehungsbeistand', status: 'In Bearbeitung', priority: 'Mittel', time: 'vor 15 Min.' },
  { id: 3, jugendamt: 'Jugendamt Hanau', type: 'Familienhelfer', status: 'Zugewiesen', priority: 'Normal', time: 'vor 1 Std.' },
  { id: 4, jugendamt: 'Jugendamt Darmstadt', type: 'Sozialpädagoge', status: 'Neu', priority: 'Hoch', time: 'vor 2 Std.' },
]

const topHelpers = [
  { id: 1, name: 'Anna Schmidt', cases: 12, hours: 156, rating: 4.9 },
  { id: 2, name: 'Michael Weber', cases: 10, hours: 142, rating: 4.8 },
  { id: 3, name: 'Sarah Johnson', cases: 9, hours: 128, rating: 5.0 },
  { id: 4, name: 'Thomas Müller', cases: 8, hours: 118, rating: 4.7 },
]

export default function Dashboard() {
  return (
    <Layout>
      <Head>
        <title>Dashboard - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Willkommen zurück! Hier ist Ihre Übersicht.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span className={stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests */}
          <div className="lg:col-span-2 card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Aktuelle Anfragen</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Jugendamt</th>
                    <th>Typ</th>
                    <th>Status</th>
                    <th>Priorität</th>
                    <th>Zeit</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="font-medium">{request.jugendamt}</td>
                      <td>{request.type}</td>
                      <td>
                        <span className={`badge ${
                          request.status === 'Neu' ? 'badge-yellow' :
                          request.status === 'In Bearbeitung' ? 'badge-blue' :
                          'badge-green'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          request.priority === 'Hoch' ? 'badge-red' :
                          request.priority === 'Mittel' ? 'badge-yellow' :
                          'badge-gray'
                        }`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="text-gray-500">{request.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Helpers */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Helfer</h2>
            </div>
            <div className="p-6 space-y-4">
              {topHelpers.map((helper, index) => (
                <div key={helper.id} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{helper.name}</p>
                    <p className="text-sm text-gray-500">{helper.cases} Fälle • {helper.hours} Std.</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium">{helper.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Aktivitätsübersicht</h2>
            <select className="px-4 py-2 rounded-lg border border-gray-200 text-sm">
              <option>Letzte 7 Tage</option>
              <option>Letzte 30 Tage</option>
              <option>Letzte 90 Tage</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart-Komponente wird hier angezeigt</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}