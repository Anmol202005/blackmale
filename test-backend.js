const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend health...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Backend is healthy:', healthResponse.data);

    console.log('\nTesting alias generation...');
    const aliasResponse = await axios.post('http://localhost:3001/api/aliases/generate');
    console.log('✅ Alias generated:', aliasResponse.data);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackend();