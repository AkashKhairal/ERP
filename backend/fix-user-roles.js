const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Role = require('./src/models/Role');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase-erp';

async function fixUserRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔧 Fixing User Roles and Permissions\n');
    
    // Find Akash Khairal
    const akashUser = await User.findOne({ email: 'akashkhairal@gmail.com' });
    if (!akashUser) {
      console.log('❌ Akash Khairal user not found');
      return;
    }
    
    console.log(`👤 Found user: ${akashUser.firstName} ${akashUser.lastName}`);
    console.log(`📧 Email: ${akashUser.email}`);
    console.log(`🔑 Current role: ${akashUser.role || 'Not set'}`);
    console.log(`📋 Current roles array: ${JSON.stringify(akashUser.roles || [])}`);
    
    // Check what roles exist in the system
    const availableRoles = await Role.find({});
    console.log(`\n📊 Available roles in system: ${availableRoles.length}`);
    availableRoles.forEach(role => {
      console.log(`   • ${role.name} (${role._id})`);
    });
    
    // Find or create a basic employee/user role
    let userRole = await Role.findOne({ name: { $in: ['employee', 'user', 'Employee', 'User'] } });
    
    if (!userRole) {
      console.log('\n🆕 Creating basic Employee role...');
      userRole = new Role({
        name: 'Employee',
        description: 'Basic employee with standard access',
        permissions: [
          'read:tasks',
          'create:tasks', 
          'update:tasks',
          'read:projects',
          'read:users',
          'read:notifications',
          'create:notifications',
          'update:notifications'
        ],
        isActive: true
      });
      await userRole.save();
      console.log(`✅ Created Employee role: ${userRole._id}`);
    } else {
      console.log(`\n✅ Found existing role: ${userRole.name} (${userRole._id})`);
    }
    
    // Update Akash's user record
    console.log(`\n🔄 Updating Akash's user roles...`);
    
    // Set both role (string) and roles (array) for compatibility
    akashUser.role = userRole.name;
    akashUser.roles = [userRole._id];
    akashUser.isActive = true; // Ensure user is active
    
    await akashUser.save();
    
    console.log(`✅ Updated user successfully!`);
    console.log(`   • New role: ${akashUser.role}`);
    console.log(`   • New roles array: ${JSON.stringify(akashUser.roles)}`);
    console.log(`   • Active: ${akashUser.isActive}`);
    
    // Verify the update worked
    const updatedUser = await User.findOne({ email: 'akashkhairal@gmail.com' }).populate('roles');
    console.log(`\n🔍 Verification - Updated user:`);
    console.log(`   • Role: ${updatedUser.role}`);
    console.log(`   • Roles: ${updatedUser.roles.map(r => r.name).join(', ')}`);
    console.log(`   • Permissions: ${updatedUser.roles.flatMap(r => r.permissions).join(', ')}`);
    
    console.log(`\n✅ User role fix completed! Akash should now have proper access.`);
    
  } catch (error) {
    console.error('❌ Error fixing user roles:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Database disconnected');
  }
}

fixUserRoles();
