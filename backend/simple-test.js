const axios = require('axios');

const testServer = async () => {
  try {
    console.log('🧪 Testing server connection...');
    
    // Test basic connection
    const response = await axios.get('http://localhost:5000/api/users', {
      timeout: 5000
    });
    
    console.log('✅ Server is responding!');
    console.log('Status:', response.status);
    console.log('Data length:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      const firstUser = response.data.data[0];
      console.log('\n👤 First User:');
      console.log('  - Name:', firstUser.firstName, firstUser.lastName);
      console.log('  - Roles:', firstUser.roles);
      console.log('  - Roles length:', firstUser.roles?.length || 0);
      
      if (firstUser.roles && firstUser.roles.length > 0) {
        console.log('  - First role _id:', firstUser.roles[0]._id);
        console.log('  - First role name:', firstUser.roles[0].name);
      }
    }
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('  Server is not running on port 5000');
    } else if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
  }
};

testServer();
