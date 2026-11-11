<section class="hero about-hero">
    <div class="hero-copy"><p class="eyebrow">NHÀ SÁCH SÁCH HAY</p><h1>Về chúng tôi &amp; Liên hệ</h1>
        <p>Sách Hay giúp bạn tìm những cuốn sách phù hợp, từ văn học và truyện tranh đến sách thiếu nhi và phát triển bản thân.</p></div>
    <img src="/media/bookshop.webp" alt="Không gian nhà sách">
</section>
<section class="panel form-grid">
    <div><h2>Tầm nhìn</h2><p>Để việc tìm và chọn một cuốn sách trở thành một phần thú vị trong ngày.</p></div>
    <div><h2>Sứ mệnh</h2><p>Giúp độc giả dễ khám phá sách và có thông tin rõ ràng trước khi mua.</p></div>
</section>
<div class="showcase" data-showcase aria-label="Hình ảnh nhà sách">
    <?php foreach (['staff','cafe','bookshop','reading-room'] as $index=>$file): ?>
        <img src="/media/<?= $e($file) ?>.webp" alt="Không gian nhà sách Phúc Thịnh" loading="lazy"<?= $index ? ' hidden' : '' ?>>
    <?php endforeach; ?>
</div>
<section class="panel form-grid">
    <div>
        <h2>Thông tin cửa hàng</h2>
        <p>Phước Tân, Biên Hòa, Đồng Nai</p>
        <p><a href="mailto:nguyenthinhphuc294@gmail.com">nguyenthinhphuc294@gmail.com</a></p>
        <iframe class="map" title="Bản đồ khu vực Phước Tân, Biên Hòa, Đồng Nai" loading="lazy"
            src="https://maps.google.com/maps?q=Ph%C6%B0%E1%BB%9Bc%20T%C3%A2n%2C%20Bien%20Hoa%2C%20Dong%20Nai&amp;output=embed"></iframe>
    </div>
    <div>
        <h2>Gửi tin nhắn</h2>
        <form action="/contact" method="post" class="stack">
            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
            <label>Họ tên<input name="name" minlength="2" maxlength="100" required></label>
            <label>Email<input name="email" type="email" maxlength="254" required></label>
            <label>Nội dung<textarea name="message" minlength="10" maxlength="2000" rows="5" required></textarea></label>
            <div><button>Gửi tin nhắn</button></div>
        </form>
    </div>
</section>
