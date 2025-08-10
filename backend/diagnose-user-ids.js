const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Notification = require('./src/models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

async function diagnoseUserIds() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔍 Diagnosing User ID Mismatch Issue\n');
    
    // Find ALL users with akashkhairal@gmail.com
    const allAkashUsers = await User.find({ email: 'akashkhairal@gmail.com' });
    console.log(`📊 Found ${allAkashUsers.length} users with email akashkhairal@gmail.com:`);
    
    allAkashUsers.forEach((user, i) => {
      console.log(`   ${i + 1}. ID: ${user._id}`);
      console.log(`      • Name: ${user.firstName} ${user.lastName}`);
      console.log(`      • Role: ${user.role || 'Not set'}`);
      console.log(`      • Active: ${user.isActive}`);
      console.log(`      • Created: ${user.createdAt}`);
      console.log(`      • Google ID: ${user.googleId || 'Not set'}`);
      console.log('');
    });
    
    // Check notifications for each user ID
    console.log('🔔 Checking notifications for each user ID:');
    
    for (let i = 0; i < allAkashUsers.length; i++) {
      const user = allAkashUsers[i];
      const notifications = await Notification.find({ 
        recipient: user._id,
        isActive: true 
      });
      
      console.log(`   User ${user._id}: ${notifications.length} notifications`);
      notifications.forEach(notif => {
        console.log(`     • ${notif.title} (${notif.createdAt})`);
      });
    }
    
    // Check if there are notifications for the OLD user ID mentioned in logs
    const oldUserId = '6892846a58793b13fbe6e364';
    const oldUserNotifications = await Notification.find({ 
      recipient: oldUserId,
      isActive: true 
    });
    
    console.log(`\n🔍 Notifications for OLD user ID (${oldUserId}): ${oldUserNotifications.length}`);
    oldUserNotifications.forEach(notif => {
      console.log(`   • ${notif.title} - Recipient: ${notif.recipient}`);
    });
    
    // Check if the old user ID exists
    const oldUser = await User.findById(oldUserId);
    console.log(`\n👤 Old user ID exists: ${oldUser ? 'YES' : 'NO'}`);
    if (oldUser) {
      console.log(`   • Email: ${oldUser.email}`);
      console.log(`   • Name: ${oldUser.firstName} ${oldUser.lastName}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database disconnected');
  }
}

diagnoseUserIds();

