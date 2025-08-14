const axios = require('axios');

const baseURL = 'http://localhost:3000/api/auth';

async function testAuthentication() {
  console.log('🔐 Testing JWT Authentication System');
  console.log('=====================================');
  
  try {
    // 1. Test Login
    console.log('\n1. Testing Login...');
    const loginResponse = await axios.post(`${baseURL}/login`, {
      login: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
    
    const { accessToken, refreshToken } = loginResponse.data.data;
    
    // 2. Test Profile Access
    console.log('\n2. Testing Profile Access...');
    const profileResponse = await axios.get(`${baseURL}/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Profile access successful!');
    console.log('Profile:', JSON.stringify(profileResponse.data, null, 2));
    
    // 3. Test Token Refresh
    console.log('\n3. Testing Token Refresh...');
    const refreshResponse = await axios.post(`${baseURL}/refresh`, {
      refreshToken: refreshToken
    });
    
    console.log('✅ Token refresh successful!');
    console.log('New tokens:', JSON.stringify(refreshResponse.data, null, 2));
    
    // 4. Test User Login
    console.log('\n4. Testing User Login...');
    const userLoginResponse = await axios.post(`${baseURL}/login`, {
      login: 'testuser',
      password: 'user123'
    });
    
    console.log('✅ User login successful!');
    console.log('User tokens:', JSON.stringify(userLoginResponse.data, null, 2));
    
    // 5. Test Invalid Login
    console.log('\n5. Testing Invalid Login...');
    try {
      await axios.post(`${baseURL}/login`, {
        login: 'invalid',
        password: 'wrong'
      });
    } catch (error) {
      console.log('✅ Invalid login properly rejected!');
      console.log('Error:', error.response.data.message);
    }
    
    console.log('\n🎉 All authentication tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testAuthentication();
