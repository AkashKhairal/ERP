const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Real users data
const realUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    password: 'Password123!',
    department: 'engineering',
    position: 'System Administrator',
    isActive: true,
    phone: '+15550000000',
    hireDate: new Date('2023-01-01'),
    lastLogin: new Date('2024-01-15T10:30:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=random'
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    password: 'Password123!',
    department: 'engineering',
    position: 'Senior Software Engineer',
    isActive: true,
    phone: '+15551234567',
    hireDate: new Date('2023-01-15'),
    lastLogin: new Date('2024-01-15T10:30:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    password: 'Password123!',
    department: 'marketing',
    position: 'Marketing Manager',
    isActive: true,
    phone: '+15552345678',
    hireDate: new Date('2023-02-01'),
    lastLogin: new Date('2024-01-14T15:45:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random'
  },
  {
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@company.com',
    password: 'Password123!',
    department: 'marketing',
    position: 'Sales Representative',
    isActive: false,
    phone: '+15553456789',
    hireDate: new Date('2023-03-10'),
    lastLogin: new Date('2024-01-10T09:15:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=random'
  },
  {
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@company.com',
    password: 'Password123!',
    department: 'content',
    position: 'Design Lead',
    isActive: true,
    phone: '+15554567890',
    hireDate: new Date('2023-04-05'),
    lastLogin: new Date('2024-01-15T14:20:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=random'
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@company.com',
    password: 'Password123!',
    department: 'engineering',
    position: 'Frontend Developer',
    isActive: true,
    phone: '+15555678901',
    hireDate: new Date('2023-05-20'),
    lastLogin: new Date('2024-01-15T11:20:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=random'
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@company.com',
    password: 'Password123!',
    department: 'hr',
    position: 'HR Specialist',
    isActive: true,
    phone: '+15556789012',
    hireDate: new Date('2023-06-12'),
    lastLogin: new Date('2024-01-14T16:30:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=random'
  },
  {
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@company.com',
    password: 'Password123!',
    department: 'finance',
    position: 'Financial Analyst',
    isActive: true,
    phone: '+15557890123',
    hireDate: new Date('2023-07-08'),
    lastLogin: new Date('2024-01-15T09:45:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=David+Miller&background=random'
  },
  {
    firstName: 'Lisa',
    lastName: 'Garcia',
    email: 'lisa.garcia@company.com',
    password: 'Password123!',
    department: 'content',
    position: 'Content Creator',
    isActive: true,
    phone: '+15558901234',
    hireDate: new Date('2023-08-15'),
    lastLogin: new Date('2024-01-15T13:15:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Lisa+Garcia&background=random'
  },
  {
    firstName: 'James',
    lastName: 'Taylor',
    email: 'james.taylor@company.com',
    password: 'Password123!',
    department: 'operations',
    position: 'Operations Manager',
    isActive: true,
    phone: '+15559012345',
    hireDate: new Date('2023-09-22'),
    lastLogin: new Date('2024-01-14T17:00:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=James+Taylor&background=random'
  },
  {
    firstName: 'Amanda',
    lastName: 'Anderson',
    email: 'amanda.anderson@company.com',
    password: 'Password123!',
    department: 'engineering',
    position: 'Backend Developer',
    isActive: true,
    phone: '+15550123456',
    hireDate: new Date('2023-10-30'),
    lastLogin: new Date('2024-01-15T08:30:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Amanda+Anderson&background=random'
  }
];

const initializeUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing users (except admin)
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} existing users`);

    // Get or create default roles
    let employeeRole = await Role.findOne({ name: 'Employee' });
    let managerRole = await Role.findOne({ name: 'Manager' });
    let adminRole = await Role.findOne({ name: 'Admin' });

    if (!employeeRole) {
      employeeRole = new Role({
        name: 'Employee',
        description: 'Standard employee with basic access',
        isDefault: true,
        permissions: [
          { module: 'projects', actions: ['read'] },
          { module: 'tasks', actions: ['read', 'update'] },
          { module: 'teams', actions: ['read'] },
          { module: 'attendance', actions: ['create', 'read', 'update'] },
          { module: 'leaves', actions: ['create', 'read'] }
        ]
      });
      await employeeRole.save();
      console.log('Created Employee role');
    }

    if (!managerRole) {
      managerRole = new Role({
        name: 'Manager',
        description: 'Manager with team and project oversight',
        isDefault: true,
        permissions: [
          { module: 'users', actions: ['read', 'update'] },
          { module: 'teams', actions: ['create', 'read', 'update'] },
          { module: 'projects', actions: ['create', 'read', 'update'] },
          { module: 'tasks', actions: ['create', 'read', 'update', 'delete'] },
          { module: 'sprints', actions: ['create', 'read', 'update'] },
          { module: 'attendance', actions: ['create', 'read', 'update', 'approve'] },
          { module: 'leaves', actions: ['create', 'read', 'update', 'approve'] }
        ]
      });
      await managerRole.save();
      console.log('Created Manager role');
    }

    if (!adminRole) {
      adminRole = new Role({
        name: 'Admin',
        description: 'Full access to all modules and settings',
        isDefault: true,
        permissions: [
          { module: 'users', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'teams', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'projects', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'tasks', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'sprints', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'attendance', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'leaves', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'payroll', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'finance', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'analytics', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'content', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
          { module: 'integrations', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] }
        ]
      });
      await adminRole.save();
      console.log('Created Admin role');
    }

    // Create users with appropriate roles
    const createdUsers = [];
    for (const userData of realUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Assign roles based on position
      let roles = [employeeRole._id];
      if (userData.position.toLowerCase().includes('manager') || userData.position.toLowerCase().includes('lead')) {
        roles = [managerRole._id];
      } else if (userData.position.toLowerCase().includes('admin') || userData.position.toLowerCase().includes('administrator')) {
        roles = [adminRole._id];
      }

      const user = new User({
        ...userData,
        roles: roles
      });

      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.firstName} ${user.lastName} (${user.email})`);
    }

    console.log(`\n✅ Successfully initialized ${createdUsers.length} users`);
    console.log('\n📋 User Summary:');
    createdUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.position}`);
    });

    console.log('\n🔑 Default password for all users: Password123!');
    console.log('\n🎯 Next steps:');
    console.log('  1. Users can now log in with their email and the default password');
    console.log('  2. Users should change their password on first login');
    console.log('  3. Admin users can manage roles and permissions');
    console.log('\n👑 Admin User:');
    console.log('  - Email: admin@company.com');
    console.log('  - Password: Password123!');

  } catch (error) {
    console.error('Error initializing users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the initialization
if (require.main === module) {
  initializeUsers();
}

module.exports = { initializeUsers }; 