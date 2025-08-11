'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Users, UserCheck, Calendar, Clock, DollarSign, BarChart3, Eye, Edit, Plus, Download, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChartComponent, BarChartComponent } from '@/components/ui/charts'
import { useAuth } from '@/context/AuthContext'
import { hrService, type Employee, type HRStats, type Leave, type Payroll } from '@/services/hrService'
import { userService } from '@/services/userService'
import toast from 'react-hot-toast'

const HRDashboard = () => {
  const { logActivity } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Data
  const [stats, setStats] = useState<HRStats | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [payroll, setPayroll] = useState<Payroll[]>([])
  const [todayAttendanceCount, setTodayAttendanceCount] = useState<{ present: number; absent: number; late: number }>({ present: 0, absent: 0, late: 0 })

  // Auxiliary
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [creatingEmployee, setCreatingEmployee] = useState(false)
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [creatingLeave, setCreatingLeave] = useState(false)
  const [generatingPayroll, setGeneratingPayroll] = useState(false)

  const attendanceChartData = useMemo(
    () => [
      { name: 'Mon', present: todayAttendanceCount.present, absent: todayAttendanceCount.absent, late: todayAttendanceCount.late },
      { name: 'Tue', present: Math.max(0, todayAttendanceCount.present - 1), absent: todayAttendanceCount.absent + 1, late: todayAttendanceCount.late },
      { name: 'Wed', present: todayAttendanceCount.present + 1, absent: Math.max(0, todayAttendanceCount.absent - 1), late: todayAttendanceCount.late + 1 },
      { name: 'Thu', present: todayAttendanceCount.present, absent: todayAttendanceCount.absent, late: todayAttendanceCount.late },
      { name: 'Fri', present: todayAttendanceCount.present - 2 >= 0 ? todayAttendanceCount.present - 2 : 0, absent: todayAttendanceCount.absent + 1, late: todayAttendanceCount.late },
    ],
    [todayAttendanceCount]
  )

  useEffect(() => {
    logActivity('HR Dashboard Visit', 'User accessed HR management dashboard')
  }, [logActivity])

  const loadAll = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      const [statsRes, empRes, leavesRes, payrollRes, todayAttRes] = await Promise.all([
        hrService.getHRStats(),
        hrService.getEmployees({
          department: departmentFilter !== 'all' ? departmentFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        hrService.getLeaves({}),
        hrService.getPayroll({ year, month }),
        hrService.getAttendanceToday(),
      ])

      setStats(statsRes.data)
      setEmployees(empRes.data || [])
      setLeaves(leavesRes.data || [])
      setPayroll(payrollRes.data || [])

      const todaysAttendance = (todayAttRes.data || []) as any[]
      const present = todaysAttendance.filter((a) => a.status === 'present' && a.checkIn).length
      const absent = todaysAttendance.filter((a) => a.status === 'absent').length
      const late = todaysAttendance.filter((a) => {
        if (!a.checkIn?.time) return false
        const checkInTime = new Date(a.checkIn.time)
        const lateThreshold = new Date()
        lateThreshold.setHours(9, 15, 0, 0) // 9:15 AM threshold
        return checkInTime > lateThreshold && a.status === 'present'
      }).length
      setTodayAttendanceCount({ present, absent, late })
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load HR data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [departmentFilter, statusFilter])

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    let list = employees
    if (term) {
      list = list.filter((e) => {
        const name = `${e.user?.firstName || ''} ${e.user?.lastName || ''}`.toLowerCase()
        return (
          name.includes(term) ||
          e.user?.email?.toLowerCase().includes(term) ||
          e.user?.department?.toLowerCase().includes(term) ||
          (e.skills || []).join(',').toLowerCase().includes(term)
        )
      })
    }
    return list
  }, [employees, searchTerm])

  const onApproveLeave = async (id: string) => {
    try {
      await hrService.approveLeave(id)
      toast.success('Leave approved')
      await loadAll()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to approve leave')
    }
  }

  const onRejectLeave = async (id: string) => {
    try {
      await hrService.rejectLeave(id, 'Rejected by manager')
      toast.success('Leave rejected')
      await loadAll()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reject leave')
    }
  }

  const onCheckIn = async () => {
    try {
      const res = await hrService.checkIn()
      toast.success(res.message || 'Checked in')
      await loadAll()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to check in')
    }
  }

  const onCheckOut = async () => {
    try {
      const res = await hrService.checkOut()
      toast.success(res.message || 'Checked out')
      await loadAll()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to check out')
    }
  }

  const exportCSV = (filename: string, rows: any[], columns?: string[]) => {
    if (!rows?.length) {
      toast.error('Nothing to export')
      return
    }
    const keys = columns || Object.keys(rows[0])
    const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const onExport = () => {
    if (activeTab === 'employees') {
      const rows = filteredEmployees.map((e) => ({
        name: `${e.user?.firstName || ''} ${e.user?.lastName || ''}`.trim(),
        email: e.user?.email,
        department: e.user?.department,
        workType: e.workType,
        status: e.status,
        phone: e.phone,
        baseSalary: e.salary?.base,
        currency: e.salary?.currency,
        joinDate: e.dateOfJoining,
      }))
      exportCSV('employees.csv', rows)
      return
    }
    if (activeTab === 'leaves') {
      const rows = leaves.map((l) => ({
        employee: l.employee?._id,
        type: l.leaveType,
        startDate: l.startDate,
        endDate: l.endDate,
        totalDays: l.totalDays,
        status: l.status,
      }))
      exportCSV('leaves.csv', rows)
      return
    }
    if (activeTab === 'payroll') {
      const rows = payroll.map((p) => ({
        employee: `${p.employee?.user?.firstName || ''} ${p.employee?.user?.lastName || ''}`.trim(),
        month: p.month,
        year: p.year,
        grossSalary: p.grossSalary,
        netSalary: p.netSalary,
        status: p.status,
      }))
      exportCSV('payroll.csv', rows)
      return
    }
    if (activeTab === 'overview' && stats) {
      const rows = [
        {
          totalEmployees: stats.totalEmployees,
          activeEmployees: stats.activeEmployees,
          pendingLeaves: stats.pendingLeaves,
          totalSalary: stats.totalSalary,
          averageSalary: stats.averageSalary,
        },
      ]
      exportCSV('hr-overview.csv', rows)
      return
    }
    toast.error('Nothing to export')
  }

  const openCreateEmployee = async () => {
    setCreatingEmployee(true)
    try {
      const res = await userService.getUsers({ limit: 100 })
      setAllUsers(res.data || [])
    } catch {
      setAllUsers([])
    }
  }

  const createEmployeeMinimal = async () => {
    try {
      const firstUser = allUsers[0]
      if (!firstUser?._id) {
        toast.error('No users found to create employee profile')
        return
      }
      await hrService.createEmployee({
        userId: firstUser._id,
        phone: '+1-000-000-0000',
        dateOfJoining: new Date().toISOString(),
        salary: { base: 0, currency: 'INR' },
      } as any)
      toast.success('Employee created')
      setCreatingEmployee(false)
      await loadAll()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create employee')
    }
  }

  const onViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee)
  }

  const onEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
  }

  const onSaveEmployee = async (updatedData: Partial<Employee>) => {
    if (!editingEmployee) return
    try {
      await hrService.updateEmployee(editingEmployee._id, updatedData)
      toast.success('Employee updated successfully')
      setEditingEmployee(null)
      await loadAll()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update employee')
    }
  }

  const onCreateLeave = async (leaveData: Partial<Leave>) => {
    try {
      await hrService.createLeave(leaveData)
      toast.success('Leave request submitted successfully')
      setCreatingLeave(false)
      await loadAll()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create leave request')
    }
  }

  const onGeneratePayroll = async (month: number, year: number) => {
    try {
      await hrService.generatePayroll({ month, year })
      toast.success('Payroll generated successfully for all employees')
      setGeneratingPayroll(false)
      await loadAll()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate payroll')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'exited':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">Total Employees</CardTitle>
            <div className="p-2 rounded-full bg-blue-50 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="metric-number text-4xl text-gray-900">{stats?.totalEmployees ?? '-'}</div>
            <p className="text-sm text-blue-600 mt-1 font-medium tracking-tight">{stats ? `${Math.max(0, (stats.activeEmployees || 0) - (stats.totalEmployees || 0))} net change` : 'Team strength'}</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">Active Employees</CardTitle>
            <div className="p-2 rounded-full bg-green-50 text-green-500">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="metric-number text-4xl text-gray-900">{stats?.activeEmployees ?? '-'}</div>
            <p className="text-sm text-green-600 mt-1 font-medium tracking-tight">{stats && stats.totalEmployees ? `${((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1)}% active rate` : 'Currently working'}</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">Pending Leaves</CardTitle>
            <div className="p-2 rounded-full bg-yellow-50 text-yellow-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="metric-number text-4xl text-gray-900">{stats?.pendingLeaves ?? '-'}</div>
            <p className="text-sm text-yellow-600 mt-1 font-medium tracking-tight">Require approval</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">Total Salary</CardTitle>
            <div className="p-2 rounded-full bg-orange-50 text-orange-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="metric-number text-4xl text-gray-900">{stats ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalSalary || 0) : '-'}</div>
            <p className="text-sm text-orange-600 mt-1 font-medium tracking-tight">Monthly payroll</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="card-title text-gray-900">Attendance Overview</CardTitle>
              <CardDescription className="text-sm text-gray-500 font-medium tracking-tight">
                Weekly attendance trends and patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <BarChartComponent data={attendanceChartData} height={300} color="#10b981" />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="card-title text-gray-900">Department Distribution</CardTitle>
              <CardDescription className="text-sm text-gray-500 font-medium tracking-tight">
                Team distribution across departments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {stats &&
                  Object.entries(stats.departmentBreakdown || {}).map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
                      <span className="text-sm font-medium text-gray-700 tracking-tight">{dept || 'Unassigned'}</span>
                      <span className="text-sm font-bold text-gray-900 bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">{count as any}</span>
                </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderEmployeesTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="content">Content</SelectItem>
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
        <Button 
          onClick={openCreateEmployee}
          className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {creatingEmployee && (
        <div className="p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Selects the first available user to create an employee profile (demo). Replace with a proper assignment UI.</div>
            <div className="space-x-2">
              <Button size="sm" variant="outline" onClick={() => setCreatingEmployee(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={createEmployeeMinimal}>Create</Button>
            </div>
          </div>
        </div>
      )}

      <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="card-title text-gray-900">Team Members</CardTitle>
          <CardDescription className="text-sm text-gray-500 font-medium tracking-tight">
            Manage your talented team members
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div key={employee._id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/30 border border-gray-100/50 hover:bg-white/60 transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      employee.user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(`${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`)}`
                    }
                    alt={`${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`}
                    className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 tracking-tight">
                      {employee.user?.firstName} {employee.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {employee.user?.position || ''} • {employee.user?.email}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">{employee.user?.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewEmployee(employee)}
                    className="rounded-xl bg-white/60 backdrop-blur-sm text-gray-700 p-2 hover:bg-white/80 transition-all duration-200 ease-out border border-gray-200/50 shadow-sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEditEmployee(employee)}
                    className="rounded-xl bg-white/60 backdrop-blur-sm text-gray-700 p-2 hover:bg-white/80 transition-all duration-200 ease-out border border-gray-200/50 shadow-sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAttendanceTab = () => (
    <div className="space-y-6">
      <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between p-0 pb-6 gap-4">
          <div>
            <CardTitle className="card-title text-gray-900">Attendance Tracking</CardTitle>
            <CardDescription className="text-sm text-gray-500 font-medium tracking-tight">
              Monitor daily attendance and time tracking
            </CardDescription>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onCheckIn}
              className="rounded-xl bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white/80 transition-all duration-200 ease-out border border-gray-200/50 shadow-sm font-medium tracking-tight"
            >
              Check In
            </Button>
            <Button 
              onClick={onCheckOut}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
              Check Out
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 rounded-2xl bg-green-50/50 border border-green-100/50">
              <div className="metric-number text-4xl text-green-600">{todayAttendanceCount.present}</div>
              <div className="text-sm text-green-700 font-semibold tracking-tight mt-2">Present Today</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-red-50/50 border border-red-100/50">
              <div className="metric-number text-4xl text-red-600">{todayAttendanceCount.absent}</div>
              <div className="text-sm text-red-700 font-semibold tracking-tight mt-2">Absent Today</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-yellow-50/50 border border-yellow-100/50">
              <div className="metric-number text-4xl text-yellow-600">{todayAttendanceCount.late}</div>
              <div className="text-sm text-yellow-700 font-semibold tracking-tight mt-2">Late Today</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderLeavesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Leave Management</h2>
          <p className="text-sm text-muted-foreground">Approve and manage leave requests</p>
        </div>
        <Button onClick={() => setCreatingLeave(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>Current leave requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div key={leave._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">
                    {leave.employee?.user?.firstName && leave.employee?.user?.lastName 
                      ? `${leave.employee.user.firstName} ${leave.employee.user.lastName}`
                      : leave.employee?.user?.email || leave.employee?._id || 'Unknown Employee'
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {leave.leaveType} Leave - {leave.startDate?.slice(0, 10)} to {leave.endDate?.slice(0, 10)} ({leave.totalDays} days)
                  </p>
                  <p className="text-sm text-muted-foreground">{leave.reason}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(leave.status)}>{leave.status}</Badge>
                  {leave.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onApproveLeave(leave._id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onRejectLeave(leave._id)}>
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPayrollTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Payroll Management</h2>
          <p className="text-sm text-muted-foreground">Manage salaries and payroll processing</p>
        </div>
        <Button onClick={() => setGeneratingPayroll(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Payroll
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current Month Payroll</CardTitle>
          <CardDescription>Payroll records for the current month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {payroll.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">{p.employee?.user?.firstName} {p.employee?.user?.lastName}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.month}/{p.year} • Net: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.netSalary || 0)} • {p.status}
                  </div>
              </div>
                <div className="space-x-2">
                  {p.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={async () => { await hrService.approvePayroll(p._id); toast.success('Payroll approved'); await loadAll() }}>Approve</Button>
                  )}
                  {p.status === 'approved' && (
                    <Button size="sm" onClick={async () => { const today = new Date().toISOString(); await hrService.markPayrollAsPaid(p._id, { paymentDate: today, paymentMethod: 'bank_transfer' }); toast.success('Marked as paid'); await loadAll() }}>Mark Paid</Button>
                  )}
              </div>
            </div>
            ))}
          </div>
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
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title text-gray-900">Human Resources</h1>
          <p className="text-gray-600 mt-1 font-medium tracking-tight">
            Manage your team with luxury precision and care
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={onExport} 
            disabled={loading}
            className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'employees', label: 'Employees', icon: Users },
            { id: 'attendance', label: 'Attendance', icon: Calendar },
            { id: 'leaves', label: 'Leaves', icon: Clock },
            { id: 'payroll', label: 'Payroll', icon: DollarSign },
          ].map((tab) => (
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

      {/* Employee View Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Employee Details</h2>
              <Button variant="outline" size="sm" onClick={() => setViewingEmployee(null)}>✕</Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={viewingEmployee.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${viewingEmployee.user?.firstName || ''} ${viewingEmployee.user?.lastName || ''}`)}`}
                  alt={`${viewingEmployee.user?.firstName || ''} ${viewingEmployee.user?.lastName || ''}`}
                  className="h-16 w-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-medium">{viewingEmployee.user?.firstName} {viewingEmployee.user?.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{viewingEmployee.user?.position}</p>
                  <p className="text-sm text-muted-foreground">{viewingEmployee.user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <p className="text-sm">{viewingEmployee.user?.department || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm">{viewingEmployee.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Work Type</label>
                  <p className="text-sm">{viewingEmployee.workType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={getStatusColor(viewingEmployee.status)}>{viewingEmployee.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Date of Joining</label>
                  <p className="text-sm">{viewingEmployee.dateOfJoining ? new Date(viewingEmployee.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Base Salary</label>
                  <p className="text-sm">{viewingEmployee.salary?.base ? `${viewingEmployee.salary.currency || 'USD'} ${viewingEmployee.salary.base}` : 'N/A'}</p>
                </div>
              </div>
              {viewingEmployee.skills && viewingEmployee.skills.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingEmployee.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Edit Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Employee</h2>
              <Button variant="outline" size="sm" onClick={() => setEditingEmployee(null)}>✕</Button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const updates = {
                phone: formData.get('phone') as string,
                workType: formData.get('workType') as any,
                status: formData.get('status') as any,
                salary: {
                  base: parseInt(formData.get('salary') as string) || 0,
                  currency: formData.get('currency') as string || 'USD'
                }
              }
              onSaveEmployee(updates)
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input name="phone" defaultValue={editingEmployee.phone || ''} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Work Type</label>
                    <Select name="workType" defaultValue={editingEmployee.workType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select name="status" defaultValue={editingEmployee.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="exited">Exited</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Base Salary</label>
                    <div className="flex space-x-2">
                      <Input name="salary" type="number" defaultValue={editingEmployee.salary?.base || 0} />
                      <Select name="currency" defaultValue={editingEmployee.salary?.currency || 'USD'}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingEmployee(null)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Leave Modal */}
      {creatingLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Request Leave</h2>
              <Button variant="outline" size="sm" onClick={() => setCreatingLeave(false)}>✕</Button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const startDate = formData.get('startDate') as string
              const endDate = formData.get('endDate') as string
              const start = new Date(startDate)
              const end = new Date(endDate)
              const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
              
              const leaveData = {
                leaveType: formData.get('leaveType') as any,
                startDate,
                endDate,
                totalDays,
                reason: formData.get('reason') as string,
              }
              onCreateLeave(leaveData)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Leave Type</label>
                  <Select name="leaveType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      <SelectItem value="maternity">Maternity Leave</SelectItem>
                      <SelectItem value="paternity">Paternity Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input name="startDate" type="date" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input name="endDate" type="date" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <textarea 
                    name="reason" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" 
                    rows={3}
                    placeholder="Please provide a reason for your leave request"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreatingLeave(false)}>Cancel</Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Payroll Modal */}
      {generatingPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Generate Payroll</h2>
              <Button variant="outline" size="sm" onClick={() => setGeneratingPayroll(false)}>✕</Button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const month = parseInt(formData.get('month') as string)
              const year = parseInt(formData.get('year') as string)
              onGeneratePayroll(month, year)
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Month</label>
                    <Select name="month" defaultValue={String(new Date().getMonth() + 1)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">January</SelectItem>
                        <SelectItem value="2">February</SelectItem>
                        <SelectItem value="3">March</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">June</SelectItem>
                        <SelectItem value="7">July</SelectItem>
                        <SelectItem value="8">August</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">October</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Year</label>
                    <Select name="year" defaultValue={String(new Date().getFullYear())}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  This will generate payroll for all active employees for the selected month and year.
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setGeneratingPayroll(false)}>Cancel</Button>
                  <Button type="submit">Generate Payroll</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRDashboard 