// src/pages/reports/index.js
import { useState, useMemo, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { useAuth } from '@/lib/auth'
import { useNotifications } from '@/lib/notifications'
import { 
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { formatDateTime, formatCurrency, formatDuration, BERICHT_STATUS } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner, LoadingPage } from '@/components/Loading'
import useSWR from 'swr'

export default function Reports() {
  const router = useRouter()
  const { userProfile, userRole, hasPermission } = useAuth()
  const { success, error } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    type: 'all',
    caseId: 'all'
  })

  // Fetch reports using SWR
  const { data: reports, error: reportsError, mutate: refreshReports } = useSWR(
    ['/api/reports', userProfile?.helfer_id || userProfile?.ansprechpartner_id, userRole],
    async ([url, userId, userRole]) => {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (userRole) params.append('userRole', userRole)
      if (selectedFilters.status !== 'all') params.append('status', selectedFilters.status)
      if (selectedFilters.caseId !== 'all') params.append('caseId', selectedFilters.caseId)
      
      const response = await fetch(`${url}?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      return response.json()
    },
    {
      revalidateOnFocus: false,
      onError: (err) => error('Fehler beim Laden der Berichte: ' + err.message)
    }
  )

  // Fetch cases for filter dropdown
  const { data: cases } = useSWR(
    ['/api/cases', userProfile?.helfer_id || userProfile?.ansprechpartner_id, userRole],
    async ([url, userId, userRole]) => {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (userRole) params.append('userRole', userRole)
      
      const response = await fetch(`${url}?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch cases')
      return response.json()
    }
  )

  // Filter reports
  const filteredReports = useMemo(() => {
    if (!reports) return []
    
    return reports.filter(report => {
      const matchesSearch = 
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.case?.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.case?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.author?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.author?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedFilters.status === 'all' || report.status === selectedFilters.status
      const matchesCase = selectedFilters.caseId === 'all' || report.case?.id === selectedFilters.caseId

      return matchesSearch && matchesStatus && matchesCase
    })
  }, [reports, searchTerm, selectedFilters])

  const getStatusColor = (status) => {
    switch (status) {
      case BERICHT_STATUS.UEBERMITTELT:
        return 'bg-green-100 text-green-800'
      case BERICHT_STATUS.FINAL:
        return 'bg-blue-100 text-blue-800'
      case BERICHT_STATUS.ENTWURF:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case BERICHT_STATUS.UEBERMITTELT:
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case BERICHT_STATUS.FINAL:
        return <DocumentTextIcon className="w-5 h-5 text-blue-600" />
      case BERICHT_STATUS.ENTWURF:
        return <PencilIcon className="w-5 h-5 text-yellow-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case BERICHT_STATUS.UEBERMITTELT:
        return 'Übermittelt'
      case BERICHT_STATUS.FINAL:
        return 'Final'
      case BERICHT_STATUS.ENTWURF:
        return 'Entwurf'
      default:
        return status
    }
  }

  const deleteReport = async (reportId) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Bericht löschen möchten?')) return

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete report')

      success('Bericht wurde erfolgreich gelöscht')
      refreshReports()
    } catch (err) {
      error('Fehler beim Löschen des Berichts: ' + err.message)
    }
  }

  const downloadReport = async (reportId, title) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/pdf`)
      if (!response.ok) throw new Error('Failed to download report')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      success('Bericht wurde heruntergeladen')
    } catch (err) {
      error('Fehler beim Herunterladen: ' + err.message)
    }
  }

  const handleReportClick = (reportId) => {
    router.push(`/reports/${reportId}`)
  }

  const handleNewReportClick = () => {
    router.push('/reports/new')
  }

  const handleEditClick = (reportId, e) => {
    e.stopPropagation()
    router.push(`/reports/${reportId}/edit`)
  }

  // Check permissions
  if (!hasPermission('view_reports')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Berichte zu verwalten.</p>
        </div>
      </Layout>
    )
  }

  if (reportsError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fehler beim Laden der Berichte</h3>
          <p className="text-gray-600">{reportsError.message}</p>
        </div>
      </Layout>
    )
  }

  if (!reports) {
    return (
      <Layout>
        <LoadingPage message="Lade Berichte..." />
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Berichte - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Berichte</h1>
            <p className="text-gray-600 mt-1">
              {userRole === 'jugendamt' ? 'Berichte für Ihre Fälle' : 'Erstellen und verwalten Sie Berichte'}
            </p>
          </div>
          {userRole !== 'jugendamt' && hasPermission('create_reports') && (
            <button 
              onClick={handleNewReportClick}
              className="btn-primary"
            >
              <PlusIcon className="w-5 h-5" />
              Neuen Bericht erstellen
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
                placeholder="Berichte suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select 
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
                className="input w-auto min-w-[150px]"
              >
                <option value="all">Alle Status</option>
                <option value={BERICHT_STATUS.ENTWURF}>Entwurf</option>
                <option value={BERICHT_STATUS.FINAL}>Final</option>
                <option value={BERICHT_STATUS.UEBERMITTELT}>Übermittelt</option>
              </select>
              
              {cases && (
                <select 
                  value={selectedFilters.caseId}
                  onChange={(e) => setSelectedFilters({...selectedFilters, caseId: e.target.value})}
                  className="input w-auto min-w-[150px]"
                >
                  <option value="all">Alle Fälle</option>
                  {cases.map(case_ => (
                    <option key={case_.id} value={case_.id}>
                      {case_.caseNumber} - {case_.title}
                    </option>
                  ))}
                </select>
              )}

              <button className="btn-secondary">
                <FunnelIcon className="w-5 h-5" />
                Weitere Filter
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div 
              key={report.id} 
              className="card card-hover cursor-pointer relative group"
              onClick={() => handleReportClick(report.id)}
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(report.status)}
                      <h3 className="font-semibold text-gray-900 truncate">{report.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Fall {report.case?.caseNumber} • {report.case?.school || 'Unbekannt'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                      {report.visibleToJugendamt && (
                        <span className="badge badge-blue">
                          Für Jugendamt sichtbar
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {(report.serviceCount || report.totalHours) && (
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{report.serviceCount || 0}</p>
                      <p className="text-xs text-gray-600">Services</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{report.totalHours || 0}h</p>
                      <p className="text-xs text-gray-600">Stunden</p>
                    </div>
                  </div>
                )}

                {/* Author & Date */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  {report.author && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span>{report.author.firstName} {report.author.lastName}</span>
                    </div>
                  )}
                  <span>{formatDateTime(report.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReportClick(report.id)
                    }}
                    className="btn-secondary flex-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Ansehen
                  </button>
                  
                  {report.status === BERICHT_STATUS.UEBERMITTELT && report.pdfUrl && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadReport(report.id, report.title)
                      }}
                      className="btn-secondary flex-1"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </button>
                  )}
                  
                  {userRole !== 'jugendamt' && report.status === BERICHT_STATUS.ENTWURF && hasPermission('edit_reports') && (
                    <button 
                      onClick={(e) => handleEditClick(report.id, e)}
                      className="btn-secondary flex-1"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Bearbeiten
                    </button>
                  )}

                  {userRole === 'admin' && hasPermission('delete_reports') && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteReport(report.id)
                      }}
                      className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berichte gefunden</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Erstellen Sie Ihren ersten Bericht'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
} 