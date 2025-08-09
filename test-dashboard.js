const axios = require('axios');

const BASE_URL = 'http://localhost:3000/report';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testDashboardEndpoints() {
  console.log('🧪 Testing Dashboard API Endpoints...\n');

  const endpoints = [
    { name: 'Complete Dashboard', path: '/dashboard/complete' },
    { name: 'Dashboard Stats', path: '/dashboard/stats' },
    { name: 'Test Trends', path: '/dashboard/trends' },
    { name: 'Competency Analytics', path: '/dashboard/competencies' },
    { name: 'User Demographics', path: '/dashboard/demographics' },
    { name: 'Performance Metrics', path: '/dashboard/performance' },
    { name: 'Top Performers', path: '/dashboard/top-performers' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📊 Testing ${endpoint.name}...`);
      const response = await axios.get(`${BASE_URL}${endpoint.path}`, { headers });
      
      if (response.data.success) {
        console.log(`✅ ${endpoint.name}: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data keys: ${Object.keys(response.data.data || {}).join(', ')}`);
      } else {
        console.log(`❌ ${endpoint.name}: FAILED`);
        console.log(`   Error: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    console.log('');
  }

  // Test with query parameters
  try {
    console.log('📊 Testing Top Performers with limit parameter...');
    const response = await axios.get(`${BASE_URL}/dashboard/top-performers?limit=5`, { headers });
    
    if (response.data.success) {
      console.log('✅ Top Performers with limit: SUCCESS');
      console.log(`   Status: ${response.status}`);
      console.log(`   Results count: ${response.data.data?.length || 0}`);
    } else {
      console.log('❌ Top Performers with limit: FAILED');
      console.log(`   Error: ${response.data.message}`);
    }
  } catch (error) {
    console.log('❌ Top Performers with limit: ERROR');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n🎉 Dashboard API testing completed!');
}

// Run the tests
testDashboardEndpoints().catch(console.error); 