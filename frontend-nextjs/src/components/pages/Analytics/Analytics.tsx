'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Users, 
  Eye, 
  ThumbsUp, 
  Share2, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Target, 
  Download,
  Play,
  BookOpen,
  FolderOpen,
  CheckCircle,
  Clock,
  Plus,
  Activity
} from 'lucide-react'
import { 
  LineChartComponent, 
  BarChartComponent, 
  AreaChartComponent, 
  PieChartComponent,
  MultiLineChartComponent,
  StackedBarChartComponent
} from '@/components/ui/charts'

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'youtube', label: 'YouTube Analytics', icon: Play },
    { id: 'team', label: 'Team Productivity', icon: Users },
    { id: 'projects', label: 'Project Progress', icon: FolderOpen },
    { id: 'courses', label: 'Course Sales', icon: BookOpen },
    { id: 'reports', label: 'Custom Reports', icon: PieChart },
    { id: 'kpis', label: 'KPIs', icon: Target },
  ]

  // Sample data for charts
  const visitorData = [
    { name: 'Apr 6', value: 400 },
    { name: 'Apr 12', value: 300 },
    { name: 'Apr 18', value: 200 },
    { name: 'Apr 24', value: 278 },
    { name: 'Apr 30', value: 189 },
    { name: 'May 6', value: 239 },
    { name: 'May 12', value: 349 },
  ]

  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ]

  const salesData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 200 },
    { name: 'Apr', value: 278 },
    { name: 'May', value: 189 },
    { name: 'Jun', value: 239 },
    { name: 'Jul', value: 349 },
  ]

  const pieData = [
    { name: 'Desktop', value: 400 },
    { name: 'Mobile', value: 300 },
    { name: 'Tablet', value: 200 },
    { name: 'Other', value: 100 },
  ]

  const multiLineData = [
    { name: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
    { name: 'Feb', revenue: 3000, expenses: 1398, profit: 1602 },
    { name: 'Mar', revenue: 2000, expenses: 9800, profit: -7800 },
    { name: 'Apr', revenue: 2780, expenses: 3908, profit: -1128 },
    { name: 'May', revenue: 1890, expenses: 4800, profit: -2910 },
    { name: 'Jun', revenue: 2390, expenses: 3800, profit: -1410 },
    { name: 'Jul', revenue: 3490, expenses: 4300, profit: -810 },
  ]

  const stackedBarData = [
    { name: 'Jan', youtube: 400, courses: 240, consulting: 240 },
    { name: 'Feb', youtube: 300, courses: 139, consulting: 221 },
    { name: 'Mar', youtube: 200, courses: 980, consulting: 229 },
    { name: 'Apr', youtube: 278, courses: 390, consulting: 200 },
    { name: 'May', youtube: 189, courses: 480, consulting: 218 },
    { name: 'Jun', youtube: 239, courses: 380, consulting: 250 },
    { name: 'Jul', youtube: 349, courses: 430, consulting: 210 },
  ]

  useEffect(() => {
    // Load analytics data
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const renderOverviewTab = () => (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscriptions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
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
            <div className="text-2xl font-bold">+12</div>
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
            <div className="text-2xl font-bold">+2.3M</div>
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
            <CardTitle>Top Performing Content</CardTitle>
            <CardDescription>
              Best performing videos this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    React Tutorial for Beginners
                  </p>
                  <p className="text-sm text-muted-foreground">
                    125K views
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">+12.5%</p>
                  <p className="text-xs text-muted-foreground">
                    vs last month
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Node.js API Development
                  </p>
                  <p className="text-sm text-muted-foreground">
                    98K views
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">+8.2%</p>
                  <p className="text-xs text-muted-foreground">
                    vs last month
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    TypeScript Best Practices
                  </p>
                  <p className="text-sm text-muted-foreground">
                    87K views
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">+15.3%</p>
                  <p className="text-xs text-muted-foreground">
                    vs last month
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>
                Monthly comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultiLineChartComponent 
                data={multiLineData} 
                lines={[
                  { dataKey: 'revenue', name: 'Revenue', color: 'hsl(var(--primary))' },
                  { dataKey: 'expenses', name: 'Expenses', color: 'hsl(var(--destructive))' },
                  { dataKey: 'profit', name: 'Profit', color: 'hsl(var(--secondary))' }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
              <CardDescription>
                Breakdown by platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StackedBarChartComponent 
                data={stackedBarData}
                bars={[
                  { dataKey: 'youtube', name: 'YouTube' },
                  { dataKey: 'courses', name: 'Courses' },
                  { dataKey: 'consulting', name: 'Consulting' }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderYouTubeTab = () => (
    <div className="space-y-6">
      {/* YouTube Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscribers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,250</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Watch Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125K hrs</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,450</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* YouTube Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>
                Daily view trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChartComponent data={visitorData} height={300} />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>
                Where viewers come from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PieChartComponent data={pieData} height={300} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Report
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

        <TabsContent value="overview" className="space-y-4">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="youtube" className="space-y-4">
          {renderYouTubeTab()}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Productivity</CardTitle>
              <CardDescription>
                Track team performance and productivity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChartComponent data={salesData} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>
                Monitor project completion and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartComponent data={revenueData} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Sales</CardTitle>
              <CardDescription>
                Track course enrollment and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChartComponent data={visitorData} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>
                Generate and view custom analytics reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PieChartComponent data={pieData} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>
                Monitor critical business metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultiLineChartComponent 
                data={multiLineData} 
                lines={[
                  { dataKey: 'revenue', name: 'Revenue', color: 'hsl(var(--primary))' },
                  { dataKey: 'expenses', name: 'Expenses', color: 'hsl(var(--destructive))' }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Analytics 