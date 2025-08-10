const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin, Manager
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      department, 
      isActive, 
      role 
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (role) query.roles = role;

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .populate('roles', 'name description')
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin, Manager, or own profile
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('roles', 'name description permissions')
      .select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user can access this profile
    const isAdmin = await req.user.isAdmin();
    if (!isAdmin && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this user profile' 
      });
    }

    // Get user permissions
    const permissions = await user.getAllPermissions();

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        permissions
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Admin only
const createUser = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      department, 
      position, 
      roles,
      customPermissions 
    } = req.body;

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Validate roles if provided
    if (roles && roles.length > 0) {
      const validRoles = await Role.find({ _id: { $in: roles } });
      if (validRoles.length !== roles.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more invalid roles provided' 
        });
      }
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      department,
      position,
      roles: roles || [],
      customPermissions: customPermissions || []
    });

    await user.save();

    // Log the action
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'user_created',
      resource: 'user',
      resourceId: user._id,
      details: {
        module: 'users',
        action: 'create',
        newValue: { firstName, lastName, email, department, position, roles },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin, Manager, or own profile
const updateUser = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      department, 
      position, 
      roles,
      customPermissions,
      isActive 
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check permissions
    if (!req.user.isAdmin() && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this user' 
      });
    }

    // Only admins can update roles, custom permissions, and isActive
    if (!req.user.isAdmin()) {
      if (roles || customPermissions || isActive !== undefined) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only admins can update roles, permissions, and account status' 
        });
      }
    }

    // Validate roles if provided
    if (roles && roles.length > 0) {
      const validRoles = await Role.find({ _id: { $in: roles } });
      if (validRoles.length !== roles.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'One or more invalid roles provided' 
        });
      }
    }

    const oldValue = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
      position: user.position,
      roles: user.roles,
      customPermissions: user.customPermissions,
      isActive: user.isActive
    };

    // Update user
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (department) updateData.department = department;
    if (position) updateData.position = position;
    if (roles) updateData.roles = roles;
    if (customPermissions) updateData.customPermissions = customPermissions;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('roles', 'name description');

    // Log the action
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'user_updated',
      resource: 'user',
      resourceId: user._id,
      details: {
        module: 'users',
        action: 'update',
        oldValue,
        newValue: updateData,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Return user without password
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent deletion of own account
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    // Log the action
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'user_deleted',
      resource: 'user',
      resourceId: user._id,
      details: {
        module: 'users',
        action: 'delete',
        oldValue: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          department: user.department
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Assign roles to user
// @route   POST /api/users/:id/roles
// @access  Admin only
const assignRoles = async (req, res) => {
  try {
    const { roles } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Validate roles
    const validRoles = await Role.find({ _id: { $in: roles } });
    if (validRoles.length !== roles.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'One or more invalid roles provided' 
      });
    }

    const oldRoles = user.roles;

    user.roles = roles;
    await user.save();

    // Log the action
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'role_assigned',
      resource: 'user',
      resourceId: user._id,
      details: {
        module: 'users',
        action: 'assign_roles',
        oldValue: { roles: oldRoles },
        newValue: { roles },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Roles assigned successfully',
      data: await user.populate('roles', 'name description')
    });
  } catch (error) {
    console.error('Error assigning roles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error assigning roles',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get user permissions
// @route   GET /api/users/:id/permissions
// @access  Admin, Manager, or own profile
const getUserPermissions = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('roles', 'name description permissions');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user can access this profile
    if (!req.user.isAdmin() && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this user profile' 
      });
    }

    const permissions = await user.getAllPermissions();

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roles: user.roles
        },
        permissions
      }
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Export users
// @route   GET /api/users/export
// @access  Admin only
const exportUsers = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const users = await User.find()
      .populate('roles', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = users.map(user => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        position: user.position,
        roles: user.roles.map(role => role.name).join(', '),
        isActive: user.isActive,
        hireDate: user.hireDate,
        lastLogin: user.lastLogin
      }));

      const csv = require('csv-stringify');
      csv.stringify(csvData, { header: true }, (err, output) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Error generating CSV' 
          });
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send(output);
      });
    } else {
      res.json({
        success: true,
        data: users,
        total: users.length
      });
    }
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error exporting users',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/:id/preferences
// @access  Own profile or admin/manager
const updateUserPreferences = async (req, res) => {
  try {
    const { notifications, appearance, timezone, language, sessionTimeout } = req.body;
    const userId = req.params.id;

    // Check if user can update this profile
    const isAdmin = await req.user.isAdmin();
    if (!isAdmin && req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this user profile' 
      });
    }

    const updateFields = {};
    
    if (notifications) {
      updateFields['preferences.notifications'] = {
        ...req.user.preferences?.notifications,
        ...notifications
      };
    }
    
    if (appearance) {
      updateFields['preferences.appearance'] = {
        ...req.user.preferences?.appearance,
        ...appearance
      };
    }
    
    if (timezone) {
      updateFields.timezone = timezone;
    }
    
    if (language) {
      updateFields['preferences.language'] = language;
    }
    
    if (sessionTimeout) {
      updateFields['preferences.sessionTimeout'] = sessionTimeout;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User preferences updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during preferences update',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get user preferences
// @route   GET /api/users/:id/preferences
// @access  Own profile or admin/manager
const getUserPreferences = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user can access this profile
    const isAdmin = await req.user.isAdmin();
    if (!isAdmin && req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this user profile' 
      });
    }

    const user = await User.findById(userId)
      .select('preferences timezone');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        preferences: user.preferences || {},
        timezone: user.timezone || 'UTC'
      }
    });
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Toggle two-factor authentication
// @route   PUT /api/users/:id/two-factor
// @access  Own profile or admin
const toggleTwoFactor = async (req, res) => {
  try {
    const { enabled } = req.body;
    const userId = req.params.id;

    // Check if user can update this profile
    const isAdmin = await req.user.isAdmin();
    if (!isAdmin && req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this user profile' 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 'preferences.twoFactorEnabled': enabled },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Toggle two-factor authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating two-factor authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Export user data
// @route   GET /api/users/:id/export
// @access  Own profile or admin
const exportUserData = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user can export this profile
    const isAdmin = await req.user.isAdmin();
    if (!isAdmin && req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to export this user data' 
      });
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('roles', 'name description');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Create export data (excluding sensitive information)
    const exportData = {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        position: user.position,
        bio: user.bio,
        location: user.location,
        timezone: user.timezone,
        dateOfBirth: user.dateOfBirth,
        hireDate: user.hireDate,
        lastLogin: user.lastLogin
      },
      preferences: user.preferences || {},
      roles: user.roles || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'User data export completed',
      data: exportData
    });
  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while exporting user data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/:id/account
// @access  Own profile or admin
const deleteUserAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.params.id;

    // Check if user can delete this account
    const isAdmin = await req.user.isAdmin();
    if (!isAdmin && req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this account' 
      });
    }

    // If not admin, verify password
    if (!isAdmin) {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid password' 
        });
      }
    }

    // Soft delete - mark as inactive instead of hard delete
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        deactivatedAt: new Date(),
        'preferences.accountDeleted': true
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting account',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignRoles,
  getUserPermissions,
  exportUsers,
  updateUserPreferences,
  getUserPreferences,
  toggleTwoFactor,
  exportUserData,
  deleteUserAccount
}; 