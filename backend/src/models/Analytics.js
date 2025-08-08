const mongoose = require('mongoose');

// Dashboard Overview Data Schema
const dashboardOverviewSchema = new mongoose.Schema({
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], required: true },
  date: { type: Date, required: true },
  metrics: {
    totalRevenue: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    burnRate: { type: Number, default: 0 },
    activeProjects: { type: Number, default: 0 },
    totalTeamMembers: { type: Number, default: 0 },
    publishedVideos: { type: Number, default: 0 },
    courseEnrollments: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    customerAcquisition: { type: Number, default: 0 }
  },
  trends: {
    revenueGrowth: { type: Number, default: 0 },
    expenseGrowth: { type: Number, default: 0 },
    profitGrowth: { type: Number, default: 0 },
    projectGrowth: { type: Number, default: 0 },
    teamGrowth: { type: Number, default: 0 }
  },
  breakdown: {
    revenueBySource: {
      youtube: { type: Number, default: 0 },
      client: { type: Number, default: 0 },
      course: { type: Number, default: 0 },
      affiliate: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    expensesByCategory: {
      salary: { type: Number, default: 0 },
      marketing: { type: Number, default: 0 },
      tools: { type: Number, default: 0 },
      rent: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// YouTube Analytics Schema
const youtubeAnalyticsSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  publishDate: { type: Date, required: true },
  views: { type: Number, default: 0 },
  watchTime: { type: Number, default: 0 }, // in minutes
  avgViewPercentage: { type: Number, default: 0 }, // percentage
  cpm: { type: Number, default: 0 }, // Cost Per Mille
  rpm: { type: Number, default: 0 }, // Revenue Per Mille
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 }, // Click Through Rate
  revenue: { type: Number, default: 0 },
  category: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  thumbnail: { type: String },
  duration: { type: Number, default: 0 }, // in seconds
  status: { type: String, enum: ['public', 'private', 'unlisted'], default: 'public' },
  analyticsDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Team Productivity Schema
const teamProductivitySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  date: { type: Date, required: true },
  hoursLogged: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  tasksAssigned: { type: Number, default: 0 },
  tasksDelayed: { type: Number, default: 0 },
  productivityScore: { type: Number, default: 0 }, // 0-100
  efficiency: { type: Number, default: 0 }, // percentage
  qualityScore: { type: Number, default: 0 }, // 0-100
  notes: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Project Progress Schema
const projectProgressSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  date: { type: Date, required: true },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  totalTasks: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  overdueTasks: { type: Number, default: 0 },
  openBugs: { type: Number, default: 0 },
  billableHours: { type: Number, default: 0 },
  nonBillableHours: { type: Number, default: 0 },
  budgetUtilization: { type: Number, default: 0 }, // percentage
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  milestones: [{
    name: { type: String, required: true },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    completionDate: { type: Date }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Course Sales Analytics Schema
const courseSalesSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  courseName: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  revenue: { type: Number, default: 0 },
  enrollments: { type: Number, default: 0 },
  visitors: { type: Number, default: 0 },
  leads: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 }, // percentage
  averageOrderValue: { type: Number, default: 0 },
  refunds: { type: Number, default: 0 },
  netRevenue: { type: Number, default: 0 },
  marketingSpend: { type: Number, default: 0 },
  roi: { type: Number, default: 0 }, // Return on Investment
  category: { type: String, trim: true },
  instructor: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Custom Report Schema
const customReportSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { type: String, enum: ['dashboard', 'youtube', 'productivity', 'project', 'course', 'finance', 'custom'], required: true },
  filters: {
    dateRange: {
      start: { type: Date },
      end: { type: Date }
    },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    categories: [{ type: String }],
    status: [{ type: String }]
  },
  metrics: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['sum', 'average', 'count', 'percentage'], required: true },
    field: { type: String, required: true },
    displayName: { type: String, required: true }
  }],
  visualization: {
    type: { type: String, enum: ['bar', 'line', 'pie', 'table', 'heatmap'], default: 'bar' },
    xAxis: { type: String },
    yAxis: { type: String },
    groupBy: { type: String }
  },
  schedule: {
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    recipients: [{ type: String }], // email addresses
    lastSent: { type: Date }
  },
  isPublic: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// KPI Schema for tracking key performance indicators
const kpiSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, enum: ['financial', 'operational', 'customer', 'learning'], required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  unit: { type: String, required: true }, // e.g., 'USD', 'percentage', 'count'
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], required: true },
  trend: { type: String, enum: ['increasing', 'decreasing', 'stable'], default: 'stable' },
  status: { type: String, enum: ['on-track', 'at-risk', 'behind'], default: 'on-track' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes for performance optimization
dashboardOverviewSchema.index({ date: 1, period: 1 });
youtubeAnalyticsSchema.index({ publishDate: -1, views: -1 });
youtubeAnalyticsSchema.index({ analyticsDate: 1 });
teamProductivitySchema.index({ employeeId: 1, date: 1 });
teamProductivitySchema.index({ projectId: 1, date: 1 });
projectProgressSchema.index({ projectId: 1, date: 1 });
courseSalesSchema.index({ courseId: 1, date: 1 });
customReportSchema.index({ createdBy: 1, type: 1 });
kpiSchema.index({ category: 1, period: 1 });

// Virtual properties
dashboardOverviewSchema.virtual('profitMargin').get(function() {
  return this.metrics.totalRevenue > 0 ? (this.metrics.netProfit / this.metrics.totalRevenue) * 100 : 0;
});

youtubeAnalyticsSchema.virtual('engagementRate').get(function() {
  return this.views > 0 ? ((this.likes + this.comments + this.shares) / this.views) * 100 : 0;
});

teamProductivitySchema.virtual('completionRate').get(function() {
  return this.tasksAssigned > 0 ? (this.tasksCompleted / this.tasksAssigned) * 100 : 0;
});

// Static methods for data aggregation
dashboardOverviewSchema.statics.getOverviewData = async function(startDate, endDate, period = 'monthly') {
  return await this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        period: period
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$metrics.totalRevenue' },
        totalExpenses: { $sum: '$metrics.totalExpenses' },
        netProfit: { $sum: '$metrics.netProfit' },
        activeProjects: { $avg: '$metrics.activeProjects' },
        totalTeamMembers: { $avg: '$metrics.totalTeamMembers' },
        publishedVideos: { $sum: '$metrics.publishedVideos' },
        courseEnrollments: { $sum: '$metrics.courseEnrollments' }
      }
    }
  ]);
};

youtubeAnalyticsSchema.statics.getTopVideos = async function(limit = 5, sortBy = 'views') {
  return await this.find()
    .sort({ [sortBy]: -1 })
    .limit(limit)
    .select('title views watchTime revenue publishDate');
};

teamProductivitySchema.statics.getTeamProductivity = async function(startDate, endDate, teamId = null) {
  const matchStage = {
    date: { $gte: startDate, $lte: endDate }
  };
  
  if (teamId) {
    matchStage.employeeId = { $in: await mongoose.model('Employee').find({ team: teamId }).distinct('_id') };
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$employeeId',
        totalHours: { $sum: '$hoursLogged' },
        totalTasks: { $sum: '$tasksAssigned' },
        completedTasks: { $sum: '$tasksCompleted' },
        delayedTasks: { $sum: '$tasksDelayed' },
        avgProductivity: { $avg: '$productivityScore' }
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'employee'
      }
    },
    { $unwind: '$employee' }
  ]);
};

// Pre-save middleware
dashboardOverviewSchema.pre('save', function(next) {
  // Auto-calculate net profit
  this.metrics.netProfit = this.metrics.totalRevenue - this.metrics.totalExpenses;
  
  // Calculate burn rate (monthly expenses)
  if (this.period === 'monthly') {
    this.metrics.burnRate = this.metrics.totalExpenses;
  }
  
  next();
});

youtubeAnalyticsSchema.pre('save', function(next) {
  // Auto-calculate revenue if CPM and views are available
  if (this.cpm && this.views) {
    this.revenue = (this.cpm * this.views) / 1000;
  }
  
  // Auto-calculate RPM if revenue and views are available
  if (this.revenue && this.views) {
    this.rpm = (this.revenue / this.views) * 1000;
  }
  
  next();
});

// Create models
const DashboardOverview = mongoose.model('DashboardOverview', dashboardOverviewSchema);
const YouTubeAnalytics = mongoose.model('YouTubeAnalytics', youtubeAnalyticsSchema);
const TeamProductivity = mongoose.model('TeamProductivity', teamProductivitySchema);
const ProjectProgress = mongoose.model('ProjectProgress', projectProgressSchema);
const CourseSales = mongoose.model('CourseSales', courseSalesSchema);
const CustomReport = mongoose.model('CustomReport', customReportSchema);
const KPI = mongoose.model('KPI', kpiSchema);

module.exports = {
  DashboardOverview,
  YouTubeAnalytics,
  TeamProductivity,
  ProjectProgress,
  CourseSales,
  CustomReport,
  KPI
}; 