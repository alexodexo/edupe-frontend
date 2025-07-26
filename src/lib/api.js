// src/lib/api.js
// API Services für Edupe Digital Frontend

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Request interceptor für alle API calls
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      ...options
    }

    // Add auth token if available
    const token = this.getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      // Handle different response types
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return await response.text()
    } catch (error) {
      console.error('API Request failed:', error)
      throw error
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params).toString()
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint
    
    return this.request(url, {
      method: 'GET'
    })
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    })
  }

  // File upload
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData()
    formData.append('file', file)
    
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    return this.request(endpoint, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData
        ...Object.fromEntries(
          Object.entries(this.defaultHeaders).filter(([key]) => key !== 'Content-Type')
        )
      },
      body: formData
    })
  }

  // Get auth token (wird später mit echtem Auth System ersetzt)
  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  // Set auth token
  setAuthToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  // Remove auth token
  removeAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient()

// Cases API
export const casesApi = {
  // Get all cases
  getAll: (filters = {}) => apiClient.get('/cases', filters),
  
  // Get specific case
  getById: (id) => apiClient.get(`/cases/${id}`),
  
  // Create new case
  create: (caseData) => apiClient.post('/cases', caseData),
  
  // Update case
  update: (id, caseData) => apiClient.put(`/cases/${id}`, caseData),
  
  // Delete case
  delete: (id) => apiClient.delete(`/cases/${id}`),
  
  // Assign helper to case
  assignHelper: (caseId, helperId) => 
    apiClient.post(`/cases/${caseId}/assign`, { helperId }),
  
  // Remove helper from case
  unassignHelper: (caseId, helperId) => 
    apiClient.delete(`/cases/${caseId}/helpers/${helperId}`),
  
  // Update case status
  updateStatus: (id, status) => 
    apiClient.patch(`/cases/${id}/status`, { status }),
  
  // Get case statistics
  getStats: () => apiClient.get('/cases/stats'),
  
  // Get case services
  getServices: (caseId, filters = {}) => 
    apiClient.get(`/cases/${caseId}/services`, filters)
}

// Helpers API
export const helpersApi = {
  // Get all helpers
  getAll: (filters = {}) => apiClient.get('/helpers', filters),
  
  // Get specific helper
  getById: (id) => apiClient.get(`/helpers/${id}`),
  
  // Create new helper
  create: (helperData) => apiClient.post('/helpers', helperData),
  
  // Update helper
  update: (id, helperData) => apiClient.put(`/helpers/${id}`, helperData),
  
  // Delete helper
  delete: (id) => apiClient.delete(`/helpers/${id}`),
  
  // Update helper availability
  updateAvailability: (id, availability) => 
    apiClient.patch(`/helpers/${id}/availability`, { availability }),
  
  // Upload helper document
  uploadDocument: (id, file, documentType) => 
    apiClient.upload(`/helpers/${id}/documents`, file, { type: documentType }),
  
  // Get helper statistics
  getStats: (id) => apiClient.get(`/helpers/${id}/stats`),
  
  // Get helper services
  getServices: (helperId, filters = {}) => 
    apiClient.get(`/helpers/${helperId}/services`, filters),
  
  // Get helper cases
  getCases: (helperId) => apiClient.get(`/helpers/${helperId}/cases`)
}

// Services API
export const servicesApi = {
  // Get all services
  getAll: (filters = {}) => apiClient.get('/services', filters),
  
  // Get specific service
  getById: (id) => apiClient.get(`/services/${id}`),
  
  // Create new service
  create: (serviceData) => apiClient.post('/services', serviceData),
  
  // Update service
  update: (id, serviceData) => apiClient.put(`/services/${id}`, serviceData),
  
  // Delete service
  delete: (id) => apiClient.delete(`/services/${id}`),
  
  // Approve service
  approve: (id) => apiClient.patch(`/services/${id}/approve`),
  
  // Reject service
  reject: (id, reason = '') => 
    apiClient.patch(`/services/${id}/reject`, { reason }),
  
  // Bulk approve services
  bulkApprove: (serviceIds) => 
    apiClient.post('/services/bulk-approve', { serviceIds }),
  
  // Bulk reject services
  bulkReject: (serviceIds, reason = '') => 
    apiClient.post('/services/bulk-reject', { serviceIds, reason }),
  
  // Validate travel time
  validateTravelTime: (currentService, lastService) => 
    apiClient.post('/services/validate-travel-time', { 
      currentService, 
      lastService 
    }),
  
  // Get service statistics
  getStats: () => apiClient.get('/services/stats')
}

