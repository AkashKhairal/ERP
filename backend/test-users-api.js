const axios = require('axios');

const testUsersAPI = async () => {
  try {
    console.log('🧪 Testing Users API...');
    
    const response = await axios.get('http://localhost:5000/api/users');
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data Structure:');
    console.log('  - success:', response.data.success);
    console.log('  - message:', response.data.message);
    console.log('  - data length:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n👤 First User Data:');
      const firstUser = response.data.data[0];
      console.log('  - _id:', firstUser._id);
      console.log('  - firstName:', firstUser.firstName);
      console.log('  - lastName:', firstUser.lastName);
      console.log('  - email:', firstUser.email);
      console.log('  - isActive:', firstUser.isActive);
      console.log('  - roles array:', firstUser.roles);
      console.log('  - roles length:', firstUser.roles?.length || 0);
      
      if (firstUser.roles && firstUser.roles.length > 0) {
        console.log('  - First role object:', firstUser.roles[0]);
        console.log('  - First role _id:', firstUser.roles[0]._id);
        console.log('  - First role name:', firstUser.roles[0].name);
      }
      
      // Check Akash Khairal specifically
      const akashUser = response.data.data.find(u => 
        u.firstName === 'Akash' && u.lastName === 'Khairal'
      );
      
      if (akashUser) {
        console.log('\n🎯 Akash Khairal API Response:');
        console.log('  - _id:', akashUser._id);
        console.log('  - roles array:', akashUser.roles);
        console.log('  - roles length:', akashUser.roles?.length || 0);
        
        if (akashUser.roles && akashUser.roles.length > 0) {
          console.log('  - First role _id:', akashUser.roles[0]._id);
          console.log('  - First role name:', akashUser.roles[0].name);
        }
      } else {
        console.log('\n❌ Akash Khairal not found in API response');
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
  }
};

testUsersAPI();
