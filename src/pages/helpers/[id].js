// src/pages/helpers/[id].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useHelper } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import {
  ArrowLeftIcon,
  StarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  PencilIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import {
  HELPER_AVAILABILITY,
  formatCurrency,
  formatDateTime
} from '@/lib/types'

export default function HelperDetail() {
  const router = useRouter()
  const { id } = router.query
  const { hasPermission } = useAuth()
  const { helper, isLoading, error, refresh } = useHelper(id)
  const { success, error: showError } = useNotifications()

  const [activeTab, setActiveTab] = useState('overview')

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case HELPER_AVAILABILITY.AVAILABLE:
        return 'bg-green-100 text-green-800 border-green-200'
      case HELPER_AVAILABILITY.PARTIALLY_AVAILABLE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case HELPER_AVAILABILITY.UNAVAILABLE:
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
        <LoadingPage message="Lade Helfer-Details..." />
      </Layout>
    )
  }

  if (error || !helper) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Helfer nicht gefunden</h3>
          <p className="text-red-600 mb-4">
            {error?.message || 'Der angeforderte Helfer konnte nicht gefunden werden.'}
          </p>
          <Link href="/helpers" className="btn-primary">
            Zurück zur Übersicht
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{helper.firstName} {helper.lastName} - Helfer Details - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header mit Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link 
            href="/helpers" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Zurück zu Helfer</span>
          </Link>
        </div>

        {/* Helfer Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-semibold text-white">
                    {helper.firstName[0]}{helper.lastName[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white mb-1">
                    {helper.firstName} {helper.lastName}
                  </h1>
                  <p className="text-blue-100 mb-3">{helper.email}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-yellow-300 fill-current" />
                      <span className="text-white font-medium">{helper.rating}</span>
                      <span className="text-blue-200">({helper.totalCases} Fälle)</span>
                    </div>
                    <span className={`badge border ${getAvailabilityColor(helper.availability)} text-sm`}>
                      {helper.availability === HELPER_AVAILABILITY.AVAILABLE ? 'Verfügbar' :
                        helper.availability === HELPER_AVAILABILITY.PARTIALLY_AVAILABLE ? 'Teilweise verfügbar' :
                          'Nicht verfügbar'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getComplianceIcon(helper.complianceStatus)}
                {hasPermission('edit_helpers') && (
                  <Link 
                    href={`/helpers/${helper.id}/edit`}
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
                <p className="text-2xl font-semibold text-blue-600">{helper.activeCases}</p>
                <p className="text-sm text-gray-600">Aktive Fälle</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-600">{helper.totalHours}</p>
                <p className="text-sm text-gray-600">Stunden gesamt</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-yellow-600">{helper.thisMonthHours}</p>
                <p className="text-sm text-gray-600">Stunden/Monat</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-purple-600">
                  {formatCurrency(helper.thisMonthRevenue)}
                </p>
                <p className="text-sm text-gray-600">Umsatz/Monat</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <div className="flex space-x-8 border-b border-gray-200">
              {[
                { id: 'overview', label: 'Übersicht', icon: UserGroupIcon },
                { id: 'documents', label: 'Dokumente', icon: DocumentCheckIcon },
                { id: 'statistics', label: 'Statistiken', icon: ChartBarIcon },
                { id: 'activities', label: 'Aktivitäten', icon: ClockIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
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
              {/* Personal Info */}
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <IdentificationIcon className="w-5 h-5" />
                    Persönliche Informationen
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600">Stundensatz:</span>
                      <p className="font-medium text-lg">{formatCurrency(helper.hourlyRate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Mitglied seit:</span>
                      <p className="font-medium">
                        {new Date(helper.createdAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Letzte Aktivität:</span>
                      <p className="font-medium">
                        {helper.lastActivity ? 
                          new Date(helper.lastActivity).toLocaleDateString('de-DE') : 
                          'Unbekannt'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <EnvelopeIcon className="w-5 h-5" />
                    Kontaktdaten
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{helper.email}</p>
                        <p className="text-sm text-gray-600">E-Mail</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{helper.phone}</p>
                        <p className="text-sm text-gray-600">Telefon</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium">
                          {helper.address.street}<br />
                          {helper.address.zipCode} {helper.address.city}
                        </p>
                        <p className="text-sm text-gray-600">Adresse</p>
                      </div>
                    </div>
                  </div>
                </div>

                {helper.bankDetails && (
                  <div className="card p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Bankdaten</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">IBAN:</span>
                        <p className="font-mono text-sm mt-1 bg-gray-50 p-2 rounded">
                          {helper.bankDetails.iban}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">BIC:</span>
                        <p className="font-mono text-sm mt-1 bg-gray-50 p-2 rounded">
                          {helper.bankDetails.bic}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Qualifications */}
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Qualifikationen</h3>
                  <div className="flex flex-wrap gap-2">
                    {helper.qualifications.map((qualification, index) => (
                      <span key={index} className="badge badge-blue">
                        {qualification}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DocumentCheckIcon className="w-5 h-5" />
                    Dokumente
                    <div className="ml-auto">
                      {getComplianceIcon(helper.complianceStatus)}
                    </div>
                  </h3>
                  <div className="space-y-3">
                    {helper.documents?.map((doc, index) => {
                      const isExpired = new Date(doc.validUntil) < new Date()
                      const isExpiringSoon = new Date(doc.validUntil) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

                      return (
                        <div key={index} className={`p-4 rounded-lg border-2 ${
                          isExpired ? 'border-red-200 bg-red-50' :
                          isExpiringSoon ? 'border-yellow-200 bg-yellow-50' :
                          'border-green-200 bg-green-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{doc.type}</p>
                              <p className="text-sm text-gray-600">
                                Gültig bis: {new Date(doc.validUntil).toLocaleDateString('de-DE')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.verified && <ShieldCheckIcon className="w-5 h-5 text-green-600" />}
                              <DocumentCheckIcon className={`w-5 h-5 ${
                                isExpired ? 'text-red-600' :
                                isExpiringSoon ? 'text-yellow-600' :
                                'text-green-600'
                              }`} />
                            </div>
                          </div>
                        </div>
                      )
                    }) || [
                      <div key="no-docs" className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                        <p className="text-gray-600">Keine Dokumente hinterlegt</p>
                      </div>
                    ]}
                  </div>
                </div>
              </div>


              {/* Actions */}
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Aktionen</h3>
                  <div className="space-y-3">
                    <button className="btn-primary w-full justify-center">
                      <ClockIcon className="w-5 h-5" />
                      Fall zuweisen
                    </button>
                    <button className="btn-secondary w-full justify-center">
                      <CalendarIcon className="w-5 h-5" />
                      Verfügbarkeit ändern
                    </button>
                    <button className="btn-secondary w-full justify-center">
                      <CurrencyEuroIcon className="w-5 h-5" />
                      Stundensatz anpassen
                    </button>
                    <button className="btn-secondary w-full justify-center">
                      <IdentificationIcon className="w-5 h-5" />
                      Profil bearbeiten
                    </button>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Erweiterte Statistiken</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Erfolgsquote:</span>
                      <span className="font-semibold">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Durchschnittliche Bewertung:</span>
                      <span className="font-semibold">{helper.rating}/5.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Wiederkehrende Kunden:</span>
                      <span className="font-semibold">78%</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'documents' && (
            <div className="lg:col-span-3">
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Alle Dokumente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {helper.documents?.map((doc, index) => {
                    const isExpired = new Date(doc.validUntil) < new Date()
                    const isExpiringSoon = new Date(doc.validUntil) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

                    return (
                      <div key={index} className={`p-4 rounded-lg border-2 ${
                        isExpired ? 'border-red-200 bg-red-50' :
                        isExpiringSoon ? 'border-yellow-200 bg-yellow-50' :
                        'border-green-200 bg-green-50'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium">{doc.type}</h4>
                          <div className="flex items-center gap-1">
                            {doc.verified && <ShieldCheckIcon className="w-4 h-4 text-green-600" />}
                            <DocumentCheckIcon className={`w-4 h-4 ${
                              isExpired ? 'text-red-600' :
                              isExpiringSoon ? 'text-yellow-600' :
                              'text-green-600'
                            }`} />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Gültig bis: {new Date(doc.validUntil).toLocaleDateString('de-DE')}
                        </p>
                        <div className="flex gap-2">
                          <button className="btn-secondary text-xs">Ansehen</button>
                          <button className="btn-secondary text-xs">Download</button>
                        </div>
                      </div>
                    )
                  }) || [
                    <div key="no-docs" className="lg:col-span-3 text-center py-8">
                      <DocumentCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Keine Dokumente hinterlegt</p>
                    </div>
                  ]}
                </div>
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
                    ? 'Hier werden detaillierte Statistiken angezeigt...' 
                    : 'Hier wird der Aktivitätenverlauf angezeigt...'
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