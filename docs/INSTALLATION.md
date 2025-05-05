# Hướng dẫn cài đặt cursor-bridge

Tài liệu này cung cấp hướng dẫn chi tiết để cài đặt và cấu hình cursor-bridge.

## Yêu cầu hệ thống

- Windows OS
- Docker Desktop cho Windows
- Node.js v18+ (để chạy scripts và quản lý dự án)
- n8n chạy trên localhost:5678
- Cursor Pro account

## Bước 1: Chuẩn bị môi trường

### Cài đặt Docker Desktop

1. Tải và cài đặt [Docker Desktop cho Windows](https://www.docker.com/products/docker-desktop)
2. Khởi động Docker Desktop và đảm bảo nó đang chạy
3. Kiểm tra cài đặt bằng cách chạy `docker --version` trong Command Prompt hoặc PowerShell

### Cài đặt Node.js

1. Tải và cài đặt [Node.js](https://nodejs.org/) (phiên bản LTS được khuyến nghị)
2. Kiểm tra cài đặt bằng cách chạy `node --version` và `npm --version`

### Cài đặt và chạy n8n

1. Cài đặt n8n theo [hướng dẫn chính thức](https://docs.n8n.io/hosting/installation/npm/)
2. Khởi động n8n trên port 5678:
   ```
   npx n8n start
   ```
3. Xác nhận n8n đang chạy bằng cách truy cập http://localhost:5678 trong trình duyệt

## Bước 2: Cài đặt cursor-bridge

### Clone repository

```
git clone https://github.com/yourusername/cursor-bridge.git
cd cursor-bridge
```

### Cài đặt dependencies

```
npm install
```

### Cấu hình

1. Tạo file `.env` từ template:
   ```
   copy env.example.txt .env
   ```

2. Mở file `.env` và cập nhật thông tin đăng nhập Cursor:
   ```
   CURSOR_USERNAME=your_cursor_email@example.com
   CURSOR_PASSWORD=your_cursor_password
   ```

3. Kiểm tra và cập nhật cấu hình trong `volumes/config/default.json` nếu cần thiết

## Bước 3: Build và chạy container

### Build Docker image

```
npm run docker:build
```

hoặc sử dụng lệnh Docker trực tiếp:

```
docker build -f docker/Dockerfile -t cursor-bridge .
```

### Chạy container

```
npm run docker:start
```

hoặc sử dụng Docker Compose trực tiếp:

```
docker-compose -f docker/docker-compose.yml up -d
```

### Xác nhận container đang chạy

```
docker ps | findstr cursor-bridge
```

## Bước 4: Kiểm tra

Xem logs để xác nhận container đang hoạt động bình thường:

```
docker logs cursor-bridge
```

## Sử dụng script cài đặt tự động

Dự án bao gồm script cài đặt tự động cho Windows:

```
scripts\install.bat
```

Script này sẽ:
1. Kiểm tra các yêu cầu (Docker, Node.js)
2. Tạo cấu trúc thư mục cần thiết
3. Tạo file `.env` từ template
4. Cài đặt dependencies
5. Build Docker image

## Xử lý sự cố

### Container không khởi động

Kiểm tra logs:
```
docker logs cursor-bridge
```

### Port 1000 đã được sử dụng

Bạn có thể thay đổi port trong file `.env` và `docker-compose.yml`.

### Không kết nối được với n8n

Kiểm tra:
1. n8n đang chạy trên port 5678
2. Không có firewall chặn kết nối
3. Cấu hình `extra_hosts` trong `docker-compose.yml`

## Tài nguyên bổ sung

- [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- [n8n Documentation](https://docs.n8n.io/)
- [Cursor Website](https://cursor.sh/) 