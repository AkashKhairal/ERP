const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const updateAdminPassword = async () => {
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

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    // Update the password
    adminUser.password = hashedPassword;
    await adminUser.save();

    console.log('Admin password updated successfully!');
    console.log('Email: admin@erp.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
};

updateAdminPassword(); 