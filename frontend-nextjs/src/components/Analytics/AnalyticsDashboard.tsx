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
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title text-gray-900">Analytics Integration</h1>
        <p className="text-gray-600 mt-1 font-medium tracking-tight">
          Real-time monitoring and performance insights powered by Vercel Analytics
        </p>
      </div>

      {/* Analytics Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="flex items-center gap-3 card-title text-gray-900">
              <div className="p-2 rounded-full bg-blue-50 text-blue-500">
                <BarChart3 className="h-5 w-5" />
              </div>
              Vercel Analytics
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
              Advanced user behavior and engagement analytics platform
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 tracking-tight">User Tracking</span>
              </div>
              <Badge className="bg-green-50/80 text-green-700 border border-green-200/50 font-medium tracking-tight">
                ✓ Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 tracking-tight">Page Views</span>
              </div>
              <Badge className="bg-green-50/80 text-green-700 border border-green-200/50 font-medium tracking-tight">
                ✓ Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 tracking-tight">Custom Events</span>
              </div>
              <Badge className="bg-green-50/80 text-green-700 border border-green-200/50 font-medium tracking-tight">
                ✓ Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="flex items-center gap-3 card-title text-gray-900">
              <div className="p-2 rounded-full bg-orange-50 text-orange-500">
                <Zap className="h-5 w-5" />
              </div>
              Speed Insights
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
              Real User Monitoring (RUM) and Core Web Vitals performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 tracking-tight">Load Times</span>
              </div>
              <Badge className="bg-green-50/80 text-green-700 border border-green-200/50 font-medium tracking-tight">
                ✓ Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 tracking-tight">Core Web Vitals</span>
              </div>
              <Badge className="bg-green-50/80 text-green-700 border border-green-200/50 font-medium tracking-tight">
                ✓ Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 tracking-tight">Real User Data</span>
              </div>
              <Badge className="bg-green-50/80 text-green-700 border border-green-200/50 font-medium tracking-tight">
                ✓ Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracked Events */}
      <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
        <CardHeader className="p-0 pb-6">
          <CardTitle className="card-title text-gray-900">Event Tracking Configuration</CardTitle>
          <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
            Comprehensive custom events being monitored across your application
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/50">
              <h4 className="font-semibold text-blue-900 tracking-tight">🔐 Authentication</h4>
              <p className="text-sm text-blue-700 font-medium mt-1">
                Login, Register, Logout events
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-green-50/50 border border-green-200/50">
              <h4 className="font-semibold text-green-900 tracking-tight">📁 Projects</h4>
              <p className="text-sm text-green-700 font-medium mt-1">
                Project creation, completion, deletion
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/50">
              <h4 className="font-semibold text-purple-900 tracking-tight">✓ Tasks</h4>
              <p className="text-sm text-purple-700 font-medium mt-1">
                Task management and completion
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/50">
              <h4 className="font-semibold text-orange-900 tracking-tight">👥 Team Events</h4>
              <p className="text-sm text-orange-700 font-medium mt-1">
                Team creation and member management
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200/50">
              <h4 className="font-semibold text-pink-900 tracking-tight">📝 Content</h4>
              <p className="text-sm text-pink-700 font-medium mt-1">
                Content creation and publishing
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/50">
              <h4 className="font-semibold text-indigo-900 tracking-tight">📊 User Engagement</h4>
              <p className="text-sm text-indigo-700 font-medium mt-1">
                Feature usage and interactions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
        <CardHeader className="p-0 pb-6">
          <CardTitle className="card-title text-gray-900">Integration Status</CardTitle>
          <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
            Current deployment status of analytics packages and configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-200/50">
              <div>
                <h4 className="font-semibold text-gray-900 tracking-tight">Vercel Analytics Package</h4>
                <p className="text-sm text-gray-600 font-medium">@vercel/analytics • v1.3.1</p>
              </div>
              <Badge className="bg-green-50/80 text-green-700 border border-green-200/50 font-medium tracking-tight">
                ✓ Installed
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-200/50">
              <div>
                <h4 className="font-semibold text-gray-900 tracking-tight">Speed Insights Package</h4>
                <p className="text-sm text-gray-600 font-medium">@vercel/speed-insights • v1.0.12</p>
              </div>
              <Badge className="bg-green-50/80 text-green-700 border border-green-200/50 font-medium tracking-tight">
                ✓ Installed
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-200/50">
              <div>
                <h4 className="font-semibold text-gray-900 tracking-tight">Custom Analytics Helper</h4>
                <p className="text-sm text-gray-600 font-medium">lib/analytics.ts • Event tracking utilities</p>
              </div>
              <Badge className="bg-blue-50/80 text-blue-700 border border-blue-200/50 font-medium tracking-tight">
                ⚙️ Configured
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
        <CardHeader className="p-0 pb-6">
          <CardTitle className="card-title text-gray-900">Access Your Analytics</CardTitle>
          <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
            Step-by-step guide to accessing your comprehensive analytics data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 tracking-tight">Visit Vercel Dashboard</p>
                <p className="text-sm text-gray-600 font-medium mt-1">
                  Navigate to your project in the Vercel dashboard to access real-time analytics
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-sm font-bold text-white">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 tracking-tight">Navigate to Analytics</p>
                <p className="text-sm text-gray-600 font-medium mt-1">
                  Click on the "Analytics" tab to view comprehensive user behavior and engagement data
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center text-sm font-bold text-white">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 tracking-tight">Monitor Performance</p>
                <p className="text-sm text-gray-600 font-medium mt-1">
                  Review Core Web Vitals and performance metrics in the "Speed Insights" section
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




