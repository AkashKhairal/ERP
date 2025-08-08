const Sprint = require('../models/Sprint');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all sprints
// @route   GET /api/sprints
// @access  Private
const getAllSprints = async (req, res) => {
  try {
    const { project, status, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    if (project) query.project = project;
    if (status) query.status = status;
    
    const sprints = await Sprint.find(query)
      .populate('project', 'name')
      .populate('tasks.task', 'title status assignedTo')
      .sort({ startDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Sprint.countDocuments(query);
    
    res.json({
      success: true,
      data: sprints,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get all sprints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sprints'
    });
  }
};

// @desc    Get sprint by ID
// @route   GET /api/sprints/:id
// @access  Private
const getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate('project', 'name description')
      .populate('tasks.task', 'title description status priority assignedTo dueDate')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    res.json({
      success: true,
      data: sprint
    });
  } catch (error) {
    console.error('Get sprint by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sprint'
    });
  }
};

// @desc    Create new sprint
// @route   POST /api/sprints
// @access  Private
const createSprint = async (req, res) => {
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
      name,
      description,
      project,
      startDate,
      endDate,
      goals,
      teamCapacity
    } = req.body;
    
    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(400).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check for overlapping sprints
    const overlappingSprint = await Sprint.findOne({
      project,
      status: { $in: ['planning', 'active'] },
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ],
      isActive: true
    });
    
    if (overlappingSprint) {
      return res.status(400).json({
        success: false,
        message: 'Sprint dates overlap with existing sprint'
      });
    }
    
    const sprint = new Sprint({
      name,
      description,
      project,
      startDate,
      endDate,
      goals,
      capacity: {
        teamCapacity: teamCapacity || 0
      },
      createdBy: req.user._id
    });
    
    await sprint.save();
    
    await sprint.populate('project', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Sprint created successfully',
      data: sprint
    });
  } catch (error) {
    console.error('Create sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating sprint'
    });
  }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:id
// @access  Private
const updateSprint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Check permissions
    const project = await Project.findById(sprint.project);
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this sprint'
      });
    }
    
    const updateData = { ...req.body, updatedBy: req.user._id };
    
    const updatedSprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('project', 'name');
    
    res.json({
      success: true,
      message: 'Sprint updated successfully',
      data: updatedSprint
    });
  } catch (error) {
    console.error('Update sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating sprint'
    });
  }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
// @access  Private
const deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Check permissions
    const project = await Project.findById(sprint.project);
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this sprint'
      });
    }
    
    // Soft delete
    sprint.isActive = false;
    sprint.updatedBy = req.user._id;
    await sprint.save();
    
    res.json({
      success: true,
      message: 'Sprint deleted successfully'
    });
  } catch (error) {
    console.error('Delete sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting sprint'
    });
  }
};

// @desc    Add task to sprint
// @route   POST /api/sprints/:id/tasks
// @access  Private
const addTaskToSprint = async (req, res) => {
  try {
    const { taskId, storyPoints, priority } = req.body;
    
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Check permissions
    const project = await Project.findById(sprint.project);
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add tasks to this sprint'
      });
    }
    
    // Check if task exists and belongs to the project
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(400).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (task.project.toString() !== sprint.project.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Task does not belong to this sprint\'s project'
      });
    }
    
    await sprint.addTask(taskId, storyPoints, priority);
    
    await sprint.populate('tasks.task', 'title status assignedTo');
    
    res.json({
      success: true,
      message: 'Task added to sprint successfully',
      data: sprint.tasks
    });
  } catch (error) {
    console.error('Add task to sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding task to sprint'
    });
  }
};

// @desc    Remove task from sprint
// @route   DELETE /api/sprints/:id/tasks/:taskId
// @access  Private
const removeTaskFromSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Check permissions
    const project = await Project.findById(sprint.project);
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove tasks from this sprint'
      });
    }
    
    await sprint.removeTask(req.params.taskId);
    
    await sprint.populate('tasks.task', 'title status assignedTo');
    
    res.json({
      success: true,
      message: 'Task removed from sprint successfully',
      data: sprint.tasks
    });
  } catch (error) {
    console.error('Remove task from sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing task from sprint'
    });
  }
};

// @desc    Start sprint
// @route   PUT /api/sprints/:id/start
// @access  Private
const startSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Check permissions
    const project = await Project.findById(sprint.project);
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start this sprint'
      });
    }
    
    if (sprint.status !== 'planning') {
      return res.status(400).json({
        success: false,
        message: 'Sprint can only be started from planning status'
      });
    }
    
    await sprint.startSprint();
    
    res.json({
      success: true,
      message: 'Sprint started successfully',
      data: sprint
    });
  } catch (error) {
    console.error('Start sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting sprint'
    });
  }
};

// @desc    Complete sprint
// @route   PUT /api/sprints/:id/complete
// @access  Private
const completeSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Check permissions
    const project = await Project.findById(sprint.project);
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this sprint'
      });
    }
    
    if (sprint.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Sprint can only be completed from active status'
      });
    }
    
    await sprint.completeSprint();
    
    res.json({
      success: true,
      message: 'Sprint completed successfully',
      data: sprint
    });
  } catch (error) {
    console.error('Complete sprint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing sprint'
    });
  }
};

// @desc    Get active sprints
// @route   GET /api/sprints/active
// @access  Private
const getActiveSprints = async (req, res) => {
  try {
    const sprints = await Sprint.getActiveSprints();
    
    res.json({
      success: true,
      data: sprints
    });
  } catch (error) {
    console.error('Get active sprints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active sprints'
    });
  }
};

// @desc    Get project sprints
// @route   GET /api/sprints/project/:projectId
// @access  Private
const getProjectSprints = async (req, res) => {
  try {
    const sprints = await Sprint.getProjectSprints(req.params.projectId);
    
    res.json({
      success: true,
      data: sprints
    });
  } catch (error) {
    console.error('Get project sprints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project sprints'
    });
  }
};

module.exports = {
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
}; 