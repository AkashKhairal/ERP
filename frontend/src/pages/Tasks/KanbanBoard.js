import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreVertical, 
  User, 
  Calendar, 
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';

const KanbanBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState({
    todo: [
      {
        id: 1,
        title: 'Design new landing page',
        description: 'Create wireframes and mockups for the new landing page',
        priority: 'high',
        assignedTo: 'John Doe',
        assignedToId: 'user1',
        dueDate: '2024-02-10',
        type: 'design',
        storyPoints: 5,
        createdAt: '2024-01-15',
        createdBy: 'Team Lead',
        comments: [
          { id: 1, user: 'John Doe', text: 'Started working on wireframes', timestamp: '2024-01-16T10:00:00Z' },
          { id: 2, user: 'Team Lead', text: 'Great progress! Keep it up.', timestamp: '2024-01-16T14:30:00Z' }
        ],
        timeSpent: 0,
        estimatedTime: 16
      },
      {
        id: 2,
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment pipeline',
        priority: 'medium',
        assignedTo: 'Jane Smith',
        assignedToId: 'user2',
        dueDate: '2024-02-12',
        type: 'development',
        storyPoints: 8,
        createdAt: '2024-01-14',
        createdBy: 'Team Lead',
        comments: [],
        timeSpent: 0,
        estimatedTime: 24
      }
    ],
    doing: [
      {
        id: 3,
        title: 'Implement user authentication',
        description: 'Build JWT-based authentication system',
        priority: 'urgent',
        assignedTo: 'Mike Johnson',
        assignedToId: 'user3',
        dueDate: '2024-02-08',
        type: 'development',
        storyPoints: 13,
        createdAt: '2024-01-10',
        createdBy: 'Team Lead',
        comments: [
          { id: 3, user: 'Mike Johnson', text: 'JWT implementation completed', timestamp: '2024-01-17T09:00:00Z' }
        ],
        timeSpent: 12,
        estimatedTime: 32
      }
    ],
    review: [
      {
        id: 5,
        title: 'Database optimization',
        description: 'Optimize database queries and indexes',
        priority: 'high',
        assignedTo: 'Alex Brown',
        assignedToId: 'user4',
        dueDate: '2024-02-09',
        type: 'development',
        storyPoints: 8,
        createdAt: '2024-01-12',
        createdBy: 'Team Lead',
        comments: [],
        timeSpent: 8,
        estimatedTime: 20
      }
    ],
    done: [
      {
        id: 6,
        title: 'Project setup',
        description: 'Initialize project structure and dependencies',
        priority: 'medium',
        assignedTo: 'John Doe',
        assignedToId: 'user1',
        dueDate: '2024-02-05',
        type: 'development',
        storyPoints: 3,
        createdAt: '2024-01-08',
        createdBy: 'Team Lead',
        comments: [
          { id: 4, user: 'John Doe', text: 'Project setup completed successfully', timestamp: '2024-01-09T16:00:00Z' }
        ],
        timeSpent: 6,
        estimatedTime: 8,
        completedAt: '2024-01-09T16:00:00Z'
      }
    ]
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Task management functions
  const handleAddTask = (columnId) => {
    setSelectedColumn(columnId);
    setShowAddTask(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach(column => {
          newTasks[column] = newTasks[column].filter(task => task.id !== taskId);
        });
        return newTasks;
      });
    }
  };

  const handleTimeTracking = (taskId, timeSpent) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach(column => {
        newTasks[column] = newTasks[column].map(task => 
          task.id === taskId ? { ...task, timeSpent: task.timeSpent + timeSpent } : task
        );
      });
      return newTasks;
    });
  };

  const handleAddComment = (taskId, comment) => {
    const newComment = {
      id: Date.now(),
      user: user?.firstName + ' ' + user?.lastName,
      text: comment,
      timestamp: new Date().toISOString()
    };

    setTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach(column => {
        newTasks[column] = newTasks[column].map(task => 
          task.id === taskId ? { ...task, comments: [...task.comments, newComment] } : task
        );
      });
      return newTasks;
    });
  };

  const exportTaskReport = () => {
    const allTasks = Object.values(tasks).flat();
    const csvContent = [
      ['Task Title', 'Status', 'Assigned To', 'Priority', 'Due Date', 'Time Spent', 'Estimated Time', 'Progress'],
      ...allTasks.map(task => [
        task.title,
        getColumnTitle(task),
        task.assignedTo,
        task.priority,
        task.dueDate,
        task.timeSpent,
        task.estimatedTime,
        `${Math.round((task.timeSpent / task.estimatedTime) * 100)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getColumnTitle = (task) => {
    for (const [columnId, columnTasks] of Object.entries(tasks)) {
      if (columnTasks.find(t => t.id === task.id)) {
        return columns.find(col => col.id === columnId)?.title || columnId;
      }
    }
    return 'Unknown';
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100', count: tasks.todo.length },
    { id: 'doing', title: 'In Progress', color: 'bg-blue-100', count: tasks.doing.length },
    { id: 'review', title: 'Review', color: 'bg-yellow-100', count: tasks.review.length },
    { id: 'done', title: 'Done', color: 'bg-green-100', count: tasks.done.length }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'development': return '💻';
      case 'design': return '🎨';
      case 'documentation': return '📝';
      case 'planning': return '📋';
      case 'testing': return '🧪';
      default: return '📋';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const handleDragStart = (e, task, columnId) => {
    setDraggedTask({ task, sourceColumn: columnId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.sourceColumn !== targetColumn) {
      const newTasks = { ...tasks };
      
      // Remove from source column
      newTasks[draggedTask.sourceColumn] = newTasks[draggedTask.sourceColumn].filter(
        task => task.id !== draggedTask.task.id
      );
      
      // Add to target column
      newTasks[targetColumn] = [...newTasks[targetColumn], draggedTask.task];
      
      setTasks(newTasks);
    }
    
    setDraggedTask(null);
  };

  const addTask = (columnId, taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      createdAt: new Date().toISOString()
    };
    
    setTasks(prev => ({
      ...prev,
      [columnId]: [...prev[columnId], newTask]
    }));
    
    setShowAddTask(false);
    setSelectedColumn(null);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Management</h1>
        <p className="text-gray-600">Organize and track your tasks with the Kanban board</p>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`${column.color} rounded-lg p-4 mb-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-sm font-medium">
                    {column.count}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedColumn(column.id);
                      setShowAddTask(true);
                    }}
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {tasks[column.id].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-move"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(task.type)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {task.assignedTo}
                      </div>
                      <div className="flex items-center">
                        <Flag className="w-4 h-4 mr-1" />
                        {task.storyPoints} pts
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className={`flex items-center text-sm ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'}`}>
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                        {isOverdue(task.dueDate) && <AlertCircle className="w-4 h-4 ml-1" />}
                      </div>
                      
                      {column.id === 'doing' && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          Started
                        </div>
                      )}
                      
                      {column.id === 'done' && (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Task to {columns.find(col => col.id === selectedColumn)?.title}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addTask(selectedColumn, {
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                assignedTo: formData.get('assignedTo'),
                dueDate: formData.get('dueDate'),
                type: formData.get('type'),
                storyPoints: parseInt(formData.get('storyPoints'))
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="development">Development</option>
                      <option value="design">Design</option>
                      <option value="documentation">Documentation</option>
                      <option value="planning">Planning</option>
                      <option value="testing">Testing</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                    <input
                      type="text"
                      name="assignedTo"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
                    <input
                      type="number"
                      name="storyPoints"
                      min="1"
                      max="21"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTask(false);
                    setSelectedColumn(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard; 