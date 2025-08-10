const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const testAdminLogin = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Test admin credentials
    const adminEmail = 'admin@company.com';
    const adminPassword = 'Password123!';

    console.log(`\n🔍 Testing admin login for: ${adminEmail}`);

    // Find admin user
    const adminUser = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found');
    console.log(`  📧 Email: ${adminUser.email}`);
    console.log(`  👤 Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`  ✅ Active: ${adminUser.isActive}`);
    console.log(`  🔑 Has password: ${!!adminUser.password}`);

    // Test password comparison
    console.log('\n🔐 Testing password comparison...');
    const isPasswordCorrect = await adminUser.comparePassword(adminPassword);
    
    if (isPasswordCorrect) {
      console.log('✅ Password is correct!');
      console.log('\n🎯 Admin login should work with:');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
    } else {
      console.log('❌ Password is incorrect!');
      
      // Let's check what the actual password hash looks like
      console.log('\n🔍 Password hash info:');
      console.log(`  Hash length: ${adminUser.password?.length || 0}`);
      console.log(`  Hash starts with: ${adminUser.password?.substring(0, 10) || 'N/A'}`);
      
      // Try to create a new admin user with the correct password
      console.log('\n🔄 Attempting to reset admin password...');
      
      const saltRounds = 12;
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
      
      adminUser.password = hashedPassword;
      await adminUser.save();
      
      console.log('✅ Admin password reset successfully!');
      console.log('\n🎯 Admin login should now work with:');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

testAdminLogin();
