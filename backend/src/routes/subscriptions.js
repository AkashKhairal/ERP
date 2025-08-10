const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  getPlans,
  getPlan,
  getMySubscription,
  createSubscription,
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription,
  getUsageStats,
  getUsageHistory,
  getPaymentHistory,
  testAdvancedAnalytics,
  testPrioritySupport,
  testCustomIntegrations,
  testAddTeamMember,
  testAddProject,
  testUploadFile
} = require('../controllers/subscriptionController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');
const {
  requireActiveSubscription,
  requireFeature,
  checkUsageLimit,
  incrementUsage,
  checkStorageQuota,
  checkApiLimit,
  getPlanInfo,
  requirePlan
} = require('../middleware/subscription');

// Validation middleware
const validateSubscriptionCreation = [
  body('planName')
    .isIn(['Beginner', 'Pro', 'Master'])
    .withMessage('Plan name must be one of: Beginner, Pro, Master'),
  body('paymentData')
    .optional()
    .isObject()
    .withMessage('Payment data must be an object')
];

const validatePlanChange = [
  body('planName')
    .isIn(['Beginner', 'Pro', 'Master'])
    .withMessage('Plan name must be one of: Beginner, Pro, Master')
];

const validateCancellation = [
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason must be a string with max 500 characters'),
  body('immediate')
    .optional()
    .isBoolean()
    .withMessage('Immediate must be a boolean')
];

const validateFileUpload = [
  body('fileSizeMB')
    .isFloat({ min: 0.01, max: 1000 })
    .withMessage('File size must be between 0.01 and 1000 MB')
];

// ==================== PUBLIC ROUTES ====================

// @desc    Get all active plans
// @route   GET /api/subscriptions/plans
// @access  Public
router.get('/plans', getPlans);

// @desc    Get plan by name
// @route   GET /api/subscriptions/plans/:name
// @access  Public
router.get('/plans/:name',
  param('name').isIn(['Beginner', 'Pro', 'Master']).withMessage('Invalid plan name'),
  getPlan
);

// ==================== PROTECTED ROUTES ====================

// Apply authentication to all routes below
router.use(protect);

// Apply plan info middleware to get user's current plan and usage
router.use(getPlanInfo);

// ==================== SUBSCRIPTION MANAGEMENT ====================

// @desc    Get user's current subscription
// @route   GET /api/subscriptions/my-subscription
// @access  Private
router.get('/my-subscription', getMySubscription);

// @desc    Create new subscription
// @route   POST /api/subscriptions/create
// @access  Private
router.post('/create',
  validateSubscriptionCreation,
  createSubscription
);

// @desc    Upgrade subscription
// @route   POST /api/subscriptions/upgrade
// @access  Private
router.post('/upgrade',
  validatePlanChange,
  upgradeSubscription
);

// @desc    Downgrade subscription
// @route   POST /api/subscriptions/downgrade
// @access  Private
router.post('/downgrade',
  validatePlanChange,
  downgradeSubscription
);

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
router.post('/cancel',
  validateCancellation,
  cancelSubscription
);

// ==================== USAGE TRACKING ====================

// @desc    Get usage statistics
// @route   GET /api/subscriptions/usage
// @access  Private
router.get('/usage', getUsageStats);

// @desc    Get usage history
// @route   GET /api/subscriptions/usage/history
// @access  Private
router.get('/usage/history',
  query('metric').optional().isIn(['teamMembers', 'projects', 'storage', 'apiCalls']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  getUsageHistory
);

// ==================== PAYMENT HISTORY ====================

// @desc    Get payment history
// @route   GET /api/subscriptions/payments
// @access  Private
router.get('/payments',
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']),
  getPaymentHistory
);

// ==================== FEATURE TESTING ROUTES ====================

// @desc    Test advanced analytics access
// @route   GET /api/subscriptions/test/advanced-analytics
// @access  Private
router.get('/test/advanced-analytics', testAdvancedAnalytics);

// @desc    Test priority support access
// @route   GET /api/subscriptions/test/priority-support
// @access  Private
router.get('/test/priority-support', testPrioritySupport);

// @desc    Test custom integrations access
// @route   GET /api/subscriptions/test/custom-integrations
// @access  Private
router.get('/test/custom-integrations', testCustomIntegrations);

// ==================== USAGE TESTING ROUTES ====================

// @desc    Test adding team member (with usage limit check)
// @route   POST /api/subscriptions/test/add-team-member
// @access  Private
router.post('/test/add-team-member',
  checkUsageLimit('teamMembers', 1),
  testAddTeamMember
);

// @desc    Test adding project (with usage limit check)
// @route   POST /api/subscriptions/test/add-project
// @access  Private
router.post('/test/add-project',
  checkUsageLimit('projects', 1),
  testAddProject
);

// @desc    Test file upload (with storage quota check)
// @route   POST /api/subscriptions/test/upload-file
// @access  Private
router.post('/test/upload-file',
  validateFileUpload,
  testUploadFile
);

// ==================== ADMIN ROUTES ====================

// Admin routes require admin or manager role
router.use(authorize('admin', 'manager'));

// @desc    Get all subscriptions (Admin)
// @route   GET /api/subscriptions/admin/all
// @access  Private (Admin/Manager)
router.get('/admin/all', async (req, res) => {
  try {
    const {
      status,
      planName,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (planName) {
      const Plan = require('../models/Plan');
      const plan = await Plan.getByName(planName);
      if (plan) filter.plan = plan._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const Subscription = require('../models/Subscription');
    const subscriptions = await Subscription.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('plan', 'name displayName price features')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subscription.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: subscriptions
    });
  } catch (error) {
    console.error('Error fetching all subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions'
    });
  }
});

