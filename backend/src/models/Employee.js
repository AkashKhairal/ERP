const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dateOfJoining: {
    type: Date,
    required: true
  },
  dateOfExit: {
    type: Date
  },
  panNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  aadharNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^[0-9]{12}$/, 'Please enter a valid Aadhar number']
  },
  resume: {
    filename: String,
    path: String,
    uploadedAt: Date
  },
  linkedin: {
    type: String,
    match: [/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/, 'Please enter a valid LinkedIn URL']
  },
  skills: [{
    type: String,
    trim: true
  }],
  profilePicture: {
    filename: String,
    path: String,
    uploadedAt: Date
  },
  status: {
    type: String,
    enum: ['active', 'exited', 'on_leave', 'suspended'],
    default: 'active'
  },
  workType: {
    type: String,
    enum: ['full_time', 'freelancer', 'intern', 'contract'],
    default: 'full_time'
  },
  salary: {
    base: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    effectiveFrom: {
      type: Date,
      default: Date.now
    }
  },
  leaveBalance: {
    sick: { type: Number, default: 12 },
    casual: { type: Number, default: 12 },
    annual: { type: Number, default: 21 },
    unpaid: { type: Number, default: 0 }
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branch: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['aadhar', 'pan', 'resume', 'offer_letter', 'experience_certificate', 'other']
    },
    filename: String,
    path: String,
    uploadedAt: Date,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  onboardingStatus: {
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedSteps: [{
      step: String,
      completedAt: Date,
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    pendingSteps: [String]
  },
  offboardingStatus: {
    isInitiated: {
      type: Boolean,
      default: false
    },
    initiatedAt: Date,
    exitDate: Date,
    completedSteps: [{
      step: String,
      completedAt: Date,
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    pendingSteps: [String]
  }
}, {
  timestamps: true
});

// Index for better query performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ workType: 1 });
employeeSchema.index({ reportingManager: 1 });
employeeSchema.index({ department: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
});

// Virtual for experience in years
employeeSchema.virtual('experienceYears').get(function() {
  if (!this.dateOfJoining) return 0;
  const exitDate = this.dateOfExit || new Date();
  const diffTime = Math.abs(exitDate - this.dateOfJoining);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return (diffDays / 365).toFixed(1);
});

// Pre-save middleware to generate employee ID
employeeSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Method to update leave balance
employeeSchema.methods.updateLeaveBalance = function(leaveType, days) {
  if (this.leaveBalance[leaveType] !== undefined) {
    this.leaveBalance[leaveType] += days;
  }
  return this.save();
};

// Method to check if onboarding is complete
employeeSchema.methods.isOnboardingComplete = function() {
  return this.onboardingStatus.isCompleted;
};

// Method to initiate offboarding
employeeSchema.methods.initiateOffboarding = function(exitDate) {
  this.offboardingStatus.isInitiated = true;
  this.offboardingStatus.initiatedAt = new Date();
  this.offboardingStatus.exitDate = exitDate;
  this.status = 'exited';
  return this.save();
};

// Static method to get employees by department
employeeSchema.statics.getByDepartment = function(department) {
  return this.find({ 'user.department': department, status: 'active' })
    .populate('user', 'firstName lastName email role department')
    .populate('reportingManager', 'firstName lastName email');
};

// Static method to get employees by status
employeeSchema.statics.getByStatus = function(status) {
  return this.find({ status })
    .populate('user', 'firstName lastName email role department')
    .populate('reportingManager', 'firstName lastName email');
};

module.exports = mongoose.model('Employee', employeeSchema); 