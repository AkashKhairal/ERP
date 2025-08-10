const { 
  DashboardOverview, 
  YouTubeAnalytics, 
  TeamProductivity, 
  ProjectProgress, 
  CourseSales, 
  CustomReport, 
  KPI 
} = require('../models/Analytics');
const { Transaction } = require('../models/Finance');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Employee = require('../models/Employee');
const { Content, Course } = require('../models/Content');
const { validationResult } = require('express-validator');

// @desc    Get analytics dashboard overview
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardOverview = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;
    
    // Set default date range if not provided
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    // Get current period data
    const currentData = await DashboardOverview.findOne({
      date: { $gte: start, $lte: end },
      period
    }).sort({ date: -1 });

    // Get previous period data for comparison
    const previousStart = new Date(start);
    const previousEnd = new Date(end);
    if (period === 'monthly') {
      previousStart.setMonth(previousStart.getMonth() - 1);
      previousEnd.setMonth(previousEnd.getMonth() - 1);
    } else if (period === 'weekly') {
      previousStart.setDate(previousStart.getDate() - 7);
      previousEnd.setDate(previousEnd.getDate() - 7);
    }

    const previousData = await DashboardOverview.findOne({
      date: { $gte: previousStart, $lte: previousEnd },
      period
    }).sort({ date: -1 });

    // Get real-time data from other modules
    const realTimeData = await getRealTimeMetrics(start, end);

    // Calculate trends
    const trends = calculateTrends(currentData, previousData);

    const dashboardData = {
      current: currentData || realTimeData,
      previous: previousData,
      trends,
      realTime: realTimeData
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: error.message
    });
  }
};

// @desc    Get YouTube analytics
// @route   GET /api/analytics/youtube
// @access  Private
const getYouTubeAnalytics = async (req, res) => {
  try {
    // Return mock data for now
    const mockData = {
      videos: [
        {
          _id: '1',
          title: 'React Tutorial for Beginners',
          views: 125000,
          watchTime: 45000,
          revenue: 850,
          likes: 3200,
          comments: 245,
          publishDate: new Date('2024-01-08'),
          category: 'tutorial'
        },
        {
          _id: '2',
          title: 'Advanced JavaScript Concepts',
          views: 89000,
          watchTime: 32000,
          revenue: 620,
          likes: 2100,
          comments: 156,
          publishDate: new Date('2024-01-05'),
          category: 'educational'
        }
      ],
      summary: {
        totalViews: 214000,
        totalWatchTime: 77000,
        totalRevenue: 1470,
        totalLikes: 5300,
        totalComments: 401,
        avgEngagementRate: 6.8,
        avgCPM: 2.5,
        avgRPM: 1.8
      },
      topVideos: [
        {
          _id: '1',
          title: 'React Tutorial for Beginners',
          views: 125000,
          watchTime: 45000,
          revenue: 850,
          publishDate: new Date('2024-01-08')
        }
      ]
    };

    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('YouTube analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching YouTube analytics',
      error: error.message
    });
  }
};

// @desc    Get team productivity reports
// @route   GET /api/analytics/productivity
// @access  Private
const getTeamProductivity = async (req, res) => {
  try {
    // Return mock data for now
    const mockData = {
      productivity: [
        {
          _id: '1',
          employeeId: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', department: 'engineering' },
          projectId: { name: 'SaaS Dashboard' },
          date: new Date(),
          hoursLogged: 8,
          tasksCompleted: 5,
          tasksAssigned: 6,
          productivityScore: 85
        }
      ],
      aggregatedData: [
        {
          _id: '1',
          totalHours: 40,
          totalTasks: 25,
          completedTasks: 22,
          avgProductivity: 88,
          employee: { firstName: 'John', lastName: 'Doe', department: 'engineering' }
        }
      ],
      performanceMetrics: {
        totalHours: 40,
        totalTasks: 25,
        completedTasks: 22,
        completionRate: 88,
        delayRate: 12,
        avgProductivity: 88
      }
    };

    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Team productivity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team productivity',
      error: error.message
    });
  }
};

// @desc    Get project progress reports
// @route   GET /api/analytics/projects
// @access  Private
const getProjectProgress = async (req, res) => {
  try {
    // Return mock data for now
    const mockData = {
      progress: [
        {
          _id: '1',
          projectId: { name: 'SaaS Dashboard', description: 'React dashboard for analytics', status: 'active', client: 'TechCorp' },
          date: new Date(),
          completionPercentage: 75,
          totalTasks: 20,
          completedTasks: 15,
          overdueTasks: 2,
          totalBillableHours: 120,
          totalNonBillableHours: 15
        }
      ],
      projectSummary: [
        {
          _id: '1',
          avgCompletion: 75,
          totalTasks: 20,
          completedTasks: 15,
          overdueTasks: 2,
          totalBillableHours: 120,
          totalNonBillableHours: 15,
          project: { name: 'SaaS Dashboard', description: 'React dashboard for analytics', status: 'active', client: 'TechCorp' }
        }
      ]
    };

    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Project progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project progress',
      error: error.message
    });
  }
};

