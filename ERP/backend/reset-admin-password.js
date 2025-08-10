const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    console.log('🔍 Resetting Admin Password...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@company.com' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found');
    console.log(`  📧 Email: ${adminUser.email}`);
    console.log(`  👤 Name: ${adminUser.firstName} ${adminUser.lastName}`);

    // Reset password to Password123!
    const newPassword = 'Password123!';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    adminUser.password = hashedPassword;
    await adminUser.save();
    
    console.log('✅ Admin password reset successfully!');
    
    // Test the new password
    const isPasswordCorrect = await adminUser.comparePassword(newPassword);
    console.log(`  🔐 Password test: ${isPasswordCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    if (isPasswordCorrect) {
      console.log('\n🎯 Admin login should now work with:');
      console.log(`  Email: ${adminUser.email}`);
      console.log(`  Password: ${newPassword}`);
    } else {
      console.log('\n❌ Password reset failed!');
    }

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

resetAdminPassword();
