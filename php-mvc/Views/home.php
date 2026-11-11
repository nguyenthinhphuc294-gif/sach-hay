<?php
$slides = [
    ['hero-books.jpg','Hội Sách Khuyến Mãi 2026','Khám phá các đầu sách văn học và sách kỹ năng tuyển chọn.',['sort'=>'sale']],
    ['hero-manga.jpg','Tuần Lễ Manga & Light Novel Nhật Bản','Tìm những bộ truyện tranh đang có tại Sách Hay.',['category'=>'Manga - Comic']],
];
$shortcuts = [
    ['⚡','Flash Sale',['sort'=>'sale'],'amber'],['★','Bán Chạy',['sort'=>'popular'],'red'],
    ['✦','Sách Mới',[],'orange'],['▤','Văn Học',['category'=>'Văn Học'],'blue'],
    ['↗','Kinh Tế',['category'=>'Sách Kinh Tế'],'green'],['♡','Kỹ Năng Sống',['category'=>'Tâm Lý - Kỹ Năng'],'purple'],
    ['▧','Truyện Tranh',['category'=>'Manga - Comic'],'pink'],['☀','Thiếu Nhi',['category'=>'Sách Thiếu Nhi'],'amber'],
    ['◎','Ngoại Văn',['category'=>'Sách Ngoại Văn'],'blue'],['✎','Văn Phòng Phẩm',['category'=>'Văn Phòng Phẩm'],'purple'],
];
?>
<section class="storefront-banners" aria-label="Khuyến mãi nổi bật">
    <div class="storefront-slider" data-hero-slider>
        <?php foreach ($slides as $index=>[$image,$heading,$caption,$params]): ?>
            <article class="storefront-slide" data-hero-slide<?= $index ? ' hidden' : '' ?>>
                <img src="/media/<?= $e($image) ?>" alt=""<?= $index ? ' loading="lazy"' : ' fetchpriority="high"' ?>>
                <div class="banner-copy">
                    <p class="eyebrow">ĐẶC QUYỀN SÁCH HAY</p>
                    <h1><?= $e($heading) ?></h1><p><?= $e($caption) ?></p>
                    <a class="button" href="<?= $e($browseUrl($params)) ?>">Khám phá ngay</a>
                </div>
            </article>
        <?php endforeach; ?>
        <button type="button" class="slide-arrow previous" data-hero-step="-1" aria-label="Ảnh trước">‹</button>
        <button type="button" class="slide-arrow next" data-hero-step="1" aria-label="Ảnh sau">›</button>
        <div class="slide-dots"><?php foreach ($slides as $index=>$_): ?>
            <button type="button" data-hero-dot="<?= $index ?>" aria-label="Ảnh <?= $index + 1 ?>" aria-pressed="<?= $index ? 'false' : 'true' ?>"></button>
        <?php endforeach; ?></div>
    </div>
    <div class="side-banners">
        <a href="<?= $e($browseUrl(['category'=>'Manga - Comic'])) ?>"><img src="/media/hero-manga.jpg" alt=""><span><small>Xu hướng trẻ</small>Manga &amp; Comic</span></a>
        <a href="<?= $e($browseUrl(['category'=>'Văn Phòng Phẩm'])) ?>"><img src="/media/hero-stationery.jpg" alt=""><span><small>Góc học tập</small>Văn phòng phẩm</span></a>
    </div>
</section>
<nav class="quick-categories panel" aria-label="Danh mục nhanh">
    <?php foreach ($shortcuts as [$icon,$label,$params,$color]): ?>
        <a href="<?= $e($browseUrl($params)) ?>"><span class="category-icon <?= $e($color) ?>" aria-hidden="true"><?= $e($icon) ?></span><?= $e($label) ?></a>
    <?php endforeach; ?>
</nav>
<?php foreach ($homeShelves as $shelf): ?>
    <section class="panel shelf shelf-<?= $e($shelf['style']) ?>">
        <div class="section-head">
            <h2><?= $shelf['style'] === 'sale' ? '⚡ ' : '' ?><?= $e($shelf['title']) ?></h2>
            <a href="<?= $e($browseUrl($shelf['params'])) ?>">Xem tất cả ›</a>
        </div>
        <?php if ($shelf['style'] === 'sale' && $shelf['books']): ?>
            <a class="flash-strip" href="<?= $e($browseUrl($shelf['params'])) ?>"><img src="/media/flash-sale.jpg" loading="lazy" alt="Xem sách đang giảm giá"></a>
        <?php endif; ?>
        <?php if (!$shelf['books']): ?><p>Chưa có sách trong chương trình này.</p><?php endif; ?>
        <div class="book-grid"><?php foreach ($shelf['books'] as $book) require __DIR__ . '/book-card.php'; ?></div>
    </section>
<?php endforeach; ?>
<dialog class="promo" data-promo aria-label="Video khuyến mãi">
    <button type="button" aria-label="Đóng video" data-close-promo>×</button>
    <video data-src="/media/promo.mp4" autoplay muted loop playsinline></video>
</dialog>
