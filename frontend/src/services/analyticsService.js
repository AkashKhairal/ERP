import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only logout if it's a real authentication error, not just missing data
      if (error.response?.data?.message?.includes('token') || 
          error.response?.data?.message?.includes('authorized')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== DASHBOARD OVERVIEW ====================

export const getDashboardOverview = async (filters = {}) => {
  try {
    const response = await api.get('/analytics/dashboard', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching dashboard overview');
  }
};

// ==================== YOUTUBE ANALYTICS ====================

export const getYouTubeAnalytics = async (filters = {}) => {
  try {
    const response = await api.get('/analytics/youtube', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching YouTube analytics');
  }
};

export const createYouTubeAnalytics = async (analyticsData) => {
  try {
    const response = await api.post('/analytics/youtube', analyticsData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating YouTube analytics');
  }
};

export const updateYouTubeAnalytics = async (id, analyticsData) => {
  try {
    const response = await api.put(`/analytics/youtube/${id}`, analyticsData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating YouTube analytics');
  }
};

// ==================== TEAM PRODUCTIVITY ====================

export const getTeamProductivity = async (filters = {}) => {
  try {
    const response = await api.get('/analytics/productivity', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching team productivity');
  }
};

export const createProductivityEntry = async (productivityData) => {
  try {
    const response = await api.post('/analytics/productivity', productivityData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating productivity entry');
  }
};

// ==================== PROJECT PROGRESS ====================

export const getProjectProgress = async (filters = {}) => {
  try {
    const response = await api.get('/analytics/projects', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching project progress');
  }
};

export const createProjectProgress = async (progressData) => {
  try {
    const response = await api.post('/analytics/projects', progressData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating project progress');
  }
};

// ==================== COURSE SALES ====================

export const getCourseSales = async (filters = {}) => {
  try {
    const response = await api.get('/analytics/courses', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching course sales');
  }
};

export const createCourseSales = async (salesData) => {
  try {
    const response = await api.post('/analytics/courses', salesData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating course sales');
  }
};

// ==================== CUSTOM REPORTS ====================

export const getCustomReports = async (filters = {}) => {
  try {
    const response = await api.get('/analytics/reports', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching custom reports');
  }
};

export const createCustomReport = async (reportData) => {
  try {
    const response = await api.post('/analytics/reports', reportData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating custom report');
  }
};

export const generateCustomReport = async (reportId) => {
  try {
    const response = await api.post(`/analytics/reports/${reportId}/generate`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error generating custom report');
  }
};

export const updateCustomReport = async (reportId, reportData) => {
  try {
    const response = await api.put(`/analytics/reports/${reportId}`, reportData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating custom report');
  }
};

export const deleteCustomReport = async (reportId) => {
  try {
    const response = await api.delete(`/analytics/reports/${reportId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting custom report');
  }
};

// ==================== KPIs ====================

export const getKPIs = async (filters = {}) => {
  try {
    const response = await api.get('/analytics/kpis', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching KPIs');
  }
};

export const createKPI = async (kpiData) => {
  try {
    const response = await api.post('/analytics/kpis', kpiData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating KPI');
  }
};

export const updateKPI = async (kpiId, kpiData) => {
  try {
    const response = await api.put(`/analytics/kpis/${kpiId}`, kpiData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating KPI');
  }
};

export const deleteKPI = async (kpiId) => {
  try {
    const response = await api.delete(`/analytics/kpis/${kpiId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting KPI');
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const formatNumber = (value, type = 'number') => {
  if (value === null || value === undefined) return '0';
  
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    
    case 'percentage':
      return `${value.toFixed(1)}%`;
    
    case 'decimal':
      return value.toFixed(2);
    
    case 'compact':
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
      }
      return value.toString();
    
    default:
      return value.toLocaleString();
  }
};

export const getTrendInfo = (change) => {
  const numChange = parseFloat(change);
  if (isNaN(numChange)) return { color: 'text-gray-600', icon: 'minus' };
  
  if (numChange > 0) {
    return { color: 'text-green-600', icon: 'trending-up' };
  } else if (numChange < 0) {
    return { color: 'text-red-600', icon: 'trending-down' };
  }
  return { color: 'text-gray-600', icon: 'minus' };
};

export const getAnalyticsTypes = () => [
  { value: 'dashboard', label: 'Dashboard Overview', icon: 'bar-chart-3' },
  { value: 'youtube', label: 'YouTube Analytics', icon: 'play' },
  { value: 'productivity', label: 'Team Productivity', icon: 'users' },
  { value: 'project', label: 'Project Progress', icon: 'folder-open' },
  { value: 'course', label: 'Course Sales', icon: 'book-open' },
  { value: 'finance', label: 'Finance Reports', icon: 'dollar-sign' },
  { value: 'custom', label: 'Custom Reports', icon: 'file-text' }
];

export const getChartColor = (index) => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  return colors[index % colors.length];
};

export const generateChartData = (data, metric, label) => {
  if (!data || !Array.isArray(data)) return { labels: [], datasets: [] };
  
  const labels = data.map(item => item[label] || item.date);
  const values = data.map(item => item[metric] || 0);
  
  return {
    labels,
    datasets: [
      {
        label: metric.charAt(0).toUpperCase() + metric.slice(1),
        data: values,
        backgroundColor: getChartColor(0),
        borderColor: getChartColor(0),
        borderWidth: 2,
        fill: false
      }
    ]
  };
};

export const generatePieChartData = (data, labelKey, valueKey) => {
  if (!data || !Array.isArray(data)) return { labels: [], datasets: [] };
  
  const labels = data.map(item => item[labelKey]);
  const values = data.map((item, index) => item[valueKey]);
  const colors = data.map((_, index) => getChartColor(index));
  
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1
      }
    ]
  };
};

export const exportAnalyticsToCSV = (data, filename = 'analytics.csv') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const getDateRangeOptions = () => [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' }
];

export const getPeriodOptions = () => [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

export const getVisualizationOptions = () => [
  { value: 'bar', label: 'Bar Chart', icon: 'bar-chart-3' },
  { value: 'line', label: 'Line Chart', icon: 'trending-up' },
  { value: 'pie', label: 'Pie Chart', icon: 'pie-chart' },
  { value: 'table', label: 'Table', icon: 'table' },
  { value: 'heatmap', label: 'Heatmap', icon: 'grid' }
];

const analyticsService = {
  // Dashboard
  getDashboardOverview,
  
  // YouTube Analytics
  getYouTubeAnalytics,
  createYouTubeAnalytics,
  updateYouTubeAnalytics,
  
  // Team Productivity
  getTeamProductivity,
  createProductivityEntry,
  
  // Project Progress
  getProjectProgress,
  createProjectProgress,
  
  // Course Sales
  getCourseSales,
  createCourseSales,
  
  // Custom Reports
  getCustomReports,
  createCustomReport,
  generateCustomReport,
  updateCustomReport,
  deleteCustomReport,
  
  // KPIs
  getKPIs,
  createKPI,
  updateKPI,
  deleteKPI,
  
  // Utilities
  formatNumber,
  getTrendInfo,
  getAnalyticsTypes,
  getChartColor,
  generateChartData,
  generatePieChartData,
  exportAnalyticsToCSV,
  getDateRangeOptions,
  getPeriodOptions,
  getVisualizationOptions
};

export default analyticsService; 