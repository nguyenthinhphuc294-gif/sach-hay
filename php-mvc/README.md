# Chạy Sách Hay bằng PHP MVC

Yêu cầu PHP 8.3 trở lên, `pdo_sqlite` và `mbstring`. Node.js dùng để build React trên máy phát triển.

```sh
npm ci
npm run build
php scripts/set-admin-password.php .sachhay-admin.hash
npm run serve:php
```

Khi chạy lệnh tạo hash, nhập mật khẩu của bạn và bấm Enter. Mở <http://127.0.0.1:8787/>.
Tài khoản quản trị có tên `admin`.
PHP tự tạo `php-mvc/storage/sachhay.sqlite` khi có yêu cầu API đầu tiên.
Tệp này giữ ảnh, tồn kho, tài khoản khách, đơn hàng, lượt voucher và liên hệ.

## Triển khai trên cPanel

1. Kiểm tra phiên bản PHP của domain và hai extension trên. Sao lưu `public_html` và tệp dữ liệu hiện có.
2. Đặt thư mục `php-mvc` ngoài thư mục web, ở `/home/<tài-khoản>/sachhay-php-mvc`. Chép thêm
   `server/checkout/demo-books.json` vào thư mục PHP đó. Chỉ dùng thư mục `storage` bên ngoài thư mục web
   và cấp quyền ghi cho tiến trình PHP.
3. Chép nội dung `dist` vào document root. Giữ dòng chọn phiên bản PHP do cPanel tạo trong
   `.htaccess`, thêm các quy tắc từ `dist/.htaccess` trước các rewrite cũ.
   Gỡ các rewrite cũ chuyển nhóm API sang Node.js. Đảm bảo `index.php` và `storefront.html` có trong document root.
4. Dùng lại hash quản trị ở `/home/<tài-khoản>/.sachhay-admin.hash`, hoặc tạo hash bằng script và đặt tại vị trí này.
5. Kiểm tra trang chủ, `/about`, `/api/catalog/books` và thao tác thêm sách kèm ảnh trong quản trị.

Chỉ bật VietQR khi đã cấu hình `VIETQR_BANK_BIN`, `VIETQR_ACCOUNT_NUMBER`, `VIETQR_ACCOUNT_NAME`
và `SEPAY_WEBHOOK_SECRET` trong môi trường PHP. SePay gửi sự kiện HMAC đến
`/api/payment/sepay-webhook`. Có thể đặt `VIETQR_TEMPLATE` nếu cần đổi mẫu QR.

Cơ sở dữ liệu được khởi tạo với sách và voucher mẫu. Các đơn hoặc tài khoản từ một hệ thống MongoDB
đã hoạt động cần xuất và chuyển dữ liệu riêng trước khi chuyển hệ thống. Khi nâng cấp bản PHP,
hãy sao lưu và giữ thư mục `storage`. Mục quản trị và báo cáo nào trước đây dùng dữ liệu mẫu
trên giao diện vẫn cần API riêng nếu muốn quản lý chúng trên máy chủ.
