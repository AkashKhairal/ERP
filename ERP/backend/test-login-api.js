const axios = require('axios');

const API_URL = 'https://creatorbase-backend.onrender.com/api';

const testLoginAPI = async () => {
  try {
    console.log('🔍 Testing Login API...');
    console.log('API URL:', API_URL);
    
    // Test admin login
    const loginData = {
      email: 'admin@company.com',
      password: 'Password123!'
    };
    
    console.log('\n📝 Testing login with:', { email: loginData.email, password: '***' });
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data?.data?.token) {
      console.log('🎯 Token received:', response.data.data.token.substring(0, 20) + '...');
    }
    
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message);
    console.error('Error details:', error.response?.data);
  }
};

testLoginAPI();
