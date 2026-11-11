# Chạy Sách Hay bằng PHP MVC

Cần PHP 8.3 trở lên với các extension PDO SQLite, mbstring, session và GD có hỗ trợ JPEG, PNG và WebP. Có thể kiểm tra bằng `php -m`.

Chạy từ thư mục gốc của repo.

```sh
php scripts/set-admin-password.php
php -S 127.0.0.1:8787 -t server/public php-mvc/dev-router.php
```

Khi chạy lệnh đầu tiên, nhập mật khẩu quản trị của bạn rồi bấm Enter. Vào
<http://127.0.0.1:8787/> để mua thử hoặc <http://127.0.0.1:8787/admin> để
đăng nhập bằng tài khoản `admin`. PHP tạo cơ sở dữ liệu
`php-mvc/storage/sachhay.sqlite` khi nhận yêu cầu đầu tiên. Dữ liệu mẫu
nằm trong `php-mvc/demo-books.json`.

## Triển khai trên VPS Linux hoặc cPanel

- Với Apache trên VPS, đặt document root tại `server/public` trong bản sao repo,
  bật mod_rewrite và cho phép quy tắc trong `.htaccess`. Bật HTTPS và
  cấp cho tiến trình PHP quyền ghi vào `php-mvc/storage`.
- Với cPanel, đặt `php-mvc` thành `/home/<tài-khoản>/sachhay-php-mvc` và chép
  nội dung `server/public` vào document root. Giữ dòng chọn phiên bản PHP
  do cPanel tạo trong `.htaccess`, rồi thêm các quy tắc rewrite từ repo.
  Nếu domain đang chạy bản cũ, sao lưu trước khi đổi cấu hình.
- Tệp `.sachhay-admin.hash` mặc định ở gốc repo trên VPS và ở thư mục home
  của tài khoản trên cPanel. Tiến trình PHP cần đọc hash và ghi tệp giới hạn
  đăng nhập bên cạnh. Nếu chọn đường dẫn khác, đặt biến `SACHHAY_ADMIN_HASH_FILE`.
- Giữ thư mục `storage` ngoài document root và sao lưu khi nâng cấp.

VietQR chỉ xuất hiện khi máy chủ có `VIETQR_BANK_BIN`, `VIETQR_ACCOUNT_NUMBER`,
`VIETQR_ACCOUNT_NAME` và `SEPAY_WEBHOOK_SECRET`. Webhook HMAC nhận sự kiện tại
`/api/payment/sepay-webhook`. Có thể đặt `VIETQR_TEMPLATE` nếu cần đổi mẫu QR.

Trang quản trị đọc sách, đơn hàng, thống kê cơ bản, lượt voucher và tin nhắn từ SQLite.
Các tài khoản và đơn hàng trên MongoDB của bản cũ cần được chuyển dữ liệu riêng nếu có.
