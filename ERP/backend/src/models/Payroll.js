const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  allowances: {
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    ta: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  deductions: {
    pf: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  bonuses: {
    performance: { type: Number, default: 0 },
    festival: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  overtime: {
    hours: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  leaves: {
    paid: { type: Number, default: 0 },
    unpaid: { type: Number, default: 0 },
    deduction: { type: Number, default: 0 }
  },
  grossSalary: {
    type: Number,
    required: true
  },
  netSalary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'paid', 'cancelled'],
    default: 'draft'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cheque', 'cash'],
    default: 'bank_transfer'
  },
  transactionId: {
    type: String
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for employee, month, and year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ month: 1, year: 1 });
payrollSchema.index({ status: 1 });

// Virtual for total allowances
payrollSchema.virtual('totalAllowances').get(function() {
  return Object.values(this.allowances).reduce((sum, value) => sum + value, 0);
});

// Virtual for total deductions
payrollSchema.virtual('totalDeductions').get(function() {
  return Object.values(this.deductions).reduce((sum, value) => sum + value, 0);
});

// Virtual for total bonuses
payrollSchema.virtual('totalBonuses').get(function() {
  return Object.values(this.bonuses).reduce((sum, value) => sum + value, 0);
});

// Virtual for formatted month-year
payrollSchema.virtual('period').get(function() {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[this.month - 1]} ${this.year}`;
});

// Pre-save middleware to calculate totals
payrollSchema.pre('save', function(next) {
  // Calculate gross salary
  this.grossSalary = this.basicSalary + this.totalAllowances + this.totalBonuses + this.overtime.amount;
  
  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions - this.leaves.deduction;
  
  next();
});

// Method to approve payroll
payrollSchema.methods.approve = function(approvedBy) {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

// Method to mark as paid
payrollSchema.methods.markAsPaid = function(paymentDate, transactionId = null) {
  this.status = 'paid';
  this.paymentDate = paymentDate;
  if (transactionId) {
    this.transactionId = transactionId;
  }
  return this.save();
};

// Method to cancel payroll
payrollSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Static method to get payroll by employee
payrollSchema.statics.getByEmployee = function(employeeId, year = null) {
  const query = { employee: employeeId };
  if (year) {
    query.year = year;
  }
  
  return this.find(query)
    .populate('employee', 'employeeId')
    .populate('employee.user', 'firstName lastName email')
    .populate('approvedBy', 'firstName lastName')
    .populate('generatedBy', 'firstName lastName')
    .sort({ year: -1, month: -1 });
};

// Static method to get payroll by month
payrollSchema.statics.getByMonth = function(month, year) {
  return this.find({ month, year })
    .populate('employee', 'employeeId')
    .populate('employee.user', 'firstName lastName email department')
    .populate('approvedBy', 'firstName lastName')
    .populate('generatedBy', 'firstName lastName')
    .sort({ 'employee.user.firstName': 1 });
};

// Static method to get payroll statistics
payrollSchema.statics.getStatistics = function(year) {
  return this.aggregate([
    {
      $match: {
        year: year,
        status: { $in: ['approved', 'paid'] }
      }
    },
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        totalGrossSalary: { $sum: '$grossSalary' },
        totalNetSalary: { $sum: '$netSalary' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalBonuses: { $sum: '$totalBonuses' }
      }
    }
  ]);
};

// Static method to get department-wise statistics
payrollSchema.statics.getDepartmentStatistics = function(month, year) {
  return this.aggregate([
    {
      $match: {
        month: month,
        year: year,
        status: { $in: ['approved', 'paid'] }
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employee',
        foreignField: '_id',
        as: 'employeeData'
      }
    },
    {
      $unwind: '$employeeData'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'employeeData.user',
        foreignField: '_id',
        as: 'userData'
      }
    },
    {
      $unwind: '$userData'
    },
    {
      $group: {
        _id: '$userData.department',
        totalEmployees: { $sum: 1 },
        totalGrossSalary: { $sum: '$grossSalary' },
        totalNetSalary: { $sum: '$netSalary' },
        averageSalary: { $avg: '$netSalary' }
      }
    }
  ]);
};

// Static method to check if payroll exists for month
payrollSchema.statics.existsForMonth = function(employeeId, month, year) {
  return this.findOne({ employee: employeeId, month, year });
};

module.exports = mongoose.model('Payroll', payrollSchema); 