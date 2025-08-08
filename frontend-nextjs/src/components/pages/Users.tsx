'use client'

import React, { useState, useEffect } from 'react'
import { Users as UsersIcon, Plus, Search, Filter, Edit, Trash2, Eye, Mail, Phone, Calendar, Shield, Loader2, List, Grid, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { userService, type User } from '@/services/userService'
import { useAuth } from '@/context/AuthContext'

const Users = () => {
  const { user, isAuthenticated } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({})
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards')
  const [showEnlargedImage, setShowEnlargedImage] = useState(false)

  // Check if user has admin privileges
  const hasAdminPrivileges = () => {
    if (!user || !user.roles) return false
    return user.roles.some((role: any) => 
      role.name === 'Admin' || role.name === 'admin'
    )
  }

  // Load users on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadUsers()
    } else {
      setLoading(false)
      setError('Please log in to access this page')
    }
  }, [isAuthenticated])

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await userService.getUsers()
      if (response.success && response.data.length > 0) {
        setUsers(response.data)
      } else {
        // If no users in database and user has admin privileges, insert sample users
        if (hasAdminPrivileges()) {
          await insertSampleUsers()
        } else {
          setUsers([])
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Failed to load users. Please try again.')
      // Fallback to sample users for display only
      setUsers(userService.getSampleUsers())
    } finally {
      setLoading(false)
    }
  }

  const insertSampleUsers = async () => {
    const sampleUsers = userService.getSampleUsers()
    const insertedUsers: User[] = []
    
    for (const userData of sampleUsers) {
      try {
        const response = await userService.createUser({
          ...userData,
          password: 'Password123!' // Default password for sample users
        })
        if (response.success) {
          insertedUsers.push(response.data)
        }
      } catch (error) {
        console.error('Error inserting sample user:', error)
      }
    }
    
    if (insertedUsers.length > 0) {
      setUsers(insertedUsers)
    } else {
      // If insertion fails, use sample data for display
      setUsers(sampleUsers)
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.isActive : !user.isActive)
    const matchesRole = roleFilter === 'all' || user.roles?.some(role => role.name.toLowerCase() === roleFilter.toLowerCase())
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesRole
  })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleAddUser = () => {
    if (!hasAdminPrivileges()) {
      setError('You need admin privileges to create users')
      return
    }
    setSelectedUser(null)
    setFormData({})
    setShowAddEditModal(true)
  }

  const handleEditUser = (user: User) => {
    if (!hasAdminPrivileges()) {
      setError('You need admin privileges to edit users')
      return
    }
    setSelectedUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
      position: user.position,
      phone: user.phone,
      isActive: user.isActive
    })
    setShowAddEditModal(true)
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!hasAdminPrivileges()) {
      setError('You need admin privileges to delete users')
      return
    }
    
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await userService.deleteUser(userId)
        if (response.success) {
          setUsers(users.filter(user => user._id !== userId))
        } else {
          setError('Failed to delete user: ' + response.message)
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        setError('Failed to delete user')
      }
    }
  }

  const handleSaveUser = async () => {
    if (!hasAdminPrivileges()) {
      setError('You need admin privileges to save users')
      return
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      if (selectedUser) {
        // Update existing user
        const response = await userService.updateUser(selectedUser._id!, formData)
        if (response.success) {
          setUsers(users.map(user => 
            user._id === selectedUser._id ? { ...user, ...response.data } : user
          ))
          setShowAddEditModal(false)
          setSelectedUser(null)
        } else {
          setError('Failed to update user: ' + response.message)
        }
      } else {
        // Create new user
        const response = await userService.createUser({
          ...formData,
          password: 'Password123!' // Default password for new users
        })
        if (response.success) {
          setUsers([...users, response.data])
          setShowAddEditModal(false)
        } else {
          setError('Failed to create user: ' + response.message)
        }
      }
    } catch (error) {
      console.error('Error saving user:', error)
      setError('Failed to save user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'default' : 'destructive'
  }

  const getRoleColor = (roles?: Array<{ name: string }>) => {
    if (!roles || roles.length === 0) return 'secondary'
    const roleName = roles[0].name.toLowerCase()
    switch (roleName) {
      case 'admin': return 'destructive'
      case 'manager': return 'default'
      default: return 'secondary'
    }
  }

  const departments = ['engineering', 'content', 'marketing', 'finance', 'hr', 'operations']
  const roles = ['Admin', 'Manager', 'Employee', 'Intern']
  const statuses = ['active', 'inactive']

  const handleFormChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Render user card
  const renderUserCard = (user: User) => (
    <Card key={user._id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <UsersIcon className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
              <CardDescription className="mt-1">
                {user.position || 'No position specified'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(user.isActive || false)}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Role</span>
            </div>
            <Badge variant={getRoleColor(user.roles) as any}>
              {user.roles && user.roles.length > 0 ? user.roles[0].name : 'Employee'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Department</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {user.department.charAt(0).toUpperCase() + user.department.slice(1)}
            </span>
          </div>
          
          {user.phone && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <span className="text-sm text-muted-foreground">{user.phone}</span>
            </div>
          )}
          
          {user.hireDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Joined</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(user.hireDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewUser(user)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {hasAdminPrivileges() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditUser(user)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
          {hasAdminPrivileges() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteUser(user._id!)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to access the Users module</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
        </div>
        {hasAdminPrivileges() && (
          <Button onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
                  className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-md transition-colors"
                >
                  {viewMode === 'list' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  <span className="text-sm">
                    {viewMode === 'list' ? 'List' : 'Cards'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="department-filter">Department</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept.charAt(0).toUpperCase() + dept.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="role-filter">Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Content */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Department</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                              <UsersIcon className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            {user.position && (
                              <div className="text-sm text-gray-500">{user.position}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getRoleColor(user.roles) as any}>
                          {user.roles && user.roles.length > 0 ? user.roles[0].name : 'Employee'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.department.charAt(0).toUpperCase() + user.department.slice(1)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusColor(user.isActive || false)}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasAdminPrivileges() && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-8">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => renderUserCard(user))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit User Modal */}
      <Dialog open={showAddEditModal} onOpenChange={setShowAddEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {selectedUser ? 'Update user information' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => handleFormChange('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => handleFormChange('lastName', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="john.doe@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department || ''} onValueChange={(value) => handleFormChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept.charAt(0).toUpperCase() + dept.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.isActive?.toString() || 'true'} onValueChange={(value) => handleFormChange('isActive', value === 'true')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position || ''}
                onChange={(e) => handleFormChange('position', e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="sm:max-w-[1200px] max-h-[85vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold">User Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="flex flex-col h-full">
              {/* Header Section - Compact Horizontal Layout */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border mb-4">
                <div className="flex-shrink-0">
                  <div 
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => setShowEnlargedImage(true)}
                  >
                    {selectedUser.avatar ? (
                      <img 
                        src={selectedUser.avatar} 
                        alt="" 
                        className="w-16 h-16 rounded-full object-cover hover:opacity-90 transition-opacity" 
                      />
                    ) : (
                      <UsersIcon className="h-8 w-8 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedUser.position || 'No position specified'}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <Badge variant={getStatusColor(selectedUser.isActive || false)} className="text-xs">
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={getRoleColor(selectedUser.roles) as any} className="text-xs">
                          {selectedUser.roles && selectedUser.roles.length > 0 ? selectedUser.roles[0].name : 'Employee'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Employee ID</p>
                        <p className="font-mono text-xs text-gray-700">{selectedUser._id?.slice(-8) || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Compact Horizontal Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
                {/* Left Column - Contact & Work Info */}
                <div className="space-y-4">
                  {/* Contact Information */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span>Contact Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500">Email Address</p>
                          <p className="text-xs text-gray-900 truncate">{selectedUser.email}</p>
                        </div>
                      </div>
                      
                      {selectedUser.phone && (
                        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                          <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500">Phone Number</p>
                            <p className="text-xs text-gray-900">{selectedUser.phone}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Work Information */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Work Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <UsersIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500">Department</p>
                          <p className="text-xs text-gray-900">
                            {selectedUser.department.charAt(0).toUpperCase() + selectedUser.department.slice(1)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <Shield className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500">Role</p>
                          <p className="text-xs text-gray-900">
                            {selectedUser.roles && selectedUser.roles.length > 0 ? selectedUser.roles[0].name : 'Employee'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Middle Column - Timeline & Additional Info */}
                <div className="space-y-4">
                  {/* Timeline Information */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>Timeline</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      {selectedUser.hireDate && (
                        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                          <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500">Date Joined</p>
                            <p className="text-xs text-gray-900">
                              {new Date(selectedUser.hireDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedUser.lastLogin && (
                        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                          <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500">Last Login</p>
                            <p className="text-xs text-gray-900">
                              {new Date(selectedUser.lastLogin).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Additional Information */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <UsersIcon className="h-4 w-4 text-orange-500" />
                        <span>Additional Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <Shield className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500">Account Status</p>
                          <Badge variant={getStatusColor(selectedUser.isActive || false)} className="mt-1 text-xs">
                            {selectedUser.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <UsersIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500">User Type</p>
                          <p className="text-xs text-gray-900">
                            {selectedUser.roles && selectedUser.roles.length > 0 
                              ? selectedUser.roles[0].name === 'Admin' ? 'Administrator' 
                              : selectedUser.roles[0].name === 'Manager' ? 'Manager' 
                              : 'Employee'
                              : 'Employee'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Quick Actions */}
                <div className="space-y-4">
                  {/* Quick Actions */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <UsersIcon className="h-4 w-4 text-blue-500" />
                        <span>Quick Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-col space-y-2">
                        <Button variant="outline" size="sm" className="flex items-center space-x-2 justify-start h-8">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">Send Message</span>
                        </Button>
                        {hasAdminPrivileges() && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center space-x-2 justify-start h-8"
                              onClick={() => {
                                setShowUserModal(false)
                                handleEditUser(selectedUser)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                              <span className="text-xs">Edit Profile</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center space-x-2 justify-start h-8 text-red-600 hover:text-red-700"
                              onClick={() => {
                                setShowUserModal(false)
                                handleDeleteUser(selectedUser._id!)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="text-xs">Delete User</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Stats or Additional Info */}
                  <Card className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-sm">
                        <Shield className="h-4 w-4 text-indigo-500" />
                        <span>User Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-xs font-medium text-gray-600">Department</span>
                          <span className="text-xs text-gray-900">
                            {selectedUser.department.charAt(0).toUpperCase() + selectedUser.department.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-xs font-medium text-gray-600">Role</span>
                          <span className="text-xs text-gray-900">
                            {selectedUser.roles && selectedUser.roles.length > 0 ? selectedUser.roles[0].name : 'Employee'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-xs font-medium text-gray-600">Status</span>
                          <Badge variant={getStatusColor(selectedUser.isActive || false)} className="text-xs">
                            {selectedUser.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              Close
            </Button>
            {hasAdminPrivileges() && (
              <Button 
                onClick={() => {
                  setShowUserModal(false)
                  if (selectedUser) handleEditUser(selectedUser)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enlarged Image Modal */}
      {showEnlargedImage && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEnlargedImage(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowEnlargedImage(false)}
              className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-200 text-white hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Image Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }}
                />
              ) : (
                <div className="w-96 h-96 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in-95 duration-300">
                  <UsersIcon className="h-32 w-32 text-white" />
                </div>
              )}
            </div>
            
            {/* User Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg animate-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <p className="text-gray-600">
                {selectedUser.position || 'No position specified'}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={getStatusColor(selectedUser.isActive || false)}>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant={getRoleColor(selectedUser.roles) as any}>
                  {selectedUser.roles && selectedUser.roles.length > 0 ? selectedUser.roles[0].name : 'Employee'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users 