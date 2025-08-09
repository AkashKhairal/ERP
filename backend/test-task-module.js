const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

let authToken = '';
let testTaskId = '';
let testProjectId = '';
let testUserId = '';

// Test functions
const testTaskModule = async () => {
  console.log('🚀 Starting Task Module Testing...\n');
  
  try {
    // 1. Test Authentication
    console.log('1. Testing Authentication...');
    await testAuthentication();
    console.log('✅ Authentication successful\n');

    // 2. Test Task CRUD Operations
    console.log('2. Testing Task CRUD Operations...');
    await testTaskCRUD();
    console.log('✅ Task CRUD operations successful\n');

    // 3. Test Task Status Updates (Kanban functionality)
    console.log('3. Testing Task Status Updates (Kanban)...');
    await testTaskStatusUpdates();
    console.log('✅ Task status updates successful\n');

    // 4. Test Task Assignment
    console.log('4. Testing Task Assignment...');
    await testTaskAssignment();
    console.log('✅ Task assignment successful\n');

    // 5. Test Comments and Subtasks
    console.log('5. Testing Comments and Subtasks...');
    await testCommentsAndSubtasks();
    console.log('✅ Comments and subtasks successful\n');

    // 6. Test Task Statistics
    console.log('6. Testing Task Statistics...');
    await testTaskStatistics();
    console.log('✅ Task statistics successful\n');

    // 7. Test Filtering and Search
    console.log('7. Testing Filtering and Search...');
    await testFilteringAndSearch();
    console.log('✅ Filtering and search successful\n');

    console.log('🎉 All Task Module Tests Passed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

const testAuthentication = async () => {
  try {
    // Try to login with admin credentials
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@company.com',
      password: 'admin123'
    }, testConfig);

    if (loginResponse.data.success) {
      authToken = loginResponse.data.token;
      testUserId = loginResponse.data.user._id;
      testConfig.headers.Authorization = `Bearer ${authToken}`;
      console.log('  ✓ Login successful');
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.log('  ⚠️  Admin login failed, trying to create admin user...');
    // If admin doesn't exist, create one
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@company.com',
      password: 'admin123',
      department: 'Engineering',
      role: 'Admin'
    }, testConfig);

    if (registerResponse.data.success) {
      console.log('  ✓ Admin user created');
      await testAuthentication(); // Retry login
    } else {
      throw new Error('Failed to create admin user');
    }
  }
};

const testTaskCRUD = async () => {
  // First, create a test project
  console.log('  Creating test project...');
  const projectResponse = await axios.post(`${API_URL}/projects`, {
    name: 'Test Project for Tasks',
    description: 'A test project for task module testing'
  }, testConfig);

  if (projectResponse.data.success) {
    testProjectId = projectResponse.data.data._id;
    console.log('  ✓ Test project created');
  }

  // Create Task
  console.log('  Creating test task...');
  const createResponse = await axios.post(`${API_URL}/tasks`, {
    title: 'Test Task for Module Testing',
    description: 'This is a comprehensive test task to verify all functionality',
    project: testProjectId,
    priority: 'high',
    type: 'feature',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    estimatedHours: 8,
    labels: ['testing', 'module'],
    tags: ['task-test']
  }, testConfig);

  if (createResponse.data.success) {
    testTaskId = createResponse.data.data._id;
    console.log('  ✓ Task created successfully');
  } else {
    throw new Error('Failed to create task');
  }

  // Read Task
  console.log('  Reading task...');
  const readResponse = await axios.get(`${API_URL}/tasks/${testTaskId}`, testConfig);
  if (readResponse.data.success) {
    console.log('  ✓ Task read successfully');
  } else {
    throw new Error('Failed to read task');
  }

  // Update Task
  console.log('  Updating task...');
  const updateResponse = await axios.put(`${API_URL}/tasks/${testTaskId}`, {
    title: 'Updated Test Task for Module Testing',
    description: 'This task has been updated to test update functionality',
    priority: 'urgent'
  }, testConfig);

  if (updateResponse.data.success) {
    console.log('  ✓ Task updated successfully');
  } else {
    throw new Error('Failed to update task');
  }

  // Get All Tasks
  console.log('  Getting all tasks...');
  const getAllResponse = await axios.get(`${API_URL}/tasks`, testConfig);
  if (getAllResponse.data.success) {
    console.log(`  ✓ Retrieved ${getAllResponse.data.data.length} tasks`);
  } else {
    throw new Error('Failed to get all tasks');
  }
};

const testTaskStatusUpdates = async () => {
  const statuses = ['todo', 'doing', 'review', 'done'];
  
  for (const status of statuses) {
    console.log(`  Updating task status to '${status}'...`);
    const statusResponse = await axios.put(`${API_URL}/tasks/${testTaskId}/status`, {
      status: status
    }, testConfig);

    if (statusResponse.data.success) {
      console.log(`  ✓ Status updated to '${status}'`);
    } else {
      throw new Error(`Failed to update status to '${status}'`);
    }
  }

  // Test getting tasks by status
  console.log('  Getting tasks by status...');
  const statusTasksResponse = await axios.get(`${API_URL}/tasks/status/done`, testConfig);
  if (statusTasksResponse.data.success) {
    console.log(`  ✓ Retrieved ${statusTasksResponse.data.data.length} tasks with 'done' status`);
  }
};

