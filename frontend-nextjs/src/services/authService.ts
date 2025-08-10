import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        console.log('Axios request - adding token to request')
        config.headers.Authorization = `Bearer ${token}`
      } else {
        console.log('Axios request - no token found')
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Axios interceptor - 401 error:', error.response?.data?.message)
      
      // Only logout if it's a clear authentication error
      const errorMessage = error.response?.data?.message?.toLowerCase() || ''
      const errorDetails = error.response?.data?.error?.toLowerCase() || ''
      
      // Check if this is a real authentication error (more specific checks)
      const isAuthError = 
        errorMessage.includes('invalid token') ||
        errorMessage.includes('token expired') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('not authorized') ||
        errorDetails.includes('invalid token') ||
        errorDetails.includes('token expired') ||
        errorDetails.includes('unauthorized') ||
        errorDetails.includes('not authorized')
      
      if (isAuthError) {
        console.log('Axios interceptor - logging out due to auth error')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      } else {
        console.log('Axios interceptor - 401 error but not auth related, not logging out')
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // Register user
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData)
    return response
  },

  // Login user
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response
  },

  // Update profile
  updateProfile: async (profileData: any) => {
    const response = await api.put('/auth/profile', profileData)
    return response
  },

  // Change password
  changePassword: async (passwordData: any) => {
    const response = await api.put('/auth/change-password', passwordData)
    return response
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response
  },

  // Google Sign-In
  googleSignIn: async (token: string) => {
    const response = await api.post('/auth/google', { token })
    return response
  },
} 