// src/pages/register.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function Register() {
  const router = useRouter()
  const { signUp, user, loading } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'helper',
    // Helfer-spezifische Felder
    strasse: '',
    plz: '',
    stadt: '',
    geburtsdatum: '',
    geburtsort: '',
    geburtsland: '',
    geschlecht: '',
    staatsangehoerigkeit: '',
    telefon_nummer: '',
    alternative_nummer: '',
    festnetznummer: '',
    hoechster_abschluss: '',
    zusaetzliche_qualifikationen: '',
    sprachen: '',
    religion: '',
    besonderheiten: '',
    faehigkeiten: '',
    iban: '',
    steuernummer: '',
    bild_bescheinigung: '',
    steuer_id: '',
    andere_auftraggeber: false,
    // Jugendamt-spezifische Felder
    jugendamt: '',
    telefon: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  // Password validation
  const validatePassword = (password) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  }

  const passwordValidation = validatePassword(formData.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.firstName || !formData.lastName) {
      setError('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    // Role-specific validation
    if (formData.role === 'helper') {
      if (!formData.strasse || !formData.plz || !formData.stadt || !formData.telefon_nummer) {
        setError('Bitte füllen Sie alle Pflichtfelder für Helfer aus')
        return
      }
    } else if (formData.role === 'jugendamt') {
      if (!formData.jugendamt || !formData.telefon) {
        setError('Bitte füllen Sie alle Pflichtfelder für Jugendamt aus')
        return
      }
    }

    if (!passwordValidation.isValid) {
      setError('Das Passwort erfüllt nicht alle Anforderungen')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return
    }

    setIsLoading(true)

    try {
      // Verwende die API-Route für die Registrierung
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registrierung fehlgeschlagen')
      }
      
      setSuccess('Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie sich anmelden.')
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'helper',
        strasse: '',
        plz: '',
        stadt: '',
        geburtsdatum: '',
        geburtsort: '',
        geburtsland: '',
        geschlecht: '',
        staatsangehoerigkeit: '',
        telefon_nummer: '',
        alternative_nummer: '',
        festnetznummer: '',
        hoechster_abschluss: '',
        zusaetzliche_qualifikationen: '',
        sprachen: '',
        religion: '',
        besonderheiten: '',
        faehigkeiten: '',
        iban: '',
        steuernummer: '',
        bild_bescheinigung: '',
        steuer_id: '',
        andere_auftraggeber: false,
        jugendamt: '',
        telefon: ''
      })

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'Registrierung fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading if auth is still initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <span className="text-2xl font-bold text-white">E</span>
          </div>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Registrierung - Edupe Digital</title>
        <meta name="description" content="Registrierung bei Edupe Digital - Helfervermittlung im Sozialbereich" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col justify-center min-h-screen py-12 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">E</span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Registrierung bei Edupe Digital
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Erstellen Sie Ihr Konto, um fortzufahren
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Registrierung erfolgreich!</p>
                      <p className="text-xs text-green-600 mt-1">
                        Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie sich anmelden. 
                        Überprüfen Sie auch Ihren Spam-Ordner.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!success && (
                <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Vorname
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="input pl-10"
                        placeholder="Vorname"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Nachname
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="input"
                        placeholder="Nachname"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-Mail-Adresse
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input pl-10"
                      placeholder="ihre@email.de"
                      required
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Rolle *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="helper">Helfer</option>
                    <option value="jugendamt">Jugendamt</option>
                  </select>
                </div>

                {/* Helfer-spezifische Felder */}
                {formData.role === 'helper' && (
                  <>
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Helfer-Informationen</h3>
                      
                      {/* Adresse */}
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        <div>
                          <label htmlFor="strasse" className="block text-sm font-medium text-gray-700">
                            Straße *
                          </label>
                          <input
                            id="strasse"
                            name="strasse"
                            type="text"
                            value={formData.strasse}
                            onChange={(e) => setFormData({ ...formData, strasse: e.target.value })}
                            className="input"
                            placeholder="Musterstraße 123"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="plz" className="block text-sm font-medium text-gray-700">
                              PLZ *
                            </label>
                            <input
                              id="plz"
                              name="plz"
                              type="text"
                              value={formData.plz}
                              onChange={(e) => setFormData({ ...formData, plz: e.target.value })}
                              className="input"
                              placeholder="12345"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="stadt" className="block text-sm font-medium text-gray-700">
                              Stadt *
                            </label>
                            <input
                              id="stadt"
                              name="stadt"
                              type="text"
                              value={formData.stadt}
                              onChange={(e) => setFormData({ ...formData, stadt: e.target.value })}
                              className="input"
                              placeholder="Musterstadt"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Persönliche Daten */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label htmlFor="geburtsdatum" className="block text-sm font-medium text-gray-700">
                            Geburtsdatum
                          </label>
                          <input
                            id="geburtsdatum"
                            name="geburtsdatum"
                            type="date"
                            value={formData.geburtsdatum}
                            onChange={(e) => setFormData({ ...formData, geburtsdatum: e.target.value })}
                            className="input"
                          />
                        </div>
                        <div>
                          <label htmlFor="geschlecht" className="block text-sm font-medium text-gray-700">
                            Geschlecht
                          </label>
                          <select
                            id="geschlecht"
                            name="geschlecht"
                            value={formData.geschlecht}
                            onChange={(e) => setFormData({ ...formData, geschlecht: e.target.value })}
                            className="input"
                          >
                            <option value="">Bitte wählen</option>
                            <option value="maennlich">Männlich</option>
                            <option value="weiblich">Weiblich</option>
                            <option value="divers">Divers</option>
                          </select>
                        </div>
                      </div>

                      {/* Kontaktdaten */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label htmlFor="telefon_nummer" className="block text-sm font-medium text-gray-700">
                            Telefonnummer *
                          </label>
                          <input
                            id="telefon_nummer"
                            name="telefon_nummer"
                            type="tel"
                            value={formData.telefon_nummer}
                            onChange={(e) => setFormData({ ...formData, telefon_nummer: e.target.value })}
                            className="input"
                            placeholder="+49 123 456789"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="alternative_nummer" className="block text-sm font-medium text-gray-700">
                            Alternative Nummer
                          </label>
                          <input
                            id="alternative_nummer"
                            name="alternative_nummer"
                            type="tel"
                            value={formData.alternative_nummer}
                            onChange={(e) => setFormData({ ...formData, alternative_nummer: e.target.value })}
                            className="input"
                            placeholder="+49 123 456789"
                          />
                        </div>
                      </div>

                      {/* Qualifikationen */}
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        <div>
                          <label htmlFor="hoechster_abschluss" className="block text-sm font-medium text-gray-700">
                            Höchster Abschluss
                          </label>
                          <textarea
                            id="hoechster_abschluss"
                            name="hoechster_abschluss"
                            value={formData.hoechster_abschluss}
                            onChange={(e) => setFormData({ ...formData, hoechster_abschluss: e.target.value })}
                            className="input"
                            rows="2"
                            placeholder="z.B. Abitur, Ausbildung, Studium..."
                          />
                        </div>
                        <div>
                          <label htmlFor="zusaetzliche_qualifikationen" className="block text-sm font-medium text-gray-700">
                            Zusätzliche Qualifikationen
                          </label>
                          <textarea
                            id="zusaetzliche_qualifikationen"
                            name="zusaetzliche_qualifikationen"
                            value={formData.zusaetzliche_qualifikationen}
                            onChange={(e) => setFormData({ ...formData, zusaetzliche_qualifikationen: e.target.value })}
                            className="input"
                            rows="2"
                            placeholder="Weiterbildungen, Zertifikate, etc."
                          />
                        </div>
                        <div>
                          <label htmlFor="sprachen" className="block text-sm font-medium text-gray-700">
                            Sprachen
                          </label>
                          <textarea
                            id="sprachen"
                            name="sprachen"
                            value={formData.sprachen}
                            onChange={(e) => setFormData({ ...formData, sprachen: e.target.value })}
                            className="input"
                            rows="2"
                            placeholder="Deutsch (Muttersprache), Englisch (fließend)..."
                          />
                        </div>
                      </div>

                      {/* Bankdaten */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label htmlFor="iban" className="block text-sm font-medium text-gray-700">
                            IBAN
                          </label>
                          <input
                            id="iban"
                            name="iban"
                            type="text"
                            value={formData.iban}
                            onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                            className="input"
                            placeholder="DE89 3704 0044 0532 0130 00"
                          />
                        </div>
                        <div>
                          <label htmlFor="steuernummer" className="block text-sm font-medium text-gray-700">
                            Steuernummer
                          </label>
                          <input
                            id="steuernummer"
                            name="steuernummer"
                            type="text"
                            value={formData.steuernummer}
                            onChange={(e) => setFormData({ ...formData, steuernummer: e.target.value })}
                            className="input"
                            placeholder="123/456/78901"
                          />
                        </div>
                      </div>

                      {/* Sonstiges */}
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        <div>
                          <label htmlFor="besonderheiten" className="block text-sm font-medium text-gray-700">
                            Besonderheiten
                          </label>
                          <textarea
                            id="besonderheiten"
                            name="besonderheiten"
                            value={formData.besonderheiten}
                            onChange={(e) => setFormData({ ...formData, besonderheiten: e.target.value })}
                            className="input"
                            rows="2"
                            placeholder="Besondere Fähigkeiten, Erfahrungen, etc."
                          />
                        </div>
                        <div>
                          <label htmlFor="faehigkeiten" className="block text-sm font-medium text-gray-700">
                            Fähigkeiten
                          </label>
                          <textarea
                            id="faehigkeiten"
                            name="faehigkeiten"
                            value={formData.faehigkeiten}
                            onChange={(e) => setFormData({ ...formData, faehigkeiten: e.target.value })}
                            className="input"
                            rows="2"
                            placeholder="Spezielle Fähigkeiten, Erfahrungen mit Kindern, etc."
                          />
                        </div>
                      </div>

                      <div className="flex items-center mb-6">
                        <input
                          id="andere_auftraggeber"
                          name="andere_auftraggeber"
                          type="checkbox"
                          checked={formData.andere_auftraggeber}
                          onChange={(e) => setFormData({ ...formData, andere_auftraggeber: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="andere_auftraggeber" className="ml-2 block text-sm text-gray-700">
                          Ich habe andere Auftraggeber
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Jugendamt-spezifische Felder */}
                {formData.role === 'jugendamt' && (
                  <>
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Jugendamt-Informationen</h3>
                      
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        <div>
                          <label htmlFor="jugendamt" className="block text-sm font-medium text-gray-700">
                            Jugendamt *
                          </label>
                          <input
                            id="jugendamt"
                            name="jugendamt"
                            type="text"
                            value={formData.jugendamt}
                            onChange={(e) => setFormData({ ...formData, jugendamt: e.target.value })}
                            className="input"
                            placeholder="z.B. Jugendamt Berlin-Mitte"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">
                            Telefonnummer *
                          </label>
                          <input
                            id="telefon"
                            name="telefon"
                            type="tel"
                            value={formData.telefon}
                            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                            className="input"
                            placeholder="+49 30 12345678"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Passwort
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input pl-10 pr-10"
                      placeholder="Ihr Passwort"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600">Passwort-Anforderungen:</p>
                    <div className="space-y-1">
                      <div className={`flex items-center text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.minLength ? <CheckIcon className="w-3 h-3 mr-1" /> : <XMarkIcon className="w-3 h-3 mr-1" />}
                        Mindestens 8 Zeichen
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.hasUpperCase ? <CheckIcon className="w-3 h-3 mr-1" /> : <XMarkIcon className="w-3 h-3 mr-1" />}
                        Mindestens ein Großbuchstabe
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.hasLowerCase ? <CheckIcon className="w-3 h-3 mr-1" /> : <XMarkIcon className="w-3 h-3 mr-1" />}
                        Mindestens ein Kleinbuchstabe
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.hasNumbers ? <CheckIcon className="w-3 h-3 mr-1" /> : <XMarkIcon className="w-3 h-3 mr-1" />}
                        Mindestens eine Zahl
                      </div>
                      <div className={`flex items-center text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordValidation.hasSpecialChar ? <CheckIcon className="w-3 h-3 mr-1" /> : <XMarkIcon className="w-3 h-3 mr-1" />}
                        Mindestens ein Sonderzeichen
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Passwort bestätigen
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="input pl-10 pr-10"
                      placeholder="Passwort wiederholen"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading || !passwordValidation.isValid}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Registrierung läuft...
                      </>
                    ) : (
                      'Konto erstellen'
                    )}
                  </button>
                </div>
              </form>
              )}

              {/* Success State - Show when registration is successful */}
              {success && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Registrierung erfolgreich!
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    Wir haben Ihnen eine E-Mail zur Bestätigung Ihrer E-Mail-Adresse gesendet. 
                    Bitte überprüfen Sie Ihren Posteingang und klicken Sie auf den Bestätigungslink.
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Zur Anmeldung
                    </Link>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setSuccess('')
                          setFormData({
                            email: '',
                            password: '',
                            confirmPassword: '',
                            firstName: '',
                            lastName: '',
                            role: 'helper'
                          })
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Erneut registrieren
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Link - Only show when not in success state */}
              {!success && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Bereits ein Konto?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                      Hier anmelden
                    </Link>
                  </p>
                </div>
              )}

              {/* Back to Login */}
              <div className="mt-4 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-1" />
                  Zurück zur Anmeldung
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              © 2024 Edupe Digital. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 