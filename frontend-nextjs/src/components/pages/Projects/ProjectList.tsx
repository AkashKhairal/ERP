'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  DollarSign,
  FolderOpen,
  Loader2,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import projectService, { type Project, type ProjectMember } from '@/services/projectService'
import { userService, type User } from '@/services/userService'

const ProjectList = () => {
  const router = useRouter()
  const { logActivity } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Dialog states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)

  // Form state
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    type: 'internal' as Project['type'],
    startDate: '',
    endDate: '',
    budget: 0,
    client: '',
    projectManager: '',
    team: [] as ProjectMember[],
    progress: 0
  })

  const [newMember, setNewMember] = useState({ user: '', role: '' })
  const [users, setUsers] = useState<User[]>([])

  const availableTypes = projectService.getAvailableTypes()
  const availableStatuses = projectService.getAvailableStatuses()
  const availablePriorities = projectService.getAvailablePriorities()
  const availableRoles = projectService.getAvailableRoles()

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await projectService.getProjects({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      })
      
      if (response.success) {
        setProjects(response.data || [])
      } else {
        setProjects(projectService.getSampleProjects())
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      setProjects(projectService.getSampleProjects())
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, priorityFilter, typeFilter])

  const loadUsers = useCallback(async () => {
    try {
      const response = await userService.getUsers()
      if (response.success) {
        setUsers(response.data || [])
      } else {
        setUsers(userService.getSampleUsers())
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers(userService.getSampleUsers())
    }
  }, [])

  useEffect(() => {
    loadProjects()
    loadUsers()
    logActivity('Projects List Visit', 'User accessed projects management')
  }, [loadProjects, loadUsers, logActivity])

  const handleCreateProject = async () => {
    // Enhanced validation
    const errors = []
    
    if (!projectForm.name?.trim()) {
      errors.push('Project name is required')
    }
    
    if (!projectForm.description?.trim()) {
      errors.push('Project description is required')
    }
    
    if (!projectForm.startDate) {
      errors.push('Start date is required')
    }
    
    if (!projectForm.endDate) {
      errors.push('End date is required')
    }
    
    if (projectForm.startDate && projectForm.endDate) {
      if (new Date(projectForm.startDate) >= new Date(projectForm.endDate)) {
        errors.push('End date must be after start date')
      }
    }
    
    if (!projectForm.projectManager) {
      errors.push('Project manager is required')
    }
    
    if (errors.length > 0) {
      alert(`Please fix the following errors:\n${errors.join('\n')}`)
      return
    }

    try {
      setLoading(true)
      
      // Prepare the data according to backend requirements
      const projectData = {
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
        type: projectForm.type,
        priority: projectForm.priority,
        status: projectForm.status,
        startDate: projectForm.startDate,
        endDate: projectForm.endDate,
        budget: projectForm.budget || 0,
        client: projectForm.client || 'Internal',
        projectManager: projectForm.projectManager,
        teamMembers: projectForm.team.map(member => ({
          user: member.user,
          role: member.role
        })),
        progress: projectForm.progress || 0
      } as any
      
      const response = await projectService.createProject(projectData)
      
      if (response.success) {
        setIsCreateDialogOpen(false)
        resetProjectForm()
        loadProjects()
        logActivity('Project Created', `Created project: ${projectForm.name}`)
      } else {
        alert(response.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProject = async () => {
    if (!selectedProject?._id) return

    try {
      setLoading(true)
      const response = await projectService.updateProject(selectedProject._id, projectForm)
      
      if (response.success) {
        setIsEditDialogOpen(false)
        resetProjectForm()
        loadProjects()
        logActivity('Project Updated', `Updated project: ${projectForm.name}`)
      } else {
        alert(response.error || 'Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Error updating project')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!selectedProject?._id) return

    try {
      setLoading(true)
      const response = await projectService.deleteProject(selectedProject._id)
      
      if (response.success) {
        setIsDeleteDialogOpen(false)
        setSelectedProject(null)
        loadProjects()
        logActivity('Project Deleted', `Deleted project: ${selectedProject.name}`)
      } else {
        alert(response.error || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project')
    } finally {
      setLoading(false)
    }
  }

  const handleEditProject = (project: Project) => {
    setProjectForm({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      type: project.type,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      client: project.client,
      projectManager: project.projectManager || '',
      team: project.teamMembers || project.team || [],
      progress: project.progress
    })
    setIsEditDialogOpen(true)
  }

  const handleViewProject = (project: Project) => {
    setSelectedProject(project)
    setIsViewDialogOpen(true)
  }

  const handleAddMember = () => {
    if (newMember.user && newMember.role) {
      const member: ProjectMember = {
        user: newMember.user,
        role: newMember.role,
        joinedDate: new Date().toISOString().split('T')[0],
        isActive: true
      }
      setProjectForm(prev => ({
        ...prev,
        team: [...prev.team, member]
      }))
      setNewMember({ user: '', role: '' })
      setIsAddMemberDialogOpen(false)
    }
  }

  const handleRemoveMember = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }))
  }

  const resetProjectForm = () => {
    setProjectForm({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      type: 'internal',
      startDate: '',
      endDate: '',
      budget: 0,
      client: '',
      projectManager: '',
      team: [],
      progress: 0
    })
    setSelectedProject(null)
  }

  const filteredProjects = Array.isArray(projects) ? projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
    const matchesType = typeFilter === 'all' || project.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  }) : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'on_hold': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return '📺'
      case 'saas': return '💻'
      case 'freelance': return '💼'
      case 'internal': return '🏢'
      default: return '📁'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track your projects
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Create a new project with all the necessary details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Input
                      id="client"
                      value={projectForm.client}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, client: e.target.value }))}
                      placeholder="Enter client name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Project Type</Label>
                    <Select value={projectForm.type} onValueChange={(value) => setProjectForm(prev => ({ ...prev, type: value as Project['type'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={projectForm.status} onValueChange={(value) => setProjectForm(prev => ({ ...prev, status: value as Project['status'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={projectForm.priority} onValueChange={(value) => setProjectForm(prev => ({ ...prev, priority: value as Project['priority'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePriorities.map(priority => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={projectForm.startDate}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={projectForm.endDate}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter budget amount"
                  />
                </div>

                <div>
                  <Label htmlFor="projectManager">Project Manager *</Label>
                  <Select value={projectForm.projectManager} onValueChange={(value) => setProjectForm(prev => ({ ...prev, projectManager: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user._id} value={user._id || ''}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {availableStatuses.map(status => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {availablePriorities.map(priority => (
              <SelectItem key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {availableTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(projects) ? projects.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              All projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(projects) ? projects.filter(project => project.status === 'active').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(projects) ? projects.filter(project => project.status === 'completed').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Array.isArray(projects) ? projects.reduce((sum, project) => sum + project.budget, 0) : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading projects...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getTypeIcon(project.type)}</span>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Budget</span>
                    <span className="font-medium">{formatCurrency(project.budget)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Team Size</span>
                    <span className="font-medium">
                      {(project.teamMembers || project.team || []).length} members
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>End Date</span>
                    <span className={`font-medium ${isOverdue(project.endDate) ? 'text-red-600' : ''}`}>
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProject(project)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredProjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* View Project Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details: {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              {selectedProject?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedProject.status)}>
                    {selectedProject.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityColor(selectedProject.priority)}>
                    {selectedProject.priority}
                  </Badge>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.type.charAt(0).toUpperCase() + selectedProject.type.slice(1)}
                  </p>
                </div>
                <div>
                  <Label>Client</Label>
                  <p className="text-sm text-muted-foreground">{selectedProject.client}</p>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedProject.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>End Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedProject.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Budget</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(selectedProject.budget)}
                  </p>
                </div>
                <div>
                  <Label>Progress</Label>
                  <p className="text-sm text-muted-foreground">{selectedProject.progress}%</p>
                </div>
              </div>
              
              <div>
                <Label>Team Members ({(selectedProject.teamMembers || selectedProject.team || []).length})</Label>
                <div className="mt-2 space-y-2">
                  {(selectedProject.teamMembers || selectedProject.team || []).map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{member.user}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant="outline">
                        Joined {new Date(member.joinedDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project: {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Update project information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Project Name</Label>
                <Input
                  id="edit-name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="edit-client">Client</Label>
                <Input
                  id="edit-client"
                  value={projectForm.client}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, client: e.target.value }))}
                  placeholder="Enter client name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={projectForm.description}
                onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-type">Project Type</Label>
                <Select value={projectForm.type} onValueChange={(value) => setProjectForm(prev => ({ ...prev, type: value as Project['type'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={projectForm.status} onValueChange={(value) => setProjectForm(prev => ({ ...prev, status: value as Project['status'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={projectForm.priority} onValueChange={(value) => setProjectForm(prev => ({ ...prev, priority: value as Project['priority'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePriorities.map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={projectForm.endDate}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-budget">Budget</Label>
              <Input
                id="edit-budget"
                type="number"
                value={projectForm.budget}
                onChange={(e) => setProjectForm(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter budget amount"
              />
            </div>

            <div>
              <Label htmlFor="edit-projectManager">Project Manager</Label>
              <Select value={projectForm.projectManager} onValueChange={(value) => setProjectForm(prev => ({ ...prev, projectManager: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project manager" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user._id} value={user._id || ''}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectList 