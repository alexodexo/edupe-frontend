// src/components/Layout.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/auth'
import GlobalSearch from './GlobalSearch'
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  Cog6ToothIcon,
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

// Simple XMarkIcon component as fallback
const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// Define navigation based on user role
const getNavigationItems = (userRole, hasPermission) => {
  const baseItems = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['admin', 'helper', 'jugendamt'] }
  ]

  const adminItems = [
    { name: 'Fälle', href: '/cases', icon: ClipboardDocumentListIcon, roles: ['admin', 'helper', 'jugendamt'] },
    { name: 'Helfer', href: '/helpers', icon: UsersIcon, roles: ['admin'] },
    { name: 'Berichte', href: '/reports', icon: DocumentTextIcon, roles: ['admin', 'jugendamt'] },
    { name: 'Abrechnungen', href: '/billing', icon: CurrencyEuroIcon, roles: ['admin', 'jugendamt'] },
    { name: 'Einstellungen', href: '/settings', icon: Cog6ToothIcon, roles: ['admin'] }
  ]

  const helperItems = [
    { name: 'Meine Fälle', href: '/cases', icon: ClipboardDocumentListIcon, roles: ['helper'] },
    { name: 'Meine Services', href: '/services', icon: ClockIcon, roles: ['helper'] },
    { name: 'Urlaub', href: '/vacation', icon: CalendarDaysIcon, roles: ['helper'] },
    { name: 'Profil', href: '/settings', icon: UserCircleIcon, roles: ['helper'] }
  ]

  const jugendamtItems = [
    { name: 'Unsere Fälle', href: '/cases', icon: ClipboardDocumentListIcon, roles: ['jugendamt'] },
    { name: 'Berichte', href: '/reports', icon: DocumentTextIcon, roles: ['jugendamt'] },
    { name: 'Freigaben', href: '/billing', icon: CurrencyEuroIcon, roles: ['jugendamt'] }
  ]

  let allItems = [...baseItems]
  
  if (userRole === 'admin') {
    allItems = [...allItems, ...adminItems]
  } else if (userRole === 'helper') {
    allItems = [...allItems, ...helperItems]
  } else if (userRole === 'jugendamt') {
    allItems = [...allItems, ...jugendamtItems]
  }

  return allItems.filter(item => item.roles.includes(userRole))
}

export default function Layout({ children }) {
  const router = useRouter()
  const { user, userRole, userProfile, signOut, isAuthenticated, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle authentication redirect
  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [mounted, loading, isAuthenticated, router])

  // Don't render anything until mounted and auth is resolved
  if (!mounted || loading) {
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

  // Redirect to login if not authenticated (client-side only)
  if (!isAuthenticated) {
    return null
  }

  const navigation = getNavigationItems(userRole, () => true)
  
  const handleSignOut = async () => {
    if (isSigningOut) return // Verhindere mehrfache Klicks
    
    setIsSigningOut(true)
    try {
      await signOut()
      // Manuelle Weiterleitung als Fallback
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Auch bei Fehler zur Login-Seite weiterleiten
      router.push('/login')
    } finally {
      setIsSigningOut(false)
    }
  }

  const getUserDisplayName = () => {
    if (userRole === 'helper') {
      return `${userProfile?.vorname || ''} ${userProfile?.nachname || ''}`.trim() || 'Helfer'
    } else if (userRole === 'jugendamt') {
      return userProfile?.name || user?.email || 'Jugendamt'
    }
    return user?.email || 'Admin'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    if (name === 'Helfer' || name === 'Jugendamt' || name === 'Admin') {
      return name.slice(0, 2).toUpperCase()
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin': return 'Administrator'
      case 'helper': return 'Helfer'
      case 'jugendamt': return 'Jugendamt'
      default: return 'Benutzer'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Edupe Digital</h1>
                <p className="text-xs text-gray-500">Helfervermittlung</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">{getUserInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500">{getRoleLabel()}</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Abmelden...
                </>
              ) : (
                <>
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Abmelden
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            </button>

            <div className="flex-1 flex items-center gap-4 max-w-2xl">
              <GlobalSearch />
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <BellIcon className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User menu for mobile */}
              <div className="lg:hidden">
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-xs">{getUserInitials()}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}