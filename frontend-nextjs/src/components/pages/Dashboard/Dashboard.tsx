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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.firstName || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Button size="sm">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+180.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+19%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              YouTube Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{(stats.youtubeViews / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChartComponent data={revenueData} height={300} />
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>
              Current project status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={projectProgressData} height={300} />
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                Monthly user acquisition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartComponent data={userGrowthData} height={300} />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Views</CardTitle>
              <CardDescription>
                YouTube view trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent data={monthlyViewsData} height={300} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.details}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No recent activity
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
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