// src/pages/index.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import { 
  UsersIcon, 
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CurrencyEuroIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  MapPinIcon,
  BellIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline'
import Layout from '@/components/Layout'
import { 
  DUMMY_CASES, 
  DUMMY_SERVICES, 
  DUMMY_HELPERS,
  CASE_STATUS,
  SERVICE_STATUS,
  HELPER_AVAILABILITY,
  PRIORITY_LEVELS,
  formatCurrency,
  formatDateTime,
  formatDuration
} from '@/lib/types'

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('week') // week, month, quarter

  // Calculate statistics
  const stats = useMemo(() => {
    const activeCases = DUMMY_CASES.filter(c => c.status === CASE_STATUS.ACTIVE).length
    const availableHelpers = DUMMY_HELPERS.filter(h => h.availability === HELPER_AVAILABILITY.AVAILABLE).length
    const totalHelpers = DUMMY_HELPERS.length
    
    // This week's hours (mock calculation)
    const thisWeekHours = DUMMY_SERVICES.reduce((sum, service) => {
      const serviceDate = new Date(service.date)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      if (serviceDate >= weekAgo && serviceDate <= now) {
        return sum + service.duration
      }
      return sum
    }, 0)

    // This month's revenue (mock calculation)
    const thisMonthRevenue = DUMMY_SERVICES.reduce((sum, service) => {
      const serviceDate = new Date(service.date)
      const now = new Date()
      
      if (serviceDate.getMonth() === now.getMonth() && serviceDate.getFullYear() === now.getFullYear()) {
        return sum + service.costs
      }
      return sum
    }, 0)

    return [
      { 
        name: 'Verfügbare Helfer', 
        value: `${availableHelpers}/${totalHelpers}`, 
        change: '+3',
        changeType: 'increase', 
        icon: UsersIcon,
        description: 'Helfer bereit für neue Fälle'
      },
      { 
        name: 'Aktive Fälle', 
        value: activeCases.toString(), 
        change: '+2',
        changeType: 'increase', 
        icon: ClipboardDocumentCheckIcon,
        description: 'Laufende Betreuungen'
      },
      { 
        name: 'Stunden diese Woche', 
        value: Math.round(thisWeekHours).toString(), 
        change: '+18%',
        changeType: 'increase', 
        icon: ClockIcon,
        description: 'Geleistete Arbeitsstunden'
      },
      { 
        name: 'Umsatz diesen Monat', 
        value: formatCurrency(thisMonthRevenue), 
        change: '+23%',
        changeType: 'increase', 
        icon: CurrencyEuroIcon,
        description: 'Abrechenbare Leistungen'
      }
    ]
  }, [])

  // Recent activities
  const recentActivities = useMemo(() => {
    const activities = []

    // Add new cases
    DUMMY_CASES.forEach(case_ => {
      activities.push({
        id: `case-${case_.id}`,
        type: 'case_created',
        title: `Neuer Fall erstellt: ${case_.title}`,
        description: `${case_.jugendamt.name}`,
        time: case_.createdAt,
        icon: ClipboardDocumentCheckIcon,
        color: 'blue'
      })
    })

    // Add recent services
    DUMMY_SERVICES.forEach(service => {
      const case_ = DUMMY_CASES.find(c => c.id === service.caseId)
      const helper = DUMMY_HELPERS.find(h => h.id === service.helperId)
      
      activities.push({
        id: `service-${service.id}`,
        type: 'service_completed',
        title: `Leistung erbracht: ${formatDuration(service.duration)}`,
        description: `${helper?.firstName} ${helper?.lastName} • ${case_?.caseNumber}`,
        time: service.createdAt,
        icon: CheckCircleIcon,
        color: 'green'
      })
    })

    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8)
  }, [])

  // Urgent notifications
  const urgentNotifications = useMemo(() => {
    const notifications = []

    // Check for urgent cases
    const urgentCases = DUMMY_CASES.filter(c => c.priority === PRIORITY_LEVELS.URGENT && c.status === CASE_STATUS.ACTIVE)
    urgentCases.forEach(case_ => {
      notifications.push({
        id: `urgent-${case_.id}`,
        type: 'urgent_case',
        title: 'Dringender Fall benötigt Aufmerksamkeit',
        description: `${case_.title} - ${case_.jugendamt.name}`,
        priority: 'high',
        action: 'case_view',
        actionData: case_.id
      })
    })

    // Check for pending service approvals
    const pendingServices = DUMMY_SERVICES.filter(s => s.status === SERVICE_STATUS.SUBMITTED)
    if (pendingServices.length > 0) {
      notifications.push({
        id: 'pending-services',
        type: 'pending_approvals',
        title: `${pendingServices.length} Leistungen zur Freigabe`,
        description: 'Stundeneinträge warten auf Genehmigung',
        priority: 'medium',
        action: 'billing_view'
      })
    }

    // Check for helpers without recent activity
    const inactiveHelpers = DUMMY_HELPERS.filter(helper => {
      const recentServices = DUMMY_SERVICES.filter(service => {
        const serviceDate = new Date(service.date)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return service.helperId === helper.id && serviceDate >= weekAgo
      })
      return helper.availability === HELPER_AVAILABILITY.AVAILABLE && recentServices.length === 0
    })

    if (inactiveHelpers.length > 0) {
      notifications.push({
        id: 'inactive-helpers',
        type: 'helper_inactive',
        title: `${inactiveHelpers.length} Helfer ohne aktuelle Einsätze`,
        description: 'Verfügbare Helfer könnten neue Fälle übernehmen',
        priority: 'low',
        action: 'helpers_view'
      })
    }

    return notifications
  }, [])

  // Top performing helpers
  const topHelpers = useMemo(() => {
    return DUMMY_HELPERS
      .map(helper => {
        const helperServices = DUMMY_SERVICES.filter(s => s.helperId === helper.id)
        const thisMonthHours = helperServices.reduce((sum, service) => {
          const serviceDate = new Date(service.date)
          const now = new Date()
          if (serviceDate.getMonth() === now.getMonth()) {
            return sum + service.duration
          }
          return sum
        }, 0)

        return {
          ...helper,
          thisMonthHours,
          thisMonthRevenue: thisMonthHours * helper.hourlyRate
        }
      })
      .sort((a, b) => b.thisMonthHours - a.thisMonthHours)
      .slice(0, 5)
  }, [])

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
        {urgentNotifications.length > 0 && (
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
          {stats.map((stat, index) => (
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
                      <TrendingUpIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDownIcon className="w-4 h-4 text-red-600" />
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
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                        activity.color === 'green' ? 'bg-green-50 text-green-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                        <p className="text-gray-600 text-sm">{activity.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {formatDateTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Helpers */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Helfer diesen Monat</h2>
            </div>
            <div className="p-6 space-y-4">
              {topHelpers.map((helper, index) => (
                <div key={helper.id} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {helper.firstName} {helper.lastName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{Math.round(helper.thisMonthHours)}h</span>
                      <span>{formatCurrency(helper.thisMonthRevenue)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium text-gray-700">{helper.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-secondary justify-start">
              <ClipboardDocumentCheckIcon className="w-5 h-5" />
              Neuen Fall erstellen
            </button>
            <button className="btn-secondary justify-start">
              <UsersIcon className="w-5 h-5" />
              Helfer hinzufügen
            </button>
            <button className="btn-secondary justify-start">
              <ClockIcon className="w-5 h-5" />
              Stunden freigeben
            </button>
            <button className="btn-secondary justify-start">
              <CurrencyEuroIcon className="w-5 h-5" />
              Rechnung erstellen
            </button>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Stunden-Entwicklung</h2>
              <ChartBarIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                <p className="text-blue-600 font-medium">Stunden-Chart</p>
                <p className="text-blue-500 text-sm mt-1">Wird implementiert...</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Umsatz-Verteilung</h2>
              <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <CurrencyEuroIcon className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Umsatz-Chart</p>
                <p className="text-green-500 text-sm mt-1">Wird implementiert...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}