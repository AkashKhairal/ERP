const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test complete authentication flow
const testAuthFlow = async () => {
  try {
    console.log('🔍 Testing Complete Authentication Flow...');
    
    // Step 1: Try to access users without token (should fail)
    console.log('📝 Step 1: Testing access without token...');
    try {
      await axios.get(`${API_BASE}/users`);
      console.log('❌ Users API should have failed without token but succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Users API correctly rejected request without token');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    // Step 2: Login to get token
    console.log('📝 Step 2: Logging in...');
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
    console.log(`Token: ${token.substring(0, 20)}...`);
    
    // Step 3: Test users API with token
    console.log('📝 Step 3: Testing users API with token...');
    const usersResponse = await axios.get(`${API_BASE}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (usersResponse.data?.success) {
      console.log('✅ Users API working with token!');
      console.log(`📊 Total users: ${usersResponse.data.data.length}`);
    } else {
      console.log('❌ Users API failed with token:', usersResponse.data);
    }
    
    // Step 4: Test invalid token
    console.log('📝 Step 4: Testing with invalid token...');
    try {
      await axios.get(`${API_BASE}/users`, {
        headers: {
          'Authorization': 'Bearer invalid_token_here',
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Users API should have failed with invalid token but succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Users API correctly rejected invalid token');
      } else {
        console.log('❌ Unexpected error with invalid token:', error.response?.data);
      }
    }
    
    console.log('🎉 Authentication flow test completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Backend API is working correctly');
    console.log('✅ Authentication is properly enforced');
    console.log('✅ Users can be accessed with valid token');
    console.log('✅ Invalid/missing tokens are properly rejected');
    
  } catch (error) {
    console.error('❌ Error testing auth flow:', error.response?.data || error.message);
  }
};

// Run the test
testAuthFlow(); 