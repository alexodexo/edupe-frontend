// src/components/SearchFilter.js
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  TagIcon,
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { useLocalStorage } from '@/hooks/useData'

// Main Search and Filter Component
export default function SearchFilter({
  searchPlaceholder = 'Suchen...',
  searchValue = '',
  onSearchChange,
  filters = [],
  selectedFilters = {},
  onFilterChange,
  onClearAll,
  showSavedSearches = true,
  savedSearches = [],
  onSaveSearch,
  className = ''
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchValue)
  const [showSaveSearch, setShowSaveSearch] = useState(false)
  const [saveSearchName, setSaveSearchName] = useState('')

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(searchInput)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, onSearchChange])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(selectedFilters).filter(value => 
      value && value !== 'all' && value !== ''
    ).length
  }, [selectedFilters])

  const handleSaveSearch = () => {
    if (saveSearchName.trim() && onSaveSearch) {
      onSaveSearch({
        name: saveSearchName,
        query: searchInput,
        filters: selectedFilters,
        timestamp: new Date().toISOString()
      })
      setSaveSearchName('')
      setShowSaveSearch(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input pl-10 pr-24"
        />
        
        {/* Filter Toggle */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isFilterOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showSavedSearches && savedSearches.length > 0 && (
            <SavedSearchDropdown
              searches={savedSearches}
              onSelect={(search) => {
                setSearchInput(search.query || '')
                if (onFilterChange) {
                  Object.entries(search.filters || {}).forEach(([key, value]) => {
                    onFilterChange(key, value)
                  })
                }
              }}
            />
          )}
          
          {(searchInput || activeFilterCount > 0) && (
            <button
              onClick={() => setShowSaveSearch(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Suche speichern
            </button>
          )}
        </div>

        {(searchInput || activeFilterCount > 0) && (
          <button
            onClick={() => {
              setSearchInput('')
              if (onClearAll) onClearAll()
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Alle Filter löschen
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <FilterPanel
              filters={filters}
              selectedFilters={selectedFilters}
              onFilterChange={onFilterChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Search Modal */}
      {showSaveSearch && (
        <SaveSearchModal
          value={saveSearchName}
          onChange={setSaveSearchName}
          onSave={handleSaveSearch}
          onCancel={() => setShowSaveSearch(false)}
        />
      )}
    </div>
  )
}

// Filter Panel Component
function FilterPanel({ filters, selectedFilters, onFilterChange }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">Erweiterte Filter</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <FilterInput
            key={filter.key}
            filter={filter}
            value={selectedFilters[filter.key]}
            onChange={(value) => onFilterChange(filter.key, value)}
          />
        ))}
      </div>
    </div>
  )
}

// Individual Filter Input Component
function FilterInput({ filter, value, onChange }) {
  const { type, key, label, options, placeholder, icon: Icon } = filter

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={value || 'all'}
            onChange={(e) => onChange(e.target.value)}
            className="input text-sm"
          >
            <option value="all">Alle {label}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <MultiSelectDropdown
            options={options || []}
            selected={Array.isArray(value) ? value : []}
            onChange={onChange}
            placeholder={`${label} auswählen`}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input text-sm"
          />
        )

      case 'daterange':
        const [start, end] = Array.isArray(value) ? value : ['', '']
        return (
          <div className="flex gap-2">
            <input
              type="date"
              value={start}
              onChange={(e) => onChange([e.target.value, end])}
              className="input text-sm flex-1"
              placeholder="Von"
            />
            <input
              type="date"
              value={end}
              onChange={(e) => onChange([start, e.target.value])}
              className="input text-sm flex-1"
              placeholder="Bis"
            />
          </div>
        )

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="input text-sm"
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="input text-sm"
          />
        )

      case 'range':
        const [min, max] = Array.isArray(value) ? value : ['', '']
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={min}
              onChange={(e) => onChange([e.target.value, max])}
              placeholder="Min"
              className="input text-sm flex-1"
            />
            <input
              type="number"
              value={max}
              onChange={(e) => onChange([min, e.target.value])}
              placeholder="Max"
              className="input text-sm flex-1"
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </div>
      </label>
      {renderInput()}
    </div>
  )
}

