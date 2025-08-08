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
    { id: 'todo', title: 'To Do', color: 'bg-gray-100', icon: Square },
    { id: 'doing', title: 'In Progress', color: 'bg-blue-100', icon: Play },
    { id: 'review', title: 'Review', color: 'bg-yellow-100', icon: Eye },
    { id: 'done', title: 'Done', color: 'bg-green-100', icon: CheckCircle }
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
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Manage tasks with Kanban board
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => handleAddTask('todo')}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{stats.totalTasks}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">
                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {taskService.getAvailableTypes().map(type => (
              <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]">
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Assigned To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map(user => (
              <SelectItem key={user._id} value={user._id!}>{user.firstName} {user.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <column.icon className="h-5 w-5" />
                <h3 className="font-semibold text-lg">{column.title}</h3>
              </div>
              <Badge variant="secondary">
                {filteredTasks[column.id as keyof typeof filteredTasks]?.length || 0}
              </Badge>
            </div>
            
            <div 
              className={`p-4 rounded-lg ${column.color} min-h-[500px] transition-all duration-200 ${
                dragOverColumn === column.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="space-y-3">
                {filteredTasks[column.id as keyof typeof filteredTasks]?.map((task) => (
                  <Card 
                    key={task._id} 
                    className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                      isDragging && draggedItem?.id === task._id ? 'opacity-50 scale-95' : ''
                    } ${animatingTasks.has(task._id!) ? 'animate-pulse' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id!, column.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTypeIcon(task.type)}</span>
                            <h4 className="font-medium text-sm">{task.title}</h4>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTask(task)
                              }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        
                        {/* Progress bar */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Progress</span>
                              <span>{Math.round(getProgressPercentage(task))}%</span>
                            </div>
                            <Progress value={getProgressPercentage(task)} className="h-2" />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>
                              {users.find(u => u._id === task.assignedTo)?.firstName || 'Unassigned'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.actualHours || 0}h / {task.estimatedHours || 0}h</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Flag className="h-3 w-3" />
                            <span>{task.progress || 0}%</span>
                          </div>
                        </div>
                        
                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <MessageCircle className="h-3 w-3" />
                            <span>{task.comments.length} comments</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditTask(task)
                            }}
                            className="flex-1"
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
                  className="w-full"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {selectedTask ? 'Update task details below.' : 'Fill in the task details below.'}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>
              <Save className="h-4 w-4 mr-2" />
              {selectedTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Add a comment to "{selectedTask?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddComment}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Tracking Dialog */}
      <Dialog open={isTimeTrackingDialogOpen} onOpenChange={setIsTimeTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time Tracking</DialogTitle>
            <DialogDescription>
              Track time spent on "{selectedTask?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  value={timeTracking.hours}
                  onChange={(e) => setTimeTracking(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="minutes">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  value={timeTracking.minutes}
                  onChange={(e) => setTimeTracking(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                  min="0"
                  max="59"
                />
              </div>
            </div>
            {isTimeTrackingActive && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Time tracking active</p>
                <p className="text-lg font-mono">
                  {timeTrackingStart ? Math.floor((Date.now() - timeTrackingStart.getTime()) / 1000 / 60) : 0} minutes
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTimeTrackingDialogOpen(false)}>
              Cancel
            </Button>
            {!isTimeTrackingActive ? (
              <Button onClick={handleStartTimeTracking}>
                <Play className="h-4 w-4 mr-2" />
                Start Tracking
              </Button>
            ) : (
              <Button onClick={handleStopTimeTracking}>
                <Pause className="h-4 w-4 mr-2" />
                Stop Tracking
              </Button>
            )}
            <Button onClick={handleSaveTimeTracking}>
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