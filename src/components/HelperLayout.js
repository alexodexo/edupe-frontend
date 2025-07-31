// src/components/HelperLayout.js
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/auth'
import {
  HomeIcon,
  UserIcon,
  ClockIcon,
  CalendarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UserIcon as UserIconSolid,
  ClockIcon as ClockIconSolid,
  CalendarIcon as CalendarIconSolid
} from '@heroicons/react/24/solid'

const navigation = [
  {
    name: 'Dashboard',
    href: '/h',
    icon: HomeIcon,
    iconSolid: HomeIconSolid
  },
  {
    name: 'Leistung buchen',
    href: '/h/services/new',
    icon: ClockIcon,
    iconSolid: ClockIconSolid
  },
  {
    name: 'Urlaub',
    href: '/h/urlaube',
    icon: CalendarIcon,
    iconSolid: CalendarIconSolid
  },
  {
    name: 'Profil',
    href: '/h/profile',
    icon: UserIcon,
    iconSolid: UserIconSolid
  }
]

export default function HelperLayout({ children, title = "Edupe Digital" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { user, userProfile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActivePath = (href) => {
    if (href === '/h') {
      return router.pathname === '/h'
    }
    return router.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>

      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">
            {navigation.find(item => isActivePath(item.href))?.name || 'Edupe Digital'}
          </h1>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {userProfile?.vorname?.[0] || user?.email?.[0] || 'H'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.vorname} {userProfile?.nachname}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-2.5 text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => {
                    const Icon = isActivePath(item.href) ? item.iconSolid : item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActivePath(item.href)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
                <div className="py-6">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 flex-shrink-0" />
                    Abmelden
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Edupe Digital</h1>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = isActivePath(item.href) ? item.iconSolid : item.icon
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-colors ${
                            isActivePath(item.href)
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
              
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-3 py-3 border-t border-gray-200">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {userProfile?.vorname?.[0] || user?.email?.[0] || 'H'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile?.vorname} {userProfile?.nachname}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Abmelden"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
        <div className="grid grid-cols-4 py-2">
          {navigation.map((item) => {
            const Icon = isActivePath(item.href) ? item.iconSolid : item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-2 transition-colors ${
                  isActivePath(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1 font-medium leading-tight">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}