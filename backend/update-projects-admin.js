const mongoose = require('mongoose');
const Project = require('./src/models/Project');
const User = require('./src/models/User');
require('dotenv').config();

const updateProjectsForAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@company.com' });
    if (!adminUser) {
      console.error('Admin user not found. Please create admin user first.');
      process.exit(1);
    }

    console.log(`Found admin user: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.email})`);

    // Get all projects
    const projects = await Project.find({ isActive: true });
    console.log(`Found ${projects.length} projects`);

    if (projects.length === 0) {
      console.log('No projects found. Please run seed-projects.js first.');
      process.exit(0);
    }

    // Update each project to include admin user as project manager or team member
    const updatedProjects = [];
    for (const project of projects) {
      let updated = false;

      // Check if admin is already project manager
      if (project.projectManager.toString() === adminUser._id.toString()) {
        console.log(`✅ Admin is already project manager for: ${project.name}`);
        updatedProjects.push(project);
        continue;
      }

      // Check if admin is already a team member
      const isTeamMember = project.teamMembers.some(member => 
        member.user.toString() === adminUser._id.toString() && member.isActive
      );

      if (isTeamMember) {
        console.log(`✅ Admin is already team member for: ${project.name}`);
        updatedProjects.push(project);
        continue;
      }

      // Add admin as project manager (replace existing project manager)
      project.projectManager = adminUser._id;
      
      // Also add admin as a team member if not already present
      if (!isTeamMember) {
        project.teamMembers.push({
          user: adminUser._id,
          role: 'developer',
          assignedAt: new Date(),
          isActive: true
        });
      }

      await project.save();
      updatedProjects.push(project);
      updated = true;
      console.log(`✅ Updated project: ${project.name} - Admin is now project manager`);
    }

    console.log(`\n✅ Successfully updated ${updatedProjects.length} projects!`);
    console.log('\nProject Summary:');
    updatedProjects.forEach(project => {
      console.log(`- ${project.name} (${project.type}) - ${project.status} - Manager: Admin User`);
    });

  } catch (error) {
    console.error('Error updating projects:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the update function
updateProjectsForAdmin(); 