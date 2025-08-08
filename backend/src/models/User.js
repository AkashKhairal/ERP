const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }],
  department: {
    type: String,
    enum: ['engineering', 'content', 'marketing', 'finance', 'hr', 'operations'],
    required: true
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Permissions are now derived from roles, but we can store custom overrides
  customPermissions: [{
    module: {
      type: String,
      enum: ['users', 'teams', 'employees', 'attendance', 'leaves', 'payroll', 'projects', 'tasks', 'sprints', 'finance', 'analytics', 'content', 'integrations']
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'approve', 'export']
    }]
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      slack: { type: Boolean, default: false }
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    youtube: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActive: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Only hash if the password is not already hashed (doesn't start with $2a$)
    if (!this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user permissions for a specific module (from roles + custom permissions)
userSchema.methods.hasPermission = async function(module, action) {
  // Check custom permissions first (overrides)
  const customPermission = this.customPermissions.find(p => p.module === module);
  if (customPermission && customPermission.actions.includes(action)) {
    return true;
  }
  
  // Check role-based permissions
  if (this.roles && this.roles.length > 0) {
    // Populate roles if not already populated
    if (!this.populated('roles')) {
      await this.populate('roles');
    }
    
    for (const role of this.roles) {
      if (role.hasPermission(module, action)) {
        return true;
      }
    }
  }
  
  return false;
};

// Method to check if user has any permission for a module
userSchema.methods.hasModuleAccess = async function(module) {
  // Check custom permissions first
  if (this.customPermissions.some(p => p.module === module)) {
    return true;
  }
  
  // Check role-based permissions
  if (this.roles && this.roles.length > 0) {
    // Populate roles if not already populated
    if (!this.populated('roles')) {
      await this.populate('roles');
    }
    
    for (const role of this.roles) {
      if (role.hasModuleAccess(module)) {
        return true;
      }
    }
  }
  
  return false;
};

// Method to get all permissions for a user
userSchema.methods.getAllPermissions = async function() {
  const permissions = {};
  
  // Add custom permissions
  this.customPermissions.forEach(perm => {
    if (!permissions[perm.module]) {
      permissions[perm.module] = [];
    }
    permissions[perm.module] = [...new Set([...permissions[perm.module], ...perm.actions])];
  });
  
  // Add role-based permissions
  if (this.roles && this.roles.length > 0) {
    if (!this.populated('roles')) {
      await this.populate('roles');
    }
    
    for (const role of this.roles) {
      role.permissions.forEach(perm => {
        if (!permissions[perm.module]) {
          permissions[perm.module] = [];
        }
        permissions[perm.module] = [...new Set([...permissions[perm.module], ...perm.actions])];
      });
    }
  }
  
  return permissions;
};

// Method to check if user has admin role
userSchema.methods.isAdmin = async function() {
  if (!this.roles || this.roles.length === 0) {
    return false;
  }
  
  // Populate roles if not already populated
  if (!this.populated('roles')) {
    await this.populate('roles');
  }
  
  return this.roles.some(role => 
    role.name === 'Admin' || role.name === 'admin'
  );
};

// Static method to get default roles for a user
userSchema.statics.getDefaultRoles = async function() {
  const Role = mongoose.model('Role');
  const defaultRoles = await Role.find({ isDefault: true });
  return defaultRoles;
};

module.exports = mongoose.model('User', userSchema); 