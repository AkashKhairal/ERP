// Search service for handling search functionality
import { 
  Home, Users, FolderOpen, CheckSquare, Calendar, DollarSign, 
  BarChart3, FileText, Settings, Shield, Key, User, Bell, 
  TrendingUp, Target, Clock, Award, Play, Plus, X 
} from 'lucide-react';

// Search data structure
export const searchItems = [
  // Main Modules
  {
    category: 'Main Modules',
    items: [
      { title: 'Dashboard', path: '/app/dashboard', icon: Home, description: 'Main dashboard overview' },
      { title: 'HR Management', path: '/app/hr', icon: Users, description: 'Employee management and HR operations' },
      { title: 'Users', path: '/app/users', icon: Users, description: 'User management and profiles' },
      { title: 'Teams', path: '/app/teams', icon: Users, description: 'Team management and collaboration' },
      { title: 'Projects', path: '/app/projects', icon: FolderOpen, description: 'Project management and tracking' },
      { title: 'Tasks', path: '/app/tasks', icon: CheckSquare, description: 'Task management and kanban boards' },
      { title: 'Sprints', path: '/app/sprints', icon: Calendar, description: 'Sprint planning and management' },
      { title: 'Finance', path: '/app/finance', icon: DollarSign, description: 'Financial management and budgeting' },
      { title: 'Analytics', path: '/app/analytics', icon: BarChart3, description: 'Analytics and reporting' },
      { title: 'Content', path: '/app/content', icon: FileText, description: 'Content management and planning' },
      { title: 'Integrations', path: '/app/integrations', icon: Settings, description: 'Third-party integrations' },
      { title: 'Roles & Permissions', path: '/app/roles-permissions', icon: Key, description: 'User roles and access control' },
    ]
  },
  // HR Submodules
  {
    category: 'HR Management',
    items: [
      { title: 'Employee Management', path: '/app/hr/employees', icon: Users, description: 'Add, edit, and manage employees' },
      { title: 'Attendance Tracking', path: '/app/hr/attendance', icon: Clock, description: 'Track employee attendance' },
      { title: 'Leave Management', path: '/app/hr/leaves', icon: Calendar, description: 'Manage leave requests' },
      { title: 'Payroll Management', path: '/app/hr/payroll', icon: DollarSign, description: 'Process payroll and salaries' },
      { title: 'Onboarding', path: '/app/hr/onboarding', icon: Plus, description: 'New employee onboarding' },
      { title: 'Offboarding', path: '/app/hr/offboarding', icon: X, description: 'Employee exit process' },
    ]
  },
  // Project Management
  {
    category: 'Project Management',
    items: [
      { title: 'Project Dashboard', path: '/app/projects/dashboard', icon: BarChart3, description: 'Project overview and metrics' },
      { title: 'Create Project', path: '/app/projects/create', icon: Plus, description: 'Start a new project' },
      { title: 'Project List', path: '/app/projects/list', icon: FolderOpen, description: 'View all projects' },
      { title: 'Task Management', path: '/app/tasks/kanban', icon: CheckSquare, description: 'Kanban board for tasks' },
      { title: 'Sprint Planning', path: '/app/sprints/planning', icon: Target, description: 'Plan and manage sprints' },
      { title: 'Time Tracking', path: '/app/tasks/time-tracking', icon: Clock, description: 'Track time spent on tasks' },
    ]
  },
  // Finance
  {
    category: 'Finance',
    items: [
      { title: 'Expense Management', path: '/app/finance/expenses', icon: DollarSign, description: 'Track and manage expenses' },
      { title: 'Revenue Tracking', path: '/app/finance/revenue', icon: TrendingUp, description: 'Monitor revenue streams' },
      { title: 'Budget Management', path: '/app/finance/budget', icon: Target, description: 'Set and track budgets' },
      { title: 'Payroll Overview', path: '/app/finance/payroll', icon: Users, description: 'View payroll information' },
      { title: 'Invoice Generator', path: '/app/finance/invoices', icon: FileText, description: 'Create and manage invoices' },
      { title: 'Financial Reports', path: '/app/finance/reports', icon: BarChart3, description: 'Generate financial reports' },
    ]
  },
  // Content Management
  {
    category: 'Content Management',
    items: [
      { title: 'YouTube Content', path: '/app/content/youtube', icon: Play, description: 'Manage YouTube content' },
      { title: 'Course Builder', path: '/app/content/courses', icon: Award, description: 'Create and manage courses' },
      { title: 'Content Calendar', path: '/app/content/calendar', icon: Calendar, description: 'Content planning calendar' },
      { title: 'Asset Management', path: '/app/content/assets', icon: FolderOpen, description: 'Manage content assets' },
      { title: 'Performance Analytics', path: '/app/content/analytics', icon: BarChart3, description: 'Content performance metrics' },
    ]
  },
  // User Features
  {
    category: 'User Features',
    items: [
      { title: 'Profile Settings', path: '/app/profile', icon: User, description: 'Manage your profile' },
      { title: 'Account Security', path: '/app/profile?tab=security', icon: Shield, description: 'Security settings' },
      { title: 'Notifications', path: '/app/profile?tab=notifications', icon: Bell, description: 'Notification preferences' },
      { title: 'Preferences', path: '/app/profile?tab=preferences', icon: Settings, description: 'User preferences' },
    ]
  },
  // Quick Actions
  {
    category: 'Quick Actions',
    items: [
      { title: 'Add Employee', path: '/app/hr/employees/create', icon: Plus, description: 'Add a new employee' },
      { title: 'Create Project', path: '/app/projects/create', icon: Plus, description: 'Start a new project' },
      { title: 'New Task', path: '/app/tasks/create', icon: Plus, description: 'Create a new task' },
      { title: 'Schedule Meeting', path: '/app/calendar', icon: Calendar, description: 'Schedule a meeting' },
      { title: 'Generate Report', path: '/app/analytics/reports', icon: BarChart3, description: 'Generate a report' },
    ]
  }
];

