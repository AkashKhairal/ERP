const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const checkAndResetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // Find admin user with password field
    let adminUser = await User.findOne({ email: 'admin@erp.com' }).select('+password');
    
    if (!adminUser) {
      console.log('Admin user not found. Creating new admin user...');
      
      // Create new admin user
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('password123', saltRounds);
      
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@erp.com',
        password: hashedPassword,
        role: 'admin',
        department: 'operations',
        position: 'System Administrator',
        isActive: true,
        permissions: User.getDefaultPermissions('admin')
      });

      await adminUser.save();
      console.log('✅ New admin user created successfully!');
    } else {
      console.log('Admin user found. Checking password...');
      
      // Test the password
      const isPasswordCorrect = await adminUser.comparePassword('password123');
      
      if (!isPasswordCorrect) {
        console.log('❌ Password is incorrect. Resetting password...');
        
        // Reset password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash('password123', saltRounds);
        adminUser.password = hashedPassword;
        await adminUser.save();
        
        console.log('✅ Password reset successfully!');
      } else {
        console.log('✅ Password is correct!');
      }
    }

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

checkAndResetAdmin(); 