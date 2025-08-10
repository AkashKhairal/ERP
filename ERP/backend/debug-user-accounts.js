const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Notification = require('./src/models/Notification');
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

async function debugUserAccounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('\n🔍 DEBUGGING USER ACCOUNTS\n');
    
    // Find all users with "akash" in their email or name
    const akashUsers = await User.find({
      $or: [
        { email: { $regex: /akash/i } },
        { name: { $regex: /akash/i } },
        { firstName: { $regex: /akash/i } },
        { lastName: { $regex: /akash/i } }
      ]
    }).select('_id email name firstName lastName googleId roles createdAt');
    
    console.log(`Found ${akashUsers.length} users matching "akash":`);
    akashUsers.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log(`ID: ${user._id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name || `${user.firstName} ${user.lastName}`}`);
      console.log(`Google ID: ${user.googleId}`);
      console.log(`Roles: ${JSON.stringify(user.roles)}`);
      console.log(`Created: ${user.createdAt}`);
    });
    
    // Check notifications for each user
    console.log('\n🔔 CHECKING NOTIFICATIONS:\n');
    for (const user of akashUsers) {
      const notifications = await Notification.find({ recipient: user._id }).countDocuments();
      console.log(`User ${user._id} (${user.email}): ${notifications} notifications`);
    }
    
    // Test JWT token generation for each user
    console.log('\n🔑 TESTING JWT TOKENS:\n');
    for (const user of akashUsers) {
      try {
        const token = jwt.sign(
          { 
            userId: user._id,
            email: user.email,
            roles: user.roles || []
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );
        
        // Decode to verify
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log(`✅ User ${user._id}: Token generated successfully`);
        console.log(`   - Decoded userId: ${decoded.userId}`);
        console.log(`   - Email: ${decoded.email}`);
        console.log(`   - Roles: ${JSON.stringify(decoded.roles)}`);
      } catch (error) {
        console.log(`❌ User ${user._id}: Token generation failed - ${error.message}`);
      }
    }
    
    // Check if there are any users with the frontend-reported ID
    const frontendUserId = '68961855863451c214bb7b6a';
    console.log(`\n🔍 CHECKING FRONTEND-REPORTED USER ID: ${frontendUserId}\n`);
    
    const frontendUser = await User.findById(frontendUserId);
    if (frontendUser) {
      console.log('✅ Found user with frontend-reported ID:');
      console.log(`   - Email: ${frontendUser.email}`);
      console.log(`   - Name: ${frontendUser.name || `${frontendUser.firstName} ${frontendUser.lastName}`}`);
      console.log(`   - Google ID: ${frontendUser.googleId}`);
      console.log(`   - Roles: ${JSON.stringify(frontendUser.roles)}`);
      console.log(`   - Created: ${frontendUser.createdAt}`);
      
      // Check notifications for this user
      const frontendNotifications = await Notification.find({ recipient: frontendUserId }).countDocuments();
      console.log(`   - Notifications: ${frontendNotifications}`);
    } else {
      console.log('❌ No user found with frontend-reported ID');
    }
    
    console.log('\n🔍 SUMMARY OF FINDINGS:\n');
    console.log(`- Total Akash-related users: ${akashUsers.length}`);
    console.log(`- User with notifications (6892846a58793b13fbe6e364): ${akashUsers.find(u => u._id.toString() === '6892846a58793b13fbe6e364') ? 'EXISTS' : 'NOT FOUND'}`);
    console.log(`- User from frontend (68961855863451c214bb7b6a): ${frontendUser ? 'EXISTS' : 'NOT FOUND'}`);
    
    if (akashUsers.length > 1) {
      console.log('\n⚠️  MULTIPLE USERS DETECTED - This is likely the root cause!');
      console.log('   Recommendation: Merge accounts or update the correct one with proper roles.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database disconnected');
  }
}

debugUserAccounts();
