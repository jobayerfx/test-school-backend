const axios = require('axios');

const BASE_URL = 'http://localhost:3000/auth';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testAuthMeEndpoint() {
  console.log('🔐 Testing /auth/me Endpoint...\n');

  try {
    console.log('📊 Testing with valid token...');
    const response = await axios.get(`${BASE_URL}/me`, { headers });
    
    if (response.data.success) {
      console.log('✅ /auth/me: SUCCESS');
      console.log(`   Status: ${response.status}`);
      console.log(`   Token Valid: ${response.data.data.tokenValid}`);
      console.log(`   User ID: ${response.data.data.user.id}`);
      console.log(`   User Name: ${response.data.data.user.name}`);
      console.log(`   User Email: ${response.data.data.user.email}`);
      console.log(`   User Role: ${response.data.data.user.role}`);
      console.log(`   Email Verified: ${response.data.data.user.isEmailVerified}`);
      console.log(`   Account Active: ${response.data.data.user.isActive}`);
      console.log(`   Total Tests Taken: ${response.data.data.user.totalTestsTaken}`);
      console.log(`   Last Login: ${response.data.data.user.lastLoginAt}`);
      console.log(`   Timestamp: ${response.data.data.timestamp}`);
    } else {
      console.log('❌ /auth/me: FAILED');
      console.log(`   Error: ${response.data.message}`);
    }
  } catch (error) {
    console.log('❌ /auth/me: ERROR');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
      console.log(`   Error: ${error.response.data?.error || 'No error details'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n📊 Testing without token...');
  try {
    const response = await axios.get(`${BASE_URL}/me`);
    console.log('❌ Should have failed without token');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Correctly rejected request without token');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message}`);
    } else {
      console.log('❌ Unexpected error without token');
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n📊 Testing with invalid token...');
  try {
    const invalidHeaders = {
      'Authorization': 'Bearer invalid-token-here',
      'Content-Type': 'application/json'
    };
    const response = await axios.get(`${BASE_URL}/me`, { headers: invalidHeaders });
    console.log('❌ Should have failed with invalid token');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Correctly rejected request with invalid token');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message}`);
    } else {
      console.log('❌ Unexpected error with invalid token');
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n🎉 /auth/me endpoint testing completed!');
}

// Run the tests
testAuthMeEndpoint().catch(console.error); 