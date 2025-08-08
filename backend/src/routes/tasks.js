const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  addComment,
  addSubtask,
  completeSubtask,
  getTasksByStatus,
  getMyTasks,
  getOverdueTasks,
  getRecurringTasks
} = require('../controllers/taskController');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Validation middleware
const createTaskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Task description cannot exceed 2000 characters'),
  body('project')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('type')
    .optional()
    .isIn(['feature', 'bug', 'improvement', 'content', 'design', 'testing', 'deployment', 'other'])
    .withMessage('Invalid task type'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a positive number'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean'),
  body('recurringPattern.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid recurring frequency'),
  body('recurringPattern.interval')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Recurring interval must be a positive integer')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Task description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('type')
    .optional()
    .isIn(['feature', 'bug', 'improvement', 'content', 'design', 'testing', 'deployment', 'other'])
    .withMessage('Invalid task type'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a positive number'),
  body('actualHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual hours must be a positive number')
];

const updateStatusValidation = [
  body('status')
    .isIn(['todo', 'doing', 'review', 'done', 'cancelled'])
    .withMessage('Invalid task status')
];

const assignTaskValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
];

const addCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment content must be between 1 and 1000 characters')
];

const addSubtaskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subtask title must be between 1 and 200 characters')
];

// Routes
router.route('/')
  .get(checkPermission('tasks', 'read'), getAllTasks)
  .post(
    checkPermission('tasks', 'create'),
    createTaskValidation,
    createTask
  );

router.route('/my-tasks')
  .get(getMyTasks);

router.route('/overdue')
  .get(checkPermission('tasks', 'read'), getOverdueTasks);

router.route('/recurring')
  .get(checkPermission('tasks', 'read'), getRecurringTasks);

router.route('/status/:status')
  .get(checkPermission('tasks', 'read'), getTasksByStatus);

router.route('/:id')
  .get(checkPermission('tasks', 'read'), getTaskById)
  .put(
    checkPermission('tasks', 'update'),
    updateTaskValidation,
    updateTask
  )
  .delete(checkPermission('tasks', 'delete'), deleteTask);

router.route('/:id/status')
  .put(
    checkPermission('tasks', 'update'),
    updateStatusValidation,
    updateTaskStatus
  );

router.route('/:id/assign')
  .put(
    checkPermission('tasks', 'update'),
    assignTaskValidation,
    assignTask
  );

router.route('/:id/comments')
  .post(addCommentValidation, addComment);

router.route('/:id/subtasks')
  .post(
    checkPermission('tasks', 'update'),
    addSubtaskValidation,
    addSubtask
  );

router.route('/:id/subtasks/:subtaskIndex/complete')
  .put(
    checkPermission('tasks', 'update'),
    completeSubtask
  );

module.exports = router; 