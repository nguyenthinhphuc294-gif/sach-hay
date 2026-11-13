# Sách Hay

Sách Hay là website nhà sách trực tuyến viết bằng PHP MVC. Khách có thể tìm sách, lọc danh mục, xem chi tiết, quản lý giỏ hàng, đặt hàng và xem lịch sử đơn. Quản trị viên có thể quản lý sách, đơn hàng, xem thống kê, lượt sử dụng voucher và tin nhắn liên hệ.

## Chạy website trên máy cá nhân

Cần Git và PHP 8.3 trở lên. Bật các extension PDO SQLite, mbstring, session và GD (JPEG, PNG, WebP). Kiểm tra bằng `php -m`. Nếu dùng PHP từ XAMPP, có thể thay `php` bằng `C:/xampp/php/php.exe` và bật GD trong `php.ini` nếu chưa có.

```sh
git clone -b nop-giai-doan-1 https://github.com/nguyenthinhphuc294-gif/sach-hay.git
cd sach-hay
php scripts/setup-demo.php
php scripts/set-admin-password.php
php -S 127.0.0.1:8787 -t server/public php-mvc/dev-router.php
```

Khi chạy `set-admin-password.php`, nhập mật khẩu dành riêng cho bản demo rồi nhấn Enter. Mật khẩu dài 10–72 byte. Lệnh ghi hash ở gốc repo, ngoài thư mục public. Nếu cổng 8787 đã được dùng, chọn cổng khác và đổi URL tương ứng.

| Vai trò | Trang | Tên đăng nhập | Mật khẩu |
| --- | --- | --- | --- |
| Khách demo | http://127.0.0.1:8787/account | `khach.demo@example.com` | `SachHayDemo2026!` |
| Quản trị demo | http://127.0.0.1:8787/admin | `admin` | Mật khẩu vừa đặt, ví dụ `SachHayAdminDemo2026!` |

Tài khoản mẫu dành cho bản chạy trên localhost. Khi triển khai, đặt mật khẩu quản trị riêng và dùng cơ sở dữ liệu dành cho môi trường đó.

## Kịch bản demo

1. Mở trang chủ, tìm sách theo tên rồi mở trang chi tiết.
2. Thêm một cuốn còn hàng, đổi số lượng trong giỏ và tiếp tục thanh toán.
3. Đăng nhập khách demo trước khi đặt nếu muốn lưu đơn vào tài khoản. Nhập thông tin giả lập và chọn nhận tại cửa hàng hoặc COD. Kiểm tra tổng tiền rồi xác nhận, sau đó mở lịch sử đơn.
4. Đăng nhập `/admin`, kiểm tra đơn vừa tạo và xem danh mục sách.

## Cơ sở dữ liệu

- Website dùng SQLite qua PDO. `php-mvc/schema.sql` là lược đồ khởi tạo. Lần chạy đầu tạo `php-mvc/storage/sachhay.sqlite` từ dữ liệu sách trong `php-mvc/demo-books.json`, thông tin bổ sung trong `php-mvc/book-metadata.json` và voucher mẫu trong mã khởi tạo.
- [database/sachhay_mysql.sql](database/sachhay_mysql.sql) là bản lược đồ và dữ liệu mẫu cho MySQL 8.0+. Tệp tạo cơ sở dữ liệu `sachhay_gd1`. Dùng cơ sở dữ liệu mới khi nhập, chẳng hạn chọn **Import** trên phpMyAdmin và tải tệp lên. Kiểm tra bằng `SELECT COUNT(*) FROM sachhay_gd1.books;`. Bản SQL phục vụ đối chiếu ERD và kiểm tra dữ liệu. Website chạy với SQLite theo các bước trên.
- `php-mvc/Controllers`, `Models`, `Views` chứa bộ điều khiển, xử lý dữ liệu và giao diện. `server/public` là thư mục phục vụ HTTP.

Xem [hướng dẫn triển khai](php-mvc/README.md) cho Apache hoặc cPanel. Bản demo có thể chạy với COD hoặc nhận tại cửa hàng mà không cần cấu hình VietQR.
