const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';
const JWT_SECRET = process.env.JWT_SECRET;

async function debugGoogleAuth() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔍 Debugging Google Authentication Issue\n');
    
    // Find the actual user
    const user = await User.findOne({ email: 'akashkhairal@gmail.com' });
    console.log(`👤 Database user:`);
    console.log(`   • ID: ${user._id}`);
    console.log(`   • Email: ${user.email}`);
    console.log(`   • Name: ${user.firstName} ${user.lastName}`);
    console.log(`   • Google ID: ${user.googleId || 'Not set'}`);
    console.log(`   • Role: ${user.role || 'Not set'}`);
    console.log(`   • Created: ${user.createdAt}`);
    
    // Create JWT token like the backend would
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    console.log(`\n🎫 Generated JWT Token:`);
    console.log(`   • Token: ${token.substring(0, 50)}...`);
    
    // Decode the token to verify
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`   • Decoded User ID: ${decoded.id}`);
    console.log(`   • Matches DB User: ${decoded.id === user._id.toString()}`);
    
    // Check if there's any issue with ObjectId conversion
    console.log(`\n🔍 ID Comparison:`);
    console.log(`   • Database _id: ${user._id}`);
    console.log(`   • Database _id type: ${typeof user._id}`);
    console.log(`   • Database _id.toString(): ${user._id.toString()}`);
    console.log(`   • JWT decoded.id: ${decoded.id}`);
    console.log(`   • JWT decoded.id type: ${typeof decoded.id}`);
    
    // Simulate frontend auth check
    console.log(`\n🌐 Simulating frontend auth check:`);
    const userFromToken = await User.findById(decoded.id).select('-password');
    if (userFromToken) {
      console.log(`   ✅ User found from token`);
      console.log(`   • ID: ${userFromToken._id}`);
      console.log(`   • Email: ${userFromToken.email}`);
      console.log(`   • Same as original: ${userFromToken._id.toString() === user._id.toString()}`);
    } else {
      console.log(`   ❌ User NOT found from token`);
    }
    
    // Check recent logins or any other user records
    console.log(`\n📊 All users with similar email:`);
    const similarUsers = await User.find({ 
      email: { $regex: 'akash', $options: 'i' } 
    }).sort({ createdAt: -1 });
    
    similarUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u._id} - ${u.email} (${u.createdAt})`);
    });
    
    console.log(`\n💡 Expected frontend behavior:`);
    console.log(`   1. Google login should create/update user: ${user._id}`);
    console.log(`   2. JWT token should contain user ID: ${user._id}`);
    console.log(`   3. Frontend should use token with user ID: ${user._id}`);
    console.log(`   4. API calls should work with this user ID`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database disconnected');
  }
}

debugGoogleAuth();

