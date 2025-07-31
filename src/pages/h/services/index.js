// src/pages/h/services/index.js - Leistungsübersicht für Helfer
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
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const SERVICE_TYPE_LABELS = {
  'mit_klient_persoenlich': 'Face-to-Face',
  'mit_klient_remote': 'Remote',
  'ohne_klient': 'Ohne Klient',
  'beratung': 'Beratung',
  'vorbereitung': 'Vorbereitung',
  'dokumentation': 'Dokumentation'
}

const SERVICE_TYPE_ICONS = {
  'mit_klient_persoenlich': UserIcon,
  'mit_klient_remote': PhoneIcon,
  'ohne_klient': BuildingOfficeIcon,
  'beratung': UserIcon,
  'vorbereitung': BuildingOfficeIcon,
  'dokumentation': BuildingOfficeIcon
}

export default function HelperServices() {
  const router = useRouter()
  const { user, userProfile, userRole, hasPermission } = useAuth()
  const { helpers, isLoading: helpersLoading } = useHelpers()
  const { services, isLoading: servicesLoading } = useServices()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')

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

  // Apply filters
  const filteredServices = useMemo(() => {
    let filtered = helperServices

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        SERVICE_TYPE_LABELS[service.type]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'approved') {
        filtered = filtered.filter(s => s.approved)
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(s => !s.approved)
      }
    }

    // Month filter
    if (filterMonth !== 'all') {
      const targetMonth = parseInt(filterMonth)
      filtered = filtered.filter(s => {
        const serviceDate = new Date(s.createdAt)
        return serviceDate.getMonth() === targetMonth
      })
    }

    return filtered
  }, [helperServices, searchTerm, filterStatus, filterMonth])

  // Statistics
  const stats = useMemo(() => {
    const approved = helperServices.filter(s => s.approved)
    const pending = helperServices.filter(s => !s.approved)
    const totalHours = approved.reduce((sum, s) => sum + (s.duration || 0), 0)
    const hourlyRate = helperProfile?.hourlyRate || 25.50

    return {
      total: helperServices.length,
      approved: approved.length,
      pending: pending.length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalRevenue: totalHours * hourlyRate
    }
  }, [helperServices, helperProfile])

  const isLoading = helpersLoading || servicesLoading

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
        <LoadingPage message="Lade Leistungen..." />
      </HelperLayout>
    )
  }

  return (
    <HelperLayout title="Meine Leistungen - Edupe Digital">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Meine Leistungen</h1>
            <Link
              href="/h/services/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Neue Leistung
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600">Gesamt</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600">Freigegeben</div>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600">Wartend</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600">Stunden</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalHours}h</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Leistungen durchsuchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-40">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="approved">Freigegeben</option>
                  <option value="pending">Wartend</option>
                </select>
              </div>

              {/* Month Filter */}
              <div className="sm:w-40">
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Alle Monate</option>
                  <option value="0">Januar</option>
                  <option value="1">Februar</option>
                  <option value="2">März</option>
                  <option value="3">April</option>
                  <option value="4">Mai</option>
                  <option value="5">Juni</option>
                  <option value="6">Juli</option>
                  <option value="7">August</option>
                  <option value="8">September</option>
                  <option value="9">Oktober</option>
                  <option value="10">November</option>
                  <option value="11">Dezember</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        {filteredServices.length > 0 ? (
          <div className="space-y-4">
            {filteredServices.map((service) => {
              const Icon = SERVICE_TYPE_ICONS[service.type] || ClockIcon
              const serviceDate = new Date(service.startTime || service.createdAt)
              
              return (
                <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${service.approved ? 'bg-green-100' : 'bg-yellow-100'}`}>
                          <Icon className={`h-5 w-5 ${service.approved ? 'text-green-600' : 'text-yellow-600'}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {SERVICE_TYPE_LABELS[service.type] || service.type}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {serviceDate.toLocaleDateString('de-DE')}
                            </span>
                            <span className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {service.duration || 0}h
                            </span>
                            {service.location && (
                              <span className="flex items-center truncate">
                                📍 {service.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {service.description && (
                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {service.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          service.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {service.approved ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Freigegeben
                            </>
                          ) : (
                            <>
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              Wartend
                            </>
                          )}
                        </div>

                        <div className="text-sm text-gray-600">
                          Erstellt: {new Date(service.createdAt).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ClockIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' || filterMonth !== 'all' 
                ? 'Keine Leistungen gefunden' 
                : 'Noch keine Leistungen'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' || filterMonth !== 'all'
                ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
                : 'Buchen Sie Ihre erste Leistung, um sie hier zu sehen.'}
            </p>
            {!(searchTerm || filterStatus !== 'all' || filterMonth !== 'all') && (
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