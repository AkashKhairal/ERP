import api from './authService';

const USER_API_URL = '/users';

export const userService = {
  // Get all users with filters
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.department) params.append('department', filters.department);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.role) params.append('role', filters.role);
    
    const response = await api.get(`${USER_API_URL}?${params.toString()}`);
    return response;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`${USER_API_URL}/${userId}`);
    return response;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post(USER_API_URL, userData);
    return response;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await api.put(`${USER_API_URL}/${userId}`, userData);
    return response;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`${USER_API_URL}/${userId}`);
    return response;
  },

  // Assign roles to user
  assignRoles: async (userId, roleIds) => {
    const response = await api.post(`${USER_API_URL}/${userId}/roles`, { roleIds });
    return response;
  },

  // Get user permissions
  getUserPermissions: async (userId) => {
    const response = await api.get(`${USER_API_URL}/${userId}/permissions`);
    return response;
  },

  // Export users
  exportUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.department) params.append('department', filters.department);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.role) params.append('role', filters.role);
    
    const response = await api.get(`${USER_API_URL}/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response;
  },

  // Get user profile (current user)
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response;
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await userService.getAllUsers({ limit: 1000 });
      
      if (response.data?.success) {
        const users = response.data.data || [];
        const stats = {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          inactiveUsers: users.filter(u => !u.isActive).length,
          newUsersThisMonth: users.filter(u => {
            const joinDate = new Date(u.createdAt);
            const now = new Date();
            return joinDate.getMonth() === now.getMonth() && 
                   joinDate.getFullYear() === now.getFullYear();
          }).length,
          departments: users.reduce((acc, user) => {
            acc[user.department] = (acc[user.department] || 0) + 1;
            return acc;
          }, {})
        };
        
        return { success: true, data: stats };
      }
      
      return { success: false, error: 'Failed to fetch users' };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { success: false, error: error.message };
    }
  }
};

export default userService; 