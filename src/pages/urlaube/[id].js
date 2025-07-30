// src/pages/urlaube/[id].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function VacationDetail() {
  const router = useRouter()
  const { id } = router.query
  const { userRole, hasPermission, userProfile } = useAuth()
  
  const [vacation, setVacation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch vacation data
  useEffect(() => {
    if (!id) return

    const fetchVacation = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/urlaube/${id}`)
        
        if (!response.ok) {
          throw new Error('Urlaub nicht gefunden')
        }
        
        const data = await response.json()
        setVacation(data)
        setEditForm({
          von_datum: data.fromDate,
          bis_datum: data.toDate,
          vertretung: data.substitute?.id || '',
          notiz: data.note || ''
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVacation()
  }, [id])

  const handleUpdateVacation = async (e) => {
    e.preventDefault()
    
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/urlaube/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Aktualisieren')
      }

      const updatedVacation = await response.json()
      setVacation(updatedVacation)
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating vacation:', err)
      alert(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleApproveVacation = async () => {
    if (!confirm('Möchten Sie diesen Urlaubsantrag genehmigen?')) return

    try {
      const response = await fetch(`/api/urlaube/${id}/approve`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Fehler beim Genehmigen')
      }

      // Refresh vacation data
      const updatedVacation = await response.json()
      setVacation(updatedVacation)
    } catch (err) {
      console.error('Error approving vacation:', err)
      alert(err.message)
    }
  }

  const handleRejectVacation = async () => {
    if (!confirm('Möchten Sie diesen Urlaubsantrag ablehnen?')) return

    try {
      const response = await fetch(`/api/urlaube/${id}/reject`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Fehler beim Ablehnen')
      }

      // Refresh vacation data
      const updatedVacation = await response.json()
      setVacation(updatedVacation)
    } catch (err) {
      console.error('Error rejecting vacation:', err)
      alert(err.message)
    }
  }

  const handleDeleteVacation = async () => {
    if (!confirm('Möchten Sie diesen Urlaubsantrag wirklich löschen?')) return

    try {
      const response = await fetch(`/api/urlaube/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Fehler beim Löschen')
      }

      router.push('/urlaube')
    } catch (err) {
      console.error('Error deleting vacation:', err)
      alert(err.message)
    }
  }

  const getStatusColor = (approved) => {
    return approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  const getStatusIcon = (approved) => {
    return approved ? (
      <CheckCircleIcon className="w-6 h-6 text-green-600" />
    ) : (
      <ClockIcon className="w-6 h-6 text-yellow-600" />
    )
  }

  // Check permissions
  if (!hasPermission('view_vacations')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Berechtigung</h3>
          <p className="text-gray-600">Sie haben keine Berechtigung, Urlaube zu verwalten.</p>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <LoadingPage message="Lade Urlaubsdetails..." />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-900 mb-2">Fehler beim Laden</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.push('/urlaube')} className="btn-primary">
            Zurück zur Übersicht
          </button>
        </div>
      </Layout>
    )
  }

  if (!vacation) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Urlaub nicht gefunden</h3>
          <p className="text-gray-600 mb-4">Der angeforderte Urlaubsantrag existiert nicht.</p>
          <button onClick={() => router.push('/urlaube')} className="btn-primary">
            Zurück zur Übersicht
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Urlaubsdetails - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/urlaube')}
              className="btn-secondary"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Zurück
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Urlaubsdetails</h1>
              <p className="text-gray-600 mt-1">
                {vacation.helper.firstName} {vacation.helper.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!vacation.approved && hasPermission('approve_vacations') && (
              <>
                <button
                  onClick={handleApproveVacation}
                  className="btn-primary"
                >
                  <CheckIcon className="w-5 h-5" />
                  Genehmigen
                </button>
                <button
                  onClick={handleRejectVacation}
                  className="btn-secondary"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Ablehnen
                </button>
              </>
            )}
            
            {hasPermission('edit_vacations') && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary"
              >
                <PencilIcon className="w-5 h-5" />
                {isEditing ? 'Abbrechen' : 'Bearbeiten'}
              </button>
            )}

            {hasPermission('delete_vacations') && (
              <button
                onClick={handleDeleteVacation}
                className="btn-danger"
              >
                <TrashIcon className="w-5 h-5" />
                Löschen
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {getStatusIcon(vacation.approved)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {vacation.approved ? 'Genehmigt' : 'Ausstehend'}
              </h3>
              <p className="text-gray-600">
                {vacation.approved ? 'Urlaubsantrag wurde genehmigt' : 'Wartet auf Genehmigung'}
              </p>
            </div>
          </div>
          <span className={`badge ${getStatusColor(vacation.approved)}`}>
            {vacation.approved ? 'Genehmigt' : 'Ausstehend'}
          </span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vacation Details */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Urlaubsdetails</h3>
              
              {isEditing ? (
                <form onSubmit={handleUpdateVacation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Von Datum
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.von_datum}
                      onChange={(e) => setEditForm({ ...editForm, von_datum: e.target.value })}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bis Datum
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.bis_datum}
                      onChange={(e) => setEditForm({ ...editForm, bis_datum: e.target.value })}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notiz
                    </label>
                    <textarea
                      value={editForm.notiz}
                      onChange={(e) => setEditForm({ ...editForm, notiz: e.target.value })}
                      rows={3}
                      className="input w-full"
                      placeholder="Zusätzliche Informationen..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary flex-1"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="btn-primary flex-1"
                    >
                      {isUpdating ? 'Speichere...' : 'Speichern'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Zeitraum</p>
                      <p className="text-gray-900">
                        {new Date(vacation.fromDate).toLocaleDateString('de-DE')} - {new Date(vacation.toDate).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dauer</p>
                      <p className="text-gray-900">{vacation.days} Tage</p>
                    </div>
                  </div>

                  {vacation.note && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Notiz</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {vacation.note}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Substitute */}
            {vacation.substitute && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vertretung</h3>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {vacation.substitute.firstName} {vacation.substitute.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{vacation.substitute.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Employee Info & Timeline */}
          <div className="space-y-8">
            {/* Employee Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mitarbeiter</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-semibold text-blue-600">
                    {vacation.helper.firstName[0]}{vacation.helper.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {vacation.helper.firstName} {vacation.helper.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{vacation.helper.email}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitäten</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Urlaubsantrag erstellt</p>
                    <p className="text-xs text-gray-600">
                      {new Date(vacation.createdAt).toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>

                {vacation.approved && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Urlaubsantrag genehmigt</p>
                      <p className="text-xs text-gray-600">
                        {new Date(vacation.updatedAt || vacation.createdAt).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                )}

                {vacation.updatedAt && vacation.updatedAt !== vacation.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Zuletzt aktualisiert</p>
                      <p className="text-xs text-gray-600">
                        {new Date(vacation.updatedAt).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 