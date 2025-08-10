const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true // One subscription per user
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan is required']
  },
  
  // Subscription status
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due', 'unpaid', 'trialing'],
    default: 'active'
  },
  
  // Subscription dates
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  renewalDate: {
    type: Date,
    required: [true, 'Renewal date is required']
  },
  trialEndDate: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  
  // Billing information
  billing: {
    amount: {
      type: Number,
      required: [true, 'Billing amount is required'],
      min: [0, 'Billing amount cannot be negative']
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
    }
  },
  
  // Auto-renewal settings
  autoRenew: {
    type: Boolean,
    default: true
  },
  
  // Payment information
  paymentMethod: {
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'manual'],
      default: 'manual'
    },
    customerId: String, // Gateway customer ID
    subscriptionId: String, // Gateway subscription ID
    paymentMethodId: String // Gateway payment method ID
  },
  
  // Subscription history and changes
  planHistory: [{
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    previousPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan'
    }
  }],
  
  // Cancellation information
  cancellation: {
    reason: String,
    feedback: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    effectiveDate: Date, // When cancellation takes effect
    immediateCancel: {
      type: Boolean,
      default: false
    }
  },
  
  // Discount and coupon information
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_trial']
    },
    value: Number,
    couponCode: String,
    validUntil: Date,
    appliedAt: Date
  },
  
  // Notifications and reminders
  notifications: {
    renewalReminder: {
      type: Boolean,
      default: true
    },
    usageWarnings: {
      type: Boolean,
      default: true
    },
    paymentFailures: {
      type: Boolean,
      default: true
    }
  },
  
  // Metadata
  metadata: {
    source: String, // Where the subscription was created
    campaignId: String,
    referralCode: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1, renewalDate: 1 });
subscriptionSchema.index({ 'paymentMethod.gateway': 1, 'paymentMethod.subscriptionId': 1 });
subscriptionSchema.index({ renewalDate: 1 });
subscriptionSchema.index({ endDate: 1 });

// Virtual for days until renewal
subscriptionSchema.virtual('daysUntilRenewal').get(function() {
  if (!this.renewalDate) return 0;
  
  const today = new Date();
  const renewal = new Date(this.renewalDate);
  
  if (renewal <= today) return 0;
  
  const diffTime = renewal - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for subscription age in days
subscriptionSchema.virtual('subscriptionAge').get(function() {
  const today = new Date();
  const start = new Date(this.startDate);
  
  const diffTime = today - start;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is in trial
subscriptionSchema.virtual('isInTrial').get(function() {
  if (!this.trialEndDate) return false;
  return new Date() < new Date(this.trialEndDate);
});

// Virtual for is expired
subscriptionSchema.virtual('isExpired').get(function() {
  return new Date() > new Date(this.endDate);
});

// Virtual for is about to expire (within 7 days)
subscriptionSchema.virtual('isExpiringSoon').get(function() {
  const daysUntilRenewal = this.daysUntilRenewal;
  return daysUntilRenewal > 0 && daysUntilRenewal <= 7;
});

// Static method to find active subscriptions
subscriptionSchema.statics.findActive = function() {
  return this.find({ status: 'active' })
    .populate('user', 'firstName lastName email')
    .populate('plan', 'name displayName price features');
};

// Static method to find expiring subscriptions
subscriptionSchema.statics.findExpiring = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'active',
    renewalDate: { $lte: futureDate },
    autoRenew: false
  })
  .populate('user', 'firstName lastName email')
  .populate('plan', 'name displayName');
};

// Static method to find past due subscriptions
subscriptionSchema.statics.findPastDue = function() {
  return this.find({
    status: { $in: ['past_due', 'unpaid'] },
    renewalDate: { $lt: new Date() }
  })
  .populate('user', 'firstName lastName email')
  .populate('plan', 'name displayName');
};

// Instance method to renew subscription
subscriptionSchema.methods.renew = async function(newEndDate) {
  const currentDate = new Date();
  
  this.startDate = currentDate;
  this.endDate = newEndDate || this.calculateNextEndDate();
  this.renewalDate = this.calculateNextRenewalDate();
  this.status = 'active';
  
  return this.save();
};

// Instance method to calculate next end date
subscriptionSchema.methods.calculateNextEndDate = function() {
  const currentEnd = new Date(this.endDate);
  const newEnd = new Date(currentEnd);
  
  if (this.billing.interval === 'month') {
    newEnd.setMonth(newEnd.getMonth() + 1);
  } else if (this.billing.interval === 'year') {
    newEnd.setFullYear(newEnd.getFullYear() + 1);
  }
  
  return newEnd;
};

// Instance method to calculate next renewal date
subscriptionSchema.methods.calculateNextRenewalDate = function() {
  const renewalDate = new Date(this.endDate);
  // Renewal date is typically a few days before end date
  renewalDate.setDate(renewalDate.getDate() - 3);
  return renewalDate;
};

// Instance method to upgrade/downgrade plan
subscriptionSchema.methods.changePlan = async function(newPlan, changedBy, reason) {
  // Add to plan history
  this.planHistory.push({
    plan: newPlan._id,
    changedBy: changedBy,
    reason: reason,
    previousPlan: this.plan
  });
  
  // Update current plan and billing
  this.plan = newPlan._id;
  this.billing.amount = newPlan.price;
  this.billing.currency = newPlan.currency;
  this.billing.interval = newPlan.interval;
  
  return this.save();
};

// Instance method to cancel subscription
subscriptionSchema.methods.cancel = async function(reason, cancelledBy, immediate = false) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.autoRenew = false;
  
  this.cancellation = {
    reason: reason,
    cancelledBy: cancelledBy,
    effectiveDate: immediate ? new Date() : this.endDate,
    immediateCancel: immediate
  };
  
  if (immediate) {
    this.endDate = new Date();
  }
  
  return this.save();
};

// Instance method to reactivate subscription
subscriptionSchema.methods.reactivate = async function() {
  if (this.status === 'cancelled' && new Date() < new Date(this.endDate)) {
    this.status = 'active';
    this.autoRenew = true;
    this.cancelledAt = undefined;
    this.cancellation = undefined;
    
    return this.save();
  }
  
  throw new Error('Cannot reactivate expired or invalid subscription');
};

// Pre-save middleware to set renewal date
subscriptionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('endDate')) {
    this.renewalDate = this.calculateNextRenewalDate();
  }
  next();
});

// Pre-save middleware to update end date based on billing interval
subscriptionSchema.pre('save', function(next) {
  if (this.isNew) {
    const startDate = new Date(this.startDate);
    const endDate = new Date(startDate);
    
    if (this.billing.interval === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (this.billing.interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    this.endDate = endDate;
  }
  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
