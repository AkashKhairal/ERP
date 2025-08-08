import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/audit`,
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
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface AuditLog {
  _id?: string
  userId?: string
  action: string
  resource: string
  details?: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  timestamp: string
  metadata?: Record<string, any>
}

export interface AuditStats {
  totalLogs: number
  successfulActions: number
  failedActions: number
  topActions: Array<{ action: string; count: number }>
  topResources: Array<{ resource: string; count: number }>
  recentActivity: AuditLog[]
}

export const auditService = {
  // Get audit logs
  getAuditLogs: async (params = {}): Promise<{ success: boolean; data: AuditLog[] }> => {
    try {
      const response = await api.get('/', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      return { success: false, data: [] }
    }
  },

  // Get audit log by ID
  getAuditLogById: async (id: string): Promise<{ success: boolean; data: AuditLog }> => {
    try {
      const response = await api.get(`/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching audit log:', error)
      return { success: false, data: {} as AuditLog }
    }
  },

  // Get audit logs for a specific user
  getAuditLogsByUser: async (userId: string, params = {}): Promise<{ success: boolean; data: AuditLog[] }> => {
    try {
      const response = await api.get(`/user/${userId}`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching user audit logs:', error)
      return { success: false, data: [] }
    }
  },

  // Get audit statistics
  getAuditStats: async (params = {}): Promise<{ success: boolean; data: AuditStats }> => {
    try {
      const response = await api.get('/stats', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching audit stats:', error)
      return { 
        success: false, 
        data: {
          totalLogs: 0,
          successfulActions: 0,
          failedActions: 0,
          topActions: [],
          topResources: [],
          recentActivity: []
        }
      }
    }
  },

  // Export audit logs
  exportAuditLogs: async (params = {}): Promise<Blob> => {
    try {
      const response = await api.get('/export', { 
        params,
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      throw error
    }
  },

  // Get available actions for filtering
  getAvailableActions: (): string[] => {
    return [
      'login',
      'logout', 
      'login_failed',
      'permission_granted',
      'permission_revoked',
      'role_assigned',
      'role_removed',
      'user_created',
      'user_updated',
      'user_deleted',
      'user_deactivated',
      'role_created',
      'role_updated',
      'role_deleted',
      'access_denied',
      'unauthorized_access_attempt',
      'data_exported',
      'data_imported',
      'password_changed',
      'profile_updated'
    ]
  },

  // Get available resources for filtering
  getAvailableResources: (): string[] => {
    return [
      'user',
      'role',
      'permission',
      'module',
      'system'
    ]
  },

  // Get action descriptions
  getActionDescriptions: (): Record<string, string> => {
    return {
      login: 'User successfully logged in',
      logout: 'User logged out',
      login_failed: 'Failed login attempt',
      permission_granted: 'Permission was granted to user',
      permission_revoked: 'Permission was revoked from user',
      role_assigned: 'Role was assigned to user',
      role_removed: 'Role was removed from user',
      user_created: 'New user account was created',
      user_updated: 'User account was updated',
      user_deleted: 'User account was deleted',
      user_deactivated: 'User account was deactivated',
      role_created: 'New role was created',
      role_updated: 'Role was updated',
      role_deleted: 'Role was deleted',
      access_denied: 'Access was denied to resource',
      unauthorized_access_attempt: 'Unauthorized access attempt',
      data_exported: 'Data was exported',
      data_imported: 'Data was imported',
      password_changed: 'Password was changed',
      profile_updated: 'Profile was updated'
    }
  }
}

export default auditService 