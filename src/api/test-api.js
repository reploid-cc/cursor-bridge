/**
 * Script kiểm thử API
 * 
 * Script đơn giản để test các API endpoint của cursor-bridge
 * Chạy bằng lệnh: node src/api/test-api.js
 */

const axios = require('axios');
const { URL } = require('url');

// Biến cấu hình
const API_HOST = 'localhost';
const API_PORT = process.env.API_PORT || 1000;
const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

// Test helper
const testEndpoint = async (url, method = 'GET', data = null) => {
  const fullUrl = new URL(url, API_BASE_URL).toString();
  console.log(`Testing ${method} ${fullUrl}...`);
  
  try {
    let response;
    if (method === 'GET') {
      response = await axios.get(fullUrl);
    } else if (method === 'POST') {
      response = await axios.post(fullUrl, data);
    }
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response: ${JSON.stringify(response.data, null, 2)}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.response) {
      console.error(`📄 Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
};

// Kiểm thử tất cả các endpoint
async function testAllEndpoints() {
  console.log('=== Testing cursor-bridge API ===');
  
  // Test health endpoint
  await testEndpoint('/health');
  
  // Test status endpoint
  await testEndpoint('/api/status');
  
  // Test n8n connection
  await testEndpoint('/api/n8n-check');
  
  // Test process endpoint với dữ liệu hợp lệ
  const validData = {
    model: 'claude-3.7',
    prompt: 'Hãy giải thích cách Docker hoạt động trong 3 câu.',
    timeout: 60000
  };
  
  // Test process endpoint với dữ liệu không hợp lệ
  const invalidData = {
    model: 'invalid-model',
    prompt: 'Test prompt'
  };
  
  // Test process endpoint (uncomment để thực thi)
  await testEndpoint('/api/process', 'POST', validData);
  await testEndpoint('/api/process', 'POST', invalidData);
  
  console.log('=== Testing completed ===');
}

// Chạy test
testAllEndpoints()
  .then(() => {
    console.log('Test script completed successfully');
  })
  .catch((error) => {
    console.error(`Test script failed: ${error.message}`);
  }); 