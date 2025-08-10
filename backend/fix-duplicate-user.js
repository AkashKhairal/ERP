const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Notification = require('./src/models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

async function fixDuplicateUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔧 Fixing Duplicate User Issue\n');
    
    // Find all users with akashkhairal@gmail.com
    const allAkashUsers = await User.find({ email: 'akashkhairal@gmail.com' }).sort({ createdAt: 1 });
    console.log(`📊 Found ${allAkashUsers.length} users with email akashkhairal@gmail.com`);
    
    if (allAkashUsers.length <= 1) {
      console.log('✅ No duplicate users found');
      return;
    }
    
    // The first user (oldest) should be the correct one with notifications
    const originalUser = allAkashUsers[0];
    const duplicateUsers = allAkashUsers.slice(1);
    
    console.log(`👤 Original user (keeping): ${originalUser._id}`);
    console.log(`   • Created: ${originalUser.createdAt}`);
    console.log(`   • Role: ${originalUser.role || 'Not set'}`);
    
    console.log(`\n🗑️  Duplicate users (will remove):`);
    duplicateUsers.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user._id} (Created: ${user.createdAt})`);
    });
    
    // Check notifications for original user
    const originalNotifications = await Notification.find({ 
      recipient: originalUser._id,
      isActive: true 
    });
    console.log(`\n🔔 Original user has ${originalNotifications.length} notifications`);
    
    // Check if any duplicate users have notifications (they shouldn't, but let's check)
    for (const dupUser of duplicateUsers) {
      const dupNotifications = await Notification.find({ 
        recipient: dupUser._id,
        isActive: true 
      });
      
      if (dupNotifications.length > 0) {
        console.log(`⚠️  Duplicate user ${dupUser._id} has ${dupNotifications.length} notifications - transferring to original user`);
        
        // Transfer notifications to original user
        await Notification.updateMany(
          { recipient: dupUser._id },
          { recipient: originalUser._id }
        );
        console.log(`✅ Transferred ${dupNotifications.length} notifications`);
      }
    }
    
    // Update the original user with the best available information
    console.log(`\n🔄 Updating original user with complete information...`);
    
    // Merge information from all duplicates
    let updateData = {};
    
    for (const user of allAkashUsers) {
      if (user.googleId && !updateData.googleId) updateData.googleId = user.googleId;
      if (user.avatar && !updateData.avatar) updateData.avatar = user.avatar;
      if (user.role && !updateData.role) updateData.role = user.role;
      if (user.roles && user.roles.length > 0 && !updateData.roles) updateData.roles = user.roles;
    }
    
    // Ensure user has Employee role
    if (!updateData.role) {
      const Role = require('./src/models/Role');
      const employeeRole = await Role.findOne({ name: 'Employee' });
      if (employeeRole) {
        updateData.role = 'Employee';
        updateData.roles = [employeeRole._id];
      }
    }
    
    updateData.isActive = true;
    updateData.lastLogin = new Date();
    
    await User.findByIdAndUpdate(originalUser._id, updateData);
    console.log(`✅ Updated original user with:`, updateData);
    
    // Delete duplicate users
    console.log(`\n🗑️  Deleting duplicate users...`);
    for (const dupUser of duplicateUsers) {
      await User.findByIdAndDelete(dupUser._id);
      console.log(`✅ Deleted duplicate user: ${dupUser._id}`);
    }
    
    // Final verification
    const finalUser = await User.findById(originalUser._id).populate('roles');
    console.log(`\n✅ Final user state:`);
    console.log(`   • ID: ${finalUser._id}`);
    console.log(`   • Email: ${finalUser.email}`);
    console.log(`   • Role: ${finalUser.role}`);
    console.log(`   • Roles: ${finalUser.roles.map(r => r.name).join(', ')}`);
    console.log(`   • Google ID: ${finalUser.googleId || 'Not set'}`);
    console.log(`   • Active: ${finalUser.isActive}`);
    
    const finalNotifications = await Notification.countDocuments({ 
      recipient: finalUser._id,
      isActive: true 
    });
    console.log(`   • Notifications: ${finalNotifications}`);
    
    console.log(`\n🎉 Duplicate user issue fixed! User should now be able to see notifications.`);
    
  } catch (error) {
    console.error('❌ Error fixing duplicate user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database disconnected');
  }
}

fixDuplicateUser();

