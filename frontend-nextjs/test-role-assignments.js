// Test script for role assignment functionality
// Run this in the browser console to test role assignments

console.log('🧪 Testing Role Assignment Functionality...');

// Test 1: Check if rolesService is available
if (typeof rolesService !== 'undefined') {
  console.log('✅ rolesService is available');
} else {
  console.log('❌ rolesService is not available');
}

// Test 2: Check if the component is loaded
const component = document.querySelector('[data-testid="roles-permissions"]');
if (component) {
  console.log('✅ Roles permissions component found');
} else {
  console.log('❌ Roles permissions component not found');
}

// Test 3: Check current user data structure
async function checkUserDataStructure() {
  try {
    console.log('🔍 Checking user data structure...');
    
    const users = await rolesService.getUsers();
    const roles = await rolesService.getRoles();
    
    console.log('📊 Users response:', users);
    console.log('📊 Roles response:', roles);
    
    if (users.data && users.data.length > 0) {
      console.log('👤 First user data:', users.data[0]);
      console.log('🆔 User ID:', users.data[0].id);
      console.log('👤 User Name:', users.data[0].name);
      console.log('📧 User Email:', users.data[0].email);
      console.log('🎭 User Role ID:', users.data[0].roleId);
      console.log('🎭 User Role:', users.data[0].role);
      console.log('📊 User Status:', users.data[0].status);
      console.log('🏢 User Department:', users.data[0].department);
      
      // Check if roleId matches any role
      if (users.data[0].roleId) {
        const assignedRole = roles.data.find(r => r.id === users.data[0].roleId);
        console.log('🎯 Assigned role:', assignedRole);
      }
    }
    
    if (roles.data && roles.data.length > 0) {
      console.log('🎭 First role data:', roles.data[0]);
      console.log('🆔 Role ID:', roles.data[0].id);
      console.log('📝 Role Name:', roles.data[0].name);
    }
  } catch (error) {
    console.error('❌ Error checking data structure:', error);
  }
}

// Test 4: Check specific user (Akash Khairal) data
async function checkSpecificUser() {
  try {
    console.log('🔍 Checking specific user data...');
    
    const users = await rolesService.getUsers();
    const akashUser = users.data?.find(u => 
      u.name && u.name.toLowerCase().includes('akash')
    );
    
    if (akashUser) {
      console.log('✅ Found Akash user:', akashUser);
      console.log('🆔 Akash ID:', akashUser.id);
      console.log('👤 Akash Name:', akashUser.name);
      console.log('📧 Akash Email:', akashUser.email);
      console.log('🎭 Akash Role ID:', akashUser.roleId);
      console.log('🎭 Akash Role:', akashUser.role);
      console.log('📊 Akash Status:', akashUser.status);
      console.log('🏢 Akash Department:', akashUser.department);
      
      // Check if roleId matches any role
      if (akashUser.roleId) {
        const roles = await rolesService.getRoles();
        const assignedRole = roles.data.find(r => r.id === akashUser.roleId);
        console.log('🎯 Akash assigned role:', assignedRole);
      }
    } else {
      console.log('❌ Akash user not found');
    }
  } catch (error) {
    console.error('❌ Error checking specific user:', error);
  }
}

