const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const bcrypt = require('bcryptjs');

// MongoDB Atlas URI (your remote database) - properly encoded
const MONGODB_URI = 'mongodb+srv://akashkhairal:Khairal%4012345!@cluster0.rdgxy4m.mongodb.net/CreatorBase?retryWrites=true&w=majority&appName=Cluster0';

const createAdminAtlas = async () => {
  try {
    console.log('🔍 Connecting to MongoDB Atlas (Remote Database)...');
    console.log('MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
    
    // Connect to MongoDB Atlas (remote database)
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas (Remote Database)');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@company.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists in Atlas database');
      console.log(`  📧 Email: ${existingAdmin.email}`);
      console.log(`  👤 Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`  ✅ Active: ${existingAdmin.isActive}`);
      
      // Check if admin has password
      const adminWithPassword = await User.findOne({ email: 'admin@company.com' }).select('+password');
      if (adminWithPassword && adminWithPassword.password) {
        console.log('  🔑 Has password: Yes');
        
        // Test the password
        const isPasswordCorrect = await adminWithPassword.comparePassword('Password123!');
        console.log(`  🔐 Password test: ${isPasswordCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
        
        if (!isPasswordCorrect) {
          console.log('\n🔄 Updating admin password...');
          const newPassword = 'Password123!';
          const saltRounds = 12;
          const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
          
          adminWithPassword.password = hashedPassword;
          await adminWithPassword.save();
          console.log('✅ Admin password updated successfully!');
        }
      } else {
        console.log('  🔑 Has password: No - creating password...');
        
        // Create password for admin
        const newPassword = 'Password123!';
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        console.log('✅ Admin password created successfully!');
      }
    } else {
      console.log('❌ Admin user not found in Atlas database - creating new admin...');
      
      // Get admin role
      const adminRole = await Role.findOne({ name: 'Admin' });
      if (!adminRole) {
        console.log('❌ Admin role not found - creating admin role...');
        
        // Create admin role if it doesn't exist
        const newAdminRole = new Role({
          name: 'Admin',
          description: 'Administrator role with full access',
          permissions: [
            { module: 'users', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'teams', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'employees', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'attendance', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'leaves', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'payroll', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'projects', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'tasks', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'sprints', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'finance', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'analytics', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'content', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
            { module: 'integrations', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] }
          ],
          isDefault: false
        });
        
        await newAdminRole.save();
        console.log('✅ Admin role created successfully!');
      }
      
      // Create admin user
      const newPassword = 'Password123!';
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@company.com',
        password: hashedPassword,
        roles: [adminRole ? adminRole._id : newAdminRole._id],
        department: 'operations',
        position: 'System Administrator',
        isActive: true,
        hireDate: new Date()
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully in Atlas database!');
      console.log(`  📧 Email: ${adminUser.email}`);
      console.log(`  👤 Name: ${adminUser.firstName} ${adminUser.lastName}`);
      console.log(`  ✅ Active: ${adminUser.isActive}`);
      console.log(`  🔑 Password: ${newPassword}`);
    }

    // Test the admin login
    console.log('\n🧪 Testing admin login...');
    const testAdmin = await User.findOne({ email: 'admin@company.com' }).select('+password');
    const isPasswordCorrect = await testAdmin.comparePassword('Password123!');
    
    if (isPasswordCorrect) {
      console.log('✅ Admin login test successful!');
      console.log('\n🎯 Admin login should now work with:');
      console.log(`  Email: admin@company.com`);
      console.log(`  Password: Password123!`);
      console.log('\n🌐 You can now login at: https://erp-frontend-new.vercel.app');
    } else {
      console.log('❌ Admin login test failed!');
    }

  } catch (error) {
    console.error('❌ Error creating admin in Atlas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
};

createAdminAtlas();
