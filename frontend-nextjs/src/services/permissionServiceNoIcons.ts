import { useAuth } from '@/context/AuthContext'

export interface Permission {
  module: string
  actions: string[]
}

export interface ModuleConfig {
  name: string
  href: string
  icon: string
  description: string
  requiredPermissions: string[]
  actions: {
    create?: boolean
    read?: boolean
    update?: boolean
    delete?: boolean
    approve?: boolean
    export?: boolean
  }
}

export interface UserPermissions {
  [module: string]: string[]
}

// Available modules configuration (without icon imports)
export const MODULES: Record<string, ModuleConfig> = {
  dashboard: {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'Home',
    description: 'Overview and insights',
    requiredPermissions: ['read'],
    actions: { read: true }
  },
  users: {
    name: 'Users',
    href: '/users',
    icon: 'UserCircle',
    description: 'User administration',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  },
  teams: {
    name: 'Teams',
    href: '/teams',
    icon: 'Building2',
    description: 'Team collaboration',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  },
  hr: {
    name: 'HR',
    href: '/hr',
    icon: 'Users',
    description: 'Employee management',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  },
  projects: {
    name: 'Projects',
    href: '/projects',
    icon: 'FolderOpen',
    description: 'Project management',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  },
  tasks: {
    name: 'Tasks',
    href: '/tasks',
    icon: 'CheckSquare',
    description: 'Task tracking',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  },
  sprints: {
    name: 'Sprints',
    href: '/sprints',
    icon: 'Calendar',
    description: 'Sprint planning',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  },
  finance: {
    name: 'Finance',
    href: '/finance',
    icon: 'DollarSign',
    description: 'Financial overview',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  },
  analytics: {
    name: 'Analytics',
    href: '/analytics',
    icon: 'BarChart3',
    description: 'Data insights',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  },
  content: {
    name: 'Content',
    href: '/content',
    icon: 'FileText',
    description: 'Content management',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  },
  integrations: {
    name: 'Integrations',
    href: '/integrations',
    icon: 'Zap',
    description: 'Third-party connections',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  },
  settings: {
    name: 'Settings',
    href: '/settings',
    icon: 'Settings',
    description: 'System configuration',
    requiredPermissions: ['read'],
    actions: { read: true, update: true }
  },
  roles: {
    name: 'Roles',
    href: '/roles',
    icon: 'Shield',
    description: 'Access control',
    requiredPermissions: ['read'],
    actions: { create: true, read: true, update: true, delete: true, approve: true, export: true }
  }
}

// Helper functions for external use
export const getAvailableActions = (): string[] => {
  return [
    'create',
    'read',
    'update',
    'delete',
    'approve',
    'export'
  ]
}

export const getModuleDescriptions = (): Record<string, string> => {
  return {
    users: 'User Management - Create, view, edit, and delete user accounts',
    teams: 'Team Management - Manage team structures and assignments',
    employees: 'Employee Management - HR employee data and profiles',
    attendance: 'Attendance Tracking - Daily check-ins and time tracking',
    leaves: 'Leave Management - Request and approve time off',
    payroll: 'Payroll Management - Salary and compensation data',
    projects: 'Project Management - Create and manage projects',
    tasks: 'Task Management - Assign and track individual tasks',
    sprints: 'Sprint Management - Agile development sprints',
    finance: 'Finance Management - Budget, expenses, and revenue',
    analytics: 'Analytics & Reporting - Data insights and reports',
    content: 'Content Management - YouTube and course content',
    integrations: 'Integrations - Third-party service connections'
  }
}

export const getActionDescriptions = (): Record<string, string> => {
  return {
    create: 'Can create new records',
    read: 'Can view existing records',
    update: 'Can modify existing records',
    delete: 'Can remove records',
    approve: 'Can approve requests and changes',
    export: 'Can export data to files'
  }
}

// React hook for permission checking
export const usePermissionsNoIcons = () => {
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
      const allModules = Object.keys(MODULES)
      return allModules.every(module => 
        !!userPermissions[module] && userPermissions[module].length > 0
      )
    }
  }
}
