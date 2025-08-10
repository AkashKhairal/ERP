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
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Content Views</CardTitle>
              <CardDescription>Monthly view trends</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartComponent data={viewsData} height={300} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Content by Type</CardTitle>
              <CardDescription>Distribution of content types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Videos</span>
                  <span className="text-sm font-medium">
                    {content.filter(item => item.type === 'video').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Articles</span>
                  <span className="text-sm font-medium">
                    {content.filter(item => item.type === 'article').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Images</span>
                  <span className="text-sm font-medium">
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Content Library</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Content
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {content.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{getTypeIcon(item.type)}</span>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Author</span>
                  <span className="font-medium">{item.author}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Publish Date</span>
                  <span className="font-medium">{item.publishDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Views</span>
                  <span className="font-medium">{item.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Likes</span>
                  <span className="font-medium">{item.likes.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
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
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Content Calendar</h3>
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p>Content calendar coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Content Analytics</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {content
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-sm">{item.title}</span>
                    <span className="text-sm font-medium">{item.views.toLocaleString()} views</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Content Performance</CardTitle>
          </CardHeader>
          <CardContent>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage your content library and publishing schedule
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
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

export default Content 