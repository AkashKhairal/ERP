'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Video, 
  Image, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash2,
  Eye,
  Calendar,
  User,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChartComponent, BarChartComponent } from '@/components/ui/charts'
import { useAuth } from '@/context/AuthContext'

const Content = () => {
  const { logActivity } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState([
    {
      id: 1,
      title: 'How to Build a React App',
      type: 'video',
      status: 'published',
      author: 'John Doe',
      publishDate: '2024-01-15',
      views: 15000,
      likes: 1200,
      category: 'Tutorial'
    },
    {
      id: 2,
      title: 'Design System Guide',
      type: 'article',
      status: 'draft',
      author: 'Sarah Wilson',
      publishDate: '2024-01-20',
      views: 0,
      likes: 0,
      category: 'Design'
    },
    {
      id: 3,
      title: 'API Best Practices',
      type: 'video',
      status: 'scheduled',
      author: 'Mike Johnson',
      publishDate: '2024-02-01',
      views: 0,
      likes: 0,
      category: 'Development'
    }
  ])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  useEffect(() => {
    logActivity('Content Dashboard Visit', 'User accessed content management')
  }, [logActivity])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-50/80 text-green-700 border border-green-200/50'
      case 'draft': return 'bg-yellow-50/80 text-yellow-700 border border-yellow-200/50'
      case 'scheduled': return 'bg-blue-50/80 text-blue-700 border border-blue-200/50'
      case 'archived': return 'bg-gray-50/80 text-gray-700 border border-gray-200/50'
      default: return 'bg-gray-50/80 text-gray-700 border border-gray-200/50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥'
      case 'article': return '📝'
      case 'image': return '🖼️'
      default: return '📄'
    }
  }

  const renderOverviewTab = () => {
    const stats = [
      {
        name: 'Total Content',
        value: content.length,
        change: '+12%',
        changeType: 'positive',
        icon: FileText
      },
      {
        name: 'Published',
        value: content.filter(item => item.status === 'published').length,
        change: '+8%',
        changeType: 'positive',
        icon: Eye
      },
      {
        name: 'Total Views',
        value: content.reduce((sum, item) => sum + item.views, 0).toLocaleString(),
        change: '+25%',
        changeType: 'positive',
        icon: BarChart3
      },
      {
        name: 'Total Likes',
        value: content.reduce((sum, item) => sum + item.likes, 0).toLocaleString(),
        change: '+15%',
        changeType: 'positive',
        icon: Eye
      }
    ]

    const viewsData = [
      { name: 'Jan', value: 12000 },
      { name: 'Feb', value: 15000 },
      { name: 'Mar', value: 18000 },
      { name: 'Apr', value: 22000 },
      { name: 'May', value: 25000 },
      { name: 'Jun', value: 28000 }
    ]

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.name}
              className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 tracking-tight">{stat.name}</p>
                    <p className="metric-number text-4xl text-gray-900 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <div className="h-4 w-4 text-green-500 mr-1">↗</div>
                      <span className="text-sm font-medium text-green-600">{stat.change}</span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${
                    stat.name === 'Total Content' ? 'bg-blue-50 text-blue-500' :
                    stat.name === 'Published' ? 'bg-green-50 text-green-500' :
                    stat.name === 'Total Views' ? 'bg-purple-50 text-purple-500' :
                    'bg-orange-50 text-orange-500'
                  }`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Content Performance</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Monthly content views and engagement trends
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LineChartComponent data={viewsData} height={300} />
            </CardContent>
          </Card>
          <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Content Distribution</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Content types and category breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-red-50/50 border border-red-200/50">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">🎥</div>
                    <span className="text-sm font-semibold text-gray-900 tracking-tight">Videos</span>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    {content.filter(item => item.type === 'video').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 border border-blue-200/50">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">📝</div>
                    <span className="text-sm font-semibold text-gray-900 tracking-tight">Articles</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {content.filter(item => item.type === 'article').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-green-50/50 border border-green-200/50">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">🖼️</div>
                    <span className="text-sm font-semibold text-gray-900 tracking-tight">Images</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {content.filter(item => item.type === 'image').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderContentTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="card-title text-gray-900">Content Library</h3>
          <p className="text-gray-600 font-medium tracking-tight mt-1">Manage and organize your content assets</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search content..." 
              className="pl-10 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-900 font-medium tracking-tight w-64"
            />
          </div>
          <Button className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out">
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {content.map((item, index) => (
          <Card 
            key={item.id} 
            className="rounded-3xl bg-white/60 backdrop-blur-sm p-6 shadow-sm border border-gray-200/50 hover:bg-white/80 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl p-2 rounded-2xl bg-gray-50/80">
                  {getTypeIcon(item.type)}
                </div>
                <Badge className={`${getStatusColor(item.status)} font-medium tracking-tight`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900 tracking-tight mt-3">{item.title}</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight">{item.category}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-gray-50/50">
                  <span className="text-gray-600 font-medium">Author</span>
                  <span className="font-semibold text-gray-900">{item.author}</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 rounded-xl bg-gray-50/50">
                  <span className="text-gray-600 font-medium">Published</span>
                  <span className="font-semibold text-gray-900">{item.publishDate}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-xl bg-purple-50/50 border border-purple-200/50">
                    <div className="font-bold text-purple-600">{item.views.toLocaleString()}</div>
                    <div className="text-xs text-purple-600 font-medium">Views</div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-pink-50/50 border border-pink-200/50">
                    <div className="font-bold text-pink-600">{item.likes.toLocaleString()}</div>
                    <div className="text-xs text-pink-600 font-medium">Likes</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-700 hover:bg-white hover:text-gray-900 font-medium tracking-tight"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl bg-blue-50/50 text-blue-600 border-blue-200/50 hover:bg-blue-100/80 font-medium tracking-tight"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl bg-red-50/50 text-red-600 border-red-200/50 hover:bg-red-100/80 font-medium tracking-tight"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderCalendarTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="card-title text-gray-900">Content Calendar</h3>
        <p className="text-gray-600 font-medium tracking-tight mt-1">Plan and schedule your content publishing timeline</p>
      </div>
      <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-sm border-0">
        <CardContent className="p-0">
          <div className="text-center">
            <div className="p-4 rounded-full bg-orange-50 text-orange-500 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Calendar className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Content Calendar</h4>
            <p className="text-gray-600 font-medium tracking-tight mb-6">
              Advanced content scheduling and editorial calendar coming soon
            </p>
            <Button className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out">
              <Plus className="h-4 w-4 mr-2" />
              Set Up Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="card-title text-gray-900">Content Analytics</h3>
        <p className="text-gray-600 font-medium tracking-tight mt-1">Detailed performance insights and engagement metrics</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="card-title text-gray-900">Top Performing Content</CardTitle>
            <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
              Highest engagement and view metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              {content
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50/80 transition-all duration-200 ease-out">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{getTypeIcon(item.type)}</div>
                      <div>
                        <p className="font-semibold text-gray-900 tracking-tight text-sm">{item.title}</p>
                        <p className="text-xs text-gray-600 font-medium">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{item.views.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 font-medium">views</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="card-title text-gray-900">Performance Overview</CardTitle>
            <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
              Content views comparison and trends
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <BarChartComponent data={content.map(item => ({
              name: item.title.slice(0, 10) + '...',
              value: item.views
            }))} height={200} />
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab()
      case 'content':
        return renderContentTab()
      case 'calendar':
        return renderCalendarTab()
      case 'analytics':
        return renderAnalyticsTab()
      default:
        return renderOverviewTab()
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-gray-900">Content Management System</h1>
          <p className="text-gray-600 mt-1 font-medium tracking-tight">
            Professional content creation, publishing, and performance analytics platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Content
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out">
            <Plus className="h-4 w-4 mr-2" />
            Create Content
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

        <TabsContent value={activeTab} className="space-y-4">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Content 