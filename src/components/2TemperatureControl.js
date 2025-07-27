// components/TemperatureControl.js
import { useState } from 'react'
import { motion } from 'framer-motion'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function TemperatureControl({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  unit = '°C' 
}) {
  const [localValue, setLocalValue] = useState(value)

  const handleChange = (newValue) => {
    const clampedValue = Math.max(min, Math.min(max, newValue))
    setLocalValue(clampedValue)
    onChange(clampedValue)
  }

  const percentage = ((localValue - min) / (max - min)) * 100

  return (
    <div className="card p-6">
      <label className="block text-sm font-medium text-gray-700 mb-4">
        {label}
      </label>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleChange(localValue - step)}
            disabled={localValue <= min}
            className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MinusIcon className="w-5 h-5 text-gray-700" />
          </motion.button>
          
          <div className="flex-1 text-center">
            <div className="text-3xl font-bold text-gray-900">
              {localValue}
              <span className="text-xl text-gray-500 ml-1">{unit}</span>
            </div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleChange(localValue + step)}
            disabled={localValue >= max}
            className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon className="w-5 h-5 text-gray-700" />
          </motion.button>
        </div>
        
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  )
}