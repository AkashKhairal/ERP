import axios, { AxiosError, AxiosResponse } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://creatorbase-backend.onrender.com/api'

// Create axios instance with better configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Include cookies if needed
})

// Request interceptor for authentication and logging
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    // Log request for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for better error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data)
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any
    
    // Log error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message
    })

    // Handle token expiration with retry logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Try to refresh token if refresh endpoint exists
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const refreshResponse = await api.post('/auth/refresh', { refreshToken })
          const newToken = refreshResponse.data.token
          localStorage.setItem('token', newToken)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }
      
      // If refresh fails, redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Types
export interface AccountSettings {
  firstName: string
  lastName: string
  email: string
  phone?: string
  timezone: string
  language: string
  bio?: string
  location?: string
  dateOfBirth?: string
  position?: string
  department: string
}

export interface SecuritySettings {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  twoFactorEnabled: boolean
  sessionTimeout: number
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  securityAlerts: boolean
  projectUpdates: boolean
  teamMessages: boolean
  systemMaintenance: boolean
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  compactMode: boolean
  showAnimations: boolean
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  sidebarCollapsed: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  statusCode?: number
}

// Utility functions for better error handling
const handleApiError = (error: any, defaultMessage: string): ApiResponse => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || defaultMessage
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return {
          success: false,
          message: `Bad Request: ${message}`,
          error: message,
          statusCode: status
        }
      case 401:
        return {
          success: false,
          message: 'Unauthorized: Please log in again',
          error: 'Authentication required',
          statusCode: status
        }
      case 403:
        return {
          success: false,
          message: 'Forbidden: You don\'t have permission to perform this action',
          error: 'Insufficient permissions',
          statusCode: status
        }
      case 404:
        return {
          success: false,
          message: 'Not Found: The requested resource was not found',
          error: 'Resource not found',
          statusCode: status
        }
      case 429:
        return {
          success: false,
          message: 'Too Many Requests: Please wait before trying again',
          error: 'Rate limit exceeded',
          statusCode: status
        }
      case 500:
        return {
          success: false,
          message: 'Server Error: Something went wrong on our end. Please try again later.',
          error: 'Internal server error',
          statusCode: status
        }
      default:
        return {
          success: false,
          message: message,
          error: error.message,
          statusCode: status
        }
    }
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return {
      success: false,
      message: 'Network Error: Please check your internet connection and try again',
      error: 'Network error',
      statusCode: 0
    }
  }
  
  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      success: false,
      message: 'Request Timeout: The request took too long. Please try again.',
      error: 'Request timeout',
      statusCode: 0
    }
  }
  
  return {
    success: false,
    message: defaultMessage,
    error: error.message || 'Unknown error',
    statusCode: 0
  }
}

