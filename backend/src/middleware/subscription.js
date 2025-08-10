const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Usage = require('../models/Usage');

/**
 * Middleware to check if user has active subscription
 */
const requireActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ user: userId })
      .populate('plan');
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required',
        code: 'NO_SUBSCRIPTION'
      });
    }
    
    if (subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required',
        code: 'INACTIVE_SUBSCRIPTION',
        subscription: {
          status: subscription.status,
          endDate: subscription.endDate
        }
      });
    }
    
    // Check if subscription is expired
    if (subscription.isExpired) {
      return res.status(403).json({
        success: false,
        message: 'Subscription has expired',
        code: 'EXPIRED_SUBSCRIPTION',
        subscription: {
          endDate: subscription.endDate
        }
      });
    }
    
    // Attach subscription to request
    req.subscription = subscription;
    req.plan = subscription.plan;
    
    next();
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subscription status'
    });
  }
};

/**
 * Middleware to check if plan has specific feature
 * @param {string} feature - Feature name to check
 */
const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const plan = req.plan || req.subscription?.plan;
      
      if (!plan) {
        return res.status(403).json({
          success: false,
          message: 'Plan information not available',
          code: 'NO_PLAN'
        });
      }
      
      const hasFeature = plan.hasFeature(feature);
      
      if (!hasFeature) {
        return res.status(403).json({
          success: false,
          message: `Feature '${feature}' not available in your current plan`,
          code: 'FEATURE_NOT_AVAILABLE',
          feature: feature,
          plan: plan.name,
          upgradeRequired: true
        });
      }
      
      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking feature access'
      });
    }
  };
};

/**
 * Middleware to check usage limits before allowing resource creation
 * @param {string} resource - Resource type (teamMembers, projects, storage)
 * @param {number} amount - Amount to be added (default: 1)
 */
const checkUsageLimit = (resource, amount = 1) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const planId = req.plan?._id || req.subscription?.plan?._id;
      
      if (!planId) {
        return res.status(403).json({
          success: false,
          message: 'Plan information not available',
          code: 'NO_PLAN'
        });
      }
      
      // Get or create usage record
      const usage = await Usage.getOrCreateForUser(userId, planId);
      
      // Check if adding the amount would exceed limit
      const currentUsage = usage[resource]?.current || 0;
      const limit = usage[resource]?.limit || 0;
      
      // -1 means unlimited
      if (limit !== -1 && (currentUsage + amount) > limit) {
        return res.status(403).json({
          success: false,
          message: `${resource} limit exceeded. Current: ${currentUsage}, Limit: ${limit}`,
          code: 'USAGE_LIMIT_EXCEEDED',
          usage: {
            resource: resource,
            current: currentUsage,
            limit: limit,
            requested: amount,
            available: Math.max(0, limit - currentUsage)
          },
          upgradeRequired: true
        });
      }
      
      // Attach usage info to request for later use
      req.usage = usage;
      req.usageCheck = {
        resource: resource,
        amount: amount,
        currentUsage: currentUsage,
        limit: limit
      };
      
      next();
    } catch (error) {
      console.error('Error checking usage limit:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking usage limits'
      });
    }
  };
};

/**
 * Middleware to increment usage after successful resource creation
 * Should be used after the resource is successfully created
 */
const incrementUsage = () => {
  return async (req, res, next) => {
    try {
      const usage = req.usage;
      const usageCheck = req.usageCheck;
      
      if (!usage || !usageCheck) {
        // If no usage check was performed, skip increment
        return next();
      }
      
      await usage.incrementUsage(
        usageCheck.resource, 
        usageCheck.amount,
        `${usageCheck.resource} added via API`
      );
      
      next();
    } catch (error) {
      console.error('Error incrementing usage:', error);
      // Don't fail the request if usage increment fails
      // Just log the error and continue
      next();
    }
  };
};

/**
 * Middleware to decrement usage after successful resource deletion
 */
const decrementUsage = (resource, amount = 1) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const planId = req.plan?._id || req.subscription?.plan?._id;
      
      if (!planId) {
        return next(); // Skip if no plan available
      }
      
      const usage = await Usage.getOrCreateForUser(userId, planId);
      
      await usage.decrementUsage(
        resource, 
        amount,
        `${resource} removed via API`
      );
      
      next();
    } catch (error) {
      console.error('Error decrementing usage:', error);
      // Don't fail the request if usage decrement fails
      next();
    }
  };
};

/**
 * Middleware to check storage quota before file uploads
 * @param {number} fileSizeMB - File size in MB
 */
