# API Module

Module này triển khai API endpoints cho cursor-bridge, cho phép n8n gửi request và nhận response từ Cursor IDE thông qua REST API.

## Cấu trúc thư mục

```
src/api/
├── index.js                # Entry point, thiết lập Express server
├── routes/                 # API routes
│   ├── process.js          # Endpoint xử lý prompt
│   ├── status.js           # Endpoint trạng thái service
│   ├── health.js           # Endpoint health check
│   └── n8n-check.js        # Endpoint kiểm tra kết nối n8n
├── middleware/             # Express middleware
│   ├── validator.js        # Middleware validation request
│   └── error.js            # Middleware xử lý lỗi
├── schemas/                # Validation schemas
│   └── process-schema.js   # Schema cho API process
└── test-api.js             # Script kiểm thử API endpoints
```

## API Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/process` | POST | Xử lý prompt với model AI | `{ "model": "claude-3.7", "prompt": "your prompt", "request_id": "optional-id", "timeout": 60000 }` | `{ "request_id": "id", "status": "success", "model": "claude-3.7", "timestamp": "2023-01-01T12:00:00Z" }` |
| `/api/status` | GET | Trạng thái service | - | `{ "status": "online", "version": "1.0.0", "uptime": 3600, "memory": {...}, "timestamp": "2023-01-01T12:00:00Z" }` |
| `/health` | GET | Health check | - | `{ "status": "healthy", "timestamp": "2023-01-01T12:00:00Z" }` |
| `/api/n8n-check` | GET | Kiểm tra kết nối n8n | - | `{ "status": "success", "n8n_status": "online", "n8n_url": "http://host:port/healthz", "timestamp": "2023-01-01T12:00:00Z" }` |

## Sử dụng API từ n8n

Ví dụ sử dụng API trong n8n workflow:

1. **Thêm HTTP Request node**
   - Method: POST
   - URL: http://cursor-bridge:1000/api/process
   - Body: 
     ```json
     {
       "model": "claude-3.7",
       "prompt": "{{$node['Prompt Input'].json.prompt}}",
       "timeout": 60000
     }
     ```

2. **Xử lý response**
   - Kết nối HTTP Request node với một JSON node để xử lý kết quả

## Biến môi trường

Cấu hình API qua các biến môi trường:

- `API_PORT`: Port cho API server (mặc định: 1000)
- `LOG_LEVEL`: Mức độ logging (debug, info, warn, error)
- `N8N_HOST`: Hostname của n8n (mặc định: host.docker.internal)
- `N8N_PORT`: Port của n8n (mặc định: 5678)
- `N8N_CORS_ORIGIN`: Origin cho CORS (mặc định: http://localhost:5678)

## Kiểm thử API

Chạy script kiểm thử API:

```bash
node src/api/test-api.js
```

## Error Handling

Các response lỗi có format:

```json
{
  "status": "error",
  "error": "Error message",
  "request_id": "request-id-if-provided",
  "timestamp": "2023-01-01T12:00:00Z"
}
```

## Network Bridge với n8n

API được thiết kế để kết nối với n8n thông qua network bridge:

- Trong Docker Compose, sử dụng network "n8n-support"
- API gọi đến n8n qua `host.docker.internal:5678` trên Windows và macOS
- Trên Linux, cấu hình thêm `extra_hosts` trong docker-compose.yml 