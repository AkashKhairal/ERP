import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: `${API_URL}/tasks`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface TaskComment {
  _id?: string
  user: string
  content: string
  createdAt?: string
  updatedAt?: string
}

export interface TaskSubtask {
  _id?: string
  title: string
  completed: boolean
  completedAt?: string
  completedBy?: string
}

export interface TaskAttachment {
  _id?: string
  filename: string
  originalName: string
  path: string
  size: number
  uploadedBy: string
  uploadedAt?: string
}

export interface TaskLink {
  _id?: string
  title: string
  url: string
  type: 'design' | 'reference' | 'documentation' | 'other'
}

export interface TaskDependency {
  task: string
  type: 'blocks' | 'blocked_by' | 'related'
}

export interface Task {
  _id?: string
  title: string
  description?: string
  project: string
  status: 'todo' | 'doing' | 'review' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type: 'feature' | 'bug' | 'improvement' | 'content' | 'design' | 'testing' | 'deployment' | 'other'
  assignedTo?: string
  assignedBy?: string
  dueDate: string
  startDate?: string
  completedDate?: string
  estimatedHours?: number
  actualHours?: number
  isRecurring?: boolean
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: string
    maxOccurrences?: number
  }
  dependencies?: TaskDependency[]
  subtasks?: TaskSubtask[]
  attachments?: TaskAttachment[]
  links?: TaskLink[]
  labels?: string[]
  tags?: string[]
  comments?: TaskComment[]
  progress?: number
  notifications?: {
    email: boolean
    slack: boolean
    reminderDays: number
  }
  createdBy?: string
  updatedBy?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TaskFilters {
  project?: string
  status?: string
  priority?: string
  assignedTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface TaskStats {
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  tasksByStatus: Array<{ status: string; count: number }>
  tasksByPriority: Array<{ priority: string; count: number }>
  tasksByType: Array<{ type: string; count: number }>
}

export const taskService = {
  // Get all tasks with optional filters
  async getTasks(filters: TaskFilters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
      
      const response = await api.get(`?${params.toString()}`)
      
      if (response.data && response.data.success) {
        return { success: true, data: Array.isArray(response.data.data) ? response.data.data : [] }
      } else if (Array.isArray(response.data)) {
        return { success: true, data: response.data }
      } else {
        return { success: true, data: [] }
      }
    } catch (error: any) {
      console.error('Error fetching tasks:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch tasks' }
    }
  },

  // Get task by ID
  async getTaskById(id: string) {
    try {
      const response = await api.get(`/${id}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching task:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch task' }
    }
  },

  // Create new task
  async createTask(taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await api.post('/', taskData)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error creating task:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to create task' }
    }
  },

  // Update task
  async updateTask(id: string, taskData: Partial<Task>) {
    try {
      const response = await api.put(`/${id}`, taskData)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error updating task:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to update task' }
    }
  },

  // Delete task
  async deleteTask(id: string) {
    try {
      const response = await api.delete(`/${id}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error deleting task:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to delete task' }
    }
  },

  // Update task status
  async updateTaskStatus(id: string, status: Task['status']) {
    try {
      const response = await api.patch(`/${id}/status`, { status })
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error updating task status:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to update task status' }
    }
  },

  // Assign task
  async assignTask(id: string, userId: string) {
    try {
      const response = await api.patch(`/${id}/assign`, { userId })
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error assigning task:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to assign task' }
    }
  },

  // Add comment to task
  async addComment(id: string, content: string) {
    try {
      const response = await api.post(`/${id}/comments`, { content })
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error adding comment:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to add comment' }
    }
  },

  // Add subtask to task
  async addSubtask(id: string, title: string) {
    try {
      const response = await api.post(`/${id}/subtasks`, { title })
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error adding subtask:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to add subtask' }
    }
  },

  // Complete subtask
  async completeSubtask(id: string, subtaskIndex: number) {
    try {
      const response = await api.patch(`/${id}/subtasks/${subtaskIndex}/complete`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error completing subtask:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to complete subtask' }
    }
  },

  // Get task statistics
  async getTaskStats() {
    try {
      const response = await api.get('/stats')
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching task stats:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch task stats' }
    }
  },

  // Get overdue tasks
  async getOverdueTasks() {
    try {
      const response = await api.get('/overdue')
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching overdue tasks:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch overdue tasks' }
    }
  },

  // Get my tasks
  async getMyTasks(status?: string) {
    try {
      const params = status ? `?status=${status}` : ''
      const response = await api.get(`/my-tasks${params}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching my tasks:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch my tasks' }
    }
  },

  // Get available task types
  getAvailableTypes() {
    return ['feature', 'bug', 'improvement', 'content', 'design', 'testing', 'deployment', 'other']
  },

  // Get available task statuses
  getAvailableStatuses() {
    return ['todo', 'doing', 'review', 'done', 'cancelled']
  },

  // Get available task priorities
  getAvailablePriorities() {
    return ['low', 'medium', 'high', 'urgent']
  },

  // Get sample tasks for fallback
  getSampleTasks(): Record<string, Task[]> {
    return {
      todo: [
        {
          _id: '1',
          title: 'Design new landing page',
          description: 'Create wireframes and mockups for the new landing page',
          project: 'project1',
          status: 'todo',
          priority: 'high',
          type: 'design',
          assignedTo: 'user1',
          assignedBy: 'user1',
          dueDate: '2024-02-10',
          estimatedHours: 16,
          actualHours: 0,
          progress: 0,
          comments: [],
          subtasks: [],
          isActive: true,
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        },
        {
          _id: '2',
          title: 'Set up CI/CD pipeline',
          description: 'Configure automated testing and deployment pipeline',
          project: 'project1',
          status: 'todo',
          priority: 'medium',
          type: 'deployment',
          assignedTo: 'user2',
          assignedBy: 'user1',
          dueDate: '2024-02-12',
          estimatedHours: 24,
          actualHours: 0,
          progress: 0,
          comments: [],
          subtasks: [],
          isActive: true,
          createdAt: '2024-01-14T00:00:00Z',
          updatedAt: '2024-01-14T00:00:00Z'
        }
      ],
      doing: [
        {
          _id: '3',
          title: 'Implement user authentication',
          description: 'Build JWT-based authentication system',
          project: 'project1',
          status: 'doing',
          priority: 'urgent',
          type: 'feature',
          assignedTo: 'user3',
          assignedBy: 'user1',
          dueDate: '2024-02-08',
          estimatedHours: 32,
          actualHours: 12,
          progress: 37,
          comments: [],
          subtasks: [],
          isActive: true,
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z'
        }
      ],
      review: [
        {
          _id: '5',
          title: 'Database optimization',
          description: 'Optimize database queries and indexes',
          project: 'project1',
          status: 'review',
          priority: 'high',
          type: 'improvement',
          assignedTo: 'user4',
          assignedBy: 'user1',
          dueDate: '2024-02-09',
          estimatedHours: 20,
          actualHours: 8,
          progress: 40,
          comments: [],
          subtasks: [],
          isActive: true,
          createdAt: '2024-01-12T00:00:00Z',
          updatedAt: '2024-01-12T00:00:00Z'
        }
      ],
      done: [
        {
          _id: '4',
          title: 'API documentation',
          description: 'Create comprehensive API documentation',
          project: 'project1',
          status: 'done',
          priority: 'medium',
          type: 'documentation',
          assignedTo: 'user5',
          assignedBy: 'user1',
          dueDate: '2024-01-31',
          estimatedHours: 8,
          actualHours: 6,
          progress: 100,
          comments: [],
          subtasks: [],
          isActive: true,
          createdAt: '2024-01-08T00:00:00Z',
          updatedAt: '2024-01-08T00:00:00Z'
        }
      ]
    }
  },

  // Get sample task stats for fallback
  getSampleTaskStats(): TaskStats {
    return {
      totalTasks: 4,
      completedTasks: 1,
      overdueTasks: 0,
      tasksByStatus: [
        { status: 'todo', count: 2 },
        { status: 'doing', count: 1 },
        { status: 'review', count: 1 },
        { status: 'done', count: 1 }
      ],
      tasksByPriority: [
        { priority: 'urgent', count: 1 },
        { priority: 'high', count: 2 },
        { priority: 'medium', count: 2 }
      ],
      tasksByType: [
        { type: 'design', count: 1 },
        { type: 'deployment', count: 1 },
        { type: 'feature', count: 1 },
        { type: 'improvement', count: 1 },
        { type: 'documentation', count: 1 }
      ]
    }
  }
}

export default taskService 