const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { validationResult } = require('express-validator');

// @desc    Check in
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res) => {
  try {
    const { location, notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    let attendance;
    if (existingAttendance) {
      // Update existing record
      attendance = existingAttendance;
      attendance.checkIn = {
        time: new Date(),
        location: location || 'Office',
        ipAddress: req.ip
      };
    } else {
      // Create new record
      attendance = new Attendance({
        employee: req.user._id,
        date: today,
        checkIn: {
          time: new Date(),
          location: location || 'Office',
          ipAddress: req.ip
        },
        notes: notes || ''
      });
    }

    await attendance.save();

    res.json({
      success: true,
      message: 'Check-in successful',
      data: attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking in',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Check out
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res) => {
  try {
    const { location, notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (!attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Not checked in today'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    attendance.checkOut = {
      time: new Date(),
      location: location || 'Office',
      ipAddress: req.ip
    };

    if (notes) {
      attendance.notes = notes;
    }

    await attendance.save();

    res.json({
      success: true,
      message: 'Check-out successful',
      data: attendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking out',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get attendance by date range
// @route   GET /api/attendance/range
// @access  Private
const getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // If employeeId is provided, filter by employee
    if (employeeId) {
      query.employee = employeeId;
    } else {
      // If no employeeId, only show own attendance (unless admin/manager)
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        query.employee = req.user._id;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get attendance by month
// @route   GET /api/attendance/month/:year/:month
// @access  Private
const getAttendanceByMonth = async (req, res) => {
  try {
    const { year, month, employeeId } = req.params;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const query = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (employeeId) {
      query.employee = employeeId;
    } else {
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        query.employee = req.user._id;
      }
    }

    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance by month error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Mark absent
// @route   POST /api/attendance/mark-absent
// @access  Private (Admin, Manager)
const markAbsent = async (req, res) => {
  try {
    const { employeeId, date, reason } = req.body;

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: targetDate
    });

    if (attendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for this date'
      });
    }

    attendance = new Attendance({
      employee: employeeId,
      date: targetDate,
      status: 'absent',
      notes: reason || 'Marked absent by manager'
    });

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employee', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Absent marked successfully',
      data: populatedAttendance
    });
  } catch (error) {
    console.error('Mark absent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking absent',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Approve attendance
// @route   PUT /api/attendance/:id/approve
// @access  Private (Admin, Manager)
const approveAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    attendance.isApproved = true;
    attendance.approvedBy = req.user._id;
    attendance.approvedAt = new Date();

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Attendance approved successfully',
      data: populatedAttendance
    });
  } catch (error) {
    console.error('Approve attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get attendance summary
// @route   GET /api/attendance/summary
// @access  Private
const getAttendanceSummary = async (req, res) => {
  try {
    const { month, year, employeeId } = req.query;
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const query = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (employeeId) {
      query.employee = employeeId;
    } else {
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        query.employee = req.user._id;
      }
    }

    const attendance = await Attendance.find(query);
    const summary = await Attendance.getSummary(attendance);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance summary',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Private
const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today
    });

    res.json({
      success: true,
      data: attendance || null
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching today\'s attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get pending approvals
// @route   GET /api/attendance/pending-approvals
// @access  Private (Admin, Manager)
const getPendingApprovals = async (req, res) => {
  try {
    const pendingAttendance = await Attendance.find({
      isApproved: false,
      status: { $ne: 'absent' }
    })
    .populate('employee', 'firstName lastName email department')
    .sort({ date: -1 });

    res.json({
      success: true,
      count: pendingAttendance.length,
      data: pendingAttendance
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending approvals',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendanceByDateRange,
  getAttendanceByMonth,
  markAbsent,
  approveAttendance,
  getAttendanceSummary,
  getTodayAttendance,
  getPendingApprovals
}; 