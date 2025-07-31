// src/components/GooglePlacesAutocomplete.js - Secure server-side Places API
import { useState, useEffect, useRef } from 'react'
import { MapPinIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export default function GooglePlacesAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Adresse eingeben...",
  onPlaceSelect = null,
  className = "",
  disabled = false 
}) {
  const [predictions, setPredictions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState(null)
  const [sessionToken] = useState(() => Math.random().toString(36).substring(2, 15))
  
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const debounceRef = useRef(null)

  // Debounced search function
  const searchPlaces = async (input) => {
    if (!input || input.length < 2) { // Reduced from 3 to 2 characters
      setPredictions([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}&sessionToken=${sessionToken}`)
      
      if (!response.ok) {
        throw new Error('Adresssuche fehlgeschlagen')
      }

      const data = await response.json()
      setPredictions(data.predictions || [])
      setShowDropdown(data.predictions?.length > 0)
    } catch (err) {
      console.error('Places search error:', err)
      setError('Adresssuche nicht verfügbar')
      setPredictions([])
      setShowDropdown(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input changes with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchPlaces(newValue)
    }, 300)
  }

  // Handle place selection
  const handlePlaceSelect = async (prediction) => {
    setIsLoading(true)
    setShowDropdown(false)

    try {
      // Get place details
      const response = await fetch(`/api/places/details?place_id=${prediction.place_id}&sessionToken=${sessionToken}`)
      
      if (!response.ok) {
        throw new Error('Adressdetails konnten nicht geladen werden')
      }

      const placeDetails = await response.json()
      
      // Update input value
      onChange(placeDetails.formatted_address)
      
      // Call callback with place details
      if (onPlaceSelect) {
        onPlaceSelect({
          address: placeDetails.formatted_address,
          placeId: placeDetails.place_id,
          location: placeDetails.location
        })
      }

      setPredictions([])
      setError(null)
    } catch (err) {
      console.error('Place details error:', err)
      setError('Adresse konnte nicht geladen werden')
      // Fallback: use the prediction description
      onChange(prediction.description)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
          autoComplete="off"
        />
        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {!isLoading && predictions.length > 0 && (
          <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Dropdown with predictions */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handlePlaceSelect(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start">
                <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {prediction.structured_formatting?.main_text || prediction.description}
                  </div>
                  {prediction.structured_formatting?.secondary_text && (
                    <div className="text-xs text-gray-500 truncate">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error} - Sie können die Adresse auch manuell eingeben.
        </p>
      )}

      {/* Helpful text */}
      {!error && (
        <p className="mt-2 text-xs text-gray-500">
          🔒 Sichere Adresssuche - Beginnen Sie zu tippen für Vorschläge
        </p>
      )}
    </div>
  )
}