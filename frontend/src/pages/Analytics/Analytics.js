import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  ThumbsUp, 
  Share2, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Target, 
  Download,
  Play,
  BookOpen,
  FolderOpen,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AreaChartComponent, LineChartComponent, BarChartComponent, PieChartComponent } from '../../components/ui/charts';
import * as analyticsService from '../../services/analyticsService';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'youtube', label: 'YouTube Analytics', icon: Play },
    { id: 'team', label: 'Team Productivity', icon: Users },
    { id: 'projects', label: 'Project Progress', icon: FolderOpen },
    { id: 'courses', label: 'Course Sales', icon: BookOpen },
    { id: 'reports', label: 'Custom Reports', icon: PieChart },
    { id: 'kpis', label: 'KPIs', icon: Target },
  ];

  // Sample data for charts
  const visitorData = [
    { name: 'Apr 6', mobile: 400, desktop: 240 },
    { name: 'Apr 12', mobile: 300, desktop: 139 },
    { name: 'Apr 18', mobile: 200, desktop: 980 },
    { name: 'Apr 24', mobile: 278, desktop: 390 },
    { name: 'Apr 30', mobile: 189, desktop: 480 },
    { name: 'May 6', mobile: 239, desktop: 380 },
    { name: 'May 12', mobile: 349, desktop: 430 },
  ];

  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
  ];

  const salesData = [
    { name: 'Jan', sales: 400 },
    { name: 'Feb', sales: 300 },
    { name: 'Mar', sales: 200 },
    { name: 'Apr', sales: 278 },
    { name: 'May', sales: 189 },
    { name: 'Jun', sales: 239 },
    { name: 'Jul', sales: 349 },
  ];

  const pieData = [
    { name: 'Desktop', value: 400 },
    { name: 'Mobile', value: 300 },
    { name: 'Tablet', value: 200 },
    { name: 'Other', value: 100 },
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      await analyticsService.getDashboardOverview();
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderOverviewTab = () => {
    const overviewCards = [
      {
        name: 'Total Revenue',
        value: formatCurrency(45231),
        change: '+20.1%',
        changeType: 'positive',
        icon: TrendingUp,
        color: 'text-green-600'
      },
      {
        name: 'Total Views',
        value: formatNumber(2300000),
        change: '+15.3%',
        changeType: 'positive',
        icon: Eye,
        color: 'text-blue-600'
      },
      {
        name: 'Active Users',
        value: formatNumber(12500),
        change: '+8.2%',
        changeType: 'positive',
        icon: Users,
        color: 'text-purple-600'
      },
      {
        name: 'Course Sales',
        value: formatCurrency(18900),
        change: '+12.5%',
        changeType: 'positive',
        icon: BookOpen,
        color: 'text-orange-600'
      }
    ];

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.name}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                      {card.change}
                    </span> from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <AreaChartComponent data={visitorData} />
          </div>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>
                Best performing videos this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      React Tutorial for Beginners
                    </p>
                    <p className="text-sm text-muted-foreground">
                      125K views
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">+12.5%</p>
                    <p className="text-xs text-muted-foreground">
                      vs last month
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Node.js API Development
                    </p>
                    <p className="text-sm text-muted-foreground">
                      98K views
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">+8.2%</p>
                    <p className="text-xs text-muted-foreground">
                      vs last month
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      TypeScript Best Practices
                    </p>
                    <p className="text-sm text-muted-foreground">
                      87K views
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">+15.3%</p>
                    <p className="text-xs text-muted-foreground">
                      vs last month
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <LineChartComponent data={revenueData} />
          </div>

          <div className="col-span-3">
            <BarChartComponent data={salesData} />
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common analytics operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <Download className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Export Report</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Set KPI</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Schedule Report</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <Share2 className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Share Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderYouTubeTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">YouTube Analytics</h3>
            <p className="text-sm text-muted-foreground">Track your YouTube channel performance</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* YouTube Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Views
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3M</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subscribers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45.2K</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Watch Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">125K hrs</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,450</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+20.1%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* YouTube Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <AreaChartComponent data={visitorData} />
          </div>

          <div className="col-span-3">
            <PieChartComponent data={pieData} />
          </div>
        </div>
      </div>
    );
  };

  const renderTeamTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Team Productivity</h3>
            <p className="text-sm text-muted-foreground">Track team performance and productivity</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>John Doe</CardTitle>
              <CardDescription>Frontend Developer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Tasks Completed</span>
                  <span className="font-medium">24/30</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hours Logged</span>
                  <span className="font-medium">42.5</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <div className="text-sm text-muted-foreground">
                  80% completion rate
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sarah Wilson</CardTitle>
              <CardDescription>Backend Developer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Tasks Completed</span>
                  <span className="font-medium">28/30</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hours Logged</span>
                  <span className="font-medium">45.2</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '93%' }}></div>
                </div>
                <div className="text-sm text-muted-foreground">
                  93% completion rate
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mike Johnson</CardTitle>
              <CardDescription>UI/UX Designer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Tasks Completed</span>
                  <span className="font-medium">22/30</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hours Logged</span>
                  <span className="font-medium">38.7</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>
                <div className="text-sm text-muted-foreground">
                  73% completion rate
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderProjectsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Project Progress</h3>
            <p className="text-sm text-muted-foreground">Track project milestones and completion</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Mobile App Development</CardTitle>
              <CardDescription>React Native App</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">75%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tasks</span>
                  <span>15/20 completed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Deadline</span>
                  <span>Dec 15, 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Website Redesign</CardTitle>
              <CardDescription>Company Website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">90%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tasks</span>
                  <span>18/20 completed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Deadline</span>
                  <span>Dec 10, 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Development</CardTitle>
              <CardDescription>Backend API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">60%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tasks</span>
                  <span>12/20 completed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Deadline</span>
                  <span>Dec 20, 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderCoursesTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Course Sales Analytics</h3>
            <p className="text-sm text-muted-foreground">Track your online course performance</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(18900)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Enrollments
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5.3%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.2</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <LineChartComponent data={revenueData} />
          </div>

          <div className="col-span-3">
            <BarChartComponent data={salesData} />
          </div>
        </div>
      </div>
    );
  };

  const renderReportsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Custom Reports</h3>
            <p className="text-sm text-muted-foreground">Create and manage custom analytics reports</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>Comprehensive monthly report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Last Updated</span>
                  <span>Dec 1, 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Schedule</span>
                  <span>Monthly</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Summary</CardTitle>
              <CardDescription>Weekly performance summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Last Updated</span>
                  <span>Dec 4, 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Schedule</span>
                  <span>Weekly</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quarterly Review</CardTitle>
              <CardDescription>Quarterly business review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Last Updated</span>
                  <span>Oct 1, 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Schedule</span>
                  <span>Quarterly</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderKPIsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Key Performance Indicators</h3>
            <p className="text-sm text-muted-foreground">Track and manage your KPIs</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add KPI
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
              <CardDescription>Monthly revenue growth target</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Target</span>
                  <span>15%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current</span>
                  <span className="text-green-600">20.1%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    On Track
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Daily active users target</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Target</span>
                  <span>10K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current</span>
                  <span className="text-yellow-600">8.5K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Behind
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Quality</CardTitle>
              <CardDescription>Average content rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Target</span>
                  <span>4.5/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current</span>
                  <span className="text-green-600">4.8/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Exceeding
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'youtube':
        return renderYouTubeTab();
      case 'team':
        return renderTeamTab();
      case 'projects':
        return renderProjectsTab();
      case 'courses':
        return renderCoursesTab();
      case 'reports':
        return renderReportsTab();
      case 'kpis':
        return renderKPIsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Comprehensive analytics and reporting for your business performance.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
            <span className="ml-2 text-muted-foreground">Loading analytics data...</span>
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

export default Analytics; 