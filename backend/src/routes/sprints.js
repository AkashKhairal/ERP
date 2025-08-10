const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getAllSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  addTaskToSprint,
  removeTaskFromSprint,
  startSprint,
  completeSprint,
  getActiveSprints,
  getProjectSprints
} = require('../controllers/sprintController');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Validation middleware
const createSprintValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Sprint name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Sprint description cannot exceed 500 characters'),
  body('project')
    .isMongoId()
    .withMessage('Invalid project ID'),
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
  body('goals')
    .optional()
    .isArray()
    .withMessage('Goals must be an array'),
  body('goals.*.description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Goal description must be between 1 and 200 characters'),
  body('teamCapacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Team capacity must be a positive number')
];

const updateSprintValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Sprint name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Sprint description cannot exceed 500 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('goals')
    .optional()
    .isArray()
    .withMessage('Goals must be an array'),
  body('teamCapacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Team capacity must be a positive number')
];

const addTaskToSprintValidation = [
  body('taskId')
    .isMongoId()
    .withMessage('Invalid task ID'),
  body('storyPoints')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Story points must be a positive number'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
];

// Routes
router.route('/')
  .get(checkPermission('sprints', 'read'), getAllSprints)
  .post(
    checkPermission('sprints', 'create'),
    createSprintValidation,
    createSprint
  );

router.route('/active')
  .get(checkPermission('sprints', 'read'), getActiveSprints);

router.route('/project/:projectId')
  .get(checkPermission('sprints', 'read'), getProjectSprints);

router.route('/:id')
  .get(checkPermission('sprints', 'read'), getSprintById)
  .put(
    checkPermission('sprints', 'update'),
    updateSprintValidation,
    updateSprint
  )
  .delete(checkPermission('sprints', 'delete'), deleteSprint);

router.route('/:id/start')
  .put(checkPermission('sprints', 'update'), startSprint);

router.route('/:id/complete')
  .put(checkPermission('sprints', 'update'), completeSprint);

router.route('/:id/tasks')
  .post(
    checkPermission('sprints', 'update'),
    addTaskToSprintValidation,
    addTaskToSprint
  );

router.route('/:id/tasks/:taskId')
  .delete(checkPermission('sprints', 'update'), removeTaskFromSprint);

module.exports = router; 