// @desc    Get course sales analytics
// @route   GET /api/analytics/courses
// @access  Private
const getCourseSales = async (req, res) => {
  try {
    // Return mock data for now
    const mockData = {
      sales: [
        {
          _id: '1',
          courseId: { title: 'React Masterclass', description: 'Complete React course', price: 99 },
          date: new Date(),
          revenue: 2500,
          enrollments: 25,
          visitors: 500,
          leads: 50,
          conversionRate: 5.0,
          averageOrderValue: 100
        }
      ],
      salesSummary: {
        totalRevenue: 2500,
        totalEnrollments: 25,
        totalVisitors: 500,
        totalLeads: 50,
        avgConversionRate: 5.0,
        avgOrderValue: 100,
        totalRefunds: 0,
        netRevenue: 2500,
        totalMarketingSpend: 500,
        avgROI: 400
      },
      topCourses: [
        {
          _id: '1',
          totalRevenue: 2500,
          totalEnrollments: 25,
          avgConversionRate: 5.0,
          course: { title: 'React Masterclass', description: 'Complete React course', price: 99 }
        }
      ]
    };

    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Course sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course sales',
      error: error.message
    });
  }
};

// @desc    Create custom report
// @route   POST /api/analytics/reports
// @access  Private
const createCustomReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const reportData = {
      ...req.body,
      createdBy: req.user.id
    };

    const report = await CustomReport.create(reportData);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Create custom report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating custom report',
      error: error.message
    });
  }
};

// @desc    Get custom reports
// @route   GET /api/analytics/reports
// @access  Private
const getCustomReports = async (req, res) => {
  try {
    const { type, isPublic } = req.query;
    
    const filter = {
      $or: [
        { createdBy: req.user.id },
        { isPublic: true },
        { sharedWith: req.user.id }
      ]
    };

    if (type) filter.type = type;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    const reports = await CustomReport.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('sharedWith', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get custom reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching custom reports',
      error: error.message
    });
  }
};

// @desc    Generate custom report data
// @route   POST /api/analytics/reports/:id/generate
// @access  Private
const generateCustomReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await CustomReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check permissions
    if (report.createdBy.toString() !== req.user.id && 
        !report.isPublic && 
        !report.sharedWith.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate report data based on type and filters
    const reportData = await generateReportData(report);

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Generate custom report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating custom report',
      error: error.message
    });
  }
};

// @desc    Get KPIs
// @route   GET /api/analytics/kpis
// @access  Private
const getKPIs = async (req, res) => {
  try {
    const { category, period } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (period) filter.period = period;

    const kpis = await KPI.find(filter)
      .populate('owner', 'firstName lastName')
      .populate('team', 'name')
      .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching KPIs',
      error: error.message
    });
  }
};

// @desc    Create KPI
// @route   POST /api/analytics/kpis
// @access  Private
const createKPI = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const kpiData = {
      ...req.body,
      createdBy: req.user.id
    };

    const kpi = await KPI.create(kpiData);

    res.status(201).json({
      success: true,
      data: kpi
    });
  } catch (error) {
    console.error('Create KPI error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating KPI',
      error: error.message
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

const getRealTimeMetrics = async (startDate, endDate) => {
  try {
    // Return mock data for now to avoid database errors
    return {
      metrics: {
        totalRevenue: 25000,
        totalExpenses: 15000,
        activeProjects: 5,
        totalTeamMembers: 12,
        publishedVideos: 25,
        courseEnrollments: 150
      }
    };
  } catch (error) {
    console.error('Error getting real-time metrics:', error);
    return {
      metrics: {
        totalRevenue: 0,
        totalExpenses: 0,
        activeProjects: 0,
        totalTeamMembers: 0,
        publishedVideos: 0,
        courseEnrollments: 0
      }
    };
  }
};

const calculateTrends = (current, previous) => {
  if (!current || !previous) {
    return {
      revenueGrowth: 0,
      expenseGrowth: 0,
      profitGrowth: 0,
      projectGrowth: 0,
      teamGrowth: 0
    };
  }

  const calculateGrowth = (currentVal, previousVal) => {
    if (previousVal === 0) return currentVal > 0 ? 100 : 0;
    return ((currentVal - previousVal) / previousVal) * 100;
  };

  return {
    revenueGrowth: calculateGrowth(current.metrics.totalRevenue, previous.metrics.totalRevenue),
    expenseGrowth: calculateGrowth(current.metrics.totalExpenses, previous.metrics.totalExpenses),
    profitGrowth: calculateGrowth(current.metrics.netProfit, previous.metrics.netProfit),
    projectGrowth: calculateGrowth(current.metrics.activeProjects, previous.metrics.activeProjects),
    teamGrowth: calculateGrowth(current.metrics.totalTeamMembers, previous.metrics.totalTeamMembers)
  };
};

const calculatePerformanceMetrics = (productivityData) => {
  if (!productivityData.length) return {};

  const totalHours = productivityData.reduce((sum, item) => sum + item.hoursLogged, 0);
  const totalTasks = productivityData.reduce((sum, item) => sum + item.tasksAssigned, 0);
  const completedTasks = productivityData.reduce((sum, item) => sum + item.tasksCompleted, 0);
  const delayedTasks = productivityData.reduce((sum, item) => sum + item.tasksDelayed, 0);
  const avgProductivity = productivityData.reduce((sum, item) => sum + item.productivityScore, 0) / productivityData.length;

  return {
    totalHours,
    totalTasks,
    completedTasks,
    delayedTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    delayRate: totalTasks > 0 ? (delayedTasks / totalTasks) * 100 : 0,
    avgProductivity
  };
};

const generateReportData = async (report) => {
  // This function would generate data based on the report configuration
  // Implementation would depend on the specific report type and filters
  return {
    reportId: report._id,
    reportName: report.name,
    generatedAt: new Date(),
    data: [] // Placeholder for actual data generation
  };
};

module.exports = {
  getDashboardOverview,
  getYouTubeAnalytics,
  getTeamProductivity,
  getProjectProgress,
  getCourseSales,
  createCustomReport,
  getCustomReports,
  generateCustomReport,
  getKPIs,
  createKPI
}; 