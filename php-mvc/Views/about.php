<section class="hero about-hero">
    <div class="hero-copy"><p class="eyebrow">NHÀ SÁCH SÁCH HAY</p><h1>Về chúng tôi &amp; Liên hệ</h1>
        <p>Sách Hay là nhà sách trực tuyến dành cho những ai thích đọc và muốn tìm một cuốn sách hợp với mình. Từ văn học, truyện tranh đến sách thiếu nhi và kỹ năng, chúng tôi muốn việc chọn sách trở thành một phần thú vị trong ngày của bạn.</p></div>
    <img src="/media/bookshop.webp" alt="Không gian nhà sách">
</section>
<section class="panel form-grid">
    <div><h2>Tầm nhìn</h2><p>Trở thành nơi bạn có thể quay lại mỗi khi cần tìm cuốn sách tiếp theo cho mình hoặc cho người thân.</p></div>
    <div><h2>Sứ mệnh</h2><p>Giúp bạn dễ tìm sách phù hợp, hiểu rõ mình đang mua gì và có nơi để hỏi khi cần hỗ trợ.</p></div>
</section>
<section class="store-facts" id="store-contact">
    <h2>Thông tin cửa hàng</h2>
    <dl>
        <div><dt>Địa chỉ</dt><dd>Phước Tân, Biên Hòa, Đồng Nai</dd></div>
        <div><dt>Hotline</dt><dd>Đang cập nhật</dd></div>
        <div><dt>Email</dt><dd><a href="mailto:nguyenthinhphuc294@gmail.com">nguyenthinhphuc294@gmail.com</a></dd></div>
        <div><dt>Giờ mở cửa</dt><dd>Đang cập nhật</dd></div>
    </dl>
</section>
<div class="showcase" data-showcase aria-label="Hình ảnh nhà sách">
    <?php foreach (['staff','cafe','bookshop','reading-room'] as $index=>$file): ?>
        <img src="/media/<?= $e($file) ?>.webp" alt="Không gian nhà sách Phúc Thịnh" loading="lazy"<?= $index ? ' hidden' : '' ?>>
    <?php endforeach; ?>
</div>
<div class="form-grid">
    <section class="panel">
        <h2>Bản đồ khu vực Phước Tân</h2>
        <p>Phước Tân, Biên Hòa, Đồng Nai</p>
        <iframe class="map" title="Bản đồ khu vực Phước Tân, Biên Hòa, Đồng Nai" loading="lazy"
            src="https://maps.google.com/maps?q=Ph%C6%B0%E1%BB%9Bc%20T%C3%A2n%2C%20Bien%20Hoa%2C%20Dong%20Nai&amp;output=embed"></iframe>
    </section>
    <section class="panel">
        <h2>Gửi tin nhắn cho Sách Hay</h2>
        <p>Hãy để lại email để cửa hàng có thể phản hồi bạn.</p>
        <form action="/contact" method="post" class="stack">
            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
            <label>Họ tên<input name="name" minlength="2" maxlength="100" required></label>
            <label>Email<input name="email" type="email" maxlength="254" required></label>
            <label>Nội dung<textarea name="message" minlength="10" maxlength="2000" rows="5" required></textarea></label>
            <div><button>Gửi tin nhắn</button></div>
        </form>
    </section>
</div>
