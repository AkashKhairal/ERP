'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Shield, Save, X, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import roleService from '@/services/roleService'
import { MODULES, getAvailableActions, getModuleDescriptions, getActionDescriptions } from '@/services/permissionService'

interface RoleFormProps {
  role?: any
  onSave: (role: any) => void
  onCancel: () => void
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || []
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    setFormData(prev => {
      const newPermissions = [...prev.permissions]
      const existingPermission = newPermissions.find(p => p.module === module)
      
      if (existingPermission) {
        if (checked) {
          if (!existingPermission.actions.includes(action)) {
            existingPermission.actions.push(action)
          }
        } else {
          existingPermission.actions = existingPermission.actions.filter(a => a !== action)
          // Remove module if no actions remain
          if (existingPermission.actions.length === 0) {
            newPermissions.splice(newPermissions.indexOf(existingPermission), 1)
          }
        }
      } else if (checked) {
        newPermissions.push({
          module,
          actions: [action]
        })
      }
      
      return {
        ...prev,
        permissions: newPermissions
      }
    })
  }

  const handleSelectAllModule = (module: string, checked: boolean) => {
    const actions = getAvailableActions()
    actions.forEach(action => {
      handlePermissionChange(module, action, checked)
    })
  }

  const handleSelectAllActions = (checked: boolean) => {
    const modules = Object.keys(MODULES)
    modules.forEach(module => {
      handleSelectAllModule(module, checked)
    })
  }

  const isModuleSelected = (module: string) => {
    return formData.permissions.some(p => p.module === module)
  }

  const isActionSelected = (module: string, action: string) => {
    const permission = formData.permissions.find(p => p.module === module)
    return permission ? permission.actions.includes(action) : false
  }

  const getModuleActionCount = (module: string) => {
    const permission = formData.permissions.find(p => p.module === module)
    return permission ? permission.actions.length : 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Role name is required')
      return
    }

    if (formData.permissions.length === 0) {
      toast.error('At least one permission is required')
      return
    }

    setLoading(true)
    try {
      let response
      if (role) {
        response = await roleService.updateRole(role._id, formData)
      } else {
        response = await roleService.createRole(formData)
      }

      if (response.success) {
        toast.success(role ? 'Role updated successfully' : 'Role created successfully')
        onSave(response.data)
      } else {
        toast.error(response.message || 'Failed to save role')
      }
    } catch (error) {
      console.error('Error saving role:', error)
      toast.error('Error saving role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-orange-600" />
          <span>{role ? 'Edit Role' : 'Create New Role'}</span>
        </CardTitle>
        <CardDescription>
          Define role permissions for different modules and actions
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., HR Manager, Tech Lead"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the role's purpose and responsibilities"
                rows={2}
              />
            </div>
          </div>

          {/* Global Actions */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Global Actions</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAllActions(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAllActions(false)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {getAvailableActions().map(action => (
                <div key={action} className="flex items-center space-x-2">
                  <Checkbox
                    id={`global-${action}`}
                    checked={Object.keys(MODULES).every(module => 
                      isActionSelected(module, action)
                    )}
                    onCheckedChange={(checked) => 
                      handleSelectAllActions(checked as boolean)
                    }
                  />
                  <Label htmlFor={`global-${action}`} className="text-sm">
                    {getActionDescriptions()[action]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Module Permissions */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Module Permissions</Label>
            
            {Object.entries(MODULES).map(([moduleKey, module]) => (
              <div key={moduleKey} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`module-${moduleKey}`}
                      checked={isModuleSelected(moduleKey)}
                      onCheckedChange={(checked) => 
                        handleSelectAllModule(moduleKey, checked as boolean)
                      }
                    />
                    <Label htmlFor={`module-${moduleKey}`} className="font-medium">
                      {module.name}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {getModuleActionCount(moduleKey)} actions
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {getModuleDescriptions()[moduleKey]}
                  </div>
                </div>
                
                {isModuleSelected(moduleKey) && (
                  <div className="ml-6 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {getAvailableActions().map(action => (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${moduleKey}-${action}`}
                          checked={isActionSelected(moduleKey, action)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(moduleKey, action, checked as boolean)
                          }
                        />
                        <Label htmlFor={`${moduleKey}-${action}`} className="text-sm">
                          {getActionDescriptions()[action]}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (role ? 'Update Role' : 'Create Role')}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}

export default RoleForm
