'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Plus, 
  Users, 
  Target, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  BarChart3,
  Eye,
  Loader2,
  X,
  UserPlus,
  Search
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChartComponent, BarChartComponent } from '@/components/ui/charts'
import { useAuth } from '@/context/AuthContext'
import sprintService, { type Sprint, type SprintTask, type SprintMember, type SprintStats } from '@/services/sprintService'

const SprintPlanning = () => {
  const { logActivity } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [sprintStats, setSprintStats] = useState<SprintStats>({
    totalSprints: 0,
    activeSprints: 0,
    completedSprints: 0,
    averageVelocity: 0,
    totalStoryPoints: 0,
    completedStoryPoints: 0,
    sprintCompletionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Dialog states
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)

  // Form states
  const [sprintForm, setSprintForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning' as Sprint['status'],
    team: [] as SprintMember[],
    tasks: [] as SprintTask[]
  })

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as SprintTask['status'],
    priority: 'medium' as SprintTask['priority'],
    storyPoints: 0,
    assignee: '',
    estimatedHours: 0
  })

  const [newMember, setNewMember] = useState({
    user: '',
    role: '',
    capacity: 40
  })

  const availableStatuses = sprintService.getAvailableStatuses()
  const availableTaskStatuses = sprintService.getAvailableTaskStatuses()
  const availableTaskPriorities = sprintService.getAvailableTaskPriorities()
  const availableRoles = sprintService.getAvailableRoles()

  useEffect(() => {
    loadSprints()
    loadSprintStats()
    logActivity('Sprint Planning Visit', 'User accessed sprint planning')
  }, [logActivity])

  const loadSprints = async () => {
    try {
      setLoading(true)
      const response = await sprintService.getSprints({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      })
      
      if (response.success) {
        setSprints(response.data)
      } else {
        setSprints(sprintService.getSampleSprints())
      }
    } catch (error) {
      console.error('Error loading sprints:', error)
      setSprints(sprintService.getSampleSprints())
    } finally {
      setLoading(false)
    }
  }

  const loadSprintStats = async () => {
    try {
      const response = await sprintService.getSprintStats()
      if (response.success) {
        setSprintStats(response.data)
      } else {
        setSprintStats(sprintService.getSampleSprintStats())
      }
    } catch (error) {
      console.error('Error loading sprint stats:', error)
      setSprintStats(sprintService.getSampleSprintStats())
    }
  }

  const handleCreateSprint = async () => {
    if (!sprintForm.name || !sprintForm.description || !sprintForm.startDate || !sprintForm.endDate) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      // Calculate total story points from tasks
      const totalStoryPoints = sprintForm.tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)
      const completedStoryPoints = sprintForm.tasks.reduce((sum, task) => sum + (task.status === 'done' ? (task.storyPoints || 0) : 0), 0)
      
      const sprintData = {
        name: sprintForm.name,
        description: sprintForm.description,
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
        status: sprintForm.status,
        team: sprintForm.team,
        tasks: sprintForm.tasks,
        totalStoryPoints,
        completedStoryPoints,
        velocity: completedStoryPoints,
        burndownData: []
      }

      const response = await sprintService.createSprint(sprintData)
      
      if (response.success) {
        setIsCreateDialogOpen(false)
        resetSprintForm()
        loadSprints()
        loadSprintStats()
        logActivity('Sprint Created', `Created sprint: ${sprintForm.name}`)
      } else {
        alert(response.error || 'Failed to create sprint')
      }
    } catch (error) {
      console.error('Error creating sprint:', error)
      alert('Error creating sprint')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSprint = async () => {
    if (!selectedSprint?._id) return

    try {
      setLoading(true)
      
      // Calculate total story points from tasks
      const totalStoryPoints = sprintForm.tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)
      const completedStoryPoints = sprintForm.tasks.reduce((sum, task) => sum + (task.status === 'done' ? (task.storyPoints || 0) : 0), 0)
      
      const sprintData = {
        name: sprintForm.name,
        description: sprintForm.description,
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
        status: sprintForm.status,
        team: sprintForm.team,
        tasks: sprintForm.tasks,
        totalStoryPoints,
        completedStoryPoints,
        velocity: completedStoryPoints,
        burndownData: selectedSprint.burndownData || []
      }

      const response = await sprintService.updateSprint(selectedSprint._id, sprintData)
      
      if (response.success) {
        setIsEditDialogOpen(false)
        resetSprintForm()
        loadSprints()
        loadSprintStats()
        logActivity('Sprint Updated', `Updated sprint: ${sprintForm.name}`)
      } else {
        alert(response.error || 'Failed to update sprint')
      }
    } catch (error) {
      console.error('Error updating sprint:', error)
      alert('Error updating sprint')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSprint = async () => {
    if (!selectedSprint?._id) return

    try {
      setLoading(true)
      const response = await sprintService.deleteSprint(selectedSprint._id)
      
      if (response.success) {
        setIsDeleteDialogOpen(false)
        setSelectedSprint(null)
        loadSprints()
        loadSprintStats()
        logActivity('Sprint Deleted', `Deleted sprint: ${selectedSprint.name}`)
      } else {
        alert(response.error || 'Failed to delete sprint')
      }
    } catch (error) {
      console.error('Error deleting sprint:', error)
      alert('Error deleting sprint')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint)
    setSprintForm({
      name: sprint.name,
      description: sprint.description,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      status: sprint.status,
      team: sprint.team,
      tasks: sprint.tasks
    })
    setIsEditDialogOpen(true)
  }

  const handleViewSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint)
    setIsViewDialogOpen(true)
  }

  const handleAddTask = () => {
    if (!newTask.title || !newTask.description) {
      alert('Please fill in all required fields')
      return
    }

    const task: SprintTask = {
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      storyPoints: newTask.storyPoints,
      assignee: newTask.assignee,
      estimatedHours: newTask.estimatedHours,
      actualHours: 0
    }

    setSprintForm(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }))
    setNewTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      storyPoints: 0,
      assignee: '',
      estimatedHours: 0
    })
    setIsAddTaskDialogOpen(false)
  }

  const handleAddMember = () => {
    if (!newMember.user || !newMember.role) {
      alert('Please fill in all required fields')
      return
    }

    const member: SprintMember = {
      user: newMember.user,
      role: newMember.role,
      capacity: newMember.capacity,
      isActive: true
    }

    setSprintForm(prev => ({
      ...prev,
      team: [...prev.team, member]
    }))
    setNewMember({
      user: '',
      role: '',
      capacity: 40
    })
    setIsAddMemberDialogOpen(false)
  }

  const handleRemoveTask = (index: number) => {
    setSprintForm(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }))
  }

  const handleRemoveMember = (index: number) => {
    setSprintForm(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }))
  }

  const resetSprintForm = () => {
    setSprintForm({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'planning',
      team: [],
      tasks: []
    })
    setSelectedSprint(null)
  }

  const filteredSprints = sprints.filter(sprint => {
    const matchesSearch = sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sprint.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50/80 text-green-700 border border-green-200/50'
      case 'active': return 'bg-blue-50/80 text-blue-700 border border-blue-200/50'
      case 'planning': return 'bg-yellow-50/80 text-yellow-700 border border-yellow-200/50'
      case 'cancelled': return 'bg-red-50/80 text-red-700 border border-red-200/50'
      default: return 'bg-gray-50/80 text-gray-700 border border-gray-200/50'
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-50/80 text-green-700 border border-green-200/50'
      case 'in_progress': return 'bg-blue-50/80 text-blue-700 border border-blue-200/50'
      case 'todo': return 'bg-yellow-50/80 text-yellow-700 border border-yellow-200/50'
      case 'blocked': return 'bg-red-50/80 text-red-700 border border-red-200/50'
      default: return 'bg-gray-50/80 text-gray-700 border border-gray-200/50'
    }
  }

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50/80 text-red-700 border border-red-200/50'
      case 'high': return 'bg-orange-50/80 text-orange-700 border border-orange-200/50'
      case 'medium': return 'bg-yellow-50/80 text-yellow-700 border border-yellow-200/50'
      case 'low': return 'bg-green-50/80 text-green-700 border border-green-200/50'
      default: return 'bg-gray-50/80 text-gray-700 border border-gray-200/50'
    }
  }

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? (completed / total) * 100 : 0
  }

  const formatBurndownData = (burndownData: Array<{ day: number; remaining: number }>) => {
    return burndownData.map(item => ({
      name: `Day ${item.day}`,
      value: item.remaining
    }))
  }

  const renderOverviewTab = () => {
    const activeSprint = sprints.find(sprint => sprint.status === 'active')
    const completedSprints = sprints.filter(sprint => sprint.status === 'completed')

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 tracking-tight">Total Sprints</p>
                  <p className="metric-number text-4xl text-gray-900 mt-1">{sprintStats.totalSprints}</p>
                  <p className="text-sm text-blue-600 mt-1 font-medium tracking-tight">All time sprints</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 text-blue-500">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 tracking-tight">Active Sprint</p>
                  <p className="metric-number text-4xl text-gray-900 mt-1">{sprintStats.activeSprints}</p>
                  <p className="text-sm text-orange-600 mt-1 font-medium tracking-tight">Currently running</p>
                </div>
                <div className="p-3 rounded-full bg-orange-50 text-orange-500">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 tracking-tight">Completed</p>
                  <p className="metric-number text-4xl text-gray-900 mt-1">{sprintStats.completedSprints}</p>
                  <p className="text-sm text-green-600 mt-1 font-medium tracking-tight">Successfully delivered</p>
                </div>
                <div className="p-3 rounded-full bg-green-50 text-green-500">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 tracking-tight">Avg Velocity</p>
                  <p className="metric-number text-4xl text-gray-900 mt-1">{Math.round(sprintStats.averageVelocity)}</p>
                  <p className="text-sm text-purple-600 mt-1 font-medium tracking-tight">Story points per sprint</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50 text-purple-500">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Sprint Details */}
        {activeSprint && (
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Current Sprint: {activeSprint.name}</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                {new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 tracking-tight">Sprint Progress</span>
                  <span className="text-sm font-bold text-gray-900 tracking-tight">
                    {activeSprint.completedStoryPoints}/{activeSprint.totalStoryPoints} story points
                  </span>
                </div>
                <div className="w-full bg-gray-200/50 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${getProgressPercentage(activeSprint.completedStoryPoints, activeSprint.totalStoryPoints)}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Tasks Completed:</span>
                    <span className="font-bold text-gray-900">{activeSprint.tasks.filter(t => t.status === 'done').length}/{activeSprint.tasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Velocity:</span>
                    <span className="font-bold text-gray-900">{activeSprint.velocity}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Burndown Chart */}
        {activeSprint && activeSprint.burndownData.length > 0 && (
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Sprint Burndown</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Story points remaining over time with precision tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LineChartComponent 
                data={formatBurndownData(activeSprint.burndownData)} 
                height={300}
                dataKey="value"
              />
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderSprintsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="card-title text-gray-900">All Sprints</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Sprint
          </Button>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Create New Sprint</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
                Create a new sprint with precision planning and luxury attention to detail
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Sprint Name *</Label>
                  <Input
                    id="name"
                    value={sprintForm.name}
                    onChange={(e) => setSprintForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter sprint name"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={sprintForm.status} onValueChange={(value) => setSprintForm(prev => ({ ...prev, status: value as Sprint['status'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={sprintForm.description}
                  onChange={(e) => setSprintForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter sprint description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={sprintForm.startDate}
                    onChange={(e) => setSprintForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={sprintForm.endDate}
                    onChange={(e) => setSprintForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Team Members</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddMemberDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add Member
                  </Button>
                </div>
                {sprintForm.team.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No team members added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {sprintForm.team.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{member.user}</p>
                          <p className="text-sm text-muted-foreground">{member.role} ({member.capacity}h)</p>
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
              </div>
            </div>
            <DialogFooter className="flex justify-end space-x-3 pt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSprint} 
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Sprint'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSprints.map((sprint, index) => (
          <Card 
            key={sprint._id} 
            className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">{sprint.name}</CardTitle>
                  <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className={`rounded-lg px-3 py-1 text-xs font-semibold tracking-tight ${getStatusColor(sprint.status)}`}>
                  {sprint.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600">Team Size</span>
                  <span className="font-bold text-gray-900">{sprint.team.length} members</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Story Points</span>
                    <span className="font-bold text-gray-900">
                      {sprint.completedStoryPoints}/{sprint.totalStoryPoints}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${getProgressPercentage(sprint.completedStoryPoints, sprint.totalStoryPoints)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Tasks:</span>
                    <span className="font-bold text-gray-900">
                      {sprint.tasks.filter(t => t.status === 'done').length}/{sprint.tasks.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Velocity:</span>
                    <span className="font-bold text-gray-900">{sprint.velocity}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSprint(sprint)}
                    className="flex-1 rounded-lg bg-blue-50/50 text-blue-600 border-blue-200/50 hover:bg-blue-100/80 text-xs font-medium tracking-tight h-8"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSprint(sprint)}
                    className="rounded-lg bg-green-50/50 text-green-600 border-green-200/50 hover:bg-green-100/80 h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSprint(sprint)
                      setIsDeleteDialogOpen(true)
                    }}
                    className="rounded-lg bg-red-50/50 text-red-600 border-red-200/50 hover:bg-red-100/80 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderPlanningTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sprint Planning</h3>
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4" />
            <p>Sprint planning tools coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sprint Analytics</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Velocity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent 
              data={sprints.map(sprint => ({
                name: sprint.name.slice(0, 10) + '...',
                value: sprint.velocity
              }))} 
              height={200} 
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sprint Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sprints.map((sprint) => (
                <div key={sprint._id} className="flex items-center justify-between">
                  <span className="text-sm">{sprint.name}</span>
                  <span className="text-sm font-medium">
                    {getProgressPercentage(sprint.completedStoryPoints, sprint.totalStoryPoints).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab()
      case 'sprints':
        return renderSprintsTab()
      case 'planning':
        return renderPlanningTab()
      case 'analytics':
        return renderAnalyticsTab()
      default:
        return renderOverviewTab()
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title text-gray-900">Sprint Planning</h1>
          <p className="text-gray-600 mt-1 font-medium tracking-tight">
            Orchestrate agile development with premium sprint management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sprints with precision..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-900 font-medium tracking-tight"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-900 font-medium tracking-tight">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">🔄 Planning</SelectItem>
              <SelectItem value="active">🚀 Active</SelectItem>
              <SelectItem value="completed">✅ Completed</SelectItem>
              <SelectItem value="cancelled">❌ Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="rounded-2xl bg-white/80 backdrop-blur-sm p-2 shadow-sm border-0 gap-1">
          <TabsTrigger value="overview" className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium tracking-tight px-4 py-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="sprints" className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium tracking-tight px-4 py-2">
            <Calendar className="h-4 w-4" />
            <span>Sprints</span>
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium tracking-tight px-4 py-2">
            <Target className="h-4 w-4" />
            <span>Planning</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium tracking-tight px-4 py-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-gray-600">Loading sprints...</p>
            </div>
          ) : (
            renderTabContent()
          )}
        </TabsContent>
      </Tabs>

      {/* View Sprint Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Sprint Details: {selectedSprint?.name}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              {selectedSprint?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedSprint && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedSprint.status)}>
                    {selectedSprint.status}
                  </Badge>
                </div>
                <div>
                  <Label>Duration</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSprint.startDate} - {selectedSprint.endDate}
                  </p>
                </div>
                <div>
                  <Label>Story Points</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSprint.completedStoryPoints}/{selectedSprint.totalStoryPoints}
                  </p>
                </div>
                <div>
                  <Label>Velocity</Label>
                  <p className="text-sm text-muted-foreground">{selectedSprint.velocity}</p>
                </div>
              </div>
              
              <div>
                <Label>Team Members ({selectedSprint.team.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedSprint.team.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{member.user}</p>
                        <p className="text-sm text-muted-foreground">{member.role} ({member.capacity}h)</p>
                      </div>
                      <Badge variant="outline">
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Tasks ({selectedSprint.tasks.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedSprint.tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTaskStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getTaskPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <span className="text-sm font-medium">{task.storyPoints} SP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Sprint Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Edit Sprint: {selectedSprint?.name}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              Update sprint information and settings with precision
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Sprint Name</Label>
                <Input
                  id="edit-name"
                  value={sprintForm.name}
                  onChange={(e) => setSprintForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter sprint name"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={sprintForm.status} onValueChange={(value) => setSprintForm(prev => ({ ...prev, status: value as Sprint['status'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={sprintForm.description}
                onChange={(e) => setSprintForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter sprint description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={sprintForm.startDate}
                  onChange={(e) => setSprintForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={sprintForm.endDate}
                  onChange={(e) => setSprintForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
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
              onClick={handleUpdateSprint} 
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Sprint'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sprint Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Delete Sprint</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              Are you sure you want to delete "<span className="font-semibold text-red-600">{selectedSprint?.name}</span>"? This action cannot be undone and will permanently remove all sprint data.
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
              onClick={handleDeleteSprint} 
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Sprint'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Add Task to Sprint</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              Add a new task to the current sprint with precision
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-status">Status</Label>
                <Select value={newTask.status} onValueChange={(value) => setNewTask(prev => ({ ...prev, status: value as SprintTask['status'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTaskStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as SprintTask['priority'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTaskPriorities.map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-story-points">Story Points</Label>
                <Input
                  id="task-story-points"
                  type="number"
                  value={newTask.storyPoints}
                  onChange={(e) => setNewTask(prev => ({ ...prev, storyPoints: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="task-estimated-hours">Estimated Hours</Label>
                <Input
                  id="task-estimated-hours"
                  type="number"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAddTaskDialogOpen(false)}
              className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddTask}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
              Add Task
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
              Add a new member to the sprint team with precision
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
            <div>
              <Label htmlFor="member-capacity">Capacity (hours)</Label>
              <Input
                id="member-capacity"
                type="number"
                value={newMember.capacity}
                onChange={(e) => setNewMember(prev => ({ ...prev, capacity: parseInt(e.target.value) || 40 }))}
                placeholder="40"
              />
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

export default SprintPlanning 