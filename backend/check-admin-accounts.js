const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
require('dotenv').config();

const checkAdminAccounts = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Check for admin users by email
    const adminUsers = await User.find({
      email: { $in: ['admin@erp.com', 'admin@company.com'] }
    }).populate('roles');

    console.log('\n🔍 Admin Account Check Results:');
    console.log('================================');

    if (adminUsers.length === 0) {
      console.log('❌ No admin accounts found!');
      console.log('\n📋 Expected admin emails:');
      console.log('  - admin@erp.com');
      console.log('  - admin@company.com');
      
      console.log('\n🚀 To create an admin account, run:');
      console.log('  node seed.js');
      console.log('  or');
      console.log('  node initialize-users.js');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin account(s):`);
      
      adminUsers.forEach((user, index) => {
        console.log(`\n👤 Admin User ${index + 1}:`);
        console.log(`  📧 Email: ${user.email}`);
        console.log(`  👤 Name: ${user.firstName} ${user.lastName}`);
        console.log(`  🏢 Department: ${user.department}`);
        console.log(`  💼 Position: ${user.position}`);
        console.log(`  ✅ Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log(`  🔑 Roles: ${user.roles.map(role => role.name).join(', ')}`);
        console.log(`  📅 Hire Date: ${user.hireDate ? user.hireDate.toLocaleDateString() : 'Not set'}`);
        console.log(`  🕒 Last Login: ${user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}`);
      });
    }

    // Check for Admin role
    const adminRole = await Role.findOne({ name: 'Admin' });
    if (adminRole) {
      console.log('\n🎭 Admin Role Found:');
      console.log(`  📝 Name: ${adminRole.name}`);
      console.log(`  📄 Description: ${adminRole.description}`);
      console.log(`  🔐 Permissions: ${adminRole.permissions ? adminRole.permissions.length : 0} permissions`);
    } else {
      console.log('\n❌ Admin role not found!');
      console.log('🚀 To create admin role, run:');
      console.log('  node initialize-roles.js');
    }

    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total Users in Database: ${totalUsers}`);

    // Check for users with admin roles
    const usersWithAdminRole = await User.find({
      roles: adminRole ? adminRole._id : null
    }).populate('roles');

    if (usersWithAdminRole.length > 0) {
      console.log(`\n👑 Users with Admin Role: ${usersWithAdminRole.length}`);
      usersWithAdminRole.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }

    console.log('\n🎯 Summary:');
    if (adminUsers.length > 0) {
      console.log('✅ Admin accounts exist and are ready to use');
      console.log('🔑 Default password is likely: password123 or Password123!');
    } else {
      console.log('❌ No admin accounts found - need to create one');
    }

  } catch (error) {
    console.error('❌ Error checking admin accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkAdminAccounts();
