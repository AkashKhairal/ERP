const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'login_failed',
      'permission_granted', 'permission_revoked', 'role_assigned', 'role_removed',
      'user_created', 'user_updated', 'user_deleted', 'user_deactivated',
      'role_created', 'role_updated', 'role_deleted',
      'access_denied', 'unauthorized_access_attempt',
      'data_exported', 'data_imported',
      'password_changed', 'profile_updated',
      // Task-related actions
      'task_created', 'task_updated', 'task_deleted', 'task_assigned', 'task_completed',
      'task_status_changed', 'task_comment_added', 'subtask_completed', 'task_time_tracked',
      'task_priority_changed', 'task_due_date_changed'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: ['user', 'role', 'permission', 'module', 'system', 'task', 'project']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resource'
  },
  details: {
    module: String,
    action: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    reason: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ success: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// Static method to log an audit event
auditLogSchema.statics.logEvent = async function(data) {
  try {
    const auditLog = new this({
      user: data.user,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      success: data.success !== false,
      errorMessage: data.errorMessage
    });
    
    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw error to avoid breaking the main flow
  }
};

// Static method to get audit logs with filters
auditLogSchema.statics.getAuditLogs = async function(filters = {}, page = 1, limit = 50) {
  const query = {};
  
  if (filters.user) query.user = filters.user;
  if (filters.action) query.action = filters.action;
  if (filters.resource) query.resource = filters.resource;
  if (filters.success !== undefined) query.success = filters.success;
  if (filters.startDate) query.timestamp = { $gte: new Date(filters.startDate) };
  if (filters.endDate) {
    if (query.timestamp) {
      query.timestamp.$lte = new Date(filters.endDate);
    } else {
      query.timestamp = { $lte: new Date(filters.endDate) };
    }
  }

  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    this.find(query)
      .populate('user', 'firstName lastName email')
      .populate('resourceId')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query)
  ]);

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

module.exports = mongoose.model('AuditLog', auditLogSchema); 