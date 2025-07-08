// components/Layout.js
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  BeakerIcon,
  FireIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Übersicht', href: '/', icon: HomeIcon },
  { name: 'Warmwasser', href: '/warmwater', icon: BeakerIcon },
  { name: 'Heizung', href: '/heating', icon: FireIcon },
  { name: 'Statistiken', href: '/statistics', icon: ChartBarIcon },
  { name: 'System', href: '/system', icon: Cog6ToothIcon },
]

export default function Layout({ children }) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 safe-top">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg">
                <FireIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Heizungssteuerung</h1>
                <p className="text-xs text-gray-500">Smart Home Control</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-700" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block border-t border-gray-100">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 py-2">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-72 glass-dark z-50 lg:hidden safe-right"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-semibold text-white">Navigation</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = router.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-white/20 text-white font-medium'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 pb-20 safe-bottom">
        <motion.div
          key={router.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}