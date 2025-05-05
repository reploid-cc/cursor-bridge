/**
 * API Endpoints cho cursor-bridge
 * 
 * Thiết lập Express server và định nghĩa các API endpoint
 * cho phép n8n tương tác với cursor-bridge.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { processRouter } = require('./routes/process');
const { statusRouter } = require('./routes/status');
const { healthRouter } = require('./routes/health');
const { n8nCheckRouter } = require('./routes/n8n-check');
const logger = require('../utils/logger');
const { errorMiddleware } = require('../utils/error-handler');

const app = express();
const port = process.env.API_PORT || 1000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.N8N_CORS_ORIGIN || 'http://localhost:5678'
}));

// Logging middleware
app.use((req, res, next) => {
  const requestId = req.body?.request_id || req.query?.request_id || 'system';
  logger.setRequestContext(requestId);
  
  // Capture start time for performance tracking
  req.startTime = Date.now();
  
  // Log the request
  logger.info(`${req.method} ${req.url}`);
  
  // Log response after completion
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info(`Response: ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Routes
app.use('/api/process', processRouter);
app.use('/api/status', statusRouter);
app.use('/health', healthRouter);
app.use('/api/n8n-check', n8nCheckRouter);

// Error handler
app.use(errorMiddleware);

// Start server
function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`API server listening on port ${port}`);
      resolve(server);
    });
    
    server.on('error', (error) => {
      logger.error(`Failed to start server: ${error.message}`);
      reject(error);
    });
  });
}

module.exports = { app, startServer }; 