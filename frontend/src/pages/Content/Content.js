import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Upload,
  Calendar,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  Users,
  Settings,
  BarChart3,
  Download,
  Share2,
  Star,
  FolderOpen,
  Calendar as CalendarIcon,
  TrendingUp,
  User,
  FileImage,
  FileVideo,
  FileArchive
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import * as contentService from '../../services/contentService';

const Content = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [youtubeContent, setYoutubeContent] = useState([]);
  const [shortsReels, setShortsReels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assets, setAssets] = useState([]);
  const [reviews, setReviews] = useState([]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'youtube', label: 'YouTube Content', icon: Play },
    { id: 'shorts', label: 'Shorts/Reels', icon: Video },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'calendar', label: 'Content Calendar', icon: CalendarIcon },
    { id: 'assets', label: 'Asset Library', icon: FolderOpen },
    { id: 'reviews', label: 'Reviews', icon: CheckCircle },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await contentService.getContentDashboard();
      setDashboardData(data?.data || {});
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData({});
    } finally {
      setLoading(false);
    }
  };

  const loadYouTubeContent = async () => {
    setLoading(true);
    try {
      const data = await contentService.getYouTubeContent();
      setYoutubeContent(data?.data?.content || data?.data || []);
    } catch (error) {
      console.error('Error loading YouTube content:', error);
      setYoutubeContent([]);
    } finally {
      setLoading(false);
    }
  };

  const loadShortsReels = async () => {
    setLoading(true);
    try {
      const data = await contentService.getShortsReels();
      setShortsReels(data?.data?.shorts || data?.data || []);
    } catch (error) {
      console.error('Error loading shorts/reels:', error);
      setShortsReels([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await contentService.getCourses();
      setCourses(data?.data?.courses || data?.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await contentService.getAssets();
      setAssets(data?.data?.assets || data?.data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await contentService.getReviews();
      setReviews(data?.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Load data based on tab
    switch (tabId) {
      case 'youtube':
        loadYouTubeContent();
        break;
      case 'shorts':
        loadShortsReels();
        break;
      case 'courses':
        loadCourses();
        break;
      case 'assets':
        loadAssets();
        break;
      case 'reviews':
        loadReviews();
        break;
      default:
        loadDashboardData();
    }
  };

  const getStatusColor = (status, statusList) => {
    const statusItem = statusList.find(s => s.value === status);
    return statusItem?.color || 'gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderDashboardTab = () => {
    if (!dashboardData) return <div>Loading...</div>;

    const { youtube, shorts, courses, reviews } = dashboardData;

    const dashboardCards = [
      {
        name: 'YouTube Videos',
        value: youtube.stats.reduce((sum, stat) => sum + stat.count, 0),
        change: '+12.5%',
        changeType: 'positive',
        icon: Play,
        color: 'bg-red-500',
        subItems: youtube.stats.map(stat => ({
          label: stat._id,
          value: stat.count
        }))
      },
      {
        name: 'Shorts/Reels',
        value: shorts.stats.reduce((sum, stat) => sum + stat.count, 0),
        change: '+8.2%',
        changeType: 'positive',
        icon: Video,
        color: 'bg-purple-500',
        subItems: shorts.stats.map(stat => ({
          label: stat._id,
          value: stat.count
        }))
      },
      {
        name: 'Courses',
        value: courses.stats.reduce((sum, stat) => sum + stat.count, 0),
        change: '+15.3%',
        changeType: 'positive',
        icon: BookOpen,
        color: 'bg-blue-500',
        subItems: courses.stats.map(stat => ({
          label: stat._id,
          value: stat.count
        }))
      },
      {
        name: 'Pending Reviews',
        value: reviews.pending,
        change: '3 items',
        changeType: 'neutral',
        icon: CheckCircle,
        color: 'bg-yellow-500'
      },
      {
        name: 'Overdue YouTube',
        value: youtube.overdue,
        change: '2 items',
        changeType: 'negative',
        icon: AlertCircle,
        color: 'bg-red-500'
      },
      {
        name: 'Overdue Shorts',
        value: shorts.overdue,
        change: '1 item',
        changeType: 'negative',
        icon: AlertCircle,
        color: 'bg-orange-500'
      }
    ];

    return (
      <div className="space-y-6">
        {/* Dashboard Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.name}
                </CardTitle>
                <div className={`p-2 ${card.color} rounded-md`}>
                  <card.icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className={`text-xs ${card.changeType === 'positive' ? 'text-green-600' : card.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {card.change}
                </p>
                {card.subItems && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="space-y-2">
                      {card.subItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{item.label.replace('_', ' ')}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <Plus className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Create YouTube Video</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <Video className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Create Short/Reel</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <BookOpen className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Create Course</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <Upload className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Upload Asset</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderYouTubeTab = () => {
    const youtubeStatuses = contentService.getYouTubeStatuses();
    const youtubeCategories = contentService.getYouTubeCategories();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">YouTube Content Planner</h3>
            <p className="text-sm text-muted-foreground">Manage your YouTube video pipeline</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Video
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search videos..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">All Categories</option>
                  {youtubeCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
                
                <select className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">All Status</option>
                  {youtubeStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {youtubeContent.map((content) => (
            <Card key={content._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center">
                      <Play className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{content.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getStatusColor(content.status, youtubeStatuses) === 'green' ? 'default' : 'secondary'}>
                          {content.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {content.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(content.publishDate)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {formatNumber(content.performance?.views || 0)} views
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {formatNumber(content.performance?.likes || 0)} likes
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {formatNumber(content.performance?.comments || 0)} comments
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {content.tags && content.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {content.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {content.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{content.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {youtubeContent.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Play className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No YouTube content yet</h3>
              <p className="text-muted-foreground mb-4">Start creating your first YouTube video</p>
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Create Video
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderShortsTab = () => {
    const shortsStatuses = contentService.getShortsStatuses();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Shorts/Reels Tracker</h3>
            <p className="text-sm text-muted-foreground">Manage short-form content across platforms</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Short
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shortsReels.map((short) => (
            <Card key={short._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                      <Video className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{short.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{short.hookLine}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={getStatusColor(short.status, shortsStatuses) === 'green' ? 'default' : 'secondary'}>
                          {short.status}
                        </Badge>
                        <Badge variant="outline">
                          {short.platform}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {short.assignedTo?.firstName} {short.assignedTo?.lastName}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(short.deadline)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {formatNumber(short.performance?.views || 0)} views
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {formatNumber(short.performance?.likes || 0)} likes
                    </span>
                  </div>
                </div>

                {/* Hashtags */}
                {short.hashtags && short.hashtags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {short.hashtags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {short.hashtags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{short.hashtags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {shortsReels.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Video className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No shorts/reels yet</h3>
              <p className="text-muted-foreground mb-4">Start creating your first short-form content</p>
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Create Short
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderCoursesTab = () => {
    const courseStatuses = contentService.getCourseStatuses();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Course Builder</h3>
            <p className="text-sm text-muted-foreground">Create and manage your online courses</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{course.topic}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={getStatusColor(course.status, courseStatuses) === 'green' ? 'default' : 'secondary'}>
                          {course.status}
                        </Badge>
                        <Badge variant="outline">
                          {course.delivery.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrollmentCount} enrollments
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {contentService.formatDuration(course.duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      {course.modules?.length || 0} modules
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {contentService.formatCurrency(course.revenue)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${course.completionPercentage || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    {course.completionPercentage?.toFixed(1) || 0}% complete
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <BookOpen className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">Start creating your first course</p>
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Create Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderCalendarTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Content Calendar</h3>
            <p className="text-sm text-muted-foreground">Visual calendar showing content publishing dates</p>
          </div>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">All Content</option>
              <option value="youtube">YouTube</option>
              <option value="shorts">Shorts/Reels</option>
              <option value="courses">Courses</option>
            </select>
            <Button variant="outline">Today</Button>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <CalendarIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">Calendar View</h3>
            <p className="text-muted-foreground mb-4">Visual calendar showing content publishing dates</p>
            <p className="text-sm text-muted-foreground">Calendar component will be implemented here</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAssetsTab = () => {
    const assetCategories = contentService.getAssetCategories();
    const assetFileTypes = contentService.getAssetFileTypes();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Asset Library</h3>
            <p className="text-sm text-muted-foreground">Manage your content assets and files</p>
          </div>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Asset
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search assets..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">All Categories</option>
                  {assetCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
                
                <select className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">All Types</option>
                  {assetFileTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-md flex items-center justify-center">
                      {asset.fileType === 'video' && <FileVideo className="w-5 h-5 text-orange-600" />}
                      {asset.fileType === 'image' && <FileImage className="w-5 h-5 text-orange-600" />}
                      {asset.fileType === 'document' && <FileText className="w-5 h-5 text-orange-600" />}
                      {asset.fileType === 'archive' && <FileArchive className="w-5 h-5 text-orange-600" />}
                      {!['video', 'image', 'document', 'archive'].includes(asset.fileType) && <FileText className="w-5 h-5 text-orange-600" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{asset.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{asset.category.replace('_', ' ')}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">
                          {asset.fileType}
                        </Badge>
                        {asset.isPublic && (
                          <Badge variant="default">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {asset.owner?.firstName} {asset.owner?.lastName}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(asset.updatedAt)}
                    </span>
                  </div>

                  {asset.fileSize && (
                    <div className="text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {contentService.formatFileSize(asset.fileSize)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {asset.tags && asset.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {asset.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{asset.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {assets.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <FolderOpen className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No assets yet</h3>
              <p className="text-muted-foreground mb-4">Start uploading your first asset</p>
              <Button>
                <Upload className="w-5 h-5 mr-2" />
                Upload Asset
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderReviewsTab = () => {
    const reviewStatuses = contentService.getReviewStatuses();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Review & Approval</h3>
            <p className="text-sm text-muted-foreground">Manage content reviews and approvals</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Review
          </Button>
        </div>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="divide-y">
              {reviews.map((review) => (
                <div key={review._id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-md flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">
                            {review.contentType} Review
                          </h4>
                          <Badge variant={getStatusColor(review.status, reviewStatuses) === 'green' ? 'default' : 'secondary'}>
                            {review.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Content ID: {review.contentId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Reviewer: {review.reviewer?.firstName} {review.reviewer?.lastName}
                        </p>
                        {review.comments && review.comments.length > 0 && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                              "{review.comments[review.comments.length - 1].comment}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm">Approve</Button>
                      <Button variant="destructive" size="sm">Reject</Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {reviews.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <CheckCircle className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-4">Content reviews will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'youtube':
        return renderYouTubeTab();
      case 'shorts':
        return renderShortsTab();
      case 'courses':
        return renderCoursesTab();
      case 'calendar':
        return renderCalendarTab();
      case 'assets':
        return renderAssetsTab();
      case 'reviews':
        return renderReviewsTab();
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Content & Course Operations</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Manage your YouTube content pipeline, shorts/reels, and course production lifecycle.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading content data...</span>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <TabsContent value={activeTab} className="space-y-6">
            {renderTabContent()}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Content; 