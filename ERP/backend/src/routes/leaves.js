const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  requestLeave,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getPendingLeaves,
  getLeaveStatistics,
  getMyLeaveBalance
} = require('../controllers/leaveController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const requestLeaveValidation = [
  body('leaveType')
    .isIn(['sick', 'casual', 'annual', 'unpaid', 'maternity', 'paternity'])
    .withMessage('Please select a valid leave type'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('isHalfDay')
    .optional()
    .isBoolean()
    .withMessage('isHalfDay must be a boolean'),
  body('halfDayType')
    .optional()
    .isIn(['first_half', 'second_half'])
    .withMessage('Please select a valid half day type'),
  body('emergencyContact')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Emergency contact cannot exceed 200 characters'),
  body('workHandover')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Work handover cannot exceed 500 characters')
];

const approveLeaveValidation = [
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comments cannot exceed 500 characters')
];

const rejectLeaveValidation = [
  body('rejectionReason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters')
];

// Routes
// Request leave
router.post('/', requestLeaveValidation, requestLeave);

// Get all leaves
router.get('/', getAllLeaves);

// Get my leave balance
router.get('/my-balance', getMyLeaveBalance);

// Get pending leaves (Admin, Manager)
router.get('/pending', 
  authorize('admin', 'manager'), 
  checkPermission('leaves', 'read'), 
  getPendingLeaves
);

// Get leave statistics
router.get('/statistics', getLeaveStatistics);

// Get leave by ID
router.get('/:id', getLeaveById);

// Approve leave (Admin, Manager)
router.put('/:id/approve', 
  authorize('admin', 'manager'), 
  checkPermission('leaves', 'update'), 
  approveLeaveValidation, 
  approveLeave
);

// Reject leave (Admin, Manager)
router.put('/:id/reject', 
  authorize('admin', 'manager'), 
  checkPermission('leaves', 'update'), 
  rejectLeaveValidation, 
  rejectLeave
);

// Cancel leave
router.put('/:id/cancel', cancelLeave);

module.exports = router; 