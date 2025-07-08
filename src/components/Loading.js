// components/Loading.js
import { motion } from 'framer-motion'

export function LoadingSpinner({ size = 'medium', color = 'primary' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }

  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500',
  }

  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClasses[size]} ${colorClasses[color]}`} />
  )
}

export function LoadingCard() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-5 w-16 rounded" />
      </div>
      <div className="skeleton h-8 w-24 mb-2" />
      <div className="skeleton h-4 w-32" />
    </div>
  )
}

export function LoadingPage({ message = 'Lade Daten...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px]"
    >
      <LoadingSpinner size="large" />
      <p className="text-gray-600 mt-4">{message}</p>
    </motion.div>
  )
}

export function LoadingTable({ rows = 5, columns = 4 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="skeleton h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <div className="skeleton h-4 w-24" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}