// @desc    Get subscription analytics (Admin)
// @route   GET /api/subscriptions/admin/analytics
// @access  Private (Admin/Manager)
router.get('/admin/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const Subscription = require('../models/Subscription');
    const Payment = require('../models/Payment');
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      subscriptionStats,
      planDistribution,
      paymentStats
    ] = await Promise.all([
      // Subscription statistics
      Subscription.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalSubscriptions: { $sum: 1 },
            activeSubscriptions: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            cancelledSubscriptions: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            averageSubscriptionValue: { $avg: '$billing.amount' }
          }
        }
      ]),

      // Plan distribution
      Subscription.aggregate([
        { $match: { status: 'active' } },
        {
          $lookup: {
            from: 'plans',
            localField: 'plan',
            foreignField: '_id',
            as: 'planInfo'
          }
        },
        { $unwind: '$planInfo' },
        {
          $group: {
            _id: '$planInfo.name',
            count: { $sum: 1 },
            revenue: { $sum: '$billing.amount' }
          }
        }
      ]),

      // Payment statistics
      Payment.getStatistics(
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      )
    ]);

    const overview = subscriptionStats[0] || {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      cancelledSubscriptions: 0,
      averageSubscriptionValue: 0
    };

    // Calculate churn rate
    const churnRate = overview.totalSubscriptions > 0 ? 
      (overview.cancelledSubscriptions / overview.totalSubscriptions) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          ...overview,
          churnRate: churnRate
        },
        planDistribution,
        paymentStats
      }
    });
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription analytics'
    });
  }
});

// @desc    Get user subscription (Admin)
// @route   GET /api/subscriptions/admin/user/:userId
// @access  Private (Admin/Manager)
router.get('/admin/user/:userId',
  param('userId').isMongoId().withMessage('Valid user ID is required'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      const Subscription = require('../models/Subscription');
      const Usage = require('../models/Usage');
      
      const subscription = await Subscription.findOne({ user: userId })
        .populate('plan')
        .populate('user', 'firstName lastName email');

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No subscription found for this user'
        });
      }

      const usage = await Usage.findOne({ user: userId });
      const usageSummary = usage ? usage.getUsageSummary() : null;

      res.status(200).json({
        success: true,
        data: {
          subscription,
          usage: usageSummary
        }
      });
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user subscription'
      });
    }
  }
);

// @desc    Update user plan (Admin)
// @route   PUT /api/subscriptions/admin/user/:userId/plan
// @access  Private (Admin)
router.put('/admin/user/:userId/plan',
  authorize('admin'),
  param('userId').isMongoId().withMessage('Valid user ID is required'),
  body('planName').isIn(['Beginner', 'Pro', 'Master']).withMessage('Invalid plan name'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { planName, reason } = req.body;
      
      const Subscription = require('../models/Subscription');
      const Plan = require('../models/Plan');
      const Usage = require('../models/Usage');
      
      const subscription = await Subscription.findOne({ user: userId })
        .populate('plan');

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'No subscription found for this user'
        });
      }

      const newPlan = await Plan.getByName(planName);
      if (!newPlan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      await subscription.changePlan(newPlan, req.user.id, reason || 'Admin change');

      // Update usage limits
      const usage = await Usage.findOne({ user: userId });
      if (usage) {
        await usage.updatePlanLimits(newPlan);
      }

      await subscription.populate('plan');

      res.status(200).json({
        success: true,
        message: 'User plan updated successfully',
        data: subscription
      });
    } catch (error) {
      console.error('Error updating user plan:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user plan'
      });
    }
  }
);

module.exports = router;
