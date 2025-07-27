// src/pages/index.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { useDashboardData } from '@/hooks/useData'
import { useAuth } from '@/lib/auth'
import { LoadingPage } from '@/components/Loading'
import { ErrorCard } from '@/components/Error'
import {
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  BellIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import {
  CASE_STATUS,
  SERVICE_STATUS,
  HELPER_AVAILABILITY,
  PRIORITY_LEVELS,
  formatCurrency,
  formatDateTime,
  formatDuration
} from '@/lib/types'

export default function Dashboard() {
  const { userRole, userProfile } = useAuth()
  const [timeRange, setTimeRange] = useState('week') // week, month, quarter
  
  const { 
    stats, 
    recentActivities, 
    urgentNotifications, 
    isLoading,
    error,
    refresh 
  } = useDashboardData()

  // Calculate trend-like stats (simplified for demo)
  const statsWithTrends = useMemo(() => {
    if (!stats) return []

    return [
      {
        name: 'Verfügbare Helfer',
        value: `${stats.helpers?.available || 0}/${stats.helpers?.total || 0}`,
        change: '+3',
        changeType: 'increase',
        icon: UsersIcon,
        description: 'Helfer bereit für neue Fälle'
      },
      {
        name: 'Aktive Fälle',
        value: (stats.cases?.active || 0).toString(),
        change: '+2',
        changeType: 'increase',
        icon: ClipboardDocumentCheckIcon,
        description: 'Laufende Betreuungen'
      },
      {
        name: 'Stunden diese Woche',
        value: Math.round(stats.services?.totalHours || 0).toString(),
        change: '+18%',
        changeType: 'increase',
        icon: ClockIcon,
        description: 'Geleistete Arbeitsstunden'
      },
      {
        name: 'Umsatz diesen Monat',
        value: formatCurrency(stats.services?.totalCosts || 0),
        change: '+23%',
        changeType: 'increase',
        icon: CurrencyEuroIcon,
        description: 'Abrechenbare Leistungen'
      }
    ]
  }, [stats])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'case_created': return ClipboardDocumentCheckIcon
      case 'service_completed': return CheckCircleIcon
      case 'helper_assigned': return UsersIcon
      default: return BellIcon
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Dashboard-Daten..." />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <ErrorCard 
          title="Fehler beim Laden des Dashboards"
          message="Die Dashboard-Daten konnten nicht geladen werden."
          onRetry={refresh}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Dashboard - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Willkommen zurück! Hier ist Ihre aktuelle Übersicht.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input w-auto"
            >
              <option value="week">Diese Woche</option>
              <option value="month">Dieser Monat</option>
              <option value="quarter">Dieses Quartal</option>
            </select>
          </div>
        </div>

        {/* Urgent Notifications */}
        {urgentNotifications && urgentNotifications.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
              <h2 className="font-semibold text-orange-900">Benötigt Aufmerksamkeit</h2>
            </div>
            <div className="space-y-2">
              {urgentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg ${getPriorityColor(notification.priority)} cursor-pointer hover:shadow-sm transition-all`}
                >
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs opacity-75">{notification.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsWithTrends.map((stat, index) => (
            <div key={stat.name} className="card p-6 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full -mr-12 -mt-12 opacity-50" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                    )}
                    <span className={stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activities */}
          <div className="lg:col-span-2 card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Letzte Aktivitäten</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${activity.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                            activity.color === 'green' ? 'bg-green-50 text-green-600' :
                              'bg-gray-50 text-gray-600'
                          }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                          <p className="text-gray-600 text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time && formatDateTime(activity.time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center">
                  <BellIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Keine aktuellen Aktivitäten</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar with Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
              <div className="space-y-3">
                {userRole === 'admin' && (
                  <>
                    <button className="btn-secondary w-full justify-start">
                      <ClipboardDocumentCheckIcon className="w-5 h-5" />
                      Neuen Fall erstellen
                    </button>
                    <button className="btn-secondary w-full justify-start">
                      <UsersIcon className="w-5 h-5" />
                      Helfer hinzufügen
                    </button>
                  </>
                )}
                {(userRole === 'admin' || userRole === 'jugendamt') && (
                  <>
                    <button className="btn-secondary w-full justify-start">
                      <ClockIcon className="w-5 h-5" />
                      Stunden freigeben
                    </button>
                    <button className="btn-secondary w-full justify-start">
                      <CurrencyEuroIcon className="w-5 h-5" />
                      Rechnung erstellen
                    </button>
                  </>
                )}
                {userRole === 'helper' && (
                  <>
                    <button className="btn-secondary w-full justify-start">
                      <PlusIcon className="w-5 h-5" />
                      Leistung eintragen
                    </button>
                    <button className="btn-secondary w-full justify-start">
                      <CalendarDaysIcon className="w-5 h-5" />
                      Urlaub beantragen
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Statistics Summary */}
            {stats && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Übersicht</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gesamt Fälle</span>
                    <span className="font-semibold">{stats.cases?.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Aktive Helfer</span>
                    <span className="font-semibold">{stats.helpers?.available || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Services</span>
                    <span className="font-semibold">{stats.services?.pending || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monatsumsatz</span>
                    <span className="font-semibold">{formatCurrency(stats.services?.totalCosts || 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        
      </div>
    </Layout>
  )
}