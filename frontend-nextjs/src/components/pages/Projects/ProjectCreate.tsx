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
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-1 font-medium tracking-tight">
            Set up a new project with luxury precision and attention to detail
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="flex items-center card-title text-gray-900">
              <div className="p-2 rounded-full bg-blue-50 text-blue-500 mr-3">
                <Building className="h-5 w-5" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
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
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="flex items-center card-title text-gray-900">
              <div className="p-2 rounded-full bg-green-50 text-green-500 mr-3">
                <Calendar className="h-5 w-5" />
              </div>
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
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
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="flex items-center card-title text-gray-900">
              <div className="p-2 rounded-full bg-orange-50 text-orange-500 mr-3">
                <DollarSign className="h-5 w-5" />
              </div>
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center card-title text-gray-900">
                <div className="p-2 rounded-full bg-purple-50 text-purple-500 mr-3">
                  <Users className="h-5 w-5" />
                </div>
                Team Members
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddMemberDialog(true)}
                className="rounded-xl bg-blue-50/80 backdrop-blur-sm text-blue-600 px-4 py-2 hover:bg-blue-100/80 transition-all duration-200 ease-out border border-blue-200/50 shadow-sm font-medium tracking-tight"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {projectForm.team.length === 0 ? (
              <p className="text-gray-500 font-medium tracking-tight">No team members added yet.</p>
            ) : (
              <div className="space-y-3">
                {projectForm.team.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                    <div>
                      <p className="font-semibold text-gray-900 tracking-tight">{member.user}</p>
                      <p className="text-sm text-gray-500 font-medium">{member.role}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(index)}
                      className="rounded-xl bg-white/60 backdrop-blur-sm text-red-600 p-2 hover:bg-red-50/80 transition-all duration-200 ease-out border border-red-200/50 shadow-sm"
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
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
          >
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
        <DialogContent className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Add Team Member</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              Add a new member to the project team with precision
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="member-name" className="text-sm font-semibold text-gray-700 tracking-tight">Member Name</Label>
              <Input
                id="member-name"
                value={newMember.user}
                onChange={(e) => setNewMember(prev => ({ ...prev, user: e.target.value }))}
                placeholder="Enter member name"
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
              onClick={() => setShowAddMemberDialog(false)}
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

export default ProjectCreate 