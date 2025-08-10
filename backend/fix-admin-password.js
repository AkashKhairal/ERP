const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixAdminPassword = async () => {
  try {
    console.log('🔍 Fixing Admin Password...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Find admin user with password field explicitly selected
    const adminUser = await User.findOne({ email: 'admin@company.com' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found');
    console.log(`  📧 Email: ${adminUser.email}`);
    console.log(`  👤 Name: ${adminUser.firstName} ${adminUser.lastName}`);

    // Create a new password hash
    const newPassword = 'Password123!';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log(`  🔑 New hash: ${hashedPassword.substring(0, 20)}...`);
    console.log(`  🔑 Hash length: ${hashedPassword.length}`);
    
    // Test the new hash before saving
    const isHashValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`  🔐 Hash validation: ${isHashValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (isHashValid) {
      // Update the user's password
      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log('✅ Password updated successfully!');
      
      // Test the password after saving
      const updatedUser = await User.findOne({ email: 'admin@company.com' }).select('+password');
      const isPasswordCorrect = await updatedUser.comparePassword(newPassword);
      console.log(`  🔐 Final password test: ${isPasswordCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
      
      if (isPasswordCorrect) {
        console.log('\n🎯 Admin login should now work with:');
        console.log(`  Email: ${adminUser.email}`);
        console.log(`  Password: ${newPassword}`);
        
        // Test the API endpoint
        console.log('\n🧪 Testing API endpoint...');
        const axios = require('axios');
        try {
          const response = await axios.post('https://creatorbase-backend.onrender.com/api/auth/login', {
            email: adminUser.email,
            password: newPassword
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data?.success) {
            console.log('✅ API login test successful!');
            console.log('🎯 Frontend login should now work!');
          } else {
            console.log('❌ API login test failed:', response.data);
          }
        } catch (apiError) {
          console.log('❌ API login test failed:', apiError.response?.data?.message || apiError.message);
        }
      } else {
        console.log('\n❌ Password test failed after update!');
      }
    } else {
      console.log('\n❌ Hash validation failed!');
    }

  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

fixAdminPassword();
