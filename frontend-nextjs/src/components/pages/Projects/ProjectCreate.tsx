'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Loader2, 
  X,
  Users,
  Calendar,
  DollarSign,
  Building,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import projectService, { type Project, type ProjectMember } from '@/services/projectService'

const ProjectCreate = () => {
  const router = useRouter()
  const { logActivity } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
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

  const handleInputChange = (field: string, value: string | number) => {
    setProjectForm(prev => ({
      ...prev,
      [field]: value
    }))
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
      setShowAddMemberDialog(false)
    }
  }

  const handleRemoveMember = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectForm.name || !projectForm.description || !projectForm.startDate || !projectForm.endDate) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const response = await projectService.createProject(projectForm)
      
      if (response.success) {
        logActivity('Project Created', `Created project: ${projectForm.name}`)
        router.push('/projects')
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

  const handleCancel = () => {
    router.push('/projects')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">
            Set up a new project with all the necessary details
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={projectForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  value={projectForm.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={projectForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter project description"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Project Type</Label>
                <Select value={projectForm.type} onValueChange={(value) => handleInputChange('type', value)}>
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
                <Select value={projectForm.status} onValueChange={(value) => handleInputChange('status', value)}>
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
                <Select value={projectForm.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={projectForm.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="budget">Project Budget</Label>
              <Input
                id="budget"
                type="number"
                value={projectForm.budget}
                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                placeholder="Enter budget amount"
              />
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Members
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddMemberDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projectForm.team.length === 0 ? (
              <p className="text-muted-foreground">No team members added yet.</p>
            ) : (
              <div className="space-y-2">
                {projectForm.team.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{member.user}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to the project team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-name">Member Name</Label>
              <Input
                id="member-name"
                value={newMember.user}
                onChange={(e) => setNewMember(prev => ({ ...prev, user: e.target.value }))}
                placeholder="Enter member name"
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
            <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
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

export default ProjectCreate 