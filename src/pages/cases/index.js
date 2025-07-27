// src/pages/cases/index.js
import { useState, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useCases, useHelpers } from '@/hooks/useData'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CurrencyEuroIcon,
  MapPinIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PauseIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { 
  CASE_STATUS,
  formatCurrency,
  formatDateTime
} from '@/lib/types'

export default function Cases() {
  const router = useRouter()
  const { userRole, userProfile, hasPermission } = useAuth()
  const { cases, isLoading: casesLoading, error: casesError, refresh: refreshCases } = useCases()
  const { helpers, isLoading: helpersLoading } = useHelpers()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    priority: 'all',
    jugendamt: 'all'
  })

  // Filter cases based on search and filters
  const filteredCases = useMemo(() => {
    if (!cases) return []
    
    return cases.filter(case_ => {
      const matchesSearch = 
        case_.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (case_.client?.school && case_.client.school.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = selectedFilters.status === 'all' || case_.status === selectedFilters.status
      const matchesPriority = selectedFilters.priority === 'all' || case_.priority === selectedFilters.priority

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [cases, searchTerm, selectedFilters])

  const handleCaseClick = (caseId) => {
    router.push(`/cases/${caseId}`)
  }

  const handleAddCaseClick = () => {
    router.push('/cases/new')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case CASE_STATUS.IN_BEARBEITUNG:
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case CASE_STATUS.WARTEND:
        return <PauseIcon className="w-5 h-5 text-yellow-600" />
      case CASE_STATUS.ABGESCHLOSSEN:
        return <CheckCircleIcon className="w-5 h-5 text-blue-600" />
      case CASE_STATUS.OFFEN:
        return <ClockIcon className="w-5 h-5 text-orange-600" />
      default:
        return <XMarkIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Check permissions
  if (!hasPermission('view_cases')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Fälle zu verwalten.</p>
        </div>
      </Layout>
    )
  }

  if (casesLoading || helpersLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Fälle..." />
      </Layout>
    )
  }

  if (casesError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Fehler beim Laden</h3>
          <p className="text-red-600 mb-4">{casesError.message}</p>
          <button onClick={refreshCases} className="btn-primary">
            Erneut versuchen
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Fälle - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Fälle</h1>
            <p className="text-gray-600 mt-1">Verwaltung aller Betreuungsfälle</p>
          </div>
          {hasPermission('create_cases') && (
            <button 
              onClick={handleAddCaseClick}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5" />
              Neuer Fall
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
                placeholder="Fall suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select 
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
                className="input w-auto min-w-[120px]"
              >
                <option value="all">Alle Status</option>
                <option value={CASE_STATUS.OFFEN}>Offen</option>
                <option value={CASE_STATUS.IN_BEARBEITUNG}>In Bearbeitung</option>
                <option value={CASE_STATUS.WARTEND}>Wartend</option>
                <option value={CASE_STATUS.ABGESCHLOSSEN}>Abgeschlossen</option>
              </select>
              
              <select 
                value={selectedFilters.priority}
                onChange={(e) => setSelectedFilters({...selectedFilters, priority: e.target.value})}
                className="input w-auto min-w-[120px]"
              >
                <option value="all">Alle Prioritäten</option>
                <option value="urgent">Dringend</option>
                <option value="high">Hoch</option>
                <option value="medium">Mittel</option>
                <option value="low">Niedrig</option>
              </select>

              <button className="btn-secondary">
                <FunnelIcon className="w-5 h-5" />
                Weitere Filter
              </button>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredCases.map((case_) => {
            const helper = helpers?.find(h => case_.assignedHelpers?.includes(h.id))
            const progressPercentage = case_.plannedHours > 0 ? (case_.usedHours / case_.plannedHours) * 100 : 0

            return (
              <div 
                key={case_.id} 
                className="card card-hover cursor-pointer relative group"
                onClick={() => handleCaseClick(case_.id)}
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <EyeIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(case_.status)}
                        <span className="text-sm font-medium text-gray-600">
                          {case_.caseNumber}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{case_.title}</h3>
                      <p className="text-sm text-gray-600">{case_.client?.school}</p>
                    </div>
                    {case_.priority && (
                      <span className={`badge ${getPriorityColor(case_.priority)}`}>
                        {case_.priority}
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Fortschritt</span>
                      <span className="font-medium">
                        {case_.usedHours || 0}h / {case_.plannedHours || 0}h
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserIcon className="w-4 h-4" />
                      <span>{helper?.firstName} {helper?.lastName || 'Kein Helfer zugewiesen'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Seit {new Date(case_.createdAt).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CurrencyEuroIcon className="w-4 h-4" />
                      <span>{formatCurrency(case_.totalCosts || 0)}</span>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Letzte Aktivität: {formatDateTime(case_.lastActivity || case_.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Fälle gefunden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Erstellen Sie Ihren ersten Fall'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}