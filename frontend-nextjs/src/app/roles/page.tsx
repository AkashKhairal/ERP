'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePermissions } from '@/services/permissionService'
import PermissionGuard from '@/components/PermissionGuard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Plus, Edit, Trash2, Users, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import roleService from '@/services/roleService'
import RoleForm from '@/components/RoleForm'

interface Role {
  _id: string
  name: string
  description: string
  permissions: Array<{
    module: string
    actions: string[]
  }>
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

const RolesPage = () => {
  const { user } = useAuth()
  const { hasPermission, canPerformAction } = usePermissions()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showRoleForm, setShowRoleForm] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await roleService.getRoles()
      if (response.success) {
        setRoles(response.data)
      } else {
        toast.error('Failed to fetch roles')
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Error fetching roles')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!canPerformAction('roles', 'delete')) {
      toast.error('You do not have permission to delete roles. Please ask an admin for permissions.')
      return
    }

    try {
      const response = await roleService.deleteRole(roleId)
      if (response.success) {
        toast.success('Role deleted successfully')
        fetchRoles()
      } else {
        toast.error(response.message || 'Failed to delete role')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Error deleting role')
    }
  }

  const getPermissionBadges = (permissions: Array<{ module: string; actions: string[] }>) => {
    return permissions.map((permission, index) => (
      <div key={index} className="mb-2">
        <Badge variant="outline" className="mb-1">
          {permission.module}
        </Badge>
        <div className="flex flex-wrap gap-1 ml-2">
          {permission.actions.map((action, actionIndex) => (
            <Badge key={actionIndex} variant="secondary" className="text-xs">
              {action}
            </Badge>
          ))}
        </div>
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-2">Manage user roles and permissions across the system</p>
        </div>
        
        <PermissionGuard module="roles" action="create">
          <Button 
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => setShowRoleForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                {role.isDefault && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Default
                  </Badge>
                )}
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Permissions:</h4>
                  {getPermissionBadges(role.permissions)}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    Created: {new Date(role.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex space-x-2">
                    <PermissionGuard module="roles" action="update">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRole(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                    
                    <PermissionGuard module="roles" action="delete">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRole(role._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
          <p className="text-gray-600">Get started by creating your first role.</p>
        </div>
      )}

      {/* Permission Demo Section */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Permission System Demo</span>
            </CardTitle>
            <CardDescription>
              This section demonstrates how the permission system works for different actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Create Role Permission</h4>
                <PermissionGuard module="roles" action="create">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role (Allowed)
                  </Button>
                </PermissionGuard>
                
                <h4 className="font-medium">Update Role Permission</h4>
                <PermissionGuard module="roles" action="update">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Role (Allowed)
                  </Button>
                </PermissionGuard>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Delete Role Permission</h4>
                <PermissionGuard module="roles" action="delete">
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Role (Allowed)
                  </Button>
                </PermissionGuard>
                
                <h4 className="font-medium">Export Permission</h4>
                <PermissionGuard module="roles" action="export">
                  <Button variant="outline" className="w-full">
                    Export Roles (Allowed)
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Form Modal */}
      {showRoleForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <RoleForm
              role={selectedRole}
              onSave={(role) => {
                setShowRoleForm(false)
                setSelectedRole(null)
                fetchRoles()
                toast.success(selectedRole ? 'Role updated successfully' : 'Role created successfully')
              }}
              onCancel={() => {
                setShowRoleForm(false)
                setSelectedRole(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default RolesPage



