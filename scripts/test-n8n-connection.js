#!/usr/bin/env node

/**
 * Script kiểm tra kết nối hai chiều giữa cursor-bridge và n8n
 * Được sử dụng để xác minh network bridge hoạt động đúng
 * 
 * Chạy với: node scripts/test-n8n-connection.js
 */

const axios = require('axios');

// Cấu hình
const N8N_HOST = process.env.N8N_HOST || 'host.docker.internal';
const N8N_PORT = process.env.N8N_PORT || '5678';
const API_PORT = process.env.API_PORT || '1000';

// Kiểm tra kết nối từ cursor-bridge đến n8n
async function testConnectionToN8n() {
  console.log(`Testing connection to n8n (${N8N_HOST}:${N8N_PORT})...`);
  
  try {
    const response = await axios.get(`http://${N8N_HOST}:${N8N_PORT}/healthz`, {
      timeout: 5000
    });
    
    console.log('✅ Connection to n8n successful');
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    return true;
  } catch (error) {
    console.error('❌ Connection to n8n failed');
    console.error(`Error: ${error.message}`);
    return false;
  }
}

// Kiểm tra endpoint n8n-check
async function testN8nCheckEndpoint() {
  console.log(`Testing API endpoint /api/n8n-check on port ${API_PORT}...`);
  
  try {
    const response = await axios.get(`http://localhost:${API_PORT}/api/n8n-check`, {
      timeout: 5000
    });
    
    console.log('✅ API endpoint /api/n8n-check successful');
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    return true;
  } catch (error) {
    console.error('❌ API endpoint /api/n8n-check failed');
    console.error(`Error: ${error.message}`);
    return false;
  }
}

// Hàm chạy chính
async function main() {
  console.log('=== Testing network bridge connection ===\n');
  
  // Kiểm tra kết nối trực tiếp đến n8n
  const n8nConnected = await testConnectionToN8n();
  console.log();
  
  // Kiểm tra API endpoint
  const endpointWorking = await testN8nCheckEndpoint();
  console.log();
  
  // Kết luận
  console.log('=== Test Results ===');
  console.log(`Direct connection to n8n: ${n8nConnected ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`API endpoint /api/n8n-check: ${endpointWorking ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  if (n8nConnected && endpointWorking) {
    console.log('\n✅✅✅ Network bridge is working correctly! ✅✅✅');
    process.exit(0);
  } else {
    console.log('\n❌❌❌ Network bridge has issues! Please check your configuration. ❌❌❌');
    
    // Đề xuất giải pháp
    if (!n8nConnected) {
      console.log('\nSuggestions for fixing direct connection:');
      console.log('1. Make sure n8n is running on port 5678');
      console.log('2. Check if host.docker.internal is configured correctly in Docker');
      console.log('3. For Linux, add "extra_hosts: - host.docker.internal:host-gateway" to docker-compose.yml');
    }
    
    if (!endpointWorking) {
      console.log('\nSuggestions for fixing API endpoint:');
      console.log('1. Make sure cursor-bridge API is running on port 1000');
      console.log('2. Check if route /api/n8n-check is registered in API server');
    }
    
    process.exit(1);
  }
}

main(); 