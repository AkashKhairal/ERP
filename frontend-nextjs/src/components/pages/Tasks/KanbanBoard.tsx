'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Plus, 
  MoreVertical, 
  User, 
  Calendar, 
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Download,
  Filter,
  Search,
  X,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Link as LinkIcon,
  Timer,
  Play,
  Pause,
  Square,
  Star,
  Archive,
  Copy,
  Share2,
  Settings,
  BarChart3,
  TrendingUp,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { taskService, type Task, type TaskComment, type TaskSubtask } from '@/services/taskService'
import { userService, type User as UserType } from '@/services/userService'
import { projectService, type Project } from '@/services/projectService'

interface DragItem {
  id: string
  type: 'task'
  sourceColumn: string
}

interface TaskFormData {
  title: string
  description: string
  project: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type: 'feature' | 'bug' | 'improvement' | 'content' | 'design' | 'testing' | 'deployment' | 'other'
  assignedTo: string
  dueDate: string
  estimatedHours: number
  labels: string[]
  tags: string[]
}

const KanbanBoard = () => {
  const { user, logActivity } = useAuth()
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    todo: [],
    doing: [],
    review: [],
    done: []
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [assignedToFilter, setAssignedToFilter] = useState('all')
  const [users, setUsers] = useState<UserType[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<any>(null)
  
  // Task management states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [isTimeTrackingDialogOpen, setIsTimeTrackingDialogOpen] = useState(false)
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false)
  const [isDependencyDialogOpen, setIsDependencyDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    project: '',
    priority: 'medium',
    type: 'feature',
    assignedTo: '',
    dueDate: '',
    estimatedHours: 0,
    labels: [],
    tags: []
  })
  const [newComment, setNewComment] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [newDependency, setNewDependency] = useState('')
  const [timeTracking, setTimeTracking] = useState({ hours: 0, minutes: 0 })
  const [isTimeTrackingActive, setIsTimeTrackingActive] = useState(false)
  const [timeTrackingStart, setTimeTrackingStart] = useState<Date | null>(null)
  
  // Drag and drop states
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Animation states
  const [animatingTasks, setAnimatingTasks] = useState<Set<string>>(new Set())
  
  // Task templates
  const taskTemplates = [
    {
      name: 'Bug Report',
      template: {
        title: 'Bug: ',
        description: '**Steps to reproduce:**\n1. \n2. \n3. \n\n**Expected behavior:**\n\n**Actual behavior:**\n\n**Environment:**\n- Browser: \n- OS: \n- Version: ',
        type: 'bug' as const,
        priority: 'high' as const
      }
    },
    {
      name: 'Feature Request',
      template: {
        title: 'Feature: ',
        description: '**Description:**\n\n**User Story:**\nAs a [user type], I want [feature] so that [benefit].\n\n**Acceptance Criteria:**\n- [ ] \n- [ ] \n- [ ] ',
        type: 'feature' as const,
        priority: 'medium' as const
      }
    },
    {
      name: 'Content Creation',
      template: {
        title: 'Content: ',
        description: '**Content Type:**\n\n**Target Audience:**\n\n**Key Points:**\n1. \n2. \n3. \n\n**Call to Action:**',
        type: 'content' as const,
        priority: 'medium' as const
      }
    }
  ]

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gradient-to-br from-gray-50/80 to-gray-100/80', borderColor: 'border-gray-200/50', icon: Square, iconColor: 'text-gray-600' },
    { id: 'doing', title: 'In Progress', color: 'bg-gradient-to-br from-blue-50/80 to-blue-100/80', borderColor: 'border-blue-200/50', icon: Play, iconColor: 'text-blue-600' },
    { id: 'review', title: 'Review', color: 'bg-gradient-to-br from-yellow-50/80 to-yellow-100/80', borderColor: 'border-yellow-200/50', icon: Eye, iconColor: 'text-yellow-600' },
    { id: 'done', title: 'Done', color: 'bg-gradient-to-br from-green-50/80 to-green-100/80', borderColor: 'border-green-200/50', icon: CheckCircle, iconColor: 'text-green-600' }
  ]

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load tasks
      const tasksResponse = await taskService.getTasks()
      if (tasksResponse.success) {
        const tasksData = tasksResponse.data
        const groupedTasks = {
          todo: tasksData.filter((task: Task) => task.status === 'todo'),
          doing: tasksData.filter((task: Task) => task.status === 'doing'),
          review: tasksData.filter((task: Task) => task.status === 'review'),
          done: tasksData.filter((task: Task) => task.status === 'done')
        }
        setTasks(groupedTasks)
      } else {
        // Use sample data if API fails
        setTasks(taskService.getSampleTasks())
      }

      // Load users
      const usersResponse = await userService.getUsers()
      if (usersResponse.success) {
        setUsers(usersResponse.data)
      }

      // Load projects
      const projectsResponse = await projectService.getProjects()
      if (projectsResponse.success) {
        setProjects(projectsResponse.data)
      }

      // Load stats
      const statsResponse = await taskService.getTaskStats()
      if (statsResponse.success) {
        setStats(statsResponse.data)
      } else {
        setStats(taskService.getSampleTaskStats())
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Use sample data as fallback
      setTasks(taskService.getSampleTasks())
      setStats(taskService.getSampleTaskStats())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    logActivity('Kanban Board Visit', 'User accessed task management board')
  }, [loadData, logActivity])

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumn: string) => {
    setDraggedItem({ id: taskId, type: 'task', sourceColumn })
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault()
    if (!draggedItem) return

    const { id: taskId, sourceColumn } = draggedItem
    
    if (sourceColumn === targetColumn) {
      setDraggedItem(null)
      setDragOverColumn(null)
      setIsDragging(false)
      return
    }

    // Update task status
    try {
      const response = await taskService.updateTaskStatus(taskId, targetColumn as Task['status'])
      if (response.success) {
        // Update local state
        setTasks(prev => {
          const newTasks = { ...prev }
          // Remove from source column
          newTasks[sourceColumn as keyof typeof newTasks] = newTasks[sourceColumn as keyof typeof newTasks].filter(task => task._id !== taskId)
          // Add to target column
          const taskToMove = prev[sourceColumn as keyof typeof prev].find(task => task._id === taskId)
          if (taskToMove) {
            const updatedTask = { ...taskToMove, status: targetColumn as Task['status'] }
            newTasks[targetColumn as keyof typeof newTasks] = [...newTasks[targetColumn as keyof typeof newTasks], updatedTask]
          }
          return newTasks
        })

        // Add animation
        setAnimatingTasks(prev => new Set([...Array.from(prev), taskId]))
        setTimeout(() => {
          setAnimatingTasks(prev => {
            const newSet = new Set(prev)
            newSet.delete(taskId)
            return newSet
          })
        }, 300)

        logActivity('Task Status Updated', `Task moved from ${sourceColumn} to ${targetColumn}`)
      }
    } catch (error) {
      console.error('Error updating task status:', error)
    }

    setDraggedItem(null)
    setDragOverColumn(null)
    setIsDragging(false)
  }

  // Task management handlers
  const handleAddTask = (columnId: string) => {
    setTaskFormData({
      title: '',
      description: '',
      project: projects[0]?._id || '',
      priority: 'medium',
      type: 'feature',
      assignedTo: '',
      dueDate: '',
      estimatedHours: 0,
      labels: [],
      tags: []
    })
    setIsTaskDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      project: task.project,
      priority: task.priority,
      type: task.type,
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate.split('T')[0],
      estimatedHours: task.estimatedHours || 0,
      labels: task.labels || [],
      tags: task.tags || []
    })
    setIsTaskDialogOpen(true)
  }

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedTask) return

    try {
      const response = await taskService.deleteTask(selectedTask._id!)
      if (response.success) {
        setTasks(prev => {
          const newTasks = { ...prev }
          newTasks[selectedTask.status as keyof typeof newTasks] = newTasks[selectedTask.status as keyof typeof newTasks].filter(task => task._id !== selectedTask._id)
          return newTasks
        })
        logActivity('Task Deleted', `Deleted task: ${selectedTask.title}`)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }

    setIsDeleteDialogOpen(false)
    setSelectedTask(null)
  }

  const handleSaveTask = async () => {
    try {
      if (selectedTask) {
        // Update existing task
        const response = await taskService.updateTask(selectedTask._id!, taskFormData)
        if (response.success) {
          setTasks(prev => {
            const newTasks = { ...prev }
            const taskIndex = newTasks[selectedTask.status as keyof typeof newTasks].findIndex(task => task._id === selectedTask._id)
            if (taskIndex !== -1) {
              newTasks[selectedTask.status as keyof typeof newTasks][taskIndex] = { ...selectedTask, ...taskFormData }
            }
            return newTasks
          })
          logActivity('Task Updated', `Updated task: ${taskFormData.title}`)
        }
      } else {
        // Create new task
        const response = await taskService.createTask({
          ...taskFormData,
          status: 'todo',
          assignedBy: user?._id || '',
          createdBy: user?._id || ''
        })
        if (response.success) {
          const newTask = response.data
          setTasks(prev => ({
            ...prev,
            todo: [...prev.todo, newTask]
          }))
          logActivity('Task Created', `Created new task: ${taskFormData.title}`)
        }
      }
    } catch (error) {
      console.error('Error saving task:', error)
    }

    setIsTaskDialogOpen(false)
    setSelectedTask(null)
  }

  const handleAddComment = async () => {
    if (!selectedTask || !newComment.trim()) return

    try {
      const response = await taskService.addComment(selectedTask._id!, newComment)
      if (response.success) {
        setTasks(prev => {
          const newTasks = { ...prev }
          const taskIndex = newTasks[selectedTask.status as keyof typeof newTasks].findIndex(task => task._id === selectedTask._id)
          if (taskIndex !== -1) {
            newTasks[selectedTask.status as keyof typeof newTasks][taskIndex] = {
              ...newTasks[selectedTask.status as keyof typeof newTasks][taskIndex],
              comments: [...(newTasks[selectedTask.status as keyof typeof newTasks][taskIndex].comments || []), response.data]
            }
          }
          return newTasks
        })
        setNewComment('')
        setIsCommentDialogOpen(false)
        logActivity('Comment Added', `Added comment to task: ${selectedTask.title}`)
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleAddSubtask = async () => {
    if (!selectedTask || !newSubtask.trim()) return

    try {
      const response = await taskService.addSubtask(selectedTask._id!, newSubtask)
      if (response.success) {
        setTasks(prev => {
          const newTasks = { ...prev }
          const taskIndex = newTasks[selectedTask.status as keyof typeof newTasks].findIndex(task => task._id === selectedTask._id)
          if (taskIndex !== -1) {
            newTasks[selectedTask.status as keyof typeof newTasks][taskIndex] = {
              ...newTasks[selectedTask.status as keyof typeof newTasks][taskIndex],
              subtasks: [...(newTasks[selectedTask.status as keyof typeof newTasks][taskIndex].subtasks || []), response.data]
            }
          }
          return newTasks
        })
        setNewSubtask('')
        logActivity('Subtask Added', `Added subtask to task: ${selectedTask.title}`)
      }
    } catch (error) {
      console.error('Error adding subtask:', error)
    }
  }

  const handleCompleteSubtask = async (taskId: string, subtaskIndex: number) => {
    try {
      const response = await taskService.completeSubtask(taskId, subtaskIndex)
      if (response.success) {
        setTasks(prev => {
          const newTasks = { ...prev }
          Object.keys(newTasks).forEach(columnId => {
            const taskIndex = newTasks[columnId as keyof typeof newTasks].findIndex(task => task._id === taskId)
            if (taskIndex !== -1) {
              const task = newTasks[columnId as keyof typeof newTasks][taskIndex]
              if (task.subtasks && task.subtasks[subtaskIndex]) {
                task.subtasks[subtaskIndex].completed = true
                task.subtasks[subtaskIndex].completedAt = new Date().toISOString()
              }
            }
          })
          return newTasks
        })
      }
    } catch (error) {
      console.error('Error completing subtask:', error)
    }
  }

  // Time tracking handlers
  const handleStartTimeTracking = () => {
    setIsTimeTrackingActive(true)
    setTimeTrackingStart(new Date())
  }

  const handleStopTimeTracking = () => {
    setIsTimeTrackingActive(false)
    setTimeTrackingStart(null)
  }

  const handleSaveTimeTracking = async () => {
    if (!selectedTask) return

    const totalMinutes = timeTracking.hours * 60 + timeTracking.minutes
    if (totalMinutes === 0) return

    try {
      const response = await taskService.updateTask(selectedTask._id!, {
        actualHours: (selectedTask.actualHours || 0) + totalMinutes / 60
      })
      if (response.success) {
        setTasks(prev => {
          const newTasks = { ...prev }
          const taskIndex = newTasks[selectedTask.status as keyof typeof newTasks].findIndex(task => task._id === selectedTask._id)
          if (taskIndex !== -1) {
            newTasks[selectedTask.status as keyof typeof newTasks][taskIndex] = {
              ...newTasks[selectedTask.status as keyof typeof newTasks][taskIndex],
              actualHours: (newTasks[selectedTask.status as keyof typeof newTasks][taskIndex].actualHours || 0) + totalMinutes / 60
            }
          }
          return newTasks
        })
        setTimeTracking({ hours: 0, minutes: 0 })
        setIsTimeTrackingDialogOpen(false)
        logActivity('Time Tracking Updated', `Added ${totalMinutes} minutes to task: ${selectedTask.title}`)
      }
    } catch (error) {
      console.error('Error updating time tracking:', error)
    }
  }

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50/80 text-red-700 border border-red-200/50'
      case 'high': return 'bg-orange-50/80 text-orange-700 border border-orange-200/50'
      case 'medium': return 'bg-yellow-50/80 text-yellow-700 border border-yellow-200/50'
      case 'low': return 'bg-green-50/80 text-green-700 border border-green-200/50'
      default: return 'bg-gray-50/80 text-gray-700 border border-gray-200/50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'design': return '🎨'
      case 'development': return '💻'
      case 'documentation': return '📝'
      case 'testing': return '🧪'
      case 'bug': return '🐛'
      case 'feature': return '✨'
      case 'improvement': return '🚀'
      case 'content': return '📄'
      case 'deployment': return '🚀'
      default: return '📋'
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const getProgressPercentage = (task: Task) => {
    if (task.subtasks && task.subtasks.length > 0) {
      const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length
      return (completedSubtasks / task.subtasks.length) * 100
    }
    return task.progress || 0
  }

  const filteredTasks = Object.keys(tasks).reduce((acc, columnId) => {
    acc[columnId] = tasks[columnId as keyof typeof tasks].filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      const matchesType = typeFilter === 'all' || task.type === typeFilter
      const matchesProject = projectFilter === 'all' || task.project === projectFilter
      const matchesAssignedTo = assignedToFilter === 'all' || task.assignedTo === assignedToFilter
      
      return matchesSearch && matchesPriority && matchesType && matchesProject && matchesAssignedTo
    })
    return acc
  }, {} as typeof tasks)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tasks...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1 font-medium tracking-tight">
            Orchestrate your workflow with premium Kanban precision
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => handleAddTask('todo')}
            className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 tracking-tight">Total Tasks</p>
                  <p className="metric-number text-4xl text-gray-900 mt-1">{stats.totalTasks}</p>
                  <p className="text-sm text-blue-600 mt-1 font-medium tracking-tight">Active workflow</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 text-blue-500">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 tracking-tight">Completed</p>
                  <p className="metric-number text-4xl text-gray-900 mt-1">{stats.completedTasks}</p>
                  <p className="text-sm text-green-600 mt-1 font-medium tracking-tight">Successfully done</p>
                </div>
                <div className="p-3 rounded-full bg-green-50 text-green-500">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 tracking-tight">Overdue</p>
                  <p className="metric-number text-4xl text-gray-900 mt-1">{stats.overdueTasks}</p>
                  <p className="text-sm text-red-600 mt-1 font-medium tracking-tight">Needs attention</p>
                </div>
                <div className="p-3 rounded-full bg-red-50 text-red-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 tracking-tight">Progress</p>
                  <p className="metric-number text-4xl text-gray-900 mt-1">
                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                  </p>
                  <p className="text-sm text-purple-600 mt-1 font-medium tracking-tight">Overall completion</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50 text-purple-500">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks with precision..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-900 font-medium tracking-tight"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px] rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-900 font-medium tracking-tight">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-900 font-medium tracking-tight">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {taskService.getAvailableTypes().map(type => (
                  <SelectItem key={type} value={type}>{getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[140px] rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-900 font-medium tracking-tight">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project._id} value={project._id!}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
              <SelectTrigger className="w-[140px] rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-900 font-medium tracking-tight">
                <SelectValue placeholder="Assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user._id} value={user._id!}>{user.firstName} {user.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full bg-white/80 backdrop-blur-sm ${column.iconColor} shadow-sm`}>
                  <column.icon className="h-4 w-4" />
                </div>
                <h3 className="card-title text-gray-900 text-base">{column.title}</h3>
              </div>
              <Badge 
                variant="secondary" 
                className={`rounded-full px-3 py-1 text-xs font-semibold tracking-tight ${column.iconColor} bg-white/80 backdrop-blur-sm border-0`}
              >
                {filteredTasks[column.id as keyof typeof filteredTasks]?.length || 0}
              </Badge>
            </div>
            
            <div 
              className={`p-4 rounded-2xl backdrop-blur-sm border ${column.borderColor} ${column.color} min-h-[600px] transition-all duration-300 ease-out ${
                dragOverColumn === column.id ? 'ring-2 ring-orange-300 bg-orange-50/50 scale-105' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="space-y-3">
                {filteredTasks[column.id as keyof typeof filteredTasks]?.map((task) => (
                  <Card 
                    key={task._id} 
                    className={`cursor-pointer rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-out ${
                      isDragging && draggedItem?.id === task._id ? 'opacity-50 scale-95 rotate-3' : ''
                    } ${animatingTasks.has(task._id!) ? 'animate-pulse' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id!, column.id)}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="p-1.5 rounded-lg bg-gray-50/80 text-gray-600 mt-0.5">
                              <span className="text-base">{getTypeIcon(task.type)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 tracking-tight leading-tight line-clamp-2">{task.title}</h4>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Badge className={`text-xs font-semibold tracking-tight rounded-lg px-2 py-1 ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTask(task)
                              }}
                              className="h-7 w-7 p-0 rounded-lg hover:bg-gray-100/80"
                            >
                              <MoreVertical className="h-3.5 w-3.5 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        {/* Progress bar */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-gray-600">Progress</span>
                              <span className="font-semibold text-gray-900">{Math.round(getProgressPercentage(task))}%</span>
                            </div>
                            <Progress value={getProgressPercentage(task)} className="h-1.5" />
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-1.5 text-gray-500">
                            <div className="p-1 rounded bg-gray-100/80">
                              <User className="h-2.5 w-2.5" />
                            </div>
                            <span className="font-medium truncate">
                              {users.find(u => u._id === task.assignedTo)?.firstName || 'Unassigned'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-gray-500">
                            <div className={`p-1 rounded ${isOverdue(task.dueDate) ? 'bg-red-100/80' : 'bg-gray-100/80'}`}>
                              <Calendar className="h-2.5 w-2.5" />
                            </div>
                            <span className={`font-medium ${isOverdue(task.dueDate) ? 'text-red-600' : ''}`}>
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">{task.actualHours || 0}h/{task.estimatedHours || 0}h</span>
                            </div>
                            {task.comments && task.comments.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="h-3 w-3" />
                                <span className="font-medium">{task.comments.length}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-xs">
                            <Flag className="h-3 w-3 text-gray-400" />
                            <span className="font-semibold text-gray-600">{task.progress || 0}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-3 border-t border-gray-100/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditTask(task)
                            }}
                            className="flex-1 rounded-lg bg-blue-50/50 text-blue-600 border-blue-200/50 hover:bg-blue-100/80 text-xs font-medium tracking-tight h-7"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTask(task)
                            }}
                            className="rounded-lg bg-red-50/50 text-red-600 border-red-200/50 hover:bg-red-100/80 h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  className="w-full rounded-xl bg-white/80 backdrop-blur-sm border-gray-200/50 text-gray-600 hover:text-gray-900 hover:bg-white/90 transition-all duration-200 ease-out shadow-sm font-medium tracking-tight h-10"
                  onClick={() => handleAddTask(column.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
              {selectedTask ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              {selectedTask ? 'Update task details with precision and clarity.' : 'Define your task with luxury attention to detail.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={taskFormData.type} onValueChange={(value) => setTaskFormData(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskService.getAvailableTypes().map(type => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project">Project</Label>
                <Select value={taskFormData.project} onValueChange={(value) => setTaskFormData(prev => ({ ...prev, project: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project._id} value={project._id!}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select value={taskFormData.assignedTo} onValueChange={(value) => setTaskFormData(prev => ({ ...prev, assignedTo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user._id} value={user._id!}>{user.firstName} {user.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={taskFormData.priority} onValueChange={(value) => setTaskFormData(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskService.getAvailablePriorities().map(priority => (
                      <SelectItem key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={taskFormData.estimatedHours}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsTaskDialogOpen(false)}
              className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTask}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
              <Save className="h-4 w-4 mr-2" />
              {selectedTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Delete Task</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              Are you sure you want to delete "<span className="font-semibold text-red-600">{selectedTask?.title}</span>"? This action cannot be undone and will permanently remove all task data.
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
              onClick={handleConfirmDelete}
              className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Add Comment</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              Add a thoughtful comment to "<span className="font-semibold text-gray-900">{selectedTask?.title}</span>"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your insightful comment..."
              rows={4}
              className="rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50"
            />
          </div>
          <DialogFooter className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsCommentDialogOpen(false)}
              className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddComment}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Tracking Dialog */}
      <Dialog open={isTimeTrackingDialogOpen} onOpenChange={setIsTimeTrackingDialogOpen}>
        <DialogContent className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl border-0 gap-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Time Tracking</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium tracking-tight">
              Track time spent on "<span className="font-semibold text-gray-900">{selectedTask?.title}</span>" with precision
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours" className="text-sm font-semibold text-gray-700 tracking-tight">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  value={timeTracking.hours}
                  onChange={(e) => setTimeTracking(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  min="0"
                  className="mt-2 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50"
                />
              </div>
              <div>
                <Label htmlFor="minutes" className="text-sm font-semibold text-gray-700 tracking-tight">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  value={timeTracking.minutes}
                  onChange={(e) => setTimeTracking(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                  min="0"
                  max="59"
                  className="mt-2 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50"
                />
              </div>
            </div>
            {isTimeTrackingActive && (
              <div className="text-center p-4 rounded-2xl bg-blue-50/80 backdrop-blur-sm border border-blue-200/50">
                <p className="text-sm font-semibold text-blue-700 tracking-tight">Time tracking active</p>
                <p className="text-2xl font-mono font-bold text-blue-900 mt-1">
                  {timeTrackingStart ? Math.floor((Date.now() - timeTrackingStart.getTime()) / 1000 / 60) : 0} minutes
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsTimeTrackingDialogOpen(false)}
              className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
            >
              Cancel
            </Button>
            {!isTimeTrackingActive ? (
              <Button 
                onClick={handleStartTimeTracking}
                className="rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Tracking
              </Button>
            ) : (
              <Button 
                onClick={handleStopTimeTracking}
                className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop Tracking
              </Button>
            )}
            <Button 
              onClick={handleSaveTimeTracking}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default KanbanBoard 