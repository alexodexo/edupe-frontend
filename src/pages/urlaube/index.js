// src/pages/urlaube/index.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useVacations } from '@/hooks/useData'
import { useHelpers } from '@/hooks/useData'
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

export default function Urlaube() {
  const router = useRouter()
  const { userRole, hasPermission, userProfile } = useAuth()
  const { vacations, stats, isLoading, error, refresh } = useVacations()
  const { helpers } = useHelpers()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    year: new Date().getFullYear().toString()
  })


  // Filter vacations
  const filteredVacations = useMemo(() => {
    if (!vacations) return []

    return vacations.filter(vacation => {
      const matchesSearch = searchTerm === '' ||
        vacation.helper.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vacation.helper.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  }, [vacations, searchTerm, selectedFilters])

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
    router.push(`/urlaube/${vacationId}`)
  }

  // Check permissions
  if (!hasPermission('view_vacations')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Urlaube zu verwalten.</p>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Urlaube..." />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Fehler beim Laden</h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button onClick={refresh} className="btn-primary">
            Erneut versuchen
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Urlaube - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Urlaube</h1>
            <p className="text-gray-600 mt-1">Verwalten Sie Urlaubsanträge und -genehmigungen</p>
          </div>
          {hasPermission('create_vacations') && (
            <button
              onClick={() => router.push('/urlaube/new')}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5" />
              Neuer Urlaubsantrag
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Genehmigt</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ausstehend</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Anstehend</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcoming}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Urlaub suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, status: e.target.value })}
                className="input w-auto min-w-[150px]"
              >
                <option value="all">Alle Status</option>
                <option value="approved">Genehmigt</option>
                <option value="pending">Ausstehend</option>
              </select>

              <select
                value={selectedFilters.year}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, year: e.target.value })}
                className="input w-auto min-w-[120px]"
              >
                <option value="all">Alle Jahre</option>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>

              <button className="btn-secondary">
                <FunnelIcon className="w-5 h-5" />
                Weitere Filter
              </button>
            </div>
          </div>
        </div>

        {/* Vacations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVacations.map((vacation) => (
            <div
              key={vacation.id}
              className="card card-hover cursor-pointer relative group"
              onClick={() => handleVacationClick(vacation.id)}
            >
              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                {getStatusIcon(vacation.approved)}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <EyeIcon className="w-8 h-8 text-gray-600" />
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {vacation.helper.firstName} {vacation.helper.lastName}
                    </h3>
                    <span className={`badge ${getStatusColor(vacation.approved)} text-xs`}>
                      {vacation.approved ? 'Genehmigt' : 'Ausstehend'}
                    </span>
                  </div>
                </div>

                {/* Date Info */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {new Date(vacation.fromDate).toLocaleDateString('de-DE')} - {new Date(vacation.toDate).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{vacation.days} Tage</span>
                  </div>
                </div>

                {/* Substitute */}
                {vacation.substitute && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserIcon className="w-4 h-4 flex-shrink-0" />
                      <span>Vertretung: {vacation.substitute.firstName} {vacation.substitute.lastName}</span>
                    </div>
                  </div>
                )}

                {/* Note */}
                {vacation.note && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {vacation.note}
                    </p>
                  </div>
                )}

                {/* Created Date */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Erstellt: {new Date(vacation.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVacations.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Urlaube gefunden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Erstellen Sie Ihren ersten Urlaubsantrag'}
            </p>
          </div>
        )}
      </div>


    </Layout>
  )
} 