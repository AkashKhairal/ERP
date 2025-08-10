const Role = require('../models/Role');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Admin only
const getRoles = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, isActive } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;
    
    const [roles, total] = await Promise.all([
      Role.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Role.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: roles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching roles',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get role by ID
// @route   GET /api/roles/:id
// @access  Admin only
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Role not found' 
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching role',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Admin only
const createRole = async (req, res) => {
  try {
    const { name, description, permissions, isDefault = false } = req.body;

    // Check if role with same name already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ 
        success: false, 
        message: 'Role with this name already exists' 
      });
    }

    const role = new Role({
      name,
      description,
      permissions,
      isDefault,
      createdBy: req.user._id
    });

    await role.save();

    // Log the action
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'role_created',
      resource: 'role',
      resourceId: role._id,
      details: {
        module: 'roles',
        action: 'create',
        newValue: { name, description, permissions, isDefault },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating role',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Admin only
const updateRole = async (req, res) => {
  try {
    const { name, description, permissions, isActive } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Role not found' 
      });
    }

    // Check if trying to update a default role
    if (role.isDefault && (name || permissions)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify default roles. Create a custom role instead.' 
      });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name, _id: { $ne: req.params.id } });
      if (existingRole) {
        return res.status(400).json({ 
          success: false, 
          message: 'Role with this name already exists' 
        });
      }
    }

    const oldValue = {
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive
    };

    // Update role
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        permissions,
        isActive,
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    );

    // Log the action
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'role_updated',
      resource: 'role',
      resourceId: role._id,
      details: {
        module: 'roles',
        action: 'update',
        oldValue,
        newValue: { name, description, permissions, isActive },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating role',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Admin only
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ 
        success: false, 
        message: 'Role not found' 
      });
    }

    // Check if it's a default role
    if (role.isDefault) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete default roles' 
      });
    }

    // Check if any users are using this role
    const usersWithRole = await User.find({ roles: req.params.id });
    if (usersWithRole.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete role. ${usersWithRole.length} user(s) are currently assigned this role.` 
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    // Log the action
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'role_deleted',
      resource: 'role',
      resourceId: role._id,
      details: {
        module: 'roles',
        action: 'delete',
        oldValue: {
          name: role.name,
          description: role.description,
          permissions: role.permissions
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting role',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get default roles
// @route   GET /api/roles/default
// @access  Admin only
const getDefaultRoles = async (req, res) => {
  try {
    const defaultRoles = await Role.find({ isDefault: true })
      .populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      data: defaultRoles
    });
  } catch (error) {
    console.error('Error fetching default roles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching default roles',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Initialize default roles
// @route   POST /api/roles/initialize
// @access  Admin only
const initializeDefaultRoles = async (req, res) => {
  try {
    const defaultRoles = Role.getDefaultRoles();
    
    const createdRoles = [];
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role({
          ...roleData,
          createdBy: req.user._id
        });
        await role.save();
        createdRoles.push(role);
      }
    }

    res.json({
      success: true,
      message: `Initialized ${createdRoles.length} default roles`,
      data: createdRoles
    });
  } catch (error) {
    console.error('Error initializing default roles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error initializing default roles',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getDefaultRoles,
  initializeDefaultRoles
}; 