const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const Usage = require('../models/Usage');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// ==================== PLAN OPERATIONS ====================

// @desc    Get all active plans
// @route   GET /api/subscriptions/plans
// @access  Public
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.getActivePlans();
    
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plans'
    });
  }
};

// @desc    Get plan by name
// @route   GET /api/subscriptions/plans/:name
// @access  Public
const getPlan = async (req, res) => {
  try {
    const { name } = req.params;
    
    const plan = await Plan.getByName(name);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plan'
    });
  }
};

// ==================== SUBSCRIPTION OPERATIONS ====================

// @desc    Get user's current subscription
// @route   GET /api/subscriptions/my-subscription
// @access  Private
const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ user: userId })
      .populate('plan')
      .populate('user', 'firstName lastName email');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    // Get usage data
    const usage = await Usage.getOrCreateForUser(userId, subscription.plan._id);
    const usageSummary = usage.getUsageSummary();
    
    res.status(200).json({
      success: true,
      data: {
        subscription: subscription,
        usage: {
          user: {
            id: subscription.user._id,
            email: subscription.user.email,
            name: `${subscription.user.firstName} ${subscription.user.lastName}`
          },
          plan: {
            name: subscription.plan.name,
            displayName: subscription.plan.displayName
          },
          usage: usageSummary,
          warnings: {
            teamMembers: {
              at80Percent: usage.isAtWarningLevel('teamMembers', 80),
              at95Percent: usage.isAtWarningLevel('teamMembers', 95),
              limitReached: usage.isAtLimit('teamMembers')
            },
            projects: {
              at80Percent: usage.isAtWarningLevel('projects', 80),
              at95Percent: usage.isAtWarningLevel('projects', 95),
              limitReached: usage.isAtLimit('projects')
            },
            storage: {
              at80Percent: usage.isAtWarningLevel('storage', 80),
              at95Percent: usage.isAtWarningLevel('storage', 95),
              limitReached: usage.isAtLimit('storage')
            },
            apiCalls: {
              at80Percent: usage.isAtWarningLevel('apiCalls', 80),
              at95Percent: usage.isAtWarningLevel('apiCalls', 95),
              limitReached: usage.isAtLimit('apiCalls')
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription'
    });
  }
};

// @desc    Create new subscription
// @route   POST /api/subscriptions/create
// @access  Private
const createSubscription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { planName, paymentData } = req.body;
    const userId = req.user.id;
    
    // Check if user already has a subscription
    const existingSubscription = await Subscription.findOne({ user: userId });
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription'
      });
    }
    
    // Get the plan
    const plan = await Plan.getByName(planName);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    // For free plan, create subscription immediately
    if (plan.price === 0) {
      const subscription = new Subscription({
        user: userId,
        plan: plan._id,
        status: 'active',
        billing: {
          amount: 0,
          currency: plan.currency,
          interval: plan.interval
        },
        autoRenew: false // Free plans don't auto-renew
      });
      
      await subscription.save();
      
      // Update user's plan reference
      await User.findByIdAndUpdate(userId, {
        subscription: subscription._id,
        plan: plan._id
      });
      
      // Create usage record
      await Usage.getOrCreateForUser(userId, plan._id);
      
      await subscription.populate(['plan', 'user']);
      
      return res.status(201).json({
        success: true,
        message: 'Free subscription created successfully',
        data: subscription
      });
    }
    
    // For paid plans, we need payment processing
    // For now, return payment required response
    res.status(200).json({
      success: true,
      message: 'Payment required for subscription',
      nextStep: 'payment_required',
      data: {
        plan: plan,
        amount: plan.price,
        currency: plan.currency,
        // In real implementation, you'd create payment order with gateway
        paymentOrder: {
          // This would be the gateway order/session data
          planId: plan._id,
          amount: plan.price,
          currency: plan.currency
        }
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription'
    });
  }
};

// @desc    Upgrade subscription
// @route   POST /api/subscriptions/upgrade
// @access  Private
const upgradeSubscription = async (req, res) => {
  try {
    const { planName, paymentData } = req.body;
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ user: userId })
      .populate('plan');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    const newPlan = await Plan.getByName(planName);
    if (!newPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    // Check if it's actually an upgrade
    if (newPlan.price <= subscription.plan.price) {
      return res.status(400).json({
        success: false,
        message: 'Cannot upgrade to a plan with lower or same price'
      });
    }
    
    // For immediate upgrade to free plan (downgrade)
    if (newPlan.price === 0) {
      await subscription.changePlan(newPlan, userId, 'User upgrade');
      
      // Update usage limits
      const usage = await Usage.findOne({ user: userId });
      if (usage) {
        await usage.updatePlanLimits(newPlan);
      }
      
      await subscription.populate('plan');
      
      return res.status(200).json({
        success: true,
        message: 'Subscription upgraded successfully',
        data: subscription
      });
    }
    
    // For paid upgrades, require payment processing
    const proratedAmount = calculateProration(subscription, newPlan);
    
    res.status(200).json({
      success: true,
      message: 'Payment required for upgrade',
      nextStep: 'payment_required',
      data: {
        currentPlan: subscription.plan,
        newPlan: newPlan,
        proratedAmount: proratedAmount,
        currency: newPlan.currency,
        // In real implementation, create payment order
        paymentOrder: {
          planId: newPlan._id,
          amount: proratedAmount,
          currency: newPlan.currency,
          type: 'upgrade'
        }
      }
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error upgrading subscription'
    });
  }
};

