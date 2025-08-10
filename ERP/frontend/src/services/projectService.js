import api from './authService';

const PROJECT_API_URL = '/projects';

export const projectService = {
  // Get all projects with filters
  getAllProjects: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`${PROJECT_API_URL}?${params.toString()}`);
    return response;
  },

  // Get project by ID
  getProjectById: async (projectId) => {
    const response = await api.get(`${PROJECT_API_URL}/${projectId}`);
    return response;
  },

  // Create new project
  createProject: async (projectData) => {
    const response = await api.post(PROJECT_API_URL, projectData);
    return response;
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`${PROJECT_API_URL}/${projectId}`, projectData);
    return response;
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`${PROJECT_API_URL}/${projectId}`);
    return response;
  },

  // Get my projects
  getMyProjects: async () => {
    const response = await api.get(`${PROJECT_API_URL}/my-projects`);
    return response;
  },

  // Get overdue projects
  getOverdueProjects: async () => {
    const response = await api.get(`${PROJECT_API_URL}/overdue`);
    return response;
  },

  // Get projects by type
  getProjectsByType: async (type) => {
    const response = await api.get(`${PROJECT_API_URL}/type/${type}`);
    return response;
  },

  // Update project progress
  updateProjectProgress: async (projectId, progress) => {
    const response = await api.put(`${PROJECT_API_URL}/${projectId}/progress`, { progress });
    return response;
  },

  // Add team member to project
  addTeamMember: async (projectId, userId, role) => {
    const response = await api.post(`${PROJECT_API_URL}/${projectId}/team-members`, {
      userId,
      role
    });
    return response;
  },

  // Remove team member from project
  removeTeamMember: async (projectId, userId) => {
    const response = await api.delete(`${PROJECT_API_URL}/${projectId}/team-members/${userId}`);
    return response;
  },

  // Get project statistics
  getProjectStats: async () => {
    try {
      const [allProjects, myProjects, overdueProjects] = await Promise.all([
        projectService.getAllProjects(),
        projectService.getMyProjects(),
        projectService.getOverdueProjects()
      ]);

      const stats = {
        totalProjects: allProjects.data?.data?.length || 0,
        myProjects: myProjects.data?.data?.length || 0,
        overdueProjects: overdueProjects.data?.data?.length || 0,
        activeProjects: allProjects.data?.data?.filter(p => p.status === 'active').length || 0,
        completedProjects: allProjects.data?.data?.filter(p => p.status === 'completed').length || 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching project stats:', error);
      return { success: false, error: error.message };
    }
  }
};

export default projectService; 