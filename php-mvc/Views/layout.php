<?php
$e = static fn(mixed $value): string => htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$money = static fn(int $value): string => number_format($value, 0, ',', '.') . ' ₫';
$statusNames = ['pending'=>'Chờ xác nhận','confirmed'=>'Đã xác nhận','processing'=>'Đang chuẩn bị',
    'shipping'=>'Đang giao','completed'=>'Hoàn thành','cancelled'=>'Đã hủy'];
?>
<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Sách Hay — Nhà sách trực tuyến. Khám phá sách văn học, kỹ năng, kinh tế và thiếu nhi.">
    <title><?= $e($title) ?> | Sách Hay</title>
    <link rel="stylesheet" href="/sachhay.css?v=2">
    <style>
        <?= @file_get_contents(__DIR__ . '/../../server/public/sachhay.css') ?: '' ?>
    </style>
    <script src="/sachhay.js?v=2" defer></script>
</head>
<body>
<header class="site-header">
    <div class="announcement"><div class="wrap topbar">
        <span><?php $icon = 'sparkles'; require __DIR__ . '/store-icon.php'; ?> Hội sách Sách Hay 2026 · Freeship đơn từ 250.000 ₫</span>
        <div><a href="/orders"><?php $icon = 'truck'; require __DIR__ . '/store-icon.php'; ?> Tra cứu đơn hàng</a><a href="/about">Liên hệ</a></div>
    </div></div>
    <div class="wrap header-row">
        <a class="brand header-brand" href="/"><span class="brand-mark"><?php $icon = 'book'; require __DIR__ . '/store-icon.php'; ?></span><span><b>Sách <em>Hay</em></b><small>NHÀ SÁCH TRỰC TUYẾN</small></span></a>
        <form class="search" action="/books" role="search">
            <input name="q" value="<?= $e($q ?? '') ?>" placeholder="Tìm tên sách, tác giả hoặc ISBN" aria-label="Tìm sách">
            <button aria-label="Tìm sách"><?php $icon = 'search'; require __DIR__ . '/store-icon.php'; ?></button>
        </form>
        <nav class="quick-links" aria-label="Mua hàng">
            <a href="/books?sort=sale" class="promotion-link" aria-label="Khuyến mãi"><span class="quick-icon"><?php $icon = 'bell'; require __DIR__ . '/store-icon.php'; ?></span></a>
            <a href="/cart"><span class="quick-icon"><?php $icon = 'cart'; require __DIR__ . '/store-icon.php'; ?></span><span>Giỏ hàng<strong data-cart-count><?= $cartCount ? $cartCount . ' cuốn' : 'Trống' ?></strong></span></a>
            <a href="/account" aria-label="Tài khoản"><span class="account-icon"><?php $icon = 'user'; require __DIR__ . '/store-icon.php'; ?></span><span>Tài khoản<?php if ($email): ?><strong>Của tôi</strong><?php endif; ?></span></a>
        </nav>
    </div>
    <div class="nav-bar">
        <div class="wrap nav-row">
            <?php $navCategories = ['Văn Học','Sách Kinh Tế','Tâm Lý - Kỹ Năng','Manga - Comic','Sách Giáo Khoa','Sách Thiếu Nhi','Sách Ngoại Văn','Văn Phòng Phẩm']; ?>
            <details class="category-menu"><summary><?php $icon = 'menu'; require __DIR__ . '/store-icon.php'; ?> Danh mục sản phẩm <?php $icon = 'down'; require __DIR__ . '/store-icon.php'; ?></summary>
                <div><?php foreach ($navCategories as $label): ?><a href="/books?<?= $e(http_build_query(['category'=>$label])) ?>"><?= $e($label) ?></a><?php endforeach; ?></div>
            </details>
            <nav class="nav-links" aria-label="Danh mục">
            <a href="/"<?= ($home ?? false) ? ' aria-current="page"' : '' ?>>Trang Chủ</a>
            <a href="/books"<?= ($view === 'books' && !($home ?? false) && !($category ?? '') && ($sort ?? '') !== 'sale') ? ' aria-current="page"' : '' ?>>Tất Cả Sách</a>
            <a href="/about"<?= $view === 'about' ? ' aria-current="page"' : '' ?>>Về chúng tôi &amp; Liên hệ</a>
            </nav>
        </div>
    </div>
</header>
<main class="wrap main-content">
    <?php if ($flash): ?><p class="notice" role="status"><?= $e($flash) ?></p><?php endif; ?>
    <?php require __DIR__ . '/' . $view . '.php'; ?>
</main>
<?php require __DIR__ . '/footer.php'; ?>
</body>
</html>
