const mongoose = require('mongoose');
const Project = require('./src/models/Project');
const User = require('./src/models/User');
require('dotenv').config();

const sampleProjects = [
  {
    name: 'Mobile App Development',
    description: 'Develop a cross-platform mobile application for iOS and Android using React Native. The app will include user authentication, real-time messaging, and payment integration.',
    type: 'saas',
    status: 'active',
    priority: 'high',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    budget: 50000,
    client: 'TechCorp Inc.',
    progress: 65,
    teamMembers: [],
    tags: ['mobile', 'react-native', 'payment-integration']
  },
  {
    name: 'YouTube Content Series',
    description: 'Create educational content series for YouTube channel focusing on programming tutorials, tech reviews, and industry insights. Target 100K subscribers by end of year.',
    type: 'youtube',
    status: 'active',
    priority: 'medium',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-12-31'),
    budget: 25000,
    client: 'Internal',
    progress: 30,
    teamMembers: [],
    tags: ['youtube', 'content-creation', 'education'],
    youtubeChannel: {
      channelId: 'UC123456789',
      channelName: 'TechTutorials Pro',
      targetViews: 1000000,
      targetSubscribers: 100000
    }
  },
  {
    name: 'E-commerce Platform',
    description: 'Build a full-featured e-commerce platform with inventory management, payment processing, and customer analytics. Support multiple vendors and marketplace functionality.',
    type: 'freelance',
    status: 'completed',
    priority: 'high',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-01-31'),
    budget: 75000,
    client: 'ShopDirect',
    progress: 100,
    teamMembers: [],
    tags: ['ecommerce', 'marketplace', 'payment-processing']
  },
  {
    name: 'Website Redesign',
    description: 'Redesign company website with modern UI/UX, improved performance, and better SEO optimization. Include blog functionality and contact forms.',
    type: 'internal',
    status: 'planning',
    priority: 'medium',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-05-31'),
    budget: 15000,
    client: 'Internal',
    progress: 10,
    teamMembers: [],
    tags: ['website', 'ui-ux', 'seo']
  },
  {
    name: 'AI-Powered Analytics Dashboard',
    description: 'Develop an AI-powered analytics dashboard for business intelligence. Include machine learning models for predictive analytics and automated reporting.',
    type: 'saas',
    status: 'active',
    priority: 'urgent',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-08-31'),
    budget: 100000,
    client: 'DataCorp Solutions',
    progress: 45,
    teamMembers: [],
    tags: ['ai', 'analytics', 'machine-learning', 'dashboard'],
    saasDetails: {
      platform: 'Web-based SaaS',
      targetUsers: 5000,
      revenueTarget: 500000
    }
  }
];

const seedProjects = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // Get a user to assign as project manager (use the first available user)
    const users = await User.find({}).limit(5);
    if (users.length === 0) {
      console.error('No users found. Please create users first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users for project assignment`);

    // Check for existing projects to avoid duplicates
    const existingProjects = await Project.find({
      name: { $in: sampleProjects.map(p => p.name) }
    });
    
    if (existingProjects.length > 0) {
      console.log('Some projects already exist. Skipping...');
      console.log('Existing projects:', existingProjects.map(p => p.name));
      process.exit(0);
    }

    // Create projects with assigned project managers
    const createdProjects = [];
    for (let i = 0; i < sampleProjects.length; i++) {
      const projectData = sampleProjects[i];
      const projectManager = users[i % users.length]; // Cycle through available users
      
      const project = new Project({
        ...projectData,
        projectManager: projectManager._id,
        createdBy: projectManager._id,
        teamMembers: [
          {
            user: projectManager._id,
            role: 'developer',
            assignedAt: new Date(),
            isActive: true
          }
        ]
      });

      await project.save();
      createdProjects.push(project);
      console.log(`Created project: ${project.name} (${project.type}) - Manager: ${projectManager.firstName} ${projectManager.lastName}`);
    }

    console.log(`\n✅ Successfully created ${createdProjects.length} projects!`);
    console.log('\nProject Summary:');
    createdProjects.forEach(project => {
      console.log(`- ${project.name} (${project.type}) - ${project.status} - $${project.budget.toLocaleString()}`);
    });

  } catch (error) {
    console.error('Error seeding projects:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed function
seedProjects(); 