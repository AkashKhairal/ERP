const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  getAuditStats,
  exportAuditLogs
} = require('../controllers/auditController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// All routes require admin access
router.use(authorize('admin'));

// Get audit logs
router.get('/', getAuditLogs);

// Get audit statistics
router.get('/stats', getAuditStats);

// Export audit logs
router.get('/export', exportAuditLogs);

// Get audit logs for a specific user
router.get('/user/:userId', getAuditLogsByUser);

// Get audit log by ID
router.get('/:id', getAuditLogById);

module.exports = router; 