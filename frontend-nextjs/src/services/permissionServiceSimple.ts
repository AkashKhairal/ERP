import { useAuth } from '@/context/AuthContext'

export interface Permission {
  module: string
  actions: string[]
}

export interface UserPermissions {
  [module: string]: string[]
}

// Simple permission checking functions
export const hasPermission = (userPermissions: UserPermissions, module: string, action: string): boolean => {
  if (!userPermissions[module]) return false
  return userPermissions[module].includes(action)
}

export const hasModuleAccess = (userPermissions: UserPermissions, module: string): boolean => {
  return !!userPermissions[module] && userPermissions[module].length > 0
}

export const getAccessibleModules = (userPermissions: UserPermissions): string[] => {
  return Object.keys(userPermissions).filter(module => 
    !!userPermissions[module] && userPermissions[module].length > 0
  )
}

// React hook for permission checking
export const usePermissionsSimple = () => {
  const { user } = useAuth()
  
  // Extract permissions from user roles
  const getUserPermissions = (): UserPermissions => {
    if (!user?.roles) return {}
    
    const permissions: UserPermissions = {}
    
    user.roles.forEach((role: any) => {
      if (role.permissions) {
        role.permissions.forEach((permission: Permission) => {
          if (!permissions[permission.module]) {
            permissions[permission.module] = []
          }
          permissions[permission.module] = [
            ...new Set([...permissions[permission.module], ...permission.actions])
          ]
        })
      }
    })
    
    return permissions
  }
  
  const userPermissions = getUserPermissions()
  
  return {
    userPermissions,
    hasPermission: (module: string, action: string) => 
      hasPermission(userPermissions, module, action),
    hasModuleAccess: (module: string) => 
      hasModuleAccess(userPermissions, module),
    canPerformAction: (module: string, action: string) => 
      hasPermission(userPermissions, module, action),
    getAccessibleModules: () => 
      getAccessibleModules(userPermissions),
    getModulePermissions: (module: string) => 
      userPermissions[module] || [],
    isAdmin: () => {
      const allModules = ['users', 'projects', 'finance', 'analytics', 'hr', 'tasks', 'teams', 'sprints', 'content', 'integrations', 'settings', 'roles']
      return allModules.every(module => 
        hasModuleAccess(userPermissions, module)
      )
    }
  }
}
