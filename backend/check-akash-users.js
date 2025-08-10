const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Notification = require('./src/models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

async function checkAkashUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('\n🔍 CHECKING AKASH USERS\n');
    
    const targetEmail = 'akashkhairal@gmail.com';
    
    // Find all users with this email
    const users = await User.find({ email: targetEmail });
    console.log(`Found ${users.length} users with email: ${targetEmail}\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found with this email');
      return;
    }
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`--- USER ${i + 1} ---`);
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Created: ${user.createdAt}`);
      console.log(`Last Login: ${user.lastLogin || 'Never'}`);
      console.log(`Department: ${user.department || 'Not set'}`);
      console.log(`Position: ${user.position || 'Not set'}`);
      console.log(`Roles: ${JSON.stringify(user.roles || [])}`);
      console.log(`Active: ${user.isActive}`);
      
      // Check notifications
      const notifications = await Notification.find({ recipient: user._id });
      console.log(`Notifications: ${notifications.length}`);
      
      if (notifications.length > 0) {
        console.log(`   Sample notifications:`);
        notifications.slice(0, 3).forEach((notif, idx) => {
          console.log(`   ${idx + 1}. ${notif.title} (${notif.type}) - ${notif.isRead ? 'Read' : 'Unread'}`);
        });
      }
      
      console.log('');
    }
    
    // Check if the frontend reported ID exists
    const frontendId = '68961855863451c214bb7b6a';
    const backendId = '6892846a58793b13fbe6e364';
    
    console.log(`🔍 Checking specific IDs:`);
    console.log(`Frontend reported ID: ${frontendId}`);
    console.log(`Backend notifications ID: ${backendId}\n`);
    
    const frontendUser = await User.findById(frontendId);
    const backendUser = await User.findById(backendId);
    
    console.log(`Frontend ID exists: ${frontendUser ? 'YES' : 'NO'}`);
    if (frontendUser) {
      console.log(`   Email: ${frontendUser.email}`);
      console.log(`   Name: ${frontendUser.firstName} ${frontendUser.lastName}`);
    }
    
    console.log(`Backend ID exists: ${backendUser ? 'YES' : 'NO'}`);
    if (backendUser) {
      console.log(`   Email: ${backendUser.email}`);
      console.log(`   Name: ${backendUser.firstName} ${backendUser.lastName}`);
    }
    
    // Check notifications for each ID
    const frontendNotifications = await Notification.countDocuments({ recipient: frontendId });
    const backendNotifications = await Notification.countDocuments({ recipient: backendId });
    
    console.log(`\n📊 Notification counts:`);
    console.log(`Frontend ID (${frontendId}): ${frontendNotifications} notifications`);
    console.log(`Backend ID (${backendId}): ${backendNotifications} notifications`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database disconnected');
  }
}

checkAkashUsers();

