# cursor-bridge

cursor-bridge là giải pháp Docker hóa 100% cho phép kết nối n8n với Cursor để tận dụng các mô hình AI tiên tiến như Claude 3.7 và GPT-4.1 mà không phát sinh chi phí API. Hệ thống hoạt động thông qua cơ chế API đơn giản và tự động hóa giao diện Cursor trong môi trường container, tương tác với n8n chạy trên localhost.

## Yêu cầu hệ thống

- Docker và Docker Compose
- n8n chạy trên localhost:5678
- Cursor Pro account
- Windows OS

## Cài đặt

1. Clone repository:
   ```
   git clone https://github.com/yourusername/cursor-bridge.git
   cd cursor-bridge
   ```

2. Tạo file `.env` từ file mẫu:
   ```
   cp env.example.txt .env
   ```

3. Điền thông tin đăng nhập Cursor vào file `.env`:
   ```
   CURSOR_USERNAME=your_cursor_email@example.com
   CURSOR_PASSWORD=your_cursor_password
   ```

4. Build và khởi chạy container:
   ```
   npm run docker:build
   npm run docker:start
   ```

## Cấu hình

Bạn có thể cấu hình cursor-bridge bằng cách chỉnh sửa file `.env` hoặc file cấu hình trong `volumes/config/default.json`.

### Biến môi trường

| Biến | Mô tả | Giá trị mặc định |
|------|-------|------------------|
| NODE_ENV | Môi trường triển khai | production |
| API_PORT | Port cho API endpoint | 1000 |
| N8N_HOST | Hostname/IP của n8n | host.docker.internal |
| N8N_PORT | Port của n8n | 5678 |
| LOG_LEVEL | Mức độ log | info |
| BROWSER_TYPE | Loại browser (chrome/firefox) | chrome |
| CURSOR_USERNAME | Email đăng nhập Cursor | (không có mặc định) |
| CURSOR_PASSWORD | Mật khẩu Cursor | (không có mặc định) |

## Sử dụng

### Khởi động và dừng container

```
# Khởi động
npm run docker:start

# Dừng
npm run docker:stop
```

### Xem logs

```
docker logs cursor-bridge
```

hoặc kiểm tra file log trong thư mục `volumes/logs`.

## API Endpoints (sẽ được triển khai trong các giai đoạn tiếp theo)

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| /api/process | POST | Xử lý prompt và trả về kết quả từ model AI |
| /api/status | GET | Trạng thái của hệ thống |

## Vấn đề thường gặp

### Docker Desktop trên Windows

Nếu bạn gặp vấn đề kết nối giữa container và localhost, hãy đảm bảo:

1. Docker Desktop được cập nhật phiên bản mới nhất
2. WSL 2 được cài đặt và cấu hình đúng
3. `host.docker.internal` đã được cấu hình trong `extra_hosts`

### Không kết nối được với n8n

Kiểm tra:

1. n8n đang chạy trên cổng 5678
2. Cấu hình mạng đúng trong file `.env` và docker-compose.yml
3. Không có firewall chặn kết nối

## Phát triển

### Cấu trúc thư mục

```
cursor-bridge/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── src/
│   ├── api/               # API endpoints
│   ├── browser/           # Browser automation
│   ├── extractor/         # Result extraction
│   └── utils/             # Common utilities
├── volumes/
│   ├── logs/              # Log files
│   └── config/            # Configuration
├── tests/                 # Unit tests
└── docs/                  # Documentation
```

## Phiên bản

Hiện tại cursor-bridge đang ở phiên bản Proof of Concept, triển khai Docker Container cơ bản theo RFC-001.

## License

MIT 