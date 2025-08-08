const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123',
  department: 'operations',
  position: 'Test Position'
};

let authToken = null;

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    info: '\x1b[36m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const testEndpoint = async (method, endpoint, data = null, description = '') => {
  try {
    const config = {
      ...testConfig,
      method,
      url: `${API_BASE}${endpoint}`,
      ...(authToken && { headers: { ...testConfig.headers, Authorization: `Bearer ${authToken}` } })
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    log(`✅ ${description || `${method.toUpperCase()} ${endpoint}`} - Status: ${response.status}`, 'success');
    return response.data;
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const message = error.response?.data?.message || error.message;
    log(`❌ ${description || `${method.toUpperCase()} ${endpoint}`} - Status: ${status} - ${message}`, 'error');
    return null;
  }
};

// Test suite
const runTests = async () => {
  log('🚀 Starting comprehensive module verification...', 'info');
  log('='.repeat(60), 'info');
  
  // 1. Health Check
  log('📋 Testing Health Check...', 'info');
  await testEndpoint('GET', '/health', null, 'Health Check');
  
  // 2. Authentication Module
  log('\n🔐 Testing Authentication Module...', 'info');
  const authResult = await testEndpoint('POST', '/auth/register', testUser, 'User Registration');
  if (authResult?.token) {
    authToken = authResult.token;
    log('✅ Authentication token obtained', 'success');
  }
  
  // 3. User Management
  log('\n👥 Testing User Management...', 'info');
  await testEndpoint('GET', '/users', null, 'Get Users');
  await testEndpoint('GET', '/users/profile', null, 'Get User Profile');
  
  // 4. Roles & Permissions
  log('\n🔑 Testing Roles & Permissions...', 'info');
  await testEndpoint('GET', '/roles', null, 'Get Roles');
  await testEndpoint('GET', '/roles/default', null, 'Get Default Roles');
  
  // 5. Audit Logs
  log('\n📝 Testing Audit Logs...', 'info');
  await testEndpoint('GET', '/audit', null, 'Get Audit Logs');
  await testEndpoint('GET', '/audit/stats', null, 'Get Audit Stats');
  
  // 6. Team Management
  log('\n👥 Testing Team Management...', 'info');
  await testEndpoint('GET', '/teams', null, 'Get Teams');
  
  // 7. Employee Management
  log('\n👤 Testing Employee Management...', 'info');
  await testEndpoint('GET', '/employees', null, 'Get Employees');
  
  // 8. Attendance Tracking
  log('\n⏰ Testing Attendance Tracking...', 'info');
  await testEndpoint('GET', '/attendance', null, 'Get Attendance Records');
  
  // 9. Leave Management
  log('\n🏖️ Testing Leave Management...', 'info');
  await testEndpoint('GET', '/leaves', null, 'Get Leave Requests');
  
  // 10. Payroll Management
  log('\n💰 Testing Payroll Management...', 'info');
  await testEndpoint('GET', '/payroll', null, 'Get Payroll Records');
  
  // 11. Project Management
  log('\n📁 Testing Project Management...', 'info');
  await testEndpoint('GET', '/projects', null, 'Get Projects');
  
  // 12. Task Management
  log('\n✅ Testing Task Management...', 'info');
  await testEndpoint('GET', '/tasks', null, 'Get Tasks');
  
  // 13. Sprint Management
  log('\n🏃 Testing Sprint Management...', 'info');
  await testEndpoint('GET', '/sprints', null, 'Get Sprints');
  
  // 14. Finance Management
  log('\n💳 Testing Finance Management...', 'info');
  await testEndpoint('GET', '/finance', null, 'Get Finance Records');
  
  // 15. Analytics
  log('\n📊 Testing Analytics...', 'info');
  await testEndpoint('GET', '/analytics', null, 'Get Analytics Data');
  
  // 16. Content Management
  log('\n📝 Testing Content Management...', 'info');
  await testEndpoint('GET', '/content', null, 'Get Content');
  
  // 17. Integrations
  log('\n🔗 Testing Integrations...', 'info');
  await testEndpoint('GET', '/integrations', null, 'Get Integrations');
  
  log('\n' + '='.repeat(60), 'info');
  log('🎉 Module verification completed!', 'success');
  log('Check the results above to see which modules are working properly.', 'info');
};

// Run the tests
runTests().catch(error => {
  log(`❌ Test suite failed: ${error.message}`, 'error');
  process.exit(1);
}); 