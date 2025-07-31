// src/pages/h/urlaube/[id].js - Helfer Urlaub Detail
import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import HelperLayout from '@/components/HelperLayout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import { useVacation, useDeleteVacation } from '@/hooks/useData'
import { useNotifications } from '@/lib/notifications'
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function HelperVacationDetail() {
  const router = useRouter()
  const { id } = router.query
  const { userRole, hasPermission, userProfile } = useAuth()
  const { vacation, isLoading, error, refresh } = useVacation(id)
  const { deleteVacation, isDeleting } = useDeleteVacation()
  const { success, error: showError } = useNotifications()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Check if this vacation belongs to the current helper
  const isOwnVacation = useMemo(() => {
    return vacation && userProfile?.helfer_id && vacation.helperId === userProfile.helfer_id
  }, [vacation, userProfile])

  const canEdit = useMemo(() => {
    return isOwnVacation && !vacation?.approved && hasPermission('edit_vacations')
  }, [isOwnVacation, vacation, hasPermission])

  const canDelete = useMemo(() => {
    return isOwnVacation && !vacation?.approved && hasPermission('delete_vacations')
  }, [isOwnVacation, vacation, hasPermission])

  const handleDelete = async () => {
    if (!vacation) return

    try {
      await deleteVacation(vacation.id)
      success('Urlaubsantrag wurde erfolgreich gelöscht')
      router.push('/h/urlaube')
    } catch (error) {
      console.error('Error deleting vacation:', error)
      showError('Fehler beim Löschen des Urlaubsantrags')
    }
  }

  const getStatusInfo = (approved) => {
    if (approved) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
        text: 'Genehmigt'
      }
    } else {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <ClockIcon className="h-5 w-5 text-yellow-600" />,
        text: 'Wartend auf Genehmigung'
      }
    }
  }

  // Check permissions
  if (!hasPermission('view_vacations')) {
    return (
      <HelperLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie haben keine Berechtigung, Urlaube anzuzeigen.</p>
          </div>
        </div>
      </HelperLayout>
    )
  }

  if (isLoading) {
    return (
      <HelperLayout>
        <LoadingPage message="Lade Urlaub..." />
      </HelperLayout>
    )
  }

  if (error || !vacation) {
    return (
      <HelperLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-900 mb-2">Fehler beim Laden</h3>
            <p className="text-red-600 mb-4">
              {error?.message || 'Urlaub konnte nicht geladen werden'}
            </p>
            <button 
              onClick={() => router.push('/h/urlaube')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </HelperLayout>
    )
  }

  // Check if user can view this vacation
  if (!isOwnVacation) {
    return (
      <HelperLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
            <p className="text-gray-600">Sie können nur Ihre eigenen Urlaube einsehen.</p>
            <button 
              onClick={() => router.push('/h/urlaube')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Zurück zur Übersicht
            </button>
          </div>
        </div>
      </HelperLayout>
    )
  }

  const statusInfo = getStatusInfo(vacation.approved)

  return (
    <HelperLayout title={`Urlaub ${new Date(vacation.fromDate).toLocaleDateString('de-DE')} - Edupe Digital`}>
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/h/urlaube')}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 mr-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Urlaubsdetails</h1>
                <p className="text-gray-600">
                  {new Date(vacation.fromDate).toLocaleDateString('de-DE')} - {new Date(vacation.toDate).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {canEdit && (
                <button
                  onClick={() => router.push(`/h/urlaube/${vacation.id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Bearbeiten
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Löschen
                </button>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="ml-2 font-medium">{statusInfo.text}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vacation Period */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Urlaubszeitraum</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Von</label>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(vacation.fromDate).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bis</label>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(vacation.toDate).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">
                    Gesamtdauer: {vacation.duration} Tag{vacation.duration !== 1 ? 'e' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Substitute */}
            {vacation.substitute && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Vertretung</h2>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {vacation.substitute.firstName[0]}{vacation.substitute.lastName[0]}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {vacation.substitute.firstName} {vacation.substitute.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{vacation.substitute.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Note */}
            {vacation.note && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Notiz</h2>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{vacation.note}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vacation Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${statusInfo.color.replace('border-', '')}`}>
                    {statusInfo.icon}
                    <span className="ml-2">{statusInfo.text}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Beantragt am</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(vacation.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>

                {vacation.approved && vacation.approvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Genehmigt am</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(vacation.approvedAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Urlaubstage</label>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {vacation.duration}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {(canEdit || canDelete) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktionen</h3>
                
                <div className="space-y-3">
                  {canEdit && (
                    <button
                      onClick={() => router.push(`/h/urlaube/${vacation.id}/edit`)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Löschen
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Urlaub löschen</h3>
                  <p className="text-sm text-gray-600">
                    Sind Sie sicher, dass Sie diesen Urlaubsantrag löschen möchten?
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HelperLayout>
  )
}