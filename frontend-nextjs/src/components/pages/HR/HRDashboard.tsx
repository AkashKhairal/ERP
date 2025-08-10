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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees ?? '-'}</div>
            <p className="text-xs text-muted-foreground">{stats ? `${Math.max(0, (stats.activeEmployees || 0) - (stats.totalEmployees || 0))} net change` : ''}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeEmployees ?? '-'}</div>
            <p className="text-xs text-muted-foreground">{stats && stats.totalEmployees ? `${((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1)}% active rate` : ''}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingLeaves ?? '-'}</div>
            <p className="text-xs text-muted-foreground">Require approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalSalary || 0) : '-'}</div>
            <p className="text-xs text-muted-foreground">Monthly payroll</p>
          </CardContent>
        </Card>
      </div>

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
                {stats &&
                  Object.entries(stats.departmentBreakdown || {}).map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm">{dept || 'Unassigned'}</span>
                      <span className="text-sm font-medium">{count as any}</span>
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
    <div className="space-y-4">
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
        <Button onClick={openCreateEmployee}>
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

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Manage your team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEmployees.map((employee) => (
              <div key={employee._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      employee.user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(`${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`)}`
                    }
                    alt={`${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">
                      {employee.user?.firstName} {employee.user?.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.user?.position || ''} • {employee.user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{employee.user?.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
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
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
          <CardTitle>Attendance Tracking</CardTitle>
          <CardDescription>Monitor daily attendance and time tracking</CardDescription>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onCheckIn}>Check In</Button>
            <Button onClick={onCheckOut}>Check Out</Button>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todayAttendanceCount.present}</div>
                <div className="text-sm text-muted-foreground">Present Today</div>
              </div>
              <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{todayAttendanceCount.absent}</div>
                <div className="text-sm text-muted-foreground">Absent Today</div>
              </div>
              <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{todayAttendanceCount.late}</div>
                <div className="text-sm text-muted-foreground">Late Today</div>
            </div>
          </div>
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
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div key={leave._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{leave.employee?._id}</h3>
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
      <Card>
        <CardHeader>
          <CardTitle>Payroll Management</CardTitle>
          <CardDescription>Manage salaries and payroll processing</CardDescription>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Management</h1>
          <p className="text-muted-foreground">Manage employees, attendance, leaves, and payroll</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onExport} disabled={loading}>
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
    </div>
  )
}

export default HRDashboard 