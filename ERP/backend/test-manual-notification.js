const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Task = require('./src/models/Task');
const Project = require('./src/models/Project');
const Notification = require('./src/models/Notification');
const NotificationHelper = require('./src/utils/notificationHelper');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

console.log('🧪 Manual Notification Test');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function testNotificationSystem() {
  try {
    // Get users
    const adminUser = await User.findOne({ email: 'admin@company.com' });
    const akashUser = await User.findOne({ email: 'akashkhairal@gmail.com' });
    
    if (!adminUser || !akashUser) {
      console.log('❌ Required users not found');
      return;
    }
    
    console.log(`👤 Admin: ${adminUser.firstName} ${adminUser.lastName} (${adminUser._id})`);
    console.log(`👤 Akash: ${akashUser.firstName} ${akashUser.lastName} (${akashUser._id})`);
    
    // Get or create a project
    let project = await Project.findOne({});
    if (!project) {
      project = await Project.create({
        name: 'Test Project',
        description: 'A test project for notification testing',
        type: 'development',
        priority: 'medium',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        projectManager: adminUser._id,
        createdBy: adminUser._id
      });
      console.log(`📁 Created test project: ${project.name}`);
    } else {
      console.log(`📁 Using existing project: ${project.name}`);
    }
    
    // Create a test task manually
    console.log('\n🔸 Creating test task...');
    const task = await Task.create({
      title: 'Manual Test Task for Notifications',
      description: 'This task is created to test the notification system',
      project: project._id,
      priority: 'high',
      type: 'feature',
      assignedTo: akashUser._id,
      assignedBy: adminUser._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: adminUser._id
    });
    
    console.log(`✅ Task created: "${task.title}" (${task._id})`);
    
    // Test notification creation manually
    console.log('\n🔸 Creating notification manually...');
    const notification = await NotificationHelper.notifyTaskAssigned(
      task._id,
      task.title,
      akashUser._id,
      adminUser._id,
      project.name,
      task.dueDate,
      task.priority
    );
    
    if (notification) {
      console.log(`✅ Notification created: "${notification.title}" (${notification._id})`);
    } else {
      console.log('❌ Notification creation returned null');
    }
    
    // Verify notification was saved
    console.log('\n🔸 Verifying notification in database...');
    const savedNotifications = await Notification.find({
      recipient: akashUser._id,
      isActive: true
    }).sort({ createdAt: -1 });
    
    console.log(`📊 Total notifications for Akash: ${savedNotifications.length}`);
    savedNotifications.forEach((notif, i) => {
      console.log(`${i+1}. "${notif.title}" - ${notif.type} - Read: ${notif.isRead} - Created: ${notif.createdAt}`);
    });
    
    // Verify task was saved
    console.log('\n🔸 Verifying task assignment...');
    const savedTasks = await Task.find({
      assignedTo: akashUser._id,
      isActive: true
    }).sort({ createdAt: -1 });
    
    console.log(`📊 Total tasks assigned to Akash: ${savedTasks.length}`);
    savedTasks.forEach((task, i) => {
      console.log(`${i+1}. "${task.title}" - Status: ${task.status} - Created: ${task.createdAt}`);
    });
    
    console.log('\n🎯 Summary:');
    console.log(`• Users found: ✅`);
    console.log(`• Project available: ✅`);
    console.log(`• Task created: ✅`);
    console.log(`• Notification created: ${notification ? '✅' : '❌'}`);
    console.log(`• Notification saved: ${savedNotifications.length > 0 ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

async function main() {
  await connectDB();
  await testNotificationSystem();
  await mongoose.disconnect();
  console.log('\n📴 Disconnected from MongoDB');
}

main().catch(console.error);
