const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test authentication and project creation
const testAuthAndProjectCreation = async () => {
  try {
    console.log('🔍 Testing authentication and project creation...');
    
    // Step 1: Try to login with admin credentials
    console.log('📝 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@erp.com',
      password: 'password123'
    });
    
    if (loginResponse.data?.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful! Token received.');
      
      // Step 2: Get users with authentication
      console.log('📝 Step 2: Getting users...');
      const usersResponse = await axios.get(`${API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (usersResponse.data?.success && usersResponse.data.data.length > 0) {
        const projectManagerId = usersResponse.data.data[0]._id;
        console.log('✅ Found project manager:', projectManagerId);
        
        // Step 3: Create project with authentication
        console.log('📝 Step 3: Creating project...');
        const testProject = {
          name: 'Test Project from Script',
          description: 'This is a test project created from script',
          type: 'saas',
          priority: 'medium',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          budget: 10000,
          currency: 'USD',
          projectManager: projectManagerId,
          teamMembers: [],
          tags: ['test', 'script']
        };
        
        const projectResponse = await axios.post(`${API_BASE}/projects`, testProject, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (projectResponse.data?.success) {
          console.log('✅ Project created successfully!');
          console.log('Project ID:', projectResponse.data.data._id);
        } else {
          console.log('❌ Project creation failed:', projectResponse.data);
        }
      } else {
        console.log('❌ No users found or failed to get users');
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

// Run the test
testAuthAndProjectCreation(); 