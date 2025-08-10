const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/auth');
const {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  bulkDeleteNotifications,
  getUnreadCount,
  getNotificationStats,
  getNotificationsByCategory,
  searchNotifications
} = require('../controllers/notificationController');

// Apply authentication to all routes
router.use(protect);

// Main notification routes
router.route('/')
  .get(getNotifications)
  .post(checkPermission('notifications', 'create'), createNotification);

// Search notifications
router.get('/search', searchNotifications);

// Unread count
router.get('/unread-count', getUnreadCount);

// Statistics
router.get('/stats', getNotificationStats);

// Mark all as read
router.put('/mark-all-read', markAllAsRead);

// Bulk operations
router.delete('/bulk', bulkDeleteNotifications);

// Category-based notifications
router.get('/category/:category', getNotificationsByCategory);

// Individual notification operations
router.route('/:id')
  .get(getNotificationById)
  .put(checkPermission('notifications', 'update'), updateNotification)
  .delete(deleteNotification);

// Mark as read/unread
router.put('/:id/read', markAsRead);
router.put('/:id/unread', markAsUnread);

module.exports = router;
