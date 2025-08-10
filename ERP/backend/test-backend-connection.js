const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing Backend Database Connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@company.com' }).select('+password');
    
    if (!adminUser) {
      console.log('❌ Admin user not found in database!');
      console.log('This means the backend is not connected to the correct database.');
      return;
    }

    console.log('✅ Admin user found in database');
    console.log(`  📧 Email: ${adminUser.email}`);
    console.log(`  👤 Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`  ✅ Active: ${adminUser.isActive}`);
    console.log(`  🔑 Has password: ${!!adminUser.password}`);

    // Test password
    const isPasswordCorrect = await adminUser.comparePassword('Password123!');
    console.log(`  🔐 Password test: ${isPasswordCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);

    if (isPasswordCorrect) {
      console.log('\n🎯 Database is working correctly!');
      console.log('The issue might be with the Render deployment or environment variables.');
    } else {
      console.log('\n❌ Password is incorrect in database!');
    }

  } catch (error) {
    console.error('❌ Error testing backend connection:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

testBackendConnection();
