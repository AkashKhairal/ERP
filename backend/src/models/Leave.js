const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['sick', 'casual', 'annual', 'unpaid', 'maternity', 'paternity', 'bereavement'],
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
  totalDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  documents: [{
    filename: String,
    path: String,
    uploadedAt: Date
  }],
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayType: {
    type: String,
    enum: ['first_half', 'second_half'],
    required: function() {
      return this.isHalfDay;
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  workHandover: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
leaveSchema.index({ employee: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1 });
leaveSchema.index({ endDate: 1 });
leaveSchema.index({ leaveType: 1 });

// Virtual for leave duration
leaveSchema.virtual('duration').get(function() {
  if (this.isHalfDay) {
    return 'Half Day';
  }
  const days = this.totalDays;
  return days === 1 ? '1 Day' : `${days} Days`;
});

// Virtual for formatted date range
leaveSchema.virtual('dateRange').get(function() {
  const start = this.startDate.toLocaleDateString('en-IN');
  const end = this.endDate.toLocaleDateString('en-IN');
  return start === end ? start : `${start} - ${end}`;
});

// Pre-save middleware to calculate total days
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.totalDays = this.isHalfDay ? 0.5 : diffDays;
  }
  next();
});

// Method to approve leave
leaveSchema.methods.approve = function(approvedBy) {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

// Method to reject leave
leaveSchema.methods.reject = function(approvedBy, rejectionReason) {
  this.status = 'rejected';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.rejectionReason = rejectionReason;
  return this.save();
};

// Method to cancel leave
leaveSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Method to add comment
leaveSchema.methods.addComment = function(userId, comment) {
  this.comments.push({
    user: userId,
    comment: comment
  });
  return this.save();
};

// Static method to get leaves by employee
leaveSchema.statics.getByEmployee = function(employeeId, status = null) {
  const query = { employee: employeeId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('employee', 'employeeId')
    .populate('employee.user', 'firstName lastName email')
    .populate('approvedBy', 'firstName lastName')
    .populate('workHandover.assignedTo', 'firstName lastName')
    .sort({ createdAt: -1 });
};

// Static method to get pending leaves
leaveSchema.statics.getPendingLeaves = function() {
  return this.find({ status: 'pending' })
    .populate('employee', 'employeeId')
    .populate('employee.user', 'firstName lastName email department')
    .populate('approvedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
};

// Static method to get leaves by date range
leaveSchema.statics.getByDateRange = function(startDate, endDate, status = null) {
  const query = {
    startDate: { $lte: endDate },
    endDate: { $gte: startDate }
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('employee', 'employeeId')
    .populate('employee.user', 'firstName lastName email department')
    .populate('approvedBy', 'firstName lastName')
    .sort({ startDate: 1 });
};

// Static method to get leave statistics
leaveSchema.statics.getStatistics = function(employeeId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        employee: mongoose.Types.ObjectId(employeeId),
        startDate: { $gte: startDate },
        endDate: { $lte: endDate },
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$leaveType',
        totalDays: { $sum: '$totalDays' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to check leave conflicts
leaveSchema.statics.checkConflicts = function(employeeId, startDate, endDate, excludeId = null) {
  const query = {
    employee: employeeId,
    status: { $in: ['pending', 'approved'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate }
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Leave', leaveSchema); 