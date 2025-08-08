const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { validationResult } = require('express-validator');

// @desc    Request leave
// @route   POST /api/leaves
// @access  Private
const requestLeave = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      leaveType,
      startDate,
      endDate,
      reason,
      isHalfDay,
      halfDayType,
      emergencyContact,
      workHandover
    } = req.body;

    // Check for date conflicts
    const conflicts = await Leave.checkConflicts(req.user._id, startDate, endDate);
    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Leave request conflicts with existing approved leaves',
        conflicts
      });
    }

    // Check leave balance
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    
    if (leaveType !== 'unpaid' && employee.leaveBalance[leaveType] < totalDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${employee.leaveBalance[leaveType]} days`
      });
    }

    const leave = new Leave({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      isHalfDay,
      halfDayType,
      emergencyContact,
      workHandover
    });

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: populatedLeave
    });
  } catch (error) {
    console.error('Request leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while requesting leave',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private
const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType, employeeId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (employeeId) {
      query.employee = employeeId;
    } else {
      // If no employeeId, only show own leaves (unless admin/manager)
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        query.employee = req.user._id;
      }
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaves',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get leave by ID
// @route   GET /api/leaves/:id
// @access  Private
const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user can view this leave
    const canView = req.user.role === 'admin' || 
                   req.user.role === 'manager' || 
                   leave.employee._id.toString() === req.user._id.toString();

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this leave request'
      });
    }

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    console.error('Get leave by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leave',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Approve leave
// @route   PUT /api/leaves/:id/approve
// @access  Private (Admin, Manager)
const approveLeave = async (req, res) => {
  try {
    const { comments } = req.body;

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request is not pending'
      });
    }

    await leave.approve(req.user._id, comments);

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Leave request approved successfully',
      data: updatedLeave
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving leave',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Reject leave
// @route   PUT /api/leaves/:id/reject
// @access  Private (Admin, Manager)
const rejectLeave = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request is not pending'
      });
    }

    await leave.reject(req.user._id, rejectionReason);

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Leave request rejected successfully',
      data: updatedLeave
    });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting leave',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Cancel leave
// @route   PUT /api/leaves/:id/cancel
// @access  Private
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user can cancel this leave
    const canCancel = req.user.role === 'admin' || 
                     req.user.role === 'manager' || 
                     leave.employee.toString() === req.user._id.toString();

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this leave request'
      });
    }

    if (leave.status !== 'pending' && leave.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Leave request cannot be cancelled'
      });
    }

    await leave.cancel();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: updatedLeave
    });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling leave',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get pending leaves
// @route   GET /api/leaves/pending
// @access  Private (Admin, Manager)
const getPendingLeaves = async (req, res) => {
  try {
    const pendingLeaves = await Leave.getPendingLeaves();

    res.json({
      success: true,
      count: pendingLeaves.length,
      data: pendingLeaves
    });
  } catch (error) {
    console.error('Get pending leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending leaves',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/statistics
// @access  Private
const getLeaveStatistics = async (req, res) => {
  try {
    const { year, employeeId } = req.query;
    const targetYear = year || new Date().getFullYear();

    const query = {
      startDate: {
        $gte: new Date(targetYear, 0, 1),
        $lte: new Date(targetYear, 11, 31)
      }
    };

    if (employeeId) {
      query.employee = employeeId;
    } else {
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        query.employee = req.user._id;
      }
    }

    const statistics = await Leave.getStatistics(query);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get leave statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leave statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get my leave balance
// @route   GET /api/leaves/my-balance
// @access  Private
const getMyLeaveBalance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    res.json({
      success: true,
      data: employee.leaveBalance
    });
  } catch (error) {
    console.error('Get my leave balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leave balance',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  requestLeave,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getPendingLeaves,
  getLeaveStatistics,
  getMyLeaveBalance
}; 