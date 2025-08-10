const mongoose = require('mongoose');
const Task = require('./src/models/Task');
const Project = require('./src/models/Project');
const User = require('./src/models/User');
const AuditLog = require('./src/models/AuditLog');
require('dotenv').config();

const sampleTasks = [
  // Mobile App Development Project Tasks
  {
    title: 'Design User Authentication Flow',
    description: 'Create wireframes and user flow diagrams for the authentication system including login, registration, and password reset.',
    type: 'design',
    priority: 'high',
    status: 'done',
    estimatedHours: 8,
    actualHours: 7.5,
    progress: 100,
    labels: ['design', 'auth', 'wireframes'],
    tags: ['ui-ux', 'authentication'],
    subtasks: [
      { title: 'Create login wireframes', completed: true, completedAt: new Date('2024-01-15') },
      { title: 'Design registration flow', completed: true, completedAt: new Date('2024-01-16') },
      { title: 'Password reset screens', completed: true, completedAt: new Date('2024-01-17') }
    ],
    comments: [
      { content: 'Design approved by client. Ready for development.', createdAt: new Date('2024-01-18') },
      { content: 'Great work on the user flow!', createdAt: new Date('2024-01-19') }
    ],
    dueDate: new Date('2024-01-20'),
    completedDate: new Date('2024-01-18')
  },
  {
    title: 'Implement Authentication API',
    description: 'Develop backend API endpoints for user authentication including JWT token generation and validation.',
    type: 'feature',
    priority: 'high',
    status: 'doing',
    estimatedHours: 12,
    actualHours: 6,
    progress: 50,
    labels: ['backend', 'api', 'auth'],
    tags: ['authentication', 'jwt', 'security'],
    subtasks: [
      { title: 'Setup JWT middleware', completed: true, completedAt: new Date('2024-01-22') },
      { title: 'Create login endpoint', completed: true, completedAt: new Date('2024-01-23') },
      { title: 'Implement registration endpoint', completed: false },
      { title: 'Add password reset functionality', completed: false },
      { title: 'Write API documentation', completed: false }
    ],
    comments: [
      { content: 'JWT implementation completed successfully.', createdAt: new Date('2024-01-22') },
      { content: 'Need to add rate limiting for security.', createdAt: new Date('2024-01-24') }
    ],
    dueDate: new Date('2024-01-30')
  },
  {
    title: 'Setup React Native Project',
    description: 'Initialize React Native project with TypeScript, navigation, and essential dependencies.',
    type: 'feature',
    priority: 'medium',
    status: 'done',
    estimatedHours: 4,
    actualHours: 3.5,
    progress: 100,
    labels: ['setup', 'react-native', 'typescript'],
    tags: ['mobile', 'setup', 'typescript'],
    subtasks: [
      { title: 'Initialize React Native project', completed: true, completedAt: new Date('2024-01-10') },
      { title: 'Configure TypeScript', completed: true, completedAt: new Date('2024-01-10') },
      { title: 'Setup navigation library', completed: true, completedAt: new Date('2024-01-11') },
      { title: 'Install essential dependencies', completed: true, completedAt: new Date('2024-01-11') }
    ],
    comments: [
      { content: 'Project setup completed successfully.', createdAt: new Date('2024-01-11') }
    ],
    dueDate: new Date('2024-01-15'),
    completedDate: new Date('2024-01-11')
  },

  // YouTube Content Series Project Tasks
  {
    title: 'Research Trending Topics',
    description: 'Analyze current trends in programming and tech to identify high-potential content topics for the YouTube channel.',
    type: 'content',
    priority: 'medium',
    status: 'todo',
    estimatedHours: 6,
    actualHours: 0,
    progress: 0,
    labels: ['research', 'content', 'trends'],
    tags: ['youtube', 'research', 'trending'],
    subtasks: [
      { title: 'Analyze competitor channels', completed: false },
      { title: 'Research trending hashtags', completed: false },
      { title: 'Identify content gaps', completed: false },
      { title: 'Create content calendar', completed: false }
    ],
    comments: [
      { content: 'Need to focus on React and AI topics based on current trends.', createdAt: new Date('2024-02-05') }
    ],
    dueDate: new Date('2024-02-15')
  },
  {
    title: 'Create Video Script Template',
    description: 'Develop a standardized script template for programming tutorials to ensure consistent quality and structure.',
    type: 'content',
    priority: 'high',
    status: 'review',
    estimatedHours: 4,
    actualHours: 4.5,
    progress: 90,
    labels: ['content', 'script', 'template'],
    tags: ['youtube', 'script', 'template'],
    subtasks: [
      { title: 'Define script structure', completed: true, completedAt: new Date('2024-02-08') },
      { title: 'Create intro/outro templates', completed: true, completedAt: new Date('2024-02-09') },
      { title: 'Add call-to-action sections', completed: true, completedAt: new Date('2024-02-10') },
      { title: 'Review and finalize', completed: false }
    ],
    comments: [
      { content: 'Template looks great! Just need to add SEO optimization section.', createdAt: new Date('2024-02-10') }
    ],
    dueDate: new Date('2024-02-12')
  },
  {
    title: 'Setup Recording Equipment',
    description: 'Configure and test all recording equipment including microphone, camera, and lighting for optimal video quality.',
    type: 'other',
    priority: 'medium',
    status: 'done',
    estimatedHours: 3,
    actualHours: 2.5,
    progress: 100,
    labels: ['setup', 'equipment', 'recording'],
    tags: ['youtube', 'equipment', 'setup'],
    subtasks: [
      { title: 'Test microphone quality', completed: true, completedAt: new Date('2024-02-01') },
      { title: 'Configure camera settings', completed: true, completedAt: new Date('2024-02-01') },
      { title: 'Setup lighting arrangement', completed: true, completedAt: new Date('2024-02-02') },
      { title: 'Test recording quality', completed: true, completedAt: new Date('2024-02-02') }
    ],
    comments: [
      { content: 'Equipment setup completed. Audio quality is excellent!', createdAt: new Date('2024-02-02') }
    ],
    dueDate: new Date('2024-02-05'),
    completedDate: new Date('2024-02-02')
  },

  // E-commerce Platform Project Tasks
  {
    title: 'Design Database Schema',
    description: 'Create comprehensive database schema for the e-commerce platform including products, users, orders, and payments.',
    type: 'design',
    priority: 'high',
    status: 'done',
    estimatedHours: 10,
    actualHours: 9,
    progress: 100,
    labels: ['design', 'database', 'schema'],
    tags: ['ecommerce', 'database', 'design'],
    subtasks: [
      { title: 'Design user tables', completed: true, completedAt: new Date('2023-09-05') },
      { title: 'Create product schema', completed: true, completedAt: new Date('2023-09-06') },
      { title: 'Design order system', completed: true, completedAt: new Date('2023-09-07') },
      { title: 'Payment integration schema', completed: true, completedAt: new Date('2023-09-08') }
    ],
    comments: [
      { content: 'Database schema approved. Ready for implementation.', createdAt: new Date('2023-09-08') }
    ],
    dueDate: new Date('2023-09-10'),
    completedDate: new Date('2023-09-08')
  },
  {
    title: 'Implement Payment Gateway',
    description: 'Integrate Stripe payment gateway for secure payment processing including credit cards and digital wallets.',
    type: 'feature',
    priority: 'urgent',
    status: 'done',
    estimatedHours: 16,
    actualHours: 14,
    progress: 100,
    labels: ['payment', 'stripe', 'integration'],
    tags: ['ecommerce', 'payment', 'stripe'],
    subtasks: [
      { title: 'Setup Stripe account', completed: true, completedAt: new Date('2023-10-15') },
      { title: 'Implement payment processing', completed: true, completedAt: new Date('2023-10-18') },
      { title: 'Add webhook handling', completed: true, completedAt: new Date('2023-10-20') },
      { title: 'Test payment flows', completed: true, completedAt: new Date('2023-10-22') }
    ],
    comments: [
      { content: 'Payment integration completed successfully. All tests passed.', createdAt: new Date('2023-10-22') }
    ],
    dueDate: new Date('2023-10-25'),
    completedDate: new Date('2023-10-22')
  },

  // Website Redesign Project Tasks
  {
    title: 'Conduct User Research',
    description: 'Perform user research and analysis to understand current website pain points and user needs.',
    type: 'research',
    priority: 'medium',
    status: 'todo',
    estimatedHours: 8,
    actualHours: 0,
    progress: 0,
    labels: ['research', 'user-research', 'analysis'],
    tags: ['website', 'research', 'user-experience'],
    subtasks: [
      { title: 'Create user survey', completed: false },
      { title: 'Conduct user interviews', completed: false },
      { title: 'Analyze current website analytics', completed: false },
      { title: 'Create user personas', completed: false }
    ],
    comments: [
      { content: 'Need to schedule user interviews for next week.', createdAt: new Date('2024-03-05') }
    ],
    dueDate: new Date('2024-03-20')
  },
  {
    title: 'Create Wireframes',
    description: 'Design wireframes for the new website layout focusing on improved user experience and modern design principles.',
    type: 'design',
    priority: 'high',
    status: 'doing',
    estimatedHours: 12,
    actualHours: 4,
    progress: 33,
    labels: ['design', 'wireframes', 'ui-ux'],
    tags: ['website', 'design', 'wireframes'],
    subtasks: [
      { title: 'Homepage wireframes', completed: true, completedAt: new Date('2024-03-10') },
      { title: 'About page design', completed: false },
      { title: 'Services page layout', completed: false },
      { title: 'Contact page design', completed: false },
      { title: 'Blog layout', completed: false }
    ],
    comments: [
      { content: 'Homepage wireframes completed. Client feedback is positive.', createdAt: new Date('2024-03-10') }
    ],
    dueDate: new Date('2024-03-25')
  },

  // AI-Powered Analytics Dashboard Project Tasks
  {
    title: 'Setup Machine Learning Environment',
    description: 'Configure the development environment for machine learning models including Python, TensorFlow, and data processing tools.',
    type: 'setup',
    priority: 'high',
    status: 'done',
    estimatedHours: 6,
    actualHours: 5.5,
    progress: 100,
    labels: ['setup', 'ml', 'environment'],
    tags: ['ai', 'machine-learning', 'setup'],
    subtasks: [
      { title: 'Install Python and dependencies', completed: true, completedAt: new Date('2024-01-20') },
      { title: 'Setup TensorFlow environment', completed: true, completedAt: new Date('2024-01-21') },
      { title: 'Configure data processing tools', completed: true, completedAt: new Date('2024-01-22') },
      { title: 'Test ML pipeline', completed: true, completedAt: new Date('2024-01-23') }
    ],
    comments: [
      { content: 'ML environment setup completed successfully.', createdAt: new Date('2024-01-23') }
    ],
    dueDate: new Date('2024-01-25'),
    completedDate: new Date('2024-01-23')
  },
  {
    title: 'Develop Predictive Analytics Model',
    description: 'Build machine learning models for predictive analytics including sales forecasting and user behavior prediction.',
    type: 'feature',
    priority: 'urgent',
    status: 'doing',
    estimatedHours: 20,
    actualHours: 8,
    progress: 40,
    labels: ['ml', 'analytics', 'prediction'],
    tags: ['ai', 'machine-learning', 'analytics'],
    subtasks: [
      { title: 'Data preprocessing', completed: true, completedAt: new Date('2024-02-01') },
      { title: 'Feature engineering', completed: true, completedAt: new Date('2024-02-05') },
      { title: 'Model training', completed: false },
      { title: 'Model validation', completed: false },
      { title: 'Performance optimization', completed: false }
    ],
    comments: [
      { content: 'Data preprocessing completed. Ready for model training.', createdAt: new Date('2024-02-05') },
      { content: 'Feature engineering shows promising results.', createdAt: new Date('2024-02-08') }
    ],
    dueDate: new Date('2024-03-15')
  },
  {
    title: 'Create Dashboard UI Components',
    description: 'Design and implement reusable UI components for the analytics dashboard including charts, graphs, and data visualization.',
    type: 'design',
    priority: 'medium',
    status: 'review',
    estimatedHours: 15,
    actualHours: 12,
    progress: 80,
    labels: ['design', 'ui', 'dashboard'],
    tags: ['ai', 'dashboard', 'ui-components'],
    subtasks: [
      { title: 'Design chart components', completed: true, completedAt: new Date('2024-02-10') },
      { title: 'Create data tables', completed: true, completedAt: new Date('2024-02-12') },
      { title: 'Implement filters and controls', completed: true, completedAt: new Date('2024-02-15') },
      { title: 'Add responsive design', completed: false },
      { title: 'Performance optimization', completed: false }
    ],
    comments: [
      { content: 'UI components are looking great! Just need to add responsive design.', createdAt: new Date('2024-02-15') }
    ],
    dueDate: new Date('2024-02-28')
  }
];

