import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Download,
  Clock,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Square,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useAuth } from '../../context/AuthContext';

const SprintPlanning = () => {
  const [sprints, setSprints] = useState([
    {
      id: 1,
      name: 'Sprint 1 - User Authentication',
      description: 'Implement user authentication and authorization system',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      capacity: {
        teamCapacity: 80,
        totalStoryPoints: 45,
        completedStoryPoints: 32
      },
      goals: [
        { description: 'Implement login/logout functionality', completed: true },
        { description: 'Add password reset feature', completed: true },
        { description: 'Set up role-based access control', completed: false },
        { description: 'Add two-factor authentication', completed: false }
      ],
      tasks: [
        { task: { id: 1, title: 'Login Form', storyPoints: 5 }, completed: true },
        { task: { id: 2, title: 'Password Reset', storyPoints: 8 }, completed: true },
        { task: { id: 3, title: 'Role Management', storyPoints: 13 }, completed: false },
        { task: { id: 4, title: '2FA Setup', storyPoints: 19 }, completed: false }
      ]
    },
    {
      id: 2,
      name: 'Sprint 2 - Dashboard Features',
      description: 'Build comprehensive dashboard with analytics',
      status: 'planning',
      startDate: '2024-01-15',
      endDate: '2024-01-28',
      capacity: {
        teamCapacity: 80,
        totalStoryPoints: 52,
        completedStoryPoints: 0
      },
      goals: [
        { description: 'Create main dashboard layout', completed: false },
        { description: 'Add revenue analytics charts', completed: false },
        { description: 'Implement user activity tracking', completed: false }
      ],
      tasks: [
        { task: { id: 5, title: 'Dashboard Layout', storyPoints: 8 }, completed: false },
        { task: { id: 6, title: 'Revenue Charts', storyPoints: 13 }, completed: false },
        { task: { id: 7, title: 'Activity Tracking', storyPoints: 21 }, completed: false },
        { task: { id: 8, title: 'Export Reports', storyPoints: 10 }, completed: false }
      ]
    },
    {
      id: 3,
      name: 'Sprint 3 - Content Management',
      description: 'Develop content creation and management tools',
      status: 'completed',
      startDate: '2023-12-15',
      endDate: '2023-12-28',
      capacity: {
        teamCapacity: 80,
        totalStoryPoints: 38,
        completedStoryPoints: 38
      },
      goals: [
        { description: 'Create content editor', completed: true },
        { description: 'Add media upload functionality', completed: true },
        { description: 'Implement content scheduling', completed: true }
      ],
      tasks: [
        { task: { id: 9, title: 'Content Editor', storyPoints: 13 }, completed: true },
        { task: { id: 10, title: 'Media Upload', storyPoints: 8 }, completed: true },
        { task: { id: 11, title: 'Content Scheduling', storyPoints: 17 }, completed: true }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  const [selectedSprint, setSelectedSprint] = useState(null);
  const [showAddSprint, setShowAddSprint] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'planning': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressPercentage = (sprint) => {
    if (sprint.capacity.totalStoryPoints === 0) return 0;
    return Math.round((sprint.capacity.completedStoryPoints / sprint.capacity.totalStoryPoints) * 100);
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const startSprint = (sprintId) => {
    setSprints(prev => prev.map(sprint => 
      sprint.id === sprintId 
        ? { ...sprint, status: 'active' }
        : sprint
    ));
  };

  const completeSprint = (sprintId) => {
    setSprints(prev => prev.map(sprint => 
      sprint.id === sprintId 
        ? { ...sprint, status: 'completed' }
        : sprint
    ));
  };

  const toggleTaskCompletion = (sprintId, taskId) => {
    setSprints(prev => prev.map(sprint => {
      if (sprint.id === sprintId) {
        const updatedTasks = sprint.tasks.map(task => {
          if (task.task.id === taskId) {
            const completed = !task.completed;
            return { ...task, completed };
          }
          return task;
        });
        
        const completedStoryPoints = updatedTasks
          .filter(task => task.completed)
          .reduce((sum, task) => sum + task.task.storyPoints, 0);
        
        return {
          ...sprint,
          tasks: updatedTasks,
          capacity: {
            ...sprint.capacity,
            completedStoryPoints
          }
        };
      }
      return sprint;
    }));
  };

  const addSprint = (sprintData) => {
    const newSprint = {
      id: Date.now(),
      ...sprintData,
      status: 'planning',
      goals: [],
      tasks: [],
      capacity: {
        totalStoryPoints: 0,
        completedStoryPoints: 0,
        teamCapacity: sprintData.teamCapacity || 40
      }
    };
    
    setSprints(prev => [...prev, newSprint]);
    setShowAddSprint(false);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sprint Planning</h1>
            <p className="text-muted-foreground">Plan and manage your development sprints</p>
          </div>
          <Button onClick={() => setShowAddSprint(true)}>
            <Plus className="w-5 h-5 mr-2" />
            <span>New Sprint</span>
          </Button>
        </div>
      </div>

      {/* Sprint Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {sprints.map((sprint) => (
          <Card key={sprint.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">{sprint.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{sprint.description}</p>
                  <Badge variant={sprint.status === 'active' ? 'default' : sprint.status === 'completed' ? 'secondary' : 'outline'}>
                    {sprint.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {getDaysRemaining(sprint.endDate)} days left
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {sprint.capacity.teamCapacity} hours capacity
                  </span>
                  <span className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    {sprint.capacity.completedStoryPoints}/{sprint.capacity.totalStoryPoints} pts
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{getProgressPercentage(sprint)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(sprint)}%` }}
                  ></div>
                </div>
              </div>

              {/* Sprint Goals */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Goals</h4>
                <div className="space-y-1">
                  {sprint.goals.slice(0, 2).map((goal, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className={`w-4 h-4 mr-2 ${goal.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span className={goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                        {goal.description}
                      </span>
                    </div>
                  ))}
                  {sprint.goals.length > 2 && (
                    <p className="text-xs text-muted-foreground">+{sprint.goals.length - 2} more goals</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setSelectedSprint(sprint)}>
                  View Details
                </Button>
                
                <div className="flex items-center space-x-2">
                  {sprint.status === 'planning' && (
                    <Button size="sm" onClick={() => startSprint(sprint.id)}>
                      <Play className="w-4 h-4 mr-1" />
                      <span>Start</span>
                    </Button>
                  )}
                  
                  {sprint.status === 'active' && (
                    <Button size="sm" variant="secondary" onClick={() => completeSprint(sprint.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Complete</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sprint Details Modal */}
      {selectedSprint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedSprint.name}</h3>
              <button
                onClick={() => setSelectedSprint(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sprint Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sprint Information</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Project:</span>
                    <span className="ml-2 font-medium">{selectedSprint.project}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedSprint.startDate).toLocaleDateString()} - {new Date(selectedSprint.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSprint.status)}`}>
                      {selectedSprint.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Progress:</span>
                    <span className="ml-2 font-medium">{getProgressPercentage(selectedSprint)}%</span>
                  </div>
                </div>
              </div>

              {/* Burndown Chart */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Burndown Chart</h4>
                <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Burndown chart will be implemented</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Tasks</h4>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Task
                </button>
              </div>
              
              <div className="space-y-2">
                {selectedSprint.tasks.map((taskItem) => (
                  <div key={taskItem.task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={taskItem.completed}
                        onChange={() => toggleTaskCompletion(selectedSprint.id, taskItem.task.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <p className={`font-medium ${taskItem.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {taskItem.task.title}
                        </p>
                        <p className="text-sm text-gray-600">{taskItem.task.storyPoints} story points</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Sprint Modal */}
      {showAddSprint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Sprint</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addSprint({
                name: formData.get('name'),
                description: formData.get('description'),
                project: formData.get('project'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                teamCapacity: parseInt(formData.get('teamCapacity'))
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    name="project"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="SaaS Analytics Dashboard">SaaS Analytics Dashboard</option>
                    <option value="YouTube Channel Redesign">YouTube Channel Redesign</option>
                    <option value="Client Website Development">Client Website Development</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Capacity (hours)</label>
                  <input
                    type="number"
                    name="teamCapacity"
                    min="1"
                    defaultValue="40"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddSprint(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintPlanning; 