// src/hooks/useData.js
import { useState, useEffect, useMemo, useCallback } from 'react'
import useSWR from 'swr'
import { useAuth } from '@/lib/auth'

// Generic fetcher function for API calls
const fetcher = async (url, userId, userRole) => {
  const params = new URLSearchParams()
  if (userId) params.append('userId', userId)
  if (userRole) params.append('userRole', userRole)
  
  const fullUrl = params.toString() ? `${url}?${params.toString()}` : url
  
  const response = await fetch(fullUrl)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Cases Hooks
export function useCases() {
  const { userProfile, userRole } = useAuth()
  const userId = userProfile?.helfer_id || userProfile?.ansprechpartner_id

  const { data, error, mutate } = useSWR(
    userId && userRole ? ['/api/cases', userId, userRole] : null,
    ([url, userId, userRole]) => fetcher(url, userId, userRole),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  const stats = useMemo(() => {
    if (!data || !Array.isArray(data)) return {
      total: 0,
      active: 0,
      paused: 0,
      completed: 0
    }

    return {
      total: data.length,
      active: data.filter(c => c.status === 'in_bearbeitung').length,
      paused: data.filter(c => c.status === 'wartend').length,
      completed: data.filter(c => c.status === 'abgeschlossen').length
    }
  }, [data])

  return {
    cases: data || [],
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
  const { userProfile, userRole } = useAuth()
  const userId = userRole === 'helper' ? userProfile?.helfer_id : null

  const { data, error, mutate } = useSWR(
    ['/api/helpers', userId, userRole],
    ([url, userId, userRole]) => fetcher(url, userId, userRole),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  const stats = useMemo(() => {
    if (!data || !Array.isArray(data)) return {
      total: 0,
      available: 0,
      partiallyAvailable: 0,
      unavailable: 0,
      complianceIssues: 0
    }

    return {
      total: data.length,
      available: data.filter(h => h.availability === 'available').length,
      partiallyAvailable: data.filter(h => h.availability === 'partially_available').length,
      unavailable: data.filter(h => h.availability === 'unavailable').length,
      complianceIssues: data.filter(h => h.complianceStatus !== 'valid').length
    }
  }, [data])

  return {
    helpers: data || [],
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
  const { userProfile, userRole } = useAuth()
  const userId = userProfile?.helfer_id || userProfile?.ansprechpartner_id

  const queryString = new URLSearchParams({
    userId: userId || '',
    userRole: userRole || '',
    ...filters
  }).toString()

  const { data, error, mutate } = useSWR(
    userId && userRole ? `/api/services?${queryString}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  const stats = useMemo(() => {
    if (!data || !Array.isArray(data)) return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalHours: 0,
      totalCosts: 0
    }

    const totalHours = data.reduce((sum, service) => sum + service.duration, 0)
    const totalCosts = data.reduce((sum, service) => sum + service.costs, 0)

    return {
      total: data.length,
      pending: data.filter(s => s.status === 'submitted').length,
      approved: data.filter(s => s.status === 'approved').length,
      rejected: data.filter(s => s.status === 'rejected').length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalCosts
    }
  }, [data])

  return {
    services: data || [],
    stats,
    isLoading: !error && !data,
    error,
    refresh: mutate
  }
}

// Service approval functions
export function useServiceApproval() {
  const approveService = useCallback(async (serviceId, userId) => {
    const response = await fetch(`/api/services/${serviceId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        approved: true,
        freigegeben_von: userId
      })
    })

    if (!response.ok) {
      throw new Error('Failed to approve service')
    }

    return response.json()
  }, [])

  const rejectService = useCallback(async (serviceId, userId, reason = '') => {
    const response = await fetch(`/api/services/${serviceId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        approved: false,
        freigegeben_von: userId,
        reason
      })
    })

    if (!response.ok) {
      throw new Error('Failed to reject service')
    }

    return response.json()
  }, [])

  const bulkApprove = useCallback(async (serviceIds, userId) => {
    const response = await fetch('/api/services/bulk-approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceIds,
        freigegeben_von: userId,
        approved: true
      })
    })

    if (!response.ok) {
      throw new Error('Failed to bulk approve services')
    }

    return response.json()
  }, [])

  const bulkReject = useCallback(async (serviceIds, userId, reason = '') => {
    const response = await fetch('/api/services/bulk-approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceIds,
        freigegeben_von: userId,
        approved: false,
        reason
      })
    })

    if (!response.ok) {
      throw new Error('Failed to bulk reject services')
    }

    return response.json()
  }, [])

  return {
    approveService,
    rejectService,
    bulkApprove,
    bulkReject
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
    if (cases) {
      cases.slice(0, 3).forEach(case_ => {
        activities.push({
          id: `case-${case_.id}`,
          type: 'case_created',
          title: `Neuer Fall: ${case_.title}`,
          description: case_.client?.school || '',
          time: case_.createdAt,
          icon: 'case',
          color: 'blue'
        })
      })
    }

    // Add recent services
    if (services) {
      services.slice(0, 5).forEach(service => {
        activities.push({
          id: `service-${service.id}`,
          type: 'service_completed',
          title: `Service abgeschlossen: ${service.duration}h`,
          description: `${service.helper?.vorname} ${service.helper?.nachname} • ${service.case?.aktenzeichen}`,
          time: service.createdAt,
          icon: 'service',
          color: 'green'
        })
      })
    }

    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8)
  }, [cases, services])

  const urgentNotifications = useMemo(() => {
    const notifications = []

    // Check for pending approvals
    if (serviceStats.pending > 0) {
      notifications.push({
        id: 'pending-services',
        type: 'pending_approvals',
        title: `${serviceStats.pending} Services zur Freigabe`,
        description: 'Stundeneinträge warten auf Genehmigung',
        priority: 'medium'
      })
    }

    // Check for compliance issues
    if (helperStats.complianceIssues > 0) {
      notifications.push({
        id: 'compliance-issues',
        type: 'compliance',
        title: `${helperStats.complianceIssues} Helfer mit Compliance-Problemen`,
        description: 'Dokumente müssen überprüft werden',
        priority: 'high'
      })
    }

    return notifications
  }, [serviceStats.pending, helperStats.complianceIssues])

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

// Create functions for CRUD operations
export function useCreateCase() {
  return useCallback(async (caseData) => {
    const response = await fetch('/api/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(caseData)
    })

    if (!response.ok) {
      throw new Error('Failed to create case')
    }

    return response.json()
  }, [])
}

export function useCreateHelper() {
  return useCallback(async (helperData) => {
    const response = await fetch('/api/helpers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(helperData)
    })

    if (!response.ok) {
      throw new Error('Failed to create helper')
    }

    return response.json()
  }, [])
}

export function useCreateService() {
  return useCallback(async (serviceData) => {
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(serviceData)
    })

    if (!response.ok) {
      throw new Error('Failed to create service')
    }

    return response.json()
  }, [])
}

// Local Storage Hook (unchanged)
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