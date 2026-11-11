<?php
$services = [
    ['truck','Giao Hàng Toàn Quốc','Miễn phí cho đơn từ 250k'],
    ['return','Đổi Trả Trong 7 Ngày','Đổi trả dễ dàng nếu lỗi in ấn'],
    ['shield','100% Sách Thật','Cam kết từ các NXB uy tín'],
    ['card','Thanh Toán Linh Hoạt','Hỗ trợ COD & Nhận tại nhà sách'],
];
$footerCategories = [
    'Văn Học'=>'Sách Văn Học Việt Nam & Thế Giới',
    'Sách Kinh Tế'=>'Sách Kinh Doanh & Đầu Tư',
    'Tâm Lý - Kỹ Năng'=>'Tâm Lý Học & Kỹ Năng Sống',
    'Manga - Comic'=>'Manga - Comic & Light Novel',
    'Văn Phòng Phẩm'=>'Văn Phòng Phẩm & Bút Ký',
];
?>
<footer class="site-footer">
    <div class="footer-services"><div class="wrap service-grid">
        <?php foreach ($services as [$icon,$heading,$copy]): ?>
            <div class="service-item">
                <span class="service-icon"><?php require __DIR__ . '/store-icon.php'; ?></span>
                <div><strong><?= $e($heading) ?></strong><p><?= $e($copy) ?></p></div>
            </div>
        <?php endforeach; ?>
    </div></div>
    <div class="wrap footer-main">
        <div class="footer-columns">
            <section class="footer-about">
                <a class="footer-brand" href="/"><span><?php $icon = 'book'; require __DIR__ . '/store-icon.php'; ?></span><b>Sách <em>Hay</em></b></a>
                <p>Sách Hay là hệ thống nhà sách trực tuyến hàng đầu Việt Nam, cung cấp hàng chục ngàn tựa sách quốc văn, ngoại văn, văn phòng phẩm và quà lưu niệm chính hãng với dịch vụ tận tâm.</p>
                <p class="footer-contact"><?php $icon = 'pin'; require __DIR__ . '/store-icon.php'; ?> Phước Tân, Biên Hòa, Đồng Nai</p>
                <a class="footer-contact" href="mailto:nguyenthinhphuc294@gmail.com"><?php $icon = 'mail'; require __DIR__ . '/store-icon.php'; ?> nguyenthinhphuc294@gmail.com</a>
                <a class="footer-about-link" href="/about">Giới thiệu &amp; liên hệ</a>
            </section>
            <section>
                <h2>Dịch Vụ Khách Hàng</h2>
                <ul>
                    <li><a href="/about#store-contact">Điều khoản sử dụng website</a></li>
                    <li><a href="/about#store-contact">Chính sách bảo mật thông tin</a></li>
                    <li><a href="/about#store-contact">Chính sách giao hàng và nhận sách</a></li>
                    <li><a href="/about#store-contact">Chính sách đổi - trả - hoàn tiền</a></li>
                    <li><a href="/checkout">Phương thức thanh toán COD</a></li>
                </ul>
            </section>
            <section>
                <h2>Danh Mục Phổ Biến</h2>
                <ul><?php foreach ($footerCategories as $categoryName=>$label): ?>
                    <li><a href="/books?<?= $e(http_build_query(['category'=>$categoryName])) ?>"><?= $e($label) ?></a></li>
                <?php endforeach; ?></ul>
            </section>
            <section id="newsletter">
                <h2>Đăng Ký Nhận Bản Tin</h2>
                <p>Nhận thông báo sách mới phát hành và ưu đãi từ Sách Hay.</p>
                <form method="post" action="/newsletter" class="newsletter-form">
                    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                    <input type="email" name="email" placeholder="Nhập email của bạn..." aria-label="Email nhận bản tin" required maxlength="254">
                    <button>Đăng ký</button>
                </form>
                <strong class="payment-label">Hình thức thanh toán an toàn</strong>
                <div class="payment-tags"><span>COD</span><span>Tại Cửa Hàng</span><?php if (Orders::bank()): ?><span>VietQR</span><?php endif; ?></div>
            </section>
        </div>
        <div class="footer-bottom">
            <p>© 2026 Sách Hay. Bản quyền thuộc Công ty Cổ phần Phát hành Sách Sách Hay.</p>
            <p>Xây dựng với niềm đam mê sách <span aria-hidden="true">♥</span></p>
        </div>
    </div>
</footer>
