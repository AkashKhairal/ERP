const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Role name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  permissions: [{
    module: {
      type: String,
      enum: ['users', 'teams', 'employees', 'attendance', 'leaves', 'payroll', 'projects', 'tasks', 'sprints', 'finance', 'analytics', 'content', 'integrations'],
      required: true
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'approve', 'export'],
      required: true
    }]
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ isDefault: 1 });

// Method to check if role has permission for a specific module and action
roleSchema.methods.hasPermission = function(module, action) {
  const permission = this.permissions.find(p => p.module === module);
  if (!permission) return false;
  return permission.actions.includes(action);
};

// Method to check if role has any permission for a module
roleSchema.methods.hasModuleAccess = function(module) {
  return this.permissions.some(p => p.module === module);
};

// Static method to get default roles
roleSchema.statics.getDefaultRoles = function() {
  return [
    {
      name: 'Admin',
      description: 'Full access to all modules, all settings, and reports. Can create/assign roles to others.',
      isDefault: true,
      permissions: [
        { module: 'users', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'teams', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'employees', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'attendance', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'leaves', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'payroll', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'projects', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'tasks', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'sprints', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'finance', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'analytics', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'content', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'integrations', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] }
      ]
    },
    {
      name: 'HR Manager',
      description: 'Access to Employee, Attendance, Leave, and Payroll modules. No access to Finance or Content.',
      isDefault: true,
      permissions: [
        { module: 'users', actions: ['read', 'update'] },
        { module: 'teams', actions: ['read', 'update'] },
        { module: 'employees', actions: ['create', 'read', 'update', 'approve', 'export'] },
        { module: 'attendance', actions: ['create', 'read', 'update', 'approve', 'export'] },
        { module: 'leaves', actions: ['create', 'read', 'update', 'approve', 'export'] },
        { module: 'payroll', actions: ['create', 'read', 'update', 'approve', 'export'] },
        { module: 'projects', actions: ['read'] },
        { module: 'tasks', actions: ['read'] },
        { module: 'analytics', actions: ['read'] }
      ]
    },
    {
      name: 'Tech Lead',
      description: 'Access to Projects, Tasks, Team Assignments. View-only on HR; no access to Finance or Content.',
      isDefault: true,
      permissions: [
        { module: 'users', actions: ['read'] },
        { module: 'teams', actions: ['create', 'read', 'update'] },
        { module: 'employees', actions: ['read'] },
        { module: 'projects', actions: ['create', 'read', 'update', 'approve', 'export'] },
        { module: 'tasks', actions: ['create', 'read', 'update', 'approve', 'export'] },
        { module: 'sprints', actions: ['create', 'read', 'update', 'approve', 'export'] },
        { module: 'analytics', actions: ['read'] }
      ]
    },
    {
      name: 'Content Manager',
      description: 'Access to Content Planner, YouTube tracking, Scripts. Can assign/review content. No access to HR or Finance.',
      isDefault: true,
      permissions: [
        { module: 'users', actions: ['read'] },
        { module: 'teams', actions: ['read'] },
        { module: 'projects', actions: ['read'] },
        { module: 'tasks', actions: ['read'] },
        { module: 'content', actions: ['create', 'read', 'update', 'approve', 'export'] },
        { module: 'analytics', actions: ['read'] }
      ]
    },
    {
      name: 'Marketing Lead',
      description: 'Access to Reels, Ad Spend Reports, Budget Module. View Analytics only. No access to HR or Tech Projects.',
      isDefault: true,
      permissions: [
        { module: 'users', actions: ['read'] },
        { module: 'teams', actions: ['read'] },
        { module: 'projects', actions: ['read'] },
        { module: 'finance', actions: ['read', 'update'] },
        { module: 'analytics', actions: ['read', 'export'] },
        { module: 'content', actions: ['read', 'update'] }
      ]
    },
    {
      name: 'Finance Manager',
      description: 'Full access to Budgeting, Payroll, Revenue, Expense Tracking. No access to HR, Projects, or Content.',
      isDefault: true,
      permissions: [
        { module: 'users', actions: ['read'] },
        { module: 'employees', actions: ['read'] },
        { module: 'payroll', actions: ['create', 'read', 'update', 'approve', 'export'] },
        { module: 'finance', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
        { module: 'analytics', actions: ['read', 'export'] }
      ]
    },
    {
      name: 'Employee',
      description: 'View/edit own profile, submit leave requests. View assigned tasks/content only. Cannot access reports, payroll, or financial data.',
      isDefault: true,
      permissions: [
        { module: 'users', actions: ['read', 'update'] },
        { module: 'teams', actions: ['read'] },
        { module: 'employees', actions: ['read'] },
        { module: 'attendance', actions: ['create', 'read'] },
        { module: 'leaves', actions: ['create', 'read'] },
        { module: 'projects', actions: ['read'] },
        { module: 'tasks', actions: ['read', 'update'] },
        { module: 'content', actions: ['read'] }
      ]
    }
  ];
};

module.exports = mongoose.model('Role', roleSchema); 