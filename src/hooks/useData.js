// src/hooks/useData.js
import { useState, useEffect, useMemo, useCallback } from 'react'
import useSWR from 'swr'
import { 
  DUMMY_CASES, 
  DUMMY_HELPERS, 
  DUMMY_SERVICES,
  CASE_STATUS,
  HELPER_AVAILABILITY,
  SERVICE_STATUS
} from '@/lib/types'

// Generic fetcher function (will be replaced with actual API calls)
const fetcher = async (url) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Mock API responses based on URL
  switch (url) {
    case '/api/cases':
      return DUMMY_CASES
    case '/api/helpers':
      return DUMMY_HELPERS
    case '/api/services':
      return DUMMY_SERVICES
    default:
      throw new Error(`Unknown endpoint: ${url}`)
  }
}

// Cases Hooks
export function useCases() {
  const { data, error, mutate } = useSWR('/api/cases', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  })

  const enhancedCases = useMemo(() => {
    if (!data) return []
    
    return data.map(case_ => {
      // Get assigned helpers
      const assignedHelpers = DUMMY_HELPERS.filter(helper => 
        case_.assignedHelpers?.includes(helper.id)
      )
      
      // Get case services
      const caseServices = DUMMY_SERVICES.filter(service => 
        service.caseId === case_.id
      )
      
      // Calculate progress
      const usedHours = caseServices.reduce((sum, service) => sum + service.duration, 0)
      const progress = case_.plannedHours ? (usedHours / case_.plannedHours) * 100 : 0
      
      // Calculate costs
      const totalCosts = caseServices.reduce((sum, service) => sum + service.costs, 0)
      
      return {
        ...case_,
        assignedHelpersData: assignedHelpers,
        services: caseServices,
        usedHours: Math.round(usedHours * 10) / 10,
        progress: Math.min(progress, 100),
        totalCosts,
        lastActivity: caseServices.length > 0 
          ? Math.max(...caseServices.map(s => new Date(s.createdAt).getTime()))
          : new Date(case_.updatedAt).getTime()
      }
    })
  }, [data])

  const stats = useMemo(() => {
    if (!enhancedCases.length) return {
      total: 0,
      active: 0,
      paused: 0,
      completed: 0
    }

    return {
      total: enhancedCases.length,
      active: enhancedCases.filter(c => c.status === CASE_STATUS.ACTIVE).length,
      paused: enhancedCases.filter(c => c.status === CASE_STATUS.PAUSED).length,
      completed: enhancedCases.filter(c => c.status === CASE_STATUS.COMPLETED).length
    }
  }, [enhancedCases])

  return {
    cases: enhancedCases,
    stats,
    isLoading: !error && !data,
    error,
    refresh: mutate
  }
}

export function useCase(caseId) {
  const { cases, isLoading, error } = useCases()
  
  const case_ = useMemo(() => {
    return cases.find(c => c.id === caseId) || null
  }, [cases, caseId])

  return {
    case: case_,
    isLoading,
    error
  }
}

// Helpers Hooks
export function useHelpers() {
  const { data, error, mutate } = useSWR('/api/helpers', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  })

  const enhancedHelpers = useMemo(() => {
    if (!data) return []
    
    return data.map(helper => {
      // Get helper cases
      const helperCases = DUMMY_CASES.filter(case_ => 
        case_.assignedHelpers?.includes(helper.id)
      )
      
      // Get helper services
      const helperServices = DUMMY_SERVICES.filter(service => 
        service.helperId === helper.id
      )
      
      // Calculate this month's stats
      const thisMonth = new Date()
      const thisMonthServices = helperServices.filter(service => {
        const serviceDate = new Date(service.date)
        return serviceDate.getMonth() === thisMonth.getMonth() &&
               serviceDate.getFullYear() === thisMonth.getFullYear()
      })
      
      const thisMonthHours = thisMonthServices.reduce((sum, service) => sum + service.duration, 0)
      const thisMonthRevenue = thisMonthHours * helper.hourlyRate
      
      // Last activity
      const lastActivity = helperServices.length > 0 
        ? Math.max(...helperServices.map(s => new Date(s.createdAt).getTime()))
        : new Date(helper.updatedAt).getTime()
      
      // Document compliance
      const expiredDocs = helper.documents?.filter(doc => 
        new Date(doc.validUntil) < new Date()
      ).length || 0
      
      const expiringSoonDocs = helper.documents?.filter(doc => {
        const validUntil = new Date(doc.validUntil)
        const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        return validUntil > new Date() && validUntil <= in30Days
      }).length || 0

      return {
        ...helper,
        assignedCases: helperCases,
        services: helperServices,
        activeCases: helperCases.filter(c => c.status === CASE_STATUS.ACTIVE).length,
        thisMonthHours: Math.round(thisMonthHours * 10) / 10,
        thisMonthRevenue,
        lastActivity: new Date(lastActivity),
        complianceStatus: expiredDocs > 0 ? 'expired' : expiringSoonDocs > 0 ? 'expiring' : 'valid',
        expiredDocs,
        expiringSoonDocs
      }
    })
  }, [data])

  const stats = useMemo(() => {
    if (!enhancedHelpers.length) return {
      total: 0,
      available: 0,
      partiallyAvailable: 0,
      unavailable: 0,
      complianceIssues: 0
    }

    return {
      total: enhancedHelpers.length,
      available: enhancedHelpers.filter(h => h.availability === HELPER_AVAILABILITY.AVAILABLE).length,
      partiallyAvailable: enhancedHelpers.filter(h => h.availability === HELPER_AVAILABILITY.PARTIALLY_AVAILABLE).length,
      unavailable: enhancedHelpers.filter(h => h.availability === HELPER_AVAILABILITY.UNAVAILABLE).length,
      complianceIssues: enhancedHelpers.filter(h => h.complianceStatus !== 'valid').length
    }
  }, [enhancedHelpers])

  return {
    helpers: enhancedHelpers,
    stats,
    isLoading: !error && !data,
    error,
    refresh: mutate
  }
}

