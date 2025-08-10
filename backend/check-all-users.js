const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
require('dotenv').config();

const checkAllUsers = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Get all users
    const allUsers = await User.find({}).populate('roles');
    
    console.log('\n🔍 All Users in Database:');
    console.log('========================');
    console.log(`Total Users: ${allUsers.length}\n`);

    allUsers.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`);
      console.log(`  📧 Email: ${user.email}`);
      console.log(`  👤 Name: ${user.firstName} ${user.lastName}`);
      console.log(`  🏢 Department: ${user.department}`);
      console.log(`  💼 Position: ${user.position}`);
      console.log(`  ✅ Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`  🔑 Roles: ${user.roles.map(role => role.name).join(', ')}`);
      console.log(`  📅 Hire Date: ${user.hireDate ? user.hireDate.toLocaleDateString() : 'Not set'}`);
      console.log(`  🕒 Last Login: ${user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}`);
      console.log('');
    });

    // Check for admin users specifically
    const adminUsers = allUsers.filter(user => 
      user.roles.some(role => role.name === 'Admin') || 
      user.email.includes('admin')
    );

    if (adminUsers.length > 0) {
      console.log('👑 Admin Users Found:');
      adminUsers.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
      });
    } else {
      console.log('❌ No admin users found!');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkAllUsers();
