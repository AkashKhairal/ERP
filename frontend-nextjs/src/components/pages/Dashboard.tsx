'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  FolderOpen, 
  CheckSquare, 
  DollarSign, 
  BarChart3, 
  TrendingUp,
  Clock,
  Award,
  Calendar,
  Target,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    pendingTasks: 0,
    monthlyRevenue: 0,
    teamProductivity: 0,
    contentViews: 0
  })

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalUsers: 24,
      activeProjects: 8,
      pendingTasks: 12,
      monthlyRevenue: 45000,
      teamProductivity: 87,
      contentViews: 125000
    })
  }, [])

  const quickActions = [
    {
      title: 'Add Employee',
      description: 'Onboard a new team member',
      icon: Users,
      href: '/hr/employees/create',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Create Project',
      description: 'Start a new project',
      icon: FolderOpen,
      href: '/projects/create',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'New Task',
      description: 'Create a new task',
      icon: CheckSquare,
      href: '/tasks/create',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Schedule Meeting',
      description: 'Book a team meeting',
      icon: Calendar,
      href: '/calendar',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const recentActivities = [
    {
      action: 'New employee added',
      description: 'Sarah Johnson joined the team',
      time: '2 hours ago',
      type: 'user'
    },
    {
      action: 'Project completed',
      description: 'Website redesign finished',
      time: '1 day ago',
      type: 'project'
    },
    {
      action: 'Task assigned',
      description: 'Review marketing materials',
      time: '2 days ago',
      type: 'task'
    },
    {
      action: 'Meeting scheduled',
      description: 'Weekly team standup',
      time: '3 days ago',
      type: 'meeting'
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto h-10">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Button size="sm" className="w-full sm:w-auto h-10">
            <ArrowUp className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
              +3 new this week
            </p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
              -5 completed today
            </p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="w-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 sm:p-6">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                  <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${action.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{action.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activities and Team Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Activities</CardTitle>
            <CardDescription>Latest updates and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Team Performance</CardTitle>
            <CardDescription>Current team metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base">Productivity</span>
                  <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-1">
                    {stats.teamProductivity}%
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-primary h-2 sm:h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.teamProductivity}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base">Content Views</span>
                  <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-1">
                    {stats.contentViews.toLocaleString()}
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-green-500 h-2 sm:h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((stats.contentViews / 200000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Additional Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-lg sm:text-xl font-semibold">24</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Now</p>
                  <p className="text-lg sm:text-xl font-semibold">18</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tasks Due</p>
                  <p className="text-lg sm:text-xl font-semibold">12</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-lg sm:text-xl font-semibold">92%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard