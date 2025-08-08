const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  checkIn,
  checkOut,
  getAttendanceByDateRange,
  getAttendanceByMonth,
  markAbsent,
  approveAttendance,
  getAttendanceSummary,
  getTodayAttendance,
  getPendingApprovals
} = require('../controllers/attendanceController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const checkInValidation = [
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const checkOutValidation = [
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const markAbsentValidation = [
  body('employeeId')
    .isMongoId()
    .withMessage('Please provide a valid employee ID'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

// Routes
// Check in
router.post('/check-in', checkInValidation, checkIn);

// Check out
router.post('/check-out', checkOutValidation, checkOut);

// Get today's attendance
router.get('/today', getTodayAttendance);

// Get attendance by date range
router.get('/range', getAttendanceByDateRange);

// Get attendance by month
router.get('/month/:year/:month', getAttendanceByMonth);

// Get attendance summary
router.get('/summary', getAttendanceSummary);

// Get pending approvals (Admin, Manager)
router.get('/pending-approvals', 
  authorize('admin', 'manager'), 
  checkPermission('attendance', 'read'), 
  getPendingApprovals
);

// Mark absent (Admin, Manager)
router.post('/mark-absent', 
  authorize('admin', 'manager'), 
  checkPermission('attendance', 'create'), 
  markAbsentValidation, 
  markAbsent
);

// Approve attendance (Admin, Manager)
router.put('/:id/approve', 
  authorize('admin', 'manager'), 
  checkPermission('attendance', 'update'), 
  approveAttendance
);

module.exports = router; 