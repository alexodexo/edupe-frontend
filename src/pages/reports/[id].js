// src/pages/reports/[id].js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useNotifications } from '@/lib/notifications'
import {
  ArrowLeftIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { formatDateTime, BERICHT_STATUS } from '@/lib/types'
import useSWR from 'swr'

export default function ReportDetail() {
  const router = useRouter()
  const { id } = router.query
  const { userProfile, userRole, hasPermission } = useAuth()
  const { success, error } = useNotifications()
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch report data
  const { data: report, error: reportError, mutate: refreshReport } = useSWR(
    id ? [`/api/reports/${id}`, userProfile?.helfer_id || userProfile?.ansprechpartner_id, userRole] : null,
    async ([url, userId, userRole]) => {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (userRole) params.append('userRole', userRole)
      
      const response = await fetch(`${url}?${params.toString()}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Bericht nicht gefunden')
        }
        throw new Error('Failed to fetch report')
      }
      return response.json()
    },
    {
      revalidateOnFocus: false,
      onError: (err) => error('Fehler beim Laden des Berichts: ' + err.message)
    }
  )

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

  const deleteReport = async () => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Bericht löschen möchten?')) return

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete report')

      success('Bericht wurde erfolgreich gelöscht')
      router.push('/reports')
    } catch (err) {
      error('Fehler beim Löschen des Berichts: ' + err.message)
    }
  }

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/reports/${id}/pdf`)
      if (!response.ok) throw new Error('Failed to download report')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.title}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      success('Bericht wurde heruntergeladen')
    } catch (err) {
      error('Fehler beim Herunterladen: ' + err.message)
    }
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

  if (reportError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Fehler beim Laden</h3>
          <p className="text-red-600 mb-4">{reportError.message}</p>
          <Link href="/reports" className="btn-primary">
            Zurück zu Berichten
          </Link>
        </div>
      </Layout>
    )
  }

  if (!report) {
    return (
      <Layout>
        <LoadingPage message="Lade Bericht..." />
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{report.title} - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/reports" className="btn-secondary">
              <ArrowLeftIcon className="w-5 h-5" />
              Zurück
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(report.status)}
                <h1 className="text-2xl font-semibold text-gray-900">{report.title}</h1>
                <span className={`badge ${getStatusColor(report.status)}`}>
                  {getStatusLabel(report.status)}
                </span>
              </div>
              <p className="text-gray-600">
                Fall {report.case?.caseNumber} - {report.case?.school}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {report.status === BERICHT_STATUS.UEBERMITTELT && report.pdfUrl && (
              <button 
                onClick={downloadReport}
                className="btn-secondary"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Download
              </button>
            )}
            
            {userRole !== 'jugendamt' && report.status === BERICHT_STATUS.ENTWURF && hasPermission('edit_reports') && (
              <Link 
                href={`/reports/${id}/edit`}
                className="btn-secondary"
              >
                <PencilIcon className="w-5 h-5" />
                Bearbeiten
              </Link>
            )}

            {userRole === 'admin' && hasPermission('delete_reports') && (
              <button 
                onClick={deleteReport}
                className="btn-secondary text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="w-5 h-5" />
                Löschen
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inhalt
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Details */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Berichtsdetails</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Fall:</dt>
                  <dd className="font-medium">
                    <Link 
                      href={`/cases/${report.case?.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {report.case?.caseNumber}
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Schule/Kita:</dt>
                  <dd className="font-medium">{report.case?.school || 'Unbekannt'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Erstellt am:</dt>
                  <dd className="font-medium">{formatDateTime(report.createdAt)}</dd>
                </div>
                {report.author && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Erstellt von:</dt>
                    <dd className="font-medium">{report.author.firstName} {report.author.lastName}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-600">Für Jugendamt sichtbar:</dt>
                  <dd className="font-medium">{report.visibleToJugendamt ? 'Ja' : 'Nein'}</dd>
                </div>
              </dl>
            </div>

            {/* Statistics */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistiken</h3>
              <dl className="space-y-3 text-sm">
                {report.serviceCount !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Services:</dt>
                    <dd className="font-medium">{report.serviceCount}</dd>
                  </div>
                )}
                {report.totalHours !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Stunden:</dt>
                    <dd className="font-medium">{report.totalHours}h</dd>
                  </div>
                )}
                {report.wordCount && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Wörter:</dt>
                    <dd className="font-medium">{report.wordCount.toLocaleString('de-DE')}</dd>
                  </div>
                )}
                {report.estimatedReadingTime && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Lesezeit:</dt>
                    <dd className="font-medium">{report.estimatedReadingTime} Min</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Berichtsinhalt</h3>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {report.content || 'Kein Inhalt verfügbar.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 