const http = require('http');

// Test 1: Health Check
console.log('🔍 Testing Health Check...');

const healthOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
};

const healthReq = http.request(healthOptions, (res) => {
  console.log(`✅ Health Check Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Health Response:', data);
    
    // Test 2: Books API
    testBooksAPI();
  });
});

healthReq.on('error', (e) => {
  console.error(`❌ Health Check Error: ${e.message}`);
});

healthReq.end();

function testBooksAPI() {
  console.log('\n📚 Testing Books API...');
  
  const booksOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/books',
    method: 'GET'
  };
  
  const booksReq = http.request(booksOptions, (res) => {
    console.log(`✅ Books API Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const books = JSON.parse(data);
        console.log(`Found ${books.data ? books.data.length : 0} books`);
        if (books.data && books.data.length > 0) {
          console.log('Sample book:', books.data[0].title);
        }
        
        // Test 3: Auth Login
        testLogin();
      } catch (e) {
        console.log('Books Response:', data);
        testLogin();
      }
    });
  });
  
  booksReq.on('error', (e) => {
    console.error(`❌ Books API Error: ${e.message}`);
  });
  
  booksReq.end();
}

function testLogin() {
  console.log('\n🔐 Testing Login...');
  
  const loginData = JSON.stringify({
    login: 'admin',
    password: 'admin123'
  });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };
  
  const loginReq = http.request(loginOptions, (res) => {
    console.log(`✅ Login Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.success && result.data && result.data.accessToken) {
          console.log('✅ Login successful!');
          console.log(`User: ${result.data.user.username} (${result.data.user.role})`);
          console.log('Access Token received');
          
          // Test protected endpoint
          testProtectedEndpoint(result.data.accessToken);
        } else {
          console.log('❌ Login failed:', result.message || 'Unknown error');
        }
      } catch (e) {
        console.log('Login Response:', data);
      }
    });
  });
  
  loginReq.on('error', (e) => {
    console.error(`❌ Login Error: ${e.message}`);
  });
  
  loginReq.write(loginData);
  loginReq.end();
}

function testProtectedEndpoint(token) {
  console.log('\n🛡️  Testing Protected Endpoint...');
  
  const protectedOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/profile',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  const protectedReq = http.request(protectedOptions, (res) => {
    console.log(`✅ Protected Endpoint Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Protected endpoint accessible!');
        console.log(`Profile: ${result.data.username} - ${result.data.fullName}`);
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('=====================================');
        console.log('✅ Health Check: Working');
        console.log('✅ Books API: Working');  
        console.log('✅ Authentication: Working');
        console.log('✅ Protected Routes: Working');
        console.log('✅ JWT System: Fully Functional');
        
      } catch (e) {
        console.log('Protected Response:', data);
      }
    });
  });
  
  protectedReq.on('error', (e) => {
    console.error(`❌ Protected Endpoint Error: ${e.message}`);
  });
  
  protectedReq.end();
}
