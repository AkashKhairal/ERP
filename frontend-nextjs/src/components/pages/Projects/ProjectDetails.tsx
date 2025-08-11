'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import projectService, { type Project, type ProjectMember } from '@/services/projectService'

interface ProjectDetailsProps {
  projectId: string
}

const ProjectDetails = ({ projectId }: ProjectDetailsProps) => {
  const router = useRouter()
  const { logActivity } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [newMember, setNewMember] = useState({ user: '', role: '' })

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

  const availableTypes = projectService.getAvailableTypes()
  const availableStatuses = projectService.getAvailableStatuses()
  const availablePriorities = projectService.getAvailablePriorities()
  const availableRoles = projectService.getAvailableRoles()

  useEffect(() => {
    loadProject()
    logActivity('Project Details Visit', `User accessed project details: ${projectId}`)
  }, [projectId, logActivity])

  const loadProject = async () => {
    try {
      setLoading(true)
      const response = await projectService.getProjectById(projectId)
      
      if (response.success) {
        setProject(response.data)
        setProjectForm({
          name: response.data.name,
          description: response.data.description,
          status: response.data.status,
          priority: response.data.priority,
          type: response.data.type,
          startDate: response.data.startDate,
          endDate: response.data.endDate,
          budget: response.data.budget,
          client: response.data.client,
          projectManager: response.data.projectManager || '',
          team: response.data.team,
          progress: response.data.progress
        })
      } else {
        // Fallback to sample data
        const sampleProjects = projectService.getSampleProjects()
        const sampleProject = sampleProjects.find(p => p._id === projectId)
        if (sampleProject) {
          setProject(sampleProject)
          setProjectForm({
            name: sampleProject.name,
            description: sampleProject.description,
            status: sampleProject.status,
            priority: sampleProject.priority,
            type: sampleProject.type,
            startDate: sampleProject.startDate,
            endDate: sampleProject.endDate,
            budget: sampleProject.budget,
            client: sampleProject.client,
            projectManager: sampleProject.projectManager || '',
            team: sampleProject.teamMembers || sampleProject.team || [],
            progress: sampleProject.progress
          })
        } else {
          router.push('/projects')
        }
      }
    } catch (error) {
      console.error('Error loading project:', error)
      router.push('/projects')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProject = async () => {
    if (!project?._id) return

    try {
      setLoading(true)
      const response = await projectService.updateProject(project._id, projectForm)
      
      if (response.success) {
        setIsEditDialogOpen(false)
        loadProject()
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
    if (!project?._id) return

    try {
      setLoading(true)
      const response = await projectService.deleteProject(project._id)
      
      if (response.success) {
        setIsDeleteDialogOpen(false)
        logActivity('Project Deleted', `Deleted project: ${project.name}`)
        router.push('/projects')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Project not found</h3>
        <p className="text-muted-foreground">
          The project you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push('/projects')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/projects')}
            className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="page-title text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1 font-medium tracking-tight">{project.client}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setIsEditDialogOpen(true)}
            className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="rounded-xl bg-white/60 backdrop-blur-sm text-red-600 px-4 py-2 hover:bg-red-50/80 transition-all duration-200 ease-out border border-red-200/50 shadow-sm font-medium tracking-tight"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">Status</CardTitle>
            <div className="p-2 rounded-full bg-blue-50 text-blue-500">
              <Target className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">Priority</CardTitle>
            <div className="p-2 rounded-full bg-orange-50 text-orange-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">Progress</CardTitle>
            <div className="p-2 rounded-full bg-green-50 text-green-500">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="metric-number text-4xl text-gray-900">{project.progress}%</div>
            <Progress value={project.progress} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">Budget</CardTitle>
            <div className="p-2 rounded-full bg-purple-50 text-purple-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="metric-number text-4xl text-gray-900">{formatCurrency(project.budget)}</div>
            <p className="text-sm text-purple-600 mt-1 font-medium tracking-tight">Project investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="card-title text-gray-900">Project Information</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div>
              <Label>Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {getTypeIcon(project.type)} {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                </p>
              </div>
              <div>
                <Label>Project Manager</Label>
                <p className="text-sm text-muted-foreground mt-1">{project.projectManager || 'Not assigned'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label>End Date</Label>
                <p className={`text-sm mt-1 ${isOverdue(project.endDate) ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {new Date(project.endDate).toLocaleDateString()}
                  {isOverdue(project.endDate) && ' (Overdue)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="card-title text-gray-900">Team Members ({(project.teamMembers || project.team || []).length})</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddMemberDialogOpen(true)}
                className="rounded-xl bg-blue-50/80 backdrop-blur-sm text-blue-600 px-4 py-2 hover:bg-blue-100/80 transition-all duration-200 ease-out border border-blue-200/50 shadow-sm font-medium tracking-tight"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(project.teamMembers || project.team || []).length === 0 ? (
              <p className="text-sm text-gray-500 font-medium tracking-tight">No team members assigned</p>
            ) : (
              <div className="space-y-3">
                {(project.teamMembers || project.team || []).map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                    <div>
                      <p className="font-semibold text-gray-900 tracking-tight">{member.user}</p>
                      <p className="text-sm text-gray-500 font-medium">{member.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Joined {new Date(member.joinedDate).toLocaleDateString()}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(index)}
                        className="rounded-xl bg-white/60 backdrop-blur-sm text-red-600 p-2 hover:bg-red-50/80 transition-all duration-200 ease-out border border-red-200/50 shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Edit Project: {project.name}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              Update project information and settings with precision
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
              <Label htmlFor="edit-progress">Progress (%)</Label>
              <Input
                id="edit-progress"
                type="number"
                min="0"
                max="100"
                value={projectForm.progress}
                onChange={(e) => setProjectForm(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                placeholder="Enter progress percentage"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProject} 
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
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
        <DialogContent className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Delete Project</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              Are you sure you want to delete "<span className="font-semibold text-red-600">{project.name}</span>"? This action cannot be undone and will permanently remove all project data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProject} 
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
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

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Add Team Member</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              Add a new member to the project team with precision
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="member-user" className="text-sm font-semibold text-gray-700 tracking-tight">User Name</Label>
              <Input
                id="member-user"
                value={newMember.user}
                onChange={(e) => setNewMember(prev => ({ ...prev, user: e.target.value }))}
                placeholder="Enter user name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="member-role" className="text-sm font-semibold text-gray-700 tracking-tight">Role</Label>
              <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAddMemberDialogOpen(false)}
              className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectDetails 