'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Key, 
  Users, 
  Settings, 
  Target, 
  FileText, 
  CreditCard, 
  Zap, 
  Activity,
  BarChart3,
  Plus,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Palette,
  Star,
  UserCheck
} from 'lucide-react'
import { Permission, Role } from '@/services/rolesService'

interface CreateRoleFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (roleData: Partial<Role>) => void
  permissions: Permission[]
}

const CreateRoleForm: React.FC<CreateRoleFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  permissions 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 5,
    color: 'gray',
    isActive: true
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        priority: 5,
        color: 'gray',
        isActive: true
      })
      setSelectedPermissions([])
      setErrors({})
    }
  }, [isOpen])

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Role name must be at least 3 characters'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Role name must be less than 50 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Role description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Role description must be at least 10 characters'
    } else if (formData.description.length > 500) {
      newErrors.description = 'Role description must be less than 500 characters'
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const roleData: Partial<Role> = {
        ...formData,
        permissions: permissions.filter(p => selectedPermissions.includes(p.id)),
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSystem: false
      }
      
      await onSubmit(roleData)
      onClose()
    } catch (error) {
      console.error('Error creating role:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
    
    // Clear permission error when user selects permissions
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }))
    }
  }

  const handleCategoryToggle = (category: string, isGranted: boolean) => {
    const categoryPermissions = permissions.filter(p => p.category === category)
    const categoryIds = categoryPermissions.map(p => p.id)
    
    if (isGranted) {
      setSelectedPermissions(prev => [...prev, ...categoryIds].filter((id, index, arr) => arr.indexOf(id) === index))
    } else {
      setSelectedPermissions(prev => prev.filter(id => !categoryIds.includes(id)))
    }
    
    // Clear permission error when user selects permissions
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }))
    }
  }

  const getPermissionCountByCategory = (category: string) => {
    return permissions.filter(p => p.category === category).length
  }

  const getSelectedCountByCategory = (category: string) => {
    const categoryPermissions = permissions.filter(p => p.category === category)
    return selectedPermissions.filter(id => categoryPermissions.some(p => p.id === id)).length
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dashboard': return <BarChart3 className="h-4 w-4 text-blue-600" />
      case 'users': return <Users className="h-4 w-4 text-green-600" />
      case 'roles': return <Shield className="h-4 w-4 text-purple-600" />
      case 'settings': return <Settings className="h-4 w-4 text-orange-600" />
      case 'finance': return <CreditCard className="h-4 w-4 text-emerald-600" />
      case 'projects': return <Target className="h-4 w-4 text-indigo-600" />
      case 'content': return <FileText className="h-4 w-4 text-pink-600" />
      case 'analytics': return <Activity className="h-4 w-4 text-cyan-600" />
      case 'integrations': return <Zap className="h-4 w-4 text-yellow-600" />
      default: return <Key className="h-4 w-4 text-slate-600" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white/95 backdrop-blur-xl border-slate-200/50 rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500 ease-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="dashboard-card-title text-2xl flex items-center">
              <Shield className="h-6 w-6 mr-3 text-blue-600" />
              Create New Role
            </h2>
            <p className="dashboard-card-description">
              Define a new role with specific permissions and access levels
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 transition-all duration-200 hover:scale-110"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-full">
          {/* Left Side - Form Fields */}
          <div className="lg:w-1/2 p-6 space-y-6 border-r border-slate-200/50">
            <div className="space-y-6">
              {/* Role Name */}
              <div className="space-y-2">
                <label className="dashboard-activity-title text-sm font-medium flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-600" />
                  Role Name *
                </label>
                <Input
                  placeholder="Enter role name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                  }}
                  className={`bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                    errors.name ? 'border-red-300 focus:ring-red-500/20' : 'hover:border-slate-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm flex items-center animate-in slide-in-from-top-2 duration-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="dashboard-activity-title text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-green-600" />
                  Description *
                </label>
                <Textarea
                  placeholder="Describe the role's purpose and responsibilities"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }))
                  }}
                  rows={4}
                  className={`bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none ${
                    errors.description ? 'border-red-300 focus:ring-red-500/20' : 'hover:border-slate-300'
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm flex items-center animate-in slide-in-from-top-2 duration-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Priority and Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="dashboard-activity-title text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-600" />
                    Priority Level
                  </label>
                  <Select 
                    value={formData.priority.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
                  >
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl hover:border-slate-300 transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">High Priority (1)</SelectItem>
                      <SelectItem value="5">Medium Priority (5)</SelectItem>
                      <SelectItem value="10">Low Priority (10)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="dashboard-activity-title text-sm font-medium flex items-center">
                    <Palette className="h-4 w-4 mr-2 text-purple-600" />
                    Color Theme
                  </label>
                  <Select 
                    value={formData.color} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200/50 rounded-xl hover:border-slate-300 transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gray">Gray</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="dashboard-activity-title text-sm font-medium flex items-center">
                  <UserCheck className="h-4 w-4 mr-2 text-emerald-600" />
                  Status
                </label>
                <div className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-xl border border-slate-200/50">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                    className="rounded transition-all duration-200 hover:scale-110"
                  />
                  <label htmlFor="isActive" className="dashboard-activity-description text-sm cursor-pointer">
                    Active Role
                  </label>
                  <Badge variant={formData.isActive ? "default" : "secondary"} className="ml-auto">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Permissions */}
          <div className="lg:w-1/2 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="dashboard-activity-title text-sm font-medium flex items-center">
                <Key className="h-4 w-4 mr-2 text-purple-600" />
                Permissions *
              </label>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                {selectedPermissions.length} of {permissions.length} selected
              </Badge>
            </div>
            
            {errors.permissions && (
              <p className="text-red-500 text-sm flex items-center animate-in slide-in-from-top-2 duration-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {errors.permissions}
              </p>
            )}

            <div className="bg-slate-50/50 rounded-2xl p-4 space-y-4 max-h-[60vh] overflow-y-auto border border-slate-200/50">
              {Array.from(new Set(permissions.map(p => p.category))).map(category => (
                <div key={category} className="space-y-3 animate-in slide-in-from-right-4 duration-300 ease-out">
                  <div className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="icon-container-luxury p-2">
                        {getCategoryIcon(category)}
                      </div>
                      <div>
                        <h4 className="dashboard-card-title capitalize">{category}</h4>
                        <p className="dashboard-activity-description text-xs">
                          {getSelectedCountByCategory(category)} of {getPermissionCountByCategory(category)} permissions
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={permissions
                        .filter(p => p.category === category)
                        .every(p => selectedPermissions.includes(p.id))
                      }
                      onCheckedChange={(checked) => handleCategoryToggle(category, !!checked)}
                      className="rounded transition-all duration-200 hover:scale-110"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 pl-4">
                    {permissions
                      .filter(p => p.category === category)
                      .map(permission => (
                        <div key={permission.id} className="flex items-center space-x-3 p-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-all duration-200">
                          <Checkbox
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                            className="rounded transition-all duration-200 hover:scale-110"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="dashboard-activity-title text-sm truncate">{permission.name}</p>
                            <p className="dashboard-activity-description text-xs line-clamp-2">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 btn-luxury-secondary transition-all duration-200 hover:scale-105"
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 btn-luxury-primary transition-all duration-200 hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Role...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Role
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateRoleForm

