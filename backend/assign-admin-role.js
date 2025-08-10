const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
require('dotenv').config();

const assignAdminRole = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // Find the Admin role
    const adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      console.error('❌ Admin role not found. Please run initialize-roles.js first.');
      process.exit(1);
    }
    console.log('✅ Found Admin role:', adminRole._id);

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@erp.com' });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run seed.js first.');
      process.exit(1);
    }
    console.log('✅ Found admin user:', adminUser._id);

    // Assign Admin role to admin user
    adminUser.roles = [adminRole._id];
    await adminUser.save();

    console.log('✅ Successfully assigned Admin role to admin user!');
    console.log('📋 Updated admin user roles:', adminUser.roles);

    // Update the Admin role to have the admin user as creator
    adminRole.createdBy = adminUser._id;
    await adminRole.save();
    console.log('✅ Updated Admin role createdBy field');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error assigning admin role:', error);
    process.exit(1);
  }
};

assignAdminRole(); 