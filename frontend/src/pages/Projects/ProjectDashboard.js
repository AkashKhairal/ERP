import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Download,
  Calendar,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ProjectDashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 3,
    overdueProjects: 1,
    totalTasks: 45,
    completedTasks: 28,
    pendingTasks: 17,
    teamMembers: 15
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [recentProjects, setRecentProjects] = useState([]);

  // Load project data on component mount
  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [statsResponse, projectsResponse] = await Promise.all([
        projectService.getProjectStats(),
        projectService.getAllProjects({ limit: 5 })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (projectsResponse.data?.success) {
        setRecentProjects(projectsResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      toast.error('Error loading project data');
    } finally {
      setLoading(false);
    }
  };

  const [quickActions] = useState([
    {
      title: 'Create New Project',
      icon: <Plus className="w-6 h-6" />,
      link: '/projects/create',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View All Projects',
      icon: <FolderOpen className="w-6 h-6" />,
      link: '/projects/list',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Task Management',
      icon: <CheckCircle className="w-6 h-6" />,
      link: '/tasks',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Sprint Planning',
      icon: <Calendar className="w-6 h-6" />,
      link: '/sprints',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'planning': return 'text-yellow-600 bg-yellow-100';
      case 'on_hold': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'youtube': return '📺';
      case 'saas': return '💻';
      case 'freelance': return '💼';
      case 'internal': return '🏢';
      default: return '📁';
    }
  };

  // Handle project actions
  const handleViewProject = (projectId) => {
    console.log('View project details:', projectId);
    // TODO: Navigate to detailed project view
  };

  const handleEditProject = (projectId) => {
    console.log('Edit project:', projectId);
    // TODO: Open edit modal or navigate to edit page
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setRecentProjects(prev => prev.filter(project => project.id !== projectId));
    }
  };

  const handleAddTask = (projectId) => {
    console.log('Add task to project:', projectId);
    // TODO: Open add task modal
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading project dashboard...</span>
      </div>
    );
  }

  const renderProjectDetails = (project) => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(project.priority)}>
              {project.priority} priority
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Progress</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Due Date</h4>
            <p className="text-sm font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Budget</h4>
            <p className="text-sm font-medium">{formatCurrency(project.budget)}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Team Size</h4>
            <p className="text-sm font-medium">{project.teamSize} members</p>
          </div>
        </div>

        {/* Team Members */}
        <div className="mb-6">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Team Members</h4>
          <div className="flex flex-wrap gap-2">
            {project.team.map((member, index) => (
              <Badge key={index} variant="outline">
                {member}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-muted-foreground">Tasks</h4>
            <Button size="sm" onClick={() => handleAddTask(project.id)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>
          <div className="space-y-2">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className={`w-4 h-4 ${
                    task.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'
                  }`} />
                  <span className={`text-sm ${
                    task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{task.assignee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Milestones</h4>
          <div className="space-y-2">
            {project.milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    milestone.status === 'completed' ? 'bg-green-600' : 
                    milestone.status === 'in-progress' ? 'bg-yellow-600' : 'bg-muted-foreground'
                  }`} />
                  <span className="text-sm font-medium">{milestone.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                    {milestone.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(milestone.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Dashboard</h1>
        <p className="text-gray-600">Manage your projects, tasks, and team collaboration</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdueProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`${action.color} text-white rounded-lg p-4 flex items-center justify-center transition-colors duration-200`}
            >
              <div className="text-center">
                {action.icon}
                <p className="mt-2 font-medium">{action.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
          <Link
            to="/projects/list"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentProjects.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(project.type)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {project.teamSize} members
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{project.progress}%</p>
                    <p className="text-xs text-gray-600">Complete</p>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard; 