// src/pages/helpers.js
import { useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

// Dummy data
const helpers = [
  {
    id: 1,
    name: 'Anna Schmidt',
    email: 'anna.schmidt@example.com',
    phone: '+49 151 12345678',
    location: 'Frankfurt am Main',
    skills: ['Familienhelfer', 'Erziehungsbeistand'],
    availability: 'Verfügbar',
    rating: 4.9,
    cases: 45,
    hours: 680,
  },
  {
    id: 2,
    name: 'Michael Weber',
    email: 'michael.weber@example.com',
    phone: '+49 160 87654321',
    location: 'Offenbach',
    skills: ['Sozialpädagoge', 'Familienhelfer'],
    availability: 'Teilweise verfügbar',
    rating: 4.8,
    cases: 38,
    hours: 520,
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+49 170 11223344',
    location: 'Bad Homburg',
    skills: ['Erziehungsbeistand'],
    availability: 'Nicht verfügbar',
    rating: 5.0,
    cases: 52,
    hours: 890,
  },
  {
    id: 4,
    name: 'Thomas Müller',
    email: 'thomas.mueller@example.com',
    phone: '+49 152 44556677',
    location: 'Hanau',
    skills: ['Familienhelfer', 'Sozialpädagoge', 'Erziehungsbeistand'],
    availability: 'Verfügbar',
    rating: 4.7,
    cases: 29,
    hours: 410,
  },
]

export default function Helpers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHelper, setSelectedHelper] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredHelpers = helpers.filter(helper =>
    helper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    helper.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    helper.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <Head>
        <title>Helfer - Edupe Digital</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Helfer</h1>
            <p className="text-gray-600 mt-1">Verwalten Sie Ihre Helfer und deren Verfügbarkeit</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="w-5 h-5" />
            Neuer Helfer
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Helfer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button className="btn-secondary">
            <FunnelIcon className="w-5 h-5" />
            Filter
          </button>
        </div>

        {/* Helpers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHelpers.map((helper) => (
            <div 
              key={helper.id} 
              className="card card-hover cursor-pointer"
              onClick={() => setSelectedHelper(helper)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-600">
                        {helper.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{helper.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{helper.rating}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${
                    helper.availability === 'Verfügbar' ? 'badge-green' :
                    helper.availability === 'Teilweise verfügbar' ? 'badge-yellow' :
                    'badge-red'
                  }`}>
                    {helper.availability}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{helper.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span className="truncate">{helper.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{helper.phone}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {helper.skills.map((skill, index) => (
                      <span key={index} className="badge badge-blue">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{helper.cases}</p>
                    <p className="text-xs text-gray-500">Fälle</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{helper.hours}</p>
                    <p className="text-xs text-gray-500">Stunden</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Helper Detail Modal */}
      {selectedHelper && (
        <>
          <div className="modal-backdrop" onClick={() => setSelectedHelper(null)} />
          <div className="modal-content max-w-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Helfer Details</h2>
              <button
                onClick={() => setSelectedHelper(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Helper Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-600">
                    {selectedHelper.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedHelper.name}</h3>
                  <p className="text-gray-600">{selectedHelper.location}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-medium">{selectedHelper.rating}</span>
                    </div>
                    <span className={`badge ${
                      selectedHelper.availability === 'Verfügbar' ? 'badge-green' :
                      selectedHelper.availability === 'Teilweise verfügbar' ? 'badge-yellow' :
                      'badge-red'
                    }`}>
                      {selectedHelper.availability}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">E-Mail</label>
                  <p className="mt-1 text-gray-900">{selectedHelper.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Telefon</label>
                  <p className="mt-1 text-gray-900">{selectedHelper.phone}</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm font-medium text-gray-700">Qualifikationen</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedHelper.skills.map((skill, index) => (
                    <span key={index} className="badge badge-blue">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">{selectedHelper.cases}</p>
                  <p className="text-sm text-gray-500">Fälle gesamt</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">{selectedHelper.hours}</p>
                  <p className="text-sm text-gray-500">Stunden gesamt</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">98%</p>
                  <p className="text-sm text-gray-500">Zuverlässigkeit</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="btn-primary flex-1">
                  Fall zuweisen
                </button>
                <button className="btn-secondary flex-1">
                  Verfügbarkeit ändern
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Helper Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)} />
          <div className="modal-content max-w-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Neuen Helfer hinzufügen</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                  <input type="text" className="input" placeholder="Max" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                  <input type="text" className="input" placeholder="Mustermann" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                <input type="email" className="input" placeholder="max.mustermann@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input type="tel" className="input" placeholder="+49 151 12345678" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input type="text" className="input" placeholder="Straße und Hausnummer" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
                  <input type="text" className="input" placeholder="60314" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
                  <input type="text" className="input" placeholder="Frankfurt am Main" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifikationen</label>
                <select multiple className="input h-24">
                  <option>Familienhelfer</option>
                  <option>Erziehungsbeistand</option>
                  <option>Sozialpädagoge</option>
                  <option>Sozialarbeiter</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Mehrere auswählen mit Strg/Cmd + Klick</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                  Abbrechen
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Helfer hinzufügen
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </Layout>
  )
}