const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getProjectsByType,
  getMyProjects,
  getOverdueProjects,
  updateProjectProgress
} = require('../controllers/projectController');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Validation middleware
const createProjectValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Project description must be between 1 and 1000 characters'),
  body('type')
    .isIn(['youtube', 'saas', 'freelance', 'internal', 'other'])
    .withMessage('Invalid project type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  body('projectManager')
    .isMongoId()
    .withMessage('Invalid project manager ID'),
  body('teamMembers')
    .optional()
    .isArray()
    .withMessage('Team members must be an array'),
  body('teamMembers.*.user')
    .optional()
    .isMongoId()
    .withMessage('Invalid team member user ID'),
  body('teamMembers.*.role')
    .optional()
    .isIn(['developer', 'designer', 'editor', 'marketer', 'analyst', 'qa', 'other'])
    .withMessage('Invalid team member role')
];

const updateProjectValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Project description must be between 1 and 1000 characters'),
  body('type')
    .optional()
    .isIn(['youtube', 'saas', 'freelance', 'internal', 'other'])
    .withMessage('Invalid project type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number')
];

const addTeamMemberValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .isIn(['developer', 'designer', 'editor', 'marketer', 'analyst', 'qa', 'other'])
    .withMessage('Invalid role')
];

// Routes
router.route('/')
  .get(checkPermission('projects', 'read'), getAllProjects)
  .post(
    checkPermission('projects', 'create'),
    createProjectValidation,
    createProject
  );

router.route('/my-projects')
  .get(getMyProjects);

router.route('/overdue')
  .get(checkPermission('projects', 'read'), getOverdueProjects);

router.route('/type/:type')
  .get(checkPermission('projects', 'read'), getProjectsByType);

router.route('/:id')
  .get(checkPermission('projects', 'read'), getProjectById)
  .put(
    checkPermission('projects', 'update'),
    updateProjectValidation,
    updateProject
  )
  .delete(checkPermission('projects', 'delete'), deleteProject);

router.route('/:id/progress')
  .put(
    checkPermission('projects', 'update'),
    body('progress')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Progress must be between 0 and 100'),
    updateProjectProgress
  );

router.route('/:id/team-members')
  .post(
    checkPermission('projects', 'update'),
    addTeamMemberValidation,
    addTeamMember
  );

router.route('/:id/team-members/:userId')
  .delete(checkPermission('projects', 'update'), removeTeamMember);

module.exports = router; 