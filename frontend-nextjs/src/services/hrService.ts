import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

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
  (error) => Promise.reject(error)
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
  employeeId?: string
  phone: string
  reportingManager?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  dateOfJoining: string
  dateOfExit?: string
  panNumber?: string
  aadharNumber?: string
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
    effectiveFrom?: string
  }
  leaveBalance?: {
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
  onboardingStatus?: {
    isCompleted: boolean
    completedSteps: Array<{
      step: string
      completedAt: string
      completedBy: string
    }>
    pendingSteps: string[]
  }
  offboardingStatus?: {
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
    user?: {
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
  isHalfDay?: boolean
  halfDayType?: 'first_half' | 'second_half'
  createdAt: string
  updatedAt: string
}

export interface Attendance {
  _id: string
  employee: {
    _id: string
    user?: {
      firstName: string
      lastName: string
    }
  }
  date: string
  checkIn?: { time: string; location?: string; ipAddress?: string }
  checkOut?: { time: string; location?: string; ipAddress?: string }
  totalHours?: number
  status?: 'present' | 'absent' | 'half_day' | 'leave'
  isApproved?: boolean
  approvedBy?: any
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
  basicSalary: number
  allowances?: Record<string, number>
  deductions?: Record<string, number>
  bonuses?: Record<string, number>
  overtime?: { hours: number; amount: number }
  leaves?: { totalDays: number; amount: number }
  grossSalary: number
  netSalary: number
  status: 'pending' | 'approved' | 'paid' | 'cancelled'
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
  department?: string
  status?: string
  workType?: string
  page?: number
  limit?: number
}

export const hrService = {
  // Employees
  getEmployees: async (filters: EmployeeFilters = {}): Promise<{ success: boolean; data: Employee[]; count: number }> => {
    try {
      const res = await api.get('/employees', { params: filters })
      return res.data
    } catch (error: any) {
      console.error('Error fetching employees:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch employees')
    }
  },

  getEmployeeById: async (id: string): Promise<{ success: boolean; data: Employee }> => {
    try {
      const res = await api.get(`/employees/${id}`)
      return res.data
    } catch (error: any) {
      console.error('Error fetching employee:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch employee')
    }
  },

  createEmployee: async (employeeData: Partial<Employee> & { userId: string }): Promise<{ success: boolean; data: Employee }> => {
    try {
      const res = await api.post('/employees', employeeData)
      return res.data
    } catch (error: any) {
      console.error('Error creating employee:', error)
      throw new Error(error.response?.data?.message || 'Failed to create employee')
    }
  },

  updateEmployee: async (id: string, employeeData: Partial<Employee>): Promise<{ success: boolean; data: Employee }> => {
    try {
      const res = await api.put(`/employees/${id}`, employeeData)
      return res.data
    } catch (error: any) {
      console.error('Error updating employee:', error)
      throw new Error(error.response?.data?.message || 'Failed to update employee')
    }
  },

  // Attendance
  getAttendance: async (filters: { employeeId?: string; startDate: string; endDate: string }): Promise<{ success: boolean; data: Attendance[]; count: number }> => {
    try {
      const params: any = { startDate: filters.startDate, endDate: filters.endDate }
      if (filters.employeeId) params.employeeId = filters.employeeId
      const res = await api.get('/attendance/range', { params })
      return res.data
    } catch (error: any) {
      console.error('Error fetching attendance:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance')
    }
  },

  getAttendanceToday: async (): Promise<{ success: boolean; data: Attendance[]; count: number }> => {
    try {
      const res = await api.get('/attendance/today/all')
      return res.data
    } catch (error: any) {
      console.error('Error fetching today attendance:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch today attendance')
    }
  },

  getMyTodayAttendance: async (): Promise<{ success: boolean; data: Attendance | null }> => {
    try {
      const res = await api.get('/attendance/today')
      return res.data
    } catch (error: any) {
      console.error('Error fetching my today attendance:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch my today attendance')
    }
  },

  checkIn: async (payload?: { location?: string; notes?: string }): Promise<{ success: boolean; data: Attendance; message?: string }> => {
    try {
      const res = await api.post('/attendance/check-in', payload || {})
      return res.data
    } catch (error: any) {
      console.error('Error checking in:', error)
      throw new Error(error.response?.data?.message || 'Failed to check in')
    }
  },

  checkOut: async (payload?: { location?: string; notes?: string }): Promise<{ success: boolean; data: Attendance; message?: string }> => {
    try {
      const res = await api.post('/attendance/check-out', payload || {})
      return res.data
    } catch (error: any) {
      console.error('Error checking out:', error)
      throw new Error(error.response?.data?.message || 'Failed to check out')
    }
  },

  getAttendanceByDate: async (date: string): Promise<{ success: boolean; data: Attendance[]; count: number }> => {
    try {
      const res = await api.get('/attendance/date', { params: { date } })
      return res.data
    } catch (error: any) {
      console.error('Error fetching attendance by date:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance by date')
    }
  },

  approveAttendance: async (id: string): Promise<{ success: boolean; data: Attendance }> => {
    try {
      const res = await api.put(`/attendance/${id}/approve`)
      return res.data
    } catch (error: any) {
      console.error('Error approving attendance:', error)
      throw new Error(error.response?.data?.message || 'Failed to approve attendance')
    }
  },

  // Leaves
  getLeaves: async (filters: { status?: string; leaveType?: string; employeeId?: string } = {}): Promise<{ success: boolean; data: Leave[]; count: number }> => {
    try {
      const res = await api.get('/leaves', { params: filters })
      return res.data
    } catch (error: any) {
      console.error('Error fetching leaves:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch leaves')
    }
  },

  // Alias for getLeaves for compatibility
  getLeaveRequests: async (filters: { status?: string; leaveType?: string; employeeId?: string } = {}): Promise<{ success: boolean; data: Leave[]; count: number }> => {
    return hrService.getLeaves(filters)
  },

  getLeaveBalance: async (employeeId?: string): Promise<{ success: boolean; data: any }> => {
    try {
      const endpoint = employeeId ? `/leaves/balance/${employeeId}` : '/leaves/balance'
      const res = await api.get(endpoint)
      return res.data
    } catch (error: any) {
      console.error('Error fetching leave balance:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch leave balance')
    }
  },

  createLeave: async (leaveData: Partial<Leave>): Promise<{ success: boolean; data: Leave }> => {
    try {
      const res = await api.post('/leaves', leaveData)
      return res.data
    } catch (error: any) {
      console.error('Error creating leave:', error)
      throw new Error(error.response?.data?.message || 'Failed to create leave')
    }
  },

  approveLeave: async (id: string, comments?: string): Promise<{ success: boolean; data: Leave }> => {
    try {
      const res = await api.put(`/leaves/${id}/approve`, { comments })
      return res.data
    } catch (error: any) {
      console.error('Error approving leave:', error)
      throw new Error(error.response?.data?.message || 'Failed to approve leave')
    }
  },

  rejectLeave: async (id: string, payload: { rejectionReason?: string } | string): Promise<{ success: boolean; data: Leave }> => {
    try {
      const body = typeof payload === 'string' ? { rejectionReason: payload } : payload
      const res = await api.put(`/leaves/${id}/reject`, body)
      return res.data
    } catch (error: any) {
      console.error('Error rejecting leave:', error)
      throw new Error(error.response?.data?.message || 'Failed to reject leave')
    }
  },

  cancelLeave: async (id: string): Promise<{ success: boolean; data: Leave }> => {
    try {
      const res = await api.put(`/leaves/${id}/cancel`)
      return res.data
    } catch (error: any) {
      console.error('Error cancelling leave:', error)
      throw new Error(error.response?.data?.message || 'Failed to cancel leave')
    }
  },

  // Payroll
  getPayroll: async (filters: { month?: number; year?: number; employeeId?: string; status?: string } = {}): Promise<{ success: boolean; data: Payroll[]; count: number }> => {
    try {
      const res = await api.get('/payroll', { params: filters })
      return res.data
    } catch (error: any) {
      console.error('Error fetching payroll:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch payroll')
    }
  },

  generatePayroll: async (payload: {
    employeeId?: string
    month: number
    year: number
    allowances?: Record<string, number>
    deductions?: Record<string, number>
    bonuses?: Record<string, number>
    remarks?: string
  }): Promise<{ success: boolean; data: Payroll | Payroll[] }> => {
    try {
      const res = await api.post('/payroll/generate', payload)
      return res.data
    } catch (error: any) {
      console.error('Error generating payroll:', error)
      throw new Error(error.response?.data?.message || 'Failed to generate payroll')
    }
  },

  getPayrollByMonth: async (month: number, year: number): Promise<{ success: boolean; data: Payroll[]; count: number }> => {
    try {
      const res = await api.get('/payroll', { params: { month, year } })
      return res.data
    } catch (error: any) {
      console.error('Error fetching payroll by month:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch payroll by month')
    }
  },

  getPayrollSummary: async (month?: number, year?: number): Promise<{ success: boolean; data: any }> => {
    try {
      const params: any = {}
      if (month) params.month = month
      if (year) params.year = year
      const res = await api.get('/payroll/summary', { params })
      return res.data
    } catch (error: any) {
      console.error('Error fetching payroll summary:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch payroll summary')
    }
  },

  approvePayroll: async (id: string): Promise<{ success: boolean; data: Payroll }> => {
    try {
      const res = await api.put(`/payroll/${id}/approve`)
      return res.data
    } catch (error: any) {
      console.error('Error approving payroll:', error)
      throw new Error(error.response?.data?.message || 'Failed to approve payroll')
    }
  },

  markPayrollAsPaid: async (
    id: string,
    payload: { paymentDate: string; paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'online'; transactionId?: string }
  ): Promise<{ success: boolean; data: Payroll }> => {
    try {
      const res = await api.put(`/payroll/${id}/mark-paid`, payload)
      return res.data
    } catch (error: any) {
      console.error('Error marking payroll as paid:', error)
      throw new Error(error.response?.data?.message || 'Failed to mark payroll as paid')
    }
  },

  getPayrollStatistics: async (): Promise<{ success: boolean; data: any }> => {
    try {
      const res = await api.get('/payroll/statistics')
      return res.data
    } catch (error: any) {
      console.error('Error fetching payroll statistics:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch payroll statistics')
    }
  },

  getDepartmentPayrollStatistics: async (): Promise<{ success: boolean; data: any }> => {
    try {
      const res = await api.get('/payroll/department-statistics')
      return res.data
    } catch (error: any) {
      console.error('Error fetching department payroll statistics:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch department payroll statistics')
    }
  },

  // HR Dashboard
  getHRStats: async (): Promise<{ success: boolean; data: HRStats }> => {
    try {
      const res = await api.get('/hr/stats')
      return res.data
    } catch (error: any) {
      console.error('Error fetching HR stats:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch HR stats')
    }
  },
}
