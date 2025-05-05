/**
 * Script kiểm tra tiêu chí chấp nhận cho RFC-004
 * Trích xuất kết quả và Xử lý dữ liệu
 */

require('dotenv').config();
const axios = require('axios');
const { BrowserOrchestrator } = require('../src/browser');
const { ResultExtractor, extractorSelectors } = require('../src/extractor');
const { PromptOptimizer } = require('../src/prompt');

// URL API
const API_URL = process.env.API_URL || 'http://localhost:1000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Main function to verify RFC-004 acceptance criteria
async function verifyRFC004() {
  console.log(`${colors.blue}=== Kiểm tra tiêu chí chấp nhận RFC-004 ===${colors.reset}`);
  
  let allPassed = true;
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Verify F9: Trích xuất kết quả từ Cursor
  console.log(`\n${colors.blue}Kiểm tra F9: Trích xuất kết quả từ Cursor${colors.reset}`);
  
  // Kiểm tra 1: Trích xuất text từ Claude 3.7
  await verifyTest(
    'Trích xuất text đơn giản từ Claude 3.7',
    async () => {
      const response = await axios.post(`${API_URL}/process`, {
        model: 'claude-3.7',
        prompt: 'Viết một câu về AI',
        output_format: 'text'
      });
      
      const result = response.data.result;
      return result && result.text && result.text.length > 0;
    },
    results
  );
  
  // Kiểm tra 2: Trích xuất JSON từ Claude 3.7
  await verifyTest(
    'Trích xuất kết quả dạng JSON',
    async () => {
      const response = await axios.post(`${API_URL}/process`, {
        model: 'claude-3.7',
        prompt: 'Liệt kê 3 ngôn ngữ lập trình phổ biến. Trả lời dưới dạng JSON với format: {"languages": ["language1", "language2", "language3"]}',
        output_format: 'json'
      });
      
      const result = response.data.result;
      return result && (result.languages || result.text);
    },
    results
  );
  
  // Kiểm tra 3: Trích xuất Markdown
  await verifyTest(
    'Trích xuất kết quả dạng Markdown',
    async () => {
      const response = await axios.post(`${API_URL}/process`, {
        model: 'claude-3.7',
        prompt: 'Viết một đoạn hướng dẫn ngắn về cài đặt Docker với định dạng Markdown bao gồm tiêu đề và danh sách có dấu gạch đầu dòng.',
        output_format: 'markdown'
      });
      
      const result = response.data.result;
      return result && result.markdown && result.markdown.includes('#') && result.markdown.includes('-');
    },
    results
  );
  
  // Kiểm tra F13: Prompt Optimization đơn giản
  console.log(`\n${colors.blue}Kiểm tra F13: Prompt Optimization đơn giản${colors.reset}`);
  
  // Kiểm tra 4: Tối ưu prompt để nhận kết quả cô đọng
  await verifyTest(
    'Tối ưu prompt hiệu quả',
    async () => {
      const optimizer = new PromptOptimizer();
      
      const originalPrompt = "Hello there! Can you please introduce yourself first and then tell me a bit about what Docker is? Thanks in advance for your help!";
      const optimizedPrompt = optimizer.optimize(originalPrompt, { outputFormat: 'text' });
      
      // Check if redundancies are removed
      return optimizedPrompt.length < originalPrompt.length && 
             !optimizedPrompt.includes("Hello there") &&
             !optimizedPrompt.includes("Thanks in advance");
    },
    results
  );
  
  // Kiểm tra 5: Thêm hướng dẫn định dạng
  await verifyTest(
    'Thêm hướng dẫn định dạng phù hợp',
    async () => {
      const optimizer = new PromptOptimizer();
      
      // Test for JSON format
      const jsonPrompt = "What are the top 3 cloud providers?";
      const optimizedJsonPrompt = optimizer.optimize(jsonPrompt, { outputFormat: 'json' });
      
      // Test for Markdown format
      const mdPrompt = "Explain how containers differ from virtual machines";
      const optimizedMdPrompt = optimizer.optimize(mdPrompt, { outputFormat: 'markdown' });
      
      return optimizedJsonPrompt.includes('JSON') && 
             optimizedMdPrompt.includes('Markdown');
    },
    results
  );
  
  // Kiểm tra 6: Endpoint API trả về kết quả cấu trúc đúng
  await verifyTest(
    'API endpoint trả về kết quả cấu trúc đúng',
    async () => {
      const response = await axios.post(`${API_URL}/process`, {
        model: 'claude-3.7',
        prompt: 'Hello',
        output_format: 'text'
      });
      
      return response.data && 
             response.data.request_id && 
             response.data.status === 'success' && 
             response.data.model && 
             response.data.result && 
             response.data.processing_time && 
             response.data.timestamp;
    },
    results
  );
  
  // In tổng kết
  console.log(`\n${colors.blue}=== Tổng kết ===`);
  console.log(`Tổng số kiểm tra: ${results.total}`);
  console.log(`Đạt: ${colors.green}${results.passed}${colors.reset}`);
  console.log(`Thất bại: ${results.failed > 0 ? colors.red : colors.reset}${results.failed}${colors.reset}`);
  
  if (results.failed > 0) {
    console.log(`\n${colors.red}Chưa đạt tất cả tiêu chí.${colors.reset}`);
    return process.exit(1);
  } else {
    console.log(`\n${colors.green}Đạt tất cả tiêu chí!${colors.reset}`);
    return process.exit(0);
  }
}

// Helper function to run and verify a single test
async function verifyTest(name, testFn, results) {
  results.total++;
  
  try {
    process.stdout.write(`Kiểm tra: ${name}... `);
    const passed = await testFn();
    
    if (passed) {
      results.passed++;
      console.log(`${colors.green}OK${colors.reset}`);
    } else {
      results.failed++;
      console.log(`${colors.red}THẤT BẠI${colors.reset}`);
    }
  } catch (error) {
    results.failed++;
    console.log(`${colors.red}LỖI: ${error.message}${colors.reset}`);
  }
}

// Run the verification
verifyRFC004().catch(error => {
  console.error(`${colors.red}Lỗi không xử lý được:${colors.reset}`, error);
  process.exit(1);
}); 