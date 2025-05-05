# Hướng dẫn kiểm thử cursor-bridge Container

Tài liệu này hướng dẫn cách kiểm thử container cursor-bridge sau khi cài đặt.

## 1. Kiểm tra Docker Container

### Kiểm tra cài đặt

Sau khi chạy `npm run docker:build` và `npm run docker:start`, kiểm tra xem container đã chạy chưa:

```bash
docker ps | grep cursor-bridge
```

Nếu container đang chạy, bạn sẽ thấy một dòng hiển thị thông tin container.

### Kiểm tra logs

Kiểm tra logs của container để xác nhận hoạt động đúng:

```bash
docker logs cursor-bridge
```

Bạn nên thấy thông tin về container, cấu hình và việc container đã khởi động thành công.

### Kiểm tra trạng thái

Kiểm tra health check của container:

```bash
docker inspect --format='{{.State.Health.Status}}' cursor-bridge
```

Kết quả nên là `healthy` nếu container hoạt động bình thường.

## 2. Kiểm tra Network Bridge

### Kiểm tra kết nối với localhost (n8n)

Truy cập vào container và kiểm tra kết nối đến n8n:

```bash
docker exec -it cursor-bridge /bin/sh
ping host.docker.internal
```

Nếu ping thành công, network bridge đã được cấu hình đúng.

### Kiểm tra port

Kiểm tra port 1000 đã được mở đúng chưa:

```bash
curl http://localhost:1000/api/status
```

(Lưu ý: API endpoint sẽ chỉ hoạt động sau khi hoàn thành RFC-003)

## 3. Kiểm tra Headless Browser (RFC-002)

Phần này sẽ được triển khai khi hoàn thành RFC-002. Các bước kiểm tra sẽ bao gồm:

- Kiểm tra browser headless có khởi động trong container
- Kiểm tra khả năng truy cập cursor.sh
- Kiểm tra khả năng xử lý đăng nhập

## 4. Vấn đề thường gặp và cách khắc phục

### Container không khởi động

Kiểm tra logs chi tiết:

```bash
docker logs cursor-bridge
```

Nguyên nhân thường gặp:
- Thiếu cấu hình trong file .env
- Port 1000 đã được sử dụng bởi dịch vụ khác
- Không đủ quyền truy cập vào volumes

### Không kết nối được với n8n

- Kiểm tra n8n có đang chạy trên port 5678
- Kiểm tra cấu hình `extra_hosts` trong docker-compose.yml
- Trong Windows, đảm bảo WLS 2 đã được cấu hình đúng

### Lỗi liên quan đến browser

Những lỗi này sẽ được giải quyết chi tiết hơn trong RFC-002.

## 5. Tài nguyên bổ sung

- [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [n8n Documentation](https://docs.n8n.io/) 