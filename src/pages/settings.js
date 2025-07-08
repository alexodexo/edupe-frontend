// src/pages/settings.js
import { useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CogIcon,
} from '@heroicons/react/24/outline'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company')

  const tabs = [
    { id: 'company', name: 'Unternehmen', icon: BuildingOfficeIcon },
    { id: 'users', name: 'Benutzer', icon: UserGroupIcon },
    { id: 'notifications', name: 'Benachrichtigungen', icon: BellIcon },
    { id: 'security', name: 'Sicherheit', icon: ShieldCheckIcon },
    { id: 'templates', name: 'Vorlagen', icon: DocumentTextIcon },
    { id: 'system', name: 'System', icon: CogIcon },
  ]

  return (
    <Layout>
      <Head>
        <title>Einstellungen - Edupe Digital</title>
      </Head>

      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Einstellungen</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Systemeinstellungen</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
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
            <div className="card p-6">
              {activeTab === 'company' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Unternehmenseinstellungen</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unternehmensname
                      </label>
                      <input type="text" className="input" defaultValue="Edupe" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <textarea className="input" rows="3" defaultValue="Musterstraße 123&#10;60314 Frankfurt am Main" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <input type="tel" className="input" defaultValue="+49 69 123456" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          E-Mail
                        </label>
                        <input type="email" className="input" defaultValue="info@edupe.de" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Steuernummer
                      </label>
                      <input type="text" className="input" defaultValue="DE123456789" />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="btn-primary">
                      Änderungen speichern
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Benutzerverwaltung</h2>
                    <button className="btn-primary">
                      Benutzer hinzufügen
                    </button>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Max Admin', email: 'max@edupe.de', role: 'Administrator' },
                      { name: 'Anna Koordinator', email: 'anna@edupe.de', role: 'Koordinator' },
                      { name: 'Tom Sachbearbeiter', email: 'tom@edupe.de', role: 'Sachbearbeiter' },
                    ].map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="badge badge-blue">{user.role}</span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <BellIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Benachrichtigungseinstellungen</h2>
                  
                  <div className="space-y-4">
                    {[
                      { title: 'Neue Anfragen', description: 'Benachrichtigung bei neuen Jugendamtsanfragen', enabled: true },
                      { title: 'Stundenfreigabe', description: 'Benachrichtigung wenn Stunden zur Freigabe anstehen', enabled: true },
                      { title: 'Berichte fertig', description: 'Benachrichtigung wenn KI-Berichte erstellt wurden', enabled: false },
                      { title: 'Zahlungseingänge', description: 'Benachrichtigung bei Zahlungseingängen', enabled: true },
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{setting.title}</p>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={setting.enabled} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add other tab contents as needed */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}