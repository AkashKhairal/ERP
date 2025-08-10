const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationHelper = require('../utils/notificationHelper');
const { validationResult } = require('express-validator');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getAllProjects = async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const projects = await Project.find(query)
      .populate('projectManager', 'firstName lastName email')
      .populate('teamMembers.user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Project.countDocuments(query);
    
    res.json({
      success: true,
      data: projects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('projectManager', 'firstName lastName email role')
      .populate('teamMembers.user', 'firstName lastName email role department')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Get project tasks
    const tasks = await Task.find({ project: project._id, isActive: true })
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Calculate project statistics
    const taskStats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      doing: tasks.filter(t => t.status === 'doing').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length
    };
    
    res.json({
      success: true,
      data: {
        project,
        tasks,
        taskStats
      }
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project'
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
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
      type,
      priority,
      startDate,
      endDate,
      budget,
      currency,
      client,
      projectManager,
      teamMembers,
      tags,
      youtubeChannel,
      saasDetails
    } = req.body;
    
    // Check if project manager exists
    const manager = await User.findById(projectManager);
    if (!manager) {
      return res.status(400).json({
        success: false,
        message: 'Project manager not found'
      });
    }
    
    // Validate team members
    if (teamMembers && teamMembers.length > 0) {
      for (const member of teamMembers) {
        const user = await User.findById(member.user);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: `Team member with ID ${member.user} not found`
          });
        }
      }
    }
    
    const project = new Project({
      name,
      description,
      type,
      priority,
      startDate,
      endDate,
      budget,
      currency,
      client,
      projectManager,
      teamMembers,
      tags,
      youtubeChannel,
      saasDetails,
      createdBy: req.user._id
    });
    
    await project.save();
    
    // Populate references
    await project.populate('projectManager', 'firstName lastName email');
    await project.populate('teamMembers.user', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating project'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check permissions
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }
    
    const updateData = { ...req.body, updatedBy: req.user._id };
    
    // Validate team members if provided
    if (updateData.teamMembers && updateData.teamMembers.length > 0) {
      for (const member of updateData.teamMembers) {
        const user = await User.findById(member.user);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: `Team member with ID ${member.user} not found`
          });
        }
      }
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('projectManager', 'firstName lastName email')
     .populate('teamMembers.user', 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project'
    });
  }
};

// @desc    Delete project (soft delete)
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check permissions
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }
    
    // Soft delete
    project.isActive = false;
    project.updatedBy = req.user._id;
    await project.save();
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project'
    });
  }
};

// @desc    Add team member to project
// @route   POST /api/projects/:id/team-members
// @access  Private
const addTeamMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check permissions
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add team members'
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
    
    await project.addTeamMember(userId, role);
    
    await project.populate('teamMembers.user', 'firstName lastName email role');
    
    // Create notification for new team member
    await NotificationHelper.notifyProjectTeamMemberAdded(
      project._id,
      project.name,
      userId,
      role,
      req.user._id,
      `${req.user.firstName} ${req.user.lastName}`
    );
    
    res.json({
      success: true,
      message: 'Team member added successfully',
      data: project.teamMembers
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding team member'
    });
  }
};

// @desc    Remove team member from project
// @route   DELETE /api/projects/:id/team-members/:userId
// @access  Private
const removeTeamMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check permissions
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove team members'
      });
    }
    
    await project.removeTeamMember(req.params.userId);
    
    await project.populate('teamMembers.user', 'firstName lastName email role');
    
    res.json({
      success: true,
      message: 'Team member removed successfully',
      data: project.teamMembers
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing team member'
    });
  }
};

// @desc    Get projects by type
// @route   GET /api/projects/type/:type
// @access  Private
const getProjectsByType = async (req, res) => {
  try {
    const projects = await Project.getByType(req.params.type);
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get projects by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    });
  }
};

// @desc    Get user's projects
// @route   GET /api/projects/my-projects
// @access  Private
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.getUserProjects(req.user._id);
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    });
  }
};

// @desc    Get overdue projects
// @route   GET /api/projects/overdue
// @access  Private
const getOverdueProjects = async (req, res) => {
  try {
    const projects = await Project.getOverdueProjects();
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get overdue projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue projects'
    });
  }
};

// @desc    Update project progress
// @route   PUT /api/projects/:id/progress
// @access  Private
const updateProjectProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check permissions
    if (project.projectManager.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update project progress'
      });
    }
    
    await project.updateProgress(progress);
    
    res.json({
      success: true,
      message: 'Project progress updated successfully',
      data: { progress: project.progress }
    });
  } catch (error) {
    console.error('Update project progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project progress'
    });
  }
};

module.exports = {
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
}; 