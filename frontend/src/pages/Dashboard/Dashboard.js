import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Play, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowUpRight,
  BarChart3,
  Activity,
  Target
} from 'lucide-react';
import { LineChartComponent, BarChartComponent } from '../../components/ui/charts';
import GoogleAccountInfo from '../../components/GoogleAccountInfo';

const Dashboard = () => {
  const { isAuthenticated, user, logActivity, getRecentActivities } = useAuth();
  const [stats] = useState({
    totalUsers: 24,
    activeProjects: 8,
    monthlyRevenue: 45231,
    youtubeViews: 2300000
  });

  // Get real recent activities
  const recentActivities = getRecentActivities();

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Log dashboard visit
  useEffect(() => {
    if (user) {
      logActivity('Dashboard Visit', 'User accessed the main dashboard');
    }
  }, [user, logActivity]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {user?.firstName || 'User'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your CreatorBase today - {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              +1 new this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YouTube Views</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.youtubeViews / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Overview Card */}
        <Card className="h-full hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <div>
                <CardTitle className="text-sm font-medium">Revenue Overview</CardTitle>
                <CardDescription className="text-xs">Monthly revenue trends</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <LineChartComponent 
                data={[
                  { name: 'Jan', value: 4000 },
                  { name: 'Feb', value: 3000 },
                  { name: 'Mar', value: 2000 },
                  { name: 'Apr', value: 2780 },
                  { name: 'May', value: 1890 },
                  { name: 'Jun', value: 2390 },
                ]}
                color="#10b981"
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Performance Card */}
        <Card className="h-full hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <div>
                <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
                <CardDescription className="text-xs">Task completion rates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <BarChartComponent 
                data={[
                  { name: 'Dev Team', value: 85 },
                  { name: 'Design', value: 92 },
                  { name: 'Marketing', value: 78 },
                  { name: 'Content', value: 88 },
                ]}
                color="#3b82f6"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Performance Card */}
        <Card className="h-full hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <div>
                <CardTitle className="text-sm font-medium">Content Performance</CardTitle>
                <CardDescription className="text-xs">YouTube & course metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <LineChartComponent 
                data={[
                  { name: 'Week 1', value: 1200 },
                  { name: 'Week 2', value: 1800 },
                  { name: 'Week 3', value: 2200 },
                  { name: 'Week 4', value: 2800 },
                ]}
                color="#f59e0b"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities Card */}
        <Card className="h-full hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <div>
                <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
                <CardDescription className="text-xs">Latest app events</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.user}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.action} - {activity.module}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Status Card */}
        <Card className="h-full hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <div>
                <CardTitle className="text-sm font-medium">Project Status</CardTitle>
                <CardDescription className="text-xs">Active project overview</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Projects</span>
                <Badge variant="secondary">{stats.activeProjects}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>In Progress</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>On Hold</span>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="h-full hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <div>
                <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
                <CardDescription className="text-xs">Key metrics at a glance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">24</div>
                  <div className="text-xs text-muted-foreground">Team Members</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹45K</div>
                  <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">2.3M</div>
                  <div className="text-xs text-muted-foreground">YouTube Views</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">156</div>
                  <div className="text-xs text-muted-foreground">Tasks Done</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Add Employee</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Create Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">New Task</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <ArrowUpRight className="h-5 w-5" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Google Account Information */}
      <GoogleAccountInfo />
    </div>
  );
};

export default Dashboard; 