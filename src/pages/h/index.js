// src/pages/h/index.js - Helfer Dashboard
import { useState, useMemo } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import HelperLayout from '@/components/HelperLayout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useHelpers, useServices } from '@/hooks/useData'
import {
  PlusIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function HelperDashboard() {
  const router = useRouter()
  const { user, userProfile, userRole, hasPermission } = useAuth()
  const { helpers, isLoading: helpersLoading, error: helpersError } = useHelpers()
  const { services, isLoading: servicesLoading, error: servicesError } = useServices()

  // Find current helper profile
  const helperProfile = useMemo(() => {
    if (!helpers || !userProfile?.helfer_id) return null
    return helpers.find(h => h.id === userProfile.helfer_id)
  }, [helpers, userProfile])

  // Filter services for current helper
  const helperServices = useMemo(() => {
    if (!services || !userProfile?.helfer_id) return []
    return services.filter(s => s.helperId === userProfile.helfer_id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [services, userProfile])

  // Calculate statistics
  const stats = useMemo(() => {
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const thisMonthServices = helperServices.filter(s => 
      new Date(s.createdAt) >= thisMonth
    )

    const approvedServices = helperServices.filter(s => s.approved)
    const pendingServices = helperServices.filter(s => !s.approved)

    const totalHours = approvedServices.reduce((sum, s) => sum + (s.duration || 0), 0)
    const thisMonthHours = thisMonthServices
      .filter(s => s.approved)
      .reduce((sum, s) => sum + (s.duration || 0), 0)

    const hourlyRate = helperProfile?.hourlyRate || 25.50
    const thisMonthRevenue = thisMonthHours * hourlyRate

    return {
      totalServices: helperServices.length,
      approvedServices: approvedServices.length,
      pendingServices: pendingServices.length,
      totalHours: Math.round(totalHours * 10) / 10,
      thisMonthHours: Math.round(thisMonthHours * 10) / 10,
      thisMonthRevenue,
      activeCases: helperProfile?.activeCases || 0
    }
  }, [helperServices, helperProfile])

  // Recent services (last 5)
  const recentServices = helperServices.slice(0, 5)

  const isLoading = helpersLoading || servicesLoading
  const error = helpersError || servicesError

  // Check if user is helper
  if (!userRole || userRole !== 'helper') {
    return (
      <HelperLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung für den Helfer-Bereich.</p>
          </div>
        </div>
      </HelperLayout>
    )
  }

  if (isLoading) {
    return (
      <HelperLayout>
        <LoadingPage message="Lade Dashboard..." />
      </HelperLayout>
    )
  }

  if (error) {
    return (
      <HelperLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-900 mb-2">Fehler beim Laden</h3>
            <p className="text-red-600 mb-4">{error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </HelperLayout>
    )
  }

  return (
    <HelperLayout title="Dashboard - Edupe Digital">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Willkommen zurück, {helperProfile?.firstName || 'Helfer'}! 👋
          </h1>
          <p className="text-gray-600">
            Hier ist Ihre aktuelle Übersicht für heute.
          </p>
        </div>

        {/* Quick Action - Service buchen */}
        {stats.activeCases > 0 && (
          <div className="mb-8">
            <Link
              href="/h/services/new"
              className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Leistung eintragen</h3>
                  <p className="text-blue-100">Schnell eine neue Leistung buchen</p>
                </div>
                <div className="flex items-center space-x-2">
                  <PlusIcon className="h-6 w-6" />
                  <ArrowRightIcon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Freigegeben</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedServices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Wartend</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingServices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stunden (Monat)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonthHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CurrencyEuroIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verdienst</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.thisMonthRevenue.toFixed(0)}€
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Cases Info */}
        {stats.activeCases > 0 && (
          <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900">
                  {stats.activeCases} aktive{stats.activeCases === 1 ? 'r Fall' : ' Fälle'}
                </h3>
                <p className="text-blue-700">
                  Sie können Leistungen für Ihre zugewiesenen Fälle buchen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Services */}
        {recentServices.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Letzte Leistungen</h2>
                <Link
                  href="/h/services"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Alle anzeigen
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentServices.map((service) => (
                <div key={service.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                          service.approved ? 'bg-green-400' : 'bg-yellow-400'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {service.type === 'with_client_face_to_face' && 'Face-to-Face'}
                            {service.type === 'with_client_remote' && 'Remote'}
                            {service.type === 'without_client' && 'Ohne Klient'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {new Date(service.startTime).toLocaleDateString('de-DE')}
                            </span>
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {service.duration}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {service.approved ? 'Freigegeben' : 'Wartend'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalServices === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ChartBarIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Noch keine Leistungen
            </h3>
            <p className="text-gray-600 mb-6">
              Sobald Sie Ihre erste Leistung gebucht haben, sehen Sie hier eine Übersicht.
            </p>
            {stats.activeCases > 0 && (
              <Link
                href="/h/services/new"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Erste Leistung buchen
              </Link>
            )}
          </div>
        )}
      </div>
    </HelperLayout>
  )
}