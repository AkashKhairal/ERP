'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  Users, 
  Activity, 
  Download,
  Search,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import roleService, { type Role, type Permission } from '@/services/roleService'
import auditService, { type AuditLog, type AuditStats } from '@/services/auditService'

const RolesPermissions = () => {
  const [activeTab, setActiveTab] = useState('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditStats, setAuditStats] = useState<AuditStats>({
    totalLogs: 0,
    successfulActions: 0,
    failedActions: 0,
    topActions: [],
    topResources: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [auditFilters, setAuditFilters] = useState({
    action: '',
    resource: '',
    success: '',
    startDate: '',
    endDate: ''
  })

  // Form state for role creation/editing
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, string[]>,
    isDefault: false
  })

  const modules = roleService.getAvailableModules()
  const actions = roleService.getAvailableActions()
  const moduleDescriptions = roleService.getModuleDescriptions()
  const actionDescriptions = roleService.getActionDescriptions()

  useEffect(() => {
    loadRoles()
    loadAuditLogs()
    loadAuditStats()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const response = await roleService.getRoles({ search: searchTerm })
      if (response.success) {
        setRoles(response.data)
      } else {
        // Use sample data if API fails
        setRoles(getSampleRoles())
      }
    } catch (error) {
      console.error('Error loading roles:', error)
      setRoles(getSampleRoles())
    } finally {
      setLoading(false)
    }
  }

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await auditService.getAuditLogs(auditFilters)
      if (response.success) {
        setAuditLogs(response.data)
      } else {
        setAuditLogs(getSampleAuditLogs())
      }
    } catch (error) {
      console.error('Error loading audit logs:', error)
      setAuditLogs(getSampleAuditLogs())
    } finally {
      setLoading(false)
    }
  }

  const loadAuditStats = async () => {
    try {
      const response = await auditService.getAuditStats()
      if (response.success) {
        setAuditStats(response.data)
      } else {
        setAuditStats(getSampleAuditStats())
      }
    } catch (error) {
      console.error('Error loading audit stats:', error)
      setAuditStats(getSampleAuditStats())
    }
  }

  const handleCreateRole = async () => {
    try {
      setLoading(true)
      const response = await roleService.createRole(roleForm)
      if (response.success) {
        setIsCreateDialogOpen(false)
        resetRoleForm()
        loadRoles()
      } else {
        console.error('Failed to create role')
      }
    } catch (error) {
      console.error('Error creating role:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole?._id) return
    
    try {
      setLoading(true)
      const response = await roleService.updateRole(selectedRole._id, roleForm)
      if (response.success) {
        setIsEditDialogOpen(false)
        resetRoleForm()
        loadRoles()
      } else {
        console.error('Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      const response = await roleService.deleteRole(roleId)
      if (response.success) {
        loadRoles()
      } else {
        console.error('Failed to delete role')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions.reduce((acc, permission) => {
        acc[permission.module] = permission.actions
        return acc
      }, {} as Record<string, string[]>),
      isDefault: role.isDefault || false
    })
    setIsEditDialogOpen(true)
  }

  const handleViewRole = (role: Role) => {
    setSelectedRole(role)
    setIsViewDialogOpen(true)
  }

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      permissions: {},
      isDefault: false
    })
    setSelectedRole(null)
  }

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: checked 
          ? [...(prev.permissions[module] || []), action]
          : (prev.permissions[module] || []).filter(a => a !== action)
      }
    }))
  }

  const handleExportAuditLogs = async () => {
    try {
      const blob = await auditService.exportAuditLogs(auditFilters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'audit-logs.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting audit logs:', error)
    }
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sample data functions
  const getSampleRoles = (): Role[] => [
    {
      _id: '1',
      name: 'Admin',
      description: 'Full system access with all permissions',
      permissions: [
        { module: 'users', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'teams', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'projects', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] }
      ],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      _id: '2',
      name: 'Manager',
      description: 'Team and project management with limited admin access',
      permissions: [
        { module: 'users', actions: ['read', 'update'] },
        { module: 'teams', actions: ['create', 'read', 'update'] },
        { module: 'projects', actions: ['create', 'read', 'update', 'approve'] }
      ],
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      _id: '3',
      name: 'Employee',
      description: 'Basic user access with limited permissions',
      permissions: [
        { module: 'users', actions: ['read'] },
        { module: 'teams', actions: ['read'] },
        { module: 'projects', actions: ['read', 'update'] }
      ],
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]

  const getSampleAuditLogs = (): AuditLog[] => [
    {
      _id: '1',
      userId: 'user1',
      action: 'login',
      resource: 'user',
      details: 'User logged in successfully',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      success: true,
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      _id: '2',
      userId: 'user2',
      action: 'role_created',
      resource: 'role',
      details: 'New role "Editor" created',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0...',
      success: true,
      timestamp: '2024-01-15T09:15:00Z'
    }
  ]

  const getSampleAuditStats = (): AuditStats => ({
    totalLogs: 1250,
    successfulActions: 1180,
    failedActions: 70,
    topActions: [
      { action: 'login', count: 450 },
      { action: 'read', count: 320 },
      { action: 'update', count: 180 }
    ],
    topResources: [
      { resource: 'user', count: 600 },
      { resource: 'project', count: 400 },
      { resource: 'team', count: 250 }
    ],
    recentActivity: getSampleAuditLogs()
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and view audit logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              loadRoles()
              loadAuditLogs()
              loadAuditStats()
            }}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Permissions Matrix
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Roles Management</CardTitle>
                  <CardDescription>
                    Create, edit, and manage user roles and their permissions
                  </CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>
                        Define a new role with specific permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                          id="name"
                          value={roleForm.name}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter role name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={roleForm.description}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter role description"
                        />
                      </div>
                      <div>
                        <Label>Permissions</Label>
                        <div className="border rounded-lg p-4 space-y-4">
                          {modules.map(module => (
                            <div key={module} className="space-y-2">
                              <div className="font-medium text-sm">
                                {module.charAt(0).toUpperCase() + module.slice(1)}
                                <span className="text-muted-foreground ml-2 text-xs">
                                  {moduleDescriptions[module]}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {actions.map(action => (
                                  <div key={action} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${module}-${action}`}
                                      checked={(roleForm.permissions[module] || []).includes(action)}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(module, action, checked as boolean)
                                      }
                                    />
                                    <Label 
                                      htmlFor={`${module}-${action}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      {action.charAt(0).toUpperCase() + action.slice(1)}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRole} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Role'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-2 text-gray-600">Loading roles...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role._id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {permission.module}: {permission.actions.length} actions
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {role.isDefault ? (
                            <Badge variant="default">Default</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRole(role)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRole(role._id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permissions Matrix</CardTitle>
              <CardDescription>
                Overview of all roles and their permissions across modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      {modules.map(module => (
                        <TableHead key={module} className="text-center">
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role._id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        {modules.map(module => {
                          const permission = role.permissions.find(p => p.module === module)
                          const actionCount = permission ? permission.actions.length : 0
                          return (
                            <TableCell key={module} className="text-center">
                              {actionCount > 0 ? (
                                <Badge variant="secondary">
                                  {actionCount} actions
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>
                    Track system activities and user actions
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleExportAuditLogs}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{auditStats.totalLogs}</div>
                    <p className="text-sm text-muted-foreground">Total Logs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{auditStats.successfulActions}</div>
                    <p className="text-sm text-muted-foreground">Successful</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{auditStats.failedActions}</div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{auditStats.recentActivity.length}</div>
                    <p className="text-sm text-muted-foreground">Recent Activity</p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Role Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Role Details: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              {selectedRole?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <Label>Permissions</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  {modules.map(module => {
                    const permission = selectedRole.permissions.find(p => p.module === module)
                    return (
                      <div key={module} className="space-y-2">
                        <div className="font-medium text-sm">
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                          <span className="text-muted-foreground ml-2 text-xs">
                            {moduleDescriptions[module]}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {permission ? (
                            permission.actions.map(action => (
                              <Badge key={action} variant="secondary" className="text-xs">
                                {action.charAt(0).toUpperCase() + action.slice(1)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No permissions</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
            <DialogDescription>
              Modify role permissions and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Role Name</Label>
              <Input
                id="edit-name"
                value={roleForm.name}
                onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={roleForm.description}
                onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="border rounded-lg p-4 space-y-4">
                {modules.map(module => (
                  <div key={module} className="space-y-2">
                    <div className="font-medium text-sm">
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                      <span className="text-muted-foreground ml-2 text-xs">
                        {moduleDescriptions[module]}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {actions.map(action => (
                        <div key={action} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${module}-${action}`}
                            checked={(roleForm.permissions[module] || []).includes(action)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module, action, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`edit-${module}-${action}`}
                            className="text-sm cursor-pointer"
                          >
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RolesPermissions 