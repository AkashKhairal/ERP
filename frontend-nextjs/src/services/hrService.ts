import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://creatorbase-backend.onrender.com/api'

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}`,
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

export interface Employee {
  _id: string
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
    role: string
    department: string
    position: string
    avatar?: string
  }
  employeeId: string
  phone: string
  reportingManager?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  dateOfJoining: string
  dateOfExit?: string
  panNumber: string
  aadharNumber: string
  linkedin?: string
  skills: string[]
  profilePicture?: {
    filename: string
    path: string
  }
  status: 'active' | 'exited' | 'on_leave' | 'suspended'
  workType: 'full_time' | 'freelancer' | 'intern' | 'contract'
  salary: {
    base: number
    currency: string
    effectiveFrom: string
  }
  leaveBalance: {
    sick: number
    casual: number
    annual: number
    unpaid: number
  }
  address?: {
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
    email: string
  }
  bankDetails?: {
    accountNumber: string
    ifscCode: string
    bankName: string
    branch: string
  }
  onboardingStatus: {
    isCompleted: boolean
    completedSteps: Array<{
      step: string
      completedAt: string
      completedBy: string
    }>
    pendingSteps: string[]
  }
  offboardingStatus: {
    isInitiated: boolean
    initiatedAt?: string
    exitDate?: string
    completedSteps: Array<{
      step: string
      completedAt: string
      completedBy: string
    }>
    pendingSteps: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface Leave {
  _id: string
  employee: {
    _id: string
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  leaveType: 'sick' | 'casual' | 'annual' | 'unpaid' | 'maternity' | 'paternity' | 'bereavement'
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvedBy?: {
    _id: string
    firstName: string
    lastName: string
  }
  approvedAt?: string
  rejectionReason?: string
  isHalfDay: boolean
  halfDayType?: 'first_half' | 'second_half'
  createdAt: string
  updatedAt: string
}

export interface Attendance {
  _id: string
  employee: {
    _id: string
    user: {
      firstName: string
      lastName: string
    }
  }
  date: string
  checkIn: string
  checkOut?: string
  totalHours?: number
  status: 'present' | 'absent' | 'half_day' | 'leave'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Payroll {
  _id: string
  employee: {
    _id: string
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }
  month: number
  year: number
  baseSalary: number
  allowances: number
  deductions: number
  bonus: number
  totalSalary: number
  status: 'pending' | 'paid' | 'cancelled'
  paidAt?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface HRStats {
  totalEmployees: number
  activeEmployees: number
  pendingLeaves: number
  totalSalary: number
  averageSalary: number
  departmentBreakdown: Record<string, number>
  leaveTypeBreakdown: Record<string, number>
}

export interface EmployeeFilters {
  search?: string
  department?: string
  status?: string
  workType?: string
  page?: number
  limit?: number
}

export const hrService = {
  // Employee Management
  getEmployees: async (filters: EmployeeFilters = {}): Promise<{ success: boolean; data: Employee[]; count: number }> => {
    try {
      const response = await api.get('/employees', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Error fetching employees:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch employees')
    }
  },

  getEmployeeById: async (id: string): Promise<{ success: boolean; data: Employee }> => {
    try {
      const response = await api.get(`/employees/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching employee:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch employee')
    }
  },

  createEmployee: async (employeeData: Partial<Employee>): Promise<{ success: boolean; data: Employee }> => {
    try {
      const response = await api.post('/employees', employeeData)
      return response.data
    } catch (error: any) {
      console.error('Error creating employee:', error)
      throw new Error(error.response?.data?.message || 'Failed to create employee')
    }
  },

  updateEmployee: async (id: string, employeeData: Partial<Employee>): Promise<{ success: boolean; data: Employee }> => {
    try {
      const response = await api.put(`/employees/${id}`, employeeData)
      return response.data
    } catch (error: any) {
      console.error('Error updating employee:', error)
      throw new Error(error.response?.data?.message || 'Failed to update employee')
    }
  },

  deleteEmployee: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/employees/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error deleting employee:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete employee')
    }
  },

  // Leave Management
  getLeaves: async (filters: { status?: string; employee?: string; startDate?: string; endDate?: string } = {}): Promise<{ success: boolean; data: Leave[]; count: number }> => {
    try {
      const response = await api.get('/leaves', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Error fetching leaves:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch leaves')
    }
  },

  createLeave: async (leaveData: Partial<Leave>): Promise<{ success: boolean; data: Leave }> => {
    try {
      const response = await api.post('/leaves', leaveData)
      return response.data
    } catch (error: any) {
      console.error('Error creating leave:', error)
      throw new Error(error.response?.data?.message || 'Failed to create leave')
    }
  },

  updateLeaveStatus: async (id: string, status: string, approvedBy?: string, rejectionReason?: string): Promise<{ success: boolean; data: Leave }> => {
    try {
      const response = await api.patch(`/leaves/${id}/status`, { status, approvedBy, rejectionReason })
      return response.data
    } catch (error: any) {
      console.error('Error updating leave status:', error)
      throw new Error(error.response?.data?.message || 'Failed to update leave status')
    }
  },

  // Attendance Management
  getAttendance: async (filters: { employee?: string; startDate?: string; endDate?: string } = {}): Promise<{ success: boolean; data: Attendance[]; count: number }> => {
    try {
      const response = await api.get('/attendance', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Error fetching attendance:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance')
    }
  },

  checkIn: async (employeeId: string): Promise<{ success: boolean; data: Attendance }> => {
    try {
      const response = await api.post('/attendance/checkin', { employeeId })
      return response.data
    } catch (error: any) {
      console.error('Error checking in:', error)
      throw new Error(error.response?.data?.message || 'Failed to check in')
    }
  },

  checkOut: async (employeeId: string): Promise<{ success: boolean; data: Attendance }> => {
    try {
      const response = await api.post('/attendance/checkout', { employeeId })
      return response.data
    } catch (error: any) {
      console.error('Error checking out:', error)
      throw new Error(error.response?.data?.message || 'Failed to check out')
    }
  },

  // Payroll Management
  getPayroll: async (filters: { month?: number; year?: number; employee?: string } = {}): Promise<{ success: boolean; data: Payroll[]; count: number }> => {
    try {
      const response = await api.get('/payroll', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Error fetching payroll:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch payroll')
    }
  },

  // HR Dashboard Stats
  getHRStats: async (): Promise<{ success: boolean; data: HRStats }> => {
    try {
      const response = await api.get('/hr/stats')
      return response.data
    } catch (error: any) {
      console.error('Error fetching HR stats:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch HR stats')
    }
  },

  // Export Reports
  exportReport: async (type: 'employees' | 'attendance' | 'leaves' | 'payroll', filters: any = {}): Promise<Blob> => {
    try {
      const response = await api.get(`/hr/export/${type}`, { 
        params: filters,
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      console.error('Error exporting report:', error)
      throw new Error('Failed to export report')
    }
  }
}
