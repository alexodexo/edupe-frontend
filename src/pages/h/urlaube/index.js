// src/pages/h/urlaube/index.js - Helfer Urlaube
import { useState, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import HelperLayout from '@/components/HelperLayout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useVacations, useHelpers } from '@/hooks/useData'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function HelperUrlaube() {
  const router = useRouter()
  const { userRole, hasPermission, userProfile } = useAuth()
  const { vacations, stats, isLoading, error, refresh } = useVacations()
  const { helpers } = useHelpers()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    year: new Date().getFullYear().toString()
  })

  // Filter vacations for current helper only
  const helperVacations = useMemo(() => {
    if (!vacations || !userProfile?.helfer_id) return []
    return vacations.filter(vacation => vacation.helperId === userProfile.helfer_id)
  }, [vacations, userProfile])

  // Apply additional filters
  const filteredVacations = useMemo(() => {
    if (!helperVacations) return []

    return helperVacations.filter(vacation => {
      const matchesSearch = searchTerm === '' ||
        vacation.helper?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vacation.helper?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vacation.substitute && (
          vacation.substitute.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vacation.substitute.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        ))

      const matchesStatus = selectedFilters.status === 'all' ||
        (selectedFilters.status === 'approved' && vacation.approved) ||
        (selectedFilters.status === 'pending' && !vacation.approved)

      const matchesYear = selectedFilters.year === 'all' ||
        new Date(vacation.fromDate).getFullYear().toString() === selectedFilters.year

      return matchesSearch && matchesStatus && matchesYear
    })
  }, [helperVacations, searchTerm, selectedFilters])

  const getStatusColor = (approved) => {
    return approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  const getStatusIcon = (approved) => {
    return approved ? (
      <CheckCircleIcon className="w-5 h-5 text-green-600" />
    ) : (
      <ClockIcon className="w-5 h-5 text-yellow-600" />
    )
  }

  const handleVacationClick = (vacationId) => {
    router.push(`/h/urlaube/${vacationId}`)
  }

  // Check permissions
  if (!hasPermission('view_vacations')) {
    return (
      <HelperLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung, Urlaube zu verwalten.</p>
          </div>
        </div>
      </HelperLayout>
    )
  }

  if (isLoading) {
    return (
      <HelperLayout>
        <LoadingPage message="Lade Urlaube..." />
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
            <button onClick={refresh} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Erneut versuchen
            </button>
          </div>
        </div>
      </HelperLayout>
    )
  }

  return (
    <HelperLayout title="Meine Urlaube - Edupe Digital">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Meine Urlaube</h1>
              <p className="text-gray-600">
                Verwalten Sie Ihre Urlaubsanträge und Vertretungen.
              </p>
            </div>
            {hasPermission('create_vacations') && (
              <button
                onClick={() => router.push('/h/urlaube/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Urlaub beantragen
              </button>
            )}
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-sm text-gray-600">Gesamt</div>
                <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-sm text-gray-600">Genehmigt</div>
                <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-sm text-gray-600">Wartend</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-sm text-gray-600">Urlaubstage</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalDays || 0}</div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Urlaube durchsuchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-40">
                <select
                  value={selectedFilters.status}
                  onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="approved">Genehmigt</option>
                  <option value="pending">Wartend</option>
                </select>
              </div>

              {/* Year Filter */}
              <div className="sm:w-32">
                <select
                  value={selectedFilters.year}
                  onChange={(e) => setSelectedFilters({...selectedFilters, year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Alle Jahre</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vacations List */}
        {filteredVacations.length > 0 ? (
          <div className="space-y-4">
            {filteredVacations.map((vacation) => (
              <div 
                key={vacation.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleVacationClick(vacation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {new Date(vacation.fromDate).toLocaleDateString('de-DE')} - {new Date(vacation.toDate).toLocaleDateString('de-DE')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {vacation.duration} Tag{vacation.duration !== 1 ? 'e' : ''}
                        </p>
                      </div>
                    </div>

                    {vacation.substitute && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>Vertretung: {vacation.substitute.firstName} {vacation.substitute.lastName}</span>
                      </div>
                    )}

                    {vacation.note && (
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {vacation.note}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vacation.approved)}`}>
                        {getStatusIcon(vacation.approved)}
                        <span className="ml-2">
                          {vacation.approved ? 'Genehmigt' : 'Wartend'}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500">
                        Beantragt: {new Date(vacation.createdAt).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/h/urlaube/${vacation.id}`)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {hasPermission('edit_vacations') && !vacation.approved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/h/urlaube/${vacation.id}/edit`)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedFilters.status !== 'all' || selectedFilters.year !== new Date().getFullYear().toString()
                ? 'Keine Urlaube gefunden'
                : 'Noch keine Urlaube beantragt'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedFilters.status !== 'all' || selectedFilters.year !== new Date().getFullYear().toString()
                ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
                : 'Beantragen Sie Ihren ersten Urlaub, um ihn hier zu sehen.'}
            </p>
            {hasPermission('create_vacations') && !(searchTerm || selectedFilters.status !== 'all' || selectedFilters.year !== new Date().getFullYear().toString()) && (
              <button
                onClick={() => router.push('/h/urlaube/new')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Ersten Urlaub beantragen
              </button>
            )}
          </div>
        )}
      </div>
    </HelperLayout>
  )
}