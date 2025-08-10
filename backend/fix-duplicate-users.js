const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Notification = require('./src/models/Notification');
const Role = require('./src/models/Role');
const Task = require('./src/models/Task');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

async function fixDuplicateUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('\n🔧 FIXING DUPLICATE USER ACCOUNTS\n');
    
    const targetEmail = 'akashkhairal@gmail.com';
    
    // Find all users with this email
    const users = await User.find({ email: targetEmail }).populate('roles');
    console.log(`Found ${users.length} users with email: ${targetEmail}`);
    
    if (users.length < 2) {
      console.log('❌ No duplicate users found. This may not be the issue.');
      return;
    }
    
    // Display all users
    console.log('\n👥 All users with this email:');
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Created: ${user.createdAt}`);
      console.log(`Last Login: ${user.lastLogin}`);
      console.log(`Roles: ${user.roles?.map(r => r.name || r).join(', ') || 'None'}`);
      console.log(`Department: ${user.department}`);
      console.log(`Position: ${user.position}`);
      console.log(`Active: ${user.isActive}`);
    });
    
    // Check notifications for each user
    console.log('\n🔔 Notifications for each user:');
    for (const user of users) {
      const notificationCount = await Notification.countDocuments({ recipient: user._id });
      console.log(`User ${user._id}: ${notificationCount} notifications`);
    }
    
    // Check task assignments for each user
    console.log('\n📋 Task assignments for each user:');
    for (const user of users) {
      const assignedTasks = await Task.countDocuments({ assignedTo: user._id });
      const createdTasks = await Task.countDocuments({ createdBy: user._id });
      console.log(`User ${user._id}: ${assignedTasks} assigned tasks, ${createdTasks} created tasks`);
    }
    
    // Determine which user to keep (prefer the one with roles/notifications)
    let primaryUser = null;
    let usersToMerge = [];
    
    for (const user of users) {
      const notificationCount = await Notification.countDocuments({ recipient: user._id });
      const hasRoles = user.roles && user.roles.length > 0;
      
      if (hasRoles || notificationCount > 0) {
        console.log(`\n🎯 User ${user._id} has data (${notificationCount} notifications, ${user.roles?.length || 0} roles)`);
        if (!primaryUser) {
          primaryUser = user;
        } else {
          usersToMerge.push(user);
        }
      } else {
        usersToMerge.push(user);
      }
    }
    
    if (!primaryUser) {
      // If no user has data, use the oldest one
      primaryUser = users.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
      usersToMerge = users.filter(u => u._id.toString() !== primaryUser._id.toString());
    }
    
    console.log(`\n🔑 PRIMARY USER (keeping): ${primaryUser._id}`);
    console.log(`📧 Email: ${primaryUser.email}`);
    console.log(`👤 Name: ${primaryUser.firstName} ${primaryUser.lastName}`);
    
    if (usersToMerge.length === 0) {
      console.log('\n✅ No users to merge. Only one user found or already consolidated.');
      return;
    }
    
    console.log(`\n🔄 USERS TO MERGE (${usersToMerge.length}):`);
    usersToMerge.forEach(user => {
      console.log(`   • ${user._id} (${user.firstName} ${user.lastName})`);
    });
    
    // Start merging process
    console.log('\n🚀 Starting merge process...\n');
    
    for (const userToMerge of usersToMerge) {
      console.log(`📝 Merging data from ${userToMerge._id}...`);
      
      // 1. Transfer notifications
      const notificationsToTransfer = await Notification.find({ recipient: userToMerge._id });
      console.log(`   • Found ${notificationsToTransfer.length} notifications to transfer`);
      
      if (notificationsToTransfer.length > 0) {
        await Notification.updateMany(
          { recipient: userToMerge._id },
          { recipient: primaryUser._id }
        );
        console.log(`   ✅ Transferred ${notificationsToTransfer.length} notifications`);
      }
      
      // 2. Transfer task assignments
      const assignedTasks = await Task.find({ assignedTo: userToMerge._id });
      console.log(`   • Found ${assignedTasks.length} assigned tasks to transfer`);
      
      if (assignedTasks.length > 0) {
        await Task.updateMany(
          { assignedTo: userToMerge._id },
          { assignedTo: primaryUser._id }
        );
        console.log(`   ✅ Transferred ${assignedTasks.length} task assignments`);
      }
      
      // 3. Transfer created tasks
      const createdTasks = await Task.find({ createdBy: userToMerge._id });
      console.log(`   • Found ${createdTasks.length} created tasks to transfer`);
      
      if (createdTasks.length > 0) {
        await Task.updateMany(
          { createdBy: userToMerge._id },
          { createdBy: primaryUser._id }
        );
        console.log(`   ✅ Transferred ${createdTasks.length} created tasks`);
      }
      
      // 4. Merge roles (if primary user doesn't have them)
      if (userToMerge.roles && userToMerge.roles.length > 0) {
        const existingRoleIds = (primaryUser.roles || []).map(r => r._id?.toString() || r.toString());
        const newRoles = userToMerge.roles.filter(role => {
          const roleId = role._id?.toString() || role.toString();
          return !existingRoleIds.includes(roleId);
        });
        
        if (newRoles.length > 0) {
          primaryUser.roles = [...(primaryUser.roles || []), ...newRoles];
          await primaryUser.save();
          console.log(`   ✅ Added ${newRoles.length} new roles to primary user`);
        }
      }
      
      // 5. Merge other user data if primary user is missing it
      let primaryUserUpdated = false;
      
      if (!primaryUser.department && userToMerge.department) {
        primaryUser.department = userToMerge.department;
        primaryUserUpdated = true;
      }
      
      if (!primaryUser.position && userToMerge.position) {
        primaryUser.position = userToMerge.position;
        primaryUserUpdated = true;
      }
      
      if (!primaryUser.avatar && userToMerge.avatar) {
        primaryUser.avatar = userToMerge.avatar;
        primaryUserUpdated = true;
      }
      
      if (primaryUserUpdated) {
        await primaryUser.save();
        console.log(`   ✅ Updated primary user with missing data`);
      }
      
      // 6. Delete the duplicate user
      await User.findByIdAndDelete(userToMerge._id);
      console.log(`   ✅ Deleted duplicate user ${userToMerge._id}\n`);
    }
    
    // Final verification
    console.log('🔍 FINAL VERIFICATION:\n');
    
    const finalUsers = await User.find({ email: targetEmail }).populate('roles');
    console.log(`Users with email ${targetEmail}: ${finalUsers.length}`);
    
    if (finalUsers.length === 1) {
      const user = finalUsers[0];
      const notifications = await Notification.countDocuments({ recipient: user._id });
      const assignedTasks = await Task.countDocuments({ assignedTo: user._id });
      const createdTasks = await Task.countDocuments({ createdBy: user._id });
      
      console.log(`✅ CONSOLIDATED USER:`);
      console.log(`   • ID: ${user._id}`);
      console.log(`   • Name: ${user.firstName} ${user.lastName}`);
      console.log(`   • Email: ${user.email}`);
      console.log(`   • Roles: ${user.roles?.map(r => r.name || r).join(', ') || 'None'}`);
      console.log(`   • Notifications: ${notifications}`);
      console.log(`   • Assigned Tasks: ${assignedTasks}`);
      console.log(`   • Created Tasks: ${createdTasks}`);
      console.log(`   • Department: ${user.department}`);
      console.log(`   • Position: ${user.position}`);
      console.log(`   • Active: ${user.isActive}`);
    }
    
    console.log('\n🎉 User consolidation completed successfully!');
    console.log('   The user should now be able to log in and see their notifications and tasks.');
    
  } catch (error) {
    console.error('❌ Error fixing duplicate users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database disconnected');
  }
}

fixDuplicateUsers();

