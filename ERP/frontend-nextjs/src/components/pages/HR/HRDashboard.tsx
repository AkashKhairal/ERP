'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle,
  AlertTriangle,
  Plus,
  Download,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Search
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChartComponent, BarChartComponent } from '@/components/ui/charts'
import { useAuth } from '@/context/AuthContext'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import { hrService, type Attendance, type Employee, type HRStats, type Leave, type Payroll } from '@/services/hrService'

const HRDashboard = () => {
  const { logActivity, user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Permissions
  const canManage = useMemo(() => {
    const roleNames = (user?.roles || []).map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
    const normalized = roleNames.map((r: string) => r.toLowerCase())
    return normalized.includes('admin') || normalized.includes('hr') || normalized.includes('hr admin') || normalized.includes('hr_admin')
  }, [user])

  // Stats
  const [stats, setStats] = useState<HRStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Employees
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeesCount, setEmployeesCount] = useState(0)
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [employeesError, setEmployeesError] = useState<string | null>(null)
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  // Leaves
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [leavesLoading, setLeavesLoading] = useState(false)
  const [leavesError, setLeavesError] = useState<string | null>(null)

  // Attendance
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)

  // Payroll
  const [payroll, setPayroll] = useState<Payroll[]>([])
  const [payrollLoading, setPayrollLoading] = useState(false)
  const [payrollError, setPayrollError] = useState<string | null>(null)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'leaves', label: 'Leaves', icon: Clock },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
  ]

  // Derived charts data
  const attendanceChartData = useMemo(() => {
    const map: Record<string, { name: string; present: number; absent: number; late: number }> = {}
    attendance.forEach((a) => {
      const dayLabel = new Date(a.date).toLocaleDateString(undefined, { weekday: 'short' })
      if (!map[dayLabel]) map[dayLabel] = { name: dayLabel, present: 0, absent: 0, late: 0 }
      if (a.status === 'present') map[dayLabel].present += 1
      if (a.status === 'absent') map[dayLabel].absent += 1
      if (a.status === 'half_day') map[dayLabel].late += 1
    })
    return Object.values(map)
  }, [attendance])

  // Loaders
  const loadStats = async () => {
    try {
      setStatsLoading(true)
      setStatsError(null)
      const res = await hrService.getHRStats()
      setStats(res.data)
    } catch (e: any) {
      setStatsError(e.message || 'Failed to load stats')
    } finally {
      setStatsLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true)
      setEmployeesError(null)
      const filters: any = { page, limit }
      if (searchTerm) filters.search = searchTerm
      if (departmentFilter !== 'all') filters.department = departmentFilter
      if (statusFilter !== 'all') filters.status = statusFilter
      const res = await hrService.getEmployees(filters)
      setEmployees(res.data)
      setEmployeesCount(res.count)
    } catch (e: any) {
      setEmployeesError(e.message || 'Failed to load employees')
    } finally {
      setEmployeesLoading(false)
    }
  }

  const loadLeaves = async () => {
    try {
      setLeavesLoading(true)
      setLeavesError(null)
      const res = await hrService.getLeaves({ status: 'pending' })
      setLeaves(res.data)
    } catch (e: any) {
      setLeavesError(e.message || 'Failed to load leaves')
    } finally {
      setLeavesLoading(false)
    }
  }

  const loadAttendance = async () => {
    try {
      setAttendanceLoading(true)
      setAttendanceError(null)
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 7)
      const res = await hrService.getAttendance({ startDate: start.toISOString(), endDate: end.toISOString() })
      setAttendance(res.data)
    } catch (e: any) {
      setAttendanceError(e.message || 'Failed to load attendance')
    } finally {
      setAttendanceLoading(false)
    }
  }

  const loadPayroll = async () => {
    try {
      setPayrollLoading(true)
      setPayrollError(null)
      const today = new Date()
      const res = await hrService.getPayroll({ month: today.getMonth() + 1, year: today.getFullYear() })
      setPayroll(res.data)
    } catch (e: any) {
      setPayrollError(e.message || 'Failed to load payroll')
    } finally {
      setPayrollLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    loadEmployees()
    loadLeaves()
    loadAttendance()
    loadPayroll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const id = setTimeout(() => {
      loadEmployees()
    }, 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, departmentFilter, statusFilter, page])

  useEffect(() => {
    logActivity('HR Dashboard Visit', 'User accessed HR management dashboard')
  }, [logActivity])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'exited':
        return 'bg-gray-200 text-gray-800'
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-muted text-foreground'
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.totalEmployees ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Active: {statsLoading ? '...' : stats?.activeEmployees ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.activeEmployees ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats && stats.totalEmployees ? `${((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1)}% active rate` : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.pendingLeaves ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Require approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '...' : formatCurrency(stats?.totalSalary ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly payroll
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Weekly attendance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent data={attendanceChartData} height={300} />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
              <CardDescription>Employees by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats && stats.departmentBreakdown ? (
                  Object.entries(stats.departmentBreakdown).map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{dept}</span>
                      <span className="text-sm font-medium">{count as number}</span>
                </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No data</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderEmployeesTab = () => (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="exited">Exited</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        {canManage && (
          <Button onClick={() => { setEditingEmployee(null); setIsEmployeeDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
        )}
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Manage your team members</CardDescription>
        </CardHeader>
        <CardContent>
          {employeesLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {employeesError && <div className="text-sm text-red-600">{employeesError}</div>}
          {!employeesLoading && !employeesError && (
          <div className="space-y-4">
              {employees.map((emp) => (
                <div key={emp._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                      src={emp.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.user?.firstName || '')}+${encodeURIComponent(emp.user?.lastName || '')}`}
                      alt={`${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                      <h3 className="font-medium">{emp.user?.firstName} {emp.user?.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{emp.user?.position || emp.user?.role}</p>
                      <p className="text-sm text-muted-foreground">{emp.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(emp.status)}>
                      {emp.status}
                  </Badge>
                    <Button variant="outline" size="sm" onClick={() => toast('View details coming soon')}>
                    <Eye className="h-4 w-4" />
                  </Button>
                    {canManage && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => { setEditingEmployee(emp); setIsEmployeeDialogOpen(true) }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                        <Button variant="outline" size="sm" onClick={async () => {
                          try {
                            await hrService.deleteEmployee(emp._id)
                            toast.success('Employee deleted')
                            loadEmployees()
                          } catch (e: any) {
                            toast.error(e.message || 'Failed to delete')
                          }
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                </div>
              </div>
            ))}
              {/* Pagination */}
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                <div className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(employeesCount / limit))}</div>
                <Button variant="outline" size="sm" disabled={page >= Math.ceil(employeesCount / limit)} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Employee Dialog */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
            <DialogDescription>Fill in the employee details below.</DialogDescription>
          </DialogHeader>
          <EmployeeForm
            employee={editingEmployee}
            onCancel={() => setIsEmployeeDialogOpen(false)}
            onSaved={() => { setIsEmployeeDialogOpen(false); loadEmployees() }}
          />
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </div>
  )

  const renderAttendanceTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Tracking</CardTitle>
          <CardDescription>Monitor daily attendance and time tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {attendanceLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {attendanceError && <div className="text-sm text-red-600">{attendanceError}</div>}
          {!attendanceLoading && !attendanceError && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{attendance.filter(a => a.status === 'present').length}</div>
                  <div className="text-sm text-muted-foreground">Present (last 7 days)</div>
              </div>
              <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{attendance.filter(a => a.status === 'absent').length}</div>
                  <div className="text-sm text-muted-foreground">Absent (last 7 days)</div>
              </div>
              <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{attendance.filter(a => a.status === 'half_day').length}</div>
                  <div className="text-sm text-muted-foreground">Half-day (last 7 days)</div>
              </div>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderLeavesTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Leave Management</CardTitle>
          <CardDescription>Approve and manage leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {leavesLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {leavesError && <div className="text-sm text-red-600">{leavesError}</div>}
          {!leavesLoading && !leavesError && (
          <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <h3 className="font-medium">{leave.employee?.user?.firstName} {leave.employee?.user?.lastName}</h3>
                  <p className="text-sm text-muted-foreground">
                      {leave.leaveType} - {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{leave.reason}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(leave.status)}>
                    {leave.status}
                  </Badge>
                    {leave.status === 'pending' && canManage && (
                    <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            await hrService.updateLeaveStatus(leave._id, 'approved')
                            toast.success('Leave approved')
                            loadLeaves()
                          } catch (e: any) {
                            toast.error(e.message || 'Failed to approve leave')
                          }
                        }}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            await hrService.updateLeaveStatus(leave._id, 'rejected')
                            toast.success('Leave rejected')
                            loadLeaves()
                          } catch (e: any) {
                            toast.error(e.message || 'Failed to reject leave')
                          }
                        }}>
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderPayrollTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Management</CardTitle>
          <CardDescription>Manage salaries and payroll processing</CardDescription>
        </CardHeader>
        <CardContent>
          {payrollLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {payrollError && <div className="text-sm text-red-600">{payrollError}</div>}
          {!payrollLoading && !payrollError && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(payroll.reduce((sum, p) => sum + (p.totalSalary || 0), 0))}</div>
                <div className="text-sm text-muted-foreground">Total Monthly Payroll</div>
              </div>
              <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(payroll.length ? payroll.reduce((sum, p) => sum + (p.totalSalary || 0), 0) / payroll.length : 0)}</div>
                <div className="text-sm text-muted-foreground">Average Salary</div>
              </div>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab()
      case 'employees':
        return renderEmployeesTab()
      case 'attendance':
        return renderAttendanceTab()
      case 'leaves':
        return renderLeavesTab()
      case 'payroll':
        return renderPayrollTab()
      default:
        return renderOverviewTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Management</h1>
          <p className="text-muted-foreground">
            Manage employees, attendance, leaves, and payroll
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={async () => {
            try {
              const blob = await hrService.exportReport('employees')
              const url = window.URL.createObjectURL(new Blob([blob]))
              const link = document.createElement('a')
              link.href = url
              link.setAttribute('download', `employees-report-${Date.now()}.csv`)
              document.body.appendChild(link)
              link.click()
              link.parentNode?.removeChild(link)
            } catch (e: any) {
              toast.error('Failed to export')
            }
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export Employees
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HRDashboard 

// Employee Form Component (inline to keep module self-contained)
interface EmployeeFormProps {
  employee: Employee | null
  onSaved: () => void
  onCancel: () => void
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSaved, onCancel }) => {
  const isEdit = Boolean(employee)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: employee?.user?.firstName || '',
    lastName: employee?.user?.lastName || '',
    email: employee?.user?.email || '',
    department: employee?.user?.department || '',
    position: employee?.user?.position || '',
    phone: employee?.phone || '',
    status: employee?.status || 'active',
    workType: employee?.workType || 'full_time',
    dateOfJoining: employee?.dateOfJoining ? employee.dateOfJoining.substring(0, 10) : '',
    salaryBase: employee?.salary?.base?.toString() || '',
    salaryCurrency: employee?.salary?.currency || 'USD',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const payload: any = {
        user: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          department: form.department,
          position: form.position,
        },
        phone: form.phone,
        status: form.status,
        workType: form.workType,
        dateOfJoining: form.dateOfJoining,
        salary: {
          base: Number(form.salaryBase) || 0,
          currency: form.salaryCurrency,
          effectiveFrom: form.dateOfJoining || new Date().toISOString(),
        },
      }
      if (isEdit && employee) {
        await hrService.updateEmployee(employee._id, payload)
        toast.success('Employee updated')
      } else {
        await hrService.createEmployee(payload)
        toast.success('Employee created')
      }
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Failed to save employee')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm">First Name</label>
          <Input name="firstName" value={form.firstName} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm">Last Name</label>
          <Input name="lastName" value={form.lastName} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm">Email</label>
          <Input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm">Phone</label>
          <Input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm">Department</label>
          <Input name="department" value={form.department} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm">Position</label>
          <Input name="position" value={form.position} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm">Status</label>
          <Input name="status" value={form.status} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm">Work Type</label>
          <Input name="workType" value={form.workType} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm">Date of Joining</label>
          <Input type="date" name="dateOfJoining" value={form.dateOfJoining} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm">Salary (Base)</label>
          <Input type="number" name="salaryBase" value={form.salaryBase} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm">Currency</label>
          <Input name="salaryCurrency" value={form.salaryCurrency} onChange={handleChange} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  )
}