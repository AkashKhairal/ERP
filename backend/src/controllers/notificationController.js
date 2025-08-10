const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      category, 
      priority, 
      isRead, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build filter query
    const filter = { 
      recipient: req.user.id, 
      isActive: true 
    };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const notifications = await Notification.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name email avatar')
      .lean();

    // Get total count for pagination
    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
      isActive: true
    }).populate('sender', 'name email avatar');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification'
    });
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      sender: req.user.id
    };

    // Validate recipient exists
    if (notificationData.recipient) {
      const recipient = await User.findById(notificationData.recipient);
      if (!recipient) {
        return res.status(400).json({
          success: false,
          message: 'Recipient user not found'
        });
      }
    }

    const notification = await Notification.createNotification(notificationData);

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating notification'
    });
  }
};

// @desc    Update notification
// @route   PUT /api/notifications/:id
// @access  Private
const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
      isActive: true
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Update notification
    Object.assign(notification, req.body);
    await notification.save();

    res.json({
      success: true,
      data: notification,
      message: 'Notification updated successfully'
    });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
      isActive: true
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read'
    });
  }
};

// @desc    Mark notification as unread
// @route   PUT /api/notifications/:id/unread
// @access  Private
const markAsUnread = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
      isActive: true
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsUnread();

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as unread'
    });
  } catch (error) {
    console.error('Mark as unread error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as unread'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.user.id);

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking all notifications as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
      isActive: true
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.softDelete();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
};

// @desc    Bulk delete notifications
// @route   DELETE /api/notifications/bulk
// @access  Private
const bulkDeleteNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: req.user.id,
        isActive: true
      },
      { isActive: false }
    );

    res.json({
      success: true,
      data: {
        deletedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} notifications deleted successfully`
    });
  } catch (error) {
    console.error('Bulk delete notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notifications'
    });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count'
    });
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.getNotificationStats(req.user.id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification statistics'
    });
  }
};

// @desc    Get notifications by category
// @route   GET /api/notifications/category/:category
// @access  Private
const getNotificationsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({
      recipient: req.user.id,
      category,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name email avatar')
      .lean();

    const total = await Notification.countDocuments({
      recipient: req.user.id,
      category,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications by category'
    });
  }
};

// @desc    Search notifications
// @route   GET /api/notifications/search
// @access  Private
const searchNotifications = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q, 'i');

    const notifications = await Notification.find({
      recipient: req.user.id,
      isActive: true,
      $or: [
        { title: searchRegex },
        { message: searchRegex }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name email avatar')
      .lean();

    const total = await Notification.countDocuments({
      recipient: req.user.id,
      isActive: true,
      $or: [
        { title: searchRegex },
        { message: searchRegex }
      ]
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching notifications'
    });
  }
};

module.exports = {
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
};
