const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs
// @route   GET /api/audit
// @access  Admin only
const getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      user, 
      action, 
      resource, 
      success, 
      startDate, 
      endDate 
    } = req.query;

    const filters = {};
    if (user) filters.user = user;
    if (action) filters.action = action;
    if (resource) filters.resource = resource;
    if (success !== undefined) filters.success = success === 'true';
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const result = await AuditLog.getAuditLogs(filters, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: result.logs,
      pagination: {
        page: result.page,
        limit: parseInt(limit),
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get audit log by ID
// @route   GET /api/audit/:id
// @access  Admin only
const getAuditLogById = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('resourceId');

    if (!auditLog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Audit log not found' 
      });
    }

    res.json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get audit logs for a specific user
// @route   GET /api/audit/user/:userId
// @access  Admin only
const getAuditLogsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const result = await AuditLog.getAuditLogs(
      { user: req.params.userId }, 
      parseInt(page), 
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result.logs,
      pagination: {
        page: result.page,
        limit: parseInt(limit),
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get audit statistics
// @route   GET /api/audit/stats
// @access  Admin only
const getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const [
      totalLogs,
      successfulLogs,
      failedLogs,
      actionStats,
      resourceStats
    ] = await Promise.all([
      AuditLog.countDocuments(dateFilter),
      AuditLog.countDocuments({ ...dateFilter, success: true }),
      AuditLog.countDocuments({ ...dateFilter, success: false }),
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$resource', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: totalLogs,
        successful: successfulLogs,
        failed: failedLogs,
        successRate: totalLogs > 0 ? ((successfulLogs / totalLogs) * 100).toFixed(2) : 0,
        actionStats,
        resourceStats
      }
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching audit stats',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Export audit logs
// @route   GET /api/audit/export
// @access  Admin only
const exportAuditLogs = async (req, res) => {
  try {
    const { 
      user, 
      action, 
      resource, 
      success, 
      startDate, 
      endDate,
      format = 'json'
    } = req.query;

    const filters = {};
    if (user) filters.user = user;
    if (action) filters.action = action;
    if (resource) filters.resource = resource;
    if (success !== undefined) filters.success = success === 'true';
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const logs = await AuditLog.find(filters)
      .populate('user', 'firstName lastName email')
      .populate('resourceId')
      .sort({ timestamp: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = logs.map(log => ({
        timestamp: log.timestamp,
        user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown',
        action: log.action,
        resource: log.resource,
        success: log.success,
        ipAddress: log.ipAddress,
        details: JSON.stringify(log.details)
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
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
        res.send(output);
      });
    } else {
      res.json({
        success: true,
        data: logs,
        total: logs.length
      });
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error exporting audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  getAuditStats,
  exportAuditLogs
}; 