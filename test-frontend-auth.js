const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test frontend authentication and user API
const testFrontendAuth = async () => {
  try {
    console.log('🔍 Testing Frontend Authentication...');
    
    // Step 1: Login to get token
    console.log('📝 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@erp.com',
      password: 'password123'
    });
    
    if (!loginResponse.data?.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful! Token received.');
    
    // Step 2: Test users API with token
    console.log('📝 Step 2: Testing users API...');
    const usersResponse = await axios.get(`${API_BASE}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (usersResponse.data?.success) {
      console.log('✅ Users API working!');
      console.log(`📊 Total users: ${usersResponse.data.data.length}`);
      console.log('📋 Users:');
      usersResponse.data.data.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      });
    } else {
      console.log('❌ Users API failed:', usersResponse.data);
    }
    
    // Step 3: Test without token (should fail)
    console.log('📝 Step 3: Testing users API without token...');
    try {
      const noTokenResponse = await axios.get(`${API_BASE}/users`);
      console.log('❌ Users API should have failed without token but succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Users API correctly rejected request without token');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    console.log('🎉 Frontend authentication test completed!');
    
  } catch (error) {
    console.error('❌ Error testing frontend auth:', error.response?.data || error.message);
  }
};

// Run the test
testFrontendAuth(); 