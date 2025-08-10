const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 1
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true
  },
  series: {
    type: String,
    default: 'INV',
    trim: true
  },
  sequenceNumber: {
    type: Number,
    required: true
  },
  
  // Client Information
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  clientDetails: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    taxId: String, // GST number, VAT number, etc.
    companyName: String
  },
  
  // Invoice Details
  invoiceDate: {
    type: Date,
    required: [true, 'Invoice date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  
  // Items
  items: [invoiceItemSchema],
  
  // Financial Details
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  taxTotal: {
    type: Number,
    default: 0,
    min: [0, 'Tax total cannot be negative']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  },
  discountValue: {
    type: Number,
    default: 0,
    min: [0, 'Discount value cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  
  // Status and Payment
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net_15', 'net_30', 'net_45', 'net_60', 'custom'],
    default: 'net_30'
  },
  customPaymentTerms: String,
  
  // Payment Information
  payments: [{
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative']
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'card', 'upi', 'cheque', 'other'],
      required: true
    },
    reference: String,
    notes: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Additional Information
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  terms: {
    type: String,
    maxlength: [2000, 'Terms cannot exceed 2000 characters']
  },
  internalNotes: {
    type: String,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  },
  
  // Project/Service Reference
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  
  // File Management
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // PDF Generation
  pdf: {
    filename: String,
    url: String,
    generatedAt: Date,
    version: {
      type: Number,
      default: 1
    }
  },
  
  // Tracking
  sentAt: Date,
  viewedAt: Date,
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Recurring Invoice
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringSettings: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly']
    },
    nextInvoiceDate: Date,
    endDate: Date,
    totalInvoices: Number,
    generatedCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ client: 1, createdAt: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ 'recurringSettings.nextInvoiceDate': 1 });

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'paid' || this.paymentStatus === 'paid') return 0;
  
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  
  if (today <= dueDate) return 0;
  
  const diffTime = today - dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for balance due
invoiceSchema.virtual('balanceDue').get(function() {
  const totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return Math.max(0, this.total - totalPaid);
});

// Virtual for amount paid
invoiceSchema.virtual('amountPaid').get(function() {
  return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
});

// Virtual for is overdue
invoiceSchema.virtual('isOverdue').get(function() {
  return this.daysOverdue > 0;
});

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.amount = item.quantity * item.unitPrice;
    item.taxAmount = (item.amount * item.taxRate) / 100;
  });
  
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate tax total
  this.taxTotal = this.items.reduce((sum, item) => sum + item.taxAmount, 0);
  
  // Calculate discount amount
  if (this.discountType === 'percentage') {
    this.discountAmount = (this.subtotal * this.discountValue) / 100;
  } else {
    this.discountAmount = this.discountValue;
  }
  
  // Calculate total
  this.total = this.subtotal + this.taxTotal - this.discountAmount;
  
  // Update payment status based on payments
  const totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  if (totalPaid === 0) {
    this.paymentStatus = 'unpaid';
  } else if (totalPaid >= this.total) {
    this.paymentStatus = 'paid';
    this.status = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }
  
  // Update overdue status
  if (this.paymentStatus !== 'paid' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  
  // Set due date if not provided
  if (this.isNew && !this.dueDate) {
    const daysToAdd = {
      'immediate': 0,
      'net_15': 15,
      'net_30': 30,
      'net_45': 45,
      'net_60': 60,
      'custom': 30
    };
    
    this.dueDate = new Date(this.invoiceDate);
    this.dueDate.setDate(this.dueDate.getDate() + daysToAdd[this.paymentTerms]);
  }
  
  next();
});

// Pre-save middleware to generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    try {
      // Get the latest invoice for sequence number
      const latestInvoice = await this.constructor.findOne({ series: this.series })
        .sort({ sequenceNumber: -1 });
      
      this.sequenceNumber = latestInvoice ? latestInvoice.sequenceNumber + 1 : 1;
      
      // Generate invoice number with current date
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const sequence = String(this.sequenceNumber).padStart(4, '0');
      
      this.invoiceNumber = `${this.series}-${year}${month}-${sequence}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Instance method to add payment
invoiceSchema.methods.addPayment = async function(paymentData) {
  this.payments.push({
    amount: paymentData.amount,
    paymentDate: paymentData.date || new Date(),
    paymentMethod: paymentData.method,
    reference: paymentData.reference,
    notes: paymentData.notes,
    recordedBy: paymentData.recordedBy
  });
  
  return this.save();
};

// Instance method to mark as sent
invoiceSchema.methods.markAsSent = async function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

// Instance method to record view
invoiceSchema.methods.recordView = async function() {
  if (this.status === 'sent') {
    this.status = 'viewed';
    this.viewedAt = new Date();
  }
  this.viewCount += 1;
  return this.save();
};

// Static method to find overdue invoices
invoiceSchema.statics.findOverdue = function() {
  return this.find({
    status: { $ne: 'paid' },
    paymentStatus: { $ne: 'paid' },
    dueDate: { $lt: new Date() }
  }).populate('client', 'firstName lastName email');
};

// Static method to get revenue for period
invoiceSchema.statics.getRevenueForPeriod = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'paid',
        invoiceDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        invoiceCount: { $sum: 1 },
        averageInvoiceValue: { $avg: '$total' }
      }
    }
  ]);
};

// Static method to find due for recurring generation
invoiceSchema.statics.findDueForRecurring = function() {
  return this.find({
    isRecurring: true,
    'recurringSettings.nextInvoiceDate': { $lte: new Date() },
    $or: [
      { 'recurringSettings.endDate': { $exists: false } },
      { 'recurringSettings.endDate': { $gte: new Date() } }
    ]
  });
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
