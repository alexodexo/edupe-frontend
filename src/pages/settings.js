// src/pages/settings.js
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { useAuth } from '@/lib/auth'
import { useNotifications } from '@/lib/notifications'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/Loading'
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  CogIcon,
  CheckCircleIcon,
  UserCircleIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

export default function Settings() {
  const { user, userRole, userProfile, hasRole } = useAuth()
  const { success, error } = useNotifications()
  const [activeTab, setActiveTab] = useState('general')

  // Define available tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'general', name: 'Allgemein', icon: CogIcon }
    ]

    if (hasRole('admin')) {
      return [
        ...baseTabs,
        { id: 'users', name: 'Benutzer', icon: UserGroupIcon },
        { id: 'billing', name: 'Abrechnung', icon: CurrencyEuroIcon }
      ]
    }

    return baseTabs
  }

  const tabs = getAvailableTabs()

  return (
    <Layout>
      <Head>
        <title>Einstellungen - Edupe Digital</title>
      </Head>

      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
              <p className="text-gray-600 mt-1">Edupe Digital v1.8.7</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Edupe GbR</p>
                <p className="text-xs text-blue-700">DENCK Solutions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Menu */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'users' && hasRole('admin') && <UserSettings />}
          {activeTab === 'billing' && hasRole('admin') && <BillingSettings />}
        </div>
      </div>
    </Layout>
  )
}

// General Settings Component - Read Only
function GeneralSettings() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <CogIcon className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Systeminfos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Software
          </label>
          <input
            type="text"
            value="Edupe Digital v1.8.7"
            disabled
            className="input bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unternehmen
          </label>
          <input
            type="text"
            value="Edupe GbR"
            disabled
            className="input bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entwickler
          </label>
          <input
            type="text"
            value="DENCK Solutions"
            disabled
            className="input bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zeitzone
          </label>
          <input
            type="text"
            value="Europa/Berlin"
            disabled
            className="input bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Währung
          </label>
          <input
            type="text"
            value="Euro (€)"
            disabled
            className="input bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <input
            type="text"
            value="Online"
            disabled
            className="input bg-gray-50"
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Edupe Digital</strong> ist eine Individualentwicklung von DENCK Solutions 
          speziell für die Verwaltung von Helfern und Jugendamtsprozessen.
        </p>
      </div>
    </div>
  )
}

// User Settings Component
function UserSettings() {
  const { success, error } = useNotifications()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      
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

      // Combine users
      const formattedUsers = [
        ...helpers.map(h => ({
          id: h.helfer_id,
          name: `${h.vorname} ${h.nachname}`,
          email: h.email,
          role: 'Helfer',
          createdAt: h.erstellt_am
        })),
        ...jugendamt.map(j => ({
          id: j.ansprechpartner_id,
          name: j.name,
          email: j.mail,
          role: 'Jugendamt',
          organization: j.jugendamt,
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

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserGroupIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Benutzerverwaltung</h2>
        </div>
        <button className="btn-primary text-sm">
          <PlusIcon className="w-4 h-4" />
          Benutzer hinzufügen
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Benutzer suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input max-w-md"
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-medium text-blue-700 text-sm">
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
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.role === 'Helfer' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {user.role}
                </span>
                <div className="flex gap-1">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-600">Gesamt</p>
          <p className="text-xl font-bold text-blue-900">{users.length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-purple-600">Helfer</p>
          <p className="text-xl font-bold text-purple-900">
            {users.filter(u => u.role === 'Helfer').length}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-orange-600">Jugendamt</p>
          <p className="text-xl font-bold text-orange-900">
            {users.filter(u => u.role === 'Jugendamt').length}
          </p>
        </div>
      </div>
    </div>
  )
}

// Billing Settings Component
function BillingSettings() {
  const [settings, setSettings] = useState({
    defaultHourlyRate: 25.50,
    invoicePrefix: 'EDU-',
    paymentTerms: 14,
    taxRate: 19,
    autoGenerateInvoices: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const { success } = useNotifications()

  const handleSave = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Abrechnungseinstellungen gespeichert')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <CurrencyEuroIcon className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Abrechnung</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Steuersatz (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
              className="input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Währung
            </label>
            <input
              type="text"
              value="Euro (€)"
              disabled
              className="input bg-gray-50"
            />
          </div>
        </div>

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
                <CheckCircleIcon className="w-4 h-4" />
                Einstellungen speichern
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}