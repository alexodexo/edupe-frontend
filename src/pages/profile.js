// src/pages/profile.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { useAuth } from '@/lib/auth'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function Profile() {
  const { user, userRole, userProfile, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (userProfile) {
      setFormData({
        vorname: userProfile.vorname || userProfile.name?.split(' ')[0] || '',
        nachname: userProfile.nachname || userProfile.name?.split(' ').slice(1).join(' ') || '',
        email: userProfile.email || userProfile.mail || user?.email || '',
        jugendamt: userProfile.jugendamt || '',
        telefon: userProfile.telefon || userProfile.phone || ''
      })
    }
  }, [userProfile, user])

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      let response
      
      if (userRole === 'jugendamt_unverifiziert') {
        // Unverifizierte Jugendämter können ihr Profil nicht bearbeiten
        setError('Unverifizierte Jugendämter können ihr Profil nicht bearbeiten')
        return
      } else if (userRole === 'jugendamt') {
        // Update verified Jugendamt profile
        response = await fetch(`/api/ansprechpartner/${userProfile.ansprechpartner_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${formData.vorname} ${formData.nachname}`,
            jugendamt: formData.jugendamt,
            telefon: formData.telefon
          })
        })
      } else if (userRole === 'helper') {
        // Update helper profile
        response = await fetch(`/api/helpers/${userProfile.helfer_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.vorname,
            lastName: formData.nachname,
            phone: formData.telefon
          })
        })
      }

      if (response?.ok) {
        setSuccess('Profil erfolgreich aktualisiert')
        setIsEditing(false)
        // Refresh user data
        window.location.reload()
      } else {
        const errorData = await response?.json()
        throw new Error(errorData?.error || 'Fehler beim Aktualisieren des Profils')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error.message || 'Fehler beim Aktualisieren des Profils')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
    setSuccess('')
    // Reset form data
    if (userProfile) {
      setFormData({
        vorname: userProfile.vorname || userProfile.name?.split(' ')[0] || '',
        nachname: userProfile.nachname || userProfile.name?.split(' ').slice(1).join(' ') || '',
        email: userProfile.email || userProfile.mail || user?.email || '',
        jugendamt: userProfile.jugendamt || '',
        telefon: userProfile.telefon || userProfile.phone || ''
      })
    }
  }

  if (loading) {
    return (
      <Layout>
        <LoadingPage message="Lade Profil..." />
      </Layout>
    )
  }

  if (!user || !userProfile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profil nicht gefunden</h3>
          <p className="text-gray-600">Ihr Profil konnte nicht geladen werden.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Profil - Edupe Digital</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Mein Profil</h1>
            <p className="text-gray-600 mt-1">Verwalten Sie Ihre persönlichen Informationen</p>
          </div>
          {!isEditing && userRole !== 'jugendamt_unverifiziert' && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              <PencilIcon className="w-5 h-5" />
              Bearbeiten
            </button>
          )}
        </div>

        {/* Status Banner for unverified Jugendamt */}
        {userRole === 'jugendamt_unverifiziert' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  Account wartet auf Verifizierung
                </h3>
                <p className="text-yellow-700 mb-4">
                  Ihr Account wurde erfolgreich registriert, wartet jedoch noch auf die Verifizierung durch einen Administrator. 
                  Sobald Ihr Account verifiziert wurde, erhalten Sie vollen Zugriff auf alle Funktionen.
                </p>
                <div className="text-sm text-yellow-600">
                  <p>• Sie können Ihr Profil einsehen</p>
                  <p>• Sie haben noch keinen Zugriff auf Fälle oder andere Funktionen</p>
                  <p>• Ein Administrator wird Ihren Account in Kürze überprüfen</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <XMarkIcon className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vorname
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.vorname}
                  onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                  className="input"
                  placeholder="Vorname"
                />
              ) : (
                <p className="text-gray-900">{formData.vorname || 'Nicht angegeben'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nachname
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nachname}
                  onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                  className="input"
                  placeholder="Nachname"
                />
              ) : (
                <p className="text-gray-900">{formData.nachname || 'Nicht angegeben'}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail-Adresse
              </label>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                <p className="text-gray-900">{formData.email}</p>
              </div>
              <p className="text-sm text-gray-500 mt-1">E-Mail-Adresse kann nicht geändert werden</p>
            </div>

            {/* Role-specific fields */}
            {(userRole === 'jugendamt' || userRole === 'jugendamt_unverifiziert') && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jugendamt
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.jugendamt}
                      onChange={(e) => setFormData({ ...formData, jugendamt: e.target.value })}
                      className="input"
                      placeholder="Jugendamt"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-900">{formData.jugendamt || 'Nicht angegeben'}</p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefonnummer
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.telefon}
                      onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                      className="input"
                      placeholder="Telefonnummer"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-900">{formData.telefon || 'Nicht angegeben'}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Helper-specific fields */}
            {userRole === 'helper' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefonnummer
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                    className="input"
                    placeholder="Telefonnummer"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <p className="text-gray-900">{formData.telefon || 'Nicht angegeben'}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="btn-secondary"
              >
                Abbrechen
              </button>
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account-Informationen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
              <p className="text-gray-900 capitalize">
                {userRole === 'jugendamt_unverifiziert' ? 'Jugendamt (unverifiziert)' : userRole}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account erstellt</label>
              <p className="text-gray-900">
                {userProfile.createdAt || userProfile.erstellt_am ? 
                  new Date(userProfile.createdAt || userProfile.erstellt_am).toLocaleDateString('de-DE') : 
                  'Unbekannt'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 