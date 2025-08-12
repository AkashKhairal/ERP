const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const Project = require('./src/models/Project');
const Team = require('./src/models/Team');
const Task = require('./src/models/Task');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_system');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleRoles = [
  {
    name: 'Admin',
    description: 'Full system administrator with all permissions',
    permissions: [
      { module: 'users', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'teams', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'employees', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'projects', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'tasks', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'sprints', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'finance', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'analytics', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'content', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'integrations', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'attendance', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'leaves', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] },
      { module: 'payroll', actions: ['create', 'read', 'update', 'delete', 'approve', 'export'] }
    ],
    isActive: true,
    isSystem: true,
    priority: 1,
    color: '#dc2626'
  },
  {
    name: 'Project Manager',
    description: 'Manages projects and teams, oversees task execution',
    permissions: [
      { module: 'projects', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { module: 'teams', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'tasks', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { module: 'sprints', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'users', actions: ['read'] },
      { module: 'analytics', actions: ['read'] }
    ],
    isActive: true,
    isSystem: false,
    priority: 2,
    color: '#2563eb'
  },
  {
    name: 'Team Lead',
    description: 'Leads development teams and manages task execution',
    permissions: [
      { module: 'teams', actions: ['read', 'update'] },
      { module: 'tasks', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'projects', actions: ['read'] },
      { module: 'sprints', actions: ['read', 'update'] },
      { module: 'users', actions: ['read'] }
    ],
    isActive: true,
    isSystem: false,
    priority: 3,
    color: '#059669'
  },
  {
    name: 'Developer',
    description: 'Software developer working on assigned tasks',
    permissions: [
      { module: 'tasks', actions: ['read', 'update'] },
      { module: 'projects', actions: ['read'] },
      { module: 'teams', actions: ['read'] },
      { module: 'sprints', actions: ['read'] }
    ],
    isActive: true,
    isSystem: false,
    priority: 4,
    color: '#7c3aed'
  },
  {
    name: 'Analyst',
    description: 'Business analyst with data and reporting access',
    permissions: [
      { module: 'analytics', actions: ['read', 'export'] },
      { module: 'projects', actions: ['read'] },
      { module: 'finance', actions: ['read'] },
      { module: 'content', actions: ['read'] }
    ],
    isActive: true,
    isSystem: false,
    priority: 5,
    color: '#ea580c'
  }
];

const sampleUsers = [
  {
    firstName: 'Akash',
    lastName: 'Khairal',
    email: 'akash.khairal@company.com',
    password: 'Password123!',
    department: 'engineering',
    position: 'Senior Software Engineer',
    phone: '+919876543210',
    bio: 'Experienced full-stack developer with expertise in React, Node.js, and cloud technologies.',
    location: 'Mumbai, India',
    timezone: 'Asia/Kolkata',
    isActive: true,
    roles: [], // Will be populated after roles are created
    customPermissions: []
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@company.com',
    password: 'Password123!',
    department: 'engineering',
    position: 'Project Manager',
    phone: '+919876543211',
    bio: 'Certified PMP with 8+ years of experience managing complex software projects.',
    location: 'Delhi, India',
    timezone: 'Asia/Kolkata',
    isActive: true,
    roles: [],
    customPermissions: []
  },
  {
    firstName: 'Rahul',
    lastName: 'Verma',
    email: 'rahul.verma@company.com',
    password: 'Password123!',
    department: 'engineering',
    position: 'Team Lead',
    phone: '+919876543212',
    bio: 'Technical lead with strong background in system architecture and team management.',
    location: 'Bangalore, India',
    timezone: 'Asia/Kolkata',
    isActive: true,
    roles: [],
    customPermissions: []
  },
  {
    firstName: 'Anjali',
    lastName: 'Patel',
    email: 'anjali.patel@company.com',
    password: 'Password123!',
    department: 'engineering',
    position: 'Frontend Developer',
    phone: '+919876543213',
    bio: 'UI/UX focused developer with expertise in React, TypeScript, and modern CSS.',
    location: 'Pune, India',
    timezone: 'Asia/Kolkata',
    isActive: true,
    roles: [],
    customPermissions: []
  },
  {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@company.com',
    password: 'Password123!',
    department: 'engineering',
    position: 'Backend Developer',
    phone: '+919876543214',
    bio: 'Backend specialist with expertise in Node.js, MongoDB, and microservices architecture.',
    location: 'Chennai, India',
    timezone: 'Asia/Kolkata',
    isActive: true,
    roles: [],
    customPermissions: []
  },
  {
    firstName: 'Meera',
    lastName: 'Joshi',
    email: 'meera.joshi@company.com',
    password: 'Password123!',
    department: 'content',
    position: 'Content Manager',
    phone: '+919876543215',
    bio: 'Creative content strategist with experience in digital marketing and brand management.',
    location: 'Hyderabad, India',
    timezone: 'Asia/Kolkata',
    isActive: true,
    roles: [],
    customPermissions: []
  },
  {
    firstName: 'Arjun',
    lastName: 'Kumar',
    email: 'arjun.kumar@company.com',
    password: 'Password123!',
    department: 'marketing',
    position: 'Marketing Specialist',
    phone: '+919876543216',
    bio: 'Digital marketing expert with focus on growth hacking and customer acquisition.',
    location: 'Kolkata, India',
    timezone: 'Asia/Kolkata',
    isActive: true,
    roles: [],
    customPermissions: []
  },
  {
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@company.com',
    password: 'Password123!',
    department: 'finance',
    position: 'Financial Analyst',
    phone: '+919876543217',
    bio: 'CFA certified analyst with expertise in financial modeling and business intelligence.',
    location: 'Ahmedabad, India',
    timezone: 'Asia/Kolkata',
    isActive: true,
    roles: [],
    customPermissions: []
  },
  {
    firstName: 'Karan',
    lastName: 'Malhotra',
    email: 'karan.malhotra@company.com',
    password: 'Password123!',
    department: 'hr',
    position: 'HR Manager',
    phone: '+919876543218',
    bio: 'HR professional with expertise in talent acquisition and employee development.',
    location: 'Jaipur, India',
    timezone: 'Asia/Kolkata',
    isActive: true,
    roles: [],
    customPermissions: []
  },
  {
    firstName: 'Zara',
    lastName: 'Khan',
    email: 'zara.khan@company.com',
    password: 'Password123!',
    department: 'operations',
    position: 'Operations Manager',
    phone: '+919876543219',
    bio: 'Operations specialist with focus on process optimization and efficiency improvement.',
    location: 'Lucknow, India',
    timezone: 'Asia/Kolkata',
    isActive: true,
    roles: [],
    customPermissions: []
  }
];

const sampleProjects = [
  {
    name: 'ERP System Modernization',
    description: 'Complete overhaul of the existing ERP system with modern technologies and improved user experience',
    type: 'internal',
    status: 'active',
    priority: 'high',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-31'),
    budget: 500000,
    currency: 'INR',
    client: {
      name: 'Internal',
      email: 'internal@company.com',
      phone: '+919876543200'
    },
    projectManager: null, // Will be populated after users are created
    createdBy: null, // Will be populated after users are created
    team: null, // Will be populated after teams are created
    technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
    tags: ['modernization', 'erp', 'full-stack'],
    progress: 65,
    isActive: true
  },
  {
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for field workers with offline capabilities',
    type: 'internal',
    status: 'planning',
    priority: 'medium',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-08-31'),
    budget: 300000,
    currency: 'INR',
    client: {
      name: 'Field Operations Division',
      email: 'fieldops@company.com',
      phone: '+919876543201'
    },
    projectManager: null,
    createdBy: null,
    team: null,
    technologies: ['React Native', 'Firebase', 'Redux'],
    tags: ['mobile', 'offline', 'field-work'],
    progress: 15,
    isActive: true
  },
  {
    name: 'Data Analytics Platform',
    description: 'Business intelligence platform for real-time data analysis and reporting',
    type: 'internal',
    status: 'completed',
    priority: 'high',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-02-28'),
    budget: 400000,
    currency: 'INR',
    client: {
      name: 'Business Intelligence Team',
      email: 'bi@company.com',
      phone: '+919876543202'
    },
    projectManager: null,
    createdBy: null,
    team: null,
    technologies: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
    tags: ['analytics', 'bi', 'real-time', 'reporting'],
    progress: 100,
    isActive: true
  }
];

const sampleTeams = [
  // Teams for ERP System Modernization
  {
    name: 'Frontend Development Team',
    description: 'Responsible for building the modern React-based user interface',
    department: 'engineering',
    project: null, // Will be populated after projects are created
    teamLead: null, // Will be populated after users are created
    createdBy: null, // Will be populated after users are created
    members: [], // Will be populated after users are created
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux'],
    maxMembers: 6,
    status: 'active',
    isActive: true
  },
  {
    name: 'Backend Development Team',
    description: 'Handles server-side logic, APIs, and database operations',
    department: 'engineering',
    project: null,
    teamLead: null,
    createdBy: null,
    members: [],
    skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'JWT'],
    maxMembers: 5,
    status: 'active',
    isActive: true
  },
  {
    name: 'DevOps & Infrastructure Team',
    description: 'Manages deployment, CI/CD, and cloud infrastructure',
    department: 'engineering',
    project: null,
    teamLead: null,
    createdBy: null,
    members: [],
    skills: ['Docker', 'AWS', 'CI/CD', 'Monitoring', 'Security'],
    maxMembers: 3,
    status: 'active',
    isActive: true
  },
  
  // Teams for Mobile App Development
  {
    name: 'Mobile Development Team',
    description: 'Cross-platform mobile app development using React Native',
    department: 'engineering',
    project: null,
    teamLead: null,
    createdBy: null,
    members: [],
    skills: ['React Native', 'JavaScript', 'Mobile UI/UX', 'Offline Storage'],
    maxMembers: 4,
    status: 'active',
    isActive: true
  },
  {
    name: 'Backend Integration Team',
    description: 'Handles backend services and API integration for mobile app',
    department: 'engineering',
    project: null,
    teamLead: null,
    createdBy: null,
    members: [],
    skills: ['Node.js', 'Firebase', 'REST APIs', 'Authentication'],
    maxMembers: 3,
    status: 'active',
    isActive: true
  },
  
  // Teams for Data Analytics Platform
  {
    name: 'Data Engineering Team',
    description: 'Builds data pipelines and ETL processes',
    department: 'engineering',
    project: null,
    teamLead: null,
    createdBy: null,
    members: [],
    skills: ['Python', 'Pandas', 'ETL', 'Data Modeling', 'SQL'],
    maxMembers: 4,
    status: 'active',
    isActive: true
  },
  {
    name: 'Analytics & Visualization Team',
    description: 'Creates dashboards and data visualizations',
    department: 'engineering',
    project: null,
    teamLead: null,
    createdBy: null,
    members: [],
    skills: ['Tableau', 'Power BI', 'D3.js', 'Statistical Analysis'],
    maxMembers: 3,
    status: 'active',
    isActive: true
  }
];

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Role.deleteMany({});
    await Project.deleteMany({});
    await Team.deleteMany({});
    await Task.deleteMany({});
    console.log('✅ Existing data cleared');
    
    // Create roles
    console.log('👥 Creating roles...');
    const createdRoles = await Role.insertMany(sampleRoles);
    console.log(`✅ Created ${createdRoles.length} roles`);
    
    // Map roles for easy access
    const roleMap = {};
    createdRoles.forEach(role => {
      roleMap[role.name] = role._id;
    });
    
    // Assign roles to users
    sampleUsers.forEach((user, index) => {
      if (index === 0) {
        // Akash Khairal - Admin
        user.roles = [roleMap['Admin']];
      } else if (index === 1) {
        // Priya Sharma - Project Manager
        user.roles = [roleMap['Project Manager']];
      } else if (index === 2) {
        // Rahul Verma - Team Lead
        user.roles = [roleMap['Team Lead']];
      } else if (index === 3 || index === 4) {
        // Anjali Patel & Vikram Singh - Developers
        user.roles = [roleMap['Developer']];
      } else if (index === 5) {
        // Meera Joshi - Analyst
        user.roles = [roleMap['Analyst']];
      } else {
        // Others - Analyst role
        user.roles = [roleMap['Analyst']];
      }
    });
    
    // Hash passwords and create users
    console.log('👤 Creating users...');
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return { ...user, password: hashedPassword };
      })
    );
    
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Map users for easy access
    const userMap = {};
    createdUsers.forEach(user => {
      userMap[`${user.firstName} ${user.lastName}`] = user._id;
    });
    
    // Create projects
    console.log('📋 Creating projects...');
    sampleProjects.forEach((project, index) => {
      if (index === 0) {
        // ERP System - Priya Sharma as manager
        project.projectManager = userMap['Priya Sharma'];
        project.createdBy = userMap['Akash Khairal']; // Assuming Akash is the creator
      } else if (index === 1) {
        // Mobile App - Rahul Verma as manager
        project.projectManager = userMap['Rahul Verma'];
        project.createdBy = userMap['Akash Khairal']; // Assuming Akash is the creator
      } else {
        // Data Analytics - Meera Joshi as manager
        project.projectManager = userMap['Meera Joshi'];
        project.createdBy = userMap['Akash Khairal']; // Assuming Akash is the creator
      }
    });
    
    const createdProjects = await Project.insertMany(sampleProjects);
    console.log(`✅ Created ${createdProjects.length} projects`);
    
    // Map projects for easy access
    const projectMap = {};
    createdProjects.forEach(project => {
      projectMap[project.name] = project._id;
    });
    
    // Create teams and assign to projects
    console.log('👥 Creating teams...');
    sampleTeams.forEach((team, index) => {
      if (index < 3) {
        // First 3 teams for ERP System
        team.project = projectMap['ERP System Modernization'];
      } else if (index < 5) {
        // Next 2 teams for Mobile App
        team.project = projectMap['Mobile App Development'];
      } else {
        // Last 2 teams for Data Analytics
        team.project = projectMap['Data Analytics Platform'];
      }
      
      // Set createdBy to Akash Khairal (Admin)
      team.createdBy = userMap['Akash Khairal'];
      
      // Assign team leads
      if (index === 0) {
        // Frontend Team - Rahul Verma as lead
        team.teamLead = userMap['Rahul Verma'];
        team.members = [
          { user: userMap['Anjali Patel'], role: 'developer' },
          { user: userMap['Vikram Singh'], role: 'developer' }
        ];
      } else if (index === 1) {
        // Backend Team - Vikram Singh as lead
        team.teamLead = userMap['Vikram Singh'];
        team.members = [
          { user: userMap['Rahul Verma'], role: 'developer' }
        ];
      } else if (index === 2) {
        // DevOps Team - Akash Khairal as lead
        team.teamLead = userMap['Akash Khairal'];
        team.members = [
          { user: userMap['Rahul Verma'], role: 'developer' }
        ];
      } else if (index === 3) {
        // Mobile Team - Anjali Patel as lead
        team.teamLead = userMap['Anjali Patel'];
        team.members = [
          { user: userMap['Vikram Singh'], role: 'developer' }
        ];
      } else if (index === 4) {
        // Backend Integration Team - Vikram Singh as lead
        team.teamLead = userMap['Vikram Singh'];
        team.members = [
          { user: userMap['Rahul Verma'], role: 'developer' }
        ];
      } else if (index === 5) {
        // Data Engineering Team - Meera Joshi as lead
        team.teamLead = userMap['Meera Joshi'];
        team.members = [
          { user: userMap['Arjun Kumar'], role: 'analyst' }
        ];
      } else {
        // Analytics Team - Sneha Reddy as lead
        team.teamLead = userMap['Sneha Reddy'];
        team.members = [
          { user: userMap['Meera Joshi'], role: 'analyst' }
        ];
      }
    });
    
    const createdTeams = await Team.insertMany(sampleTeams);
    console.log(`✅ Created ${createdTeams.length} teams`);
    
    // Update projects with team references
    console.log('🔗 Linking projects and teams...');
    await Project.findByIdAndUpdate(projectMap['ERP System Modernization'], {
      team: createdTeams.slice(0, 3).map(team => team._id)
    });
    
    await Project.findByIdAndUpdate(projectMap['Mobile App Development'], {
      team: createdTeams.slice(3, 5).map(team => team._id)
    });
    
    await Project.findByIdAndUpdate(projectMap['Data Analytics Platform'], {
      team: createdTeams.slice(5, 7).map(team => team._id)
    });
    
    console.log('✅ Projects and teams linked successfully');
    
    // Create some sample tasks
    console.log('📝 Creating sample tasks...');
    const sampleTasks = [
      {
        title: 'Design User Interface Components',
        description: 'Create reusable React components for the ERP system',
        status: 'doing',
        priority: 'high',
        type: 'design',
        assignedTo: userMap['Anjali Patel'],
        assignedBy: userMap['Priya Sharma'],
        project: projectMap['ERP System Modernization'],
        team: createdTeams[0]._id,
        estimatedHours: 40,
        actualHours: 25,
        dueDate: new Date('2024-04-30'),
        createdBy: userMap['Priya Sharma'],
        tags: ['frontend', 'ui', 'react'],
        isActive: true
      },
      {
        title: 'Implement Authentication System',
        description: 'Build JWT-based authentication with role-based access control',
        status: 'done',
        priority: 'high',
        type: 'feature',
        assignedTo: userMap['Vikram Singh'],
        assignedBy: userMap['Priya Sharma'],
        project: projectMap['ERP System Modernization'],
        team: createdTeams[1]._id,
        estimatedHours: 32,
        actualHours: 30,
        dueDate: new Date('2024-04-15'),
        createdBy: userMap['Priya Sharma'],
        tags: ['backend', 'security', 'jwt'],
        isActive: true
      },
      {
        title: 'Setup CI/CD Pipeline',
        description: 'Configure automated deployment pipeline using GitHub Actions',
        status: 'doing',
        priority: 'medium',
        type: 'deployment',
        assignedTo: userMap['Akash Khairal'],
        assignedBy: userMap['Priya Sharma'],
        project: projectMap['ERP System Modernization'],
        team: createdTeams[2]._id,
        estimatedHours: 24,
        actualHours: 12,
        dueDate: new Date('2024-05-15'),
        createdBy: userMap['Priya Sharma'],
        tags: ['devops', 'ci-cd', 'github-actions'],
        isActive: true
      }
    ];
    
    const createdTasks = await Task.insertMany(sampleTasks);
    console.log(`✅ Created ${createdTasks.length} sample tasks`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${createdRoles.length} roles created`);
    console.log(`   • ${createdUsers.length} users created`);
    console.log(`   • ${createdProjects.length} projects created`);
    console.log(`   • ${createdTeams.length} teams created`);
    console.log(`   • ${createdTasks.length} tasks created`);
    
    console.log('\n🔑 Default Login Credentials:');
    console.log('   • Admin: akash.khairal@company.com / Password123!');
    console.log('   • Project Manager: priya.sharma@company.com / Password123!');
    console.log('   • Team Lead: rahul.verma@company.com / Password123!');
    
    console.log('\n📁 Projects Created:');
    console.log('   • ERP System Modernization (65% complete)');
    console.log('   • Mobile App Development (15% complete)');
    console.log('   • Data Analytics Platform (100% complete)');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding
if (require.main === module) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => {
      console.log('\n✅ Seeding completed. You can now close this process.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, connectDB };