// Reports API
export const reportsApi = {
  // Get all reports
  getAll: (filters = {}) => apiClient.get('/reports', filters),
  
  // Get specific report
  getById: (id) => apiClient.get(`/reports/${id}`),
  
  // Generate new report
  generate: (reportData) => apiClient.post('/reports/generate', reportData),
  
  // Update report
  update: (id, reportData) => apiClient.put(`/reports/${id}`, reportData),
  
  // Delete report
  delete: (id) => apiClient.delete(`/reports/${id}`),
  
  // Download report as PDF
  downloadPdf: (id) => apiClient.get(`/reports/${id}/pdf`),
  
  // Get report templates
  getTemplates: () => apiClient.get('/reports/templates'),
  
  // AI generate report
  aiGenerate: (caseId, options = {}) => 
    apiClient.post('/reports/ai-generate', { caseId, ...options })
}

// Billing API
export const billingApi = {
  // Get all invoices
  getInvoices: (filters = {}) => apiClient.get('/billing/invoices', filters),
  
  // Get specific invoice
  getInvoice: (id) => apiClient.get(`/billing/invoices/${id}`),
  
  // Create new invoice
  createInvoice: (invoiceData) => apiClient.post('/billing/invoices', invoiceData),
  
  // Update invoice
  updateInvoice: (id, invoiceData) => 
    apiClient.put(`/billing/invoices/${id}`, invoiceData),
  
  // Send invoice
  sendInvoice: (id, recipients = []) => 
    apiClient.post(`/billing/invoices/${id}/send`, { recipients }),
  
  // Mark invoice as paid
  markPaid: (id, paymentData = {}) => 
    apiClient.patch(`/billing/invoices/${id}/paid`, paymentData),
  
  // Download invoice PDF
  downloadInvoice: (id) => apiClient.get(`/billing/invoices/${id}/pdf`),
  
  // Get billing statistics
  getStats: () => apiClient.get('/billing/stats'),
  
  // Get pending services for billing
  getPendingServices: (filters = {}) => 
    apiClient.get('/billing/pending-services', filters)
}

// Authentication API
export const authApi = {
  // Login
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // Logout
  logout: () => apiClient.post('/auth/logout'),
  
  // Get current user
  getCurrentUser: () => apiClient.get('/auth/me'),
  
  // Refresh token
  refreshToken: () => apiClient.post('/auth/refresh'),
  
  // Change password
  changePassword: (passwords) => apiClient.post('/auth/change-password', passwords),
  
  // Request password reset
  requestPasswordReset: (email) => 
    apiClient.post('/auth/password-reset', { email }),
  
  // Reset password
  resetPassword: (token, newPassword) => 
    apiClient.post('/auth/password-reset/confirm', { token, password: newPassword })
}

// Settings API
export const settingsApi = {
  // Get all settings
  getAll: () => apiClient.get('/settings'),
  
  // Get specific setting category
  getCategory: (category) => apiClient.get(`/settings/${category}`),
  
  // Update settings
  update: (category, settings) => 
    apiClient.put(`/settings/${category}`, settings),
  
  // Reset settings to default
  reset: (category) => apiClient.post(`/settings/${category}/reset`),
  
  // Export settings
  export: () => apiClient.get('/settings/export'),
  
  // Import settings
  import: (file) => apiClient.upload('/settings/import', file)
}

// Statistics API
export const statsApi = {
  // Get dashboard statistics
  getDashboard: () => apiClient.get('/stats/dashboard'),
  
  // Get time-based statistics
  getTimeStats: (timeRange = '30d') => 
    apiClient.get('/stats/time', { range: timeRange }),
  
  // Get helper performance
  getHelperPerformance: (helperId, timeRange = '30d') => 
    apiClient.get(`/stats/helpers/${helperId}`, { range: timeRange }),
  
  // Get case statistics
  getCaseStats: (caseId) => apiClient.get(`/stats/cases/${caseId}`),
  
  // Get revenue statistics
  getRevenueStats: (timeRange = '30d') => 
    apiClient.get('/stats/revenue', { range: timeRange })
}

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          apiClient.removeAuthToken()
          window.location.href = '/login'
          break
        case 403:
          // Forbidden
          console.error('Access forbidden:', error.response.data)
          break
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data)
          break
        case 422:
          // Validation error
          console.error('Validation error:', error.response.data)
          break
        case 500:
          // Server error
          console.error('Server error:', error.response.data)
          break
        default:
          console.error('API error:', error.response.data)
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request)
    } else {
      // Other error
      console.error('Error:', error.message)
    }
    
    throw error
  },

  // Format API response for frontend
  formatResponse: (response, transform = null) => {
    if (transform && typeof transform === 'function') {
      return transform(response)
    }
    return response
  },

  // Build query parameters
  buildQueryParams: (params = {}) => {
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    
    return new URLSearchParams(filtered).toString()
  },

  // Retry failed requests
  retry: async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
        return apiUtils.retry(fn, retries - 1, delay * 2)
      }
      throw error
    }
  }
}

// Mock data flag (wird entfernt wenn echte API verfügbar ist)
export const USE_MOCK_DATA = process.env.NODE_ENV === 'development'

// Export the main API client
export default apiClient