// @desc    Downgrade subscription
// @route   POST /api/subscriptions/downgrade
// @access  Private
const downgradeSubscription = async (req, res) => {
  try {
    const { planName } = req.body;
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ user: userId })
      .populate('plan');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    const newPlan = await Plan.getByName(planName);
    if (!newPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    // Check if it's actually a downgrade
    if (newPlan.price >= subscription.plan.price) {
      return res.status(400).json({
        success: false,
        message: 'Cannot downgrade to a plan with higher or same price'
      });
    }
    
    // Schedule downgrade at end of billing cycle
    subscription.planHistory.push({
      plan: newPlan._id,
      changedBy: userId,
      reason: 'User requested downgrade - effective at end of billing cycle',
      previousPlan: subscription.plan._id
    });
    
    // Don't change the plan immediately - schedule for end of cycle
    subscription.scheduledPlanChange = {
      newPlan: newPlan._id,
      effectiveDate: subscription.endDate,
      type: 'downgrade'
    };
    
    await subscription.save();
    
    res.status(200).json({
      success: true,
      message: 'Downgrade scheduled for end of billing cycle',
      data: {
        currentPlan: subscription.plan,
        scheduledPlan: newPlan,
        effectiveDate: subscription.endDate,
        subscription: subscription
      }
    });
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error downgrading subscription'
    });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
  try {
    const { reason, immediate = false } = req.body;
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ user: userId })
      .populate('plan');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled'
      });
    }
    
    await subscription.cancel(reason, userId, immediate);
    
    res.status(200).json({
      success: true,
      message: immediate ? 'Subscription cancelled immediately' : 'Subscription cancelled at end of billing cycle',
      data: {
        subscription: subscription,
        effectiveDate: subscription.cancellation.effectiveDate,
        accessUntil: immediate ? new Date() : subscription.endDate
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription'
    });
  }
};

// ==================== USAGE OPERATIONS ====================

// @desc    Get usage statistics
// @route   GET /api/subscriptions/usage
// @access  Private
const getUsageStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ user: userId })
      .populate('plan');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    const usage = await Usage.getOrCreateForUser(userId, subscription.plan._id);
    const usageSummary = usage.getUsageSummary();
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: userId,
          email: req.user.email,
          name: `${req.user.firstName} ${req.user.lastName}`
        },
        plan: {
          name: subscription.plan.name,
          displayName: subscription.plan.displayName
        },
        usage: usageSummary
      }
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching usage statistics'
    });
  }
};

// @desc    Get usage history
// @route   GET /api/subscriptions/usage/history
// @access  Private
const getUsageHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { metric, limit = 50 } = req.query;
    
    const usage = await Usage.findOne({ user: userId });
    
    if (!usage) {
      return res.status(404).json({
        success: false,
        message: 'No usage data found'
      });
    }
    
    let history = usage.history;
    
    // Filter by metric if specified
    if (metric) {
      history = history.filter(h => h.metric === metric);
    }
    
    // Sort by timestamp descending and limit
    history = history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error fetching usage history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching usage history'
    });
  }
};

// ==================== PAYMENT OPERATIONS ====================

// @desc    Get payment history
// @route   GET /api/subscriptions/payments
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, status } = req.query;
    
    const filter = { user: userId };
    if (status) filter.status = status;
    
    const payments = await Payment.find(filter)
      .populate('plan', 'name displayName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history'
    });
  }
};

// ==================== FEATURE TESTING ====================

// @desc    Test advanced analytics access
// @route   GET /api/subscriptions/test/advanced-analytics
// @access  Private
const testAdvancedAnalytics = async (req, res) => {
  try {
    const plan = req.plan;
    
    if (!plan || !plan.hasFeature('advanced_analytics')) {
      return res.status(403).json({
        success: false,
        message: 'Advanced analytics requires Pro or Master plan',
        code: 'FEATURE_NOT_AVAILABLE'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Advanced analytics access granted',
      feature: 'advanced_analytics'
    });
  } catch (error) {
    console.error('Error testing advanced analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing feature access'
    });
  }
};

