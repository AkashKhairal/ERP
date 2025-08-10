const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const fixAdminPermissions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@erp.com' });
    if (!adminUser) {
      console.log('Admin user not found. Please run seed.js first.');
      process.exit(1);
    }

    // Update admin user with proper permissions
    const adminPermissions = User.getDefaultPermissions('admin');
    
    await User.findByIdAndUpdate(adminUser._id, {
      role: 'admin',
      isActive: true,
      permissions: adminPermissions
    });

    console.log('CreatorBase admin user permissions updated successfully!');
    console.log('Permissions:', JSON.stringify(adminPermissions, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin permissions:', error);
    process.exit(1);
  }
};

fixAdminPermissions(); 