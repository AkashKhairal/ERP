import { useAuth } from '@/context/AuthContext'
import {
  Home,
  Users,
  UserCircle,
  Building2,
  FolderOpen,
  CheckSquare,
  Calendar,
  DollarSign,
  BarChart3,
  FileText,
  Zap,
  Settings,
  Shield
} from 'lucide-react'

export interface Permission {
  module: string
  actions: string[]
}

export interface ModuleConfig {
  name: string
  href: string
  icon: any
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

// Available modules configuration
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

// Permission checking functions
export const permissionService = {
  // Check if user has permission for a specific module and action
  hasPermission: (userPermissions: UserPermissions, module: string, action: string): boolean => {
    if (!userPermissions[module]) return false
    return userPermissions[module].includes(action)
  },

  // Check if user has access to a module (any permission)
  hasModuleAccess: (userPermissions: UserPermissions, module: string): boolean => {
    return !!userPermissions[module] && userPermissions[module].length > 0
  },

  // Get all accessible modules for a user
  getAccessibleModules: (userPermissions: UserPermissions): string[] => {
    return Object.keys(userPermissions).filter(module => 
      !!userPermissions[module] && userPermissions[module].length > 0
    )
  },

  // Get user's permissions for a specific module
  getModulePermissions: (userPermissions: UserPermissions, module: string): string[] => {
    return userPermissions[module] || []
  },

  // Check if user can perform an action on a module
  canPerformAction: (userPermissions: UserPermissions, module: string, action: string): boolean => {
    if (!userPermissions[module]) return false
    return userPermissions[module].includes(action)
  },

  // Get filtered navigation based on user permissions
  getFilteredNavigation: (): any[] => {
    // TEMPORARY: Show all navigation items to restore original UI
    // TODO: Re-enable permission filtering after UI is restored
    const iconMap: Record<string, any> = {
      Home,
      Users,
      UserCircle,
      Building2,
      FolderOpen,
      CheckSquare,
      Calendar,
      DollarSign,
      BarChart3,
      FileText,
      Zap,
      Settings,
      Shield
    }

    const navigation = [
      {
        section: 'Main',
        items: ['dashboard'].map(module => ({
          ...MODULES[module],
          icon: iconMap[MODULES[module].icon]
        }))
      },
      {
        section: 'Management',
        items: ['hr', 'users', 'teams'].map(module => ({
          ...MODULES[module],
          icon: iconMap[MODULES[module].icon]
        }))
      },
      {
        section: 'Projects',
        items: ['projects', 'tasks', 'sprints'].map(module => ({
          ...MODULES[module],
          icon: iconMap[MODULES[module].icon]
        }))
      },
      {
        section: 'Business',
        items: ['finance', 'analytics', 'content'].map(module => ({
          ...MODULES[module],
          icon: iconMap[MODULES[module].icon]
        }))
      },
      {
        section: 'System',
        items: ['settings', 'roles'].map(module => ({
          ...MODULES[module],
          icon: iconMap[MODULES[module].icon]
        }))
      }
    ]

    return navigation
  },

  // Check if user is admin (has all permissions)
  isAdmin: (userPermissions: UserPermissions): boolean => {
    const allModules = Object.keys(MODULES)
    return allModules.every(module => 
      !!userPermissions[module] && userPermissions[module].length > 0
    )
  },

  // Get permission description for better UX
  getPermissionDescription: (action: string): string => {
    const descriptions: Record<string, string> = {
      create: 'Create new records',
      read: 'View existing records',
      update: 'Modify existing records',
      delete: 'Remove records',
      approve: 'Approve requests and changes',
      export: 'Export data to files'
    }
    return descriptions[action] || action
  },

  // Get module description
  getModuleDescription: (module: string): string => {
    return MODULES[module]?.description || 'Module description not available'
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
export const usePermissions = () => {
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
      permissionService.hasPermission(userPermissions, module, action),
    hasModuleAccess: (module: string) => 
      permissionService.hasModuleAccess(userPermissions, module),
    canPerformAction: (module: string, action: string) => 
      permissionService.canPerformAction(userPermissions, module, action),
    getAccessibleModules: () => 
      permissionService.getAccessibleModules(userPermissions),
    getModulePermissions: (module: string) => 
      permissionService.getModulePermissions(userPermissions, module),
    getFilteredNavigation: () => 
      permissionService.getFilteredNavigation(),
    isAdmin: () => 
      permissionService.isAdmin(userPermissions)
  }
}

export default permissionService
