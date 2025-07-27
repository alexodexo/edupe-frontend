// src/pages/settings.js
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { NotificationSettings } from '@/lib/notifications'
import { useAuth } from '@/lib/auth'
import { useNotifications } from '@/lib/notifications'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/Loading'
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CogIcon,
  CurrencyEuroIcon,
  MapPinIcon,
  ClockIcon,
  CloudIcon,
  ArchiveBoxIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { GESCHLECHT, transformToDatabase } from '@/lib/types'

export default function Settings() {
  const { user, userRole, userProfile, hasRole } = useAuth()
  const { success, error } = useNotifications()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)

  // Define available tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'profile', name: 'Profil', icon: UserCircleIcon }
    ]

    if (hasRole('admin')) {
      return [
        ...baseTabs,
        { id: 'company', name: 'Unternehmen', icon: BuildingOfficeIcon },
        { id: 'users', name: 'Benutzer', icon: UserGroupIcon },
        { id: 'notifications', name: 'Benachrichtigungen', icon: BellIcon },
        { id: 'billing', name: 'Abrechnung', icon: CurrencyEuroIcon },
        { id: 'system', name: 'System', icon: CogIcon },
        { id: 'security', name: 'Sicherheit', icon: ShieldCheckIcon },
        { id: 'data', name: 'Datenmanagement', icon: ArchiveBoxIcon },
      ]
    } else if (hasRole('helper')) {
      return [
        ...baseTabs,
        { id: 'notifications', name: 'Benachrichtigungen', icon: BellIcon },
        { id: 'privacy', name: 'Datenschutz', icon: ShieldCheckIcon }
      ]
    } else if (hasRole('jugendamt')) {
      return [
        ...baseTabs,
        { id: 'notifications', name: 'Benachrichtigungen', icon: BellIcon }
      ]
    }

    return baseTabs
  }

  const tabs = getAvailableTabs()

  const handleSave = () => {
    success('Einstellungen wurden erfolgreich gespeichert')
  }

  return (
    <Layout>
      <Head>
        <title>Einstellungen - Edupe Digital</title>
      </Head>

      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Einstellungen</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Systemeinstellungen und Konfiguration</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="card">
              {activeTab === 'profile' && <ProfileSettings onSave={handleSave} />}
              {activeTab === 'company' && hasRole('admin') && <CompanySettings onSave={handleSave} />}
              {activeTab === 'users' && hasRole('admin') && <UserSettings onSave={handleSave} />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'billing' && hasRole('admin') && <BillingSettings onSave={handleSave} />}
              {activeTab === 'system' && hasRole('admin') && <SystemSettings onSave={handleSave} />}
              {activeTab === 'security' && hasRole('admin') && <SecuritySettings onSave={handleSave} />}
              {activeTab === 'data' && hasRole('admin') && <DataSettings onSave={handleSave} />}
              {activeTab === 'privacy' && <PrivacySettings onSave={handleSave} />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Profile Settings Component
function ProfileSettings({ onSave }) {
  const { user, userRole, userProfile, updatePassword } = useAuth()
  const { success, error } = useNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  
  // Initialize form data based on user role
  const getInitialFormData = () => {
    if (userRole === 'helper') {
      return {
        vorname: userProfile?.vorname || '',
        nachname: userProfile?.nachname || '',
        email: userProfile?.email || user?.email || '',
        telefon_nummer: userProfile?.telefon_nummer || '',
        strasse: userProfile?.strasse || '',
        plz: userProfile?.plz || '',
        stadt: userProfile?.stadt || '',
        geburtsdatum: userProfile?.geburtsdatum || '',
        geschlecht: userProfile?.geschlecht || '',
        staatsangehoerigkeit: userProfile?.staatsangehoerigkeit || '',
        religion: userProfile?.religion || '',
        iban: userProfile?.iban || '',
        steuernummer: userProfile?.steuernummer || ''
      }
    } else if (userRole === 'jugendamt') {
      return {
        name: userProfile?.name || '',
        mail: userProfile?.mail || user?.email || '',
        telefon: userProfile?.telefon || '',
        jugendamt: userProfile?.jugendamt || ''
      }
    }
    return {
      email: user?.email || '',
      name: user?.user_metadata?.name || ''
    }
  }

  const [formData, setFormData] = useState(getInitialFormData())
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let updateData = {}
      let tableName = ''

      if (userRole === 'helper') {
        updateData = transformToDatabase.helper(formData)
        tableName = 'helfer'
        
        const { error: updateError } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('helfer_id', userProfile.helfer_id)

        if (updateError) throw updateError
      } else if (userRole === 'jugendamt') {
        updateData = {
          name: formData.name,
          mail: formData.mail,
          telefon: formData.telefon,
          jugendamt: formData.jugendamt,
          aktualisiert_am: new Date().toISOString()
        }
        tableName = 'jugendamt_ansprechpartner'
        
        const { error: updateError } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('ansprechpartner_id', userProfile.ansprechpartner_id)

        if (updateError) throw updateError
      }

      // Update auth user if email changed
      if (formData.email && formData.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email
        })
        
        if (authError) throw authError
      }

      success('Profil wurde erfolgreich aktualisiert')
      onSave()
    } catch (err) {
      error('Fehler beim Aktualisieren des Profils: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('Passwörter stimmen nicht überein')
      return
    }

    setIsLoading(true)

    try {
      await updatePassword(passwordData.newPassword)

      success('Passwort wurde erfolgreich geändert')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
    } catch (err) {
      error('Fehler beim Ändern des Passworts: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Profil-Einstellungen</h2>
        <UserCircleIcon className="w-6 h-6 text-gray-400" />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info for all roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userRole === 'helper' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname *
                </label>
                <input
                  type="text"
                  value={formData.vorname}
                  onChange={(e) => setFormData({...formData, vorname: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname *
                </label>
                <input
                  type="text"
                  value={formData.nachname}
                  onChange={(e) => setFormData({...formData, nachname: e.target.value})}
                  className="input"
                  required
                />
              </div>
            </>
          )}

          {userRole === 'jugendamt' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input"
                required
              />
            </div>
          )}

          <div className={userRole === 'admin' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail *
            </label>
            <input
              type="email"
              value={formData.email || formData.mail}
              onChange={(e) => setFormData({
                ...formData, 
                [userRole === 'jugendamt' ? 'mail' : 'email']: e.target.value
              })}
              className="input"
              required
            />
          </div>

          {(userRole === 'helper' || userRole === 'jugendamt') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.telefon_nummer || formData.telefon}
                onChange={(e) => setFormData({
                  ...formData, 
                  [userRole === 'helper' ? 'telefon_nummer' : 'telefon']: e.target.value
                })}
                className="input"
              />
            </div>
          )}
        </div>

        {/* Additional fields for helpers */}
        {userRole === 'helper' && (
          <>
            {/* Address */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Adresse</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Straße
                  </label>
                  <input
                    type="text"
                    value={formData.strasse}
                    onChange={(e) => setFormData({...formData, strasse: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PLZ
                    </label>
                    <input
                      type="text"
                      value={formData.plz}
                      onChange={(e) => setFormData({...formData, plz: e.target.value})}
                      className="input"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stadt
                    </label>
                    <input
                      type="text"
                      value={formData.stadt}
                      onChange={(e) => setFormData({...formData, stadt: e.target.value})}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Persönliche Informationen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geburtsdatum
                  </label>
                  <input
                    type="date"
                    value={formData.geburtsdatum}
                    onChange={(e) => setFormData({...formData, geburtsdatum: e.target.value})}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geschlecht
                  </label>
                  <select
                    value={formData.geschlecht}
                    onChange={(e) => setFormData({...formData, geschlecht: e.target.value})}
                    className="input"
                  >
                    <option value="">Bitte wählen</option>
                    <option value={GESCHLECHT.MAENNLICH}>Männlich</option>
                    <option value={GESCHLECHT.WEIBLICH}>Weiblich</option>
                    <option value={GESCHLECHT.DIVERS}>Divers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staatsangehörigkeit
                  </label>
                  <input
                    type="text"
                    value={formData.staatsangehoerigkeit}
                    onChange={(e) => setFormData({...formData, staatsangehoerigkeit: e.target.value})}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Religion
                  </label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) => setFormData({...formData, religion: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Banking Info */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Bankdaten</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({...formData, iban: e.target.value})}
                    className="input"
                    placeholder="DE89 3704 0044 0532 0130 00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Steuernummer
                  </label>
                  <input
                    type="text"
                    value={formData.steuernummer}
                    onChange={(e) => setFormData({...formData, steuernummer: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Additional fields for Jugendamt */}
        {userRole === 'jugendamt' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jugendamt
            </label>
            <input
              type="text"
              value={formData.jugendamt}
              onChange={(e) => setFormData({...formData, jugendamt: e.target.value})}
              className="input"
              placeholder="z.B. Jugendamt Frankfurt"
            />
          </div>
        )}

        <div className="pt-4 border-t">
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" />
                Speichere...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Profil speichern
              </>
            )}
          </button>
        </div>
      </form>

      {/* Password Change Section */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-900">Passwort ändern</h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="btn-secondary"
          >
            {showPasswordForm ? 'Abbrechen' : 'Passwort ändern'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neues Passwort
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="input"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passwort bestätigen
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="input"
                required
                minLength={8}
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  Ändere Passwort...
                </>
              ) : (
                'Passwort ändern'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// Company Settings Component
function CompanySettings({ onSave }) {
  const [formData, setFormData] = useState({
    companyName: 'Edupe',
    legalName: 'Edupe GmbH',
    address: 'Musterstraße 123',
    zipCode: '60314',
    city: 'Frankfurt am Main',
    phone: '+49 69 123456',
    email: 'info@edupe.de',
    website: 'https://www.edupe.de',
    taxNumber: 'DE123456789',
    vatId: 'DE987654321'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Unternehmenseinstellungen</h2>
        <BuildingOfficeIcon className="w-6 h-6 text-gray-400" />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Firmenname *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechtlicher Name
            </label>
            <input
              type="text"
              value={formData.legalName}
              onChange={(e) => setFormData({...formData, legalName: e.target.value})}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="input"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PLZ *
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
              className="input"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stadt *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Steuernummer
            </label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              USt-IdNr.
            </label>
            <input
              type="text"
              value={formData.vatId}
              onChange={(e) => setFormData({...formData, vatId: e.target.value})}
              className="input"
            />
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="btn-primary">
            <CheckCircleIcon className="w-5 h-5" />
            Änderungen speichern
          </button>
        </div>
      </form>
    </div>
  )
}

// User Settings Component  
function UserSettings({ onSave }) {
  const { success, error } = useNotifications()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch helpers
      const { data: helpers, error: helpersError } = await supabase
        .from('helfer')
        .select('helfer_id, vorname, nachname, email, erstellt_am')

      if (helpersError) throw helpersError

      // Fetch jugendamt users
      const { data: jugendamt, error: jugendamtError } = await supabase
        .from('jugendamt_ansprechpartner')
        .select('ansprechpartner_id, name, mail, jugendamt, erstellt_am')

      if (jugendamtError) throw jugendamtError

      // Combine and format users
      const formattedUsers = [
        ...helpers.map(h => ({
          id: h.helfer_id,
          name: `${h.vorname} ${h.nachname}`,
          email: h.email,
          role: 'Helfer',
          status: 'active',
          createdAt: h.erstellt_am
        })),
        ...jugendamt.map(j => ({
          id: j.ansprechpartner_id,
          name: j.name,
          email: j.mail,
          role: 'Jugendamt',
          organization: j.jugendamt,
          status: 'active',
          createdAt: j.erstellt_am
        }))
      ]

      setUsers(formattedUsers)
    } catch (err) {
      error('Fehler beim Laden der Benutzer: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }, [error])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Benutzerverwaltung</h2>
        <button className="btn-primary">
          Benutzer hinzufügen
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-gray-600">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.organization && (
                    <p className="text-xs text-gray-500">{user.organization}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-blue">{user.role}</span>
                <span className={`badge ${user.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                  {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                </span>
                <button className="btn-ghost p-2">
                  <CogIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Billing Settings Component
function BillingSettings({ onSave }) {
  const [settings, setSettings] = useState({
    defaultHourlyRate: 25.50,
    currency: 'EUR',
    invoicePrefix: 'R-',
    invoiceNumbering: 'yearly',
    paymentTerms: 14,
    taxRate: 19,
    autoGenerateInvoices: true,
    sendReminders: true,
    reminderDays: [7, 3, 1]
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Abrechnungseinstellungen</h2>
        <CurrencyEuroIcon className="w-6 h-6 text-gray-400" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standard-Stundensatz (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.defaultHourlyRate}
              onChange={(e) => setSettings({...settings, defaultHourlyRate: parseFloat(e.target.value)})}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Währung
            </label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({...settings, currency: e.target.value})}
              className="input"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="CHF">Schweizer Franken (CHF)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechnungs-Präfix
            </label>
            <input
              type="text"
              value={settings.invoicePrefix}
              onChange={(e) => setSettings({...settings, invoicePrefix: e.target.value})}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zahlungsziel (Tage)
            </label>
            <input
              type="number"
              value={settings.paymentTerms}
              onChange={(e) => setSettings({...settings, paymentTerms: parseInt(e.target.value)})}
              className="input"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoGenerate"
              checked={settings.autoGenerateInvoices}
              onChange={(e) => setSettings({...settings, autoGenerateInvoices: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="autoGenerate" className="text-sm text-gray-700">
              Rechnungen automatisch generieren
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sendReminders"
              checked={settings.sendReminders}
              onChange={(e) => setSettings({...settings, sendReminders: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="sendReminders" className="text-sm text-gray-700">
              Zahlungserinnerungen automatisch versenden
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="btn-primary">
            <CheckCircleIcon className="w-5 h-5" />
            Einstellungen speichern
          </button>
        </div>
      </form>
    </div>
  )
}

// System Settings Component
function SystemSettings({ onSave }) {
  const [settings, setSettings] = useState({
    timezone: 'Europe/Berlin',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    language: 'de',
    backupInterval: 'daily',
    maintenanceMode: false,
    debugMode: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Systemeinstellungen</h2>
        <CogIcon className="w-6 h-6 text-gray-400" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zeitzone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              className="input"
            >
              <option value="Europe/Berlin">Europa/Berlin</option>
              <option value="Europe/Vienna">Europa/Wien</option>
              <option value="Europe/Zurich">Europa/Zürich</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sprache
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="input"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="maintenanceMode" className="text-sm text-gray-700">
              Wartungsmodus aktivieren
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="debugMode"
              checked={settings.debugMode}
              onChange={(e) => setSettings({...settings, debugMode: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="debugMode" className="text-sm text-gray-700">
              Debug-Modus aktivieren
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="btn-primary">
            <CheckCircleIcon className="w-5 h-5" />
            Einstellungen speichern
          </button>
        </div>
      </form>
    </div>
  )
}

// Security Settings Component
function SecuritySettings({ onSave }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Sicherheitseinstellungen</h2>
        <ShieldCheckIcon className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Wichtiger Hinweis</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Sicherheitseinstellungen werden von Supabase verwaltet. 
                Weitere Optionen sind in der Supabase-Konsole verfügbar.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-8">
          <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sicherheit wird von Supabase verwaltet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Authentifizierung, Passwort-Richtlinien und andere Sicherheitsfeatures 
            werden automatisch von Supabase bereitgestellt.
          </p>
        </div>
      </div>
    </div>
  )
}

// Data Settings Component  
function DataSettings({ onSave }) {
  const { success, error } = useNotifications()
  const [isLoading, setIsLoading] = useState(false)

  const exportData = async (type) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/export/${type}`)
      if (!response.ok) throw new Error('Export fehlgeschlagen')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      success('Daten wurden erfolgreich exportiert')
    } catch (err) {
      error('Fehler beim Export: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Datenmanagement</h2>
        <ArchiveBoxIcon className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Datenexport</h3>
          <p className="text-sm text-gray-600 mb-4">
            Exportieren Sie Ihre Daten in verschiedenen Formaten.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={() => exportData('all')}
              disabled={isLoading}
              className="btn-secondary"
            >
              Alle Daten exportieren
            </button>
            <button 
              onClick={() => exportData('cases')}
              disabled={isLoading}
              className="btn-secondary"
            >
              Nur Fälle exportieren
            </button>
            <button 
              onClick={() => exportData('helpers')}
              disabled={isLoading}
              className="btn-secondary"
            >
              Nur Helfer exportieren
            </button>
            <button 
              onClick={() => exportData('services')}
              disabled={isLoading}
              className="btn-secondary"
            >
              Nur Leistungen exportieren
            </button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">DSGVO-Funktionen</h3>
          <p className="text-sm text-red-800 mb-4">
            Funktionen zur Einhaltung der Datenschutz-Grundverordnung.
          </p>
          <div className="space-y-3">
            <button className="btn bg-red-600 text-white hover:bg-red-700 w-full">
              Datenauskunft erstellen
            </button>
            <button className="btn bg-red-600 text-white hover:bg-red-700 w-full">
              Daten anonymisieren
            </button>
          </div>
          <p className="text-xs text-red-700 mt-2">
            Diese Aktionen können nicht rückgängig gemacht werden!
          </p>
        </div>
      </div>
    </div>
  )
}

// Privacy Settings Component
function PrivacySettings({ onSave }) {
  const [settings, setSettings] = useState({
    profileVisibility: 'team',
    allowDataSharing: false,
    allowNotifications: true,
    allowAnalytics: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Datenschutz-Einstellungen</h2>
        <ShieldCheckIcon className="w-6 h-6 text-gray-400" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profil-Sichtbarkeit
          </label>
          <select
            value={settings.profileVisibility}
            onChange={(e) => setSettings({...settings, profileVisibility: e.target.value})}
            className="input"
          >
            <option value="public">Öffentlich</option>
            <option value="team">Nur Team</option>
            <option value="private">Privat</option>
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Datenfreigabe erlauben</h3>
              <p className="text-sm text-gray-600">Daten für Verbesserungen verwenden</p>
            </div>
            <input
              type="checkbox"
              checked={settings.allowDataSharing}
              onChange={(e) => setSettings({...settings, allowDataSharing: e.target.checked})}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Benachrichtigungen</h3>
              <p className="text-sm text-gray-600">System-Benachrichtigungen erhalten</p>
            </div>
            <input
              type="checkbox"
              checked={settings.allowNotifications}
              onChange={(e) => setSettings({...settings, allowNotifications: e.target.checked})}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Analytik</h3>
              <p className="text-sm text-gray-600">Nutzungsanalyse zulassen</p>
            </div>
            <input
              type="checkbox"
              checked={settings.allowAnalytics}
              onChange={(e) => setSettings({...settings, allowAnalytics: e.target.checked})}
              className="rounded"
            />
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" className="btn-primary">
            <CheckCircleIcon className="w-5 h-5" />
            Datenschutz-Einstellungen speichern
          </button>
        </div>
      </form>
    </div>
  )
}