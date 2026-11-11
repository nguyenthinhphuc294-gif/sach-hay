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
    <div class="announcement"><div class="wrap">Nhà sách trực tuyến Sách Hay · Miễn phí vận chuyển từ 250.000 ₫</div></div>
    <div class="wrap header-row">
        <a class="brand" href="/">Sách <span>Hay</span></a>
        <form class="search" action="/books" role="search">
            <input name="q" value="<?= $e($q ?? '') ?>" placeholder="Tìm tên sách, tác giả hoặc ISBN" aria-label="Tìm sách">
            <button>Tìm sách</button>
        </form>
        <nav class="quick-links" aria-label="Mua hàng">
            <a href="/account"><?= $email ? 'Tài khoản của tôi' : 'Tài khoản' ?></a>
            <a href="/cart">Giỏ hàng <span class="count"><?= $cartCount ?></span></a>
        </nav>
    </div>
    <nav class="nav-bar" aria-label="Danh mục">
        <div class="wrap">
            <a href="/">Trang chủ</a><a href="/books">Tất cả sách</a>
            <?php foreach (['Văn Học','Sách Kinh Tế','Tâm Lý - Kỹ Năng','Manga - Comic','Sách Thiếu Nhi'] as $label): ?>
                <a href="/books?<?= $e(http_build_query(['category'=>$label])) ?>"<?= ($category ?? '') === $label ? ' aria-current="page"' : '' ?>><?= $e($label) ?></a>
            <?php endforeach; ?>
            <a href="/orders">Tra cứu đơn hàng</a><a href="/about">Về chúng tôi &amp; Liên hệ</a>
        </div>
    </nav>
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
