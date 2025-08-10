const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: [true, 'Subscription is required']
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan is required']
  },
  
  // Payment amount and currency
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR'
  },
  
  // Payment gateway information
  gateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'manual', 'bank_transfer'],
    required: [true, 'Payment gateway is required']
  },
  gatewayPaymentId: {
    type: String,
    required: function() {
      return this.gateway !== 'manual';
    }
  },
  gatewayOrderId: String,
  gatewaySignature: String,
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Payment method details
  method: {
    type: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'bank_transfer', 'manual'],
      required: [true, 'Payment method type is required']
    },
    details: {
      // For card payments
      last4: String,
      brand: String,
      expiryMonth: String,
      expiryYear: String,
      
      // For UPI payments
      vpa: String,
      
      // For bank transfer
      bankName: String,
      accountNumber: String,
      
      // For wallet
      walletName: String
    }
  },
  
  // Dates
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  refundedAt: Date,
  
  // Payment description and invoice
  description: {
    type: String,
    default: function() {
      return `Subscription payment for ${this.plan?.displayName || 'plan'}`;
    }
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  receiptNumber: String,
  
  // Discount and taxes
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    value: Number,
    amount: Number,
    couponCode: String
  },
  taxes: [{
    name: String,
    rate: Number,
    amount: Number
  }],
  
  // Refund information
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    gatewayRefundId: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Failure information
  failure: {
    code: String,
    message: String,
    step: String, // Where in the payment process it failed
    retryCount: {
      type: Number,
      default: 0
    },
    lastRetryAt: Date
  },
  
  // Webhook and notification tracking
  webhookReceived: {
    type: Boolean,
    default: false
  },
  webhookData: {
    type: mongoose.Schema.Types.Mixed
  },
  notificationsSent: {
    success: { type: Date },
    failure: { type: Date },
    receipt: { type: Date }
  },
  
  // Payment metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Risk and fraud detection
  riskScore: Number,
  fraudFlags: [String],
  
  // Recurring payment information
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringId: String, // Gateway recurring payment ID
  
  // Payment attempts (for failed payments)
  attempts: [{
    attemptedAt: Date,
    status: String,
    failureReason: String,
    gatewayResponse: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ subscription: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ gateway: 1, gatewayPaymentId: 1 });
paymentSchema.index({ gatewayOrderId: 1 });
paymentSchema.index({ receiptNumber: 1 });
paymentSchema.index({ 'failure.retryCount': 1, status: 1 });

// Virtual for payment duration
paymentSchema.virtual('processingDuration').get(function() {
  if (!this.processedAt || !this.initiatedAt) return null;
  return this.processedAt - this.initiatedAt;
});

// Virtual for is successful
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Virtual for is failed
paymentSchema.virtual('isFailed').get(function() {
  return ['failed', 'cancelled'].includes(this.status);
});

// Virtual for can retry
paymentSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && 
         this.failure.retryCount < 3 && 
         this.gateway !== 'manual';
});

// Static method to find pending payments
paymentSchema.statics.findPending = function() {
  return this.find({ 
    status: { $in: ['pending', 'processing'] },
    initiatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });
};

// Static method to find failed payments for retry
paymentSchema.statics.findFailedForRetry = function() {
  return this.find({
    status: 'failed',
    'failure.retryCount': { $lt: 3 },
    'failure.lastRetryAt': { 
      $lt: new Date(Date.now() - 60 * 60 * 1000) // At least 1 hour ago
    }
  });
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function(startDate, endDate) {
  const match = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate || new Date()
    }
  };
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        successfulAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        avgAmount: { $avg: '$amount' },
        avgProcessingTime: { $avg: '$processingDuration' }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    successfulAmount: 0,
    failedPayments: 0,
    avgAmount: 0,
    avgProcessingTime: 0
  };
  
  result.successRate = result.totalPayments > 0 ? 
    (result.successfulPayments / result.totalPayments) * 100 : 0;
  
  return result;
};

// Instance method to mark as completed
paymentSchema.methods.markCompleted = async function(gatewayData = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.processedAt = new Date();
  
  if (gatewayData.paymentId) {
    this.gatewayPaymentId = gatewayData.paymentId;
  }
  
  if (gatewayData.signature) {
    this.gatewaySignature = gatewayData.signature;
  }
  
  // Generate receipt number if not present
  if (!this.receiptNumber) {
    this.receiptNumber = this.generateReceiptNumber();
  }
  
  return this.save();
};

// Instance method to mark as failed
paymentSchema.methods.markFailed = async function(failureData = {}) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.processedAt = new Date();
  
  this.failure = {
    code: failureData.code || 'UNKNOWN_ERROR',
    message: failureData.message || 'Payment failed',
    step: failureData.step || 'processing',
    retryCount: this.failure?.retryCount || 0,
    lastRetryAt: new Date()
  };
  
  // Add to attempts
  this.attempts.push({
    attemptedAt: new Date(),
    status: 'failed',
    failureReason: failureData.message,
    gatewayResponse: failureData.gatewayResponse
  });
  
  return this.save();
};

// Instance method to retry payment
paymentSchema.methods.retry = async function() {
  if (!this.canRetry) {
    throw new Error('Payment cannot be retried');
  }
  
  this.status = 'pending';
  this.failure.retryCount += 1;
  this.failure.lastRetryAt = new Date();
  
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = async function(refundAmount, reason, processedBy) {
  if (this.status !== 'completed') {
    throw new Error('Can only refund completed payments');
  }
  
  const refundAmt = refundAmount || this.amount;
  
  if (refundAmt > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }
  
  this.refund = {
    amount: refundAmt,
    reason: reason,
    refundedAt: new Date(),
    processedBy: processedBy
  };
  
  this.status = 'refunded';
  this.refundedAt = new Date();
  
  return this.save();
};

// Instance method to generate receipt number
paymentSchema.methods.generateReceiptNumber = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `CB-${year}${month}${day}-${random}`;
};

// Pre-save middleware to set receipt number
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.receiptNumber) {
    this.receiptNumber = this.generateReceiptNumber();
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
