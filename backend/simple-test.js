const axios = require('axios');

async function simpleTest() {
  try {
    console.log('Testing server health...');
    const health = await axios.get('http://localhost:3000/health');
    console.log('Health check:', health.data);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }

  try {
    console.log('Testing auth login...');
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      login: 'admin', 
      password: 'admin123'
    }, {
      timeout: 5000
    });
    console.log('Login success:', login.data);
  } catch (error) {
    console.error('Login failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

simpleTest();
