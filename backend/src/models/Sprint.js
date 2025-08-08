const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sprint name is required'],
    trim: true,
    maxlength: [100, 'Sprint name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Sprint description cannot exceed 500 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  // Sprint goals
  goals: [{
    description: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  // Task assignments
  tasks: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    storyPoints: {
      type: Number,
      min: 0,
      default: 0
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  }],
  // Capacity planning
  capacity: {
    totalStoryPoints: {
      type: Number,
      min: 0,
      default: 0
    },
    completedStoryPoints: {
      type: Number,
      min: 0,
      default: 0
    },
    teamCapacity: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  // Sprint metrics
  metrics: {
    velocity: {
      type: Number,
      min: 0,
      default: 0
    },
    burndownData: [{
      date: {
        type: Date,
        required: true
      },
      remainingPoints: {
        type: Number,
        required: true
      }
    }]
  },
  // Retrospective
  retrospective: {
    whatWentWell: [{
      type: String,
      trim: true
    }],
    whatWentWrong: [{
      type: String,
      trim: true
    }],
    improvements: [{
      type: String,
      trim: true
    }],
    completedAt: {
      type: Date
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

// Indexes
sprintSchema.index({ project: 1, status: 1 });
sprintSchema.index({ startDate: 1, endDate: 1 });
sprintSchema.index({ status: 1 });

// Virtual for sprint duration
sprintSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for days remaining
sprintSchema.virtual('daysRemaining').get(function() {
  if (this.endDate && this.status === 'active') {
    const today = new Date();
    const diffTime = this.endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return 0;
});

// Virtual for completion percentage
sprintSchema.virtual('completionPercentage').get(function() {
  if (this.capacity.totalStoryPoints === 0) return 0;
  return Math.round((this.capacity.completedStoryPoints / this.capacity.totalStoryPoints) * 100);
});

// Pre-save middleware to update metrics
sprintSchema.pre('save', function(next) {
  // Update completion percentage
  if (this.capacity.totalStoryPoints > 0) {
    this.metrics.velocity = this.capacity.completedStoryPoints;
  }
  next();
});

// Method to add task to sprint
sprintSchema.methods.addTask = function(taskId, storyPoints = 0, priority = 'medium') {
  const existingTask = this.tasks.find(t => t.task.toString() === taskId.toString());
  
  if (!existingTask) {
    this.tasks.push({
      task: taskId,
      storyPoints: storyPoints,
      priority: priority
    });
    this.capacity.totalStoryPoints += storyPoints;
  }
  
  return this.save();
};

// Method to remove task from sprint
sprintSchema.methods.removeTask = function(taskId) {
  const taskIndex = this.tasks.findIndex(t => t.task.toString() === taskId.toString());
  
  if (taskIndex > -1) {
    const removedTask = this.tasks[taskIndex];
    this.capacity.totalStoryPoints -= removedTask.storyPoints;
    this.tasks.splice(taskIndex, 1);
  }
  
  return this.save();
};

// Method to update task completion
sprintSchema.methods.updateTaskCompletion = function(taskId, completed) {
  const task = this.tasks.find(t => t.task.toString() === taskId.toString());
  
  if (task && completed) {
    this.capacity.completedStoryPoints += task.storyPoints;
  }
  
  return this.save();
};

// Method to start sprint
sprintSchema.methods.startSprint = function() {
  this.status = 'active';
  return this.save();
};

// Method to complete sprint
sprintSchema.methods.completeSprint = function() {
  this.status = 'completed';
  return this.save();
};

// Static method to get active sprints
sprintSchema.statics.getActiveSprints = function() {
  return this.find({ status: 'active', isActive: true })
    .populate('project', 'name')
    .populate('tasks.task', 'title status');
};

// Static method to get project sprints
sprintSchema.statics.getProjectSprints = function(projectId) {
  return this.find({ project: projectId, isActive: true })
    .populate('tasks.task', 'title status assignedTo')
    .sort({ startDate: -1 });
};

module.exports = mongoose.model('Sprint', sprintSchema); 