// src/pages/cases/[id].js
import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'

import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useCase, useHelpers, useServices } from '@/hooks/useData'

import {
  ArrowLeftIcon,
  UserIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PauseIcon,
  StarIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import {
  CASE_STATUS,
  SERVICE_TYPES,
  formatCurrency,
  formatDateTime,
  formatDuration
} from '@/lib/types'

export default function CaseDetail() {
  const router = useRouter()
  const { id } = router.query
  const { hasPermission } = useAuth()
  const { case: caseData, isLoading, error } = useCase(id)
  const { helpers } = useHelpers()
  const { services } = useServices()

  const [activeTab, setActiveTab] = useState('overview')

  // Get services for this case
  const caseServices = useMemo(() => {
    if (!caseData || !services) return []
    return services.filter(service => service.caseId === caseData.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [caseData, services])

  // Get last service for travel time validation
  const lastService = useMemo(() => {
    if (caseServices.length === 0) return null
    return caseServices[0] // Most recent service
  }, [caseServices])

  // Get assigned helper
  const assignedHelper = useMemo(() => {
    if (!caseData || !helpers) return null
    return helpers.find(helper => 
      caseData.assignedHelpers && caseData.assignedHelpers.includes(helper.id)
    )
  }, [caseData, helpers])



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
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getServiceTypeIcon = (type) => {
    switch (type) {
      case SERVICE_TYPES.WITH_CLIENT_FACE_TO_FACE:
        return <UserIcon className="w-4 h-4" />
      case SERVICE_TYPES.WITH_CLIENT_REMOTE:
        return <UserIcon className="w-4 h-4" />
      default:
        return <BuildingOfficeIcon className="w-4 h-4" />
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

  if (isLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Fall-Details..." />
      </Layout>
    )
  }

  if (error || !caseData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Fall nicht gefunden</h3>
          <p className="text-red-600 mb-4">
            {error?.message || 'Der angeforderte Fall konnte nicht gefunden werden.'}
          </p>
          <Link href="/cases" className="btn-primary">
            Zurück zur Übersicht
          </Link>
        </div>
      </Layout>
    )
  }

  const progressPercentage = caseData.plannedHours > 0 ? (caseData.usedHours / caseData.plannedHours) * 100 : 0

  return (
    <Layout>
      <Head>
        <title>{caseData.title} - Fall Details - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header mit Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link 
            href="/cases" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Zurück zu Fälle</span>
          </Link>
        </div>

        {/* Case Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-semibold text-white">
                    {caseData.client?.firstName?.[0]}{caseData.client?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white mb-1">
                    {caseData.title}
                  </h1>
                  <p className="text-purple-100 mb-3">{caseData.caseNumber}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(caseData.status)}
                      <span className="text-white font-medium">{caseData.status}</span>
                    </div>
                    {caseData.priority && (
                      <span className={`badge border ${getPriorityColor(caseData.priority)} text-sm`}>
                        {caseData.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {assignedHelper && (
                  <Link
                    href={`/cases/${caseData.id}/service/new`}
                    className="btn bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <ClockIcon className="w-5 h-5" />
                    Leistung buchen
                  </Link>
                )}
                {hasPermission('edit_cases') && (
                  <Link 
                    href={`/cases/${caseData.id}/edit`}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-semibold text-purple-600">{caseData.usedHours || 0}h</p>
                <p className="text-sm text-gray-600">Geleistete Stunden</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-600">{caseData.plannedHours || 0}h</p>
                <p className="text-sm text-gray-600">Geplante Stunden</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-blue-600">{caseServices.length}</p>
                <p className="text-sm text-gray-600">Services</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-orange-600">
                  {formatCurrency(caseData.totalCosts || 0)}
                </p>
                <p className="text-sm text-gray-600">Gesamtkosten</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Fortschritt</span>
              <span className="font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <div className="flex space-x-8 border-b border-gray-200">
              {[
                { id: 'overview', label: 'Übersicht', icon: UserIcon },
                { id: 'services', label: 'Services', icon: ClockIcon },
                { id: 'statistics', label: 'Statistiken', icon: ChartBarIcon },
                { id: 'documents', label: 'Dokumente', icon: DocumentTextIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'overview' && (
            <>
              {/* Client Info */}
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Klient-Informationen
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium text-lg">
                        {caseData.client?.firstName} {caseData.client?.lastName}
                      </p>
                    </div>
                    {caseData.client?.birthDate && (
                      <div>
                        <span className="text-sm text-gray-600">Geburtsdatum:</span>
                        <p className="font-medium">
                          {new Date(caseData.client.birthDate).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600">Schule/Kita:</span>
                      <p className="font-medium">{caseData.client?.school || 'Nicht angegeben'}</p>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5" />
                    Adresse
                  </h3>
                  <div>
                    <p className="font-medium">{caseData.client?.address || 'Keine Adresse hinterlegt'}</p>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UsersIcon className="w-5 h-5" />
                    Zugewiesener Helfer
                  </h3>
                  {assignedHelper ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {assignedHelper.firstName[0]}{assignedHelper.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{assignedHelper.firstName} {assignedHelper.lastName}</p>
                        <p className="text-sm text-gray-600">{assignedHelper.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Kein Helfer zugewiesen</p>
                  )}
                </div>
              </div>

              {/* Case Details */}
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Fall-Informationen</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600">Aktenzeichen:</span>
                      <p className="font-medium">{caseData.caseNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(caseData.status)}
                        <span className="font-medium">{caseData.status}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Erstellt am:</span>
                      <p className="font-medium">
                        {new Date(caseData.createdAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Letzte Aktivität:</span>
                      <p className="font-medium">
                        {formatDateTime(caseData.lastActivity || caseData.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Erstkontakt-Notizen</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {caseData.description || 'Keine Notizen verfügbar'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Aktionen</h3>
                  <div className="space-y-3">
                    {assignedHelper && (
                      <Link
                        href={`/cases/${caseData.id}/service/new`}
                        className="btn-primary w-full justify-center"
                      >
                        <ClockIcon className="w-5 h-5" />
                        Leistung buchen
                      </Link>
                    )}
                    <Link href={`/cases/${caseData.id}/edit`} className="btn-secondary w-full justify-center">
                      <PencilIcon className="w-5 h-5" />
                      Fall bearbeiten
                    </Link>
                    <button className="btn-secondary w-full justify-center">
                      <DocumentTextIcon className="w-5 h-5" />
                      Bericht erstellen
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'services' && (
            <div className="lg:col-span-3">
              <div className="card">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Geleistete Services</h3>
                </div>
                <div className="max-h-96 overflow-auto">
                  {caseServices.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {caseServices.map((service) => (
                        <div key={service.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getServiceTypeIcon(service.type)}
                              <span className="font-medium text-gray-900">
                                {new Date(service.date).toLocaleDateString('de-DE')}
                              </span>
                              <span className="text-gray-500">
                                {service.startTime} - {service.endTime}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {formatDuration(service.duration)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(service.costs)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{service.description}</p>
                          {service.activities && service.activities.length > 0 && (
                            <div className="text-xs text-gray-600">
                              <strong>Aktivitäten:</strong>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {service.activities.map((activity, index) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Noch keine Services gebucht</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'statistics' || activeTab === 'documents') && (
            <div className="lg:col-span-3">
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {activeTab === 'statistics' ? 'Detaillierte Statistiken' : 'Dokumente & Berichte'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'statistics' 
                    ? 'Hier werden detaillierte Statistiken angezeigt...' 
                    : 'Hier werden Dokumente und Berichte angezeigt...'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>


    </Layout>
  )
}