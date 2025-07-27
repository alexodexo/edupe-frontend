// src/lib/auth.js
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, getUserRole, getHelferProfile, getJugendamtProfile } from './supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setupUser(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await setupUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setUserRole(null)
          setUserProfile(null)
          setLoading(false)
        } else if (event === 'USER_UPDATED' && session?.user) {
          await setupUser(session.user)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const setupUser = async (authUser) => {
    try {
      setUser(authUser)
      
      // Determine user role
      const role = await getUserRole(authUser)
      setUserRole(role)

      // Get user profile based on role
      let profile = null
      if (role === 'helper') {
        const { data } = await supabase
          .from('helfer')
          .select('*')
          .eq('email', authUser.email)
          .single()
        profile = data
      } else if (role === 'jugendamt') {
        const { data } = await supabase
          .from('jugendamt_ansprechpartner')
          .select('*')
          .eq('mail', authUser.email)
          .single()
        profile = data
      }
      // For admin, we use the auth user data
      
      setUserProfile(profile || { 
        name: authUser.user_metadata?.name || authUser.email,
        email: authUser.email 
      })
      
    } catch (error) {
      console.error('Error setting up user:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // State zurücksetzen
      setUser(null)
      setUserRole(null)
      setUserProfile(null)
      
      // Zur Login-Seite weiterleiten
      router.push('/login')
    } catch (error) {
      console.error('SignOut error:', error)
      // Auch bei Fehler zur Login-Seite weiterleiten
      router.push('/login')
    }
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) throw error
  }

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
  }

  const hasRole = (role) => {
    return userRole === role
  }

  const hasPermission = (permission) => {
    // Define role-based permissions
    const permissions = {
      admin: ['all'],
      helper: [
        'view_own_cases', 
        'create_services', 
        'view_own_services',
        'edit_own_profile'
      ],
      jugendamt: [
        'view_own_cases', 
        'view_reports', 
        'view_invoices',
        'approve_services'
      ]
    }

    const userPermissions = permissions[userRole] || []
    return userPermissions.includes('all') || userPermissions.includes(permission)
  }

  const value = {
    user,
    userRole,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    hasRole,
    hasPermission,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth(WrappedComponent, allowedRoles = []) {
  return function ProtectedRoute(props) {
    const { user, userRole, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login')
      } else if (user && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        router.push('/unauthorized')
      }
    }, [user, userRole, loading, router])

    if (loading) {
      return <LoadingScreen />
    }

    if (!user) {
      return null
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <UnauthorizedScreen />
    }

    return <WrappedComponent {...props} />
  }
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

// Unauthorized Screen Component
function UnauthorizedScreen() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Keine Berechtigung</h1>
        <p className="text-gray-600 mb-4">Sie haben keine Berechtigung für diese Seite.</p>
        <button
          onClick={() => router.push('/')}
          className="btn-primary"
        >
          Zum Dashboard
        </button>
      </div>
    </div>
  )
}