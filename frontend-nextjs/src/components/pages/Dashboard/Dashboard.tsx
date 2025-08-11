'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Play, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowUpRight,
  BarChart3,
  Activity,
  Target,
  Eye,
  FolderOpen
} from 'lucide-react'
import { 
  LineChartComponent, 
  BarChartComponent, 
  AreaChartComponent, 
  PieChartComponent 
} from '@/components/ui/charts'

const Dashboard = () => {
  const { user, logActivity, getRecentActivities } = useAuth()
  const [stats] = useState({
    totalUsers: 24,
    activeProjects: 8,
    monthlyRevenue: 45231,
    youtubeViews: 2300000
  })

  // Get real recent activities
  const recentActivities = getRecentActivities()

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Log dashboard visit
  useEffect(() => {
    if (user) {
      logActivity('Dashboard Visit', 'User accessed the main dashboard')
    }
  }, [user, logActivity])

  // Sample data for charts
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ]

  const userGrowthData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 200 },
    { name: 'Apr', value: 278 },
    { name: 'May', value: 189 },
    { name: 'Jun', value: 239 },
    { name: 'Jul', value: 349 },
  ]

  const projectProgressData = [
    { name: 'Planning', value: 20 },
    { name: 'Development', value: 35 },
    { name: 'Testing', value: 25 },
    { name: 'Deployment', value: 20 },
  ]

  const monthlyViewsData = [
    { name: 'Apr 6', value: 400 },
    { name: 'Apr 12', value: 300 },
    { name: 'Apr 18', value: 200 },
    { name: 'Apr 24', value: 278 },
    { name: 'Apr 30', value: 189 },
    { name: 'May 6', value: 239 },
    { name: 'May 12', value: 349 },
  ]

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title text-gray-900">
            {getGreeting()}, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1 font-medium tracking-tight">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Button size="sm" className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-full bg-orange-50 text-orange-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="metric-number text-4xl text-gray-900">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-sm text-green-600 mt-1 font-medium tracking-tight">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">
              Active Users
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-50 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="metric-number text-4xl text-gray-900">+{stats.totalUsers}</div>
            <p className="text-sm text-green-600 mt-1 font-medium tracking-tight">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">
              Active Projects
            </CardTitle>
            <div className="p-2 rounded-full bg-green-50 text-green-500">
              <FolderOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="metric-number text-4xl text-gray-900">+{stats.activeProjects}</div>
            <p className="text-sm text-green-600 mt-1 font-medium tracking-tight">
              +19% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-sm font-semibold text-gray-600 tracking-tight">
              YouTube Views
            </CardTitle>
            <div className="p-2 rounded-full bg-purple-50 text-purple-500">
              <Eye className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="metric-number text-4xl text-gray-900">+{(stats.youtubeViews / 1000000).toFixed(1)}M</div>
            <p className="text-sm text-green-600 mt-1 font-medium tracking-tight">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="card-title text-gray-900">Revenue Overview</CardTitle>
              <CardDescription className="text-sm text-gray-500 font-medium tracking-tight">
                Monthly revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AreaChartComponent 
                data={revenueData} 
                height={300} 
                color="#f97316"
                dataKey="value"
              />
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-3 rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="card-title text-gray-900">Project Progress</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Current project status
            </CardDescription>
          </CardHeader>
                      <CardContent className="p-0">
              <PieChartComponent 
                data={projectProgressData} 
                height={300}
                dataKey="value"
                nameKey="name"
              />
            </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="card-title text-gray-900">User Growth</CardTitle>
              <CardDescription className="text-sm text-gray-500 font-medium tracking-tight">
                Monthly user acquisition
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LineChartComponent 
                data={userGrowthData} 
                height={300} 
                color="#10b981"
                dataKey="value"
              />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="card-title text-gray-900">Monthly Views</CardTitle>
              <CardDescription className="text-sm text-gray-500 font-medium tracking-tight">
                YouTube view trends
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <BarChartComponent 
                data={monthlyViewsData} 
                height={300} 
                color="#3b82f6"
                dataKey="value"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="card-title text-gray-900">Recent Activity</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Latest updates and activities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 ease-out">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.details}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No recent activity
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="card-title text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start rounded-xl bg-white/60 backdrop-blur-sm text-gray-700 px-5 py-2.5 hover:bg-white/80 transition-all duration-200 ease-out border border-gray-200/50 shadow-sm">
                <Plus className="mr-3 h-4 w-4" />
                New Project
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-xl bg-white/60 backdrop-blur-sm text-gray-700 px-5 py-2.5 hover:bg-white/80 transition-all duration-200 ease-out border border-gray-200/50 shadow-sm">
                <Users className="mr-3 h-4 w-4" />
                Add Team Member
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-xl bg-white/60 backdrop-blur-sm text-gray-700 px-5 py-2.5 hover:bg-white/80 transition-all duration-200 ease-out border border-gray-200/50 shadow-sm">
                <BarChart3 className="mr-3 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-xl bg-white/60 backdrop-blur-sm text-gray-700 px-5 py-2.5 hover:bg-white/80 transition-all duration-200 ease-out border border-gray-200/50 shadow-sm">
                <Calendar className="mr-3 h-4 w-4" />
                Schedule Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard 