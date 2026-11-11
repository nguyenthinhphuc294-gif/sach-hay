<?php if ($home): ?>
    <section class="hero">
        <div class="hero-copy">
            <p class="eyebrow">NHÀ SÁCH TRỰC TUYẾN</p>
            <h1>Mỗi ngày, một trang sách hay.</h1>
            <p>Khám phá văn học, truyện tranh, sách kỹ năng và những cuốn sách bạn muốn đọc tiếp.</p>
            <a class="button light" href="/books">Khám phá sách</a>
        </div>
        <img src="/media/bookshop.webp" alt="Không gian nhà sách Phúc Thịnh" fetchpriority="high">
    </section>
    <dialog class="promo" data-promo aria-label="Video khuyến mãi">
        <button type="button" aria-label="Đóng video" data-close-promo>×</button>
        <video data-src="/media/promo.mp4" autoplay muted loop playsinline></video>
    </dialog>
<?php else: ?><h1>Danh mục sách</h1><?php endif; ?>
<section class="panel">
    <div class="section-head">
        <h2><?= $q ? 'Kết quả tìm kiếm' : ($category ?: 'Khám phá sách hay') ?></h2>
        <form action="/books" class="filters">
            <input type="hidden" name="q" value="<?= $e($q) ?>">
            <select name="category" aria-label="Danh mục">
                <option value="">Tất cả danh mục</option>
                <?php foreach ($categories as $label): ?>
                    <option value="<?= $e($label) ?>" <?= $category === $label ? 'selected' : '' ?>><?= $e($label) ?></option>
                <?php endforeach; ?>
            </select>
            <select name="sort" aria-label="Sắp xếp">
                <?php foreach ([''=>'Mới cập nhật','popular'=>'Bán chạy','price'=>'Giá tăng dần','price-desc'=>'Giá giảm dần','title'=>'Tên A–Z'] as $key=>$label): ?>
                    <option value="<?= $e($key) ?>" <?= $sort === $key ? 'selected' : '' ?>><?= $e($label) ?></option>
                <?php endforeach; ?>
            </select>
            <button class="secondary">Lọc</button>
        </form>
    </div>
    <?php if (!$books): ?><p>Chưa tìm thấy sách phù hợp.</p><?php endif; ?>
    <div class="book-grid">
        <?php foreach ($books as $book): $details = Catalog::details($book); ?>
            <article class="book-card">
                <a href="/books/<?= $e($book['id']) ?>">
                    <img src="<?= $e($book['cover_path']) ?>" alt="Bìa <?= $e($book['title']) ?>" loading="lazy">
                    <h3><?= $e($book['title']) ?></h3>
                </a>
                <p class="muted"><?= $e($details['author'] ?? '') ?></p>
                <p class="price"><?= $money($book['price']) ?>
                    <?php if (($details['originalPrice'] ?? 0) > $book['price']): ?><del><?= $money($details['originalPrice']) ?></del><?php endif; ?>
                </p>
                <?php if ($book['stock']): ?>
                    <form action="/cart" method="post">
                        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                        <input type="hidden" name="action" value="add">
                        <input type="hidden" name="book" value="<?= $e($book['id']) ?>">
                        <input type="hidden" name="quantity" value="1">
                        <button class="secondary">Thêm vào giỏ</button>
                    </form>
                <?php else: ?><p class="muted">Hết hàng</p><?php endif; ?>
            </article>
        <?php endforeach; ?>
    </div>
    <?php if ($pages > 1): ?><nav class="pagination" aria-label="Phân trang">
        <?php for ($number = max(1, $page - 2); $number <= min($pages, $page + 2); $number++): ?>
            <a href="/books?<?= $e(http_build_query(['q'=>$q,'category'=>$category,'sort'=>$sort,'page'=>$number])) ?>"<?= $page === $number ? ' aria-current="page"' : '' ?>><?= $number ?></a>
        <?php endfor; ?>
    </nav><?php endif; ?>
</section>
