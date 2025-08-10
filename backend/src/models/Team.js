const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  department: {
    type: String,
    enum: ['engineering', 'content', 'marketing', 'finance', 'hr', 'operations', 'design'],
    required: true
  },
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      required: true
    },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
teamSchema.index({ name: 1 });
teamSchema.index({ department: 1 });
teamSchema.index({ status: 1 });
teamSchema.index({ teamLead: 1 });

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.filter(member => member.isActive).length;
});

// Method to add member to team
teamSchema.methods.addMember = function(userId, role) {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.isActive = true;
    existingMember.role = role;
  } else {
    this.members.push({
      user: userId,
      role: role,
      joinedDate: new Date(),
      isActive: true
    });
  }
  
  return this.save();
};

// Method to remove member from team
teamSchema.methods.removeMember = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (member) {
    member.isActive = false;
  }
  
  return this.save();
};

// Static method to get teams by department
teamSchema.statics.getByDepartment = function(department) {
  return this.find({ department, status: 'active' })
    .populate('teamLead', 'firstName lastName email')
    .populate('members.user', 'firstName lastName email role department');
};

module.exports = mongoose.model('Team', teamSchema); 