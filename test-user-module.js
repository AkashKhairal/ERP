const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test user module functionality
const testUserModule = async () => {
  try {
    console.log('🔍 Testing User Module...');
    
    // Step 1: Login as admin
    console.log('📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@erp.com',
      password: 'password123'
    });
    
    if (!loginResponse.data?.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful!');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Get all users
    console.log('📝 Step 2: Getting all users...');
    const usersResponse = await axios.get(`${API_BASE}/users`, { headers });
    
    if (usersResponse.data?.success) {
      console.log('✅ Users fetched successfully!');
      console.log(`📊 Total users: ${usersResponse.data.data.length}`);
      usersResponse.data.data.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.isActive ? 'Active' : 'Inactive'}`);
      });
    } else {
      console.log('❌ Failed to fetch users:', usersResponse.data);
    }
    
    // Step 3: Get user by ID (first user)
    if (usersResponse.data?.success && usersResponse.data.data.length > 0) {
      const firstUser = usersResponse.data.data[0];
      console.log(`📝 Step 3: Getting user details for ${firstUser.firstName}...`);
      
      const userDetailResponse = await axios.get(`${API_BASE}/users/${firstUser._id}`, { headers });
      
      if (userDetailResponse.data?.success) {
        console.log('✅ User details fetched successfully!');
        console.log(`  - Roles: ${userDetailResponse.data.data.roles?.map(r => r.name).join(', ') || 'None'}`);
        console.log(`  - Department: ${userDetailResponse.data.data.department}`);
        console.log(`  - Position: ${userDetailResponse.data.data.position}`);
      } else {
        console.log('❌ Failed to fetch user details:', userDetailResponse.data);
      }
    }
    
    // Step 4: Test user creation
    console.log('📝 Step 4: Testing user creation...');
    const newUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      password: 'password123',
      position: 'Software Developer',
      department: 'engineering',
      isActive: true,
      roles: []
    };
    
    const createUserResponse = await axios.post(`${API_BASE}/users`, newUserData, { headers });
    
    if (createUserResponse.data?.success) {
      console.log('✅ User created successfully!');
      console.log(`  - User ID: ${createUserResponse.data.data._id}`);
      
      // Step 5: Test user update
      console.log('📝 Step 5: Testing user update...');
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
        position: 'Senior Developer',
        department: 'engineering'
      };
      
      const updateResponse = await axios.put(`${API_BASE}/users/${createUserResponse.data.data._id}`, updateData, { headers });
      
      if (updateResponse.data?.success) {
        console.log('✅ User updated successfully!');
        
        // Step 6: Test user deletion
        console.log('📝 Step 6: Testing user deletion...');
        const deleteResponse = await axios.delete(`${API_BASE}/users/${createUserResponse.data.data._id}`, { headers });
        
        if (deleteResponse.data?.success) {
          console.log('✅ User deleted successfully!');
        } else {
          console.log('❌ Failed to delete user:', deleteResponse.data);
        }
      } else {
        console.log('❌ Failed to update user:', updateResponse.data);
      }
    } else {
      console.log('❌ Failed to create user:', createUserResponse.data);
    }
    
    // Step 7: Test user export
    console.log('📝 Step 7: Testing user export...');
    try {
      const exportResponse = await axios.get(`${API_BASE}/users/export`, { 
        headers,
        responseType: 'blob'
      });
      
      if (exportResponse.status === 200) {
        console.log('✅ User export successful!');
        console.log(`  - Export size: ${exportResponse.data.size} bytes`);
      } else {
        console.log('❌ Failed to export users');
      }
    } catch (error) {
      console.log('❌ Export failed:', error.response?.status);
    }
    
    console.log('🎉 User module testing completed!');
    
  } catch (error) {
    console.error('❌ Error testing user module:', error.response?.data || error.message);
  }
};

// Run the test
testUserModule(); 