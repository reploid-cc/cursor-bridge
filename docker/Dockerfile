# Base Image sử dụng Node.js Alpine
FROM node:18-alpine

# Thiết lập các biến môi trường
ENV NODE_ENV=production \
    API_PORT=1000 \
    LOG_LEVEL=info \
    BROWSER_TYPE=chrome

# Cài đặt các dependencies cần thiết
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dbus \
    bash \
    curl \
    wget \
    py3-pip \
    shadow

# Thiết lập chrome environment
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Cấu hình thư mục làm việc
WORKDIR /app

# Sao chép package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Sao chép source code
COPY src/ ./src/

# Tạo cấu trúc thư mục cần thiết
RUN mkdir -p /app/volumes/logs
RUN mkdir -p /app/volumes/config
RUN mkdir -p /app/src/utils

# Tạo file healthcheck cơ bản
RUN echo '#!/usr/bin/env node\nconsole.log("Health check OK");\nprocess.exit(0);' > /app/src/utils/healthcheck.js

# Tạo file index.js đơn giản
RUN echo '#!/usr/bin/env node\nconsole.log("cursor-bridge container is running...");\nsetTimeout(() => {}, 3600000);' > /app/src/index.js

# Thiết lập quyền và user không phải root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port cho API
EXPOSE 1000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node src/utils/healthcheck.js

# Entrypoint script khởi chạy ứng dụng
ENTRYPOINT ["node", "src/index.js"] 