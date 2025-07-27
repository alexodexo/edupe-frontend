// src/pages/ansprechpartner/index.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useAnsprechpartner } from '@/hooks/useData'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserCircleIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function Ansprechpartner() {
  const router = useRouter()
  const { userRole, hasPermission } = useAuth()
  const { ansprechpartner, isLoading, error, refresh } = useAnsprechpartner()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    jugendamt: 'all',
    caseStatus: 'all'
  })

  // Filter ansprechpartner
  const filteredAnsprechpartner = useMemo(() => {
    if (!ansprechpartner) return []

    return ansprechpartner.filter(person => {
      const matchesSearch =
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.jugendamt.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesJugendamt = selectedFilters.jugendamt === 'all' ||
        person.jugendamt === selectedFilters.jugendamt

      const matchesCaseStatus = selectedFilters.caseStatus === 'all' ||
        (selectedFilters.caseStatus === 'with_cases' && person.totalCases > 0) ||
        (selectedFilters.caseStatus === 'without_cases' && person.totalCases === 0) ||
        (selectedFilters.caseStatus === 'active_cases' && person.activeCases > 0)

      return matchesSearch && matchesJugendamt && matchesCaseStatus
    })
  }, [ansprechpartner, searchTerm, selectedFilters])

  // Get unique Jugendämter for filter
  const uniqueJugendaemter = useMemo(() => {
    if (!ansprechpartner) return []
    return [...new Set(ansprechpartner.map(ap => ap.jugendamt))].sort()
  }, [ansprechpartner])

  const handleAnsprechpartnerClick = (ansprechpartnerId) => {
    router.push(`/ansprechpartner/${ansprechpartnerId}`)
  }

  const handleAddAnsprechpartnerClick = () => {
    router.push('/ansprechpartner/new')
  }

  // Check permissions
  if (!hasPermission('view_ansprechpartner')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Ansprechpartner zu verwalten.</p>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Ansprechpartner..." />
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
        <title>Ansprechpartner - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Ansprechpartner</h1>
            <p className="text-gray-600 mt-1">Verwalten Sie Ihre Jugendamt-Ansprechpartner und deren Fallzuordnungen</p>
          </div>
          {hasPermission('create_ansprechpartner') && (
            <button
              onClick={handleAddAnsprechpartnerClick}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5" />
              Neuer Ansprechpartner
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{ansprechpartner?.length || 0}</p>
                <p className="text-sm text-gray-600">Gesamt</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <BriefcaseIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{ansprechpartner?.filter(ap => ap.activeCases > 0).length || 0}</p>
                <p className="text-sm text-gray-600">Mit aktiven Fällen</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{ansprechpartner?.filter(ap => ap.totalCases === 0).length || 0}</p>
                <p className="text-sm text-gray-600">Ohne Fälle</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{uniqueJugendaemter.length}</p>
                <p className="text-sm text-gray-600">Jugendämter</p>
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
                placeholder="Ansprechpartner suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedFilters.jugendamt}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, jugendamt: e.target.value })}
                className="input w-auto min-w-[150px]"
              >
                <option value="all">Alle Jugendämter</option>
                {uniqueJugendaemter.map(jugendamt => (
                  <option key={jugendamt} value={jugendamt}>{jugendamt}</option>
                ))}
              </select>

              <select
                value={selectedFilters.caseStatus}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, caseStatus: e.target.value })}
                className="input w-auto min-w-[150px]"
              >
                <option value="all">Alle Fallstatus</option>
                <option value="with_cases">Mit Fällen</option>
                <option value="without_cases">Ohne Fälle</option>
                <option value="active_cases">Mit aktiven Fällen</option>
              </select>

              <button className="btn-secondary">
                <FunnelIcon className="w-5 h-5" />
                Weitere Filter
              </button>
            </div>
          </div>
        </div>

        {/* Ansprechpartner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAnsprechpartner.map((person) => (
            <div
              key={person.id}
              className="card card-hover cursor-pointer relative group"
              onClick={() => handleAnsprechpartnerClick(person.id)}
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <EyeIcon className="w-8 h-8 text-gray-600" />
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                    <span className="text-xl font-semibold text-purple-600">
                      {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {person.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{person.jugendamt}</p>
                    <div className="flex items-center gap-2">
                      <span className={`badge text-xs ${
                        person.activeCases > 0 
                          ? 'badge-green' 
                          : person.totalCases > 0 
                            ? 'badge-yellow' 
                            : 'badge-gray'
                      }`}>
                        {person.activeCases > 0 
                          ? `${person.activeCases} aktive Fälle`
                          : person.totalCases > 0 
                            ? `${person.totalCases} Fälle zugeordnet`
                            : 'Keine Fälle'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{person.email}</span>
                  </div>
                  {person.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                </div>

                {/* Case Overview */}
                {person.assignedCases && person.assignedCases.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Aktuelle Fälle</h4>
                    <div className="space-y-1">
                      {person.assignedCases.slice(0, 2).map((case_, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                          {case_.aktenzeichen} - {case_.vorname} {case_.nachname}
                        </div>
                      ))}
                      {person.assignedCases.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{person.assignedCases.length - 2} weitere
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{person.totalCases}</p>
                    <p className="text-xs text-gray-600">Fälle gesamt</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{person.activeCases}</p>
                    <p className="text-xs text-gray-600">Aktive Fälle</p>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    Erstellt: {person.createdAt ?
                      new Date(person.createdAt).toLocaleDateString('de-DE') :
                      'Unbekannt'
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAnsprechpartner.length === 0 && (
          <div className="text-center py-12">
            <UserCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Ansprechpartner gefunden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Fügen Sie Ihren ersten Ansprechpartner hinzu'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
} 