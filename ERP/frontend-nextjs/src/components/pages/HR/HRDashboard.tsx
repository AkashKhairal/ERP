'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Calendar, 
  Clock, 
  DollarSign, 
  Activity,
  Target,
  CheckCircle,
  AlertTriangle,
  Plus,
  Download,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  CalendarDays,
  Filter,
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

const HRDashboard = () => {
  const { logActivity } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showLeaveCalendar, setShowLeaveCalendar] = useState(false)
  
  const [stats] = useState({
    totalEmployees: 24,
    activeEmployees: 22,
    newHires: 3,
    pendingLeaves: 5,
    totalSalary: 125000,
    averageSalary: 5208
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'leaves', label: 'Leaves', icon: Clock },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
  ]

  // Enhanced employee data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      position: 'Senior Developer',
      status: 'active',
      joinDate: '2023-01-15',
      salary: 85000,
      phone: '+1-555-0123',
      manager: 'Sarah Johnson',
      skills: ['React', 'Node.js', 'MongoDB'],
      avatar: 'https://ui-avatars.com/api/?name=John+Doe'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      department: 'Design',
      position: 'UI/UX Designer',
      status: 'active',
      joinDate: '2023-03-20',
      salary: 75000,
      phone: '+1-555-0124',
      manager: 'Mike Brown',
      skills: ['Figma', 'Adobe XD', 'Sketch'],
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      department: 'Marketing',
      position: 'Marketing Manager',
      status: 'active',
      joinDate: '2023-02-10',
      salary: 70000,
      phone: '+1-555-0125',
      manager: 'Jane Smith',
      skills: ['Digital Marketing', 'SEO', 'Content Strategy'],
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson'
    }
  ])

  // Sample attendance data
  const attendanceData = [
    { name: 'Mon', present: 22, absent: 2, late: 1 },
    { name: 'Tue', present: 23, absent: 1, late: 0 },
    { name: 'Wed', present: 21, absent: 3, late: 2 },
    { name: 'Thu', present: 24, absent: 0, late: 0 },
    { name: 'Fri', present: 20, absent: 4, late: 1 },
  ]

  // Sample leave data
  const leaveData = [
    {
      id: 1,
      employee: 'John Doe',
      type: 'Annual',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      status: 'pending',
      reason: 'Family vacation'
    },
    {
      id: 2,
      employee: 'Sarah Wilson',
      type: 'Sick',
      startDate: '2024-01-10',
      endDate: '2024-01-10',
      status: 'approved',
      reason: 'Not feeling well'
    }
  ]

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
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newHires} new hires this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1)}% active rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSalary)}</div>
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
              <BarChartComponent data={attendanceData} height={300} />
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
                <div className="flex items-center justify-between">
                  <span className="text-sm">Engineering</span>
                  <span className="text-sm font-medium">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Design</span>
                  <span className="text-sm font-medium">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Marketing</span>
                  <span className="text-sm font-medium">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sales</span>
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">HR</span>
                  <span className="text-sm font-medium">2</span>
                </div>
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
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAddEmployee(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Manage your team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status}
                  </Badge>
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
        <CardHeader>
          <CardTitle>Attendance Tracking</CardTitle>
          <CardDescription>Monitor daily attendance and time tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">22</div>
                <div className="text-sm text-muted-foreground">Present Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">2</div>
                <div className="text-sm text-muted-foreground">Absent Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">1</div>
                <div className="text-sm text-muted-foreground">Late Today</div>
              </div>
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
            {leaveData.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{leave.employee}</h3>
                  <p className="text-sm text-muted-foreground">
                    {leave.type} Leave - {leave.startDate} to {leave.endDate}
                  </p>
                  <p className="text-sm text-muted-foreground">{leave.reason}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(leave.status)}>
                    {leave.status}
                  </Badge>
                  {leave.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
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
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(stats.totalSalary)}</div>
                <div className="text-sm text-muted-foreground">Total Monthly Payroll</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(stats.averageSalary)}</div>
                <div className="text-sm text-muted-foreground">Average Salary</div>
              </div>
            </div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Management</h1>
          <p className="text-muted-foreground">
            Manage employees, attendance, leaves, and payroll
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
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