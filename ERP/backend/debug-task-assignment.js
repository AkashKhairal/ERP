const mongoose = require('mongoose');
require('dotenv').config();

// Import required models
const User = require('./src/models/User');
const Task = require('./src/models/Task');
const Notification = require('./src/models/Notification');

// Test Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

console.log('🔍 Task Assignment & Notification Debug Tool\n');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function debugTaskAssignment() {
  console.log('\n📊 Debugging Task Assignment and Notifications...\n');
  
  try {
    // 1. Check users in the system
    console.log('🔸 Step 1: Checking Users in System');
    const allUsers = await User.find({}).select('_id firstName lastName email googleId isActive');
    console.log(`   Found ${allUsers.length} users in the system:`);
    
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`      • Email: ${user.email}`);
      console.log(`      • ID: ${user._id}`);
      console.log(`      • Google ID: ${user.googleId || 'None'}`);
      console.log(`      • Active: ${user.isActive}`);
      console.log('');
    });

    // 2. Find the specific users mentioned
    console.log('🔸 Step 2: Finding Specific Users');
    const adminUser = await User.findOne({ email: 'admin@company.com' });
    const akashUser = await User.findOne({ email: 'akashkhairal@gmail.com' });
    const akashUserByName = await User.findOne({ 
      $or: [
        { firstName: { $regex: /akash/i }, lastName: { $regex: /khairal/i } },
        { email: { $regex: /akash.*khairal/i } }
      ]
    });
    
    console.log('   Admin User (admin@company.com):');
    if (adminUser) {
      console.log(`      ✅ Found: ${adminUser.firstName} ${adminUser.lastName} (ID: ${adminUser._id})`);
    } else {
      console.log('      ❌ Not found');
    }
    
    console.log('   Akash User (akashkhairal@gmail.com):');
    if (akashUser) {
      console.log(`      ✅ Found: ${akashUser.firstName} ${akashUser.lastName} (ID: ${akashUser._id})`);
      console.log(`      • Google ID: ${akashUser.googleId || 'None'}`);
    } else {
      console.log('      ❌ Not found');
    }
    
    console.log('   Akash User (by name search):');
    if (akashUserByName) {
      console.log(`      ✅ Found: ${akashUserByName.firstName} ${akashUserByName.lastName} (ID: ${akashUserByName._id})`);
      console.log(`      • Email: ${akashUserByName.email}`);
      console.log(`      • Google ID: ${akashUserByName.googleId || 'None'}`);
    } else {
      console.log('      ❌ Not found');
    }

    // 3. Check tasks assigned to any Akash user
    console.log('\n🔸 Step 3: Checking Tasks Assigned to Akash');
    const akashUserId = akashUser?._id || akashUserByName?._id;
    
    if (akashUserId) {
      const assignedTasks = await Task.find({ 
        assignedTo: akashUserId,
        isActive: true
      }).populate('assignedBy', 'firstName lastName email')
        .populate('project', 'name');
      
      console.log(`   Found ${assignedTasks.length} tasks assigned to Akash:`);
      assignedTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. "${task.title}"`);
        console.log(`      • Assigned by: ${task.assignedBy?.firstName} ${task.assignedBy?.lastName} (${task.assignedBy?.email})`);
        console.log(`      • Project: ${task.project?.name || 'None'}`);
        console.log(`      • Status: ${task.status}`);
        console.log(`      • Priority: ${task.priority}`);
        console.log(`      • Created: ${task.createdAt}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No Akash user found to check tasks for');
    }

    // 4. Check notifications for Akash
    console.log('🔸 Step 4: Checking Notifications for Akash');
    if (akashUserId) {
      const notifications = await Notification.find({
        recipient: akashUserId,
        isActive: true
      }).populate('sender', 'firstName lastName email')
        .sort({ createdAt: -1 });
      
      console.log(`   Found ${notifications.length} notifications for Akash:`);
      notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. "${notif.title}"`);
        console.log(`      • Message: ${notif.message}`);
        console.log(`      • Type: ${notif.type} / Category: ${notif.category}`);
        console.log(`      • Priority: ${notif.priority}`);
        console.log(`      • Read: ${notif.isRead}`);
        console.log(`      • From: ${notif.sender?.firstName} ${notif.sender?.lastName} (${notif.sender?.email})`);
        console.log(`      • Created: ${notif.createdAt}`);
        console.log('');
      });
    }

    // 5. Check recent task assignments by admin
    console.log('🔸 Step 5: Checking Recent Tasks Created by Admin');
    if (adminUser) {
      const recentTasks = await Task.find({
        $or: [
          { createdBy: adminUser._id },
          { assignedBy: adminUser._id }
        ],
        isActive: true
      }).populate('assignedTo', 'firstName lastName email')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
      
      console.log(`   Found ${recentTasks.length} recent tasks by admin:`);
      recentTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. "${task.title}"`);
        console.log(`      • Assigned to: ${task.assignedTo?.firstName} ${task.assignedTo?.lastName} (${task.assignedTo?.email})`);
        console.log(`      • Assigned to ID: ${task.assignedTo?._id}`);
        console.log(`      • Project: ${task.project?.name || 'None'}`);
        console.log(`      • Status: ${task.status}`);
        console.log(`      • Created: ${task.createdAt}`);
        console.log('');
      });
    }

    // 6. Check all notifications for task assignments
    console.log('🔸 Step 6: Checking All Task Assignment Notifications');
    const taskNotifications = await Notification.find({
      type: 'task',
      title: 'New Task Assigned',
      isActive: true
    }).populate('recipient', 'firstName lastName email')
      .populate('sender', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`   Found ${taskNotifications.length} task assignment notifications:`);
    taskNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. To: ${notif.recipient?.firstName} ${notif.recipient?.lastName} (${notif.recipient?.email})`);
      console.log(`      • From: ${notif.sender?.firstName} ${notif.sender?.lastName} (${notif.sender?.email})`);
      console.log(`      • Message: ${notif.message}`);
      console.log(`      • Read: ${notif.isRead}`);
      console.log(`      • Created: ${notif.createdAt}`);
      console.log('');
    });

    // 7. Test notification creation
    console.log('🔸 Step 7: Testing Notification Creation');
    if (adminUser && akashUserId) {
      try {
        const testNotification = await Notification.createNotification({
          title: 'Test Notification',
          message: 'This is a test notification to verify the system is working',
          type: 'info',
          category: 'system',
          priority: 'medium',
          recipient: akashUserId,
          sender: adminUser._id,
          actionUrl: '/test',
          actionText: 'View Test',
          metadata: {
            testRun: true,
            timestamp: new Date()
          }
        });
        
        console.log('   ✅ Test notification created successfully:');
        console.log(`      • ID: ${testNotification._id}`);
        console.log(`      • Title: ${testNotification.title}`);
        console.log(`      • Recipient: ${akashUserId}`);
        console.log(`      • Sender: ${adminUser._id}`);
      } catch (error) {
        console.log('   ❌ Failed to create test notification:');
        console.log(`      • Error: ${error.message}`);
      }
    }

    console.log('\n🎯 ANALYSIS SUMMARY:');
    console.log('===================');
    
    if (!akashUser && !akashUserByName) {
      console.log('❌ ISSUE FOUND: No user found with email akashkhairal@gmail.com or name Akash Khairal');
      console.log('   • This means the Google login user doesn\'t exist or has different details');
      console.log('   • Check if the Google user was created properly during authentication');
    }
    
    if (akashUserId && assignedTasks.length === 0) {
      console.log('❌ ISSUE FOUND: User exists but has no assigned tasks');
      console.log('   • Task assignment might be using wrong user ID');
      console.log('   • Check if you\'re selecting the correct user when assigning tasks');
    }
    
    if (akashUserId && notifications.length === 0) {
      console.log('❌ ISSUE FOUND: User exists but has no notifications');
      console.log('   • Notification creation might be failing');
      console.log('   • Check server logs for notification creation errors');
    }
    
    if (akashUser && akashUserByName && akashUser._id.toString() !== akashUserByName._id.toString()) {
      console.log('❌ ISSUE FOUND: Multiple users found with similar details');
      console.log('   • There might be duplicate users in the system');
      console.log(`   • User 1: ${akashUser._id} (${akashUser.email})`);
      console.log(`   • User 2: ${akashUserByName._id} (${akashUserByName.email})`);
    }

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('==================');
    console.log('1. Verify the Google authenticated user exists in the database');
    console.log('2. Check if task assignment is using the correct user ID');
    console.log('3. Verify notification creation is not throwing errors');
    console.log('4. Check if there are duplicate users in the system');
    console.log('5. Test the notification system with known working user IDs');

  } catch (error) {
    console.error('❌ Debug execution failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function main() {
  await connectDB();
  await debugTaskAssignment();
  
  console.log('\n🔍 Debug Analysis Complete!');
  await mongoose.disconnect();
  console.log('📴 Database connection closed');
}

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Run the debug script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { debugTaskAssignment };
