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

// ==================== DASHBOARD ====================

export const getContentDashboard = async (filters = {}) => {
  try {
    const response = await api.get('/content/dashboard', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching content dashboard');
  }
};

// ==================== YOUTUBE CONTENT ====================

export const getYouTubeContent = async (filters = {}) => {
  try {
    const response = await api.get('/content/youtube', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching YouTube content');
  }
};

export const createYouTubeContent = async (contentData) => {
  try {
    const response = await api.post('/content/youtube', contentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating YouTube content');
  }
};

export const updateYouTubeContent = async (id, contentData) => {
  try {
    const response = await api.put(`/content/youtube/${id}`, contentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating YouTube content');
  }
};

export const deleteYouTubeContent = async (id) => {
  try {
    const response = await api.delete(`/content/youtube/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting YouTube content');
  }
};

// ==================== SHORTS/REELS ====================

export const getShortsReels = async (filters = {}) => {
  try {
    const response = await api.get('/content/shorts', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching shorts/reels');
  }
};

export const createShortsReels = async (shortsData) => {
  try {
    const response = await api.post('/content/shorts', shortsData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating shorts/reels');
  }
};

export const updateShortsReels = async (id, shortsData) => {
  try {
    const response = await api.put(`/content/shorts/${id}`, shortsData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating shorts/reels');
  }
};

// ==================== COURSES ====================

export const getCourses = async (filters = {}) => {
  try {
    const response = await api.get('/content/courses', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching courses');
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/content/courses', courseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating course');
  }
};

export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/content/courses/${id}`, courseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating course');
  }
};

// ==================== ASSETS ====================

export const getAssets = async (filters = {}) => {
  try {
    const response = await api.get('/content/assets', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching assets');
  }
};

export const createAsset = async (assetData) => {
  try {
    const response = await api.post('/content/assets', assetData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating asset');
  }
};

// ==================== REVIEWS ====================

export const getReviews = async (filters = {}) => {
  try {
    const response = await api.get('/content/reviews', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching reviews');
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await api.post('/content/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating review');
  }
};

export const updateReviewStatus = async (id, statusData) => {
  try {
    const response = await api.put(`/content/reviews/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating review status');
  }
};

// ==================== PERFORMANCE ====================

export const getContentPerformance = async (filters = {}) => {
  try {
    const response = await api.get('/content/performance', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching content performance');
  }
};

export const createContentPerformance = async (performanceData) => {
  try {
    const response = await api.post('/content/performance', performanceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating content performance');
  }
};

// ==================== COMMENTS ====================

export const getContentComments = async (filters = {}) => {
  try {
    const response = await api.get('/content/comments', { params: filters });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching content comments');
  }
};

export const createContentComment = async (commentData) => {
  try {
    const response = await api.post('/content/comments', commentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating content comment');
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const getYouTubeCategories = () => [
  { value: 'tutorial', label: 'Tutorial', icon: '🎓' },
  { value: 'vlog', label: 'Vlog', icon: '📹' },
  { value: 'project', label: 'Project', icon: '💻' },
  { value: 'interview', label: 'Interview', icon: '🎤' },
  { value: 'review', label: 'Review', icon: '⭐' },
  { value: 'educational', label: 'Educational', icon: '📚' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' }
];

export const getYouTubeStatuses = () => [
  { value: 'idea', label: 'Idea', color: 'gray' },
  { value: 'script_ready', label: 'Script Ready', color: 'blue' },
  { value: 'recording', label: 'Recording', color: 'yellow' },
  { value: 'editing', label: 'Editing', color: 'orange' },
  { value: 'scheduled', label: 'Scheduled', color: 'purple' },
  { value: 'published', label: 'Published', color: 'green' },
  { value: 'archived', label: 'Archived', color: 'red' }
];

export const getShortsFormats = () => [
  { value: 'reel', label: 'Reel', icon: '📱' },
  { value: 'short', label: 'Short', icon: '📹' },
  { value: 'carousel', label: 'Carousel', icon: '🔄' },
  { value: 'story', label: 'Story', icon: '📖' },
  { value: 'post', label: 'Post', icon: '📝' }
];

export const getShortsPlatforms = () => [
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'youtube_shorts', label: 'YouTube Shorts', icon: '▶️' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' }
];

export const getShortsStatuses = () => [
  { value: 'idea', label: 'Idea', color: 'gray' },
  { value: 'draft', label: 'Draft', color: 'blue' },
  { value: 'edited', label: 'Edited', color: 'yellow' },
  { value: 'scheduled', label: 'Scheduled', color: 'purple' },
  { value: 'posted', label: 'Posted', color: 'green' },
  { value: 'archived', label: 'Archived', color: 'red' }
];

export const getCourseDeliveryTypes = () => [
  { value: 'self_paced', label: 'Self-paced', icon: '📚' },
  { value: 'live', label: 'Live', icon: '🎥' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔄' }
];

export const getCourseStatuses = () => [
  { value: 'planning', label: 'Planning', color: 'gray' },
  { value: 'scripting', label: 'Scripting', color: 'blue' },
  { value: 'recording', label: 'Recording', color: 'yellow' },
  { value: 'editing', label: 'Editing', color: 'orange' },
  { value: 'live', label: 'Live', color: 'green' },
  { value: 'archived', label: 'Archived', color: 'red' }
];

export const getAssetCategories = () => [
  { value: 'scripts', label: 'Scripts', icon: '📝' },
  { value: 'thumbnails', label: 'Thumbnails', icon: '🖼️' },
  { value: 'raw_footage', label: 'Raw Footage', icon: '🎬' },
  { value: 'final_renders', label: 'Final Renders', icon: '🎥' },
  { value: 'slide_decks', label: 'Slide Decks', icon: '📊' },
  { value: 'pdfs', label: 'PDFs', icon: '📄' },
  { value: 'source_code', label: 'Source Code', icon: '💻' },
  { value: 'other', label: 'Other', icon: '📁' }
];

export const getAssetFileTypes = () => [
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'document', label: 'Document', icon: '📄' },
  { value: 'audio', label: 'Audio', icon: '🎵' },
  { value: 'archive', label: 'Archive', icon: '📦' },
  { value: 'other', label: 'Other', icon: '📁' }
];

export const getReviewStatuses = () => [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'needs_revision', label: 'Needs Revision', color: 'orange' }
];

export const getContentTypes = () => [
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'shorts', label: 'Shorts/Reels', icon: '📱' },
  { value: 'course', label: 'Course', icon: '📚' },
  { value: 'lesson', label: 'Lesson', icon: '🎓' }
];

export const getPerformancePlatforms = () => [
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' }
];

export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStatusColor = (status, statusList) => {
  const statusItem = statusList.find(s => s.value === status);
  return statusItem?.color || 'gray';
};

export const getStatusIcon = (status, statusList) => {
  const statusItem = statusList.find(s => s.value === status);
  return statusItem?.icon || '📄';
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const exportContentToCSV = (content, filename = 'content.csv') => {
  if (!content || !Array.isArray(content) || content.length === 0) {
    console.error('No content to export');
    return;
  }

  const headers = Object.keys(content[0]);
  const csvContent = [
    headers.join(','),
    ...content.map(item => headers.map(header => `"${item[header] || ''}"`).join(','))
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

const contentService = {
  // Dashboard
  getContentDashboard,
  
  // YouTube Content
  getYouTubeContent,
  createYouTubeContent,
  updateYouTubeContent,
  deleteYouTubeContent,
  
  // Shorts/Reels
  getShortsReels,
  createShortsReels,
  updateShortsReels,
  
  // Courses
  getCourses,
  createCourse,
  updateCourse,
  
  // Assets
  getAssets,
  createAsset,
  
  // Reviews
  getReviews,
  createReview,
  updateReviewStatus,
  
  // Performance
  getContentPerformance,
  createContentPerformance,
  
  // Comments
  getContentComments,
  createContentComment,
  
  // Utilities
  getYouTubeCategories,
  getYouTubeStatuses,
  getShortsFormats,
  getShortsPlatforms,
  getShortsStatuses,
  getCourseDeliveryTypes,
  getCourseStatuses,
  getAssetCategories,
  getAssetFileTypes,
  getReviewStatuses,
  getContentTypes,
  getPerformancePlatforms,
  formatDuration,
  formatFileSize,
  getStatusColor,
  getStatusIcon,
  formatCurrency,
  formatNumber,
  exportContentToCSV
};

export default contentService; 