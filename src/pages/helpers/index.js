// src/pages/helpers/index.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useHelpers } from '@/hooks/useData'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  UserCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import {
  HELPER_AVAILABILITY,
  QUALIFICATION_TYPES
} from '@/lib/types'

export default function Helpers() {
  const router = useRouter()
  const { userRole, hasPermission } = useAuth()
  const { helpers, isLoading, error, refresh } = useHelpers()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    availability: 'all',
    qualification: 'all',
    location: 'all'
  })

  // Filter helpers
  const filteredHelpers = useMemo(() => {
    if (!helpers) return []

    return helpers.filter(helper => {
      const matchesSearch =
        helper.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        helper.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        helper.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        helper.address.city.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesAvailability = selectedFilters.availability === 'all' ||
        helper.availability === selectedFilters.availability

      const matchesQualification = selectedFilters.qualification === 'all' ||
        helper.qualifications.includes(selectedFilters.qualification)

      return matchesSearch && matchesAvailability && matchesQualification
    })
  }, [helpers, searchTerm, selectedFilters])

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case HELPER_AVAILABILITY.AVAILABLE:
        return 'bg-green-100 text-green-800'
      case HELPER_AVAILABILITY.PARTIALLY_AVAILABLE:
        return 'bg-yellow-100 text-yellow-800'
      case HELPER_AVAILABILITY.UNAVAILABLE:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplianceIcon = (status) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'expiring':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
      case 'expired':
        return <XMarkIcon className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const handleHelperClick = (helperId) => {
    router.push(`/helpers/${helperId}`)
  }

  const handleAddHelperClick = () => {
    router.push('/helpers/new')
  }

  // Check permissions
  if (!hasPermission('view_helpers')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Helfer zu verwalten.</p>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Helfer..." />
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
        <title>Helfer - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Helfer</h1>
            <p className="text-gray-600 mt-1">Verwalten Sie Ihre Helfer und deren Verfügbarkeit</p>
          </div>
          {hasPermission('create_helpers') && (
            <button
              onClick={handleAddHelperClick}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5" />
              Neuer Helfer
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Helfer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedFilters.availability}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, availability: e.target.value })}
                className="input w-auto min-w-[150px]"
              >
                <option value="all">Alle Verfügbarkeiten</option>
                <option value={HELPER_AVAILABILITY.AVAILABLE}>Verfügbar</option>
                <option value={HELPER_AVAILABILITY.PARTIALLY_AVAILABLE}>Teilweise verfügbar</option>
                <option value={HELPER_AVAILABILITY.UNAVAILABLE}>Nicht verfügbar</option>
              </select>

              <select
                value={selectedFilters.qualification}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, qualification: e.target.value })}
                className="input w-auto min-w-[150px]"
              >
                <option value="all">Alle Qualifikationen</option>
                {QUALIFICATION_TYPES.map(qual => (
                  <option key={qual} value={qual}>{qual}</option>
                ))}
              </select>

              <button className="btn-secondary">
                <FunnelIcon className="w-5 h-5" />
                Weitere Filter
              </button>
            </div>
          </div>
        </div>

        {/* Helpers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHelpers.map((helper) => (
            <div
              key={helper.id}
              className="card card-hover cursor-pointer relative group"
              onClick={() => handleHelperClick(helper.id)}
            >
              {/* Compliance indicator */}
              <div className="absolute top-4 right-4">
                {getComplianceIcon(helper.complianceStatus)}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                {/* Icon entfernt */}
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                    <span className="text-xl font-semibold text-blue-600">
                      {helper.firstName[0]}{helper.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {helper.firstName} {helper.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{helper.rating}</span>
                      <span className="text-xs text-gray-500">({helper.totalCases} Fälle)</span>
                    </div>
                    <span className={`badge ${getAvailabilityColor(helper.availability)} text-xs`}>
                      {helper.availability === HELPER_AVAILABILITY.AVAILABLE ? 'Verfügbar' :
                        helper.availability === HELPER_AVAILABILITY.PARTIALLY_AVAILABLE ? 'Teilweise verfügbar' :
                          'Nicht verfügbar'}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{helper.address.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{helper.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{helper.phone}</span>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {helper.qualifications.slice(0, 2).map((skill, index) => (
                      <span key={index} className="badge badge-blue text-xs">
                        {skill}
                      </span>
                    ))}
                    {helper.qualifications.length > 2 && (
                      <span className="badge badge-gray text-xs">
                        +{helper.qualifications.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{helper.activeCases}</p>
                    <p className="text-xs text-gray-600">Aktive Fälle</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{helper.thisMonthHours}h</p>
                    <p className="text-xs text-gray-600">Diesen Monat</p>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    Letzte Aktivität: {helper.lastActivity ?
                      new Date(helper.lastActivity).toLocaleDateString('de-DE') :
                      'Unbekannt'
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredHelpers.length === 0 && (
          <div className="text-center py-12">
            <UserCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Helfer gefunden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Fügen Sie Ihren ersten Helfer hinzu'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}