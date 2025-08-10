const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Basic notification info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Notification classification
  type: {
    type: String,
    required: true,
    enum: ['success', 'warning', 'error', 'info', 'task', 'project', 'system', 'hr', 'finance', 'content'],
    default: 'info'
  },
  category: {
    type: String,
    required: true,
    enum: ['task', 'project', 'user', 'hr', 'finance', 'content', 'system', 'security', 'audit', 'sprint', 'team', 'analytics'],
    default: 'system'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // User and targeting
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Status and interaction
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  
  // Action and navigation
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  // Related entities (polymorphic references)
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Task', 'Project', 'User', 'Employee', 'Sprint', 'Team', 'Finance', 'Content', 'Attendance', 'Leave', 'Payroll', 'Role']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  
  // Metadata for additional context
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Delivery tracking
  deliveryMethod: {
    type: [String],
    enum: ['in-app', 'email', 'push', 'sms'],
    default: ['in-app']
  },
  deliveryStatus: {
    inApp: {
      delivered: { type: Boolean, default: true },
      deliveredAt: { type: Date, default: Date.now }
    },
    email: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      failureReason: String
    },
    push: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      failureReason: String
    },
    sms: {
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      failureReason: String
    }
  },
  
  // Scheduling
  scheduledFor: {
    type: Date
  },
  
  // Expiration
  expiresAt: {
    type: Date
  },
  
  // Soft delete
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, category: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, priority: 1 });
notificationSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // Auto-delete after 90 days

// Virtual for checking if notification is urgent
notificationSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent';
});

// Virtual for checking if notification is overdue
notificationSchema.virtual('isOverdue').get(function() {
  return this.scheduledFor && this.scheduledFor < new Date() && !this.isRead;
});

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set read timestamp when marking as read
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  // Auto-expire notifications after 30 days if not set
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

notificationSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

notificationSchema.methods.getRelatedEntity = async function() {
  if (!this.relatedEntity.entityType || !this.relatedEntity.entityId) {
    return null;
  }
  
  const Model = mongoose.model(this.relatedEntity.entityType);
  return await Model.findById(this.relatedEntity.entityId);
};

// Static methods
notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  await notification.save();
  
  // TODO: Trigger real-time notification via WebSocket
  // TODO: Schedule email/push notifications if required
  
  return notification;
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ 
    recipient: userId, 
    isRead: false, 
    isActive: true 
  });
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { recipient: userId, isRead: false, isActive: true },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

notificationSchema.statics.getNotificationStats = async function(userId) {
  const [total, unread, byType, byPriority] = await Promise.all([
    this.countDocuments({ recipient: userId, isActive: true }),
    this.countDocuments({ recipient: userId, isRead: false, isActive: true }),
    this.aggregate([
      { $match: { recipient: mongoose.Types.ObjectId(userId), isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { recipient: mongoose.Types.ObjectId(userId), isActive: true } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ])
  ]);
  
  return {
    total,
    unread,
    byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
  };
};

// Notification helper for different scenarios
notificationSchema.statics.notifyTaskAssigned = async function(taskId, assigneeId, assignerId) {
  const Task = mongoose.model('Task');
  const task = await Task.findById(taskId);
  
  return await this.createNotification({
    title: 'New Task Assigned',
    message: `You have been assigned to task: ${task.title}`,
    type: 'task',
    category: 'task',
    priority: task.priority === 'urgent' ? 'high' : 'medium',
    recipient: assigneeId,
    sender: assignerId,
    actionUrl: `/tasks/${taskId}`,
    actionText: 'View Task',
    relatedEntity: {
      entityType: 'Task',
      entityId: taskId
    },
    metadata: {
      taskTitle: task.title,
      taskPriority: task.priority,
      dueDate: task.dueDate
    }
  });
};

notificationSchema.statics.notifyProjectUpdate = async function(projectId, recipientIds, senderId, updateType, details) {
  const Project = mongoose.model('Project');
  const project = await Project.findById(projectId);
  
  const notifications = recipientIds.map(recipientId => ({
    title: `Project ${updateType}`,
    message: `${project.name}: ${details}`,
    type: 'project',
    category: 'project',
    priority: 'medium',
    recipient: recipientId,
    sender: senderId,
    actionUrl: `/projects/${projectId}`,
    actionText: 'View Project',
    relatedEntity: {
      entityType: 'Project',
      entityId: projectId
    },
    metadata: {
      projectName: project.name,
      updateType,
      details
    }
  }));
  
  return await this.insertMany(notifications);
};

// Export the model
module.exports = mongoose.model('Notification', notificationSchema);
