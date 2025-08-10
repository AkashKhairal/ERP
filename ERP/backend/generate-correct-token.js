const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const User = require('./src/models/User');
const Role = require('./src/models/Role');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

async function generateCorrectToken() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('\n🔑 GENERATING CORRECT JWT TOKEN FOR AKASH\n');
    
    const targetEmail = 'akashkhairal@gmail.com';
    
    // Find the user
    const user = await User.findOne({ email: targetEmail }).populate('roles');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 Found user:');
    console.log(`   • ID: ${user._id}`);
    console.log(`   • Name: ${user.firstName} ${user.lastName}`);
    console.log(`   • Email: ${user.email}`);
    console.log(`   • Roles: ${user.roles?.map(r => r.name || r).join(', ') || 'None'}`);
    console.log(`   • Active: ${user.isActive}`);
    
    // Generate JWT token using the same logic as the backend
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const jwtExpire = process.env.JWT_EXPIRE || '24h';
    
    const payload = {
      userId: user._id,
      email: user.email,
      roles: user.roles || []
    };
    
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpire
    });
    
    console.log('\n🔑 Generated JWT token:');
    console.log(`${token}\n`);
    
    // Decode and verify the token
    console.log('🔍 Token verification:');
    try {
      const decoded = jwt.verify(token, jwtSecret);
      console.log('✅ Token is valid');
      console.log(`   • User ID: ${decoded.userId}`);
      console.log(`   • Email: ${decoded.email}`);
      console.log(`   • Roles: ${JSON.stringify(decoded.roles)}`);
      console.log(`   • Expires: ${new Date(decoded.exp * 1000)}`);
    } catch (verifyError) {
      console.log('❌ Token verification failed:', verifyError.message);
    }
    
    console.log('\n📋 INSTRUCTIONS FOR USER:');
    console.log('1. Open browser developer tools (F12)');
    console.log('2. Go to Application/Storage tab');
    console.log('3. Find Local Storage for your domain');
    console.log('4. Find the "token" key');
    console.log('5. Replace the value with the token shown above');
    console.log('6. Refresh the page and try logging in as Akash again');
    
    console.log('\n⚠️  ALTERNATIVE SOLUTION:');
    console.log('The issue might be in the Google authentication flow.');
    console.log('The frontend is getting a different user ID than what exists in the database.');
    console.log('This could be because:');
    console.log('1. The Google auth creates a new user instead of finding the existing one');
    console.log('2. There\'s a JWT generation/parsing issue');
    console.log('3. The user needs to clear all storage and re-login completely');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database disconnected');
  }
}

generateCorrectToken();
