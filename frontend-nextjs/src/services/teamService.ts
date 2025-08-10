import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://creatorbase-backend.onrender.com/api'

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/teams`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
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

export interface TeamMember {
  user: string
  role: string
  joinedDate: string
  isActive: boolean
}

export interface Team {
  _id?: string
  name: string
  description: string
  department: string
  teamLead: string
  members: TeamMember[]
  status: 'active' | 'inactive' | 'archived'
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface TeamStats {
  totalTeams: number
  activeTeams: number
  totalMembers: number
  averageTeamSize: number
  teamsByDepartment: Array<{ department: string; count: number }>
}

export const teamService = {
  // Get all teams
  getTeams: async (params = {}): Promise<{ success: boolean; data: Team[] }> => {
    try {
      const response = await api.get('/', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching teams:', error)
      return { success: false, data: [] }
    }
  },

  // Get team by ID
  getTeamById: async (id: string): Promise<{ success: boolean; data: Team }> => {
    try {
      const response = await api.get(`/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching team:', error)
      return { success: false, data: {} as Team }
    }
  },

  // Create new team
  createTeam: async (teamData: Partial<Team>): Promise<{ success: boolean; data: Team }> => {
    try {
      const response = await api.post('/', teamData)
      return response.data
    } catch (error) {
      console.error('Error creating team:', error)
      return { success: false, data: {} as Team }
    }
  },

  // Update team
  updateTeam: async (id: string, teamData: Partial<Team>): Promise<{ success: boolean; data: Team }> => {
    try {
      const response = await api.put(`/${id}`, teamData)
      return response.data
    } catch (error) {
      console.error('Error updating team:', error)
      return { success: false, data: {} as Team }
    }
  },

  // Delete team
  deleteTeam: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting team:', error)
      return { success: false, message: 'Failed to delete team' }
    }
  },

  // Add member to team
  addMemberToTeam: async (teamId: string, userId: string, role: string): Promise<{ success: boolean; data: Team }> => {
    try {
      const response = await api.post(`/${teamId}/members`, { userId, role })
      return response.data
    } catch (error) {
      console.error('Error adding member to team:', error)
      return { success: false, data: {} as Team }
    }
  },

  // Remove member from team
  removeMemberFromTeam: async (teamId: string, userId: string): Promise<{ success: boolean; data: Team }> => {
    try {
      const response = await api.delete(`/${teamId}/members/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error removing member from team:', error)
      return { success: false, data: {} as Team }
    }
  },

  // Get teams by department
  getTeamsByDepartment: async (department: string): Promise<{ success: boolean; data: Team[] }> => {
    try {
      const response = await api.get(`/department/${department}`)
      return response.data
    } catch (error) {
      console.error('Error fetching teams by department:', error)
      return { success: false, data: [] }
    }
  },

  // Get my teams
  getMyTeams: async (): Promise<{ success: boolean; data: Team[] }> => {
    try {
      const response = await api.get('/my-teams')
      return response.data
    } catch (error) {
      console.error('Error fetching my teams:', error)
      return { success: false, data: [] }
    }
  },

  // Get team statistics
  getTeamStats: async (): Promise<{ success: boolean; data: TeamStats }> => {
    try {
      const response = await api.get('/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching team stats:', error)
      return { 
        success: false, 
        data: {
          totalTeams: 0,
          activeTeams: 0,
          totalMembers: 0,
          averageTeamSize: 0,
          teamsByDepartment: []
        }
      }
    }
  },

  // Get available departments
  getAvailableDepartments: (): string[] => {
    return [
      'engineering',
      'content',
      'marketing',
      'finance',
      'hr',
      'operations',
      'design'
    ]
  },

  // Get available team roles
  getAvailableRoles: (): string[] => {
    return [
      'Team Lead',
      'Senior Member',
      'Member',
      'Intern',
      'Consultant'
    ]
  },

  // Get department descriptions
  getDepartmentDescriptions: (): Record<string, string> => {
    return {
      engineering: 'Software development and technical teams',
      content: 'Content creation and media production',
      marketing: 'Marketing and promotional activities',
      finance: 'Financial management and accounting',
      hr: 'Human resources and recruitment',
      operations: 'Business operations and administration',
      design: 'Design and creative teams'
    }
  }
}

export default teamService 