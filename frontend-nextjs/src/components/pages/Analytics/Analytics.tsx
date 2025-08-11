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
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
          style={{ animationDelay: '0ms' }}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 tracking-tight">Total Revenue</p>
                <p className="metric-number text-4xl text-gray-900 mt-2">$45,231</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">+20.1%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-50 text-green-500">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 tracking-tight">Active Users</p>
                <p className="metric-number text-4xl text-gray-900 mt-2">2,350</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-medium text-blue-600">+180.1%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-50 text-blue-500">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 tracking-tight">Active Projects</p>
                <p className="metric-number text-4xl text-gray-900 mt-2">12</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm font-medium text-purple-600">+19%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-50 text-purple-500">
                <FolderOpen className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 tracking-tight">Page Views</p>
                <p className="metric-number text-4xl text-gray-900 mt-2">2.3M</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm font-medium text-orange-600">+12.5%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-50 text-orange-500">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Revenue Analytics</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Comprehensive monthly revenue trends and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AreaChartComponent data={revenueData} height={300} />
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-3 rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="card-title text-gray-900">Top Performing Content</CardTitle>
            <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
              Best performing content and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50/80 transition-all duration-200 ease-out">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900 tracking-tight leading-none">
                    React Tutorial for Beginners
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    125K views • 4.8 rating
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+12.5%</p>
                  <p className="text-xs text-gray-500 font-medium">
                    vs last month
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50/80 transition-all duration-200 ease-out">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900 tracking-tight leading-none">
                    Node.js API Development
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    98K views • 4.6 rating
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">+8.2%</p>
                  <p className="text-xs text-gray-500 font-medium">
                    vs last month
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50/80 transition-all duration-200 ease-out">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900 tracking-tight leading-none">
                    TypeScript Best Practices
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    87K views • 4.9 rating
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-600">+15.3%</p>
                  <p className="text-xs text-gray-500 font-medium">
                    vs last month
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Financial Performance</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Revenue vs expenses analysis with profit margins
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <MultiLineChartComponent 
                data={multiLineData} 
                lines={[
                  { dataKey: 'revenue', name: 'Revenue', color: '#10b981' },
                  { dataKey: 'expenses', name: 'Expenses', color: '#ef4444' },
                  { dataKey: 'profit', name: 'Profit', color: '#f97316' }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Revenue Sources</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Multi-channel revenue breakdown and distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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
    <div className="space-y-8">
      {/* YouTube Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
          style={{ animationDelay: '0ms' }}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 tracking-tight">Total Views</p>
                <p className="metric-number text-4xl text-gray-900 mt-2">2.3M</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm font-medium text-red-600">+12.5%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-red-50 text-red-500">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 tracking-tight">Subscribers</p>
                <p className="metric-number text-4xl text-gray-900 mt-2">1,250</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-medium text-blue-600">+8.2%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-50 text-blue-500">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 tracking-tight">Watch Time</p>
                <p className="metric-number text-4xl text-gray-900 mt-2">125K</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm font-medium text-purple-600">+12.5%</span>
                  <span className="text-sm text-gray-500 ml-1">hours</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-50 text-purple-500">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 tracking-tight">Ad Revenue</p>
                <p className="metric-number text-4xl text-gray-900 mt-2">$8,450</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">+20.1%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-50 text-green-500">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* YouTube Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Audience Growth</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Daily view trends and audience engagement patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AreaChartComponent data={visitorData} height={300} />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Traffic Sources</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Channel discovery and viewer acquisition channels
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <PieChartComponent data={pieData} height={300} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1 font-medium tracking-tight">
            Advanced insights and performance metrics for data-driven decisions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out">
            <Plus className="mr-2 h-4 w-4" />
            Create Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="rounded-2xl bg-white/80 backdrop-blur-sm p-2 shadow-sm border-0 gap-1">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium tracking-tight px-4 py-2"
            >
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

        <TabsContent value="team" className="space-y-6">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Team Performance Analytics</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Comprehensive team productivity metrics and performance insights
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <BarChartComponent data={salesData} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Project Progress Tracking</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Real-time project completion rates and milestone achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LineChartComponent data={revenueData} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Course Performance</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Enrollment trends, completion rates, and revenue analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AreaChartComponent data={visitorData} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Custom Analytics Reports</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Tailored business intelligence and data visualization reports
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <PieChartComponent data={pieData} height={300} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Key Performance Indicators</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Critical business metrics and strategic performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <MultiLineChartComponent 
                data={multiLineData} 
                lines={[
                  { dataKey: 'revenue', name: 'Revenue', color: '#10b981' },
                  { dataKey: 'expenses', name: 'Expenses', color: '#ef4444' }
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