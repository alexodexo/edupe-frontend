// src/pages/settings.js
import { useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { NotificationSettings } from '@/lib/notifications'
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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useNotifications } from '@/lib/notifications'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company')
  const { success } = useNotifications()

  const tabs = [
    { id: 'company', name: 'Unternehmen', icon: BuildingOfficeIcon },
    { id: 'users', name: 'Benutzer', icon: UserGroupIcon },
    { id: 'notifications', name: 'Benachrichtigungen', icon: BellIcon },
    { id: 'billing', name: 'Abrechnung', icon: CurrencyEuroIcon },
    { id: 'system', name: 'System', icon: CogIcon },
    { id: 'security', name: 'Sicherheit', icon: ShieldCheckIcon },
    { id: 'data', name: 'Datenmanagement', icon: ArchiveBoxIcon },
  ]

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
              {activeTab === 'company' && <CompanySettings onSave={handleSave} />}
              {activeTab === 'users' && <UserSettings onSave={handleSave} />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'billing' && <BillingSettings onSave={handleSave} />}
              {activeTab === 'system' && <SystemSettings onSave={handleSave} />}
              {activeTab === 'security' && <SecuritySettings onSave={handleSave} />}
              {activeTab === 'data' && <DataSettings onSave={handleSave} />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
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
    vatId: 'DE987654321',
    logo: null
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
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Firmenlogo
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">E</span>
            </div>
            <div>
              <button type="button" className="btn-secondary">
                Logo hochladen
              </button>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG bis 2MB</p>
            </div>
          </div>
        </div>

        {/* Company Info */}
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

        {/* Address */}
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

        {/* Contact */}
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

        {/* Tax Info */}
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
  const [users] = useState([
    { id: 1, name: 'Max Admin', email: 'max@edupe.de', role: 'Administrator', status: 'active' },
    { id: 2, name: 'Anna Koordinator', email: 'anna@edupe.de', role: 'Koordinator', status: 'active' },
    { id: 3, name: 'Tom Sachbearbeiter', email: 'tom@edupe.de', role: 'Sachbearbeiter', status: 'inactive' },
  ])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Benutzerverwaltung</h2>
        <button className="btn-primary">
          Benutzer hinzufügen
        </button>
      </div>

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
              Nummerierung
            </label>
            <select
              value={settings.invoiceNumbering}
              onChange={(e) => setSettings({...settings, invoiceNumbering: e.target.value})}
              className="input"
            >
              <option value="yearly">Jährlich zurücksetzen</option>
              <option value="continuous">Fortlaufend</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Mehrwertsteuersatz (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.taxRate}
              onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
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
    debugMode: false,
    apiRateLimit: 1000
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datumsformat
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
              className="input"
            >
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zeitformat
            </label>
            <select
              value={settings.timeFormat}
              onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}
              className="input"
            >
              <option value="24h">24-Stunden</option>
              <option value="12h">12-Stunden (AM/PM)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Backup-Intervall
          </label>
          <select
            value={settings.backupInterval}
            onChange={(e) => setSettings({...settings, backupInterval: e.target.value})}
            className="input"
          >
            <option value="hourly">Stündlich</option>
            <option value="daily">Täglich</option>
            <option value="weekly">Wöchentlich</option>
            <option value="monthly">Monatlich</option>
          </select>
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
  const [settings, setSettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 8,
    passwordPolicy: 'strong',
    loginAttempts: 5,
    ipWhitelist: '',
    auditLog: true,
    encryptData: true
  })

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
                Änderungen an den Sicherheitseinstellungen können die Anmeldung beeinträchtigen. 
                Stellen Sie sicher, dass Sie Zugriff auf alternative Anmeldemethoden haben.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Zwei-Faktor-Authentifizierung</h3>
              <p className="text-sm text-gray-600">Zusätzliche Sicherheit für Anmeldungen</p>
            </div>
            <button
              onClick={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session-Timeout (Stunden)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                className="input"
                min="1"
                max="24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max. Anmeldeversuche
              </label>
              <input
                type="number"
                value={settings.loginAttempts}
                onChange={(e) => setSettings({...settings, loginAttempts: parseInt(e.target.value)})}
                className="input"
                min="3"
                max="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passwort-Richtlinie
            </label>
            <select
              value={settings.passwordPolicy}
              onChange={(e) => setSettings({...settings, passwordPolicy: e.target.value})}
              className="input"
            >
              <option value="basic">Basis (min. 8 Zeichen)</option>
              <option value="strong">Stark (Groß-/Kleinbuchstaben, Zahlen)</option>
              <option value="complex">Komplex (+ Sonderzeichen)</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button onClick={onSave} className="btn-primary">
            <CheckCircleIcon className="w-5 h-5" />
            Sicherheitseinstellungen speichern
          </button>
        </div>
      </div>
    </div>
  )
}

// Data Settings Component  
function DataSettings({ onSave }) {
  const [settings, setSettings] = useState({
    dataRetention: '7',
    autoBackup: true,
    exportFormat: 'json',
    gdprCompliance: true,
    anonymizeData: false
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Datenmanagement</h2>
        <ArchiveBoxIcon className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Datenaufbewahrung
          </label>
          <select
            value={settings.dataRetention}
            onChange={(e) => setSettings({...settings, dataRetention: e.target.value})}
            className="input"
          >
            <option value="1">1 Jahr</option>
            <option value="3">3 Jahre</option>
            <option value="5">5 Jahre</option>
            <option value="7">7 Jahre (Standard)</option>
            <option value="10">10 Jahre</option>
            <option value="0">Unbegrenzt</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Gesetzliche Aufbewahrungsfristen beachten
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Automatische Backups</h3>
              <p className="text-sm text-gray-600">Tägliche Sicherungskopien erstellen</p>
            </div>
            <button
              onClick={() => setSettings({...settings, autoBackup: !settings.autoBackup})}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.autoBackup ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">DSGVO-Konformität</h3>
              <p className="text-sm text-gray-600">Datenschutz-Grundverordnung einhalten</p>
            </div>
            <button
              onClick={() => setSettings({...settings, gdprCompliance: !settings.gdprCompliance})}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.gdprCompliance ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.gdprCompliance ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">Gefährliche Aktionen</h3>
          <div className="space-y-3">
            <button className="btn bg-red-600 text-white hover:bg-red-700 w-full">
              Alle Daten exportieren
            </button>
            <button className="btn bg-red-600 text-white hover:bg-red-700 w-full">
              Alle Daten löschen
            </button>
          </div>
          <p className="text-xs text-red-700 mt-2">
            Diese Aktionen können nicht rückgängig gemacht werden!
          </p>
        </div>

        <div className="pt-4">
          <button onClick={onSave} className="btn-primary">
            <CheckCircleIcon className="w-5 h-5" />
            Dateneinstellungen speichern
          </button>
        </div>
      </div>
    </div>
  )
}