// Multi-Select Dropdown Component
function MultiSelectDropdown({ options, selected, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOption = (optionValue) => {
    const newSelected = selected.includes(optionValue)
      ? selected.filter(val => val !== optionValue)
      : [...selected, optionValue]
    onChange(newSelected)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="input text-sm w-full text-left flex items-center justify-between"
      >
        <span className="truncate">
          {selected.length > 0 
            ? `${selected.length} ausgewählt`
            : placeholder
          }
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="text-sm">{option.label}</span>
                {selected.includes(option.value) && (
                  <CheckIcon className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Saved Search Dropdown
function SavedSearchDropdown({ searches, onSelect }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
      >
        Gespeicherte Suchen
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <div className="p-2">
              {searches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(search)
                    setIsOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg"
                >
                  <div className="font-medium text-sm">{search.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {search.query && `"${search.query}"`}
                    {Object.keys(search.filters || {}).length > 0 && 
                      ` • ${Object.keys(search.filters).length} Filter`
                    }
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Save Search Modal
function SaveSearchModal({ value, onChange, onSave, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 shadow-2xl"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Suche speichern</h3>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Name für die Suche eingeben..."
            className="input mb-4"
            autoFocus
          />
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1">
              Abbrechen
            </button>
            <button 
              onClick={onSave} 
              disabled={!value.trim()}
              className="btn-primary flex-1"
            >
              Speichern
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

// Hook for managing search and filter state
export function useSearchFilter(initialFilters = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [savedSearches, setSavedSearches] = useLocalStorage('saved_searches', [])

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilters(initialFilters)
  }, [initialFilters])

  const saveSearch = useCallback((search) => {
    setSavedSearches(prev => [...prev, search])
  }, [setSavedSearches])

  const deleteSavedSearch = useCallback((index) => {
    setSavedSearches(prev => prev.filter((_, i) => i !== index))
  }, [setSavedSearches])

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    savedSearches,
    saveSearch,
    deleteSavedSearch
  }
}

// Predefined filter configurations for different entities
export const filterConfigs = {
  cases: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      icon: TagIcon,
      options: [
        { value: 'active', label: 'Aktiv' },
        { value: 'paused', label: 'Pausiert' },
        { value: 'completed', label: 'Abgeschlossen' },
        { value: 'cancelled', label: 'Abgebrochen' }
      ]
    },
    {
      key: 'priority',
      label: 'Priorität',
      type: 'select',
      icon: TagIcon,
      options: [
        { value: 'urgent', label: 'Dringend' },
        { value: 'high', label: 'Hoch' },
        { value: 'medium', label: 'Mittel' },
        { value: 'low', label: 'Niedrig' }
      ]
    },
    {
      key: 'jugendamt',
      label: 'Jugendamt',
      type: 'select',
      icon: BuildingOfficeIcon,
      options: [
        { value: 'ja_frankfurt', label: 'Jugendamt Frankfurt' },
        { value: 'ja_offenbach', label: 'Jugendamt Offenbach' },
        { value: 'ja_hanau', label: 'Jugendamt Hanau' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Zeitraum',
      type: 'daterange',
      icon: CalendarIcon
    }
  ],

  helpers: [
    {
      key: 'availability',
      label: 'Verfügbarkeit',
      type: 'select',
      icon: UserIcon,
      options: [
        { value: 'available', label: 'Verfügbar' },
        { value: 'partially_available', label: 'Teilweise verfügbar' },
        { value: 'unavailable', label: 'Nicht verfügbar' }
      ]
    },
    {
      key: 'qualifications',
      label: 'Qualifikationen',
      type: 'multiselect',
      icon: TagIcon,
      options: [
        { value: 'familienhelfer', label: 'Familienhelfer' },
        { value: 'erziehungsbeistand', label: 'Erziehungsbeistand' },
        { value: 'sozialpaedagoge', label: 'Sozialpädagoge' },
        { value: 'sozialarbeiter', label: 'Sozialarbeiter' }
      ]
    },
    {
      key: 'ratingMin',
      label: 'Mindestbewertung',
      type: 'number',
      icon: TagIcon,
      placeholder: '4.0'
    }
  ],

  services: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      icon: TagIcon,
      options: [
        { value: 'submitted', label: 'Eingereicht' },
        { value: 'approved', label: 'Genehmigt' },
        { value: 'rejected', label: 'Abgelehnt' }
      ]
    },
    {
      key: 'type',
      label: 'Typ',
      type: 'select',
      icon: TagIcon,
      options: [
        { value: 'with_client_face_to_face', label: 'Face-to-Face' },
        { value: 'with_client_remote', label: 'Remote' },
        { value: 'without_client', label: 'Ohne Klient' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Zeitraum',
      type: 'daterange',
      icon: CalendarIcon
    },
    {
      key: 'durationRange',
      label: 'Dauer (Stunden)',
      type: 'range',
      icon: TagIcon
    }
  ]
}