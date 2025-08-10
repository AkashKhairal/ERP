const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    enum: ['Beginner', 'Pro', 'Master'],
    unique: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required']
  },
  description: {
    type: String,
    required: [true, 'Plan description is required']
  },
  price: {
    type: Number,
    required: [true, 'Plan price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  interval: {
    type: String,
    required: [true, 'Billing interval is required'],
    enum: ['month', 'year'],
    default: 'month'
  },
  
  // Feature limits and capabilities
  features: {
    teamMembers: {
      type: Number,
      required: [true, 'Team members limit is required'],
      validate: {
        validator: function(v) {
          return v === -1 || v > 0;
        },
        message: 'Team members must be positive or -1 for unlimited'
      }
    },
    projects: {
      type: Number,
      required: [true, 'Projects limit is required'],
      validate: {
        validator: function(v) {
          return v === -1 || v > 0;
        },
        message: 'Projects must be positive or -1 for unlimited'
      }
    },
    storage: {
      type: Number, // in MB
      required: [true, 'Storage limit is required'],
      validate: {
        validator: function(v) {
          return v === -1 || v > 0;
        },
        message: 'Storage must be positive or -1 for unlimited'
      }
    },
    analytics: {
      type: String,
      enum: ['basic', 'advanced'],
      default: 'basic'
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    customIntegrations: {
      type: Boolean,
      default: false
    },
    apiCalls: {
      type: Number, // monthly API calls limit
      default: 1000,
      validate: {
        validator: function(v) {
          return v === -1 || v > 0;
        },
        message: 'API calls must be positive or -1 for unlimited'
      }
    }
  },
  
  // Plan status
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Plan metadata
  popularPlan: {
    type: Boolean,
    default: false
  },
  recommendedPlan: {
    type: Boolean,
    default: false
  },
  
  // Billing configuration
  trialDays: {
    type: Number,
    default: 0,
    min: [0, 'Trial days cannot be negative']
  },
  setupFee: {
    type: Number,
    default: 0,
    min: [0, 'Setup fee cannot be negative']
  },
  
  // Plan ordering (for display)
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
planSchema.index({ name: 1 });
planSchema.index({ isActive: 1, sortOrder: 1 });
planSchema.index({ price: 1 });

// Virtual for unlimited features
planSchema.virtual('unlimitedTeamMembers').get(function() {
  return this.features.teamMembers === -1;
});

planSchema.virtual('unlimitedProjects').get(function() {
  return this.features.projects === -1;
});

planSchema.virtual('unlimitedStorage').get(function() {
  return this.features.storage === -1;
});

// Static method to get default plan
planSchema.statics.getDefaultPlan = function() {
  return this.findOne({ isDefault: true, isActive: true });
};

// Static method to get plan by name
planSchema.statics.getByName = function(name) {
  return this.findOne({ name, isActive: true });
};

// Static method to get all active plans
planSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, price: 1 });
};

// Instance method to check if feature is included
planSchema.methods.hasFeature = function(featureName) {
  switch (featureName) {
    case 'advanced_analytics':
      return this.features.analytics === 'advanced';
    case 'priority_support':
      return this.features.prioritySupport;
    case 'custom_integrations':
      return this.features.customIntegrations;
    default:
      return false;
  }
};

// Instance method to check usage limits
planSchema.methods.checkLimit = function(limitType, currentUsage) {
  const limit = this.features[limitType];
  
  if (limit === -1) {
    return { withinLimit: true, unlimited: true, percentage: 0 };
  }
  
  const percentage = (currentUsage / limit) * 100;
  
  return {
    withinLimit: currentUsage <= limit,
    unlimited: false,
    percentage: Math.min(percentage, 100),
    current: currentUsage,
    limit: limit,
    remaining: Math.max(0, limit - currentUsage)
  };
};

// Pre-save middleware to ensure only one default plan
planSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default flag from other plans
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
