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
      description: 'Content review assigned to Alex',
      time: '2 days ago',
      type: 'task'
    },
    {
      action: 'Revenue milestone',
      description: 'Monthly revenue target achieved',
      time: '3 days ago',
      type: 'finance'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your team today.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Quick Action
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              +3 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowDown className="inline h-3 w-3 text-red-500" />
              -5 completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamProductivity}%</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              +5% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contentViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUp className="inline h-3 w-3 text-green-500" />
              +15% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest updates from your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>
              Current team status and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Online Members</span>
                <Badge variant="secondary">18/24</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Projects</span>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tasks Due Today</span>
                <Badge variant="destructive">5</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Meetings Today</span>
                <Badge variant="secondary">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard 