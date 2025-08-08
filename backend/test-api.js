const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test the health endpoint first
async function testHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health endpoint working:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
    return false;
  }
}

// Test login to get a token
async function testLogin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@erp.com',
      password: 'admin123'
    });
    console.log('✅ Login successful');
    return response.data.data.token;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test finance endpoint with token
async function testFinance(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/finance/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Finance endpoint working:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Finance endpoint failed:', error.response?.data || error.message);
    return false;
  }
}

// Test analytics endpoint with token
async function testAnalytics(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Analytics endpoint working:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Analytics endpoint failed:', error.response?.data || error.message);
    return false;
  }
}

// Test content endpoint with token
async function testContent(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/content/youtube`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Content endpoint working:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Content endpoint failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing API endpoints...\n');
  
  // Test health
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('❌ Backend is not running or not accessible');
    return;
  }
  
  // Test login
  const token = await testLogin();
  if (!token) {
    console.log('❌ Cannot get authentication token');
    return;
  }
  
  console.log('\n🔐 Testing authenticated endpoints...\n');
  
  // Test each module
  await testFinance(token);
  await testAnalytics(token);
  await testContent(token);
  
  console.log('\n✅ API testing complete!');
}

runTests().catch(console.error); 