export function useHelper(helperId) {
  const { helpers, isLoading, error } = useHelpers()
  
  const helper = useMemo(() => {
    return helpers.find(h => h.id === helperId) || null
  }, [helpers, helperId])

  return {
    helper,
    isLoading,
    error
  }
}

// Services Hooks
export function useServices(filters = {}) {
  const { data, error, mutate } = useSWR('/api/services', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true
  })

  const enhancedServices = useMemo(() => {
    if (!data) return []
    
    return data.map(service => {
      const case_ = DUMMY_CASES.find(c => c.id === service.caseId)
      const helper = DUMMY_HELPERS.find(h => h.id === service.helperId)
      
      return {
        ...service,
        case: case_,
        helper: helper,
        isPendingApproval: service.status === SERVICE_STATUS.SUBMITTED,
        isApproved: service.status === SERVICE_STATUS.APPROVED,
        isRejected: service.status === SERVICE_STATUS.REJECTED
      }
    })
  }, [data])

  const filteredServices = useMemo(() => {
    let result = enhancedServices

    if (filters.status) {
      result = result.filter(service => service.status === filters.status)
    }

    if (filters.helperId) {
      result = result.filter(service => service.helperId === filters.helperId)
    }

    if (filters.caseId) {
      result = result.filter(service => service.caseId === filters.caseId)
    }

    if (filters.dateFrom) {
      result = result.filter(service => new Date(service.date) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      result = result.filter(service => new Date(service.date) <= new Date(filters.dateTo))
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [enhancedServices, filters])

  const stats = useMemo(() => {
    if (!enhancedServices.length) return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalHours: 0,
      totalCosts: 0
    }

    const totalHours = enhancedServices.reduce((sum, service) => sum + service.duration, 0)
    const totalCosts = enhancedServices.reduce((sum, service) => sum + service.costs, 0)

    return {
      total: enhancedServices.length,
      pending: enhancedServices.filter(s => s.status === SERVICE_STATUS.SUBMITTED).length,
      approved: enhancedServices.filter(s => s.status === SERVICE_STATUS.APPROVED).length,
      rejected: enhancedServices.filter(s => s.status === SERVICE_STATUS.REJECTED).length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalCosts
    }
  }, [enhancedServices])

  return {
    services: filteredServices,
    allServices: enhancedServices,
    stats,
    isLoading: !error && !data,
    error,
    refresh: mutate
  }
}

// Dashboard Data Hook
export function useDashboardData() {
  const { cases, stats: caseStats } = useCases()
  const { helpers, stats: helperStats } = useHelpers()
  const { services, stats: serviceStats } = useServices()

  const recentActivities = useMemo(() => {
    const activities = []

    // Add recent cases
    cases.slice(0, 3).forEach(case_ => {
      activities.push({
        id: `case-${case_.id}`,
        type: 'case_created',
        title: `Neuer Fall: ${case_.title}`,
        description: case_.jugendamt.name,
        time: case_.createdAt,
        icon: 'case',
        color: 'blue'
      })
    })

    // Add recent services
    services.slice(0, 5).forEach(service => {
      activities.push({
        id: `service-${service.id}`,
        type: 'service_completed',
        title: `Service abgeschlossen: ${service.duration}h`,
        description: `${service.helper?.firstName} ${service.helper?.lastName} • ${service.case?.caseNumber}`,
        time: service.createdAt,
        icon: 'service',
        color: 'green'
      })
    })

    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8)
  }, [cases, services])

  const urgentNotifications = useMemo(() => {
    const notifications = []

    // Check for urgent cases
    const urgentCases = cases.filter(c => c.priority === 'urgent' && c.status === CASE_STATUS.ACTIVE)
    urgentCases.forEach(case_ => {
      notifications.push({
        id: `urgent-${case_.id}`,
        type: 'urgent_case',
        title: 'Dringender Fall benötigt Aufmerksamkeit',
        description: `${case_.title} - ${case_.jugendamt.name}`,
        priority: 'high'
      })
    })

    // Check for pending approvals
    const pendingServices = services.filter(s => s.status === SERVICE_STATUS.SUBMITTED)
    if (pendingServices.length > 0) {
      notifications.push({
        id: 'pending-services',
        type: 'pending_approvals',
        title: `${pendingServices.length} Services zur Freigabe`,
        description: 'Stundeneinträge warten auf Genehmigung',
        priority: 'medium'
      })
    }

    // Check for compliance issues
    const complianceIssues = helpers.filter(h => h.complianceStatus === 'expired')
    if (complianceIssues.length > 0) {
      notifications.push({
        id: 'compliance-issues',
        type: 'compliance',
        title: `${complianceIssues.length} Helfer mit abgelaufenen Dokumenten`,
        description: 'Dokumente müssen erneuert werden',
        priority: 'high'
      })
    }

    return notifications
  }, [cases, services, helpers])

  return {
    stats: {
      cases: caseStats,
      helpers: helperStats,
      services: serviceStats
    },
    recentActivities,
    urgentNotifications,
    isLoading: !cases.length && !helpers.length && !services.length
  }
}

