// src/pages/auth/callback.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '@/lib/supabase'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus('error')
          setMessage('Fehler bei der Authentifizierung: ' + error.message)
          return
        }

        if (data.session) {
          setStatus('success')
          setMessage('E-Mail erfolgreich bestätigt! Sie werden weitergeleitet...')
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Keine gültige Sitzung gefunden.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Ein unerwarteter Fehler ist aufgetreten.')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <>
      <Head>
        <title>E-Mail-Bestätigung - Edupe Digital</title>
        <meta name="description" content="E-Mail-Bestätigung für Edupe Digital" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
            
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">E</span>
              </div>
            </div>

            {/* Status Icon */}
            <div className="flex justify-center mb-4">
              {status === 'loading' && (
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
              )}
              {status === 'error' && (
                <XCircleIcon className="w-12 h-12 text-red-500" />
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              {status === 'loading' && 'E-Mail wird bestätigt...'}
              {status === 'success' && 'E-Mail bestätigt!'}
              {status === 'error' && 'Fehler bei der Bestätigung'}
            </h1>

            {/* Message */}
            <p className="text-center text-gray-600 mb-6">
              {status === 'loading' && 'Bitte warten Sie, während wir Ihre E-Mail-Adresse bestätigen.'}
              {status === 'success' && message}
              {status === 'error' && message}
            </p>

            {/* Action Buttons */}
            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Zur Anmeldung
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Erneut registrieren
                </button>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Sie werden automatisch weitergeleitet...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 