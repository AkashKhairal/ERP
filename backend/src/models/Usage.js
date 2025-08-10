const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan is required']
  },
  
  // Current usage metrics
  teamMembers: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Team members count cannot be negative']
    },
    limit: {
      type: Number,
      required: [true, 'Team members limit is required']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  projects: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Projects count cannot be negative']
    },
    limit: {
      type: Number,
      required: [true, 'Projects limit is required']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  storage: {
    current: {
      type: Number, // in MB
      default: 0,
      min: [0, 'Storage usage cannot be negative']
    },
    limit: {
      type: Number, // in MB
      required: [true, 'Storage limit is required']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  apiCalls: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'API calls count cannot be negative']
    },
    limit: {
      type: Number,
      required: [true, 'API calls limit is required']
    },
    resetDate: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        date.setDate(1);
        return date;
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Usage history for analytics
  history: [{
    metric: {
      type: String,
      enum: ['teamMembers', 'projects', 'storage', 'apiCalls'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['increment', 'decrement', 'reset'],
      required: true
    },
    details: String
  }],
  
  // Warning notifications sent
  warningsSent: {
    teamMembers: {
      at80Percent: { type: Date },
      at95Percent: { type: Date },
      limitReached: { type: Date }
    },
    projects: {
      at80Percent: { type: Date },
      at95Percent: { type: Date },
      limitReached: { type: Date }
    },
    storage: {
      at80Percent: { type: Date },
      at95Percent: { type: Date },
      limitReached: { type: Date }
    },
    apiCalls: {
      at80Percent: { type: Date },
      at95Percent: { type: Date },
      limitReached: { type: Date }
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
usageSchema.index({ user: 1 });
usageSchema.index({ user: 1, plan: 1 });
usageSchema.index({ 'apiCalls.resetDate': 1 });
usageSchema.index({ 'history.timestamp': 1 });

// Virtual for team members usage percentage
usageSchema.virtual('teamMembersPercentage').get(function() {
  if (this.teamMembers.limit === -1) return 0; // Unlimited
  return Math.min((this.teamMembers.current / this.teamMembers.limit) * 100, 100);
});

// Virtual for projects usage percentage
usageSchema.virtual('projectsPercentage').get(function() {
  if (this.projects.limit === -1) return 0; // Unlimited
  return Math.min((this.projects.current / this.projects.limit) * 100, 100);
});

// Virtual for storage usage percentage
usageSchema.virtual('storagePercentage').get(function() {
  if (this.storage.limit === -1) return 0; // Unlimited
  return Math.min((this.storage.current / this.storage.limit) * 100, 100);
});

// Virtual for API calls usage percentage
usageSchema.virtual('apiCallsPercentage').get(function() {
  if (this.apiCalls.limit === -1) return 0; // Unlimited
  return Math.min((this.apiCalls.current / this.apiCalls.limit) * 100, 100);
});

// Static method to get or create usage for user
usageSchema.statics.getOrCreateForUser = async function(userId, planId) {
  let usage = await this.findOne({ user: userId });
  
  if (!usage) {
    const Plan = mongoose.model('Plan');
    const plan = await Plan.findById(planId);
    
    if (!plan) {
      throw new Error('Plan not found');
    }
    
    usage = new this({
      user: userId,
      plan: planId,
      teamMembers: {
        current: 1, // User counts as one team member
        limit: plan.features.teamMembers
      },
      projects: {
        current: 0,
        limit: plan.features.projects
      },
      storage: {
        current: 0,
        limit: plan.features.storage
      },
      apiCalls: {
        current: 0,
        limit: plan.features.apiCalls
      }
    });
    
    await usage.save();
  }
  
  return usage;
};

// Static method to reset monthly API calls
usageSchema.statics.resetMonthlyApiCalls = async function() {
  const today = new Date();
  
  const result = await this.updateMany(
    { 'apiCalls.resetDate': { $lte: today } },
    {
      $set: {
        'apiCalls.current': 0,
        'apiCalls.resetDate': new Date(today.getFullYear(), today.getMonth() + 1, 1)
      }
    }
  );
  
  return result.modifiedCount;
};

// Instance method to check if metric is at warning level
usageSchema.methods.isAtWarningLevel = function(metric, threshold = 80) {
  const percentage = this.getUsagePercentage(metric);
  return percentage >= threshold;
};

// Instance method to check if metric is at limit
usageSchema.methods.isAtLimit = function(metric) {
  const current = this[metric].current;
  const limit = this[metric].limit;
  
  if (limit === -1) return false; // Unlimited
  return current >= limit;
};

// Instance method to get usage percentage
usageSchema.methods.getUsagePercentage = function(metric) {
  const current = this[metric].current;
  const limit = this[metric].limit;
  
  if (limit === -1) return 0; // Unlimited
  return Math.min((current / limit) * 100, 100);
};

// Instance method to increment usage
usageSchema.methods.incrementUsage = async function(metric, amount = 1, details = '') {
  if (!this[metric]) {
    throw new Error(`Invalid metric: ${metric}`);
  }
  
  const currentValue = this[metric].current;
  const newValue = currentValue + amount;
  
  // Check if increment would exceed limit
  if (this[metric].limit !== -1 && newValue > this[metric].limit) {
    throw new Error(`Cannot increment ${metric}: would exceed limit of ${this[metric].limit}`);
  }
  
  this[metric].current = newValue;
  this[metric].lastUpdated = new Date();
  
  // Add to history
  this.history.push({
    metric: metric,
    value: newValue,
    action: 'increment',
    details: details
  });
  
  return this.save();
};

// Instance method to decrement usage
usageSchema.methods.decrementUsage = async function(metric, amount = 1, details = '') {
  if (!this[metric]) {
    throw new Error(`Invalid metric: ${metric}`);
  }
  
  const currentValue = this[metric].current;
  const newValue = Math.max(0, currentValue - amount);
  
  this[metric].current = newValue;
  this[metric].lastUpdated = new Date();
  
  // Add to history
  this.history.push({
    metric: metric,
    value: newValue,
    action: 'decrement',
    details: details
  });
  
  return this.save();
};

// Instance method to update plan limits
usageSchema.methods.updatePlanLimits = async function(newPlan) {
  this.plan = newPlan._id;
  
  // Update limits
  this.teamMembers.limit = newPlan.features.teamMembers;
  this.projects.limit = newPlan.features.projects;
  this.storage.limit = newPlan.features.storage;
  this.apiCalls.limit = newPlan.features.apiCalls;
  
  // If current usage exceeds new limits, we need to handle this
  // For now, we'll allow it but mark as over-limit
  
  return this.save();
};

// Instance method to check if warnings should be sent
usageSchema.methods.shouldSendWarning = function(metric, threshold) {
  const percentage = this.getUsagePercentage(metric);
  const warningKey = threshold === 80 ? 'at80Percent' : 
                     threshold === 95 ? 'at95Percent' : 'limitReached';
  
  if (percentage < threshold) return false;
  
  const lastWarning = this.warningsSent[metric][warningKey];
  const hoursSinceLastWarning = lastWarning ? 
    (new Date() - lastWarning) / (1000 * 60 * 60) : Infinity;
  
  // Send warning if no warning sent before or 24 hours have passed
  return !lastWarning || hoursSinceLastWarning >= 24;
};

// Instance method to mark warning as sent
usageSchema.methods.markWarningSent = async function(metric, threshold) {
  const warningKey = threshold === 80 ? 'at80Percent' : 
                     threshold === 95 ? 'at95Percent' : 'limitReached';
  
  this.warningsSent[metric][warningKey] = new Date();
  return this.save();
};

// Instance method to get detailed usage summary
usageSchema.methods.getUsageSummary = function() {
  return {
    teamMembers: {
      current: this.teamMembers.current,
      limit: this.teamMembers.limit,
      unlimited: this.teamMembers.limit === -1,
      percentage: this.teamMembersPercentage,
      warning: this.isAtWarningLevel('teamMembers', 80),
      limitReached: this.isAtLimit('teamMembers'),
      lastUpdated: this.teamMembers.lastUpdated
    },
    projects: {
      current: this.projects.current,
      limit: this.projects.limit,
      unlimited: this.projects.limit === -1,
      percentage: this.projectsPercentage,
      warning: this.isAtWarningLevel('projects', 80),
      limitReached: this.isAtLimit('projects'),
      lastUpdated: this.projects.lastUpdated
    },
    storage: {
      current: this.storage.current,
      limit: this.storage.limit,
      unlimited: this.storage.limit === -1,
      percentage: this.storagePercentage,
      warning: this.isAtWarningLevel('storage', 80),
      limitReached: this.isAtLimit('storage'),
      lastUpdated: this.storage.lastUpdated
    },
    apiCalls: {
      current: this.apiCalls.current,
      limit: this.apiCalls.limit,
      unlimited: this.apiCalls.limit === -1,
      percentage: this.apiCallsPercentage,
      warning: this.isAtWarningLevel('apiCalls', 80),
      limitReached: this.isAtLimit('apiCalls'),
      resetDate: this.apiCalls.resetDate,
      lastUpdated: this.apiCalls.lastUpdated
    }
  };
};

const Usage = mongoose.model('Usage', usageSchema);

module.exports = Usage;
