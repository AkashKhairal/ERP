const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testProject = {
  name: 'Test Project',
  description: 'This is a test project',
  type: 'saas',
  priority: 'medium',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  budget: 10000,
  currency: 'USD',
  projectManager: '507f1f77bcf86cd799439011', // This is a dummy ObjectId
  teamMembers: [],
  tags: ['test', 'demo']
};

// First, let's get a real user ID to use as project manager
const getUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE}/users`);
    console.log('Users response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error getting users:', error.response?.data || error.message);
    return [];
  }
};

// Test project creation
const testProjectCreation = async () => {
  try {
    console.log('🔍 Testing project creation...');
    
    // First get users to get a valid project manager ID
    const users = await getUsers();
    
    if (users && users.length > 0) {
      const projectManagerId = users[0]._id;
      console.log('✅ Found project manager:', projectManagerId);
      
      // Update test project with real project manager ID
      testProject.projectManager = projectManagerId;
      
      // Try to create project
      const response = await axios.post(`${API_BASE}/projects`, testProject);
      console.log('✅ Project created successfully!');
      console.log('Response:', response.data);
    } else {
      console.log('❌ No users found. Cannot test project creation without a valid project manager.');
    }
  } catch (error) {
    console.error('❌ Error creating project:', error.response?.data || error.message);
  }
};

// Run the test
testProjectCreation(); 