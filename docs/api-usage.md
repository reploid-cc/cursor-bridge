# Hướng dẫn sử dụng API cursor-bridge từ n8n

Tài liệu này hướng dẫn cách tích hợp cursor-bridge vào n8n workflows để sử dụng các mô hình AI như Claude 3.7 và GPT-4.1 mà không cần API key.

## Cấu hình kết nối

Trước khi bắt đầu, hãy đảm bảo:

1. cursor-bridge đã được cài đặt và khởi chạy đúng cách
2. n8n đang chạy trên máy chủ hoặc máy local (mặc định tại localhost:5678)
3. Network bridge đã được thiết lập đúng cách trong Docker Compose

## API Endpoints có sẵn

| Endpoint | Method | Mô tả | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/process` | POST | Xử lý prompt với model AI | `{ "model": "claude-3.7", "prompt": "your prompt", "request_id": "optional-id", "timeout": 60000 }` | `{ "request_id": "id", "status": "success", "model": "claude-3.7", "timestamp": "2023-01-01T12:00:00Z" }` |
| `/api/status` | GET | Trạng thái service | - | `{ "status": "online", "version": "1.0.0", "uptime": 3600, "memory": {...}, "timestamp": "2023-01-01T12:00:00Z" }` |
| `/health` | GET | Health check | - | `{ "status": "healthy", "timestamp": "2023-01-01T12:00:00Z" }` |
| `/api/n8n-check` | GET | Kiểm tra kết nối n8n | - | `{ "status": "success", "n8n_status": "online", "n8n_url": "http://host:port/healthz", "timestamp": "2023-01-01T12:00:00Z" }` |

## Ví dụ sử dụng trong n8n

### Ví dụ 1: Tạo workflow đơn giản với Claude 3.7

#### Bước 1: Thêm HTTP Request node
1. Tạo một workflow mới trong n8n
2. Thêm một node "HTTP Request"
3. Cấu hình node như sau:
   - **Method**: POST
   - **URL**: http://cursor-bridge:1000/api/process (hoặc http://localhost:1000/api/process nếu chạy ngoài Docker)
   - **Request Content Type**: JSON
   - **JSON/RAW Parameters**:
     ```json
     {
       "model": "claude-3.7",
       "prompt": "Hãy tóm tắt bài viết sau trong 3 điểm chính: {{$node['Input'].json.article}}",
       "timeout": 60000
     }
     ```

#### Bước 2: Xử lý kết quả
Thêm một "Set" node để xử lý kết quả:
- Input: Output từ HTTP Request node
- Cấu hình các trường để trích xuất dữ liệu cần thiết

### Ví dụ 2: Xử lý nhiều prompt dạng batch

#### Bước 1: Tạo danh sách prompt
Sử dụng "Function" node để tạo danh sách prompt:
```javascript
return [
  { prompt: "Giải thích Docker trong 3 câu", model: "claude-3.7" },
  { prompt: "So sánh Kubernetes và Docker Swarm", model: "gpt-4.1" },
  { prompt: "Các bước cơ bản để triển khai microservices", model: "claude-3.7" }
];
```

#### Bước 2: Xử lý tuần tự
Sử dụng "Split In Batches" node để chia nhỏ danh sách, sau đó sử dụng HTTP Request node với cấu hình:
```json
{
  "model": "{{$node['Split'].json.model}}",
  "prompt": "{{$node['Split'].json.prompt}}",
  "timeout": 60000
}
```

## Xử lý lỗi

API trả về các mã lỗi HTTP chuẩn:
- **400**: Lỗi trong request (ví dụ: model không được hỗ trợ)
- **500**: Lỗi server khi xử lý
- **503**: Service không khả dụng (n8n không thể kết nối)

Mỗi response lỗi có format:
```json
{
  "status": "error",
  "error": "Error message",
  "request_id": "request-id-if-provided",
  "timestamp": "2023-01-01T12:00:00Z"
}
```

Trong n8n, bạn có thể xử lý lỗi bằng cách thêm "Error Trigger" node để bắt lỗi từ HTTP Request.

## Khắc phục sự cố

### Không kết nối được với cursor-bridge
- Kiểm tra container cursor-bridge đang chạy (`docker ps`)
- Kiểm tra logs của container (`docker logs cursor-bridge`)
- Đảm bảo port 1000 đã được expose

### Kết nối từ n8n tới cursor-bridge bị từ chối
- Kiểm tra cấu hình network trong docker-compose.yml
- Đảm bảo host.docker.internal đã được cấu hình đúng
- Trên Linux, thêm extra_hosts vào docker-compose.yml:
  ```yaml
  extra_hosts:
    - "host.docker.internal:host-gateway"
  ```

### Timeout khi xử lý prompt dài
- Tăng thời gian timeout trong request (mặc định: 60000ms)
- Chia nhỏ prompt thành các phần nhỏ hơn

## Mẹo tối ưu hiệu suất
1. Sử dụng request_id để theo dõi các request
2. Giới hạn độ dài prompt để tránh timeout
3. Xác minh kết nối n8n trước khi gửi request xử lý
4. Lên lịch các prompt để tránh quá tải hệ thống

## Tài nguyên bổ sung
- [Tài liệu n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [Tài liệu về Error Handling trong n8n](https://docs.n8n.io/workflows/error-handling/)

## Process API Endpoint

### POST /api/process

Gửi một prompt đến AI model trong Cursor và nhận kết quả trả về.

#### Request

```json
{
  "model": "claude-3.7",
  "prompt": "Viết một đoạn code Python in ra 'Hello World'",
  "timeout": 60000,
  "output_format": "text",
  "request_id": "optional-custom-id"
}
```

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| model | string | Có | Model AI sử dụng ("claude-3.7" hoặc "gpt-4.1") |
| prompt | string | Có | Nội dung prompt gửi đến AI |
| timeout | number | Không | Thời gian chờ tối đa (ms), mặc định 60000 |
| output_format | string | Không | Định dạng kết quả: "text", "json", "markdown" |
| request_id | string | Không | ID request tùy chỉnh, tự động tạo nếu không cung cấp |

#### Định dạng kết quả (output_format)

Hỗ trợ 3 định dạng:

1. **text** (mặc định): Trả về văn bản thuần túy
2. **json**: Cố gắng phân tích kết quả thành JSON
3. **markdown**: Giữ nguyên định dạng Markdown

#### Response

```json
{
  "request_id": "req-1629456789-a1b2c3d4",
  "status": "success",
  "model": "claude-3.7",
  "result": {
    "text": "```python\nprint('Hello World')\n```"
  },
  "processing_time": "3245ms",
  "timestamp": "2023-08-15T12:34:56.789Z"
}
```

Cấu trúc trường `result` phụ thuộc vào `output_format`:

- `text`: `{ "text": "..." }`
- `json`: Dữ liệu cấu trúc JSON, hoặc `{ "text": "...", "error": "..." }` nếu không thể phân tích
- `markdown`: `{ "markdown": "..." }`

#### Ví dụ với các định dạng khác nhau

**Text Format**:

Request:
```json
{
  "model": "claude-3.7",
  "prompt": "Viết một đoạn code Python in ra 'Hello World'",
  "output_format": "text"
}
```

Response:
```json
{
  "request_id": "req-1629456789-a1b2c3d4",
  "status": "success",
  "model": "claude-3.7",
  "result": {
    "text": "```python\nprint('Hello World')\n```"
  },
  "processing_time": "3245ms",
  "timestamp": "2023-08-15T12:34:56.789Z"
}
```

**JSON Format**:

Request:
```json
{
  "model": "claude-3.7",
  "prompt": "Liệt kê 3 ngôn ngữ lập trình phổ biến kèm ứng dụng. Trả lời bằng JSON.",
  "output_format": "json"
}
```

Response:
```json
{
  "request_id": "req-1629456790-e5f6g7h8",
  "status": "success",
  "model": "claude-3.7",
  "result": {
    "languages": [
      {
        "name": "Python",
        "applications": ["Data Science", "Web Development", "Automation"]
      },
      {
        "name": "JavaScript",
        "applications": ["Web Development", "Frontend", "Backend (Node.js)"]
      },
      {
        "name": "Java",
        "applications": ["Enterprise", "Android", "Big Data"]
      }
    ]
  },
  "processing_time": "4123ms",
  "timestamp": "2023-08-15T12:35:56.789Z"
}
```

**Markdown Format**:

Request:
```json
{
  "model": "claude-3.7",
  "prompt": "Viết hướng dẫn cài đặt Docker với định dạng Markdown.",
  "output_format": "markdown"
}
```

Response:
```json
{
  "request_id": "req-1629456791-i9j0k1l2",
  "status": "success",
  "model": "claude-3.7",
  "result": {
    "markdown": "# Hướng dẫn cài đặt Docker\n\n## Yêu cầu hệ thống\n\n- Windows 10 64-bit\n- macOS 10.14+\n- Linux với kernel 3.10+\n\n## Các bước cài đặt\n\n1. Tải Docker Desktop từ [website chính thức](https://www.docker.com/products/docker-desktop)\n2. Chạy file cài đặt\n3. Làm theo hướng dẫn trên màn hình\n\n## Kiểm tra cài đặt\n\n```bash\ndocker --version\ndocker run hello-world\n```"
  },
  "processing_time": "3867ms",
  "timestamp": "2023-08-15T12:36:56.789Z"
}
``` 