import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const hrService = {
  // Employees
  getEmployees: async (filters = {}) => {
    try {
      const res = await api.get('/employees', { params: filters });
      return res.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch employees');
    }
  },

  getEmployeeById: async (id) => {
    try {
      const res = await api.get(`/employees/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch employee');
    }
  },

  createEmployee: async (employeeData) => {
    try {
      const res = await api.post('/employees', employeeData);
      return res.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw new Error(error.response?.data?.message || 'Failed to create employee');
    }
  },

  updateEmployee: async (id, employeeData) => {
    try {
      const res = await api.put(`/employees/${id}`, employeeData);
      return res.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new Error(error.response?.data?.message || 'Failed to update employee');
    }
  },

  // Attendance
  getAttendance: async (filters) => {
    try {
      const params = { startDate: filters.startDate, endDate: filters.endDate };
      if (filters.employeeId) params.employeeId = filters.employeeId;
      const res = await api.get('/attendance/range', { params });
      return res.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance');
    }
  },

  getAttendanceToday: async () => {
    try {
      const res = await api.get('/attendance/today/all');
      return res.data;
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch today attendance');
    }
  },

  getMyTodayAttendance: async () => {
    try {
      const res = await api.get('/attendance/today');
      return res.data;
    } catch (error) {
      console.error('Error fetching my today attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch my today attendance');
    }
  },

  getAttendanceByDate: async (date) => {
    try {
      const res = await api.get('/attendance/date', { params: { date } });
      return res.data;
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance by date');
    }
  },

  checkIn: async (payload = {}) => {
    try {
      const res = await api.post('/attendance/check-in', payload);
      return res.data;
    } catch (error) {
      console.error('Error checking in:', error);
      throw new Error(error.response?.data?.message || 'Failed to check in');
    }
  },

  checkOut: async (payload = {}) => {
    try {
      const res = await api.post('/attendance/check-out', payload);
      return res.data;
    } catch (error) {
      console.error('Error checking out:', error);
      throw new Error(error.response?.data?.message || 'Failed to check out');
    }
  },

  approveAttendance: async (id) => {
    try {
      const res = await api.put(`/attendance/${id}/approve`);
      return res.data;
    } catch (error) {
      console.error('Error approving attendance:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve attendance');
    }
  },

  // Leaves
  getLeaves: async (filters = {}) => {
    try {
      const res = await api.get('/leaves', { params: filters });
      return res.data;
    } catch (error) {
      console.error('Error fetching leaves:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch leaves');
    }
  },

  getLeaveRequests: async (filters = {}) => {
    return hrService.getLeaves(filters);
  },

  getLeaveBalance: async (employeeId) => {
    try {
      const endpoint = employeeId ? `/leaves/balance/${employeeId}` : '/leaves/balance';
      const res = await api.get(endpoint);
      return res.data;
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch leave balance');
    }
  },

  createLeave: async (leaveData) => {
    try {
      const res = await api.post('/leaves', leaveData);
      return res.data;
    } catch (error) {
      console.error('Error creating leave:', error);
      throw new Error(error.response?.data?.message || 'Failed to create leave');
    }
  },

  approveLeave: async (id, comments) => {
    try {
      const res = await api.put(`/leaves/${id}/approve`, { comments });
      return res.data;
    } catch (error) {
      console.error('Error approving leave:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve leave');
    }
  },

  rejectLeave: async (id, payload) => {
    try {
      const body = typeof payload === 'string' ? { rejectionReason: payload } : payload;
      const res = await api.put(`/leaves/${id}/reject`, body);
      return res.data;
    } catch (error) {
      console.error('Error rejecting leave:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject leave');
    }
  },

  cancelLeave: async (id) => {
    try {
      const res = await api.put(`/leaves/${id}/cancel`);
      return res.data;
    } catch (error) {
      console.error('Error cancelling leave:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel leave');
    }
  },

  // Payroll
  getPayroll: async (filters = {}) => {
    try {
      const res = await api.get('/payroll', { params: filters });
      return res.data;
    } catch (error) {
      console.error('Error fetching payroll:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payroll');
    }
  },

  getPayrollByMonth: async (month, year) => {
    try {
      const res = await api.get('/payroll', { params: { month, year } });
      return res.data;
    } catch (error) {
      console.error('Error fetching payroll by month:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payroll by month');
    }
  },

  getPayrollSummary: async (month, year) => {
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const res = await api.get('/payroll/summary', { params });
      return res.data;
    } catch (error) {
      console.error('Error fetching payroll summary:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payroll summary');
    }
  },

  generatePayroll: async (payload) => {
    try {
      const res = await api.post('/payroll/generate', payload);
      return res.data;
    } catch (error) {
      console.error('Error generating payroll:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate payroll');
    }
  },

  approvePayroll: async (id) => {
    try {
      const res = await api.put(`/payroll/${id}/approve`);
      return res.data;
    } catch (error) {
      console.error('Error approving payroll:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve payroll');
    }
  },

  markPayrollAsPaid: async (id, payload) => {
    try {
      const res = await api.put(`/payroll/${id}/mark-paid`, payload);
      return res.data;
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark payroll as paid');
    }
  },

  getPayrollStatistics: async () => {
    try {
      const res = await api.get('/payroll/statistics');
      return res.data;
    } catch (error) {
      console.error('Error fetching payroll statistics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payroll statistics');
    }
  },

  // HR Dashboard
  getHRStats: async () => {
    try {
      const res = await api.get('/hr/stats');
      return res.data;
    } catch (error) {
      console.error('Error fetching HR stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch HR stats');
    }
  },
};