// Search function
export const searchItemsByQuery = (query) => {
  if (!query || !query.trim()) return [];

  const lowercaseQuery = query.toLowerCase();
  
  return searchItems.map(category => ({
    ...category,
    items: category.items.filter(item =>
      (item.title && item.title.toLowerCase().includes(lowercaseQuery)) ||
      (item.description && item.description.toLowerCase().includes(lowercaseQuery)) ||
      (category.category && category.category.toLowerCase().includes(lowercaseQuery)) ||
      (item.path && item.path.toLowerCase().includes(lowercaseQuery))
    )
  })).filter(category => category.items.length > 0);
};

// Get all searchable items as a flat array
export const getAllSearchItems = () => {
  return searchItems.flatMap(category => 
    category.items.map(item => ({
      ...item,
      category: category.category
    }))
  );
};

// Get recent searches (for future implementation)
export const getRecentSearches = () => {
  const recent = localStorage.getItem('recentSearches');
  return recent ? JSON.parse(recent) : [];
};

// Save recent search
export const saveRecentSearch = (searchItem) => {
  const recent = getRecentSearches();
  const newRecent = [searchItem, ...recent.filter(item => item.path !== searchItem.path)].slice(0, 5);
  localStorage.setItem('recentSearches', JSON.stringify(newRecent));
};

// Get search suggestions based on user's recent activity
export const getSearchSuggestions = (user) => {
  const suggestions = [];
  
  // Add user-specific suggestions based on their role/department
  if (user?.department === 'hr') {
    suggestions.push(...searchItems.find(cat => cat.category === 'HR Management')?.items || []);
  }
  
  if (user?.department === 'finance') {
    suggestions.push(...searchItems.find(cat => cat.category === 'Finance')?.items || []);
  }
  
  // Add quick actions
  suggestions.push(...searchItems.find(cat => cat.category === 'Quick Actions')?.items || []);
  
  return suggestions.slice(0, 5);
}; 