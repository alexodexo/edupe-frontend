// components/ModeSelector.js
import { motion } from 'framer-motion'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function ModeSelector({ modes, selectedMode, onModeChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modes.map((mode) => (
        <motion.button
          key={mode.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onModeChange(mode.id)}
          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
            selectedMode === mode.id
              ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
          }`}
        >
          {selectedMode === mode.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4"
            >
              <CheckCircleIcon className="w-6 h-6 text-primary-500" />
            </motion.div>
          )}
          
          <div className="flex items-center gap-3 mb-3">
            {mode.icon && (
              <div className={`p-2 rounded-xl ${
                selectedMode === mode.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <mode.icon className="w-5 h-5" />
              </div>
            )}
            <h3 className="font-semibold text-gray-900">{mode.name}</h3>
          </div>
          
          <p className="text-sm text-gray-600">{mode.description}</p>
          
          {mode.details && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">{mode.details}</p>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  )
}