const checkStorageQuota = (fileSizeMB) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const planId = req.plan?._id || req.subscription?.plan?._id;
      
      if (!planId) {
        return res.status(403).json({
          success: false,
          message: 'Plan information not available',
          code: 'NO_PLAN'
        });
      }
      
      const usage = await Usage.getOrCreateForUser(userId, planId);
      const currentStorage = usage.storage.current;
      const storageLimit = usage.storage.limit;
      
      // -1 means unlimited storage
      if (storageLimit !== -1 && (currentStorage + fileSizeMB) > storageLimit) {
        return res.status(403).json({
          success: false,
          message: 'Storage quota exceeded',
          code: 'STORAGE_QUOTA_EXCEEDED',
          storage: {
            current: currentStorage,
            limit: storageLimit,
            requested: fileSizeMB,
            available: Math.max(0, storageLimit - currentStorage)
          },
          upgradeRequired: true
        });
      }
      
      req.storageCheck = {
        fileSizeMB: fileSizeMB,
        currentStorage: currentStorage,
        storageLimit: storageLimit
      };
      
      next();
    } catch (error) {
      console.error('Error checking storage quota:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking storage quota'
      });
    }
  };
};

/**
 * Middleware to increment storage usage after file upload
 */
const incrementStorageUsage = () => {
  return async (req, res, next) => {
    try {
      const usage = req.usage;
      const storageCheck = req.storageCheck;
      
      if (!usage || !storageCheck) {
        return next();
      }
      
      await usage.incrementUsage(
        'storage',
        storageCheck.fileSizeMB,
        'File uploaded'
      );
      
      next();
    } catch (error) {
      console.error('Error incrementing storage usage:', error);
      next();
    }
  };
};

/**
 * Middleware to check API rate limits
 */
const checkApiLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const planId = req.plan?._id || req.subscription?.plan?._id;
    
    if (!planId) {
      return next(); // Skip if no plan (for free tier)
    }
    
    const usage = await Usage.getOrCreateForUser(userId, planId);
    const currentApiCalls = usage.apiCalls.current;
    const apiLimit = usage.apiCalls.limit;
    
    // -1 means unlimited API calls
    if (apiLimit !== -1 && currentApiCalls >= apiLimit) {
      return res.status(429).json({
        success: false,
        message: 'API rate limit exceeded for your plan',
        code: 'API_LIMIT_EXCEEDED',
        apiUsage: {
          current: currentApiCalls,
          limit: apiLimit,
          resetDate: usage.apiCalls.resetDate
        },
        upgradeRequired: true
      });
    }
    
    // Increment API usage
    await usage.incrementUsage('apiCalls', 1, 'API call');
    
    next();
  } catch (error) {
    console.error('Error checking API limit:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking API limits'
    });
  }
};

/**
 * Middleware to get user's current plan and usage info
 */
const getPlanInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ user: userId })
      .populate('plan');
    
    if (subscription) {
      req.subscription = subscription;
      req.plan = subscription.plan;
      
      // Also get usage info
      const usage = await Usage.getOrCreateForUser(userId, subscription.plan._id);
      req.usage = usage;
    } else {
      // User has no subscription - assign default free plan
      const freePlan = await Plan.getDefaultPlan();
      if (freePlan) {
        req.plan = freePlan;
        const usage = await Usage.getOrCreateForUser(userId, freePlan._id);
        req.usage = usage;
      }
    }
    
    next();
  } catch (error) {
    console.error('Error getting plan info:', error);
    next(); // Continue without plan info
  }
};

/**
 * Middleware to enforce plan-based access to premium routes
 * @param {Array} allowedPlans - Array of plan names that can access this route
 */
const requirePlan = (allowedPlans = []) => {
  return async (req, res, next) => {
    try {
      const plan = req.plan;
      
      if (!plan) {
        return res.status(403).json({
          success: false,
          message: 'Plan information required',
          code: 'NO_PLAN'
        });
      }
      
      if (allowedPlans.length > 0 && !allowedPlans.includes(plan.name)) {
        return res.status(403).json({
          success: false,
          message: `This feature requires ${allowedPlans.join(' or ')} plan`,
          code: 'PLAN_UPGRADE_REQUIRED',
          currentPlan: plan.name,
          requiredPlans: allowedPlans,
          upgradeRequired: true
        });
      }
      
      next();
    } catch (error) {
      console.error('Error checking plan requirement:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking plan requirements'
      });
    }
  };
};

module.exports = {
  requireActiveSubscription,
  requireFeature,
  checkUsageLimit,
  incrementUsage,
  decrementUsage,
  checkStorageQuota,
  incrementStorageUsage,
  checkApiLimit,
  getPlanInfo,
  requirePlan
};
