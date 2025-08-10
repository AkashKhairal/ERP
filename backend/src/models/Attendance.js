const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    time: {
      type: Date
    },
    location: {
      type: String,
      default: 'Office'
    },
    method: {
      type: String,
      enum: ['manual', 'auto', 'system'],
      default: 'manual'
    }
  },
  checkOut: {
    time: {
      type: Date
    },
    location: {
      type: String,
      default: 'Office'
    },
    method: {
      type: String,
      enum: ['manual', 'auto', 'system'],
      default: 'manual'
    }
  },
  totalHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half_day', 'leave', 'holiday', 'weekend'],
    default: 'present'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for employee and date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for check-in time string
attendanceSchema.virtual('checkInTime').get(function() {
  return this.checkIn.time ? this.checkIn.time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  }) : null;
});

// Virtual for check-out time string
attendanceSchema.virtual('checkOutTime').get(function() {
  return this.checkOut.time ? this.checkOut.time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  }) : null;
});

// Pre-save middleware to calculate total hours
attendanceSchema.pre('save', function(next) {
  if (this.checkIn.time && this.checkOut.time) {
    const diffTime = Math.abs(this.checkOut.time - this.checkIn.time);
    const diffHours = diffTime / (1000 * 60 * 60);
    this.totalHours = parseFloat(diffHours.toFixed(2));
  }
  next();
});

// Method to perform check in
attendanceSchema.methods.performCheckIn = function(location = 'Office', method = 'manual') {
  this.checkIn = {
    time: new Date(),
    location,
    method
  };
  this.status = 'present';
  return this.save();
};

// Method to perform check out
attendanceSchema.methods.performCheckOut = function(location = 'Office', method = 'manual') {
  this.checkOut = {
    time: new Date(),
    location,
    method
  };
  return this.save();
};

// Method to mark as absent
attendanceSchema.methods.markAbsent = function(notes = '') {
  this.status = 'absent';
  this.notes = notes;
  return this.save();
};

// Method to approve attendance
attendanceSchema.methods.approve = function(approvedBy) {
  this.isApproved = true;
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

// Static method to get attendance by date range
attendanceSchema.statics.getByDateRange = function(employeeId, startDate, endDate) {
  return this.find({
    employee: employeeId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Static method to get attendance by month
attendanceSchema.statics.getByMonth = function(employeeId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return this.find({
    employee: employeeId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Static method to get attendance summary
attendanceSchema.statics.getSummary = function(employeeId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        employee: mongoose.Types.ObjectId(employeeId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
          }
        },
        absentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
          }
        },
        totalHours: { $sum: '$totalHours' },
        averageHours: { $avg: '$totalHours' }
      }
    }
  ]);
};

module.exports = mongoose.model('Attendance', attendanceSchema); 