const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  generatePayroll,
  getAllPayrolls,
  getPayrollById,
  approvePayroll,
  markPayrollAsPaid,
  getPayrollByEmployee,
  getPayrollByMonth,
  getPayrollStatistics,
  getDepartmentPayrollStatistics
} = require('../controllers/payrollController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const generatePayrollValidation = [
  body('employeeId')
    .isMongoId()
    .withMessage('Please provide a valid employee ID'),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  body('allowances')
    .optional()
    .isObject()
    .withMessage('Allowances must be an object'),
  body('deductions')
    .optional()
    .isObject()
    .withMessage('Deductions must be an object'),
  body('bonuses')
    .optional()
    .isObject()
    .withMessage('Bonuses must be an object'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters')
];

const markAsPaidValidation = [
  body('paymentDate')
    .isISO8601()
    .withMessage('Please provide a valid payment date'),
  body('paymentMethod')
    .isIn(['bank_transfer', 'check', 'cash', 'online'])
    .withMessage('Please select a valid payment method'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Transaction ID cannot exceed 100 characters')
];

// Routes
// Generate payroll (Admin, HR)
router.post('/generate', 
  authorize('admin', 'manager'), 
  checkPermission('payroll', 'create'), 
  generatePayrollValidation, 
  generatePayroll
);

// Get all payrolls (Admin, HR)
router.get('/', 
  authorize('admin', 'manager'), 
  checkPermission('payroll', 'read'), 
  getAllPayrolls
);

// Get payroll statistics (Admin, HR)
router.get('/statistics', 
  authorize('admin', 'manager'), 
  checkPermission('payroll', 'read'), 
  getPayrollStatistics
);

// Get department payroll statistics (Admin, HR)
router.get('/department-statistics', 
  authorize('admin', 'manager'), 
  checkPermission('payroll', 'read'), 
  getDepartmentPayrollStatistics
);

// Get payroll by month (Admin, HR)
router.get('/month/:year/:month', 
  authorize('admin', 'manager'), 
  checkPermission('payroll', 'read'), 
  getPayrollByMonth
);

// Get payroll by employee
router.get('/employee/:employeeId', getPayrollByEmployee);

// Get payroll by ID
router.get('/:id', getPayrollById);

// Approve payroll (Admin, HR)
router.put('/:id/approve', 
  authorize('admin', 'manager'), 
  checkPermission('payroll', 'update'), 
  approvePayroll
);

// Mark payroll as paid (Admin, HR)
router.put('/:id/mark-paid', 
  authorize('admin', 'manager'), 
  checkPermission('payroll', 'update'), 
  markAsPaidValidation, 
  markPayrollAsPaid
);

module.exports = router; 