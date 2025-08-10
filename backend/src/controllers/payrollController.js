const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { validationResult } = require('express-validator');

// @desc    Generate payroll for employee
// @route   POST /api/payroll/generate
// @access  Private (Admin, HR)
const generatePayroll = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { employeeId, month, year, allowances, deductions, bonuses, remarks } = req.body;

    // Check if payroll already exists for this month
    const existingPayroll = await Payroll.existsForMonth(employeeId, month, year);
    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: 'Payroll already exists for this month'
      });
    }

    // Get employee details
    const employee = await Employee.findOne({ user: employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Calculate attendance and leaves
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.getByDateRange(employeeId, startDate, endDate);
    const leaves = await Leave.find({
      employee: employeeId,
      startDate: { $gte: startDate, $lte: endDate },
      status: 'approved'
    });

    // Calculate working days and overtime
    const workingDays = attendance.filter(a => a.status === 'present').length;
    const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    const overtimeHours = Math.max(0, totalHours - (workingDays * 8)); // Assuming 8 hours per day

    // Calculate salary components
    const basicSalary = employee.salary.base;
    const totalAllowances = allowances ? Object.values(allowances).reduce((sum, val) => sum + val, 0) : 0;
    const totalDeductions = deductions ? Object.values(deductions).reduce((sum, val) => sum + val, 0) : 0;
    const totalBonuses = bonuses ? Object.values(bonuses).reduce((sum, val) => sum + val, 0) : 0;
    const overtimePay = overtimeHours * (basicSalary / (workingDays * 8) * 1.5); // 1.5x for overtime

    const grossSalary = basicSalary + totalAllowances + totalBonuses + overtimePay;
    const netSalary = grossSalary - totalDeductions;

    const payroll = new Payroll({
      employee: employeeId,
      month,
      year,
      basicSalary,
      allowances: allowances || {},
      deductions: deductions || {},
      bonuses: bonuses || {},
      overtime: {
        hours: overtimeHours,
        amount: overtimePay
      },
      leaves: {
        totalDays: leaves.length,
        amount: 0 // Unpaid leaves would deduct salary
      },
      grossSalary,
      netSalary,
      remarks: remarks || '',
      generatedBy: req.user._id,
      generatedAt: new Date()
    });

    await payroll.save();

    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .populate('generatedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Payroll generated successfully',
      data: populatedPayroll
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating payroll',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get all payrolls
// @route   GET /api/payroll
// @access  Private (Admin, HR)
const getAllPayrolls = async (req, res) => {
  try {
    const { month, year, employeeId, status } = req.query;
    const query = {};

    if (month) query.month = month;
    if (year) query.year = year;
    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;

    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName')
      .populate('generatedBy', 'firstName lastName')
      .sort({ year: -1, month: -1 });

    res.json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    console.error('Get all payrolls error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payrolls',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get payroll by ID
// @route   GET /api/payroll/:id
// @access  Private
const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName')
      .populate('generatedBy', 'firstName lastName');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    // Check if user can view this payroll
    const canView = req.user.role === 'admin' || 
                   req.user.role === 'manager' || 
                   payroll.employee._id.toString() === req.user._id.toString();

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payroll'
      });
    }

    res.json({
      success: true,
      data: payroll
    });
  } catch (error) {
    console.error('Get payroll by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payroll',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Approve payroll
// @route   PUT /api/payroll/:id/approve
// @access  Private (Admin, HR)
const approvePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    if (payroll.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payroll is not pending approval'
      });
    }

    await payroll.approve(req.user._id);

    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName')
      .populate('generatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Payroll approved successfully',
      data: updatedPayroll
    });
  } catch (error) {
    console.error('Approve payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving payroll',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Mark payroll as paid
// @route   PUT /api/payroll/:id/mark-paid
// @access  Private (Admin, HR)
const markPayrollAsPaid = async (req, res) => {
  try {
    const { paymentDate, paymentMethod, transactionId } = req.body;

    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    if (payroll.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Payroll must be approved before marking as paid'
      });
    }

    await payroll.markAsPaid(paymentDate, paymentMethod, transactionId);

    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName')
      .populate('generatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Payroll marked as paid successfully',
      data: updatedPayroll
    });
  } catch (error) {
    console.error('Mark payroll as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking payroll as paid',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get payroll by employee
// @route   GET /api/payroll/employee/:employeeId
// @access  Private
const getPayrollByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    const query = { employee: employeeId };
    if (year) query.year = year;

    const payrolls = await Payroll.getByEmployee(employeeId, year);

    res.json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    console.error('Get payroll by employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employee payrolls',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get payroll by month
// @route   GET /api/payroll/month/:year/:month
// @access  Private (Admin, HR)
const getPayrollByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const payrolls = await Payroll.getByMonth(parseInt(year), parseInt(month));

    res.json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    console.error('Get payroll by month error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching monthly payrolls',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get payroll statistics
// @route   GET /api/payroll/statistics
// @access  Private (Admin, HR)
const getPayrollStatistics = async (req, res) => {
  try {
    const { year, month } = req.query;
    const statistics = await Payroll.getStatistics(year, month);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get payroll statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payroll statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get department payroll statistics
// @route   GET /api/payroll/department-statistics
// @access  Private (Admin, HR)
const getDepartmentPayrollStatistics = async (req, res) => {
  try {
    const { year, month, department } = req.query;
    const statistics = await Payroll.getDepartmentStatistics(year, month, department);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get department payroll statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department payroll statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  generatePayroll,
  getAllPayrolls,
  getPayrollById,
  approvePayroll,
  markPayrollAsPaid,
  getPayrollByEmployee,
  getPayrollByMonth,
  getPayrollStatistics,
  getDepartmentPayrollStatistics
}; 