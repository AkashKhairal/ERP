const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getAllTasks = async (req, res) => {
  try {
    const { 
      project, 
      status, 
      priority, 
      assignedTo, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = { isActive: true };
    
    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ dueDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Task.countDocuments(query);
    
    res.json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name description')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('assignedBy', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const {
      title,
      description,
      project,
      priority,
      type,
      assignedTo,
      dueDate,
      estimatedHours,
      labels,
      tags,
      isRecurring,
      recurringPattern
    } = req.body;
    
    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(400).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if assigned user exists
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
    }
    
    const task = new Task({
      title,
      description,
      project,
      priority,
      type,
      assignedTo,
      assignedBy: req.user._id,
      dueDate,
      estimatedHours,
      labels,
      tags,
      isRecurring,
      recurringPattern,
      createdBy: req.user._id
    });
    
    await task.save();
    
    // Populate references
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'firstName lastName email');
    await task.populate('assignedBy', 'firstName lastName email');
    
    // Log audit event for task creation
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'task_created',
      resource: 'task',
      resourceId: task._id,
      details: {
        module: 'tasks',
        action: 'create',
        newValue: {
          title: task.title,
          project: projectExists.name,
          assignedTo: assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned',
          dueDate: task.dueDate,
          priority: task.priority,
          type: task.type
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Log audit event for task assignment if assigned
    if (assignedTo) {
      await AuditLog.logEvent({
        user: req.user._id,
        action: 'task_assigned',
        resource: 'task',
        resourceId: task._id,
        details: {
          module: 'tasks',
          action: 'assign',
          newValue: {
            assignedTo: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
            assignedBy: `${req.user.firstName} ${req.user.lastName}`,
            assignedAt: new Date()
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check permissions
    if (task.assignedTo?.toString() !== req.user._id.toString() && 
        task.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }
    
    const updateData = { ...req.body, updatedBy: req.user._id };
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('project', 'name')
     .populate('assignedTo', 'firstName lastName email')
     .populate('assignedBy', 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
};

// @desc    Delete task (soft delete)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check permissions
    if (task.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }
    
    // Soft delete
    task.isActive = false;
    task.updatedBy = req.user._id;
    await task.save();
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    });
  }
};

// @desc    Update task status (Kanban board)
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check permissions
    if (task.assignedTo?.toString() !== req.user._id.toString() && 
        task.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }
    
    const oldStatus = task.status;
    await task.updateStatus(status, req.user._id);
    
    await task.populate('assignedTo', 'firstName lastName email');
    
    // Log audit event for task status change
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'task_status_changed',
      resource: 'task',
      resourceId: task._id,
      details: {
        module: 'tasks',
        action: 'update_status',
        oldValue: { status: oldStatus },
        newValue: { status: task.status },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Log completion if status changed to done
    if (task.status === 'done' && oldStatus !== 'done') {
      await AuditLog.logEvent({
        user: req.user._id,
        action: 'task_completed',
        resource: 'task',
        resourceId: task._id,
        details: {
          module: 'tasks',
          action: 'complete',
          newValue: {
            completedDate: task.completedDate,
            progress: 100
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task status'
    });
  }
};

// @desc    Assign task to user
// @route   PUT /api/tasks/:id/assign
// @access  Private
const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check permissions
    if (task.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign this task'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const oldAssignedTo = task.assignedTo;
    await task.assignTask(userId, req.user._id);
    
    await task.populate('assignedTo', 'firstName lastName email');
    
    // Log audit event for task assignment
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'task_assigned',
      resource: 'task',
      resourceId: task._id,
      details: {
        module: 'tasks',
        action: 'assign',
        oldValue: { assignedTo: oldAssignedTo },
        newValue: {
          assignedTo: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
          assignedBy: `${req.user.firstName} ${req.user.lastName}`,
          assignedAt: new Date()
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    res.json({
      success: true,
      message: 'Task assigned successfully',
      data: task
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning task'
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    await task.addComment(req.user._id, content);
    
    await task.populate('comments.user', 'firstName lastName email');
    
    // Log audit event for comment addition
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'task_comment_added',
      resource: 'task',
      resourceId: task._id,
      details: {
        module: 'tasks',
        action: 'add_comment',
        newValue: {
          content: content,
          createdAt: new Date()
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    res.json({
      success: true,
      message: 'Comment added successfully',
      data: task.comments
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

// @desc    Add subtask
// @route   POST /api/tasks/:id/subtasks
// @access  Private
const addSubtask = async (req, res) => {
  try {
    const { title } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    await task.addSubtask(title);
    
    res.json({
      success: true,
      message: 'Subtask added successfully',
      data: task.subtasks
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding subtask'
    });
  }
};

// @desc    Complete subtask
// @route   PUT /api/tasks/:id/subtasks/:subtaskIndex/complete
// @access  Private
const completeSubtask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    const subtaskIndex = parseInt(req.params.subtaskIndex);
    const subtask = task.subtasks[subtaskIndex];
    
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }
    
    await task.completeSubtask(subtaskIndex, req.user._id);
    
    // Log audit event for subtask completion
    await AuditLog.logEvent({
      user: req.user._id,
      action: 'subtask_completed',
      resource: 'task',
      resourceId: task._id,
      details: {
        module: 'tasks',
        action: 'complete_subtask',
        newValue: {
          subtaskTitle: subtask.title,
          completedAt: new Date()
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    res.json({
      success: true,
      message: 'Subtask completed successfully',
      data: task.subtasks
    });
  } catch (error) {
    console.error('Complete subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing subtask'
    });
  }
};

// @desc    Get tasks by status (Kanban board)
// @route   GET /api/tasks/status/:status
// @access  Private
const getTasksByStatus = async (req, res) => {
  try {
    const { project } = req.query;
    const tasks = await Task.getByStatus(req.params.status, project);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
};

// @desc    Get user's tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const tasks = await Task.getUserTasks(req.user._id, status);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
};

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
const getOverdueTasks = async (req, res) => {
  try {
    const tasks = await Task.getOverdueTasks();
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue tasks'
    });
  }
};

// @desc    Get recurring tasks
// @route   GET /api/tasks/recurring
// @access  Private
const getRecurringTasks = async (req, res) => {
  try {
    const tasks = await Task.getRecurringTasks();
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get recurring tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recurring tasks'
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ isActive: true });
    const completedTasks = await Task.countDocuments({ status: 'done', isActive: true });
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $nin: ['done', 'cancelled'] },
      isActive: true
    });

    // Get tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Get tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $project: { priority: '$_id', count: 1, _id: 0 } }
    ]);

    // Get tasks by type
    const tasksByType = await Task.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } }
    ]);

    const stats = {
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByStatus,
      tasksByPriority,
      tasksByType
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task statistics'
    });
  }
};

module.exports = {
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
  getRecurringTasks,
  getTaskStats
}; 