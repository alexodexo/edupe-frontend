// src/lib/auth.js
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      
      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = (userData, token) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_data', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
    router.push('/login')
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasPermission = (permission) => {
    // Define role-based permissions
    const permissions = {
      admin: ['all'],
      helper: ['view_own_cases', 'create_services', 'view_own_services'],
      jugendamt: ['view_own_cases', 'view_reports', 'view_invoices']
    }

    const userPermissions = permissions[user?.role] || []
    return userPermissions.includes('all') || userPermissions.includes(permission)
  }

  const value = {
    user,
    loading,
    login,
    logout,
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
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login')
      } else if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized')
      }
    }, [user, loading, router])

    if (loading) {
      return <LoadingScreen />
    }

    if (!user) {
      return null
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
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
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Keine Berechtigung</h1>
        <p className="text-gray-600 mb-4">Sie haben keine Berechtigung für diese Seite.</p>
        <button
          onClick={() => window.history.back()}
          className="btn-primary"
        >
          Zurück
        </button>
      </div>
    </div>
  )
}

// Protected Layout Component
export function ProtectedLayout({ children, allowedRoles = [] }) {
  return (
    <AuthProvider>
      {withAuth(() => children, allowedRoles)()}
    </AuthProvider>
  )
}