const testTaskAssignment = async () => {
  console.log('  Assigning task to user...');
  const assignResponse = await axios.put(`${API_URL}/tasks/${testTaskId}/assign`, {
    userId: testUserId
  }, testConfig);

  if (assignResponse.data.success) {
    console.log('  ✓ Task assigned successfully');
  } else {
    throw new Error('Failed to assign task');
  }

  // Test getting my tasks
  console.log('  Getting my tasks...');
  const myTasksResponse = await axios.get(`${API_URL}/tasks/my-tasks`, testConfig);
  if (myTasksResponse.data.success) {
    console.log(`  ✓ Retrieved ${myTasksResponse.data.data.length} assigned tasks`);
  }
};

const testCommentsAndSubtasks = async () => {
  // Add comment
  console.log('  Adding comment to task...');
  const commentResponse = await axios.post(`${API_URL}/tasks/${testTaskId}/comments`, {
    content: 'This is a test comment for the task module testing'
  }, testConfig);

  if (commentResponse.data.success) {
    console.log('  ✓ Comment added successfully');
  } else {
    throw new Error('Failed to add comment');
  }

  // Add subtask
  console.log('  Adding subtask to task...');
  const subtaskResponse = await axios.post(`${API_URL}/tasks/${testTaskId}/subtasks`, {
    title: 'Test Subtask 1'
  }, testConfig);

  if (subtaskResponse.data.success) {
    console.log('  ✓ Subtask added successfully');
  } else {
    throw new Error('Failed to add subtask');
  }

  // Complete subtask
  console.log('  Completing subtask...');
  const completeSubtaskResponse = await axios.put(`${API_URL}/tasks/${testTaskId}/subtasks/0/complete`, {}, testConfig);

  if (completeSubtaskResponse.data.success) {
    console.log('  ✓ Subtask completed successfully');
  } else {
    throw new Error('Failed to complete subtask');
  }
};

const testTaskStatistics = async () => {
  console.log('  Getting task statistics...');
  const statsResponse = await axios.get(`${API_URL}/tasks/stats`, testConfig);

  if (statsResponse.data.success) {
    const stats = statsResponse.data.data;
    console.log(`  ✓ Statistics retrieved:`);
    console.log(`    - Total Tasks: ${stats.totalTasks}`);
    console.log(`    - Completed Tasks: ${stats.completedTasks}`);
    console.log(`    - Overdue Tasks: ${stats.overdueTasks}`);
    console.log(`    - Tasks by Status: ${stats.tasksByStatus.length} categories`);
    console.log(`    - Tasks by Priority: ${stats.tasksByPriority.length} categories`);
    console.log(`    - Tasks by Type: ${stats.tasksByType.length} categories`);
  } else {
    throw new Error('Failed to get task statistics');
  }
};

const testFilteringAndSearch = async () => {
  // Test search
  console.log('  Testing task search...');
  const searchResponse = await axios.get(`${API_URL}/tasks?search=test`, testConfig);
  if (searchResponse.data.success) {
    console.log(`  ✓ Search returned ${searchResponse.data.data.length} tasks`);
  }

  // Test priority filter
  console.log('  Testing priority filter...');
  const priorityResponse = await axios.get(`${API_URL}/tasks?priority=urgent`, testConfig);
  if (priorityResponse.data.success) {
    console.log(`  ✓ Priority filter returned ${priorityResponse.data.data.length} tasks`);
  }

  // Test project filter
  console.log('  Testing project filter...');
  const projectResponse = await axios.get(`${API_URL}/tasks?project=${testProjectId}`, testConfig);
  if (projectResponse.data.success) {
    console.log(`  ✓ Project filter returned ${projectResponse.data.data.length} tasks`);
  }

  // Test overdue tasks
  console.log('  Testing overdue tasks...');
  const overdueResponse = await axios.get(`${API_URL}/tasks/overdue`, testConfig);
  if (overdueResponse.data.success) {
    console.log(`  ✓ Overdue tasks retrieved: ${overdueResponse.data.data.length} tasks`);
  }
};

// Cleanup function
const cleanup = async () => {
  if (testTaskId && authToken) {
    try {
      console.log('\n🧹 Cleaning up test data...');
      await axios.delete(`${API_URL}/tasks/${testTaskId}`, testConfig);
      console.log('✓ Test task deleted');
      
      if (testProjectId) {
        await axios.delete(`${API_URL}/projects/${testProjectId}`, testConfig);
        console.log('✓ Test project deleted');
      }
    } catch (error) {
      console.log('⚠️  Cleanup warning:', error.message);
    }
  }
};

// Run tests
testTaskModule()
  .then(() => cleanup())
  .catch((error) => {
    console.error('❌ Test suite failed:', error.message);
    cleanup();
  });

module.exports = { testTaskModule };
