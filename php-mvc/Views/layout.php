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
    <link rel="stylesheet" href="/sachhay.css">
    <script src="/sachhay.js" defer></script>
</head>
<body>
<header class="site-header">
    <div class="announcement"><div class="wrap topbar">
        <span>✦ Hội sách Sách Hay 2026 · Freeship đơn từ 250.000 ₫</span>
        <div><a href="/orders">Tra cứu đơn hàng</a><a href="/about">Liên hệ</a></div>
    </div></div>
    <div class="wrap header-row">
        <a class="brand header-brand" href="/"><span class="brand-mark" aria-hidden="true">▤</span><span><b>Sách <em>Hay</em></b><small>NHÀ SÁCH TRỰC TUYẾN</small></span></a>
        <form class="search" action="/books" role="search">
            <input name="q" value="<?= $e($q ?? '') ?>" placeholder="Tìm tên sách, tác giả hoặc ISBN" aria-label="Tìm sách">
            <button aria-label="Tìm sách"><span class="search-icon" aria-hidden="true"></span></button>
        </form>
        <nav class="quick-links" aria-label="Mua hàng">
            <a href="/books?sort=sale" class="promotion-link" aria-label="Khuyến mãi"><span class="quick-icon" aria-hidden="true">♧</span></a>
            <a href="/cart"><span class="quick-icon" aria-hidden="true">🛒</span><span>Giỏ hàng<strong><?= $cartCount ? $cartCount . ' cuốn' : 'Trống' ?></strong></span></a>
            <a href="/account"><span class="account-icon" aria-hidden="true">♙</span><span>Tài khoản<?php if ($email): ?><strong>Của tôi</strong><?php endif; ?></span></a>
        </nav>
    </div>
    <div class="nav-bar">
        <div class="wrap nav-row">
            <?php $navCategories = ['Văn Học','Sách Kinh Tế','Tâm Lý - Kỹ Năng','Manga - Comic','Sách Thiếu Nhi','Sách Ngoại Văn','Văn Phòng Phẩm']; ?>
            <details class="category-menu"><summary><span aria-hidden="true">☰</span> Danh mục sản phẩm <span aria-hidden="true">⌄</span></summary>
                <div><?php foreach ($navCategories as $label): ?><a href="/books?<?= $e(http_build_query(['category'=>$label])) ?>"><?= $e($label) ?></a><?php endforeach; ?></div>
            </details>
            <nav class="nav-links" aria-label="Danh mục">
            <a href="/"<?= ($home ?? false) ? ' aria-current="page"' : '' ?>>Trang Chủ</a>
            <a href="/books"<?= ($view === 'books' && !($home ?? false) && !($category ?? '') && ($sort ?? '') !== 'sale') ? ' aria-current="page"' : '' ?>>Tất Cả Sách</a>
            <a href="/about"<?= $view === 'about' ? ' aria-current="page"' : '' ?>>Về chúng tôi &amp; Liên hệ</a>
            <?php foreach (array_slice($navCategories, 0, 6) as $label): ?>
                <a href="/books?<?= $e(http_build_query(['category'=>$label])) ?>"<?= ($category ?? '') === $label ? ' aria-current="page"' : '' ?>><?= $e($label) ?></a>
            <?php endforeach; ?>
            </nav>
        </div>
    </div>
</header>
<main class="wrap main-content">
    <?php if ($flash): ?><p class="notice" role="status"><?= $e($flash) ?></p><?php endif; ?>
    <?php require __DIR__ . '/' . $view . '.php'; ?>
</main>
<footer class="site-footer">
    <div class="wrap footer-row">
        <div><a class="brand" href="/">Sách Hay</a><p>Nhà sách trực tuyến · Phước Tân, Biên Hòa, Đồng Nai</p></div>
        <div><a href="/about">Liên hệ</a> · <a href="/orders">Tra cứu đơn hàng</a> · <a href="/admin">Quản trị</a></div>
    </div>
</footer>
</body>
</html>