// Test 5: Simulate role assignment with detailed logging
async function testRoleAssignment() {
  try {
    console.log('🧪 Testing role assignment...');
    
    // Get first user and first role
    const users = await rolesService.getUsers();
    const roles = await rolesService.getRoles();
    
    if (users.data && users.data.length > 0 && roles.data && roles.data.length > 0) {
      const testUser = users.data[0];
      const testRole = roles.data[0];
      
      console.log('👤 Test user before assignment:', testUser);
      console.log('🎭 Test role to assign:', testRole);
      console.log('🎭 Current user roleId:', testUser.roleId);
      
      // Test role assignment
      const result = await rolesService.assignRoleToUser(testUser.id, testRole.id);
      console.log('✅ Role assignment result:', result);
      
      if (result.success) {
        console.log('🎉 Role assignment successful');
        console.log('👤 User data after assignment:', result.data);
        console.log('🎭 New roleId:', result.data.roleId);
        
        // Verify the assignment by fetching fresh data
        const updatedUsers = await rolesService.getUsers();
        const updatedUser = updatedUsers.data.find(u => u.id === testUser.id);
        console.log('🔄 Updated user from fresh data:', updatedUser);
        console.log('🎭 Updated user roleId:', updatedUser?.roleId);
        
        // Test role removal
        const removeResult = await rolesService.removeRoleFromUser(testUser.id, testRole.id);
        console.log('🗑️ Role removal result:', removeResult);
        
        if (removeResult.success) {
          console.log('✅ Role removal successful');
          console.log('👤 User data after removal:', removeResult.data);
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

// Test 6: Check backend API directly
async function checkBackendAPI() {
  try {
    console.log('🔍 Checking backend API directly...');
    
    // Get users directly from API
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📡 Backend users response:', data);
      
      if (data.data && data.data.length > 0) {
        const firstUser = data.data[0];
        console.log('👤 Backend first user:', firstUser);
        console.log('🆔 Backend user _id:', firstUser._id);
        console.log('🎭 Backend user roles array:', firstUser.roles);
        console.log('📊 Backend user isActive:', firstUser.isActive);
        console.log('👤 Backend user firstName:', firstUser.firstName);
        console.log('👤 Backend user lastName:', firstUser.lastName);
        console.log('📧 Backend user email:', firstUser.email);
      }
    } else {
      console.log('❌ Backend API call failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Backend API check failed:', error);
  }
}

// Test 7: Check data transformation
function checkDataTransformation() {
  console.log('🔍 Checking data transformation...');
  
  if (typeof window !== 'undefined') {
    // Check if we can access the component state
    const component = document.querySelector('[data-testid="roles-permissions"]');
    if (component) {
      console.log('✅ Roles permissions component found');
      
      // Try to access React component state (this might not work in production)
      try {
        const reactInstance = component._reactInternalFiber || component._reactInternalInstance;
        if (reactInstance) {
          console.log('✅ React instance found');
        }
      } catch (e) {
        console.log('ℹ️ Could not access React instance');
      }
    } else {
      console.log('❌ Roles permissions component not found');
    }
  }
}

// Test 8: Test role assignment API directly
async function testDirectAPI() {
  try {
    console.log('🧪 Testing role assignment API directly...');
    
    const users = await rolesService.getUsers();
    const roles = await rolesService.getRoles();
    
    if (users.data && users.data.length > 0 && roles.data && roles.data.length > 0) {
      const testUser = users.data[0];
      const testRole = roles.data[0];
      
      console.log('👤 Test user:', testUser);
      console.log('🎭 Test role:', testRole);
      
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
        console.log('✅ Direct API response:', result);
        
        if (result.success) {
          console.log('🎉 Direct API role assignment successful');
          console.log('👤 Updated user data:', result.data);
          
          // Check if roles array is properly populated
          if (result.data.roles && result.data.roles.length > 0) {
            console.log('🎭 User roles after assignment:', result.data.roles);
            console.log('🆔 First role ID:', result.data.roles[0]._id);
            console.log('📝 First role name:', result.data.roles[0].name);
          }
        }
      } else {
        console.log('❌ Direct API call failed:', response.status);
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
      }
    }
  } catch (error) {
    console.error('❌ Direct API test failed:', error);
  }
}

// Test 9: Check UI state and rendering
function checkUIState() {
  console.log('🔍 Checking UI state...');
  
  // Check if users table is rendered
  const usersTable = document.querySelector('table');
  if (usersTable) {
    console.log('✅ Users table found');
    
    // Check table rows
    const rows = usersTable.querySelectorAll('tbody tr');
    console.log(`📊 Table has ${rows.length} user rows`);
    
    // Check if role information is displayed correctly
    rows.forEach((row, index) => {
      const roleCell = row.querySelector('td:nth-child(4)'); // Current Role column
      if (roleCell) {
        const roleText = roleCell.textContent;
        console.log(`👤 Row ${index + 1} role display:`, roleText.trim());
      }
    });
  } else {
    console.log('❌ Users table not found');
  }
  
  // Check if refresh buttons are working
  const refreshBtn = document.querySelector('button:contains("Refresh")');
  if (refreshBtn) {
    console.log('✅ Refresh button found');
  } else {
    console.log('❌ Refresh button not found');
  }
}

// Test 10: Comprehensive role assignment test
async function comprehensiveRoleTest() {
  try {
    console.log('🧪 Running comprehensive role assignment test...');
    
    // Step 1: Get current data
    const users = await rolesService.getUsers();
    const roles = await rolesService.getRoles();
    
    console.log(`📊 Found ${users.data?.length || 0} users and ${roles.data?.length || 0} roles`);
    
    if (!users.data || !roles.data || users.data.length === 0 || roles.data.length === 0) {
      console.log('❌ No users or roles available for testing');
      return;
    }
    
    // Step 2: Find a user without a role (unassigned)
    const unassignedUser = users.data.find(u => !u.roleId);
    const testRole = roles.data[0];
    
    if (!unassignedUser) {
      console.log('ℹ️ All users have roles assigned, testing with first user');
    } else {
      console.log('✅ Found unassigned user for testing:', unassignedUser.name);
    }
    
    const testUser = unassignedUser || users.data[0];
    
    // Step 3: Test role assignment
    console.log(`🎯 Assigning role "${testRole.name}" to user "${testUser.name}"`);
    const assignmentResult = await rolesService.assignRoleToUser(testUser.id, testRole.id);
    
    if (assignmentResult.success) {
      console.log('✅ Role assignment successful');
      
      // Step 4: Verify assignment
      const verifyUsers = await rolesService.getUsers();
      const verifiedUser = verifyUsers.data.find(u => u.id === testUser.id);
      
      if (verifiedUser && verifiedUser.roleId === testRole.id) {
        console.log('✅ Role assignment verified successfully');
        console.log(`👤 User "${verifiedUser.name}" now has role "${testRole.name}"`);
      } else {
        console.log('❌ Role assignment verification failed');
        console.log('Expected roleId:', testRole.id);
        console.log('Actual roleId:', verifiedUser?.roleId);
      }
      
      // Step 5: Test role removal
      console.log('🗑️ Testing role removal...');
      const removalResult = await rolesService.removeRoleFromUser(testUser.id, testRole.id);
      
      if (removalResult.success) {
        console.log('✅ Role removal successful');
        
        // Step 6: Verify removal
        const finalUsers = await rolesService.getUsers();
        const finalUser = finalUsers.data.find(u => u.id === testUser.id);
        
        if (!finalUser.roleId) {
          console.log('✅ Role removal verified successfully');
          console.log(`👤 User "${finalUser.name}" no longer has a role`);
        } else {
          console.log('❌ Role removal verification failed');
          console.log('User still has roleId:', finalUser.roleId);
        }
      } else {
        console.log('❌ Role removal failed');
      }
    } else {
      console.log('❌ Role assignment failed');
      console.log('Error:', assignmentResult.message);
    }
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
  }
}

// Run all tests
console.log('🚀 Starting comprehensive testing...');

// Export test functions for manual testing
if (typeof window !== 'undefined') {
  window.checkUserDataStructure = checkUserDataStructure;
  window.checkSpecificUser = checkSpecificUser;
  window.testRoleAssignment = testRoleAssignment;
  window.checkBackendAPI = checkBackendAPI;
  window.checkDataTransformation = checkDataTransformation;
  window.testDirectAPI = testDirectAPI;
  window.checkUIState = checkUIState;
  window.comprehensiveRoleTest = comprehensiveRoleTest;
  
  console.log('📋 Test functions available:');
  console.log('- window.checkUserDataStructure()');
  console.log('- window.checkSpecificUser()');
  console.log('- window.testRoleAssignment()');
  console.log('- window.checkBackendAPI()');
  console.log('- window.checkDataTransformation()');
  console.log('- window.testDirectAPI()');
  console.log('- window.checkUIState()');
  console.log('- window.comprehensiveRoleTest()');
  
  // Auto-run basic tests
  setTimeout(() => {
    console.log('🔄 Auto-running basic tests...');
    checkUserDataStructure();
    checkSpecificUser();
    checkUIState();
  }, 2000);
}

console.log('✅ Test script loaded successfully!');
console.log('💡 Navigate to the Roles & Permissions page and run the tests');
