const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
require('dotenv').config();

const seedAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // First, create default roles if they don't exist
    const defaultRoles = Role.getDefaultRoles();
    const createdRoles = [];
    
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role({
          ...roleData,
          createdBy: null // Will be updated after admin user is created
        });
        await role.save();
        createdRoles.push(role);
        console.log(`Created role: ${role.name}`);
      } else {
        createdRoles.push(existingRole);
      }
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@erp.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Find the Admin role
    const adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      console.error('Admin role not found. Please run role initialization first.');
      process.exit(1);
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@erp.com',
      password: 'password123',
      roles: [adminRole._id],
      department: 'operations',
      position: 'System Administrator',
      isActive: true
    });

    await adminUser.save();

    // Update the created roles to have the admin user as creator
    await Role.updateMany(
      { createdBy: null },
      { createdBy: adminUser._id }
    );

    console.log('CreatorBase admin user created successfully!');
    console.log('Email: admin@erp.com');
    console.log('Password: password123');
    console.log(`Created ${createdRoles.length} default roles`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

seedAdminUser(); 