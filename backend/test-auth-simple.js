const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function simpleAuthTest() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔍 Simple Auth Test for akashkhairal@gmail.com\n');
    
    const user = await User.findOne({ email: 'akashkhairal@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 User: ${user.firstName} ${user.lastName} (${user._id})`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Role: ${user.role || 'Not set'}`);
    console.log(`✅ Active: ${user.isActive}`);
    
    // Create JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    console.log(`\n🎫 Generated Token: ${token.substring(0, 50)}...`);
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`✅ Token valid, user ID: ${decoded.id}`);
    
    console.log(`\n💡 For frontend testing, use this token in localStorage:`);
    console.log(`localStorage.setItem('token', '${token}')`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

simpleAuthTest();
