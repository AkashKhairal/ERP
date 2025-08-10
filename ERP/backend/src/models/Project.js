const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Project description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['youtube', 'saas', 'freelance', 'internal', 'other'],
    required: [true, 'Project type is required']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  actualEndDate: {
    type: Date
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  client: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  // Team assignments
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project manager is required']
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['developer', 'designer', 'editor', 'marketer', 'analyst', 'qa', 'other'],
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Project-specific fields
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Progress tracking
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  // YouTube specific fields
  youtubeChannel: {
    channelId: {
      type: String,
      trim: true
    },
    channelName: {
      type: String,
      trim: true
    },
    targetViews: {
      type: Number,
      min: 0
    },
    targetSubscribers: {
      type: Number,
      min: 0
    }
  },
  // SaaS specific fields
  saasDetails: {
    platform: {
      type: String,
      trim: true
    },
    targetUsers: {
      type: Number,
      min: 0
    },
    revenueTarget: {
      type: Number,
      min: 0
    }
  },
  // Notifications
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    slack: {
      type: Boolean,
      default: false
    }
  },
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ status: 1, type: 1 });
projectSchema.index({ projectManager: 1 });
projectSchema.index({ 'teamMembers.user': 1 });
projectSchema.index({ startDate: 1, endDate: 1 });
projectSchema.index({ priority: 1 });

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function() {
  if (this.endDate) {
    const today = new Date();
    const diffTime = this.endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return 0;
});

// Virtual for overdue status
projectSchema.virtual('isOverdue').get(function() {
  if (this.endDate && this.status !== 'completed') {
    return new Date() > this.endDate;
  }
  return false;
});

// Pre-save middleware to update progress based on tasks
projectSchema.pre('save', function(next) {
  // This will be updated when we implement task progress calculation
  next();
});

// Method to add team member
projectSchema.methods.addTeamMember = function(userId, role) {
  const existingMember = this.teamMembers.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.role = role;
    existingMember.isActive = true;
  } else {
    this.teamMembers.push({
      user: userId,
      role: role
    });
  }
  
  return this.save();
};

// Method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  const memberIndex = this.teamMembers.findIndex(member => 
    member.user.toString() === userId.toString()
  );
  
  if (memberIndex > -1) {
    this.teamMembers[memberIndex].isActive = false;
  }
  
  return this.save();
};

// Method to update progress
projectSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  return this.save();
};

// Static method to get projects by type
projectSchema.statics.getByType = function(type) {
  return this.find({ type, isActive: true }).populate('projectManager', 'firstName lastName email');
};

// Static method to get projects by status
projectSchema.statics.getByStatus = function(status) {
  return this.find({ status, isActive: true }).populate('projectManager', 'firstName lastName email');
};

// Static method to get user's projects
projectSchema.statics.getUserProjects = function(userId) {
  return this.find({
    $or: [
      { projectManager: userId },
      { 'teamMembers.user': userId, 'teamMembers.isActive': true }
    ],
    isActive: true
  }).populate('projectManager', 'firstName lastName email');
};

// Static method to get overdue projects
projectSchema.statics.getOverdueProjects = function() {
  return this.find({
    endDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] },
    isActive: true
  }).populate('projectManager', 'firstName lastName email');
};

module.exports = mongoose.model('Project', projectSchema); 