// Retry logic for failed requests
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      
      // Don't retry on client errors (4xx)
      if (axios.isAxiosError(error) && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        throw error
      }
      
      if (attempt < maxRetries) {
        console.warn(`Request failed, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      }
    }
  }
  
  throw lastError
}

// Settings Service
export const settingsService = {
  // Get user profile
  async getProfile(): Promise<ApiResponse<AccountSettings>> {
    try {
      const response = await retryRequest(() => api.get('/auth/me'))
      return {
        success: true,
        message: 'Profile loaded successfully',
        data: response.data,
        statusCode: response.status
      }
    } catch (error: any) {
      return handleApiError(error, 'Failed to load profile')
    }
  },

  // Update user profile
  async updateProfile(data: Partial<AccountSettings>): Promise<ApiResponse<AccountSettings>> {
    try {
      const response = await retryRequest(() => api.put('/auth/profile', data))
      return {
        success: true,
        message: 'Profile updated successfully',
        data: response.data.data?.user || response.data,
        statusCode: response.status
      }
    } catch (error: any) {
      return handleApiError(error, 'Failed to update profile')
    }
  },

  // Change password
  async changePassword(data: SecuritySettings): Promise<ApiResponse> {
    try {
      const response = await retryRequest(() => api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }))
      return {
        success: true,
        message: response.data.message || 'Password changed successfully',
        statusCode: response.status
      }
    } catch (error: any) {
      return handleApiError(error, 'Failed to change password')
    }
  },

  // Toggle two-factor authentication
  async toggleTwoFactor(enabled: boolean): Promise<ApiResponse> {
    try {
      const response = await retryRequest(() => api.put('/auth/two-factor', { enabled }))
      return {
        success: true,
        message: response.data.message || `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
        statusCode: response.status
      }
    } catch (error: any) {
      return handleApiError(error, 'Failed to update two-factor authentication')
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(data: NotificationSettings): Promise<ApiResponse> {
    try {
      const response = await retryRequest(() => api.put('/users/me/preferences', { notifications: data }))
      return {
        success: true,
        message: response.data.message || 'Notification preferences updated successfully',
        statusCode: response.status
      }
    } catch (error: any) {
      return handleApiError(error, 'Failed to update notification preferences')
    }
  },

  // Update appearance preferences
  async updateAppearancePreferences(data: AppearanceSettings): Promise<ApiResponse> {
    try {
      const response = await retryRequest(() => api.put('/users/me/preferences', { appearance: data }))
      return {
        success: true,
        message: response.data.message || 'Appearance preferences updated successfully',
        statusCode: response.status
      }
    } catch (error: any) {
      return handleApiError(error, 'Failed to update appearance preferences')
    }
  },

  // Update all preferences at once
  async updateAllPreferences(preferences: {
    notifications?: Partial<NotificationSettings>
    appearance?: Partial<AppearanceSettings>
    timezone?: string
    language?: string
    sessionTimeout?: number
  }): Promise<ApiResponse> {
    try {
      const response = await retryRequest(() => api.put('/users/me/preferences', preferences))
      return {
        success: true,
        message: response.data.message || 'Preferences updated successfully',
        statusCode: response.status
      }
    } catch (error: any) {
      return handleApiError(error, 'Failed to update preferences')
    }
  },

  // Get user preferences
  async getUserPreferences(): Promise<ApiResponse<{
    notifications: NotificationSettings
    appearance: AppearanceSettings
    timezone: string
    language: string
    sessionTimeout: number
  }>> {
    try {
      const response = await retryRequest(() => api.get('/users/me/preferences'))
      return {
        success: true,
        message: 'Preferences loaded successfully',
        data: response.data.data,
        statusCode: response.status
      }
    } catch (error: any) {
      return handleApiError(error, 'Failed to load preferences')
    }
  },

  // Delete account
  async deleteAccount(password: string): Promise<ApiResponse> {
    try {
      const response = await retryRequest(() => api.delete('/users/me/account', {
        data: { password }
      }))
      return {
        success: true,
        message: response.data.message || 'Account deleted successfully',
        statusCode: response.status
      }
    } catch (error: any) {
      return handleApiError(error, 'Failed to delete account')
    }
  },

  // Export user data
  async exportUserData(): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      const response = await retryRequest(() => api.get('/users/me/export'))
      return {
        success: true,
        message: 'Data export completed successfully',
        data: response.data.data,
        statusCode: response.status
      }
    } catch (error: any) {
      return handleApiError(error, 'Failed to export user data')
    }
  },

  // Get available timezones
  getTimezones() {
    return [
      { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
      { value: 'America/New_York', label: 'Eastern Time (ET)' },
      { value: 'America/Chicago', label: 'Central Time (CT)' },
      { value: 'America/Denver', label: 'Mountain Time (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
      { value: 'Europe/London', label: 'London (GMT/BST)' },
      { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
      { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
      { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
      { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
      { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
      { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
    ]
  },

  // Get available languages
  getLanguages() {
    return [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'fr', label: 'Français' },
      { value: 'de', label: 'Deutsch' },
      { value: 'it', label: 'Italiano' },
      { value: 'pt', label: 'Português' },
      { value: 'ru', label: 'Русский' },
      { value: 'ja', label: '日本語' },
      { value: 'ko', label: '한국어' },
      { value: 'zh', label: '中文' },
      { value: 'ar', label: 'العربية' },
      { value: 'hi', label: 'हिन्दी' }
    ]
  },

  // Get available departments
  getDepartments() {
    return [
      { value: 'engineering', label: 'Engineering' },
      { value: 'content', label: 'Content' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'finance', label: 'Finance' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'operations', label: 'Operations' },
      { value: 'sales', label: 'Sales' },
      { value: 'support', label: 'Customer Support' },
      { value: 'design', label: 'Design' },
      { value: 'product', label: 'Product Management' }
    ]
  },

  // Get available themes
  getThemes() {
    return [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System' }
    ]
  },

  // Get available font sizes
  getFontSizes() {
    return [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'xlarge', label: 'Extra Large' }
    ]
  },

  // Validate phone number format
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  },

  // Format phone number for display
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length > 10) {
      return `+${cleaned}`
    }
    
    return phone
  },

  // Sanitize input data
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  },

  // Check if email is valid
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Check if password meets requirements
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Health check for API connectivity
  async healthCheck(): Promise<boolean> {
    try {
      await api.get('/health')
      return true
    } catch {
      return false
    }
  },

  // Get API status
  async getApiStatus(): Promise<{ status: string; uptime: number; version: string }> {
    try {
      const response = await api.get('/status')
      return response.data
    } catch {
      return { status: 'offline', uptime: 0, version: 'unknown' }
    }
  }
}

export default settingsService
