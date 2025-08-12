import axios from 'axios'
import config from '../config/config'

const API_URL = config.getApiConfig().baseURL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

// Enhanced error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export interface Permission {
  id: string
  name: string
  description: string
  category: string
  isGranted: boolean
  resource: string
  action: string
  conditions?: any
}

// Backend permission format
export interface BackendPermission {
  module: string
  actions: string[]
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  userCount?: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  priority?: number
  color?: string
  isSystem?: boolean
  parentRole?: string
  metadata?: any
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  permissions: string[]
  roleId: string
  roles: string[]
  department?: string
  position?: string
  joinDate: string
}

export interface RoleAssignment {
  id: string
  userId: string
  roleId: string
  assignedBy: string
  assignedAt: string
  expiresAt?: string
}

export interface PermissionAudit {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  oldValue?: any
  newValue?: any
  timestamp: string
  ipAddress: string
  userAgent: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const rolesService = {
  // Role Management
  async getRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await api.get('/roles')
      // Transform _id to id for frontend compatibility
      const transformedData = {
        ...response.data,
        data: response.data.data?.map((role: any) => ({
          ...role,
          id: role._id || role.id
        })) || []
      }
      return transformedData
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw error
    }
  },

  async getRoleById(id: string): Promise<ApiResponse<Role>> {
    try {
      const response = await api.get(`/roles/${id}`)
      // Transform _id to id for frontend compatibility
      const transformedData = {
        ...response.data,
        data: response.data.data ? {
          ...response.data.data,
          id: response.data.data._id || response.data.data.id
        } : null
      }
      return transformedData
    } catch (error) {
      console.error('Error fetching role:', error)
      throw error
    }
  },

  async createRole(roleData: Partial<Role>): Promise<ApiResponse<Role>> {
    try {
      // Transform permissions from frontend format to backend format
      let transformedRoleData = { ...roleData }
      
      if (roleData.permissions && Array.isArray(roleData.permissions)) {
        // Group permissions by module and collect actions
        const modulePermissions: { [key: string]: string[] } = {}
        
        roleData.permissions.forEach((permission: any) => {
          const module = permission.resource || permission.module
          const action = permission.action
          
          if (module && action) {
            if (!modulePermissions[module]) {
              modulePermissions[module] = []
            }
            if (!modulePermissions[module].includes(action)) {
              modulePermissions[module].push(action)
            }
          }
        })
        
        // Convert to backend format
        transformedRoleData.permissions = Object.entries(modulePermissions).map(([module, actions]) => ({
          module,
          actions
        })) as any
      }
      
      const response = await api.post('/roles', transformedRoleData)
      // Transform _id to id for frontend compatibility
      const transformedData = {
        ...response.data,
        data: response.data.data ? {
          ...response.data.data,
          id: response.data.data._id || response.data.data.id
        } : null
      }
      return transformedData
    } catch (error) {
      console.error('Error creating role:', error)
      throw error
    }
  },

  async updateRole(id: string, roleData: Partial<Role>): Promise<ApiResponse<Role>> {
    // Transform permissions from frontend format to backend format
    let transformedRoleData = { ...roleData }
    
    if (roleData.permissions && Array.isArray(roleData.permissions)) {
      // Group permissions by module and collect actions
      const modulePermissions: { [key: string]: string[] } = {}
      
      roleData.permissions.forEach((permission: any) => {
        const module = permission.resource || permission.module
        const action = permission.action
        
        if (module && action) {
          if (!modulePermissions[module]) {
            modulePermissions[module] = []
          }
          if (!modulePermissions[module].includes(action)) {
            modulePermissions[module].push(action)
          }
        }
      })
      
      // Convert to backend format
      transformedRoleData.permissions = Object.entries(modulePermissions).map(([module, actions]) => ({
        module,
        actions
      })) as any
    }
    
    try {
      const response = await api.put(`/roles/${id}`, transformedRoleData)
      // Transform _id to id for frontend compatibility
      const transformedData = {
        ...response.data,
        data: response.data.data ? {
          ...response.data.data,
          id: response.data.data._id || response.data.data.id
        } : null
      }
      return transformedData
    } catch (error: any) {
      console.error('Error updating role:', error)
      
      // Handle rate limiting with retry logic
      if (error.response?.status === 429) {
        console.log('Rate limited, waiting 2 seconds before retry...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        try {
          const response = await api.put(`/roles/${id}`, transformedRoleData)
          const transformedData = {
            ...response.data,
            data: response.data.data ? {
              ...response.data.data,
              id: response.data.data._id || response.data.data.id
            } : null
          }
          return transformedData
        } catch (retryError) {
          console.error('Retry failed:', retryError)
          throw retryError
        }
      }
      
      throw error
    }
  },

  async deleteRole(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/roles/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting role:', error)
      throw error
    }
  },

  // User Management
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await api.get('/users')
      // Transform backend response to frontend expected format
      const transformedData = {
        ...response.data,
        data: response.data.data?.map((user: any) => ({
          ...user,
          id: user._id || user.id,
          // Map roles array to roleId for frontend compatibility
          roleId: user.roles && user.roles.length > 0 ? user.roles[0]._id || user.roles[0] : null,
          // Ensure status field is properly mapped
          status: user.isActive ? 'active' : 'inactive',
          // Map name fields properly
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email || 'Unknown User',
          // Map email field
          email: user.email || 'No Email',
          // Map department field
          department: user.department || 'No Department',
          // Map other required fields
          role: user.roles && user.roles.length > 0 ? user.roles[0].name || user.roles[0] : 'unassigned',
          permissions: user.permissions || [],
          lastLogin: user.lastLogin || user.createdAt || new Date().toISOString(),
          joinDate: user.hireDate || user.createdAt || new Date().toISOString()
        })) || []
      }
      return transformedData
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  async updateUserRole(userId: string, roleId: string): Promise<ApiResponse<User>> {
    try {
      const response = await api.post(`/users/${userId}/roles`, { roles: [roleId] })
      return response.data
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  },

  async assignRoleToUser(userId: string, roleId: string): Promise<ApiResponse<User>> {
    try {
      const response = await api.post(`/users/${userId}/roles`, { roles: [roleId] })
      
      // Transform the response to match frontend expected format
      if (response.data.success) {
        const user = response.data.data
        
        // Ensure the roleId is properly set from the roles array
        const transformedUser = {
          ...user,
          id: user._id || user.id,
          // Explicitly set roleId to the assigned role
          roleId: roleId,
          status: user.isActive ? 'active' : 'inactive',
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email || 'Unknown User',
          email: user.email || 'No Email',
          department: user.department || 'No Department',
          role: roleId, // Set role to the assigned roleId
          permissions: user.permissions || [],
          lastLogin: user.lastLogin || user.createdAt || new Date().toISOString(),
          joinDate: user.hireDate || user.createdAt || new Date().toISOString()
        }
        
        console.log('Transformed user after role assignment:', transformedUser)
        
        return {
          ...response.data,
          data: transformedUser
        }
      }
      
      return response.data
    } catch (error) {
      console.error('Error assigning role to user:', error)
      throw error
    }
  },

  async removeRoleFromUser(userId: string, roleId: string): Promise<ApiResponse<User>> {
    try {
      // Get current user roles and remove the specified role
      const userResponse = await api.get(`/users/${userId}`)
      const currentRoles = userResponse.data.data.roles || []
      const updatedRoles = currentRoles.filter((role: any) => (role._id || role) !== roleId)
      
      const response = await api.post(`/users/${userId}/roles`, { roles: updatedRoles })
      
      // Transform the response to match frontend expected format
      if (response.data.success) {
        const user = response.data.data
        
        // Set roleId to null if no roles remain, otherwise use the first role
        const updatedRoleId = updatedRoles.length > 0 ? (updatedRoles[0]._id || updatedRoles[0]) : null
        
        const transformedUser = {
          ...user,
          id: user._id || user.id,
          roleId: updatedRoleId,
          status: user.isActive ? 'active' : 'inactive',
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || user.email || 'Unknown User',
          email: user.email || 'No Email',
          department: user.department || 'No Department',
          role: updatedRoleId ? (typeof updatedRoleId === 'string' ? updatedRoleId : 'assigned') : 'unassigned',
          permissions: user.permissions || [],
          lastLogin: user.lastLogin || user.createdAt || new Date().toISOString(),
          joinDate: user.hireDate || user.createdAt || new Date().toISOString()
        }
        
        console.log('Transformed user after role removal:', transformedUser)
        
        return {
          ...response.data,
          data: transformedUser
        }
      }
      
      return response.data
    } catch (error) {
      console.error('Error removing role from user:', error)
      throw error
    }
  },

  // Permission Management - Updated to work with backend structure
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    try {
      // Get all roles to extract permissions
      const rolesResponse = await this.getRoles()
      const allPermissions = new Map<string, Permission>()
      
      rolesResponse.data.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach((permission: any) => {
            if (permission.module && permission.actions) {
              permission.actions.forEach((action: string) => {
                const key = `${permission.module}_${action}`
                if (!allPermissions.has(key)) {
                  allPermissions.set(key, {
                    id: key,
                    name: `${permission.module} ${action}`,
                    description: `Permission to ${action} ${permission.module}`,
                    category: permission.module.charAt(0).toUpperCase() + permission.module.slice(1),
                    isGranted: false,
                    resource: permission.module,
                    action: action
                  })
                }
              })
            }
          })
        }
      })
      
      return {
        success: true,
        data: Array.from(allPermissions.values())
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      throw error
    }
  },

  async getPermissionsByCategory(category: string): Promise<ApiResponse<Permission[]>> {
    try {
      const permissionsResponse = await this.getPermissions()
      const filteredPermissions = permissionsResponse.data.filter(
        permission => permission.category.toLowerCase() === category.toLowerCase()
      )
      return {
        success: true,
        data: filteredPermissions
      }
    } catch (error) {
      console.error('Error fetching permissions by category:', error)
      throw error
    }
  },

  async updateRolePermissions(roleId: string, permissions: string[]): Promise<ApiResponse<Role>> {
    try {
      // Convert permission IDs to the format expected by the backend
      const permissionObjects = permissions.map(permId => {
        const [resource, action] = permId.split('_')
        return {
          module: resource,
          actions: [action]
        }
      })
      
      const response = await api.put(`/roles/${roleId}`, { permissions: permissionObjects })
      return response.data
    } catch (error) {
      console.error('Error updating role permissions:', error)
      throw error
    }
  },

  async checkUserPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const userResponse = await api.get(`/users/${userId}/permissions`)
      const userPermissions = userResponse.data.data.permissions || []
      
      return userPermissions.some((perm: any) => 
        perm.module === resource && perm.actions.includes(action)
      )
    } catch (error) {
      console.error('Error checking user permission:', error)
      return false
    }
  },

  // Audit and Security
  async getPermissionAudit(filters?: any): Promise<ApiResponse<PermissionAudit[]>> {
    try {
      const response = await api.get('/audit', { params: { ...filters, module: 'roles' } })
      return response.data
    } catch (error) {
      console.error('Error fetching permission audit:', error)
      throw error
    }
  },

  async getRoleHierarchy(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await api.get('/roles')
      const roles = response.data.data || []
      
      // Sort by priority and system status
      const sortedRoles = roles.sort((a: Role, b: Role) => {
        if (a.isSystem && !b.isSystem) return -1
        if (!a.isSystem && b.isSystem) return 1
        return (b.priority || 0) - (a.priority || 0)
      })
      
      return {
        success: true,
        data: sortedRoles
      }
    } catch (error) {
      console.error('Error fetching role hierarchy:', error)
      throw error
    }
  },

  // Bulk Operations
  async bulkAssignRoles(assignments: { userId: string; roleId: string }[]): Promise<ApiResponse<RoleAssignment[]>> {
    try {
      const results = await Promise.all(
        assignments.map(assignment => 
          this.assignRoleToUser(assignment.userId, assignment.roleId)
        )
      )
      
      // Check if all assignments were successful
      const allSuccessful = results.every(result => result.success)
      
      if (!allSuccessful) {
        throw new Error('Some role assignments failed')
      }
      
      return {
        success: true,
        data: results.map(result => ({
          id: `${Date.now()}_${Math.random()}`,
          userId: result.data.id,
          roleId: result.data.roleId || '',
          assignedBy: 'current_user',
          assignedAt: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.error('Error bulk assigning roles:', error)
      throw error
    }
  },

  async bulkUpdatePermissions(roleId: string, permissions: { id: string; isGranted: boolean }[]): Promise<ApiResponse<Role>> {
    try {
      const grantedPermissions = permissions
        .filter(perm => perm.isGranted)
        .map(perm => perm.id)
      
      return await this.updateRolePermissions(roleId, grantedPermissions)
    } catch (error) {
      console.error('Error bulk updating permissions:', error)
      throw error
    }
  },

  // Initialize default roles
  async initializeDefaultRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await api.post('/roles/initialize')
      return response.data
    } catch (error) {
      console.error('Error initializing default roles:', error)
      throw error
    }
  }
}

export default rolesService
