const Team = require('../models/Team');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getAllTeams = async (req, res) => {
  try {
    const { department, status } = req.query;
    const query = {};

    if (department) query.department = department;
    if (status) query.status = status;

    const teams = await Team.find(query)
      .populate('teamLead', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email role department')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    console.error('Get all teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teams',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('teamLead', 'firstName lastName email role department')
      .populate('members.user', 'firstName lastName email role department')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get team by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private (Admin, Manager)
const createTeam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, department, teamLead, members } = req.body;

    // Check if team lead exists
    const teamLeadUser = await User.findById(teamLead);
    if (!teamLeadUser) {
      return res.status(400).json({
        success: false,
        message: 'Team lead not found'
      });
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name, department });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team with this name already exists in the department'
      });
    }

    const teamData = {
      name,
      description,
      department,
      teamLead,
      createdBy: req.user._id,
      members: []
    };

    // Add team lead as first member
    teamData.members.push({
      user: teamLead,
      role: 'Team Lead',
      joinedDate: new Date(),
      isActive: true
    });

    // Add other members if provided
    if (members && Array.isArray(members)) {
      for (const member of members) {
        const user = await User.findById(member.user);
        if (user) {
          teamData.members.push({
            user: member.user,
            role: member.role || 'Member',
            joinedDate: new Date(),
            isActive: true
          });
        }
      }
    }

    const team = new Team(teamData);
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email role department')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: populatedTeam
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating team',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin, Manager, Team Lead)
const updateTeam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check permissions (only admin, manager, or team lead can update)
    const canUpdate = req.user.role === 'admin' || 
                     req.user.role === 'manager' || 
                     team.teamLead.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this team'
      });
    }

    const { name, description, department, teamLead, status } = req.body;

    // Update fields
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (department) team.department = department;
    if (teamLead) team.teamLead = teamLead;
    if (status) team.status = status;

    team.updatedBy = req.user._id;
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email role department')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating team',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private (Admin, Manager, Team Lead)
const addMemberToTeam = async (req, res) => {
  try {
    const { userId, role } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check permissions
    const canAddMember = req.user.role === 'admin' || 
                        req.user.role === 'manager' || 
                        team.teamLead.toString() === req.user._id.toString();

    if (!canAddMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add members to this team'
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

    // Check if user is already a member
    const existingMember = team.members.find(member => 
      member.user.toString() === userId
    );

    if (existingMember && existingMember.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team'
      });
    }

    await team.addMember(userId, role || 'Member');

    const updatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email role department')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Member added to team successfully',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Add member to team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding member to team',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (Admin, Manager, Team Lead)
const removeMemberFromTeam = async (req, res) => {
  try {
    const { userId } = req.params;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check permissions
    const canRemoveMember = req.user.role === 'admin' || 
                           req.user.role === 'manager' || 
                           team.teamLead.toString() === req.user._id.toString();

    if (!canRemoveMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove members from this team'
      });
    }

    // Check if user is team lead
    if (team.teamLead.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove team lead from team'
      });
    }

    await team.removeMember(userId);

    const updatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email role department')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Member removed from team successfully',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Remove member from team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing member from team',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin, Manager)
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Only admin and manager can delete teams
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete teams'
      });
    }

    // Soft delete - change status to archived
    team.status = 'archived';
    team.updatedBy = req.user._id;
    await team.save();

    res.json({
      success: true,
      message: 'Team archived successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting team',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get teams by department
// @route   GET /api/teams/department/:department
// @access  Private
const getTeamsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const teams = await Team.getByDepartment(department);

    res.json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    console.error('Get teams by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teams by department',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get user's teams
// @route   GET /api/teams/my-teams
// @access  Private
const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { teamLead: req.user._id },
        { 'members.user': req.user._id, 'members.isActive': true }
      ],
      status: 'active'
    })
    .populate('teamLead', 'firstName lastName email')
    .populate('members.user', 'firstName lastName email role department')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    console.error('Get my teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your teams',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  deleteTeam,
  getTeamsByDepartment,
  getMyTeams
}; 