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

// Simple fetcher for single resource
const simpleFetcher = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Cases Hooks
export function useCases() {
  const { userProfile, userRole } = useAuth()
  const userId = userProfile?.helfer_id || userProfile?.ansprechpartner_id

  // Admin can see all cases without userId, others need userId
  const shouldFetch = userRole === 'admin' || (userId && userRole)

  const { data, error, mutate } = useSWR(
    shouldFetch ? ['/api/cases', userId, userRole] : null,
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

// NEW: Enhanced case hook that fetches single case directly from API
export function useCase(caseId) {
  const { data: case_, error, mutate } = useSWR(
    caseId ? `/api/cases/${caseId}` : null,
    simpleFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  return {
    case: case_,
    isLoading: !error && !case_ && caseId,
    error,
    refresh: mutate
  }
}

// Alternative: Use case from the cases list (for cases where you already have all cases loaded)
export function useCaseFromList(caseId) {
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

// Ansprechpartner Hooks
export function useAnsprechpartner() {
  const { userProfile, userRole } = useAuth()
  const userId = userRole === 'jugendamt' ? userProfile?.ansprechpartner_id : null

  const { data, error, mutate } = useSWR(
    ['/api/ansprechpartner', userId, userRole],
    ([url, userId, userRole]) => fetcher(url, userId, userRole),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  const stats = useMemo(() => {
    if (!data || !Array.isArray(data)) return {
      total: 0,
      withActiveCases: 0,
      withoutCases: 0,
      totalAssignedCases: 0
    }

    const totalAssignedCases = data.reduce((sum, ap) => sum + ap.totalCases, 0)

    return {
      total: data.length,
      withActiveCases: data.filter(ap => ap.activeCases > 0).length,
      withoutCases: data.filter(ap => ap.totalCases === 0).length,
      totalAssignedCases
    }
  }, [data])

  return {
    ansprechpartner: data || [],
    stats,
    isLoading: !error && !data,
    error,
    refresh: mutate
  }
}

export function useAnsprechpartnerDetail(id) {
  const { data, error, mutate } = useSWR(
    id ? `/api/ansprechpartner/${id}` : null,
    simpleFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  return {
    ansprechpartner: data,
    isLoading: !error && !data && id,
    error,
    refresh: mutate
  }
}

export function useCreateAnsprechpartner() {
  return async (ansprechpartnerData) => {
    const response = await fetch('/api/ansprechpartner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ansprechpartnerData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Fehler beim Erstellen des Ansprechpartners')
    }

    return response.json()
  }
}

export function useUpdateAnsprechpartner() {
  return async (id, ansprechpartnerData) => {
    const response = await fetch(`/api/ansprechpartner/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ansprechpartnerData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Fehler beim Aktualisieren des Ansprechpartners')
    }

    return response.json()
  }
}

export function useDeleteAnsprechpartner() {
  return async (id) => {
    const response = await fetch(`/api/ansprechpartner/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Fehler beim Löschen des Ansprechpartners')
    }

    return response.json()
  }
}

// NEW: Enhanced helper hook that fetches single helper directly from API
export function useHelper(helperId) {
  const { data: helper, error, mutate } = useSWR(
    helperId ? `/api/helpers/${helperId}` : null,
    simpleFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  return {
    helper,
    isLoading: !error && !helper && helperId,
    error,
    refresh: mutate
  }
}

// Alternative: Use helper from the helpers list (for cases where you already have all helpers loaded)
export function useHelperFromList(helperId) {
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
export function useDashboardData(timeRange = 'week') {
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/dashboard?timeRange=${timeRange}`)
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const urgentNotifications = useMemo(() => {
    if (!dashboardData) return []
    
    const notifications = []

    // Check for pending approvals
    if (dashboardData.services?.pending > 0) {
      notifications.push({
        id: 'pending-services',
        type: 'pending_approvals',
        title: `${dashboardData.services.pending} Services zur Freigabe`,
        description: 'Stundeneinträge warten auf Genehmigung',
        priority: 'medium'
      })
    }

    // Check for compliance issues
    if (dashboardData.helpers?.complianceIssues > 0) {
      notifications.push({
        id: 'compliance-issues',
        type: 'compliance',
        title: `${dashboardData.helpers.complianceIssues} Helfer mit Compliance-Problemen`,
        description: 'Dokumente müssen überprüft werden',
        priority: 'high'
      })
    }

    return notifications
  }, [dashboardData])

  return {
    stats: dashboardData ? {
      cases: dashboardData.cases,
      helpers: dashboardData.helpers,
      services: dashboardData.services
    } : null,
    recentActivities: dashboardData?.recentActivities || [],
    urgentNotifications,
    isLoading,
    error,
    refresh: fetchDashboardData
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
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create case')
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
      const errorData = await response.json()
      console.error('Create helper error:', errorData)
      throw new Error(errorData.error || 'Failed to create helper')
    }

    return response.json()
  }, [])
}

// NEW: Update helper hook
export function useUpdateHelper() {
  return useCallback(async (id, helperData) => {
    const response = await fetch(`/api/helpers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(helperData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Update helper error:', errorData)
      throw new Error(errorData.error || 'Failed to update helper')
    }

    return response.json()
  }, [])
}

// NEW: Delete helper hook
export function useDeleteHelper() {
  return useCallback(async (id) => {
    const response = await fetch(`/api/helpers/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Delete helper error:', errorData)
      throw new Error(errorData.error || 'Failed to delete helper')
    }

    return true
  }, [])
}

// NEW: Update case hook
export function useUpdateCase() {
  return useCallback(async (id, caseData) => {
    const response = await fetch(`/api/cases/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Update case error:', errorData)
      throw new Error(errorData.error || 'Failed to update case')
    }

    return response.json()
  }, [])
}

// NEW: Delete case hook
export function useDeleteCase() {
  return useCallback(async (id) => {
    const response = await fetch(`/api/cases/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Delete case error:', errorData)
      throw new Error(errorData.error || 'Failed to delete case')
    }

    return true
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
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create service')
    }

    return response.json()
  }, [])
}

// Case mutations for SWR cache invalidation
export function useCaseMutations() {
  const { mutate: mutateCases } = useSWR(['/api/cases'], { revalidate: false })
  
  const createCase = useCreateCase()
  const updateCase = useUpdateCase()
  const deleteCase = useDeleteCase()

  const createCaseWithRefresh = useCallback(async (caseData) => {
    const result = await createCase(caseData)
    // Invalidate cases cache to trigger refetch
    mutateCases()
    return result
  }, [createCase, mutateCases])

  const updateCaseWithRefresh = useCallback(async (id, caseData) => {
    const result = await updateCase(id, caseData)
    // Invalidate both cases list and single case cache
    mutateCases()
    useSWR.mutate(`/api/cases/${id}`)
    return result
  }, [updateCase, mutateCases])

  const deleteCaseWithRefresh = useCallback(async (id) => {
    const result = await deleteCase(id)
    // Invalidate both cases list and single case cache
    mutateCases()
    useSWR.mutate(`/api/cases/${id}`)
    return result
  }, [deleteCase, mutateCases])

  return {
    createCase: createCaseWithRefresh,
    updateCase: updateCaseWithRefresh,
    deleteCase: deleteCaseWithRefresh
  }
}

// Helper mutations for SWR cache invalidation
export function useHelperMutations() {
  const { mutate: mutateHelpers } = useSWR(['/api/helpers'], { revalidate: false })
  
  const createHelper = useCreateHelper()
  const updateHelper = useUpdateHelper()
  const deleteHelper = useDeleteHelper()

  const createHelperWithRefresh = useCallback(async (helperData) => {
    const result = await createHelper(helperData)
    // Invalidate helpers cache to trigger refetch
    mutateHelpers()
    return result
  }, [createHelper, mutateHelpers])

  const updateHelperWithRefresh = useCallback(async (id, helperData) => {
    const result = await updateHelper(id, helperData)
    // Invalidate both helpers list and single helper cache
    mutateHelpers()
    useSWR.mutate(`/api/helpers/${id}`)
    return result
  }, [updateHelper, mutateHelpers])

  const deleteHelperWithRefresh = useCallback(async (id) => {
    const result = await deleteHelper(id)
    // Invalidate both helpers list and single helper cache
    mutateHelpers()
    useSWR.mutate(`/api/helpers/${id}`)
    return result
  }, [deleteHelper, mutateHelpers])

  return {
    createHelper: createHelperWithRefresh,
    updateHelper: updateHelperWithRefresh,
    deleteHelper: deleteHelperWithRefresh
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

// Vacation Hooks
export function useVacations(filters = {}) {
  const { userProfile, userRole } = useAuth()
  const userId = userProfile?.helfer_id || userProfile?.ansprechpartner_id

  const queryParams = new URLSearchParams()
  if (userId) queryParams.append('userId', userId)
  if (userRole) queryParams.append('userRole', userRole)
  
  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value)
  })

  const { data, error, mutate } = useSWR(
    userId || userRole === 'admin' ? `/api/urlaube?${queryParams.toString()}` : null,
    simpleFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  )

  const stats = useMemo(() => {
    if (!data || !Array.isArray(data)) return {
      total: 0,
      approved: 0,
      pending: 0,
      upcoming: 0
    }

    const now = new Date()
    return {
      total: data.length,
      approved: data.filter(v => v.approved).length,
      pending: data.filter(v => !v.approved).length,
      upcoming: data.filter(v => new Date(v.fromDate) > now).length
    }
  }, [data])

  return {
    vacations: data || [],
    stats,
    isLoading: !error && !data,
    error,
    refresh: mutate
  }
}

export function useCreateVacation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const createVacation = useCallback(async (vacationData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/urlaube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vacationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Erstellen des Urlaubs')
      }

      const result = await response.json()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    createVacation,
    isLoading,
    error
  }
}