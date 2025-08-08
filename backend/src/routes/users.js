const express = require('express');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignRoles,
  getUserPermissions,
  exportUsers
} = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all users (admin, manager only)
router.get('/', authorize('admin'), getUsers);

// Export users (admin only)
router.get('/export', authorize('admin'), exportUsers);

// Get user permissions (admin, manager, or own profile)
router.get('/:id/permissions', getUserPermissions);

// Assign roles to user (admin only)
router.post('/:id/roles', authorize('admin'), assignRoles);

// Get user by ID (admin, manager, or own profile)
router.get('/:id', getUserById);

// Create user (admin only)
router.post('/', authorize('admin'), createUser);

// Update user (admin, manager, or own profile)
router.put('/:id', updateUser);

// Delete user (admin only)
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router; 