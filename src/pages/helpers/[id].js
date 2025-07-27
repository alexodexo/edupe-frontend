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
import DocumentUpload from '@/components/DocumentUpload'
import DocumentList from '@/components/DocumentList'
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
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import {
  HELPER_AVAILABILITY,
  formatCurrency,
  formatDateTime
} from '@/lib/types'

export default function HelperDetail() {
  const router = useRouter()
  const { id } = router.query
  const { hasPermission, user } = useAuth()
  const { helper, isLoading, error, refresh } = useHelper(id)
  const { success, error: showError } = useNotifications()

  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)

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
                    Dokumente (Übersicht)
                    <div className="ml-auto">
                      {getComplianceIcon(helper.complianceStatus)}
                    </div>
                  </h3>
                  <div className="text-sm text-gray-600 mb-3">
                    <p>
                      Für detaillierte Dokumentenverwaltung wechseln Sie zum 
                      <button 
                        onClick={() => setActiveTab('documents')}
                        className="text-blue-600 hover:text-blue-800 font-medium ml-1"
                      >
                        Dokumente-Tab
                      </button>
                    </p>
                  </div>
                  <DocumentList 
                    helperId={id}
                    userRole={user?.role || 'admin'}
                    compactView={true}
                    maxItems={3}
                    onDocumentDeleted={(filePath) => {
                      success('Dokument erfolgreich gelöscht')
                    }}
                    onDocumentError={(error) => {
                      showError(error)
                    }}
                  />
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Alle Dokumente</h3>
                  {hasPermission('edit_helpers') && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Dokument hochladen
                    </button>
                  )}
                </div>
                
                <DocumentList 
                  helperId={id}
                  userRole={user?.role || 'admin'}
                  onDocumentDeleted={(filePath) => {
                    success('Dokument erfolgreich gelöscht')
                  }}
                  onDocumentError={(error) => {
                    showError(error)
                  }}
                />
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Dokument hochladen
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <DocumentUpload
              helperId={id}
              userRole={user?.role || 'admin'}
              onUploadSuccess={(document) => {
                success('Dokument erfolgreich hochgeladen')
                setShowUploadModal(false)
                // Refresh the document list
                window.location.reload()
              }}
              onUploadError={(error) => {
                showError(error)
              }}
            />
          </div>
        </div>
      )}
    </Layout>
  )
}