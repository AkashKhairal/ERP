const mongoose = require('mongoose');
require('dotenv').config();

// Import required models
const User = require('./src/models/User');
const Task = require('./src/models/Task');
const Notification = require('./src/models/Notification');

// Test Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

console.log('🔍 Simple Task Assignment Debug\n');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function simpleDebug() {
  try {
    // Check specific users
    const adminUser = await User.findOne({ email: 'admin@company.com' });
    const akashUser = await User.findOne({ email: 'akashkhairal@gmail.com' });
    
    console.log('👤 Users Found:');
    console.log(`Admin: ${adminUser ? `${adminUser.firstName} ${adminUser.lastName} (${adminUser._id})` : 'NOT FOUND'}`);
    console.log(`Akash: ${akashUser ? `${akashUser.firstName} ${akashUser.lastName} (${akashUser._id})` : 'NOT FOUND'}`);
    
    if (!akashUser) {
      console.log('\n❌ CRITICAL ISSUE: Akash user not found!');
      return;
    }
    
    // Check tasks assigned to Akash
    const tasks = await Task.find({ 
      assignedTo: akashUser._id,
      isActive: true 
    }).select('title status assignedBy createdAt');
    
    console.log(`\n📋 Tasks assigned to Akash: ${tasks.length}`);
    tasks.forEach((task, i) => {
      console.log(`${i+1}. "${task.title}" - Status: ${task.status} - Created: ${task.createdAt}`);
    });
    
    // Check notifications for Akash
    const notifications = await Notification.find({
      recipient: akashUser._id,
      isActive: true
    }).select('title message type isRead createdAt');
    
    console.log(`\n🔔 Notifications for Akash: ${notifications.length}`);
    notifications.forEach((notif, i) => {
      console.log(`${i+1}. "${notif.title}" - ${notif.type} - Read: ${notif.isRead} - Created: ${notif.createdAt}`);
    });
    
    // Check recent task assignments
    const recentTasks = await Task.find({
      assignedBy: adminUser._id,
      isActive: true
    }).select('title assignedTo createdAt').sort({ createdAt: -1 }).limit(5);
    
    console.log(`\n📈 Recent tasks created by admin: ${recentTasks.length}`);
    recentTasks.forEach((task, i) => {
      console.log(`${i+1}. "${task.title}" - Assigned to: ${task.assignedTo} - Created: ${task.createdAt}`);
    });
    
    // Test notification creation
    console.log('\n🧪 Testing notification creation...');
    try {
      const testNotif = await Notification.create({
        title: 'Debug Test Notification',
        message: 'This is a test notification to verify system functionality',
        type: 'info',
        category: 'system',
        priority: 'medium',
        recipient: akashUser._id,
        sender: adminUser._id,
        actionUrl: '/test',
        actionText: 'Test'
      });
      
      console.log('✅ Test notification created successfully:', testNotif._id);
    } catch (error) {
      console.log('❌ Test notification failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

async function main() {
  await connectDB();
  await simpleDebug();
  await mongoose.disconnect();
  console.log('\n📴 Database connection closed');
}

main().catch(console.error);
