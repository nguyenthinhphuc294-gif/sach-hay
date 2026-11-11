# SACHHAY - Website Thương Mại Điện Tử Bán Sách Trực Tuyến

Bản triển khai hiện tại sử dụng **PHP MVC, PDO SQLite và giao diện React**. Xem
[hướng dẫn chạy và triển khai PHP MVC](php-mvc/README.md). Các hướng dẫn Node/MongoDB
ở phần cũ của tài liệu mô tả phiên bản trước.

Website thương mại điện tử bán sách chuyên nghiệp **SACHHAY**, lấy cảm hứng từ cấu trúc, giao diện và trải nghiệm mua sắm của **Fahasa** (https://www.fahasa.com/).

---

## 1. Điểm Nổi Bật Về Giao Diện & Trải Nghiệm (UX/UI Fahasa)

- **Bảng màu nhận diện thương hiệu:**
  - Màu chủ đạo đỏ: `#C92127`
  - Màu nền website: `#F0F0F0` (đặc trưng các sàn TMĐT lớn)
  - Màu giá & điểm nhấn: `#C92127`
  - Màu khuyến mãi / Flash Sale: `#F7941E`
  - Màu viền & phân cách: `#E5E5E5`
- **Header 3 phần sticky:**
  - *Topbar:* Khuyến mãi, liên hệ hoặc hotline đã cấu hình và tra cứu đơn hàng nhanh.
  - *Main Header:* Logo SACHHAY, thanh tìm kiếm thông minh có debounce và hiển thị gợi ý sách tức thì kèm bìa và giá, chuông thông báo, giỏ hàng kèm số lượng theo thời gian thực, menu tài khoản.
  - *Navigation Bar:* Danh mục sản phẩm nhiều cấp, thanh điều hướng nhanh các chuyên mục (Văn Học, Kinh Tế, Manga - Comic, Kỹ Năng Sống, Thiếu Nhi, Văn Phòng Phẩm...).
- **Trang chủ phong phú theo chuẩn Fahasa:**
  - *Section 1 - Banner chính:* Slideshow tự động + 2 banner quảng cáo phụ bên phải (Manga & Văn phòng phẩm).
  - *Section 2 - Danh mục nhanh:* 10 icon danh mục (Flash Sale, Bán chạy, Sách mới, Văn học, Kinh tế, Manga, Thiếu nhi...).
  - *Section 3 - Flash Sale:* Nền gradient đỏ vàng, đồng hồ đếm ngược giờ:phút:giây, thanh tiến độ số lượng đã bán, huy hiệu giảm giá.
  - *Section 4 - Xu hướng mua sắm:* 4 tab chuyển đổi mượt mà (Xu hướng, Bán chạy, Sách mới, Được quan tâm).
  - *Section 5 - Khối nổi bật theo danh mục:* Khối riêng cho Văn học, Kỹ năng sống, Kinh tế, Manga - Comic.
  - *Section 6 - Bảng xếp hạng bán chạy:* Bảng xếp hạng với huy hiệu Top 1, Top 2, Top 3 và số lượng đã bán.
  - *Section 7 - Footer:* Chính sách đổi trả 7 ngày, miễn phí vận chuyển từ 250k, 100% sách thật chính hãng, phương thức thanh toán COD, thông tin liên hệ và đăng ký nhận bản tin.

---

## 2. Các Chức Năng Chính Hoạt Động Thực Tế

### A. Danh mục & Bộ lọc sản phẩm (`/books`)
- Breadcrumb dẫn hướng.
- Bộ lọc đa chiều:
  - Lọc theo Thể loại / Danh mục.
  - Lọc theo Khoảng giá (Dưới 50k, 50k-100k, 100k-200k, trên 200k).
  - Lọc theo Tác giả (Nguyễn Nhật Ánh, Paulo Coelho, Dale Carnegie, Daniel Kahneman, Eiichiro Oda...).
  - Lọc theo Nhà xuất bản (NXB Trẻ, NXB Kim Đồng, Nhã Nam, First News...).
  - Lọc sách đang giảm giá, sách còn hàng.
- Sắp xếp: Bán chạy nhất, Mới nhất, Giá tăng dần, Giá giảm dần, Tên A-Z.
- Phân trang hiển thị.

### B. Chi tiết sản phẩm (`/books/{slug}`)
- Bìa sách sắc nét, danh sách thumbnail, modal phóng to ảnh bìa.
- Hiển thị đầy đủ: Tác giả, Nhà xuất bản, ISBN, Năm xuất bản, Số trang, Kích thước, Trọng lượng.
- Kiểm soát tồn kho nghiêm ngặt: Không cho phép chọn số lượng vượt quá tồn kho.
- Đánh giá khách hàng: Xem nhận xét và gửi đánh giá trực tiếp kèm số sao.
- Sản phẩm liên quan cùng danh mục.

### C. Giỏ hàng & Khuyến mãi (`/cart`)
- Lưu trữ bền vững (`localStorage`).
- Chọn / bỏ chọn từng sản phẩm hoặc toàn bộ giỏ hàng.
- Tăng giảm số lượng với kiểm tra tồn kho tự động.
- Hiển thị tổng dự kiến. Khách nhập voucher và xem giá chính thức ở bước thanh toán.

### D. Đặt hàng & Thanh toán (`/checkout`)
- Thu thập thông tin giao nhận: Họ tên, Số điện thoại (kiểm tra định dạng 10 chữ số), Email, Tỉnh/thành, Quận/huyện, Phường/xã, Địa chỉ cụ thể, Ghi chú.
- Hình thức thanh toán gồm COD, nhận tại cửa hàng và chuyển khoản VietQR khi đã cấu hình SePay.
- Express tính lại giá, phí giao hàng và voucher từ MongoDB. Tài khoản khách hàng bắt buộc khi dùng voucher.
- MongoDB ghi đơn, trừ tồn và tăng số lượt voucher trong cùng transaction.
- Tạo mã đơn hàng có tiền tố `SH-`.
- Modal chúc mừng và sao chép mã đơn.

### E. Tra cứu & Quản lý đơn hàng
- Tra cứu đơn hàng mọi lúc qua mã đơn và số điện thoại.
- Thanh tiến độ trực quan 5 giai đoạn: *Chờ xác nhận -> Đã xác nhận -> Đang chuẩn bị -> Đang giao -> Hoàn thành*.
- Đơn demo có luồng hủy và hoàn tồn trong trình duyệt. Đơn từ API hiển thị xác nhận và tra cứu trong phiên trang hiện tại. API xử lý, hủy và đồng bộ lịch sử cho các đơn này nằm ngoài module checkout.

### F. Cổng Quản Trị Admin (`/?view=admin`)
- **Dashboard:** Thống kê Doanh thu, Tổng số đơn, Đơn chờ duyệt, Tồn kho thấp, Biểu đồ doanh thu 7 ngày qua.
- **Quản lý Sách:** Thêm mới sách, sửa thông tin, giá bán, tồn kho, xóa mềm.
- **Quản lý Đơn hàng:** Xem chi tiết đơn, chuyển đổi trạng thái (*Chờ xác nhận -> Đã xác nhận -> Đang giao -> Hoàn thành / Hủy*), In phiếu đóng gói / phiếu xuất kho.
- **Quản lý Danh mục & Voucher:** Bật tắt voucher, tạo mới mã giảm giá.
- **Quản lý Banner:** Bật/tắt hiển thị các banner.
- **Cơ sở dữ liệu SQL Server:** Trình xem code SQL Server `SACHHAY_DB` hoàn chỉnh với nút tải về file `.sql`.

---

## 3. Kiến Trúc Cơ Sở Dữ Liệu SQL Server (`SACHHAY_DB`)

Cơ sở dữ liệu được thiết kế đầy đủ 24 bảng:
- **Tài khoản:** `Users`, `Roles`, `UserRoles`, `Addresses`.
- **Sản phẩm:** `Categories`, `Authors`, `Publishers`, `Books`, `BookAuthors`, `BookCategories`, `BookImages`.
- **Đơn hàng:** `Carts`, `CartItems`, `Orders`, `OrderItems`, `OrderStatusHistories`, `Payments`.
- **Kho bãi:** `Branches`, `BranchStocks`, `StockReservations`, `StockMovements`.
- **Marketing:** `Promotions`, `PromotionUsages`, `Banners`, `Wishlists`, `Reviews`.
- **Đặc tả kỹ thuật:**
  - Khóa chính PK, Khóa ngoại FK có ràng buộc `ON DELETE CASCADE` phù hợp.
  - Ràng buộc `CHECK`: Giá $\ge 0$, Tồn kho $\ge 0$, Số sao $1 \le Rating \le 5$.
  - Ràng buộc `UNIQUE`: Email, ISBN, OrderCode, Slug.
  - Các chỉ mục phi tuần tự (Non-clustered Indexes) tối ưu hóa tốc độ tìm kiếm sách và đơn hàng.
  - Stored Procedure `sp_CreateOrderWithInventoryCheck` sử dụng `BEGIN TRANSACTION` và `COMMIT / ROLLBACK` bảo đảm toàn vẹn dữ liệu.
  - Dữ liệu mẫu (Seed Data) tiếng Việt phong phú.

---

## 4. Đăng nhập quản trị

Chọn **Tài khoản → Đăng nhập quản trị** và dùng tên đăng nhập `admin`. Máy chủ PHP kiểm tra mật khẩu và cấp cookie phiên. Sách mới thêm từ trang quản trị, bao gồm ảnh bìa, dùng cùng MongoDB với checkout. Các chức năng quản trị dữ liệu mẫu tiếp tục lưu trong trình duyệt.

### Chạy cục bộ

Với PHP 8 trở lên, chạy từ thư mục dự án. Trên máy đã thiết lập mật khẩu, có thể bỏ qua lệnh tạo bản băm.

~~~powershell
$secure = Read-Host 'Mật khẩu quản trị' -AsSecureString
[System.Net.NetworkCredential]::new('', $secure).Password | php scripts/set-admin-password.php
php -S 127.0.0.1:8787 -t server/public
~~~

Mở terminal thứ hai và chạy `npm run dev`. Vite chuyển tiếp yêu cầu đăng nhập đến PHP trên cổng 8787.

### Khi triển khai cPanel

Chạy `npm run build`. Đưa nội dung `dist` vào Document Root của domain có bật PHP 8 và HTTPS, bao gồm `api/admin-session.php`. Tạo bản băm `.sachhay-admin.hash` ở thư mục cha của Document Root. Ví dụ nếu Document Root là `~/public_html`, tệp băm nằm tại `~/.sachhay-admin.hash`. Có thể chỉ định vị trí ngoài thư mục công khai bằng biến máy chủ `SACHHAY_ADMIN_HASH_FILE`. Tiến trình PHP cần đọc được tệp băm và có quyền ghi tệp giới hạn đăng nhập kế bên.

## 5. Module voucher, checkout và tồn kho

Client gửi mã sách, số lượng, hình thức nhận hàng và mã voucher cho `POST /api/checkout/quote`. Server lấy giá và tồn từ MongoDB, kiểm tra hiệu lực, tổng tiền tối thiểu và hai giới hạn lượt dùng. Bước báo giá không tiêu hao lượt. Khi đặt, client gửi phiên bản báo giá và một `Idempotency-Key` UUID. Server tính lại giá và ghi đơn, tồn cùng bộ đếm voucher trong một transaction. Một lần gửi lại với cùng khóa và dữ liệu trả về đơn đã tạo.

1. Cài dependency bằng `npm ci`. Dùng Node.js đáp ứng yêu cầu của Vite và MongoDB dạng replica set hoặc sharded cluster. MongoDB Atlas cũng dùng được.
2. Sao chép `.env.example` thành `.env`, đặt `CHECKOUT_MONGODB_URI` và tạo `CHECKOUT_JWT_SECRET` ngẫu nhiên ít nhất 32 ký tự. Có thể tạo bằng `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Giữ `.env` ở máy chủ.
3. Với cơ sở dữ liệu thử nghiệm, chạy `npm run seed:checkout` để thêm 12 sách và ba voucher. Lệnh seed giữ tồn và lượt dùng đã phát sinh. `SACHHAY20K` giảm 20.000 ₫ từ 150.000 ₫, `GIAM15` giảm 15% từ 300.000 ₫, tối đa 60.000 ₫, và `FREESHIP` hỗ trợ phí giao hàng từ 100.000 ₫ khi đơn còn phí. Mỗi voucher mẫu dùng một lần mỗi tài khoản, tối đa 100 lần toàn hệ thống.
4. Chạy `npm run dev:checkout` ở terminal thứ nhất và `npm run dev` ở terminal thứ hai. Vite chuyển `/api/checkout` đến cổng 8788. Vào giỏ hàng rồi thanh toán. Có thể đặt không dùng voucher với tư cách khách. Chọn **Đăng nhập để dùng voucher** để tạo hoặc dùng tài khoản khách hàng.
5. Để kiểm thử hồi quy, đặt `CHECKOUT_TEST_MONGODB_URI` tới một replica set thử nghiệm có quyền tạo/xóa database và chạy `npm run test:checkout`. Bộ test dùng tên database ngẫu nhiên và dọn database của nó sau khi chạy.

Khi triển khai, chạy Express với `NODE_ENV=production` và chuyển tiếp `/api/checkout/*` qua HTTPS cùng domain với React. Trên máy chủ hiện tại, nếu hosting chỉ hỗ trợ PHP hoặc web tĩnh thì cần một dịch vụ Node.js và reverse proxy riêng. Đăng nhập Admin bằng PHP dùng endpoint riêng. Cấu hình sách mới nằm ở phần 9 bên dưới.

## 6. Chuyển khoản VietQR Woori Bank

1. Liên kết tài khoản Woori Bank trong SePay. Với tài khoản kết nối theo kênh SMS, hoàn thành đăng ký nhận SMS biến động số dư theo hướng dẫn của SePay. [Hướng dẫn Woori Bank](https://sepay.vn/blog/api-woori-bank-api-ngan-hang-woori-bank-moi-nhat/) · [Hướng dẫn kết nối ngân hàng](https://docs.sepay.vn/them-tai-khoan-ngan-hang.html)
2. Chuyển tiếp đường dẫn công khai `https://<domain>/api/payment/sepay-webhook` qua HTTPS đến Express, cùng backend với `/api/checkout/*`. Proxy phải chuyển tiếp nguyên body và các header chữ ký. Vite đã có cấu hình proxy để chạy thử cục bộ. [Tài liệu xác thực SePay](https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc)
3. Trong SePay, tạo webhook cho tài khoản Woori đã liên kết. Chọn sự kiện **Có tiền vào**, định dạng **JSON**, xác thực **HMAC-SHA256** và bật gửi lại khi endpoint trả lỗi. Đặt URL ở bước 2. Tạo khóa riêng cho webhook, tối thiểu 24 ký tự, rồi đặt cùng giá trị trong biến môi trường máy chủ `SEPAY_WEBHOOK_SECRET`. [Tài liệu webhook SePay](https://docs.sepay.vn/tich-hop-webhooks.html)
4. Đặt các biến bên dưới trong `.env` của backend, điền số tài khoản, tên chủ tài khoản và khóa đã tạo, rồi khởi động lại Express. Khi cấu hình đủ, checkout sẽ hiện phương thức VietQR.

~~~dotenv
VIETQR_BANK_BIN=970457
VIETQR_ACCOUNT_NUMBER=
VIETQR_ACCOUNT_NAME=
VIETQR_TEMPLATE=compact2
SEPAY_WEBHOOK_SECRET=
~~~

VietQR công bố BIN Woori Việt Nam là `970457`. SACHHAY dùng Quick Link SVG và mã đơn chỉ gồm chữ và số, dạng `SACHHAY` theo sau bởi 16 ký tự hex. Nội dung chuyển khoản và số tiền đều lấy từ đơn đã lưu. [Danh sách BIN VietQR](https://www.vietqr.io/api-bank/demo) · [Quy ước Quick Link](https://www.vietqr.io/qr-dong)

React hỏi `GET /api/checkout/orders/:orderCode/payment` mỗi 5 giây bằng token của phiên thanh toán và ngừng khi đơn đã trả tiền. Tab giữ token của lần chuyển khoản gần nhất trong `sessionStorage` để tiếp tục sau khi tải lại. Webhook chỉ đánh dấu `paymentStatus=paid` sau khi chữ ký, chiều giao dịch, ngân hàng, tài khoản, mã đơn và số tiền đều hợp lệ. `paidAt` là thời điểm giao dịch Woori cung cấp, quy đổi từ giờ Việt Nam sang UTC. Trạng thái xử lý đơn hàng là trường riêng.

Webhook phản hồi `200 {"success":true}` khi đã ghi nhận giao dịch hoặc nhận lại một ID giao dịch đã xử lý. Giao dịch hợp lệ về chữ ký nhưng lệch tiền hoặc tài khoản vẫn được lưu ở collection `sepayevents` với trường `result` để đối soát. Quy trình hiện giữ tồn từ lúc đặt đơn. Đơn chưa trả tiền cần được xử lý thủ công nếu khách bỏ thanh toán.

Trước khi bật Live, dùng [SePay Test mode](https://developer.sepay.vn/vi/sepay-webhooks/test-mode/bat-dau-nhanh) với cơ sở dữ liệu và tài khoản Woori thử nghiệm. Tạo một đơn VietQR, mô phỏng khoản tiền vào đúng mã và số tiền, rồi kiểm tra khung thanh toán tự đổi sang **Đã thanh toán**. Có thể chạy lại bộ kiểm thử tích hợp bằng `npm run test:checkout` theo phần trên.

## 7. Popup khuyến mãi trang chủ

`src/components/PromoBannerModal.jsx` dùng Tailwind CSS và phát video `src/assets/videos/promo-video.mp4` khi popup mở. Popup chỉ hiển thị video và nút đóng. Video tự phát không tiếng, lặp lại và phát ngay trong popup trên thiết bị di động. Có thể truyền prop `videoSrc` để dùng video khác. Popup đã được gắn vào `src/App.tsx`.

Nếu chuyển popup vào `HomePage.js`, đặt component trong phần giao diện trang chủ:

~~~jsx
import PromoBannerModal from './components/PromoBannerModal.jsx';

// Trong JSX của trang chủ:
<PromoBannerModal />
~~~

Đóng bằng nút X, bấm ra ngoài hoặc nhấn Escape sẽ ẩn banner trong 24 giờ trên cùng trình duyệt. Để kiểm tra lại ngay, xóa khóa `sachhay:promo:home-books-sale:v1:dismissed-until` trong Local Storage rồi tải lại trang.

## 8. Trang Về chúng tôi & Liên hệ

`src/components/AboutContactPage.jsx` được gắn tại route `/about` bằng React Router. Khách có thể mở từ thanh điều hướng trên máy tính, menu trên điện thoại hoặc footer. Google Maps được nhúng sẵn với từ khóa khu vực Phước Tân, Biên Hòa, Đồng Nai.

1. Chạy `npm ci`. Tạo `.env` từ `.env.example` và cấu hình MongoDB cùng khóa phiên theo phần checkout ở trên. Điền `VITE_STORE_STREET`, `VITE_STORE_PHONE`, `VITE_STORE_EMAIL` và `VITE_STORE_HOURS` nếu đã có thông tin chính thức. Vite đưa các biến này vào giao diện công khai.
2. Chạy `npm run dev:checkout` và `npm run dev` ở hai cửa sổ terminal. Mở `/about` trên cổng Vite. Form gọi `POST /api/contact` và Express lưu vào collection `contactmessages` trong MongoDB. Chỉ người quản lý có quyền truy cập cơ sở dữ liệu mới đọc được nội dung. Form không gửi email tự động.
3. Khi đưa lên hosting, chạy lại `npm run build` để cập nhật thông tin công khai. Chuyển tiếp `/api/contact` đến Express qua cùng tên miền như `/api/checkout`. Cấu hình máy chủ trả `index.html` khi mở trực tiếp `/about`. Bản build có sẵn quy tắc `.htaccess` cho Apache. Nếu hosting đã có tệp đó, thêm quy tắc của `/about` vào tệp hiện tại.

## 9. Thêm sách kèm ảnh bìa

Trong **Quản lý Sách → Thêm Sách Mới**, chọn một ảnh JPG, PNG hoặc WebP tối đa 12 MB. Form hiển thị bản xem trước và yêu cầu ảnh khi tạo sách mới. Khi chỉnh sửa, có thể để trống để giữ ảnh cũ.

Chạy cả PHP, Express và MongoDB theo hướng dẫn ở trên. Khi triển khai, chuyển tiếp `/api/catalog/*` và `/api/admin-session.php/books` (gồm các đường dẫn con) đến Express. Đường dẫn chính xác `/api/admin-session.php` vẫn chạy PHP. Nếu PHP không chạy trên `127.0.0.1:8787`, đặt `ADMIN_SESSION_CHECK_URL` thành URL đáng tin cậy trỏ tới endpoint PHP để Express kiểm tra phiên quản trị. Trình duyệt phải truy cập các API này qua cùng domain với website.

Sách mới dùng kho MongoDB của checkout và hiện cho khách trên các thiết bị. Các sách mẫu hoặc sách cũ từng lưu trong trình duyệt tiếp tục dùng dữ liệu hiện có.

## 10. PT-BookBot

Nút **PT-BookBot** ở góc dưới website mở khung tư vấn tiếng Việt. Bot lọc các sách có thể đặt từ danh mục, đối chiếu giá và tồn kho với MongoDB qua `POST /api/bookbot` và mở trang chi tiết khi khách chọn sách. Câu trả lời về giao hàng và VietQR dựa trên cấu hình checkout.

Chạy `npm run dev:checkout` và `npm run dev` như phần 5. Khi triển khai, chuyển tiếp `/api/bookbot` đến Express qua cùng tên miền. Nếu Express hoặc MongoDB chưa kết nối, bot hướng khách sang trang Liên hệ khi cần kiểm tra giá hoặc tồn kho.

Bot chạy bằng quy tắc mặc định. Nếu muốn Gemini hỗ trợ phân loại những câu hỏi chưa rõ, đặt `GEMINI_API_KEY` và `BOOKBOT_GEMINI_MODEL` trong `.env` phía máy chủ rồi khởi động lại Express. Gemini chỉ trả loại câu hỏi và chủ đề, còn giá, tồn kho và điều kiện thanh toán do website xác định. Giữ khóa API trong biến môi trường của máy chủ.
