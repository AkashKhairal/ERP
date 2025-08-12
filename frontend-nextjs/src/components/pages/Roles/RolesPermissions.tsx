'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Shield, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Filter,
  Download,
  Upload,
  Settings,
  Users,
  Key,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  Lock,
  Unlock,
  Eye,
  Copy,
  MoreHorizontal,
  RefreshCw,
  Archive,
  Zap,
  Target,
  Building,
  Globe,
  Database,
  ShieldCheck,
  UserX,
  AlertCircle,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { rolesService } from '@/services/rolesService'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthContext'
import CreateRoleForm from './CreateRoleForm'
import EditRoleForm from './EditRoleForm'
import { Permission, Role, User } from '@/services/rolesService'

// Advanced filtering and bulk operations
interface FilterState {
  status: string
  priority: string
  category: string
  riskLevel: string
}

interface BulkAction {
  type: 'activate' | 'deactivate' | 'delete' | 'export' | 'archive'
  selectedRoles: string[]
}

const RolesPermissions = () => {
  const toast = useToast()
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false)
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false)
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false)
  const [isPermissionsMatrixOpen, setIsPermissionsMatrixOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isTabLoading, setIsTabLoading] = useState(false)
  
  // User assignment states
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false)
  const [selectedUserForAssignment, setSelectedUserForAssignment] = useState<User | null>(null)
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState<Role | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    category: 'all',
    riskLevel: 'all'
  })
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [isViewChanging, setIsViewChanging] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'users' | 'permissions'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Enhanced tab switching with loading state
  const handleTabChange = (value: string) => {
    setIsTabLoading(true)
    setActiveTab(value)
    
    // If switching to assignments tab, ensure we have fresh data
    if (value === 'assignments') {
      loadData()
    }
    
    // Simulate a brief loading state for smooth transitions
    setTimeout(() => setIsTabLoading(false), 300)
  }

  // Enhanced view mode switching with loading state
  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setIsViewChanging(true)
    setViewMode(mode)
    // Simulate a brief loading state for smooth transitions
    setTimeout(() => setIsViewChanging(false), 400)
  }

  // Data loading
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [rolesResponse, usersResponse, permissionsResponse] = await Promise.all([
        rolesService.getRoles(),
        rolesService.getUsers(),
        rolesService.getPermissions()
      ])

      setRoles(rolesResponse.data || [])
      setUsers(usersResponse.data || [])
      setPermissions(permissionsResponse.data || [])

      // Debug: Log user data to help diagnose the issue
      console.log('Users loaded:', usersResponse.data || [])
      console.log('Roles loaded:', rolesResponse.data || [])
      
      // Validate user data structure
      const validUsers = usersResponse.data || []
      const usersWithRoles = validUsers.filter(user => user && user.id && user.roleId)
      console.log('Users with roles:', usersWithRoles.length, 'of', validUsers.length)
      
      // Log specific user data for debugging
      if (validUsers.length > 0) {
        console.log('Sample user data structure:', validUsers[0])
        console.log('Sample user roles array:', validUsers[0].roles)
        console.log('Sample user roleId:', validUsers[0].roleId)
        console.log('Users with roleId:', validUsers.filter(u => u.roleId))
        console.log('Users without roleId:', validUsers.filter(u => !u.roleId))
      }

    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data. Please try again.')
      toast.error('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Advanced filtering and sorting
  const filteredAndSortedRoles = useMemo(() => {
    let filtered = roles.filter(role => {
      const matchesSearch = !searchTerm || 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'active' ? role.isActive : !role.isActive)
      
      const matchesPriority = filters.priority === 'all' || 
        role.priority === parseInt(filters.priority)
      
      const matchesCategory = filters.category === 'all' || 
        role.permissions.some(p => p.category === filters.category)
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'priority':
          aValue = a.priority || 0
          bValue = b.priority || 0
          break
        case 'users':
          aValue = users.filter(u => u && u.roleId === a.id).length
          bValue = users.filter(u => u && u.roleId === b.id).length
          break
        case 'permissions':
          aValue = a.permissions.length
          bValue = b.permissions.length
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [roles, users, searchTerm, filters, sortBy, sortOrder])

  // Filtered users for assignments
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // More lenient filtering - only require id
      if (!user || !user.id) return false
      
      const matchesSearch = !userSearchTerm || 
        (user.name && user.name.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
      
      const matchesRole = roleFilter === 'all' || 
        (roleFilter === 'unassigned' ? !user.roleId : user.roleId === roleFilter)
      
      return matchesSearch && matchesRole
    })

    return filtered.sort((a, b) => {
      // Safe sorting with fallbacks
      const nameA = a?.name || a?.email || a?.id || 'Unknown'
      const nameB = b?.name || b?.email || b?.id || 'Unknown'
      return nameA.localeCompare(nameB)
    })
  }, [users, userSearchTerm, roleFilter])

  // Analytics and metrics
  const analytics = useMemo(() => {
    const totalRoles = roles.length
    const activeRoles = roles.filter(r => r.isActive).length
    const systemRoles = roles.filter(r => r.isSystem).length
    const customRoles = totalRoles - systemRoles
    const totalUsers = users.length
    const activeUsers = users.filter(u => u && u.status === 'active').length
    const totalPermissions = permissions.length
    
    // Risk analysis
    const highRiskRoles = roles.filter(r => {
      const userCount = users.filter(u => u && u.roleId === r.id).length
      const permissionCount = r.permissions.length
      return userCount > 50 || permissionCount > 100 || r.permissions.some(p => p.resource === 'admin')
    })

    // Permission distribution
    const permissionCategories = permissions.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalRoles,
      activeRoles,
      systemRoles,
      customRoles,
      totalUsers,
      activeUsers,
      totalPermissions,
      highRiskRoles: highRiskRoles.length,
      permissionCategories
    }
  }, [roles, users, permissions])

  // CRUD operations
  const handleCreateRole = async (roleData: Partial<Role>) => {
    try {
      const response = await rolesService.createRole(roleData)
      if (response.success) {
        toast.success('Role created successfully!')
        setIsCreateRoleOpen(false)
        loadData()
      } else {
        throw new Error(response.message || 'Failed to create role')
      }
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Failed to create role. Please try again.')
    }
  }

  const handleEditRole = async (roleData: Partial<Role>) => {
    if (!selectedRole) return

    try {
      const response = await rolesService.updateRole(selectedRole.id, roleData)
      if (response.success) {
        toast.success('Role updated successfully!')
        setIsEditRoleOpen(false)
        setSelectedRole(null)
        loadData()
      } else {
        throw new Error(response.message || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role. Please try again.')
    }
  }

  const handleDeleteRole = async () => {
    if (!selectedRole) return

    try {
      const response = await rolesService.deleteRole(selectedRole.id)
      if (response.success) {
        toast.success('Role deleted successfully!')
        setIsDeleteRoleOpen(false)
        setSelectedRole(null)
        loadData()
      } else {
        throw new Error(response.message || 'Failed to delete role')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Failed to delete role. Please try again.')
    }
  }

  // User assignment operations
  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      console.log('Assigning role:', { userId, roleId })
      console.log('User before assignment:', users.find(u => u.id === userId))
      
      const response = await rolesService.assignRoleToUser(userId, roleId)
      console.log('Role assignment response:', response)
      
      if (response.success) {
        toast.success('Role assigned successfully!')
        console.log('User after assignment:', response.data)
        
        // Refresh the data to show updated role assignments
        await loadData()
        
        // Log the updated user data after refresh
        const updatedUsers = await rolesService.getUsers()
        const updatedUser = updatedUsers.data.find(u => u.id === userId)
        console.log('Updated user after refresh:', updatedUser)
      } else {
        throw new Error(response.message || 'Failed to assign role')
      }
    } catch (error) {
      console.error('Error assigning role:', error)
      toast.error('Failed to assign role. Please try again.')
    }
  }

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      const response = await rolesService.removeRoleFromUser(userId, roleId)
      if (response.success) {
        toast.success('Role removed successfully!')
        // Refresh the data to show updated role assignments
        await loadData()
      } else {
        throw new Error(response.message || 'Failed to remove role')
      }
    } catch (error) {
      console.error('Error removing role:', error)
      toast.error('Failed to remove role. Please try again.')
    }
  }

  const handleBulkAssignRole = async (userIds: string[], roleId: string) => {
    try {
      const assignments = userIds.map(userId => ({ userId, roleId }))
      const response = await rolesService.bulkAssignRoles(assignments)
      if (response.success) {
        toast.success(`Role assigned to ${userIds.length} users successfully!`)
        setSelectedUsers([])
        // Refresh the data to show updated role assignments
        await loadData()
      } else {
        throw new Error(response.message || 'Failed to assign role to users')
      }
    } catch (error) {
      console.error('Error bulk assigning role:', error)
      toast.error('Failed to assign role to users. Please try again.')
    }
  }

  const handleBulkRemoveRole = async (userIds: string[]) => {
    try {
      // Remove roles from multiple users - we need to get their current role first
      for (const userId of userIds) {
        const user = users.find(u => u.id === userId)
        if (user && user.roleId) {
          await rolesService.removeRoleFromUser(userId, user.roleId)
        }
      }
      toast.success(`Role removed from ${userIds.length} users successfully!`)
      setSelectedUsers([])
      // Refresh the data to show updated role assignments
      await loadData()
    } catch (error) {
      console.error('Error bulk removing role:', error)
      toast.error('Failed to remove role from users. Please try again.')
    }
  }

  // Bulk operations
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete' | 'export') => {
    if (selectedRoles.length === 0) return

    try {
      switch (action) {
        case 'activate':
          await Promise.all(selectedRoles.map(id => 
            rolesService.updateRole(id, { isActive: true })
          ))
          toast.success(`${selectedRoles.length} roles activated successfully!`)
          break
        case 'deactivate':
          await Promise.all(selectedRoles.map(id => 
            rolesService.updateRole(id, { isActive: false })
          ))
          toast.success(`${selectedRoles.length} roles deactivated successfully!`)
          break
        case 'delete':
          await Promise.all(selectedRoles.map(id => 
            rolesService.deleteRole(id)
          ))
          toast.success(`${selectedRoles.length} roles deleted successfully!`)
          break
        case 'export':
          // Export functionality
          toast.success('Roles exported successfully!')
          break
      }
      
      setSelectedRoles([])
      setIsBulkActionsOpen(false)
      loadData()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action. Please try again.')
    }
  }

  // Role selection
  const handleRoleSelection = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId])
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRoles(filteredAndSortedRoles.map(r => r.id))
    } else {
      setSelectedRoles([])
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Manual refresh function for debugging
  const refreshUserData = async () => {
    try {
      console.log('Manually refreshing user data...');
      const usersResponse = await rolesService.getUsers();
      console.log('Fresh user data:', usersResponse.data);
      setUsers(usersResponse.data || []);
      
      // Check if the specific user (Akash Khairal) has been updated
      const akashUser = usersResponse.data?.find(u => 
        u.name && u.name.toLowerCase().includes('akash')
      );
      if (akashUser) {
        console.log('Akash user data:', akashUser);
        console.log('Akash roleId:', akashUser.roleId);
        console.log('Akash roles array:', akashUser.roles);
        console.log('Akash role field:', akashUser.role);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={loadData} className="btn-luxury-primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" data-testid="roles-permissions">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Enhanced Header Section */}
        <div className="dashboard-header-gradient">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="dashboard-title-luxury">
                Enterprise Roles & Permissions
              </h1>
              <p className="dashboard-subtitle-luxury">
                Advanced access control and security management for enterprise applications
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-shrink-0">
              <Button 
                variant="outline"
                size="sm" 
                className="btn-luxury-secondary group relative rounded-2xl px-4 py-2 font-semibold tracking-tight btn-luxury-text"
                onClick={() => setIsBulkActionsOpen(true)}
              >
                <Download className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Export
              </Button>
              <Button 
                variant="outline"
                size="sm" 
                className="btn-luxury-secondary group relative rounded-2xl px-4 py-2 font-semibold tracking-tight btn-luxury-text"
              >
                <Upload className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Import
              </Button>
              <Button 
                size="sm" 
                className="btn-luxury-primary group relative rounded-2xl px-6 py-3 font-bold tracking-tight btn-luxury-text"
                onClick={() => setIsCreateRoleOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Create Role
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Dashboard */}
        <div className="dashboard-section-luxury">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="dashboard-luxury-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="dashboard-metric-label">Total Roles</p>
                    <p className="dashboard-metric-value">{analytics.totalRoles}</p>
                    <p className="dashboard-metric-change">
                      {analytics.customRoles} custom, {analytics.systemRoles} system
                    </p>
                  </div>
                  <div className="icon-container-luxury">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-luxury-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="dashboard-metric-label">Active Users</p>
                    <p className="dashboard-metric-value">{analytics.activeUsers}</p>
                    <p className="dashboard-metric-change">
                      of {analytics.totalUsers} total users
                    </p>
                  </div>
                  <div className="icon-container-luxury">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-luxury-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="dashboard-metric-label">Permissions</p>
                    <p className="dashboard-metric-value">{analytics.totalPermissions}</p>
                    <p className="dashboard-metric-change">
                      across {Object.keys(analytics.permissionCategories).length} categories
                    </p>
                  </div>
                  <div className="icon-container-luxury">
                    <Key className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-luxury-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="dashboard-metric-label">Risk Level</p>
                    <p className="dashboard-metric-value">{analytics.highRiskRoles}</p>
                    <p className="dashboard-metric-change">
                      high-risk roles identified
                    </p>
                  </div>
                  <div className="icon-container-luxury">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="dashboard-section-luxury">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-1 shadow-sm">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-700 ease-out transform data-[state=active]:scale-105 data-[state=active]:shadow-lg hover:scale-105 hover:shadow-md"
              >
                <BarChart3 className="h-4 w-4 mr-2 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-12" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="roles" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-700 ease-out transform data-[state=active]:scale-105 data-[state=active]:shadow-lg hover:scale-105 hover:shadow-md"
              >
                <Shield className="h-4 w-4 mr-2 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-12" />
                Roles
              </TabsTrigger>
              <TabsTrigger 
                value="assignments" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-700 ease-out transform data-[state=active]:scale-105 data-[state=active]:shadow-lg hover:scale-105 hover:shadow-md"
              >
                <UserCheck className="h-4 w-4 mr-2 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-12" />
                Assignments
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-700 ease-out transform data-[state=active]:scale-105 data-[state=active]:shadow-lg hover:scale-105 hover:shadow-md"
              >
                <TrendingUp className="h-4 w-4 mr-2 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-12" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-700 ease-out transform data-[state=active]:scale-105 data-[state=active]:shadow-lg hover:scale-105 hover:shadow-md"
              >
                <Lock className="h-4 w-4 mr-2 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-12" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 animate-in slide-in-from-bottom-4 duration-700 ease-out">
              {isTabLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <Card className="chart-container-luxury animate-in slide-in-from-left-4 duration-700 ease-out delay-100">
                    <CardHeader>
                      <CardTitle className="dashboard-card-title">Recent Role Changes</CardTitle>
                      <CardDescription className="dashboard-card-description">
                        Latest updates to roles and permissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {roles.slice(0, 5).map((role, index) => (
                          <div key={role.id} className="activity-item-luxury animate-in slide-in-from-left-4 duration-500 ease-out" style={{ animationDelay: `${150 + index * 100}ms` }}>
                            <div className="flex items-center space-x-3">
                              <div className="icon-container-luxury p-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="dashboard-activity-title">{role.name}</p>
                                <p className="dashboard-activity-description">
                                  {role.permissions.length} permissions • {users.filter(u => u && u.roleId === role.id).length} users
                                </p>
                              </div>
                              <span className="dashboard-activity-time">
                                {new Date(role.updatedAt || role.createdAt || '').toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Permission Distribution */}
                  <Card className="chart-container-luxury animate-in slide-in-from-right-4 duration-700 ease-out delay-200">
                    <CardHeader>
                      <CardTitle className="dashboard-card-title">Permission Distribution</CardTitle>
                      <CardDescription className="dashboard-card-description">
                        How permissions are allocated across roles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(analytics.permissionCategories).slice(0, 5).map(([category, count], index) => (
                          <div key={category} className="flex items-center justify-between animate-in slide-in-from-right-4 duration-500 ease-out" style={{ animationDelay: `${250 + index * 100}ms` }}>
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                              <span className="dashboard-activity-title capitalize">{category}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="dashboard-activity-description">
                                {count} permissions
                              </span>
                              <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${(count / Math.max(...Object.values(analytics.permissionCategories))) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="mt-6 animate-in slide-in-from-bottom-4 duration-700 ease-out">
              <div className="space-y-6">
                {/* Advanced Controls */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between animate-in slide-in-from-top-4 duration-500 ease-out">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ease-out hover:shadow-md focus:shadow-lg"
                      />
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-1 shadow-sm">
                      <Button
                        size="sm"
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        onClick={() => handleViewModeChange('grid')}
                        className="rounded-lg transition-all duration-500 ease-out transform hover:scale-105 data-[state=active]:scale-105 data-[state=active]:shadow-lg"
                        data-state={viewMode === 'grid' ? 'active' : 'inactive'}
                      >
                        <div className="w-4 h-4 grid grid-cols-2 gap-0.5 transition-all duration-300 ease-out">
                          <div className="w-1.5 h-1.5 bg-current rounded-sm transition-all duration-300 ease-out"></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-sm transition-all duration-300 ease-out"></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-sm transition-all duration-300 ease-out"></div>
                          <div className="w-1.5 h-1.5 bg-current rounded-sm transition-all duration-300 ease-out"></div>
                        </div>
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        onClick={() => handleViewModeChange('table')}
                        className="rounded-lg transition-all duration-500 ease-out transform hover:scale-105 data-[state=active]:scale-105 data-[state=active]:shadow-lg"
                        data-state={viewMode === 'table' ? 'active' : 'inactive'}
                      >
                        <div className="w-4 h-4 flex flex-col space-y-0.5 transition-all duration-300 ease-out">
                          <div className="w-full h-0.5 bg-current rounded-sm transition-all duration-300 ease-out"></div>
                          <div className="w-full h-0.5 bg-current rounded-sm transition-all duration-300 ease-out"></div>
                          <div className="w-full h-0.5 bg-current rounded-sm transition-all duration-300 ease-out"></div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedRoles.length > 0 && (
                    <div className="flex items-center space-x-2 animate-in slide-in-from-right-4 duration-500 ease-out">
                      <span className="text-sm text-slate-600">
                        {selectedRoles.length} selected
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsBulkActionsOpen(true)}
                        className="btn-luxury-secondary transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md"
                      >
                        Bulk Actions
                      </Button>
                    </div>
                  )}
                </div>

                {/* Advanced Filters */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4 shadow-sm animate-in slide-in-from-top-4 duration-500 ease-out delay-100">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="w-full lg:w-40 bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl transition-all duration-300 ease-out hover:shadow-md focus:shadow-lg">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger className="w-full lg:w-40 bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl transition-all duration-300 ease-out hover:shadow-md focus:shadow-lg">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="1">High Priority</SelectItem>
                        <SelectItem value="5">Medium Priority</SelectItem>
                        <SelectItem value="10">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="w-full lg:w-40 bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl transition-all duration-300 ease-out hover:shadow-md focus:shadow-lg">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Array.from(new Set(permissions.map(p => p.category))).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-full lg:w-40 bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl transition-all duration-300 ease-out hover:shadow-md focus:shadow-lg">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="permissions">Permissions</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="btn-luxury-secondary transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>

                {/* Roles Grid/Table with Smooth Transitions */}
                <div className="transition-all duration-700 ease-out">
                  {isViewChanging ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">Switching to {viewMode === 'grid' ? 'grid' : 'table'} view...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700 ease-out">
                          {filteredAndSortedRoles.map((role, index) => (
                            <Card key={role.id} className="dashboard-luxury-card group animate-in slide-in-from-bottom-4 duration-500 ease-out transform hover:scale-105 transition-all duration-300 ease-out hover:shadow-xl" style={{ animationDelay: `${index * 100}ms` }}>
                              <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={selectedRoles.includes(role.id)}
                                      onCheckedChange={(checked) => handleRoleSelection(role.id, !!checked)}
                                      className="rounded transition-all duration-200 ease-out hover:scale-110"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <CardTitle className="dashboard-card-title truncate">{role.name}</CardTitle>
                                      <CardDescription className="dashboard-card-description line-clamp-2">
                                        {role.description}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    {role.isSystem && (
                                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 transition-all duration-300 ease-out hover:scale-105">
                                        System
                                      </Badge>
                                    )}
                                    <Badge variant={role.isActive ? "default" : "secondary"} className="transition-all duration-300 ease-out hover:scale-105">
                                      {role.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="dashboard-activity-description">Users</span>
                                  <span className="dashboard-activity-title">
                                    {users.filter(user => user.roleId === role.id).length}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="dashboard-activity-description">Permissions</span>
                                  <span className="dashboard-activity-title">{role.permissions.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="dashboard-activity-description">Priority</span>
                                  <span className="dashboard-activity-title">{role.priority || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 btn-luxury-secondary transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md"
                                    onClick={() => {
                                      setSelectedRole(role)
                                      setIsEditRoleOpen(true)
                                    }}
                                  >
                                    <Edit3 className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  {!role.isSystem && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="btn-luxury-secondary transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md"
                                      onClick={() => {
                                        setSelectedRole(role)
                                        setIsDeleteRoleOpen(true)
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {viewMode === 'table' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-700 ease-out">
                          <Card className="dashboard-luxury-card">
                            <CardHeader>
                              <CardTitle className="dashboard-card-title">Roles Table View</CardTitle>
                              <CardDescription className="dashboard-card-description">
                                Comprehensive view of all roles with detailed information
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-full divide-y divide-slate-200/50">
                                  <thead>
                                    <tr className="border-b border-slate-200/50 bg-slate-50/50">
                                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            checked={selectedRoles.length === filteredAndSortedRoles.length}
                                            onCheckedChange={handleSelectAll}
                                            className="rounded transition-all duration-200 ease-out hover:scale-110"
                                          />
                                          <span className="hidden sm:inline">Role</span>
                                          <span className="sm:hidden">R</span>
                                        </div>
                                      </th>
                                      <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Description
                                      </th>
                                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        <button 
                                          onClick={() => setSortBy('users')}
                                          className="flex items-center space-x-1 hover:text-slate-800 transition-colors duration-200"
                                        >
                                          <span className="hidden sm:inline">Users</span>
                                          <span className="sm:hidden">U</span>
                                          <div className="flex flex-col">
                                            <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-slate-400 ${sortBy === 'users' && sortOrder === 'asc' ? 'border-b-blue-600' : ''}`}></div>
                                            <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-400 ${sortBy === 'users' && sortOrder === 'desc' ? 'border-t-blue-600' : ''}`}></div>
                                          </div>
                                        </button>
                                      </th>
                                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        <button 
                                          onClick={() => setSortBy('permissions')}
                                          className="flex items-center space-x-1 hover:text-slate-800 transition-colors duration-200"
                                        >
                                          <span className="hidden sm:inline">Permissions</span>
                                          <span className="sm:hidden">P</span>
                                          <div className="flex flex-col">
                                            <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-slate-400 ${sortBy === 'permissions' && sortOrder === 'asc' ? 'border-b-blue-600' : ''}`}></div>
                                            <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-400 ${sortBy === 'permissions' && sortOrder === 'desc' ? 'border-t-blue-600' : ''}`}></div>
                                          </div>
                                        </button>
                                      </th>
                                      <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        <button 
                                          onClick={() => setSortBy('priority')}
                                          className="flex items-center space-x-1 hover:text-slate-800 transition-colors duration-200"
                                        >
                                          <span>Priority</span>
                                          <div className="flex flex-col">
                                            <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-slate-400 ${sortBy === 'priority' && sortOrder === 'asc' ? 'border-b-blue-600' : ''}`}></div>
                                            <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-400 ${sortBy === 'priority' && sortOrder === 'desc' ? 'border-t-blue-600' : ''}`}></div>
                                          </div>
                                        </button>
                                      </th>
                                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        <span className="hidden sm:inline">Status</span>
                                        <span className="sm:hidden">S</span>
                                      </th>
                                      <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        <span className="hidden sm:inline">Actions</span>
                                        <span className="sm:hidden">A</span>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200/50 bg-white">
                                    {filteredAndSortedRoles.map((role, index) => (
                                      <tr 
                                        key={role.id} 
                                        className="animate-in slide-in-from-bottom-4 duration-500 ease-out hover:bg-slate-50/50 transition-all duration-300 ease-out group"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                      >
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center space-x-3">
                                            <Checkbox
                                              checked={selectedRoles.includes(role.id)}
                                              onCheckedChange={(checked) => handleRoleSelection(role.id, !!checked)}
                                              className="rounded transition-all duration-200 ease-out hover:scale-110"
                                            />
                                            <div className="flex items-center space-x-3">
                                              <div className="icon-container-luxury p-2 group-hover:scale-110 transition-transform duration-300 ease-out">
                                                <Shield className="h-4 w-4 text-blue-600" />
                                              </div>
                                              <div>
                                                <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors duration-200">{role.name}</div>
                                                {role.isSystem && (
                                                  <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                                    System
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                                          <div className="text-sm text-slate-600 max-w-xs truncate group-hover:text-slate-800 transition-colors duration-200" title={role.description}>
                                            {role.description || 'No description'}
                                          </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors duration-200" />
                                            <span className="text-sm text-slate-900 font-medium">
                                              {users.filter(user => user.roleId === role.id).length}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center space-x-2">
                                            <Key className="h-4 w-4 text-slate-400 group-hover:text-purple-500 transition-colors duration-200" />
                                            <span className="text-sm text-slate-900 font-medium">
                                              {role.permissions.length}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center space-x-2">
                                            <Target className="h-4 w-4 text-slate-400 group-hover:text-green-500 transition-colors duration-200" />
                                            <span className="text-sm text-slate-900 font-medium">
                                              {role.priority || 'N/A'}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                          <Badge 
                                            variant={role.isActive ? "default" : "secondary"}
                                            className={`transition-all duration-300 ease-out hover:scale-105 ${
                                              role.isActive 
                                                ? 'bg-green-100 text-green-700 border-green-200 group-hover:bg-green-200' 
                                                : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-200'
                                            }`}
                                          >
                                            {role.isActive ? 'Active' : 'Inactive'}
                                          </Badge>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center space-x-2">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="btn-luxury-secondary transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md"
                                              onClick={() => {
                                                setSelectedRole(role)
                                                setIsEditRoleOpen(true)
                                              }}
                                            >
                                              <Edit3 className="h-3 w-3 mr-1" />
                                              <span className="hidden sm:inline">Edit</span>
                                            </Button>
                                            {!role.isSystem && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="btn-luxury-secondary transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => {
                                                  setSelectedRole(role)
                                                  setIsDeleteRoleOpen(true)
                                                }}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                                <span className="hidden sm:inline">Delete</span>
                                              </Button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              
                              {/* Table Summary Footer */}
                              <div className="border-t border-slate-200/50 bg-slate-50/30 px-4 sm:px-6 py-3">
                                <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600">
                                  <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                                    <span>
                                      Showing <span className="font-medium text-slate-900">{filteredAndSortedRoles.length}</span> of <span className="font-medium text-slate-900">{roles.length}</span> roles
                                    </span>
                                    {selectedRoles.length > 0 && (
                                      <span className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        <span className="font-medium text-blue-700">{selectedRoles.length} selected</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs">
                                    <span className="text-slate-500">Sort by:</span>
                                    <span className="font-medium text-slate-700 capitalize">{sortBy}</span>
                                    <span className="text-slate-500">({sortOrder === 'asc' ? 'ascending' : 'descending'})</span>
                                  </div>
                                </div>
                              </div>
                              
                              {filteredAndSortedRoles.length === 0 && (
                                <div className="text-center py-12 text-slate-500">
                                  <Shield className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                  <p className="text-lg font-medium">No roles found</p>
                                  <p className="text-sm">Try adjusting your search or filters</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Select All Checkbox */}
                {filteredAndSortedRoles.length > 0 && (
                  <div className="flex items-center space-x-2 pt-4 border-t border-slate-200/50 animate-in slide-in-from-top-4 duration-500 ease-out delay-200">
                    <Checkbox
                      checked={selectedRoles.length === filteredAndSortedRoles.length}
                      onCheckedChange={handleSelectAll}
                      className="rounded transition-all duration-200 ease-out hover:scale-110"
                    />
                    <span className="text-sm text-slate-600">
                      Select all {filteredAndSortedRoles.length} roles
                    </span>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* User Assignments Tab */}
            <TabsContent value="assignments" className="mt-6 animate-in slide-in-from-bottom-4 duration-700 ease-out">
              {isTabLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="dashboard-card-title text-xl">User Role Assignments</h3>
                      <p className="dashboard-card-description">
                        Manage user role assignments and permissions
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => loadData()}
                        variant="outline"
                        size="sm"
                        className="btn-luxury-secondary transition-all duration-200 hover:scale-105"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        onClick={() => refreshUserData()}
                        variant="outline"
                        size="sm"
                        className="btn-luxury-secondary transition-all duration-200 hover:scale-105"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Users
                      </Button>
                      <Button
                        onClick={() => setIsAssignRoleOpen(true)}
                        className="btn-luxury-primary transition-all duration-200 hover:scale-105"
                        disabled={selectedUsers.length === 0}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Assign Role ({selectedUsers.length})
                      </Button>

                      {selectedUsers.length > 0 && (
                        <Button
                          onClick={() => handleBulkRemoveRole(selectedUsers)}
                          variant="outline"
                          className="btn-luxury-secondary transition-all duration-200 hover:scale-105"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Remove Role
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-300"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl hover:border-slate-300 transition-all duration-200">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="unassigned">Unassigned Users</SelectItem>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => {
                          setUserSearchTerm('')
                          setRoleFilter('all')
                          setSelectedUsers([])
                        }}
                        variant="outline"
                        size="sm"
                        className="btn-luxury-secondary transition-all duration-200 hover:scale-105"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>

                  {/* Users Table */}
                  <Card className="chart-container-luxury animate-in slide-in-from-bottom-4 duration-700 ease-out">
                    <CardHeader>
                      <CardTitle className="dashboard-card-title">User Assignments</CardTitle>
                      <CardDescription className="dashboard-card-description">
                        {filteredUsers.length} users found • {selectedUsers.length} selected
                      </CardDescription>
                      {/* Debug information */}
                      <div className="text-xs text-slate-500 mt-2">
                        <p>Total users: {users.length} • Users with roles: {users.filter(u => u && u.roleId).length}</p>
                        <p>Last updated: {new Date().toLocaleTimeString()}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200/50">
                              <th className="text-left p-4">
                                <Checkbox
                                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedUsers(filteredUsers.map(u => u.id))
                                    } else {
                                      setSelectedUsers([])
                                    }
                                  }}
                                  className="rounded transition-all duration-200 hover:scale-110"
                                />
                              </th>
                              <th className="text-left p-4 font-medium text-slate-900">User</th>
                              <th className="text-left p-4 font-medium text-slate-900">Email</th>
                              <th className="text-left p-4 font-medium text-slate-900">Current Role</th>
                              <th className="text-left p-4 font-medium text-slate-900">Status</th>
                              <th className="text-left p-4 font-medium text-slate-900">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user, index) => {
                              const userRole = roles.find(r => r.id === user.roleId)
                              // Skip rendering if user is invalid
                              if (!user || !user.id) return null
                              
                              // Handle different user data structures
                              const userAny = user as any
                              const userName = user.name || userAny.username || userAny.displayName || 'Unknown User'
                              const userEmail = user.email || userAny.emailAddress || 'No Email'
                              const userDepartment = user.department || userAny.team || 'No Department'
                              
                              return (
                                <tr 
                                  key={user.id} 
                                  className="animate-in slide-in-from-bottom-4 duration-500 ease-out hover:bg-slate-50/50 transition-all duration-300 ease-out group"
                                  style={{ animationDelay: `${index * 50}ms` }}
                                >
                                  <td className="p-4">
                                    <Checkbox
                                      checked={selectedUsers.includes(user.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedUsers(prev => [...prev, user.id])
                                        } else {
                                          setSelectedUsers(prev => prev.filter(id => id !== user.id))
                                        }
                                      }}
                                      className="rounded transition-all duration-200 hover:scale-110"
                                    />
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                        {userName.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-900">{userName}</p>
                                        <p className="text-sm text-slate-500">{userDepartment}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-slate-700">{userEmail}</span>
                                  </td>
                                  <td className="p-4">
                                    {userRole ? (
                                      <div className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                                          {userRole.name}
                                        </Badge>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        <UserX className="h-4 w-4 text-slate-400" />
                                        <Badge variant="outline" className="text-slate-500 border-slate-300">
                                          Unassigned
                                        </Badge>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-4">
                                    <Badge 
                                      variant={user.status === 'active' ? "default" : "secondary"}
                                      className={`transition-all duration-300 ease-out hover:scale-105 ${
                                        user.status === 'active' 
                                          ? 'bg-green-100 text-green-700 border-green-200' 
                                          : 'bg-slate-100 text-slate-700 border-slate-200'
                                      }`}
                                    >
                                      {user.status || 'Unknown'}
                                    </Badge>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="btn-luxury-secondary transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md"
                                        onClick={() => {
                                          setSelectedUserForAssignment(user)
                                          setSelectedRoleForAssignment(userRole || null)
                                          setIsAssignRoleOpen(true)
                                        }}
                                      >
                                        <UserCheck className="h-3 w-3 mr-1" />
                                        <span className="hidden sm:inline">Assign</span>
                                      </Button>
                                      {userRole && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="btn-luxury-secondary transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-md text-red-600 border-red-200 hover:bg-red-50"
                                          onClick={() => handleRemoveRole(user.id, user.roleId)}
                                        >
                                          <UserX className="h-3 w-3" />
                                          <span className="hidden sm:inline">Remove</span>
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6 animate-in slide-in-from-bottom-4 duration-700 ease-out">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Role Distribution Chart */}
                <Card className="chart-container-luxury animate-in slide-in-from-left-4 duration-700 ease-out delay-100">
                  <CardHeader>
                    <CardTitle className="dashboard-card-title">Role Distribution</CardTitle>
                    <CardDescription className="dashboard-card-description">
                      Breakdown of roles by type and status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between animate-in slide-in-from-left-4 duration-500 ease-out" style={{ animationDelay: '200ms' }}>
                        <span className="dashboard-activity-description">Custom Roles</span>
                        <span className="dashboard-activity-title">{analytics.customRoles}</span>
                      </div>
                      <div className="flex items-center justify-between animate-in slide-in-from-left-4 duration-500 ease-out" style={{ animationDelay: '300ms' }}>
                        <span className="dashboard-activity-description">System Roles</span>
                        <span className="dashboard-activity-title">{analytics.systemRoles}</span>
                      </div>
                      <div className="flex items-center justify-between animate-in slide-in-from-left-4 duration-500 ease-out" style={{ animationDelay: '400ms' }}>
                        <span className="dashboard-activity-description">Active Roles</span>
                        <span className="dashboard-activity-title">{analytics.activeRoles}</span>
                      </div>
                      <div className="flex items-center justify-between animate-in slide-in-from-left-4 duration-500 ease-out" style={{ animationDelay: '500ms' }}>
                        <span className="dashboard-activity-description">Inactive Roles</span>
                        <span className="dashboard-activity-title">{analytics.totalRoles - analytics.activeRoles}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Permission Categories */}
                <Card className="chart-container-luxury animate-in slide-in-from-right-4 duration-700 ease-out delay-200">
                  <CardHeader>
                    <CardTitle className="dashboard-card-title">Permission Categories</CardTitle>
                    <CardDescription className="dashboard-card-description">
                      Distribution of permissions across categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.permissionCategories).map(([category, count], index) => (
                        <div key={category} className="flex items-center justify-between animate-in slide-in-from-right-4 duration-500 ease-out" style={{ animationDelay: `${300 + index * 100}ms` }}>
                          <span className="dashboard-activity-title capitalize">{category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="dashboard-activity-description">{count}</span>
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(count / Math.max(...Object.values(analytics.permissionCategories))) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6 animate-in slide-in-from-bottom-4 duration-700 ease-out">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risk Assessment */}
                <Card className="chart-container-luxury animate-in slide-in-from-left-4 duration-700 ease-out delay-100">
                  <CardHeader>
                    <CardTitle className="dashboard-card-title">Risk Assessment</CardTitle>
                    <CardDescription className="dashboard-card-description">
                      High-risk roles and security concerns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200 animate-in slide-in-from-left-4 duration-500 ease-out" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="dashboard-activity-title text-red-700">High Risk Roles</span>
                        </div>
                        <span className="dashboard-activity-title text-red-700">{analytics.highRiskRoles}</span>
                      </div>
                      <div className="text-sm text-slate-600 animate-in slide-in-from-left-4 duration-500 ease-out" style={{ animationDelay: '300ms' }}>
                        Roles with excessive permissions or high user counts that may pose security risks.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Recommendations */}
                <Card className="chart-container-luxury animate-in slide-in-from-right-4 duration-700 ease-out delay-200">
                  <CardHeader>
                    <CardTitle className="dashboard-card-title">Security Recommendations</CardTitle>
                    <CardDescription className="dashboard-card-description">
                      Actions to improve security posture
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 animate-in slide-in-from-right-4 duration-500 ease-out" style={{ animationDelay: '300ms' }}>
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-slate-700">Review high-permission roles quarterly</span>
                      </div>
                      <div className="flex items-start space-x-2 animate-in slide-in-from-right-4 duration-500 ease-out" style={{ animationDelay: '400ms' }}>
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-slate-700">Implement role-based access control</span>
                      </div>
                      <div className="flex items-start space-x-2 animate-in slide-in-from-right-4 duration-500 ease-out" style={{ animationDelay: '500ms' }}>
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-slate-700">Enable audit logging for all changes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        <CreateRoleForm
          isOpen={isCreateRoleOpen}
          onClose={() => setIsCreateRoleOpen(false)}
          onSubmit={handleCreateRole}
          permissions={permissions}
        />

        {selectedRole && (
          <EditRoleForm
            isOpen={isEditRoleOpen}
            onClose={() => {
              setIsEditRoleOpen(false)
              setSelectedRole(null)
            }}
            onSubmit={handleEditRole}
            role={selectedRole}
            permissions={permissions}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteRoleOpen} onOpenChange={setIsDeleteRoleOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border-slate-200/50 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Delete Role
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Are you sure you want to delete "{selectedRole?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteRoleOpen(false)}
                className="btn-luxury-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRole}
                className="btn-luxury-primary"
              >
                Delete Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Actions Modal */}
        <Dialog open={isBulkActionsOpen} onOpenChange={setIsBulkActionsOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border-slate-200/50 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Bulk Actions
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Perform actions on {selectedRoles.length} selected roles
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              <Button
                variant="outline"
                onClick={() => handleBulkAction('activate')}
                className="btn-luxury-secondary"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate All
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('deactivate')}
                className="btn-luxury-secondary"
              >
                <UserX className="h-4 w-4 mr-2" />
                Deactivate All
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('export')}
                className="btn-luxury-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                className="btn-luxury-secondary text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBulkActionsOpen(false)}
                className="btn-luxury-secondary"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Audit Log Modal */}
        <Dialog open={isAuditLogOpen} onOpenChange={setIsAuditLogOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border-slate-200/50 rounded-3xl max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Audit Log
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Track all changes to roles and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-4">
              <div className="text-center py-8 text-slate-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Audit logging feature coming soon...</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsAuditLogOpen(false)}
                className="btn-luxury-primary"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permissions Matrix Modal */}
        <Dialog open={isPermissionsMatrixOpen} onOpenChange={setIsPermissionsMatrixOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border-slate-200/50 rounded-3xl max-w-6xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Permissions Matrix
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Visual representation of role permissions
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-4">
              <div className="text-center py-8 text-slate-500">
                <Key className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Permissions matrix view coming soon...</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsPermissionsMatrixOpen(false)}
                className="btn-luxury-primary"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Assignment Modal */}
        <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
          <DialogContent className="bg-white/95 backdrop-blur-xl border-slate-200/50 rounded-3xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                Assign Role to Users
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {selectedUsers.length > 0 
                  ? `Assign role to ${selectedUsers.length} selected user${selectedUsers.length > 1 ? 's' : ''}`
                  : 'Select a role to assign to users'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="dashboard-activity-title text-sm font-medium">
                  Select Role *
                </label>
                <Select 
                  value={selectedRoleForAssignment?.id || ''} 
                  onValueChange={(roleId) => {
                    const role = roles.find(r => r.id === roleId)
                    setSelectedRoleForAssignment(role || null)
                  }}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl hover:border-slate-300 transition-all duration-200">
                    <SelectValue placeholder="Choose a role to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.filter(role => role.isActive).map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span>{role.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {role.permissions.length} permissions
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Users Preview */}
              {selectedUsers.length > 0 && (
                <div className="space-y-3">
                  <label className="dashboard-activity-title text-sm font-medium">
                    Users to Assign Role ({selectedUsers.length})
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-2 bg-slate-50/50 rounded-xl p-3 border border-slate-200/50">
                    {selectedUsers.map(userId => {
                      const user = users.find(u => u.id === userId)
                      return user && user.name && user.email ? (
                        <div key={userId} className="flex items-center justify-between p-2 bg-white/80 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{user.name || 'Unknown User'}</p>
                              <p className="text-xs text-slate-500">{user.email || 'No Email'}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Individual User Assignment */}
              {selectedUserForAssignment && selectedUserForAssignment.name && selectedUserForAssignment.email && (
                <div className="space-y-3">
                  <label className="dashboard-activity-title text-sm font-medium">
                    Assign Role to Individual User
                  </label>
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {(selectedUserForAssignment.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{selectedUserForAssignment.name || 'Unknown User'}</p>
                        <p className="text-sm text-slate-500">{selectedUserForAssignment.email || 'No Email'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssignRoleOpen(false)
                  setSelectedUserForAssignment(null)
                  setSelectedRoleForAssignment(null)
                }}
                className="btn-luxury-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (selectedRoleForAssignment) {
                    if (selectedUsers.length > 0) {
                      // Filter out invalid users before bulk assignment
                      const validUserIds = selectedUsers.filter(userId => {
                        const user = users.find(u => u.id === userId)
                        return user && user.name && user.email
                      })
                      if (validUserIds.length > 0) {
                        await handleBulkAssignRole(validUserIds, selectedRoleForAssignment.id)
                      }
                    } else if (selectedUserForAssignment && selectedUserForAssignment.name && selectedUserForAssignment.email) {
                      await handleAssignRole(selectedUserForAssignment.id, selectedRoleForAssignment.id)
                    }
                    setIsAssignRoleOpen(false)
                    setSelectedUserForAssignment(null)
                    setSelectedRoleForAssignment(null)
                  }
                }}
                disabled={!selectedRoleForAssignment}
                className="btn-luxury-primary"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default RolesPermissions
