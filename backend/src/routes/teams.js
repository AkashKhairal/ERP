const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  deleteTeam,
  getTeamsByDepartment,
  getMyTeams
} = require('../controllers/teamController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation middleware
const createTeamValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('department')
    .isIn(['engineering', 'content', 'marketing', 'finance', 'hr', 'operations', 'design'])
    .withMessage('Please select a valid department'),
  body('teamLead')
    .isMongoId()
    .withMessage('Please provide a valid team lead ID'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array'),
  body('members.*.user')
    .optional()
    .isMongoId()
    .withMessage('Please provide valid user IDs'),
  body('members.*.role')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Role must be between 1 and 50 characters')
];

const updateTeamValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('department')
    .optional()
    .isIn(['engineering', 'content', 'marketing', 'finance', 'hr', 'operations', 'design'])
    .withMessage('Please select a valid department'),
  body('teamLead')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid team lead ID'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived'])
    .withMessage('Please select a valid status')
];

const addMemberValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Please provide a valid user ID'),
  body('role')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Role must be between 1 and 50 characters')
];

// Routes
// Get all teams
router.get('/', checkPermission('teams', 'read'), getAllTeams);

// Get user's teams
router.get('/my-teams', getMyTeams);

// Get teams by department
router.get('/department/:department', checkPermission('teams', 'read'), getTeamsByDepartment);

// Get team by ID
router.get('/:id', checkPermission('teams', 'read'), getTeamById);

// Create team (Admin, Manager only)
router.post('/', 
  authorize('admin', 'manager'), 
  checkPermission('teams', 'create'), 
  createTeamValidation, 
  createTeam
);

// Update team (Admin, Manager, Team Lead)
router.put('/:id', 
  checkPermission('teams', 'update'), 
  updateTeamValidation, 
  updateTeam
);

// Add member to team (Admin, Manager, Team Lead)
router.post('/:id/members', 
  checkPermission('teams', 'update'), 
  addMemberValidation, 
  addMemberToTeam
);

// Remove member from team (Admin, Manager, Team Lead)
router.delete('/:id/members/:userId', 
  checkPermission('teams', 'update'), 
  removeMemberFromTeam
);

// Delete team (Admin, Manager only)
router.delete('/:id', 
  authorize('admin', 'manager'), 
  checkPermission('teams', 'delete'), 
  deleteTeam
);

module.exports = router; 