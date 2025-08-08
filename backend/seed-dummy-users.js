const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dummyUsers = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    password: 'password123',
    department: 'engineering',
    position: 'Senior Software Engineer',
    isActive: true,
    phone: '+15551234567',
    hireDate: new Date('2023-01-15'),
    lastLogin: new Date('2024-01-15T10:30:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random'
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@company.com',
    password: 'password123',
    department: 'marketing',
    position: 'Marketing Manager',
    isActive: true,
    phone: '+15552345678',
    hireDate: new Date('2023-02-20'),
    lastLogin: new Date('2024-01-14T14:20:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=random'
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@company.com',
    password: 'password123',
    department: 'hr',
    position: 'HR Specialist',
    isActive: true,
    phone: '+15553456789',
    hireDate: new Date('2023-03-10'),
    lastLogin: new Date('2024-01-15T09:15:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=random'
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@company.com',
    password: 'password123',
    department: 'marketing',
    position: 'Sales Representative',
    isActive: true,
    phone: '+15554567890',
    hireDate: new Date('2023-04-05'),
    lastLogin: new Date('2024-01-13T16:45:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=David+Wilson&background=random'
  },
  {
    firstName: 'Lisa',
    lastName: 'Brown',
    email: 'lisa.brown@company.com',
    password: 'password123',
    department: 'finance',
    position: 'Financial Analyst',
    isActive: true,
    phone: '+1 (555) 567-8901',
    hireDate: new Date('2023-05-12'),
    lastLogin: new Date('2024-01-15T11:30:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Lisa+Brown&background=random'
  },
  {
    firstName: 'James',
    lastName: 'Taylor',
    email: 'james.taylor@company.com',
    password: 'password123',
    department: 'engineering',
    position: 'Frontend Developer',
    isActive: true,
    phone: '+1 (555) 678-9012',
    hireDate: new Date('2023-06-18'),
    lastLogin: new Date('2024-01-14T13:20:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=James+Taylor&background=random'
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@company.com',
    password: 'password123',
    department: 'operations',
    position: 'Operations Coordinator',
    isActive: false,
    phone: '+1 (555) 789-0123',
    hireDate: new Date('2023-07-22'),
    lastLogin: new Date('2024-01-10T08:45:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=random'
  },
  {
    firstName: 'Robert',
    lastName: 'Anderson',
    email: 'robert.anderson@company.com',
    password: 'password123',
    department: 'engineering',
    position: 'Backend Developer',
    isActive: true,
    phone: '+1 (555) 890-1234',
    hireDate: new Date('2023-08-30'),
    lastLogin: new Date('2024-01-15T15:10:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Robert+Anderson&background=random'
  },
  {
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jennifer.martinez@company.com',
    password: 'password123',
    department: 'marketing',
    position: 'Content Creator',
    isActive: true,
    phone: '+1 (555) 901-2345',
    hireDate: new Date('2023-09-14'),
    lastLogin: new Date('2024-01-15T12:00:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Jennifer+Martinez&background=random'
  },
  {
    firstName: 'Thomas',
    lastName: 'Lee',
    email: 'thomas.lee@company.com',
    password: 'password123',
    department: 'marketing',
    position: 'Sales Manager',
    isActive: true,
    phone: '+1 (555) 012-3456',
    hireDate: new Date('2023-10-08'),
    lastLogin: new Date('2024-01-14T17:30:00Z'),
    avatar: 'https://ui-avatars.com/api/?name=Thomas+Lee&background=random'
  }
];

const seedDummyUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // Get available roles
    const roles = await Role.find({});
    console.log(`Found ${roles.length} roles in the system`);

    if (roles.length === 0) {
      console.error('No roles found. Please run initialize-roles.js first.');
      process.exit(1);
    }

    // Get default roles for assignment
    const employeeRole = roles.find(r => r.name === 'Employee');
    const managerRole = roles.find(r => r.name === 'HR Manager');
    const techLeadRole = roles.find(r => r.name === 'Tech Lead');
    const contentManagerRole = roles.find(r => r.name === 'Content Manager');
    const financeManagerRole = roles.find(r => r.name === 'Finance Manager');

    // Assign roles based on position
    const usersWithRoles = dummyUsers.map((user, index) => {
      let assignedRoles = [];
      
      // Assign roles based on position/department
      if (user.position.includes('Manager')) {
        if (user.department === 'hr') assignedRoles = [managerRole?._id];
        else if (user.department === 'finance') assignedRoles = [financeManagerRole?._id];
        else if (user.department === 'marketing') assignedRoles = [contentManagerRole?._id];
        else assignedRoles = [employeeRole?._id];
      } else if (user.position.includes('Developer') || user.position.includes('Engineer')) {
        assignedRoles = [techLeadRole?._id];
      } else {
        assignedRoles = [employeeRole?._id];
      }

      // Filter out undefined roles
      assignedRoles = assignedRoles.filter(role => role);

      return {
        ...user,
        roles: assignedRoles
      };
    });

    // Check for existing users to avoid duplicates
    const existingEmails = await User.find({ 
      email: { $in: dummyUsers.map(u => u.email) } 
    }).select('email');
    
    const existingEmailSet = new Set(existingEmails.map(u => u.email));
    const newUsers = usersWithRoles.filter(user => !existingEmailSet.has(user.email));

    if (newUsers.length === 0) {
      console.log('All dummy users already exist in the database.');
      process.exit(0);
    }

    console.log(`Creating ${newUsers.length} new users...`);

    // Create users
    const createdUsers = [];
    for (const userData of newUsers) {
      try {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Created ${createdUsers.length} new users`);
    console.log(`📋 Total users in system: ${await User.countDocuments()}`);
    
    console.log('\n👥 Created Users:');
    createdUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`    Department: ${user.department}, Position: ${user.position}`);
      console.log(`    Status: ${user.isActive ? 'Active' : 'Inactive'}`);
      console.log(`    Roles: ${user.roles.length > 0 ? user.roles.join(', ') : 'None'}`);
      console.log('');
    });

    console.log('🎉 Dummy users seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding dummy users:', error);
    process.exit(1);
  }
};

seedDummyUsers(); 