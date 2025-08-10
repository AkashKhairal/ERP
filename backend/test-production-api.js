const axios = require('axios');

const API_BASE = 'https://creatorbase-backend.onrender.com/api';

async function testLogin() {
  try {
    console.log('Testing login with admin@company.com...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@company.com',
      password: 'admin123'
    });
    
    console.log('Login successful!');
    console.log('User:', response.data.data.user.email);
    console.log('Roles:', response.data.data.user.roles?.length || 0);
    
    const token = response.data.data.token;
    console.log('Token received, length:', token.length);
    
    // Test HR stats endpoint
    console.log('\nTesting HR stats endpoint...');
    try {
      const hrStats = await axios.get(`${API_BASE}/hr/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('HR Stats:', hrStats.data);
    } catch (error) {
      console.log('HR Stats Error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test users endpoint
    console.log('\nTesting users endpoint...');
    try {
      const users = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Users count:', users.data.data?.length || 'No data field');
      console.log('Users response:', users.data);
    } catch (error) {
      console.log('Users Error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test employees endpoint
    console.log('\nTesting employees endpoint...');
    try {
      const employees = await axios.get(`${API_BASE}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Employees count:', employees.data.data?.length || 'No data field');
      console.log('Employees response:', employees.data);
    } catch (error) {
      console.log('Employees Error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.log('Login failed:', error.response?.status, error.response?.data?.message || error.message);
  }
}

testLogin();
