#!/usr/bin/env node

/**
 * cursor-bridge main entry point
 * 
 * Khởi động API server và các thành phần cần thiết
 * cho việc tương tác với Cursor IDE thông qua n8n.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { startServer } = require('./api');
const winston = require('winston');

// Đảm bảo thư mục logs tồn tại
const logsDir = path.join(__dirname, '..', 'volumes', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Đảm bảo thư mục config tồn tại
const configDir = path.join(__dirname, '..', 'volumes', 'config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Thiết lập logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'app.log') 
    })
  ]
});

// Khởi động ứng dụng
async function main() {
  try {
    // Thông tin hệ thống
    logger.info('cursor-bridge container started');
    logger.info(`Node.js version: ${process.version}`);
    logger.info(`Operating system: ${os.type()} ${os.release()}`);
    logger.info(`Architecture: ${os.arch()}`);
    logger.info(`CPUs: ${os.cpus().length}`);
    logger.info(`Total memory: ${Math.round(os.totalmem() / (1024 * 1024))} MB`);
    logger.info(`Free memory: ${Math.round(os.freemem() / (1024 * 1024))} MB`);

    // Kiểm tra biến môi trường
    logger.info('Environment configuration:');
    logger.info(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    logger.info(`API_PORT: ${process.env.API_PORT || '1000 (default)'}`);
    logger.info(`BROWSER_TYPE: ${process.env.BROWSER_TYPE || 'chrome (default)'}`);
    logger.info(`LOG_LEVEL: ${process.env.LOG_LEVEL || 'info (default)'}`);
    logger.info(`N8N_HOST: ${process.env.N8N_HOST || 'host.docker.internal (default)'}`);
    logger.info(`N8N_PORT: ${process.env.N8N_PORT || '5678 (default)'}`);
    
    // Kiểm tra thông tin đăng nhập Cursor
    if (!process.env.CURSOR_USERNAME || !process.env.CURSOR_PASSWORD) {
      logger.warn('CURSOR_USERNAME or CURSOR_PASSWORD not set. API calls requiring authentication will fail.');
    }

    // Khởi động API server
    const server = await startServer();
    logger.info('API server is running');

    // Xử lý graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Received SIGINT. Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM. Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    // Monitoring định kỳ
    setInterval(() => {
      const usedMemory = Math.round((os.totalmem() - os.freemem()) / (1024 * 1024));
      logger.debug(`Memory usage: ${usedMemory} MB`);
    }, 60000);
    
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`);
    process.exit(1);
  }
}

// Khởi động
main(); 