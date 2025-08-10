const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Transaction Schema for income and expenses
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      // Income categories
      'youtube_adsense', 'paid_courses', 'client_projects', 'sponsorships', 
      'affiliate_income', 'freelance', 'consulting', 'other_income',
      // Expense categories
      'salary', 'marketing', 'saas_tools', 'freelancers', 'rent', 
      'utilities', 'office_supplies', 'travel', 'meals', 'misc'
    ]
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank_transfer', 'paypal', 'stripe'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'failed'],
    default: 'completed'
  },
  receipt: {
    type: String, // File path or URL
    default: null
  },
  linkedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  linkedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Budget Schema
const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Budget name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'salary', 'marketing', 'saas_tools', 'freelancers', 'rent', 
      'utilities', 'office_supplies', 'travel', 'meals', 'misc'
    ]
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true
  },
  clientAddress: {
    type: String,
    trim: true
  },
  items: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  linkedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Tax Record Schema
const taxRecordSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['gst_paid', 'gst_collected', 'tds_deducted', 'tds_collected'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  period: {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  documentUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'filed', 'verified'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  filedDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ type: 1, category: 1 });
transactionSchema.index({ date: 1 });
transactionSchema.index({ createdBy: 1 });
transactionSchema.index({ linkedProject: 1 });

budgetSchema.index({ category: 1, period: 1 });
budgetSchema.index({ startDate: 1, endDate: 1 });
budgetSchema.index({ isActive: 1 });

invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ clientName: 1 });

taxRecordSchema.index({ type: 1, period: 1 });
taxRecordSchema.index({ status: 1 });
taxRecordSchema.index({ dueDate: 1 });

// Virtual for transaction total
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount);
});

// Virtual for budget remaining
budgetSchema.virtual('remainingAmount').get(function() {
  // This would be calculated based on actual expenses
  return this.amount;
});

// Virtual for invoice status
invoiceSchema.virtual('isOverdue').get(function() {
  return this.status === 'sent' && new Date() > this.dueDate;
});

// Static methods for Transaction
transactionSchema.statics.getMonthlyStats = async function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const stats = await this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats;
};

// Static methods for Budget
budgetSchema.statics.getBudgetVsActual = async function(category, startDate, endDate) {
  const budget = await this.findOne({
    category,
    startDate: { $lte: startDate },
    endDate: { $gte: endDate },
    isActive: true
  });
  
  // Get actual expenses for the period
  const actual = await mongoose.model('Transaction').aggregate([
    {
      $match: {
        type: 'expense',
        category,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  return {
    budget: budget ? budget.amount : 0,
    actual: actual.length > 0 ? actual[0].total : 0
  };
};

// Static methods for Invoice
invoiceSchema.statics.generateInvoiceNumber = async function() {
  const lastInvoice = await this.findOne().sort({ invoiceNumber: -1 });
  const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.slice(-4)) : 0;
  const newNumber = (lastNumber + 1).toString().padStart(4, '0');
  const year = new Date().getFullYear();
  return `INV-${year}-${newNumber}`;
};

// Pre-save middleware for Invoice
invoiceSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    this.invoiceNumber = await this.constructor.generateInvoiceNumber();
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.total = this.subtotal + this.taxAmount;
  
  next();
});

// Add pagination plugin to Transaction schema
transactionSchema.plugin(mongoosePaginate);

// Export models
const Transaction = mongoose.model('Transaction', transactionSchema);
const Budget = mongoose.model('Budget', budgetSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);
const TaxRecord = mongoose.model('TaxRecord', taxRecordSchema);

module.exports = {
  Transaction,
  Budget,
  Invoice,
  TaxRecord
}; 