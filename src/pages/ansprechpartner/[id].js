// src/pages/ansprechpartner/[id].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useAnsprechpartnerDetail } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  PencilIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function AnsprechpartnerDetail() {
  const router = useRouter()
  const { id } = router.query
  const { hasPermission, user } = useAuth()
  const { ansprechpartner, isLoading, error, refresh } = useAnsprechpartnerDetail(id)
  const { success, error: showError } = useNotifications()

  const [activeTab, setActiveTab] = useState('overview')

  const getCaseStatusColor = (status) => {
    switch (status) {
      case 'in_bearbeitung':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'wartend':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'abgeschlossen':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getCaseStatusText = (status) => {
    switch (status) {
      case 'in_bearbeitung':
        return 'In Bearbeitung'
      case 'wartend':
        return 'Wartend'
      case 'abgeschlossen':
        return 'Abgeschlossen'
      default:
        return status
    }
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
        <LoadingPage message="Lade Ansprechpartner-Details..." />
      </Layout>
    )
  }

  if (error || !ansprechpartner) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Ansprechpartner nicht gefunden</h3>
          <p className="text-red-600 mb-4">
            {error?.message || 'Der angeforderte Ansprechpartner konnte nicht gefunden werden.'}
          </p>
          <Link href="/ansprechpartner" className="btn-primary">
            Zurück zur Übersicht
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{ansprechpartner.name} - Ansprechpartner Details - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header mit Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link 
            href="/ansprechpartner" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Zurück zu Ansprechpartner</span>
          </Link>
        </div>

        {/* Ansprechpartner Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-semibold text-white">
                    {ansprechpartner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white mb-1">
                    {ansprechpartner.name}
                  </h1>
                  <p className="text-purple-100 mb-3">{ansprechpartner.jugendamt}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-5 h-5 text-purple-200" />
                      <span className="text-white">{ansprechpartner.email}</span>
                    </div>
                    {ansprechpartner.phone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-purple-200" />
                        <span className="text-white">{ansprechpartner.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasPermission('edit_ansprechpartner') && (
                  <Link 
                    href={`/ansprechpartner/${ansprechpartner.id}/edit`}
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
                <p className="text-2xl font-semibold text-purple-600">{ansprechpartner.totalCases}</p>
                <p className="text-sm text-gray-600">Fälle gesamt</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-600">{ansprechpartner.activeCases}</p>
                <p className="text-sm text-gray-600">Aktive Fälle</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-yellow-600">
                  {ansprechpartner.totalCases - ansprechpartner.activeCases}
                </p>
                <p className="text-sm text-gray-600">Inaktive Fälle</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-blue-600">
                  {ansprechpartner.createdAt ? 
                    Math.floor((Date.now() - new Date(ansprechpartner.createdAt)) / (1000 * 60 * 60 * 24)) : 0
                  }
                </p>
                <p className="text-sm text-gray-600">Tage aktiv</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <div className="flex space-x-8 border-b border-gray-200">
              {[
                { id: 'overview', label: 'Übersicht', icon: UserGroupIcon },
                { id: 'cases', label: 'Fälle', icon: BriefcaseIcon },
                { id: 'statistics', label: 'Statistiken', icon: ChartBarIcon },
                { id: 'activities', label: 'Aktivitäten', icon: ClockIcon }
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
              {/* Contact Information */}
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <IdentificationIcon className="w-5 h-5" />
                    Kontaktinformationen
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{ansprechpartner.jugendamt}</p>
                        <p className="text-sm text-gray-600">Jugendamt</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{ansprechpartner.email}</p>
                        <p className="text-sm text-gray-600">E-Mail</p>
                      </div>
                    </div>
                    {ansprechpartner.phone && (
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{ansprechpartner.phone}</p>
                          <p className="text-sm text-gray-600">Telefon</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Systemdaten</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Erstellt am:</span>
                      <p className="font-medium">
                        {ansprechpartner.createdAt ? 
                          new Date(ansprechpartner.createdAt).toLocaleDateString('de-DE') : 
                          'Unbekannt'
                        }
                      </p>
                    </div>
                    {ansprechpartner.updatedAt && (
                      <div>
                        <span className="text-sm text-gray-600">Zuletzt aktualisiert:</span>
                        <p className="font-medium">
                          {new Date(ansprechpartner.updatedAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned Cases Overview */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5" />
                    Zugeordnete Fälle ({ansprechpartner.assignedCases?.length || 0})
                  </h3>
                  
                  {ansprechpartner.assignedCases && ansprechpartner.assignedCases.length > 0 ? (
                    <div className="space-y-3">
                      {ansprechpartner.assignedCases.map((case_, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {case_.aktenzeichen}
                            </h4>
                            <span className={`badge text-xs border ${getCaseStatusColor(case_.status)}`}>
                              {getCaseStatusText(case_.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {case_.vorname} {case_.nachname}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Erstellt: {new Date(case_.erstellt_am).toLocaleDateString('de-DE')}</span>
                            {case_.aktualisiert_am && (
                              <span>Aktualisiert: {new Date(case_.aktualisiert_am).toLocaleDateString('de-DE')}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Keine Fälle zugeordnet</h4>
                      <p className="text-gray-600">
                        Diesem Ansprechpartner sind derzeit keine Fälle zugeordnet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'cases' && (
            <div className="lg:col-span-3">
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Alle zugeordneten Fälle</h3>
                
                {ansprechpartner.assignedCases && ansprechpartner.assignedCases.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ansprechpartner.assignedCases.map((case_, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">
                            {case_.aktenzeichen}
                          </h4>
                          <span className={`badge text-xs border ${getCaseStatusColor(case_.status)}`}>
                            {getCaseStatusText(case_.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {case_.vorname} {case_.nachname}
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>Erstellt: {new Date(case_.erstellt_am).toLocaleDateString('de-DE')}</p>
                          {case_.aktualisiert_am && (
                            <p>Aktualisiert: {new Date(case_.aktualisiert_am).toLocaleDateString('de-DE')}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Keine Fälle zugeordnet</h4>
                    <p className="text-gray-600">
                      Diesem Ansprechpartner sind derzeit keine Fälle zugeordnet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab === 'statistics' || activeTab === 'activities') && (
            <div className="lg:col-span-3">
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {activeTab === 'statistics' ? 'Detaillierte Statistiken' : 'Aktivitätenverlauf'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'statistics' 
                    ? 'Hier werden detaillierte Statistiken zu den Fällen und der Arbeitsleistung angezeigt...' 
                    : 'Hier wird der Aktivitätenverlauf des Ansprechpartners angezeigt...'
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