const express = require('express');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getDefaultRoles,
  initializeDefaultRoles
} = require('../controllers/roleController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all roles (admin only)
router.get('/', authorize('admin'), getRoles);

// Get default roles (admin only)
router.get('/default', authorize('admin'), getDefaultRoles);

// Initialize default roles (admin only)
router.post('/initialize', authorize('admin'), initializeDefaultRoles);

// Get role by ID (admin only)
router.get('/:id', authorize('admin'), getRoleById);

// Create new role (admin only)
router.post('/', authorize('admin'), createRole);

// Update role (admin only)
router.put('/:id', authorize('admin'), updateRole);

// Delete role (admin only)
router.delete('/:id', authorize('admin'), deleteRole);

module.exports = router; 