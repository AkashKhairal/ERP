const https = require('https');

async function testGoogleAuthAPI() {
  try {
    console.log('🧪 TESTING GOOGLE AUTH API DIRECTLY\n');
    
    // This is just a test to see what the API returns
    // We'll simulate what happens when a user logs in
    
    console.log('🔍 Testing backend health first...');
    
    const options = {
      hostname: 'creatorbase-backend.onrender.com',
      port: 443,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ Backend health check response:', JSON.parse(data));
        console.log('🔄 Backend is accessible\n');
        
        // Now let's check what users are available by testing an auth endpoint
        // We'll need to check the users endpoint if possible
        checkUsersEndpoint();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Error:', error);
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

async function checkUsersEndpoint() {
  console.log('🔍 Checking users endpoint (this will likely fail without auth)...');
  
  const options = {
    hostname: 'creatorbase-backend.onrender.com',
    port: 443,
    path: '/api/users',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Users endpoint response (${res.statusCode}):`, data);
      
      if (res.statusCode === 401) {
        console.log('🔒 As expected, authentication required');
      }
      
      console.log('\n🔧 ANALYSIS:');
      console.log('The issue is likely that when Akash logs in with Google:');
      console.log('1. Google auth creates/finds a user with a specific ID');
      console.log('2. JWT token is generated with that user ID');
      console.log('3. Frontend stores and uses that token for API calls');
      console.log('4. But notifications/roles were assigned to a different user ID');
      console.log('\n💡 SOLUTION:');
      console.log('We need to either:');
      console.log('1. Fix the user ID mismatch in the database');
      console.log('2. Or assign roles/notifications to the correct user ID');
      console.log('\n🚀 Let\'s try to access the database directly...');
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });
  
  req.end();
}

testGoogleAuthAPI();