// @desc    Test priority support access
// @route   GET /api/subscriptions/test/priority-support
// @access  Private
const testPrioritySupport = async (req, res) => {
  try {
    const plan = req.plan;
    
    if (!plan || !plan.hasFeature('priority_support')) {
      return res.status(403).json({
        success: false,
        message: 'Priority support requires Pro or Master plan',
        code: 'FEATURE_NOT_AVAILABLE'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Priority support access granted',
      feature: 'priority_support'
    });
  } catch (error) {
    console.error('Error testing priority support:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing feature access'
    });
  }
};

// @desc    Test custom integrations access
// @route   GET /api/subscriptions/test/custom-integrations
// @access  Private
const testCustomIntegrations = async (req, res) => {
  try {
    const plan = req.plan;
    
    if (!plan || !plan.hasFeature('custom_integrations')) {
      return res.status(403).json({
        success: false,
        message: 'Custom integrations requires Master plan',
        code: 'FEATURE_NOT_AVAILABLE'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Custom integrations access granted',
      feature: 'custom_integrations'
    });
  } catch (error) {
    console.error('Error testing custom integrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing feature access'
    });
  }
};

// ==================== USAGE TESTING ====================

// @desc    Test adding team member
// @route   POST /api/subscriptions/test/add-team-member
// @access  Private
const testAddTeamMember = async (req, res) => {
  try {
    const usage = req.usage;
    
    if (!usage) {
      return res.status(500).json({
        success: false,
        message: 'Usage information not available'
      });
    }
    
    // This would be called before actually adding a team member
    res.status(200).json({
      success: true,
      message: 'Team member can be added',
      currentUsage: usage.teamMembers.current,
      limit: usage.teamMembers.limit,
      remaining: usage.teamMembers.limit === -1 ? 'unlimited' : usage.teamMembers.limit - usage.teamMembers.current
    });
  } catch (error) {
    console.error('Error testing add team member:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing team member addition'
    });
  }
};

// @desc    Test adding project
// @route   POST /api/subscriptions/test/add-project
// @access  Private
const testAddProject = async (req, res) => {
  try {
    const usage = req.usage;
    
    if (!usage) {
      return res.status(500).json({
        success: false,
        message: 'Usage information not available'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Project can be added',
      currentUsage: usage.projects.current,
      limit: usage.projects.limit,
      remaining: usage.projects.limit === -1 ? 'unlimited' : usage.projects.limit - usage.projects.current
    });
  } catch (error) {
    console.error('Error testing add project:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing project addition'
    });
  }
};

// @desc    Test file upload
// @route   POST /api/subscriptions/test/upload-file
// @access  Private
const testUploadFile = async (req, res) => {
  try {
    const { fileSizeMB } = req.body;
    const usage = req.usage;
    
    if (!usage) {
      return res.status(500).json({
        success: false,
        message: 'Usage information not available'
      });
    }
    
    const currentStorage = usage.storage.current;
    const storageLimit = usage.storage.limit;
    
    if (storageLimit !== -1 && (currentStorage + fileSizeMB) > storageLimit) {
      return res.status(403).json({
        success: false,
        message: 'File upload would exceed storage limit',
        currentUsage: currentStorage,
        limit: storageLimit,
        requested: fileSizeMB,
        available: storageLimit - currentStorage
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'File can be uploaded',
      currentUsage: currentStorage,
      limit: storageLimit,
      requested: fileSizeMB,
      remaining: storageLimit === -1 ? 'unlimited' : storageLimit - currentStorage - fileSizeMB
    });
  } catch (error) {
    console.error('Error testing file upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing file upload'
    });
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate prorated amount for plan upgrade
 */
const calculateProration = (subscription, newPlan) => {
  const today = new Date();
  const endDate = new Date(subscription.endDate);
  const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  const totalDays = subscription.billing.interval === 'month' ? 30 : 365;
  
  const currentPlanDaily = subscription.billing.amount / totalDays;
  const newPlanDaily = newPlan.price / totalDays;
  
  const proratedAmount = (newPlanDaily - currentPlanDaily) * daysRemaining;
  
  return Math.max(0, Math.round(proratedAmount * 100) / 100);
};

module.exports = {
  // Plan operations
  getPlans,
  getPlan,
  
  // Subscription operations
  getMySubscription,
  createSubscription,
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription,
  
  // Usage operations
  getUsageStats,
  getUsageHistory,
  
  // Payment operations
  getPaymentHistory,
  
  // Feature testing
  testAdvancedAnalytics,
  testPrioritySupport,
  testCustomIntegrations,
  
  // Usage testing
  testAddTeamMember,
  testAddProject,
  testUploadFile
};
