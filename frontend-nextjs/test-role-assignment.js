// Test script for role assignment functionality
// Run this in the browser console to test role assignments

console.log('Testing role assignment functionality...');

// Test 1: Check if rolesService is available
if (typeof rolesService !== 'undefined') {
  console.log('✅ rolesService is available');
} else {
  console.log('❌ rolesService is not available');
}

// Test 2: Check if users and roles are loaded
if (typeof window !== 'undefined' && window.users && window.roles) {
  console.log('✅ Users and roles are available in window object');
  console.log('Users:', window.users.length);
  console.log('Roles:', window.roles.length);
} else {
  console.log('❌ Users and roles are not available in window object');
}

// Test 3: Check current user data structure
async function checkUserDataStructure() {
  try {
    console.log('Checking user data structure...');
    
    const users = await rolesService.getUsers();
    const roles = await rolesService.getRoles();
    
    if (users.data && users.data.length > 0) {
      console.log('First user data:', users.data[0]);
      console.log('User roleId:', users.data[0].roleId);
      console.log('User roles array:', users.data[0].roles);
      
      // Check if roleId matches any role
      if (users.data[0].roleId) {
        const assignedRole = roles.data.find(r => r.id === users.data[0].roleId);
        console.log('Assigned role:', assignedRole);
      }
    }
    
    if (roles.data && roles.data.length > 0) {
      console.log('First role data:', roles.data[0]);
    }
  } catch (error) {
    console.error('Error checking data structure:', error);
  }
}

// Test 4: Simulate role assignment with detailed logging
async function testRoleAssignment() {
  try {
    console.log('Testing role assignment...');
    
    // Get first user and first role
    const users = await rolesService.getUsers();
    const roles = await rolesService.getRoles();
    
    if (users.data && users.data.length > 0 && roles.data && roles.data.length > 0) {
      const testUser = users.data[0];
      const testRole = roles.data[0];
      
      console.log('Test user before assignment:', testUser);
      console.log('Test role to assign:', testRole);
      console.log('Current user roleId:', testUser.roleId);
      
      // Test role assignment
      const result = await rolesService.assignRoleToUser(testUser.id, testRole.id);
      console.log('Role assignment result:', result);
      
      if (result.success) {
        console.log('✅ Role assignment successful');
        console.log('User data after assignment:', result.data);
        console.log('New roleId:', result.data.roleId);
        
        // Verify the assignment by fetching fresh data
        const updatedUsers = await rolesService.getUsers();
        const updatedUser = updatedUsers.data.find(u => u.id === testUser.id);
        console.log('Updated user from fresh data:', updatedUser);
        console.log('Updated user roleId:', updatedUser?.roleId);
        
        // Test role removal
        const removeResult = await rolesService.removeRoleFromUser(testUser.id, testRole.id);
        console.log('Role removal result:', removeResult);
        
        if (removeResult.success) {
          console.log('✅ Role removal successful');
          console.log('User data after removal:', removeResult.data);
        } else {
          console.log('❌ Role removal failed');
        }
      } else {
        console.log('❌ Role assignment failed');
      }
    } else {
      console.log('❌ No users or roles available for testing');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test 5: Check backend API directly
async function checkBackendAPI() {
  try {
    console.log('Checking backend API directly...');
    
    // Get users directly from API
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend users response:', data);
      
      if (data.data && data.data.length > 0) {
        const firstUser = data.data[0];
        console.log('Backend first user:', firstUser);
        console.log('Backend user roles array:', firstUser.roles);
        console.log('Backend user _id:', firstUser._id);
      }
    } else {
      console.log('❌ Backend API call failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Backend API check failed:', error);
  }
}

// Test 6: Check data transformation
function checkDataTransformation() {
  console.log('Checking data transformation...');
  
  if (typeof window !== 'undefined') {
    // Check if we can access the component state
    const component = document.querySelector('[data-testid="roles-permissions"]');
    if (component) {
      console.log('✅ Roles permissions component found');
      
      // Try to access React component state (this might not work in production)
      try {
        const reactInstance = component._reactInternalFiber || component._reactInternalInstance;
        if (reactInstance) {
          console.log('React instance found');
        }
      } catch (e) {
        console.log('Could not access React instance');
      }
    } else {
      console.log('❌ Roles permissions component not found');
    }
  }
}

// Test 7: Check specific user (Akash Khairal) data
async function checkSpecificUser() {
  try {
    console.log('Checking specific user data...');
    
    const users = await rolesService.getUsers();
    const akashUser = users.data?.find(u => 
      u.name && u.name.toLowerCase().includes('akash')
    );
    
    if (akashUser) {
      console.log('Found Akash user:', akashUser);
      console.log('Akash roleId:', akashUser.roleId);
      console.log('Akash roles array:', akashUser.roles);
      
      // Check if roleId matches any role
      if (akashUser.roleId) {
        const roles = await rolesService.getRoles();
        const assignedRole = roles.data.find(r => r.id === akashUser.roleId);
        console.log('Akash assigned role:', assignedRole);
      }
    } else {
      console.log('❌ Akash user not found');
    }
  } catch (error) {
    console.error('Error checking specific user:', error);
  }
}

// Test 8: Test role assignment API directly
async function testDirectAPI() {
  try {
    console.log('Testing role assignment API directly...');
    
    const users = await rolesService.getUsers();
    const roles = await rolesService.getRoles();
    
    if (users.data && users.data.length > 0 && roles.data && roles.data.length > 0) {
      const testUser = users.data[0];
      const testRole = roles.data[0];
      
      console.log('Test user:', testUser);
      console.log('Test role:', testRole);
      
      // Make direct API call
      const response = await fetch(`/api/users/${testUser.id}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roles: [testRole.id] })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Direct API response:', result);
        
        if (result.success) {
          console.log('✅ Direct API role assignment successful');
          console.log('Updated user data:', result.data);
          
          // Check if roles array is properly populated
          if (result.data.roles && result.data.roles.length > 0) {
            console.log('User roles after assignment:', result.data.roles);
            console.log('First role ID:', result.data.roles[0]._id);
            console.log('First role name:', result.data.roles[0].name);
          }
        }
      } else {
        console.log('❌ Direct API call failed:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    }
  } catch (error) {
    console.error('❌ Direct API test failed:', error);
  }
}

// Run tests
console.log('Running tests...');
checkDataStructure();
checkUserDataStructure();

// Export test functions for manual testing
if (typeof window !== 'undefined') {
  window.testRoleAssignment = testRoleAssignment;
  window.checkBackendAPI = checkBackendAPI;
  window.checkDataTransformation = checkDataTransformation;
  window.checkSpecificUser = checkSpecificUser;
  window.testDirectAPI = testDirectAPI;
  console.log('Test functions available:');
  console.log('- window.testRoleAssignment()');
  console.log('- window.checkBackendAPI()');
  console.log('- window.checkDataTransformation()');
  console.log('- window.checkSpecificUser()');
  console.log('- window.testDirectAPI()');
}
