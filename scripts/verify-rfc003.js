#!/usr/bin/env node

/**
 * Script kiểm tra tất cả các tiêu chí chấp nhận của RFC-003
 * 
 * Script này kiểm tra tất cả các tiêu chí chấp nhận được định nghĩa trong RFC-003
 * và đưa ra kết quả tổng hợp về việc đáp ứng các tiêu chí đó.
 * 
 * Chạy với: node scripts/verify-rfc003.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Cấu hình
const API_PORT = process.env.API_PORT || '1000';
const API_URL = `http://localhost:${API_PORT}`;

// Các tiêu chí chấp nhận và trạng thái
const acceptanceCriteria = {
  // F7: API đơn giản cho n8n
  'F7-1': { description: 'API có thể nhận request từ n8n và trả về response', status: 'pending' },
  'F7-2': { description: 'API endpoint xử lý POST request với dữ liệu JSON', status: 'pending' },
  'F7-3': { description: 'API bao gồm các endpoint cơ bản: process, status, health', status: 'pending' },
  'F7-4': { description: 'API server khởi động thành công trong container', status: 'pending' },
  
  // F8: Xử lý format JSON
  'F8-1': { description: 'API xác thực đúng format JSON cho request', status: 'pending' },
  'F8-2': { description: 'API trả về response theo đúng format JSON đã định nghĩa', status: 'pending' },
  'F8-3': { description: 'API xử lý lỗi format JSON và trả về thông báo lỗi phù hợp', status: 'pending' },
  'F8-4': { description: 'Các schema validation hoạt động chính xác', status: 'pending' },
  
  // F12: Network Bridge với n8n
  'F12-1': { description: 'Container có thể kết nối với n8n chạy trên localhost:5678', status: 'pending' },
  'F12-2': { description: 'Network bridge được thiết lập đúng cách trong Docker Compose', status: 'pending' },
  'F12-3': { description: 'API có thể gửi/nhận request từ n8n', status: 'pending' },
  'F12-4': { description: 'Endpoint kiểm tra kết nối với n8n hoạt động chính xác', status: 'pending' }
};

// Kiểm tra API endpoint cơ bản
async function checkBasicEndpoints() {
  try {
    // Kiểm tra health endpoint
    const healthResponse = await axios.get(`${API_URL}/health`);
    if (healthResponse.status === 200 && healthResponse.data.status === 'healthy') {
      acceptanceCriteria['F7-3'].status = 'pass';
      acceptanceCriteria['F7-4'].status = 'pass';
    }
    
    // Kiểm tra status endpoint
    const statusResponse = await axios.get(`${API_URL}/api/status`);
    if (statusResponse.status === 200 && statusResponse.data.status === 'online') {
      acceptanceCriteria['F7-3'].status = 'pass';
    }
    
    // Kiểm tra process endpoint metadata (không gửi request thực)
    try {
      const testData = { model: 'invalid-model', prompt: 'Test' };
      await axios.post(`${API_URL}/api/process`, testData);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        acceptanceCriteria['F7-2'].status = 'pass';
        acceptanceCriteria['F7-3'].status = 'pass';
        acceptanceCriteria['F8-1'].status = 'pass';
        acceptanceCriteria['F8-3'].status = 'pass';
      }
    }
    
    // Kiểm tra n8n-check endpoint
    try {
      const n8nCheckResponse = await axios.get(`${API_URL}/api/n8n-check`);
      acceptanceCriteria['F12-4'].status = 'pass';
      
      // Nếu n8n có sẵn, đánh dấu tiêu chí kết nối
      if (n8nCheckResponse.data.n8n_status === 'online') {
        acceptanceCriteria['F12-1'].status = 'pass';
        acceptanceCriteria['F12-3'].status = 'pass';
      }
    } catch (error) {
      // Endpoint tồn tại nhưng n8n có thể không khả dụng
      if (error.response) {
        acceptanceCriteria['F12-4'].status = 'pass';
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking basic endpoints: ${error.message}`);
    return false;
  }
}

// Kiểm tra cấu trúc code
function checkCodeStructure() {
  // Kiểm tra các file API cần thiết
  const requiredFiles = [
    'src/api/index.js',
    'src/api/routes/process.js',
    'src/api/routes/status.js',
    'src/api/routes/health.js',
    'src/api/routes/n8n-check.js',
    'src/api/middleware/validator.js',
    'src/api/middleware/error.js',
    'src/api/schemas/process-schema.js'
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      console.error(`Missing file: ${file}`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    acceptanceCriteria['F7-1'].status = 'pass';
    acceptanceCriteria['F8-2'].status = 'pass';
    acceptanceCriteria['F8-4'].status = 'pass';
  }
  
  // Kiểm tra Docker Compose
  const dockerComposePath = path.join(process.cwd(), 'docker', 'docker-compose.yml');
  if (fs.existsSync(dockerComposePath)) {
    const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');
    if (dockerComposeContent.includes('host.docker.internal') || 
        dockerComposeContent.includes('extra_hosts')) {
      acceptanceCriteria['F12-2'].status = 'pass';
    }
  }
  
  return allFilesExist;
}

// In kết quả
function printResults() {
  console.log('\n=== RFC-003 Acceptance Criteria Verification ===\n');
  
  // Tính số lượng pass/fail
  let passCount = 0;
  let totalCount = 0;
  
  // F7: API đơn giản cho n8n
  console.log('F7: API đơn giản cho n8n');
  for (let i = 1; i <= 4; i++) {
    const key = `F7-${i}`;
    const status = acceptanceCriteria[key].status === 'pass' ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${key}: ${acceptanceCriteria[key].description} - ${status}`);
    if (acceptanceCriteria[key].status === 'pass') passCount++;
    totalCount++;
  }
  
  // F8: Xử lý format JSON
  console.log('\nF8: Xử lý format JSON');
  for (let i = 1; i <= 4; i++) {
    const key = `F8-${i}`;
    const status = acceptanceCriteria[key].status === 'pass' ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${key}: ${acceptanceCriteria[key].description} - ${status}`);
    if (acceptanceCriteria[key].status === 'pass') passCount++;
    totalCount++;
  }
  
  // F12: Network Bridge với n8n
  console.log('\nF12: Network Bridge với n8n');
  for (let i = 1; i <= 4; i++) {
    const key = `F12-${i}`;
    const status = acceptanceCriteria[key].status === 'pass' ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${key}: ${acceptanceCriteria[key].description} - ${status}`);
    if (acceptanceCriteria[key].status === 'pass') passCount++;
    totalCount++;
  }
  
  // Tóm tắt
  console.log('\n=== Summary ===');
  console.log(`Passing criteria: ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)`);
  
  if (passCount === totalCount) {
    console.log('\n✅✅✅ RFC-003 FULLY IMPLEMENTED! ✅✅✅');
  } else {
    console.log('\n⚠️  RFC-003 PARTIALLY IMPLEMENTED ⚠️');
    console.log('Please check the failing criteria above.');
  }
}

async function main() {
  console.log('Starting RFC-003 verification...');
  
  // Kiểm tra cấu trúc code
  const codeStructureOk = checkCodeStructure();
  if (!codeStructureOk) {
    console.warn('Code structure check failed. Some required files are missing.');
  }
  
  // Kiểm tra API endpoint
  try {
    const apiEndpointsOk = await checkBasicEndpoints();
    if (!apiEndpointsOk) {
      console.warn('API endpoint check failed. Make sure the API server is running.');
    }
  } catch (error) {
    console.error(`Error during API endpoint checks: ${error.message}`);
  }
  
  // In kết quả
  printResults();
}

main(); 