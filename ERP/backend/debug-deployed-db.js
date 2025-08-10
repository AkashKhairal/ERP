const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const Employee = require('./src/models/Employee');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n=== DATABASE DIAGNOSTIC ===');
    
    // 1. Count documents
    const userCount = await User.countDocuments();
    const employeeCount = await Employee.countDocuments();
    const roleCount = await Role.countDocuments();
    
    console.log('\nDocument Counts:');
    console.log(`Users: ${userCount}`);
    console.log(`Employees: ${employeeCount}`);
    console.log(`Roles: ${roleCount}`);
    
    // 2. Check admin user
    const adminUser = await User.findOne({ email: 'admin@company.com' }).populate('roles');
    console.log('\nAdmin User:');
    if (adminUser) {
      console.log(`Email: ${adminUser.email}`);
      console.log(`Status: ${adminUser.status}`);
      console.log(`Roles count: ${adminUser.roles ? adminUser.roles.length : 0}`);
      if (adminUser.roles && adminUser.roles.length > 0) {
        adminUser.roles.forEach(role => {
          console.log(`  - Role: ${role.name} (${role.permissions.length} permissions)`);
        });
      }
    } else {
      console.log('Admin user NOT FOUND');
    }
    
    // 3. List all users
    const allUsers = await User.find({}, 'email firstName lastName status roles').populate('roles', 'name');
    console.log('\nAll Users:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - Status: ${user.status}`);
      if (user.roles && user.roles.length > 0) {
        console.log(`   Roles: ${user.roles.map(r => r.name).join(', ')}`);
      }
    });
    
    // 4. Check employees
    const employees = await Employee.find({}).populate('user', 'email firstName lastName');
    console.log('\nEmployees:');
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.employeeId} - ${emp.user.firstName} ${emp.user.lastName} (${emp.user.email})`);
    });
    
    // 5. Check roles
    const roles = await Role.find({});
    console.log('\nRoles:');
    roles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name} - ${role.permissions.length} permissions`);
    });
    
    console.log('\n=== END DIAGNOSTIC ===');
    
  } catch (error) {
    console.error('Error during diagnostic:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

debugDatabase();