const seedTasks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorbase');
    console.log('Connected to MongoDB');

    // Get users for assignment
    const users = await User.find({}).limit(5);
    if (users.length === 0) {
      console.error('No users found. Please create users first.');
      process.exit(1);
    }

    // Get projects
    const projects = await Project.find({ isActive: true });
    if (projects.length === 0) {
      console.error('No projects found. Please create projects first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users and ${projects.length} projects`);

    // Check for existing tasks to avoid duplicates
    const existingTasks = await Task.find({
      title: { $in: sampleTasks.map(t => t.title) }
    });

    if (existingTasks.length > 0) {
      console.log('Some tasks already exist. Skipping...');
      console.log('Existing tasks:', existingTasks.map(t => t.title));
      process.exit(0);
    }

    // Create tasks with proper project assignment
    const createdTasks = [];
    let taskIndex = 0;

    for (const project of projects) {
      // Get tasks for this project (3-4 tasks per project)
      const projectTasks = sampleTasks.slice(taskIndex, taskIndex + 3);
      
      for (const taskData of projectTasks) {
        const assignedUser = users[Math.floor(Math.random() * users.length)];
        const assignedBy = users[Math.floor(Math.random() * users.length)];

        const task = new Task({
          ...taskData,
          project: project._id,
          assignedTo: assignedUser._id,
          assignedBy: assignedBy._id,
          createdBy: assignedBy._id,
          updatedBy: assignedBy._id
        });

        await task.save();

        // Create audit log for task creation
        await AuditLog.logEvent({
          user: assignedBy._id,
          action: 'task_created',
          resource: 'task',
          resourceId: task._id,
          details: {
            module: 'tasks',
            action: 'create',
            newValue: {
              title: task.title,
              project: project.name,
              assignedTo: `${assignedUser.firstName} ${assignedUser.lastName}`,
              dueDate: task.dueDate
            },
            ipAddress: '127.0.0.1',
            userAgent: 'Seed Script'
          }
        });

        // Create audit log for task assignment
        await AuditLog.logEvent({
          user: assignedBy._id,
          action: 'task_assigned',
          resource: 'task',
          resourceId: task._id,
          details: {
            module: 'tasks',
            action: 'assign',
            newValue: {
              assignedTo: `${assignedUser.firstName} ${assignedUser.lastName}`,
              assignedBy: `${assignedBy.firstName} ${assignedBy.lastName}`,
              assignedAt: new Date()
            },
            ipAddress: '127.0.0.1',
            userAgent: 'Seed Script'
          }
        });

        createdTasks.push(task);
        console.log(`Created task: ${task.title} (${task.type}) - Project: ${project.name} - Assigned to: ${assignedUser.firstName} ${assignedUser.lastName}`);
      }

      taskIndex += 3;
      if (taskIndex >= sampleTasks.length) break;
    }

    console.log(`\n✅ Successfully created ${createdTasks.length} tasks!`);
    console.log('\nTask Summary:');
    createdTasks.forEach(task => {
      console.log(`- ${task.title} (${task.type}) - ${task.status} - ${task.priority} priority`);
    });

    // Create additional audit logs for task activities
    console.log('\n📊 Creating audit logs for task activities...');
    
    for (const task of createdTasks) {
      // Log task status updates
      if (task.status === 'done') {
        await AuditLog.logEvent({
          user: task.assignedTo,
          action: 'task_completed',
          resource: 'task',
          resourceId: task._id,
          details: {
            module: 'tasks',
            action: 'complete',
            newValue: {
              completedDate: task.completedDate,
              progress: 100
            },
            ipAddress: '127.0.0.1',
            userAgent: 'Seed Script'
          }
        });
      }

      // Log comments
      if (task.comments && task.comments.length > 0) {
        for (const comment of task.comments) {
          await AuditLog.logEvent({
            user: task.assignedTo,
            action: 'task_comment_added',
            resource: 'task',
            resourceId: task._id,
            details: {
              module: 'tasks',
              action: 'add_comment',
              newValue: {
                content: comment.content,
                createdAt: comment.createdAt
              },
              ipAddress: '127.0.0.1',
              userAgent: 'Seed Script'
            }
          });
        }
      }

      // Log subtask completions
      if (task.subtasks && task.subtasks.length > 0) {
        for (const subtask of task.subtasks) {
          if (subtask.completed) {
            await AuditLog.logEvent({
              user: task.assignedTo,
              action: 'subtask_completed',
              resource: 'task',
              resourceId: task._id,
              details: {
                module: 'tasks',
                action: 'complete_subtask',
                newValue: {
                  subtaskTitle: subtask.title,
                  completedAt: subtask.completedAt
                },
                ipAddress: '127.0.0.1',
                userAgent: 'Seed Script'
              }
            });
          }
        }
      }
    }

    console.log('✅ Audit logs created successfully!');

  } catch (error) {
    console.error('Error seeding tasks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed function
seedTasks(); 