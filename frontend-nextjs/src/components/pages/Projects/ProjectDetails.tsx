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
          router.push('/app/projects')
        }
      }
    } catch (error) {
      console.error('Error loading project:', error)
      router.push('/app/projects')
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
        router.push('/app/projects')
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
        <Button onClick={() => router.push('/app/projects')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/app/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.client}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.progress}%</div>
            <Progress value={project.progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(project.budget)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members ({(project.teamMembers || project.team || []).length})</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsAddMemberDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(project.teamMembers || project.team || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No team members assigned</p>
            ) : (
              <div className="space-y-2">
                {(project.teamMembers || project.team || []).map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{member.user}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Joined {new Date(member.joinedDate).toLocaleDateString()}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(index)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project: {project.name}</DialogTitle>
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
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
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

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to the project team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-user">User Name</Label>
              <Input
                id="member-user"
                value={newMember.user}
                onChange={(e) => setNewMember(prev => ({ ...prev, user: e.target.value }))}
                placeholder="Enter user name"
              />
            </div>
            <div>
              <Label htmlFor="member-role">Role</Label>
              <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectDetails 