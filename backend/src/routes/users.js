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
  exportUsers,
  updateUserPreferences,
  getUserPreferences,
  toggleTwoFactor,
  exportUserData,
  deleteUserAccount
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

// User preferences and account management routes
router.get('/me/preferences', (req, res, next) => {
  req.params.id = req.user._id.toString();
  next();
}, getUserPreferences);
router.put('/me/preferences', (req, res, next) => {
  req.params.id = req.user._id.toString();
  next();
}, updateUserPreferences);
router.put('/me/two-factor', (req, res, next) => {
  req.params.id = req.user._id.toString();
  next();
}, toggleTwoFactor);
router.get('/me/export', (req, res, next) => {
  req.params.id = req.user._id.toString();
  next();
}, exportUserData);
router.delete('/me/account', (req, res, next) => {
  req.params.id = req.user._id.toString();
  next();
}, deleteUserAccount);

// User preferences and account management routes (by ID)
router.get('/:id/preferences', getUserPreferences);
router.put('/:id/preferences', updateUserPreferences);
router.put('/:id/two-factor', toggleTwoFactor);
router.get('/:id/export', exportUserData);
router.delete('/:id/account', deleteUserAccount);

module.exports = router; 