// Travel Time Validation Hook
export function useTravelTimeValidation() {
  const [isCalculating, setIsCalculating] = useState(false)
  
  const calculateTravelTime = useCallback(async (fromLocation, toLocation) => {
    if (!fromLocation || !toLocation || fromLocation === toLocation) {
      return 0
    }

    setIsCalculating(true)
    
    try {
      // Mock calculation - in production this would use Google Maps API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock travel time based on location similarity
      const mockTime = Math.floor(Math.random() * 45) + 15 // 15-60 minutes
      return mockTime
    } catch (error) {
      console.error('Error calculating travel time:', error)
      return 30 // Default fallback
    } finally {
      setIsCalculating(false)
    }
  }, [])

  const validateServiceTiming = useCallback(async (newService, lastService) => {
    if (!lastService) {
      return { isValid: true, errors: [], warnings: [] }
    }

    const errors = []
    const warnings = []
    
    const newDateTime = new Date(`${newService.date}T${newService.startTime}`)
    const lastEndTime = new Date(`${lastService.date}T${lastService.endTime}`)
    
    // Check if new service is after last service
    if (newDateTime <= lastEndTime) {
      errors.push('Service-Zeit überschneidet sich mit vorherigem Service')
      return { isValid: false, errors, warnings }
    }

    const timeDifference = (newDateTime - lastEndTime) / (1000 * 60) // minutes

    // If locations are different, calculate travel time
    if (lastService.location !== newService.location) {
      const travelTime = await calculateTravelTime(lastService.location, newService.location)
      
      if (timeDifference < travelTime) {
        errors.push(`Zu wenig Zeit für Anfahrt. Mindestens ${travelTime} Minuten erforderlich.`)
        return { 
          isValid: false, 
          errors, 
          warnings, 
          travelTime,
          suggestedStartTime: new Date(lastEndTime.getTime() + travelTime * 60000)
        }
      }
    } else if (timeDifference < 15) {
      warnings.push('Weniger als 15 Minuten seit letztem Service am gleichen Ort')
    }

    return { isValid: true, errors, warnings }
  }, [calculateTravelTime])

  return {
    calculateTravelTime,
    validateServiceTiming,
    isCalculating
  }
}

// Form Validation Hook
export function useFormValidation(schema) {
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validate = useCallback((values) => {
    const newErrors = {}

    Object.keys(schema).forEach(field => {
      const rules = schema[field]
      const value = values[field]

      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = rules.message || `${field} ist erforderlich`
        return
      }

      if (value && rules.minLength && value.toString().length < rules.minLength) {
        newErrors[field] = `Mindestens ${rules.minLength} Zeichen erforderlich`
        return
      }

      if (value && rules.maxLength && value.toString().length > rules.maxLength) {
        newErrors[field] = `Maximal ${rules.maxLength} Zeichen erlaubt`
        return
      }

      if (value && rules.pattern && !rules.pattern.test(value)) {
        newErrors[field] = rules.message || 'Ungültiges Format'
        return
      }

      if (rules.custom) {
        const customError = rules.custom(value, values)
        if (customError) {
          newErrors[field] = customError
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [schema])

  const touch = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  const reset = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  return {
    errors,
    touched,
    validate,
    touch,
    reset,
    hasErrors: Object.keys(errors).length > 0,
    getFieldError: (field) => touched[field] ? errors[field] : undefined
  }
}

// Local Storage Hook
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') return initialValue
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}