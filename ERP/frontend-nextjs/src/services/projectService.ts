import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://creatorbase-backend.onrender.com/api'

const api = axios.create({
  baseURL: `${API_URL}/projects`,
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

export interface ProjectMember {
  user: string
  role: string
  joinedDate: string
  isActive: boolean
}

export interface Project {
  _id?: string
  name: string
  description: string
  status: 'active' | 'completed' | 'planning' | 'on_hold' | 'cancelled'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  type: 'saas' | 'youtube' | 'freelance' | 'internal'
  startDate: string
  endDate: string
  budget: number
  team?: ProjectMember[]
  teamMembers?: ProjectMember[]
  progress: number
  client: string
  projectManager?: string
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalBudget: number
  averageProgress: number
  projectsByStatus: Array<{ status: string; count: number }>
  projectsByType: Array<{ type: string; count: number }>
}

export interface ProjectFilters {
  search?: string
  status?: string
  priority?: string
  type?: string
  startDate?: string
  endDate?: string
}

export const projectService = {
  // Get all projects with optional filters
  async getProjects(filters: ProjectFilters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await api.get(`?${params.toString()}`)
      
      // Handle the response structure from backend
      if (response.data && response.data.success) {
        return { success: true, data: Array.isArray(response.data.data) ? response.data.data : [] }
      } else if (Array.isArray(response.data)) {
        return { success: true, data: response.data }
      } else {
        return { success: true, data: [] }
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch projects' }
    }
  },

  // Get project by ID
  async getProjectById(id: string) {
    try {
      const response = await api.get(`/${id}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching project:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch project' }
    }
  },

  // Create new project
  async createProject(projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await api.post('/', projectData)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error creating project:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to create project' }
    }
  },

  // Update project
  async updateProject(id: string, projectData: Partial<Project>) {
    try {
      const response = await api.put(`/${id}`, projectData)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error updating project:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to update project' }
    }
  },

  // Delete project
  async deleteProject(id: string) {
    try {
      const response = await api.delete(`/${id}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error deleting project:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to delete project' }
    }
  },

  // Get project statistics
  async getProjectStats() {
    try {
      const response = await api.get('/stats')
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error fetching project stats:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to fetch project stats' }
    }
  },

  // Add member to project
  async addMemberToProject(projectId: string, memberData: Omit<ProjectMember, 'joinedDate' | 'isActive'>) {
    try {
      const response = await api.post(`/${projectId}/members`, memberData)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error adding member to project:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to add member to project' }
    }
  },

  // Remove member from project
  async removeMemberFromProject(projectId: string, memberId: string) {
    try {
      const response = await api.delete(`/${projectId}/members/${memberId}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Error removing member from project:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to remove member from project' }
    }
  },

  // Get available project types
  getAvailableTypes() {
    return ['saas', 'youtube', 'freelance', 'internal']
  },

  // Get available project statuses
  getAvailableStatuses() {
    return ['active', 'completed', 'planning', 'on_hold', 'cancelled']
  },

  // Get available project priorities
  getAvailablePriorities() {
    return ['urgent', 'high', 'medium', 'low']
  },

  // Get available project roles
  getAvailableRoles() {
    return ['Project Manager', 'Developer', 'Designer', 'QA Engineer', 'Business Analyst', 'Team Lead']
  },

  // Get sample projects for fallback
  getSampleProjects(): Project[] {
    return [
      {
        _id: '1',
        name: 'Mobile App Development',
        description: 'Develop a cross-platform mobile application for iOS and Android',
        status: 'active',
        priority: 'high',
        type: 'saas',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        budget: 50000,
        team: [
          { user: 'user1', role: 'Project Manager', joinedDate: '2024-01-01', isActive: true },
          { user: 'user2', role: 'Developer', joinedDate: '2024-01-15', isActive: true },
          { user: 'user3', role: 'Designer', joinedDate: '2024-02-01', isActive: true }
        ],
        progress: 65,
        client: 'TechCorp Inc.',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        _id: '2',
        name: 'YouTube Content Series',
        description: 'Create educational content series for YouTube channel',
        status: 'active',
        priority: 'medium',
        type: 'youtube',
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        budget: 25000,
        team: [
          { user: 'user4', role: 'Content Creator', joinedDate: '2024-02-01', isActive: true },
          { user: 'user5', role: 'Video Editor', joinedDate: '2024-02-15', isActive: true }
        ],
        progress: 30,
        client: 'Internal',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z'
      },
      {
        _id: '3',
        name: 'Website Redesign',
        description: 'Redesign company website with modern UI/UX',
        status: 'planning',
        priority: 'medium',
        type: 'internal',
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        budget: 15000,
        team: [
          { user: 'user6', role: 'Designer', joinedDate: '2024-03-01', isActive: true },
          { user: 'user7', role: 'Developer', joinedDate: '2024-03-15', isActive: true }
        ],
        progress: 10,
        client: 'Internal',
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z'
      },
      {
        _id: '4',
        name: 'E-commerce Platform',
        description: 'Build a full-featured e-commerce platform',
        status: 'completed',
        priority: 'high',
        type: 'freelance',
        startDate: '2023-09-01',
        endDate: '2024-01-31',
        budget: 75000,
        team: [
          { user: 'user8', role: 'Project Manager', joinedDate: '2023-09-01', isActive: true },
          { user: 'user9', role: 'Developer', joinedDate: '2023-09-15', isActive: true },
          { user: 'user10', role: 'QA Engineer', joinedDate: '2023-10-01', isActive: true }
        ],
        progress: 100,
        client: 'ShopDirect',
        createdAt: '2023-09-01T00:00:00Z',
        updatedAt: '2023-09-01T00:00:00Z'
      }
    ]
  },

  // Get sample project stats for fallback
  getSampleProjectStats(): ProjectStats {
    return {
      totalProjects: 4,
      activeProjects: 2,
      completedProjects: 1,
      totalBudget: 165000,
      averageProgress: 51.25,
      projectsByStatus: [
        { status: 'active', count: 2 },
        { status: 'completed', count: 1 },
        { status: 'planning', count: 1 }
      ],
      projectsByType: [
        { type: 'saas', count: 1 },
        { type: 'youtube', count: 1 },
        { type: 'internal', count: 1 },
        { type: 'freelance', count: 1 }
      ]
    }
  }
}

export default projectService 