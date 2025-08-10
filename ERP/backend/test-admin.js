const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const testAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@erp.com' });
    if (!admin) {
      console.log('❌ Admin user not found. Please run the seed script first.');
      process.exit(1);
    }

    console.log('✅ CreatorBase admin user found:', {
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      isActive: admin.isActive,
      permissionsCount: admin.permissions?.length || 0
    });

    // Get default admin permissions
    const defaultAdminPermissions = User.getDefaultPermissions('admin');
    console.log('📋 Default admin permissions:', defaultAdminPermissions);

    // Check if admin has all required permissions
    const requiredModules = ['users', 'teams', 'projects', 'finance', 'analytics', 'content', 'integrations'];
    const requiredActions = ['create', 'read', 'update', 'delete', 'approve'];

    let needsUpdate = false;
    const missingPermissions = [];

    for (const module of requiredModules) {
      const hasModule = admin.permissions.some(p => p.module === module);
      if (!hasModule) {
        missingPermissions.push(`Missing module: ${module}`);
        needsUpdate = true;
      } else {
        const modulePermission = admin.permissions.find(p => p.module === module);
        for (const action of requiredActions) {
          if (!modulePermission.actions.includes(action)) {
            missingPermissions.push(`Missing ${action} permission for ${module}`);
            needsUpdate = true;
          }
        }
      }
    }

    if (needsUpdate) {
      console.log('⚠️  Admin user is missing some permissions:');
      missingPermissions.forEach(permission => console.log(`   - ${permission}`));
      
      // Update admin permissions
      admin.permissions = defaultAdminPermissions;
      await admin.save();

      console.log('✅ CreatorBase admin permissions updated successfully!');
    } else {
      console.log('✅ CreatorBase admin user already has all required permissions!');
    }

    // Test permission methods
    console.log('\n🧪 Testing permission methods:');
    
    const testModules = ['finance', 'analytics', 'content'];
    const testActions = ['read', 'create', 'update', 'delete'];
    
    for (const module of testModules) {
      for (const action of testActions) {
        const hasPermission = admin.hasPermission(module, action);
        const hasAccess = admin.hasModuleAccess(module);
        console.log(`   ${module}.${action}: ${hasPermission ? '✅' : '❌'} (module access: ${hasAccess ? '✅' : '❌'})`);
      }
    }

    console.log('\n🎉 CreatorBase admin user is now properly configured!');
    console.log('📧 Email: admin@erp.com');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing CreatorBase admin permissions:', error);
    process.exit(1);
  }
};

testAdminUser(); 