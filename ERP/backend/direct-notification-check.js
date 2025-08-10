const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Notification = require('./src/models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

async function directCheck() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔍 Direct Notification Check for akashkhairal@gmail.com\n');
    
    // Find user
    const user = await User.findOne({ email: 'akashkhairal@gmail.com' });
    if (!user) {
      console.log('❌ User not found with email: akashkhairal@gmail.com');
      return;
    }
    
    console.log(`👤 User found: ${user.firstName} ${user.lastName}`);
    console.log(`   • ID: ${user._id}`);
    console.log(`   • Email: ${user.email}`);
    console.log(`   • Active: ${user.isActive}`);
    console.log(`   • Role: ${user.role}`);
    console.log(`   • Google ID: ${user.googleId || 'None'}`);
    
    // Check notifications
    const notifications = await Notification.find({
      recipient: user._id,
      isActive: true
    }).populate('sender', 'firstName lastName email');
    
    console.log(`\n🔔 Notifications found: ${notifications.length}`);
    
    if (notifications.length === 0) {
      console.log('❌ No notifications found for this user');
      
      // Check if there are any notifications at all
      const totalNotifications = await Notification.countDocuments({ isActive: true });
      console.log(`📊 Total notifications in system: ${totalNotifications}`);
      
      // Check if there are notifications with similar recipient IDs
      const allRecipients = await Notification.distinct('recipient', { isActive: true });
      console.log(`👥 Unique recipients in system: ${allRecipients.length}`);
      console.log(`🔍 Recipient IDs: ${allRecipients.slice(0, 5).join(', ')}${allRecipients.length > 5 ? '...' : ''}`);
      
    } else {
      notifications.forEach((notif, i) => {
        console.log(`\n${i + 1}. ${notif.title}`);
        console.log(`   • Message: ${notif.message}`);
        console.log(`   • Type: ${notif.type} | Category: ${notif.category}`);
        console.log(`   • Priority: ${notif.priority}`);
        console.log(`   • Read: ${notif.isRead}`);
        console.log(`   • From: ${notif.sender?.firstName} ${notif.sender?.lastName} (${notif.sender?.email})`);
        console.log(`   • Created: ${notif.createdAt}`);
        console.log(`   • ID: ${notif._id}`);
      });
    }
    
    // Test the exact API query that frontend would use
    console.log('\n🧪 Testing API query format...');
    const apiFormatQuery = await Notification.find({
      recipient: user._id,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('sender', 'name email avatar')
    .lean();
    
    console.log(`📋 API format query result: ${apiFormatQuery.length} notifications`);
    
    // Check unread count
    const unreadCount = await Notification.countDocuments({
      recipient: user._id,
      isRead: false,
      isActive: true
    });
    
    console.log(`📊 Unread notifications: ${unreadCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database disconnected');
  }
}

directCheck();
