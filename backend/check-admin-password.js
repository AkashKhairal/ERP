const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const checkAdminPassword = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Find admin user with password
    const adminUser = await User.findOne({ email: 'admin@company.com' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found');
    console.log(`  📧 Email: ${adminUser.email}`);
    console.log(`  👤 Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`  🔑 Password hash: ${adminUser.password ? adminUser.password.substring(0, 20) + '...' : 'No password'}`);
    console.log(`  🔑 Password hash length: ${adminUser.password?.length || 0}`);

    // Test different password combinations
    const testPasswords = [
      'Password123!',
      'password123',
      'Password123',
      'admin123',
      'admin@123',
      'Admin123!',
      'admin@company.com'
    ];

    console.log('\n🔐 Testing password combinations...');
    
    for (const testPassword of testPasswords) {
      try {
        const isMatch = await adminUser.comparePassword(testPassword);
        console.log(`  Testing "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        
        if (isMatch) {
          console.log(`\n🎯 FOUND WORKING PASSWORD: ${testPassword}`);
          console.log('\n🎯 Admin login should work with:');
          console.log(`  Email: ${adminUser.email}`);
          console.log(`  Password: ${testPassword}`);
          break;
        }
      } catch (error) {
        console.log(`  Testing "${testPassword}": ❌ ERROR - ${error.message}`);
      }
    }

    // If no password works, let's reset it
    console.log('\n🔄 Resetting admin password to: Password123!');
    
    const saltRounds = 12;
    const newPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    adminUser.password = hashedPassword;
    await adminUser.save();
    
    console.log('✅ Admin password reset successfully!');
    console.log('\n🎯 Admin login should now work with:');
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password: ${newPassword}`);

  } catch (error) {
    console.error('❌ Error checking admin password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkAdminPassword();
