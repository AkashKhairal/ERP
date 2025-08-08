const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Task description cannot exceed 2000 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  status: {
    type: String,
    enum: ['todo', 'doing', 'review', 'done', 'cancelled'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['feature', 'bug', 'improvement', 'content', 'design', 'testing', 'deployment', 'other'],
    default: 'feature'
  },
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Dates
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  startDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  // Time tracking
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    default: 0
  },
  // Recurring task settings
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    endDate: {
      type: Date
    },
    maxOccurrences: {
      type: Number,
      min: 1
    }
  },
  // Dependencies
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'related'],
      default: 'blocks'
    }
  }],
  // Subtasks
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Attachments and links
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
  links: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['design', 'reference', 'documentation', 'other'],
      default: 'other'
    }
  }],
  // Labels and tags
  labels: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  // Comments
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
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
  // Notifications
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    slack: {
      type: Boolean,
      default: false
    },
    reminderDays: {
      type: Number,
      min: 0,
      default: 1
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
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ isRecurring: 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (this.dueDate && this.status !== 'done' && this.status !== 'cancelled') {
    return new Date() > this.dueDate;
  }
  return false;
});

// Virtual for days remaining
taskSchema.virtual('daysRemaining').get(function() {
  if (this.dueDate) {
    const today = new Date();
    const diffTime = this.dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return 0;
});

// Virtual for completion percentage based on subtasks
taskSchema.virtual('subtaskProgress').get(function() {
  if (this.subtasks.length === 0) return 0;
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Pre-save middleware to update progress
taskSchema.pre('save', function(next) {
  // Update progress based on subtasks if no manual progress is set
  if (this.subtasks.length > 0 && this.progress === 0) {
    this.progress = this.subtaskProgress;
  }
  
  // Update completed date when status changes to done
  if (this.isModified('status') && this.status === 'done' && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  next();
});

// Method to add subtask
taskSchema.methods.addSubtask = function(title) {
  this.subtasks.push({ title });
  return this.save();
};

// Method to complete subtask
taskSchema.methods.completeSubtask = function(subtaskIndex, userId) {
  if (this.subtasks[subtaskIndex]) {
    this.subtasks[subtaskIndex].completed = true;
    this.subtasks[subtaskIndex].completedAt = new Date();
    this.subtasks[subtaskIndex].completedBy = userId;
  }
  return this.save();
};

// Method to add comment
taskSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

// Method to update status
taskSchema.methods.updateStatus = function(status, userId) {
  this.status = status;
  this.updatedBy = userId;
  
  if (status === 'done' && !this.completedDate) {
    this.completedDate = new Date();
  }
  
  return this.save();
};

// Method to assign task
taskSchema.methods.assignTask = function(userId, assignedBy) {
  this.assignedTo = userId;
  this.assignedBy = assignedBy;
  return this.save();
};

// Static method to get tasks by status
taskSchema.statics.getByStatus = function(status, projectId = null) {
  const query = { status, isActive: true };
  if (projectId) query.project = projectId;
  return this.find(query).populate('assignedTo', 'firstName lastName email');
};

// Static method to get user's tasks
taskSchema.statics.getUserTasks = function(userId, status = null) {
  const query = { assignedTo: userId, isActive: true };
  if (status) query.status = status;
  return this.find(query).populate('project', 'name');
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $nin: ['done', 'cancelled'] },
    isActive: true
  }).populate('assignedTo', 'firstName lastName email');
};

// Static method to get tasks by priority
taskSchema.statics.getByPriority = function(priority) {
  return this.find({ priority, isActive: true }).populate('assignedTo', 'firstName lastName email');
};

// Static method to get recurring tasks
taskSchema.statics.getRecurringTasks = function() {
  return this.find({ isRecurring: true, isActive: true });
};

module.exports = mongoose.model('Task', taskSchema); 