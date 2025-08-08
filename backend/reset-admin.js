const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@erp.com' });
    console.log('Deleted existing admin user');

    // Create new admin user with plain password (will be hashed by pre-save middleware)
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@erp.com',
      password: 'password123', // This will be hashed by the pre-save middleware
      role: 'admin',
      department: 'operations',
      position: 'System Administrator',
      isActive: true,
      permissions: User.getDefaultPermissions('admin')
    });

    await adminUser.save();
    console.log('✅ New admin user created successfully!');

    console.log('\n📋 Admin User Details:');
    console.log('Email:', adminUser.email);
    console.log('Role:', adminUser.role);
    console.log('Department:', adminUser.department);
    console.log('Is Active:', adminUser.isActive);
    console.log('Password: password123');
    
    // Test login
    console.log('\n🧪 Testing login...');
    const testUser = await User.findOne({ email: 'admin@erp.com' }).select('+password');
    const loginTest = await testUser.comparePassword('password123');
    
    if (loginTest) {
      console.log('✅ Login test successful!');
    } else {
      console.log('❌ Login test failed!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetAdmin(); 