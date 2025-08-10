const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const debugPassword = async () => {
  try {
    console.log('🔍 Debugging Password Issue...');
    
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
    console.log(`  🔑 Password hash: ${adminUser.password ? adminUser.password.substring(0, 20) + '...' : 'No password'}`);
    console.log(`  🔑 Password hash length: ${adminUser.password?.length || 0}`);

    // Test password manually
    const testPassword = 'Password123!';
    console.log(`\n🔐 Testing password: "${testPassword}"`);
    
    // Test with bcrypt directly
    const isMatchDirect = await bcrypt.compare(testPassword, adminUser.password);
    console.log(`  Direct bcrypt comparison: ${isMatchDirect ? '✅ MATCH' : '❌ NO MATCH'}`);
    
    // Test with User method
    const isMatchMethod = await adminUser.comparePassword(testPassword);
    console.log(`  User method comparison: ${isMatchMethod ? '✅ MATCH' : '❌ NO MATCH'}`);
    
    // If both fail, let's create a new hash
    if (!isMatchDirect && !isMatchMethod) {
      console.log('\n🔄 Creating new password hash...');
      
      const saltRounds = 12;
      const newHash = await bcrypt.hash(testPassword, saltRounds);
      
      console.log(`  New hash: ${newHash.substring(0, 20)}...`);
      console.log(`  New hash length: ${newHash.length}`);
      
      // Test the new hash
      const isNewHashMatch = await bcrypt.compare(testPassword, newHash);
      console.log(`  New hash test: ${isNewHashMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      
      if (isNewHashMatch) {
        // Update the user's password
        adminUser.password = newHash;
        await adminUser.save();
        console.log('✅ Password updated successfully!');
        
        // Test again
        const finalTest = await adminUser.comparePassword(testPassword);
        console.log(`  Final test: ${finalTest ? '✅ MATCH' : '❌ NO MATCH'}`);
        
        if (finalTest) {
          console.log('\n🎯 Admin login should now work with:');
          console.log(`  Email: ${adminUser.email}`);
          console.log(`  Password: ${testPassword}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error debugging password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

debugPassword();
