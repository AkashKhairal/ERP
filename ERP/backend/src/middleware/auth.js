const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes - requires valid JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'User account is deactivated' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if user has specific role
const authorize = (...roleNames) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Populate roles if not already populated
    if (!req.user.populated('roles')) {
      await req.user.populate('roles');
    }

    // Check if user has any of the required roles
    const hasRole = req.user.roles.some(role => 
      roleNames.includes(role.name) || roleNames.includes(role.name.toLowerCase())
    );

    if (!hasRole) {
      return res.status(403).json({ 
        message: `User does not have the required role(s): ${roleNames.join(', ')}` 
      });
    }

    next();
  };
};

// Middleware to check if user has permission for specific module and action
const checkPermission = (module, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const hasPermission = await req.user.hasPermission(module, action);
    if (!hasPermission) {
      return res.status(403).json({ 
        message: `User does not have ${action} permission for ${module} module` 
      });
    }

    next();
  };
};

// Middleware to check if user has access to a specific module
const checkModuleAccess = (module) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const hasAccess = await req.user.hasModuleAccess(module);
    if (!hasAccess) {
      return res.status(403).json({ 
        message: `User does not have access to ${module} module` 
      });
    }

    next();
  };
};

// Middleware to check if user can access their own data or has admin privileges
const checkOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    // Admin can access everything
    if (req.user.isAdmin()) {
      return next();
    }

    // Users can access their own data
    if (resourceUserId && resourceUserId === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Not authorized to access this resource' 
    });
  };
};

// Middleware to check if user is active
const checkActiveUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (!req.user.isActive) {
    return res.status(401).json({ message: 'User account is deactivated' });
  }

  next();
};

// Middleware to update last login time
const updateLastLogin = async (req, res, next) => {
  if (req.user) {
    try {
      await User.findByIdAndUpdate(req.user._id, { lastLogin: new Date() });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }
  next();
};

module.exports = {
  protect,
  authorize,
  checkPermission,
  checkModuleAccess,
  checkOwnershipOrAdmin,
  checkActiveUser,
  updateLastLogin
}; 