const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  uploadDocument,
  updateOnboardingStatus,
  initiateOffboarding,
  getEmployeesByDepartment,
  getEmployeesByStatus,
  getMyProfile
} = require('../controllers/employeeController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const createEmployeeValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Please provide a valid user ID'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('reportingManager')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid reporting manager ID'),
  body('dateOfJoining')
    .isISO8601()
    .withMessage('Please enter a valid date of joining'),
  body('panNumber')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Please enter a valid PAN number'),
  body('aadharNumber')
    .matches(/^[0-9]{12}$/)
    .withMessage('Please enter a valid Aadhar number'),
  body('linkedin')
    .optional()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/)
    .withMessage('Please enter a valid LinkedIn URL'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('workType')
    .optional()
    .isIn(['full_time', 'freelancer', 'intern', 'contract'])
    .withMessage('Please select a valid work type'),
  body('salary.base')
    .isNumeric()
    .withMessage('Please enter a valid base salary'),
  body('salary.currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR'])
    .withMessage('Please select a valid currency')
];

const updateEmployeeValidation = [
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('reportingManager')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid reporting manager ID'),
  body('linkedin')
    .optional()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/)
    .withMessage('Please enter a valid LinkedIn URL'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('salary.base')
    .optional()
    .isNumeric()
    .withMessage('Please enter a valid base salary')
];

const uploadDocumentValidation = [
  body('documentType')
    .isIn(['aadhar', 'pan', 'resume', 'offer_letter', 'experience_certificate', 'other'])
    .withMessage('Please select a valid document type'),
  body('filename')
    .notEmpty()
    .withMessage('Filename is required'),
  body('path')
    .notEmpty()
    .withMessage('File path is required')
];

const onboardingValidation = [
  body('step')
    .notEmpty()
    .withMessage('Step is required'),
  body('isCompleted')
    .isBoolean()
    .withMessage('isCompleted must be a boolean')
];

const offboardingValidation = [
  body('exitDate')
    .isISO8601()
    .withMessage('Please enter a valid exit date'),
  body('pendingSteps')
    .optional()
    .isArray()
    .withMessage('Pending steps must be an array')
];

// Routes
// Get all employees (Admin, Manager, HR)
router.get('/', 
  authorize('admin', 'manager'), 
  checkPermission('users', 'read'), 
  getAllEmployees
);

// Get my employee profile
router.get('/my-profile', getMyProfile);

// Get employees by department
router.get('/department/:department', 
  checkPermission('users', 'read'), 
  getEmployeesByDepartment
);

// Get employees by status
router.get('/status/:status', 
  checkPermission('users', 'read'), 
  getEmployeesByStatus
);

// Get employee by ID
router.get('/:id', 
  checkPermission('users', 'read'), 
  getEmployeeById
);

// Create new employee (Admin, HR)
router.post('/', 
  authorize('admin', 'manager'), 
  checkPermission('users', 'create'), 
  createEmployeeValidation, 
  createEmployee
);

// Update employee (Admin, HR, Employee - own profile)
router.put('/:id', 
  checkPermission('users', 'update'), 
  updateEmployeeValidation, 
  updateEmployee
);

// Upload document (Admin, HR, Employee - own documents)
router.post('/:id/documents', 
  checkPermission('users', 'update'), 
  uploadDocumentValidation, 
  uploadDocument
);

// Update onboarding status (Admin, HR)
router.put('/:id/onboarding', 
  authorize('admin', 'manager'), 
  checkPermission('users', 'update'), 
  onboardingValidation, 
  updateOnboardingStatus
);

// Initiate offboarding (Admin, HR)
router.post('/:id/offboarding', 
  authorize('admin', 'manager'), 
  checkPermission('users', 'update'), 
  offboardingValidation, 
  initiateOffboarding
);

module.exports = router; 