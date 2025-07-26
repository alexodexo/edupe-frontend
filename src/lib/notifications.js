// src/lib/notifications.js
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Create notification context
const NotificationContext = createContext()

// Notification provider
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      autoClose: true,
      duration: 5000,
      ...notification
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto remove notification
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'Erfolgreich',
      message,
      ...options
    })
  }, [addNotification])

  const error = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title: 'Fehler',
      message,
      autoClose: false,
      ...options
    })
  }, [addNotification])

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title: 'Warnung',
      message,
      ...options
    })
  }, [addNotification])

  const info = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title: 'Information',
      message,
      ...options
    })
  }, [addNotification])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Notification container component
function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-full max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual notification item
function NotificationItem({ notification, onClose }) {
  const { type, title, message, action } = notification

  const getIcon = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />
      case NOTIFICATION_TYPES.ERROR:
        return <XCircleIcon className="w-6 h-6 text-red-600" />
      case NOTIFICATION_TYPES.WARNING:
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-50 border-green-200'
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-50 border-red-200'
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative p-4 rounded-xl border shadow-lg ${getBackgroundColor()}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <p className="text-gray-700 text-sm mt-1">{message}</p>
          
          {action && (
            <div className="mt-3">
              <button
                onClick={action.onClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-200/50 transition-colors"
        >
          <XMarkIcon className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </motion.div>
  )
}

// Higher-order component for automatic error handling
export function withNotifications(WrappedComponent) {
  return function NotificationWrapper(props) {
    const notifications = useNotifications()
    
    return (
      <WrappedComponent 
        {...props} 
        notifications={notifications}
      />
    )
  }
}

// Hook for API error handling
export function useApiNotifications() {
  const { success, error, warning } = useNotifications()

  const handleSuccess = useCallback((message = 'Vorgang erfolgreich abgeschlossen') => {
    success(message)
  }, [success])

  const handleError = useCallback((err, fallbackMessage = 'Ein unerwarteter Fehler ist aufgetreten') => {
    const message = err?.response?.data?.message || err?.message || fallbackMessage
    error(message)
  }, [error])

  const handleWarning = useCallback((message) => {
    warning(message)
  }, [warning])

  return {
    handleSuccess,
    handleError,
    handleWarning
  }
}

// Predefined notification messages for common actions
export const NOTIFICATION_MESSAGES = {
  // Cases
  CASE_CREATED: 'Fall wurde erfolgreich erstellt',
  CASE_UPDATED: 'Fall wurde erfolgreich aktualisiert',
  CASE_DELETED: 'Fall wurde erfolgreich gelöscht',
  CASE_ASSIGNED: 'Helfer wurde dem Fall zugewiesen',
  
  // Helpers
  HELPER_CREATED: 'Helfer wurde erfolgreich hinzugefügt',
  HELPER_UPDATED: 'Helfer-Profil wurde erfolgreich aktualisiert',
  HELPER_DELETED: 'Helfer wurde erfolgreich entfernt',
  HELPER_AVAILABILITY_CHANGED: 'Verfügbarkeit wurde erfolgreich geändert',
  
  // Services
  SERVICE_CREATED: 'Leistung wurde erfolgreich gebucht',
  SERVICE_UPDATED: 'Leistung wurde erfolgreich aktualisiert',
  SERVICE_APPROVED: 'Leistung wurde freigegeben',
  SERVICE_REJECTED: 'Leistung wurde abgelehnt',
  SERVICES_BULK_APPROVED: 'Ausgewählte Leistungen wurden freigegeben',
  SERVICES_BULK_REJECTED: 'Ausgewählte Leistungen wurden abgelehnt',
  
  // Reports
  REPORT_GENERATED: 'Bericht wurde erfolgreich generiert',
  REPORT_DOWNLOADED: 'Bericht wurde heruntergeladen',
  
  // Billing
  INVOICE_CREATED: 'Rechnung wurde erfolgreich erstellt',
  INVOICE_SENT: 'Rechnung wurde versendet',
  PAYMENT_RECEIVED: 'Zahlung wurde verbucht',
  
  // Errors
  NETWORK_ERROR: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
  VALIDATION_ERROR: 'Bitte überprüfen Sie Ihre Eingaben',
  PERMISSION_ERROR: 'Sie haben keine Berechtigung für diese Aktion',
  SERVER_ERROR: 'Server-Fehler. Bitte versuchen Sie es später erneut.',
  
  // Warnings
  UNSAVED_CHANGES: 'Sie haben ungespeicherte Änderungen',
  DOCUMENT_EXPIRED: 'Dokument ist abgelaufen und muss erneuert werden',
  TRAVEL_TIME_WARNING: 'Fahrtzeit könnte nicht ausreichen',
  HOURS_LIMIT_WARNING: 'Geplante Stunden fast erreicht'
}

// Component for displaying notification preferences
export function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: false,
    notificationTypes: {
      serviceApprovals: true,
      newCases: true,
      documentExpiry: true,
      paymentReminders: true
    }
  })

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleTypeToggle = (type) => {
    setSettings(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: !prev.notificationTypes[type]
      }
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benachrichtigungseinstellungen</h3>
        
        {/* General Settings */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">E-Mail Benachrichtigungen</label>
              <p className="text-sm text-gray-600">Erhalten Sie wichtige Updates per E-Mail</p>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Browser Benachrichtigungen</label>
              <p className="text-sm text-gray-600">Sofortige Benachrichtigungen im Browser</p>
            </div>
            <button
              onClick={() => handleToggle('pushNotifications')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-900">Ton aktiviert</label>
              <p className="text-sm text-gray-600">Akustische Signale für Benachrichtigungen</p>
            </div>
            <button
              onClick={() => handleToggle('soundEnabled')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Benachrichtigungsarten</h4>
          <div className="space-y-3">
            {Object.entries({
              serviceApprovals: 'Service-Freigaben',
              newCases: 'Neue Fälle',
              documentExpiry: 'Dokumenten-Ablauf',
              paymentReminders: 'Zahlungserinnerungen'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-gray-700">{label}</label>
                <button
                  onClick={() => handleTypeToggle(key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.notificationTypes[key] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.notificationTypes[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}