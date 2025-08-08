const mongoose = require('mongoose');
const Role = require('./src/models/Role');
require('dotenv').config();

const initializeRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // Get default roles from the model
    const defaultRoles = Role.getDefaultRoles();
    
    const createdRoles = [];
    const updatedRoles = [];
    
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role({
          ...roleData,
          createdBy: null // Will be updated when admin user is created
        });
        await role.save();
        createdRoles.push(role);
        console.log(`✅ Created role: ${role.name}`);
      } else {
        // Update existing role with new permissions if needed
        const needsUpdate = JSON.stringify(existingRole.permissions) !== JSON.stringify(roleData.permissions);
        if (needsUpdate) {
          existingRole.permissions = roleData.permissions;
          existingRole.description = roleData.description;
          await existingRole.save();
          updatedRoles.push(existingRole);
          console.log(`🔄 Updated role: ${existingRole.name}`);
        } else {
          console.log(`⏭️  Role already exists: ${existingRole.name}`);
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Created ${createdRoles.length} new roles`);
    console.log(`🔄 Updated ${updatedRoles.length} existing roles`);
    console.log(`📋 Total roles in system: ${await Role.countDocuments()}`);
    
    // List all roles
    const allRoles = await Role.find().sort({ name: 1 });
    console.log('\n📋 All Roles:');
    allRoles.forEach(role => {
      console.log(`  • ${role.name}: ${role.description}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing roles:', error);
    process.exit(1);
  }
};

initializeRoles(); 