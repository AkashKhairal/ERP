const axios = require('axios');

async function testBackendConnection() {
  const backendURL = 'https://creatorbase-backend.onrender.com';
  
  console.log('🧪 Testing Backend Connection\n');
  console.log(`🌐 Backend URL: ${backendURL}`);
  
  try {
    // Test basic health check
    console.log('\n1. Testing basic connection...');
    const healthResponse = await axios.get(`${backendURL}/`, { timeout: 10000 });
    console.log(`✅ Backend is responding (Status: ${healthResponse.status})`);
    console.log(`📋 Response: ${JSON.stringify(healthResponse.data, null, 2)}`);
    
    // Test API base path
    console.log('\n2. Testing API path...');
    try {
      const apiResponse = await axios.get(`${backendURL}/api/`, { timeout: 10000 });
      console.log(`✅ API path accessible (Status: ${apiResponse.status})`);
    } catch (apiError) {
      console.log(`❌ API path error: ${apiError.response?.status || apiError.message}`);
    }
    
    // Test notifications endpoint without auth
    console.log('\n3. Testing notifications endpoint...');
    try {
      const notifResponse = await axios.get(`${backendURL}/api/notifications`, { timeout: 10000 });
      console.log(`📊 Notifications response: ${notifResponse.status}`);
    } catch (notifError) {
      console.log(`❌ Notifications error: ${notifError.response?.status || notifError.message}`);
      if (notifError.response?.status === 401) {
        console.log(`✅ This is expected - endpoint requires authentication`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Backend connection failed:`, error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log(`💡 The backend server might be sleeping or down`);
      console.log(`🔄 Render.com free tier goes to sleep after inactivity`);
    }
  }
}

testBackendConnection();
