#!/bin/bash
set -e

# Biến môi trường mặc định
: ${API_PORT:=1000}
: ${LOG_LEVEL:=info}
: ${BROWSER_TYPE:=chrome}

echo "cursor-bridge starting with configuration:"
echo "API Port: $API_PORT"
echo "Log Level: $LOG_LEVEL"
echo "Browser: $BROWSER_TYPE"

# Kiểm tra tồn tại của thư mục logs và config
mkdir -p /app/volumes/logs
mkdir -p /app/volumes/config

# Xác minh kết nối network
echo "Checking network connectivity to n8n..."
if ping -c 1 $N8N_HOST &> /dev/null; then
  echo "Successfully connected to $N8N_HOST"
else
  echo "WARNING: Cannot connect to $N8N_HOST. Make sure n8n is running and reachable."
fi

# Khởi động ứng dụng
echo "Starting cursor-bridge application..."
exec node /app/src/index.js 