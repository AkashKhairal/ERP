'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock,
  Activity,
  Zap,
  Globe
} from 'lucide-react'

const AnalyticsDashboard = () => {
  return (
    <div className="space-y-mobile">
      {/* Header */}
      <div className="header-mobile">
        <div className="header-content">
          <h1 className="text-responsive-xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-responsive-sm">
            Monitor your app's performance and user engagement
          </p>
        </div>
      </div>

      {/* Analytics Info Cards */}
      <div className="grid-mobile-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Vercel Analytics
            </CardTitle>
            <CardDescription>
              Real-time user behavior and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">User Tracking</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Page Views</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Custom Events</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Speed Insights
            </CardTitle>
            <CardDescription>
              Real User Monitoring (RUM) and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Load Times</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Core Web Vitals</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Real User Data</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracked Events */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked Events</CardTitle>
          <CardDescription>
            Custom events being tracked in your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid-mobile-3">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Authentication</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Login, Register, Logout events
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-900 dark:text-green-100">Projects</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Project creation, completion, deletion
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <h4 className="font-medium text-purple-900 dark:text-purple-100">Tasks</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Task management and completion
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <h4 className="font-medium text-orange-900 dark:text-orange-100">Team Events</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Team creation and member management
              </p>
            </div>
            <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-950/20">
              <h4 className="font-medium text-pink-900 dark:text-pink-100">Content</h4>
              <p className="text-sm text-pink-700 dark:text-pink-300 mt-1">
                Content creation and publishing
              </p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
              <h4 className="font-medium text-indigo-900 dark:text-indigo-100">User Engagement</h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                Feature usage and interactions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            Current status of analytics integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Vercel Analytics Package</h4>
                <p className="text-sm text-muted-foreground">@vercel/analytics</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Installed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Speed Insights Package</h4>
                <p className="text-sm text-muted-foreground">@vercel/speed-insights</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Installed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Custom Analytics Helper</h4>
                <p className="text-sm text-muted-foreground">lib/analytics.ts</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Configured</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to View Analytics</CardTitle>
          <CardDescription>
            Access your analytics data through Vercel dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                1
              </div>
              <div>
                <p className="font-medium">Visit Vercel Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Go to your project in the Vercel dashboard
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                2
              </div>
              <div>
                <p className="font-medium">Navigate to Analytics</p>
                <p className="text-sm text-muted-foreground">
                  Click on the "Analytics" tab to view user behavior data
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                3
              </div>
              <div>
                <p className="font-medium">Check Speed Insights</p>
                <p className="text-sm text-muted-foreground">
                  View performance metrics in the "Speed Insights" section
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsDashboard

