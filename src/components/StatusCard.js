// components/StatusCard.js
import { motion } from 'framer-motion'

export default function StatusCard({ 
  title, 
  value, 
  unit = '', 
  icon: Icon, 
  color = 'primary',
  trend = null,
  loading = false 
}) {
  const colorClasses = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-success to-green-600',
    warning: 'from-warning to-orange-600',
    error: 'from-error to-red-600',
  }

  if (loading) {
    return (
      <div className="stat-card">
        <div className="flex items-start justify-between mb-4">
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="skeleton h-5 w-16 rounded" />
        </div>
        <div className="skeleton h-8 w-24 mb-2" />
        <div className="skeleton h-4 w-32" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="stat-card card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className={`p-2 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        {trend !== null && (
          <div className={`text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-error'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span className="stat-value">{value}</span>
          {unit && <span className="text-lg text-gray-500">{unit}</span>}
        </div>
        <p className="stat-label">{title}</p>
      </div>
    </motion.div>
  )
}