// src/pages/auth/reset-password.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function ResetPassword() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    if (!formData.password || !formData.confirmPassword) {
      setError('Bitte füllen Sie alle Felder aus')
      return
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
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) throw error

      setSuccess('Passwort wurde erfolgreich geändert! Sie werden zur Anmeldung weitergeleitet...')
      
      // Clear form
      setFormData({
        password: '',
        confirmPassword: ''
      })

      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      console.error('Password reset error:', error)
      setError(error.message || 'Fehler beim Zurücksetzen des Passworts')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Passwort zurücksetzen - Edupe Digital</title>
        <meta name="description" content="Passwort zurücksetzen für Edupe Digital" />
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
              Passwort zurücksetzen
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Geben Sie Ihr neues Passwort ein
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
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Neues Passwort
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
                      placeholder="Ihr neues Passwort"
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
                        Passwort wird geändert...
                      </>
                    ) : (
                      'Passwort ändern'
                    )}
                  </button>
                </div>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
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