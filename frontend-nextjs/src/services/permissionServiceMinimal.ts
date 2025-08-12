import { useAuth } from '@/context/AuthContext'

export interface Permission {
  module: string
  actions: string[]
}

export interface UserPermissions {
  [module: string]: string[]
}

// React hook for permission checking
export const usePermissionsMinimal = () => {
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
    hasPermission: (module: string, action: string) => {
      if (!userPermissions[module]) return false
      return userPermissions[module].includes(action)
    },
    hasModuleAccess: (module: string) => {
      return !!userPermissions[module] && userPermissions[module].length > 0
    },
    canPerformAction: (module: string, action: string) => {
      if (!userPermissions[module]) return false
      return userPermissions[module].includes(action)
    },
    getAccessibleModules: () => {
      return Object.keys(userPermissions).filter(module => 
        !!userPermissions[module] && userPermissions[module].length > 0
      )
    },
    getModulePermissions: (module: string) => {
      return userPermissions[module] || []
    },
    isAdmin: () => {
      const allModules = ['users', 'projects', 'finance', 'analytics', 'hr', 'tasks', 'teams', 'sprints', 'content', 'integrations', 'settings', 'roles']
      return allModules.every(module => 
        !!userPermissions[module] && userPermissions[module].length > 0
      )
    }
  }
}
