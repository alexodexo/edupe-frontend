// src/pages/login.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/lib/auth'
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function Login() {
  const router = useRouter()
  const { signIn, user, loading } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  // Demo users for different roles (for testing)
  const demoUsers = [
    {
      email: 'admin@edupe.de',
      label: 'Administrator Demo',
      description: 'Vollzugriff auf alle Funktionen',
      icon: ShieldCheckIcon,
      color: 'blue'
    },
    {
      email: 'helper@edupe.de',
      label: 'Helfer Demo',
      description: 'Zugriff auf eigene Fälle und Services',
      icon: UserIcon,
      color: 'green'
    },
    {
      email: 'jugendamt@frankfurt.de',
      label: 'Jugendamt Demo',
      description: 'Zugriff auf eigene Fälle und Berichte',
      icon: BuildingOfficeIcon,
      color: 'purple'
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Bitte füllen Sie alle Felder aus')
      return
    }

    setIsLoading(true)

    try {
      await signIn(formData.email, formData.password)
      // Redirect will happen automatically via useEffect when user state updates
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message || 'Anmeldung fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail) => {
    setFormData({
      ...formData,
      email: demoEmail,
      password: 'demo123' // Demo password
    })
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
        <title>Anmelden - Edupe Digital</title>
        <meta name="description" content="Anmeldung bei Edupe Digital - Helfervermittlung im Sozialbereich" />
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
              Willkommen bei Edupe Digital
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Melden Sie sich an, um fortzufahren
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

              {/* Demo Login Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Demo-Anmeldung:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {demoUsers.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => handleDemoLogin(demo.email)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${formData.email === demo.email
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <demo.icon className={`w-5 h-5 ${formData.email === demo.email
                            ? 'text-blue-600'
                            : 'text-gray-400'
                          }`} />
                        <div>
                          <p className="font-medium text-gray-900">{demo.label}</p>
                          <p className="text-xs text-gray-600">{demo.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-Mail-Adresse
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
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
                    />
                  </div>
                </div>

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
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input pl-10 pr-10"
                      placeholder="Ihr Passwort"
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
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Angemeldet bleiben
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Passwort vergessen?
                    </a>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Anmeldung läuft...
                      </>
                    ) : (
                      <>
                        Anmelden
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Demo Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Demo-Zugang</h3>
                    <p className="text-xs text-blue-800 mt-1">
                      Klicken Sie auf einen Demo-Benutzer oben und verwenden Sie das Passwort &quot;demo123&quot; für den Login.
                    </p>
                  </div>
                </div>
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