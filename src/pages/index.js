// src/pages/index.js
import { useState, useMemo, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
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
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  BellIcon,
  PlusIcon,
  DocumentPlusIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  BeakerIcon
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
  const router = useRouter()
  const { userRole, userProfile } = useAuth()
  const [timeRange, setTimeRange] = useState('week') // week, month, quarter, year
  
  const { 
    stats, 
    recentActivities, 
    urgentNotifications, 
    isLoading,
    error,
    refresh 
  } = useDashboardData(timeRange)

  // Redirect unverified Jugendamt to profile page
  useEffect(() => {
    if (userRole === 'jugendamt_unverifiziert') {
      router.push('/profile')
    }
  }, [userRole, router])

  // Dashboard stats cards with real data (no trends)
  const dashboardStats = useMemo(() => {
    if (!stats) return []

    const timeRangeLabel = {
      week: 'dieser Woche',
      month: 'diesem Monat', 
      quarter: 'diesem Quartal',
      year: 'diesem Jahr'
    }[timeRange] || 'diesem Zeitraum'

    return [
      {
        name: 'Verfügbare Helfer',
        value: `${stats.helpers?.available || 0}/${stats.helpers?.total || 0}`,
        icon: UsersIcon,
        description: 'Helfer bereit für neue Fälle',
        color: 'blue'
      },
      {
        name: 'Aktive Fälle',
        value: (stats.cases?.active || 0).toString(),
        icon: ClipboardDocumentCheckIcon,
        description: 'Laufende Betreuungen',
        color: 'green'
      },
      {
        name: `Stunden ${timeRangeLabel}`,
        value: Math.round(stats.services?.totalHours || 0).toString(),
        icon: ClockIcon,
        description: 'Geleistete Arbeitsstunden',
        color: 'purple'
      },
      {
        name: `Umsatz ${timeRangeLabel}`,
        value: formatCurrency(stats.services?.totalCosts || 0),
        icon: CurrencyEuroIcon,
        description: 'Abrechenbare Leistungen',
        color: 'orange'
      }
    ]
  }, [stats, timeRange])

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
      case 'service_approved': return CheckCircleIcon
      case 'service_created': return ClockIcon
      case 'helper_assigned': return UsersIcon
      case 'helper_registered': return UserPlusIcon
      default: return BellIcon
    }
  }

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'new-case':
        router.push('/cases/new')
        break
      case 'add-helper':
        router.push('/helpers/new')
        break
      case 'approve-hours':
        router.push('/services?filter=pending')
        break
      case 'create-invoice':
        router.push('/billing')
        break
      case 'add-service':
        router.push('/h/services/new')
        break
      case 'request-vacation':
        router.push('/h/urlaube/new')
        break
      default:
        console.log('Action not implemented:', action)
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
              <option value="year">Dieses Jahr</option>
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
          {dashboardStats.map((stat, index) => {
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 from-blue-50 to-blue-100',
              green: 'bg-green-50 text-green-600 from-green-50 to-green-100',
              purple: 'bg-purple-50 text-purple-600 from-purple-50 to-purple-100',
              orange: 'bg-orange-50 text-orange-600 from-orange-50 to-orange-100'
            }[stat.color] || 'bg-blue-50 text-blue-600 from-blue-50 to-blue-100'
            
            return (
              <div key={stat.name} className="card p-6 relative overflow-hidden hover:shadow-lg transition-all duration-200">
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses.split(' ').slice(-2).join(' ')} rounded-full -mr-12 -mt-12 opacity-50`} />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${colorClasses.split(' ').slice(0, 4).join(' ')} rounded-xl`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-700">{stat.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activities */}
          <div className="lg:col-span-2 card">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Letzte Aktivitäten</h2>
              {recentActivities?.length > 0 && (
                <span className="text-sm text-gray-500">
                  {recentActivities.length} Einträge
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  const colorClasses = {
                    blue: 'bg-blue-50 text-blue-600',
                    green: 'bg-green-50 text-green-600',
                    yellow: 'bg-yellow-50 text-yellow-600',
                    red: 'bg-red-50 text-red-600'
                  }[activity.color] || 'bg-gray-50 text-gray-600'
                  
                  return (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${colorClasses}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                          <p className="text-gray-600 text-sm truncate">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time && formatDateTime(activity.time)}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {/* Activity type indicator */}
                          <span className="px-2 py-1 bg-gray-100 rounded-md">
                            {activity.type === 'case_created' && 'Fall'}
                            {activity.type === 'service_created' && 'Service'}
                            {activity.type === 'service_approved' && 'Freigabe'}
                            {activity.type === 'helper_registered' && 'Helfer'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center">
                  <BellIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Keine aktuellen Aktivitäten</p>
                  <p className="text-gray-500 text-sm mt-1">Alle Datenbankaktivitäten werden hier angezeigt</p>
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
                    <button 
                      onClick={() => handleQuickAction('new-case')}
                      className="btn-secondary w-full justify-start hover:bg-blue-50 transition-colors"
                    >
                      <DocumentPlusIcon className="w-5 h-5" />
                      Neuen Fall erstellen
                    </button>
                    <button 
                      onClick={() => handleQuickAction('add-helper')}
                      className="btn-secondary w-full justify-start hover:bg-green-50 transition-colors"
                    >
                      <UserPlusIcon className="w-5 h-5" />
                      Helfer hinzufügen
                    </button>
                  </>
                )}
                {(userRole === 'admin' || userRole === 'jugendamt') && (
                  <>
                    <button 
                      onClick={() => handleQuickAction('approve-hours')}
                      className="btn-secondary w-full justify-start hover:bg-purple-50 transition-colors"
                    >
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                      {stats?.services?.pending > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                          {stats.services.pending}
                        </span>
                      )}
                      Stunden freigeben
                    </button>
                    <button 
                      onClick={() => handleQuickAction('create-invoice')}
                      className="btn-secondary w-full justify-start hover:bg-orange-50 transition-colors"
                    >
                      <BanknotesIcon className="w-5 h-5" />
                      Rechnung erstellen
                    </button>
                  </>
                )}
                {userRole === 'helper' && (
                  <>
                    <button 
                      onClick={() => handleQuickAction('add-service')}
                      className="btn-secondary w-full justify-start hover:bg-blue-50 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Leistung eintragen
                    </button>
                    <button 
                      onClick={() => handleQuickAction('request-vacation')}
                      className="btn-secondary w-full justify-start hover:bg-green-50 transition-colors"
                    >
                      <CalendarDaysIcon className="w-5 h-5" />
                      Urlaub beantragen
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Enhanced Statistics Summary */}
            {stats && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Systemübersicht
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ClipboardDocumentCheckIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Gesamt Fälle</span>
                    </div>
                    <span className="font-bold text-blue-600">{stats.cases?.total || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Aktive Helfer</span>
                    </div>
                    <span className="font-bold text-green-600">{stats.helpers?.available || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">Wartende Services</span>
                    </div>
                    <span className="font-bold text-yellow-600">{stats.services?.pending || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CurrencyEuroIcon className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Umsatz Zeitraum</span>
                    </div>
                    <span className="font-bold text-orange-600">{formatCurrency(stats.services?.totalCosts || 0)}</span>
                  </div>
                  
                  {stats.helpers?.complianceIssues > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-900">Compliance Probleme</span>
                      </div>
                      <span className="font-bold text-red-600">{stats.helpers.complianceIssues}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={refresh}
                    className="btn-secondary w-full text-sm"
                  >
                    <BeakerIcon className="w-4 h-4" />
                    Daten aktualisieren
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        
      </div>
    </Layout>
  )
}