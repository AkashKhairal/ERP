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

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignRoles,
  getUserPermissions,
  exportUsers
}; 