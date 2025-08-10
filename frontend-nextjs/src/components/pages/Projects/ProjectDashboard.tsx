'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FolderOpen, 
  Users, 
  Calendar, 
  Plus,
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/context/AuthContext'
import projectService, { type Project, type ProjectStats } from '@/services/projectService'

const ProjectDashboard = () => {
  const router = useRouter()
  const { logActivity } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    averageProgress: 0,
    projectsByStatus: [],
    projectsByType: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    logActivity('Project Dashboard Visit', 'User accessed project dashboard')
  }, [logActivity])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load projects
      const projectsResponse = await projectService.getProjects()
      if (projectsResponse.success) {
        setProjects(projectsResponse.data)
      } else {
        setProjects(projectService.getSampleProjects())
      }

      // Load project stats
      const statsResponse = await projectService.getProjectStats()
      if (statsResponse.success) {
        setProjectStats(statsResponse.data)
      } else {
        setProjectStats(projectService.getSampleProjectStats())
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setProjects(projectService.getSampleProjects())
      setProjectStats(projectService.getSampleProjectStats())
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'on_hold': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'planning': return <Clock className="h-4 w-4" />
      case 'on_hold': return <Pause className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return '📺'
      case 'saas': return '💻'
      case 'freelance': return '💼'
      case 'internal': return '🏢'
      default: return '📁'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const recentProjects = projects.slice(0, 5)
  const activeProjects = projects.filter(p => p.status === 'active')
  const overdueProjects = projects.filter(p => isOverdue(p.endDate) && p.status !== 'completed')

  const quickActions = [
    {
      title: 'Create New Project',
      description: 'Start a new project',
      icon: <Plus className="h-6 w-6" />,
      action: () => router.push('/projects/create'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View All Projects',
      description: 'See all projects',
      icon: <FolderOpen className="h-6 w-6" />,
      action: () => router.push('/projects'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Active Projects',
      description: 'Manage active projects',
      icon: <Play className="h-6 w-6" />,
      action: () => router.push('/projects?status=active'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Project Analytics',
      description: 'View project analytics',
      icon: <TrendingUp className="h-6 w-6" />,
      action: () => router.push('/analytics'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-mobile">
      {/* Header */}
      <div className="header-mobile">
        <div className="header-content">
          <h1 className="text-responsive-xl font-bold">Project Dashboard</h1>
          <p className="text-muted-foreground text-responsive-sm">
            Overview of your projects and key metrics
          </p>
        </div>
        <div className="header-actions">
          <Button onClick={() => router.push('/projects/create')} size="mobile">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid-mobile-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
            <CardContent>
              <div className="flex items-center space-x-mobile">
                <div className={`p-2 sm:p-3 rounded-lg ${action.color} text-white flex-shrink-0`}>
                  {action.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-responsive-sm">{action.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid-mobile-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              All projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(projectStats.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Projects</CardTitle>
            <Button variant="outline" onClick={() => router.push('/projects')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No projects yet</h3>
              <p className="text-muted-foreground">
                Create your first project to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getTypeIcon(project.type)}</span>
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(project.status)}
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.progress}% complete
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/projects/${project._id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Projects Progress */}
      {activeProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Projects Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(project.type)}</span>
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
                    <span>{(project.teamMembers || project.team || []).length} members</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Projects Alert */}
      {overdueProjects.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Overdue Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueProjects.map((project) => (
                <div key={project._id} className="flex items-center justify-between p-2 bg-red-100 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(project.type)}</span>
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-red-600">
                      Due: {new Date(project.endDate).toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/projects/${project._id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProjectDashboard 