// components/Error.js
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon, 
  XCircleIcon,
  WifiIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline'

export function ErrorMessage({ 
  title = 'Ein Fehler ist aufgetreten', 
  message = 'Bitte versuchen Sie es später erneut.',
  type = 'error',
  onRetry 
}) {
  const icons = {
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    network: WifiIcon,
  }

  const Icon = icons[type] || XCircleIcon

  const colorClasses = {
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    network: 'bg-blue-50 text-blue-800 border-blue-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${colorClasses[type]}`}
    >
      <div className="flex gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm mt-1 opacity-90">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Erneut versuchen
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function ErrorCard({ 
  title = 'Fehler beim Laden der Daten',
  message = 'Die angeforderten Daten konnten nicht geladen werden.',
  onRetry 
}) {
  return (
    <div className="card p-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircleIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            <ArrowPathIcon className="w-4 h-4" />
            Erneut versuchen
          </button>
        )}
      </div>
    </div>
  )
}

export function ConnectionError({ onRetry }) {
  return (
    <ErrorCard
      title="Keine Verbindung"
      message="Es konnte keine Verbindung zum Server hergestellt werden. Bitte überprüfen Sie Ihre Internetverbindung."
      onRetry={onRetry}
    />
  )
}