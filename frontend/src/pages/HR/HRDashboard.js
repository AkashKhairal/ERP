import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LineChartComponent, BarChartComponent } from '../../components/ui/charts';
import { useAuth } from '../../context/AuthContext';

const HRDashboard = () => {
  const { logActivity } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showLeaveCalendar, setShowLeaveCalendar] = useState(false);
  
  const [stats] = useState({
    totalEmployees: 24,
    activeEmployees: 22,
    newHires: 3,
    pendingLeaves: 5,
    totalSalary: 125000,
    averageSalary: 5208
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'leaves', label: 'Leaves', icon: Clock },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
  ];

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
      manager: 'Lisa Chen',
      skills: ['Google Ads', 'Facebook Ads', 'Analytics'],
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson'
    }
  ]);

  // Enhanced leave data with calendar integration
  const [leaves, setLeaves] = useState([
    {
      id: 1,
      employee: 'John Doe',
      employeeId: 1,
      type: 'Sick Leave',
      startDate: '2024-12-05',
      endDate: '2024-12-07',
      status: 'approved',
      days: 3,
      reason: 'Medical appointment',
      approvedBy: 'Sarah Johnson'
    },
    {
      id: 2,
      employee: 'Sarah Wilson',
      employeeId: 2,
      type: 'Annual Leave',
      startDate: '2024-12-15',
      endDate: '2024-12-20',
      status: 'pending',
      days: 5,
      reason: 'Family vacation',
      approvedBy: null
    },
    {
      id: 3,
      employee: 'Mike Johnson',
      employeeId: 3,
      type: 'Personal Leave',
      startDate: '2024-12-10',
      endDate: '2024-12-10',
      status: 'approved',
      days: 1,
      reason: 'Personal matters',
      approvedBy: 'Lisa Chen'
    }
  ]);

  // Sample data for charts
  const attendanceData = [
    { name: 'Mon', present: 22, absent: 2 },
    { name: 'Tue', present: 23, absent: 1 },
    { name: 'Wed', present: 21, absent: 3 },
    { name: 'Thu', present: 24, absent: 0 },
    { name: 'Fri', present: 22, absent: 2 },
  ];

  const salaryData = [
    { name: 'Jan', salary: 120000 },
    { name: 'Feb', salary: 122000 },
    { name: 'Mar', salary: 123000 },
    { name: 'Apr', salary: 124000 },
    { name: 'May', salary: 125000 },
    { name: 'Jun', salary: 125000 },
  ];

  const employeeGrowthData = [
    { name: 'Jan', employees: 18 },
    { name: 'Feb', employees: 19 },
    { name: 'Mar', employees: 20 },
    { name: 'Apr', employees: 21 },
    { name: 'May', employees: 22 },
    { name: 'Jun', employees: 24 },
  ];

  const departmentData = [
    { name: 'Engineering', value: 12 },
    { name: 'Design', value: 5 },
    { name: 'Marketing', value: 4 },
    { name: 'Sales', value: 3 },
  ];

  useEffect(() => {
    loadHRData();
  }, []);

  const loadHRData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      logActivity('HR Dashboard Loaded', 'User accessed HR management module');
    } catch (error) {
      console.error('Error loading HR data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportHRReport = () => {
    // Create CSV content
    const csvContent = [
      ['Employee Name', 'Department', 'Position', 'Status', 'Join Date', 'Salary', 'Manager'],
      ...employees.map(emp => [
        emp.name,
        emp.department,
        emp.position,
        emp.status,
        emp.joinDate,
        formatCurrency(emp.salary),
        emp.manager
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    logActivity('HR Report Exported', 'Exported employee data to CSV');
  };

  const exportAttendanceReport = () => {
    const csvContent = [
      ['Date', 'Present', 'Absent', 'Late', 'Attendance Rate'],
      ...attendanceData.map(day => [
        day.name,
        day.present,
        day.absent,
        '3', // Sample late data
        `${((day.present / (day.present + day.absent)) * 100).toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    logActivity('Attendance Report Exported', 'Exported attendance data to CSV');
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[status] || colors.pending;
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    logActivity('Employee Viewed', `Viewed details for ${employee.name}`);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    logActivity('Employee Edit', `Started editing ${employee.name}`);
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== employeeId));
      logActivity('Employee Deleted', `Deleted employee with ID ${employeeId}`);
    }
  };

  const handleAddEmployee = () => {
    setShowAddEmployee(true);
    logActivity('Add Employee', 'Started adding new employee');
  };

  const handleApproveLeave = (leaveId) => {
    setLeaves(leaves.map(leave => 
      leave.id === leaveId 
        ? { ...leave, status: 'approved', approvedBy: 'Current User' }
        : leave
    ));
    logActivity('Leave Approved', `Approved leave request ${leaveId}`);
  };

  const handleRejectLeave = (leaveId) => {
    setLeaves(leaves.map(leave => 
      leave.id === leaveId 
        ? { ...leave, status: 'rejected', approvedBy: 'Current User' }
        : leave
    ));
    logActivity('Leave Rejected', `Rejected leave request ${leaveId}`);
  };

  const getLeaveCalendarData = () => {
    const calendarData = {};
    leaves.forEach(leave => {
      if (leave.status === 'approved') {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (!calendarData[dateStr]) {
            calendarData[dateStr] = [];
          }
          calendarData[dateStr].push(leave.employee);
        }
      }
    });
    return calendarData;
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const filteredLeaves = leaves.filter(leave => {
    return leave.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
           leave.type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const renderOverviewTab = () => {
    const overviewCards = [
      {
        name: 'Total Employees',
        value: stats.totalEmployees,
        change: '+2',
        changeType: 'positive',
        icon: Users,
        color: 'text-blue-600'
      },
      {
        name: 'Active Employees',
        value: stats.activeEmployees,
        change: '+1',
        changeType: 'positive',
        icon: UserCheck,
        color: 'text-green-600'
      },
      {
        name: 'New Hires',
        value: stats.newHires,
        change: 'This month',
        changeType: 'neutral',
        icon: UserPlus,
        color: 'text-purple-600'
      },
      {
        name: 'Pending Leaves',
        value: stats.pendingLeaves,
        change: 'Requests',
        changeType: 'neutral',
        icon: Calendar,
        color: 'text-orange-600'
      }
    ];

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.name}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={card.changeType === 'positive' ? 'text-green-600' : 'text-muted-foreground'}>
                      {card.change}
                    </span> from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Employee Growth</CardTitle>
                <CardDescription>
                  Employee count over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent data={employeeGrowthData} />
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
              <CardDescription>
                Employees by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentData.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {dept.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dept.value} employees
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {((dept.value / stats.totalEmployees) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common HR operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto"
                onClick={() => setActiveTab('employees')}
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Add Employee</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto"
                onClick={() => setActiveTab('leaves')}
              >
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Manage Leaves</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto"
                onClick={() => setActiveTab('payroll')}
              >
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Process Payroll</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto"
                onClick={() => exportHRReport()}
              >
                <Download className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Export Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEmployeesTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Employees</h3>
            <p className="text-sm text-muted-foreground">Manage your team members</p>
          </div>
          <Button onClick={handleAddEmployee}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={employee.avatar} 
                      alt={employee.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <CardDescription>{employee.email}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Department</span>
                    <span className="font-medium">{employee.department}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Position</span>
                    <span className="font-medium">{employee.position}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Manager</span>
                    <span className="font-medium">{employee.manager}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Join Date</span>
                    <span>{new Date(employee.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Salary</span>
                    <span className="font-medium">{formatCurrency(employee.salary)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewEmployee(employee)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No employees found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={handleAddEmployee}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Employee
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderAttendanceTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Attendance Tracking</h3>
            <p className="text-sm text-muted-foreground">Monitor employee attendance</p>
          </div>
          <Button onClick={exportAttendanceReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Present Today
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">22</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Absent Today
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600">-1</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Late Arrivals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-yellow-600">+1</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Rate
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91.7%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trend</CardTitle>
            <CardDescription>Attendance patterns over the week</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={attendanceData} />
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderLeavesTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Leave Management</h3>
            <p className="text-sm text-muted-foreground">Manage employee leave requests</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowLeaveCalendar(!showLeaveCalendar)}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Leave Calendar
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Leave Request
            </Button>
          </div>
        </div>

        {/* Leave Calendar */}
        {showLeaveCalendar && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Calendar</CardTitle>
              <CardDescription>Hover over dates to see who's on leave</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium bg-muted rounded">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - 15 + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const leaveCalendarData = getLeaveCalendarData();
                  const employeesOnLeave = leaveCalendarData[dateStr] || [];
                  
                  return (
                    <div
                      key={i}
                      className={`p-2 text-center text-sm border rounded cursor-pointer hover:bg-muted transition-colors ${
                        employeesOnLeave.length > 0 ? 'bg-red-50 border-red-200' : ''
                      }`}
                      title={employeesOnLeave.length > 0 ? `On leave: ${employeesOnLeave.join(', ')}` : 'No leaves'}
                    >
                      <div>{date.getDate()}</div>
                      {employeesOnLeave.length > 0 && (
                        <div className="text-xs text-red-600 font-medium">
                          {employeesOnLeave.length} leave{employeesOnLeave.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search leave requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLeaves.map((leave) => (
            <Card key={leave.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{leave.employee}</CardTitle>
                  <Badge className={getStatusColor(leave.status)}>
                    {leave.status}
                  </Badge>
                </div>
                <CardDescription>{leave.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Start Date</span>
                    <span>{new Date(leave.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>End Date</span>
                    <span>{new Date(leave.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Days</span>
                    <span className="font-medium">{leave.days}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Reason:</span>
                    <p className="text-muted-foreground mt-1">{leave.reason}</p>
                  </div>
                  {leave.approvedBy && (
                    <div className="text-sm text-muted-foreground">
                      Approved by: {leave.approvedBy}
                    </div>
                  )}
                  {leave.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleApproveLeave(leave.id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleRejectLeave(leave.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderPayrollTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Payroll Management</h3>
            <p className="text-sm text-muted-foreground">Manage employee salaries and payroll</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Process Payroll
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Payroll
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSalary)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Salary
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averageSalary)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3.1%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Payroll Status
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Processed</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">On time</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">All clear</span> this month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Salary Trends</CardTitle>
            <CardDescription>Monthly salary expenditure over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartComponent data={salaryData} />
          </CardContent>
        </Card>

        {/* Employee Salary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Salaries</CardTitle>
            <CardDescription>Current salary breakdown by employee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={employee.avatar} 
                      alt={employee.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(employee.salary)}</p>
                    <p className="text-sm text-muted-foreground">Monthly</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'employees':
        return renderEmployeesTab();
      case 'attendance':
        return renderAttendanceTab();
      case 'leaves':
        return renderLeavesTab();
      case 'payroll':
        return renderPayrollTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">HR Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportHRReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleAddEmployee}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Manage your team, track attendance, handle leaves, and process payroll.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading HR data...</span>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <TabsContent value={activeTab} className="space-y-6">
            {renderTabContent()}
          </TabsContent>
        )}
      </Tabs>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-medium">Add New Employee</h3>
            <p className="text-sm text-muted-foreground">
              Fill in the details to add a new employee to your team.
            </p>
            <form className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                <Input id="name" type="text" placeholder="Enter employee name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <Input id="email" type="email" placeholder="Enter employee email" />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium">Department</label>
                <Select onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, department: value })} value={selectedEmployee?.department}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium">Position</label>
                <Input id="position" type="text" placeholder="Enter employee position" />
              </div>
              <div>
                <label htmlFor="salary" className="block text-sm font-medium">Salary</label>
                <Input id="salary" type="number" placeholder="Enter employee salary" />
              </div>
              <div>
                <label htmlFor="joinDate" className="block text-sm font-medium">Join Date</label>
                <Input id="joinDate" type="date" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
                <Input id="phone" type="tel" placeholder="Enter employee phone" />
              </div>
              <div>
                <label htmlFor="manager" className="block text-sm font-medium">Manager</label>
                <Input id="manager" type="text" placeholder="Enter employee manager" />
              </div>
              <div>
                <label htmlFor="skills" className="block text-sm font-medium">Skills (comma-separated)</label>
                <Input id="skills" type="text" placeholder="Enter employee skills" />
              </div>
              <Button onClick={() => {
                const newEmployee = {
                  id: employees.length + 1, // Simple ID generation
                  name: document.getElementById('name').value,
                  email: document.getElementById('email').value,
                  department: document.getElementById('department').value,
                  position: document.getElementById('position').value,
                  salary: parseFloat(document.getElementById('salary').value),
                  joinDate: document.getElementById('joinDate').value,
                  phone: document.getElementById('phone').value,
                  manager: document.getElementById('manager').value,
                  skills: document.getElementById('skills').value.split(',').map(s => s.trim()),
                  status: 'active', // Default status
                  avatar: 'https://ui-avatars.com/api/?name=' + document.getElementById('name').value.split(' ').join('+')
                };
                setEmployees([...employees, newEmployee]);
                setShowAddEmployee(false);
                logActivity('Employee Added', `Added new employee: ${newEmployee.name}`);
              }}>
                Add Employee
              </Button>
              <Button variant="outline" onClick={() => setShowAddEmployee(false)}>
                Cancel
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-medium">Employee Details</h3>
            <p className="text-sm text-muted-foreground">
              View and manage employee details.
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex justify-center">
                <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-24 h-24 rounded-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium">Name: {selectedEmployee.name}</p>
                <p className="text-sm text-muted-foreground">Email: {selectedEmployee.email}</p>
                <p className="text-sm font-medium">Department: {selectedEmployee.department}</p>
                <p className="text-sm font-medium">Position: {selectedEmployee.position}</p>
                <p className="text-sm font-medium">Salary: {formatCurrency(selectedEmployee.salary)}</p>
                <p className="text-sm font-medium">Join Date: {new Date(selectedEmployee.joinDate).toLocaleDateString()}</p>
                <p className="text-sm font-medium">Phone: {selectedEmployee.phone}</p>
                <p className="text-sm font-medium">Manager: {selectedEmployee.manager}</p>
                <p className="text-sm font-medium">Skills: {selectedEmployee.skills.join(', ')}</p>
                <p className="text-sm font-medium">Status: <Badge className={getStatusColor(selectedEmployee.status)}>{selectedEmployee.status}</Badge></p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditEmployee(selectedEmployee)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteEmployee(selectedEmployee.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedEmployee(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-medium">Edit Employee</h3>
            <p className="text-sm text-muted-foreground">
              Modify employee details.
            </p>
            <form className="mt-4 space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium">Name</label>
                <Input id="editName" type="text" defaultValue={selectedEmployee.name} />
              </div>
              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium">Email</label>
                <Input id="editEmail" type="email" defaultValue={selectedEmployee.email} />
              </div>
              <div>
                <label htmlFor="editDepartment" className="block text-sm font-medium">Department</label>
                <Select onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, department: value })} value={selectedEmployee.department}>
                  <SelectTrigger id="editDepartment">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="editPosition" className="block text-sm font-medium">Position</label>
                <Input id="editPosition" type="text" defaultValue={selectedEmployee.position} />
              </div>
              <div>
                <label htmlFor="editSalary" className="block text-sm font-medium">Salary</label>
                <Input id="editSalary" type="number" defaultValue={selectedEmployee.salary} />
              </div>
              <div>
                <label htmlFor="editJoinDate" className="block text-sm font-medium">Join Date</label>
                <Input id="editJoinDate" type="date" defaultValue={selectedEmployee.joinDate} />
              </div>
              <div>
                <label htmlFor="editPhone" className="block text-sm font-medium">Phone</label>
                <Input id="editPhone" type="tel" defaultValue={selectedEmployee.phone} />
              </div>
              <div>
                <label htmlFor="editManager" className="block text-sm font-medium">Manager</label>
                <Input id="editManager" type="text" defaultValue={selectedEmployee.manager} />
              </div>
              <div>
                <label htmlFor="editSkills" className="block text-sm font-medium">Skills (comma-separated)</label>
                <Input id="editSkills" type="text" defaultValue={selectedEmployee.skills.join(', ')} />
              </div>
              <Button onClick={() => {
                const updatedEmployee = {
                  ...selectedEmployee,
                  name: document.getElementById('editName').value,
                  email: document.getElementById('editEmail').value,
                  department: document.getElementById('editDepartment').value,
                  position: document.getElementById('editPosition').value,
                  salary: parseFloat(document.getElementById('editSalary').value),
                  joinDate: document.getElementById('editJoinDate').value,
                  phone: document.getElementById('editPhone').value,
                  manager: document.getElementById('editManager').value,
                  skills: document.getElementById('editSkills').value.split(',').map(s => s.trim())
                };
                setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
                setSelectedEmployee(null);
                logActivity('Employee Updated', `Updated employee: ${updatedEmployee.name}`);
              }}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
                Cancel
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Leave Calendar Modal */}
      {showLeaveCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl h-full flex flex-col">
            <h3 className="text-lg font-medium mb-2">Leave Calendar</h3>
            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Search leaves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select onValueChange={(value) => setStatusFilter(value)} value={statusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 overflow-auto">
              <CalendarDays className="w-full h-full" data={getLeaveCalendarData()} />
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowLeaveCalendar(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard; 