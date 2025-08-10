const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function testAuthFlow() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔍 Testing Authentication Flow for akashkhairal@gmail.com\n');
    
    // Find user
    const user = await User.findOne({ email: 'akashkhairal@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 User Details:`);
    console.log(`   • Name: ${user.firstName} ${user.lastName}`);
    console.log(`   • Email: ${user.email}`);
    console.log(`   • ID: ${user._id}`);
    console.log(`   • Role: ${user.role || 'No role set'}`);
    console.log(`   • Active: ${user.isActive}`);
    console.log(`   • Google ID: ${user.googleId || 'Not set'}`);
    console.log(`   • Has Password: ${user.password ? 'Yes' : 'No'}`);
    
    // Test JWT token creation
    console.log(`\n🔑 Testing JWT Token Creation:`);
    try {
      const token = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      console.log(`   ✅ Token created successfully`);
      console.log(`   • Length: ${token.length} characters`);
      console.log(`   • First 50 chars: ${token.substring(0, 50)}...`);
      
      // Test token verification
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(`   ✅ Token verification successful`);
      console.log(`   • Decoded ID: ${decoded.id}`);
      console.log(`   • Decoded Email: ${decoded.email}`);
      console.log(`   • Expires: ${new Date(decoded.exp * 1000)}`);
      
      // Test user lookup from token
      const userFromToken = await User.findById(decoded.id);
      if (userFromToken) {
        console.log(`   ✅ User lookup from token successful`);
        console.log(`   • Found: ${userFromToken.firstName} ${userFromToken.lastName}`);
      } else {
        console.log(`   ❌ User lookup from token failed`);
      }
      
    } catch (tokenError) {
      console.log(`   ❌ Token creation/verification failed: ${tokenError.message}`);
    }
    
    // Check if user has any login records or sessions
    console.log(`\n📊 User Account Status:`);
    console.log(`   • Created: ${user.createdAt}`);
    console.log(`   • Updated: ${user.updatedAt}`);
    console.log(`   • Last Modified: ${user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Never'}`);
    
      // Simulate what the frontend should send
      console.log(`\n🌐 Frontend Auth Simulation:`);
      console.log(`   Expected localStorage.getItem('token'): ${token.substring(0, 50)}...`);
      console.log(`   Expected API call headers:`);
      console.log(`   {`);
      console.log(`     'Authorization': 'Bearer ${token.substring(0, 30)}...',`);
      console.log(`     'Content-Type': 'application/json'`);
      console.log(`   }`);
      
    } catch (tokenError) {
      console.log(`   ❌ Token creation/verification failed: ${tokenError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database disconnected');
  }
}

testAuthFlow();
