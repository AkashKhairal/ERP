'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'
import { analytics } from '@/lib/analytics'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  roles: any[]
  department: string
  position?: string
  avatar?: string
  isActive: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  googleSignIn: (token: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profileData: any) => Promise<void>
  changePassword: (passwordData: any) => Promise<void>
  clearError: () => void
  logActivity: (action: string, details: any) => void
  getCurrentModule: () => string
  getRecentActivities: () => any[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()
  const authCheckPerformed = useRef(false)
  const isInitialized = useRef(false)

  // Validate token function
  const validateToken = useCallback(async (token: string) => {
    try {
      const response = await authService.getMe()
      return { valid: true, user: response.data.data.user }
    } catch (error: any) {
      console.error('Token validation failed:', error)
      return { valid: false, error: error.response?.data?.message || 'Token validation failed' }
    }
  }, [])

  // Check if user is authenticated on app load
  const checkAuth = useCallback(async () => {
    // Don't run on server-side
    if (typeof window === 'undefined') {
      dispatch({ type: 'AUTH_FAILURE', payload: null })
      return
    }
    
    if (authCheckPerformed.current || isInitialized.current) return
    
    authCheckPerformed.current = true
    isInitialized.current = true
    
    const token = localStorage.getItem('token')
    console.log('Auth check - token found:', !!token, 'token length:', token?.length)
    
    if (token) {
      try {
        dispatch({ type: 'AUTH_START' })
        const validation = await validateToken(token)
        
        if (validation.valid && validation.user) {
          console.log('Auth check - successful:', validation.user)
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: validation.user,
              token
            }
          })
        } else {
          console.log('Auth check - token invalid')
          localStorage.removeItem('token')
          dispatch({ type: 'AUTH_FAILURE', payload: validation.error || 'Authentication failed' })
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            router.push('/login')
          }
        }
      } catch (error: any) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' })
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          router.push('/login')
        }
      }
    } else {
      console.log('Auth check - no token found')
      dispatch({ type: 'AUTH_FAILURE', payload: null })
    }
  }, [router, validateToken])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext - login attempt for:', email)
      dispatch({ type: 'AUTH_START' })
      const response = await authService.login(email, password)
      console.log('AuthContext - login response:', response.data)
      const { user, token } = response.data.data
      
      console.log('Login - storing token:', !!token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
      }
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      // Track login analytics
      analytics.login('email')
      
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('AuthContext - login error:', error)
      const message = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      toast.error(message)
    }
  }

  // Register function
  const register = async (userData: any) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authService.register(userData)
      const { user, token } = response.data.data
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
      }
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      // Track registration analytics
      analytics.register('email')
      
      toast.success('Registration successful!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      toast.error(message)
    }
  }

  // Google Sign In
  const googleSignIn = async (token: string) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authService.googleSignIn(token)
      const { user, token: jwtToken, googleInfo } = response.data.data
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', jwtToken)
        // Store Google info if available
        if (googleInfo) {
          localStorage.setItem('googleInfo', JSON.stringify(googleInfo))
        }
      }
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: jwtToken }
      })
      
      // Track Google sign-in analytics
      analytics.login('google')
      
      toast.success('Google sign-in successful!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Google sign-in failed'
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      toast.error(message)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      
      // Track logout analytics
      analytics.logout()
      
      dispatch({ type: 'LOGOUT' })
      router.push('/')
      toast.success('Logged out successfully')
    }
  }

  // Update profile
  const updateProfile = async (profileData: any) => {
    try {
      const response = await authService.updateProfile(profileData)
      dispatch({ type: 'UPDATE_USER', payload: response.data.data.user })
      toast.success('Profile updated successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
    }
  }

  // Change password
  const changePassword = async (passwordData: any) => {
    try {
      await authService.changePassword(passwordData)
      toast.success('Password changed successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Log activity
  const logActivity = (action: string, details: any) => {
    // Implementation for activity logging
    console.log('Activity logged:', action, details)
  }

  // Get current module
  const getCurrentModule = () => {
    if (typeof window === 'undefined') return ''
    const path = window.location.pathname
    if (path.includes('/dashboard')) return 'dashboard'
    if (path.includes('/users')) return 'users'
    if (path.includes('/teams')) return 'teams'
    if (path.includes('/projects')) return 'projects'
    if (path.includes('/tasks')) return 'tasks'
    if (path.includes('/finance')) return 'finance'
    if (path.includes('/analytics')) return 'analytics'
    if (path.includes('/content')) return 'content'
    if (path.includes('/integrations')) return 'integrations'
    return 'dashboard'
  }

  // Get recent activities
  const getRecentActivities = () => {
    // Implementation for recent activities
    return []
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    googleSignIn,
    logout,
    updateProfile,
    changePassword,
    clearError,
    logActivity,
    getCurrentModule,
    getRecentActivities
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 