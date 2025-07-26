// src/pages/login.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useNotifications } from '@/lib/notifications'
import { useFormValidation } from '@/hooks/useData'

export default function Login() {
  const router = useRouter()
  const { error: showError, success } = useNotifications()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState('admin') // admin, helper, jugendamt

  // Form validation schema
  const validationSchema = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    },
    password: {
      required: true,
      minLength: 6,
      message: 'Passwort muss mindestens 6 Zeichen lang sein'
    }
  }

  const { errors, touched, validate, touch, getFieldError } = useFormValidation(validationSchema)

  // Demo users for different roles
  const demoUsers = {
    admin: { email: 'admin@edupe.de', password: 'admin123', name: 'Max Administrator' },
    helper: { email: 'helper@edupe.de', password: 'helper123', name: 'Anna Helferin' },
    jugendamt: { email: 'jugendamt@frankfurt.de', password: 'jugendamt123', name: 'Jugendamt Frankfurt' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate(formData)) {
      Object.keys(formData).forEach(touch)
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check demo credentials
      const demoUser = demoUsers[userType]
      if (formData.email === demoUser.email && formData.password === demoUser.password) {
        // Store auth data (in real app this would be JWT tokens)
        localStorage.setItem('auth_token', 'demo_token_' + userType)
        localStorage.setItem('user_data', JSON.stringify({
          id: userType + '_1',
          name: demoUser.name,
          email: demoUser.email,
          role: userType
        }))

        success(`Willkommen zurück, ${demoUser.name}!`)
        router.push('/')
      } else {
        throw new Error('Ungültige Anmeldedaten')
      }
    } catch (error) {
      showError(error.message || 'Anmeldung fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (type) => {
    setUserType(type)
    setFormData({
      email: demoUsers[type].email,
      password: demoUsers[type].password,
      rememberMe: false
    })
  }

  const userTypeOptions = [
    {
      type: 'admin',
      title: 'Administrator',
      description: 'Vollzugriff auf alle Funktionen',
      icon: ShieldCheckIcon,
      color: 'blue'
    },
    {
      type: 'helper',
      title: 'Helfer',
      description: 'Zugriff auf eigene Fälle und Services',
      icon: UserIcon,
      color: 'green'
    },
    {
      type: 'jugendamt',
      title: 'Jugendamt',
      description: 'Zugriff auf eigene Fälle und Berichte',
      icon: BuildingOfficeIcon,
      color: 'purple'
    }
  ]

  return (
    <>
      <Head>
        <title>Anmelden - Edupe Digital</title>
        <meta name="description" content="Anmeldung bei Edupe Digital - Helfervermittlung im Sozialbereich" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col justify-center min-h-screen py-12 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sm:mx-auto sm:w-full sm:max-w-md"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
          >
            <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
              
              {/* User Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Anmelden als:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {userTypeOptions.map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => handleDemoLogin(option.type)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        userType === option.type
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <option.icon className={`w-5 h-5 ${
                          userType === option.type 
                            ? `text-${option.color}-600` 
                            : 'text-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{option.title}</p>
                          <p className="text-xs text-gray-600">{option.description}</p>
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
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      onBlur={() => touch('email')}
                      className={`input pl-10 ${getFieldError('email') ? 'border-red-300' : ''}`}
                      placeholder="ihre@email.de"
                    />
                  </div>
                  {getFieldError('email') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                  )}
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
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      onBlur={() => touch('password')}
                      className={`input pl-10 pr-10 ${getFieldError('password') ? 'border-red-300' : ''}`}
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
                  {getFieldError('password') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
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
                    <h3 className="text-sm font-medium text-blue-900">Demo-Modus</h3>
                    <p className="text-xs text-blue-800 mt-1">
                      Klicken Sie auf einen Benutzertyp oben, um die Demo-Anmeldedaten automatisch zu laden.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-600">
              © 2024 Edupe Digital. Alle Rechte vorbehalten.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}