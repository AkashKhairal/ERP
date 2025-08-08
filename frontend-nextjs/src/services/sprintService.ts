import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: `${API_URL}/sprints`,
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

export interface SprintTask {
  _id?: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  storyPoints: number
  assignee?: string
  estimatedHours: number
  actualHours: number
  createdAt?: string
  updatedAt?: string
}

export interface SprintMember {
  user: string
  role: string
  capacity: number
  isActive: boolean
}

export interface Sprint {
  _id?: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  team: SprintMember[]
  tasks: SprintTask[]
  totalStoryPoints: number
  completedStoryPoints: number
  velocity: number
  burndownData: Array<{ day: number; remaining: number }>
  projectId?: string
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface SprintStats {
  totalSprints: number
  activeSprints: number
  completedSprints: number
  averageVelocity: number
  totalStoryPoints: number
  completedStoryPoints: number
  sprintCompletionRate: number
}

export interface SprintFilters {
  search?: string
  status?: string
  projectId?: string
  startDate?: string
  endDate?: string
}

export const sprintService = {
  // Get all sprints with optional filters
  async getSprints(filters: SprintFilters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await api.get(`?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error fetching sprints:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch sprints' }
    }
  },

  // Get sprint by ID
  async getSprintById(id: string) {
    try {
      const response = await api.get(`/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error fetching sprint:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch sprint' }
    }
  },

  // Create new sprint
  async createSprint(sprintData: Omit<Sprint, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await api.post('/', sprintData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error creating sprint:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to create sprint' }
    }
  },

  // Update sprint
  async updateSprint(id: string, sprintData: Partial<Sprint>) {
    try {
      const response = await api.put(`/${id}`, sprintData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error updating sprint:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to update sprint' }
    }
  },

  // Delete sprint
  async deleteSprint(id: string) {
    try {
      const response = await api.delete(`/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error deleting sprint:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to delete sprint' }
    }
  },

  // Get sprint statistics
  async getSprintStats() {
    try {
      const response = await api.get('/stats')
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error fetching sprint stats:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch sprint stats' }
    }
  },

  // Add task to sprint
  async addTaskToSprint(sprintId: string, taskData: Omit<SprintTask, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await api.post(`/${sprintId}/tasks`, taskData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error adding task to sprint:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to add task to sprint' }
    }
  },

  // Update task in sprint
  async updateTaskInSprint(sprintId: string, taskId: string, taskData: Partial<SprintTask>) {
    try {
      const response = await api.put(`/${sprintId}/tasks/${taskId}`, taskData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error updating task in sprint:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to update task in sprint' }
    }
  },

  // Remove task from sprint
  async removeTaskFromSprint(sprintId: string, taskId: string) {
    try {
      const response = await api.delete(`/${sprintId}/tasks/${taskId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error removing task from sprint:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to remove task from sprint' }
    }
  },

  // Add member to sprint
  async addMemberToSprint(sprintId: string, memberData: Omit<SprintMember, 'isActive'>) {
    try {
      const response = await api.post(`/${sprintId}/members`, memberData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error adding member to sprint:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to add member to sprint' }
    }
  },

  // Remove member from sprint
  async removeMemberFromSprint(sprintId: string, memberId: string) {
    try {
      const response = await api.delete(`/${sprintId}/members/${memberId}`)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error removing member from sprint:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to remove member from sprint' }
    }
  },

  // Get available sprint statuses
  getAvailableStatuses() {
    return ['planning', 'active', 'completed', 'cancelled']
  },

  // Get available task statuses
  getAvailableTaskStatuses() {
    return ['todo', 'in_progress', 'done', 'blocked']
  },

  // Get available task priorities
  getAvailableTaskPriorities() {
    return ['low', 'medium', 'high', 'urgent']
  },

  // Get available sprint roles
  getAvailableRoles() {
    return ['Developer', 'Designer', 'QA Engineer', 'Product Manager', 'Scrum Master', 'Team Lead']
  },

  // Get sample sprints for fallback
  getSampleSprints(): Sprint[] {
    return [
      {
        _id: '1',
        name: 'Sprint 1 - Foundation',
        description: 'Core foundation and setup tasks',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        status: 'completed',
        team: [
          { user: 'John Doe', role: 'Developer', capacity: 40, isActive: true },
          { user: 'Sarah Wilson', role: 'Designer', capacity: 40, isActive: true },
          { user: 'Mike Johnson', role: 'QA Engineer', capacity: 40, isActive: true }
        ],
        tasks: [
          {
            _id: 'task1',
            title: 'Setup Development Environment',
            description: 'Configure development environment and tools',
            status: 'done',
            priority: 'high',
            storyPoints: 5,
            assignee: 'John Doe',
            estimatedHours: 8,
            actualHours: 6
          },
          {
            _id: 'task2',
            title: 'Design System Setup',
            description: 'Create and implement design system',
            status: 'done',
            priority: 'high',
            storyPoints: 8,
            assignee: 'Sarah Wilson',
            estimatedHours: 16,
            actualHours: 14
          }
        ],
        totalStoryPoints: 45,
        completedStoryPoints: 45,
        velocity: 45,
        burndownData: [
          { day: 1, remaining: 45 },
          { day: 2, remaining: 40 },
          { day: 3, remaining: 35 },
          { day: 4, remaining: 30 },
          { day: 5, remaining: 25 },
          { day: 6, remaining: 20 },
          { day: 7, remaining: 15 },
          { day: 8, remaining: 10 },
          { day: 9, remaining: 5 },
          { day: 10, remaining: 0 }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        _id: '2',
        name: 'Sprint 2 - Features',
        description: 'Core feature development',
        startDate: '2024-01-15',
        endDate: '2024-01-28',
        status: 'active',
        team: [
          { user: 'John Doe', role: 'Developer', capacity: 40, isActive: true },
          { user: 'Sarah Wilson', role: 'Designer', capacity: 40, isActive: true },
          { user: 'Mike Johnson', role: 'QA Engineer', capacity: 40, isActive: true },
          { user: 'Emily Chen', role: 'Product Manager', capacity: 40, isActive: true }
        ],
        tasks: [
          {
            _id: 'task3',
            title: 'User Authentication',
            description: 'Implement user authentication system',
            status: 'done',
            priority: 'high',
            storyPoints: 13,
            assignee: 'John Doe',
            estimatedHours: 20,
            actualHours: 18
          },
          {
            _id: 'task4',
            title: 'Dashboard Design',
            description: 'Design and implement dashboard',
            status: 'in_progress',
            priority: 'medium',
            storyPoints: 8,
            assignee: 'Sarah Wilson',
            estimatedHours: 16,
            actualHours: 8
          }
        ],
        totalStoryPoints: 60,
        completedStoryPoints: 32,
        velocity: 32,
        burndownData: [
          { day: 1, remaining: 60 },
          { day: 2, remaining: 55 },
          { day: 3, remaining: 50 },
          { day: 4, remaining: 45 },
          { day: 5, remaining: 40 },
          { day: 6, remaining: 35 },
          { day: 7, remaining: 32 }
        ],
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      },
      {
        _id: '3',
        name: 'Sprint 3 - Polish',
        description: 'Final polish and optimization',
        startDate: '2024-01-29',
        endDate: '2024-02-11',
        status: 'planning',
        team: [
          { user: 'John Doe', role: 'Developer', capacity: 40, isActive: true },
          { user: 'Sarah Wilson', role: 'Designer', capacity: 40, isActive: true },
          { user: 'Mike Johnson', role: 'QA Engineer', capacity: 40, isActive: true }
        ],
        tasks: [],
        totalStoryPoints: 35,
        completedStoryPoints: 0,
        velocity: 0,
        burndownData: [],
        createdAt: '2024-01-29T00:00:00Z',
        updatedAt: '2024-01-29T00:00:00Z'
      }
    ]
  },

  // Get sample sprint stats for fallback
  getSampleSprintStats(): SprintStats {
    return {
      totalSprints: 3,
      activeSprints: 1,
      completedSprints: 1,
      averageVelocity: 38.5,
      totalStoryPoints: 140,
      completedStoryPoints: 77,
      sprintCompletionRate: 55
    }
  }
}

export default sprintService 