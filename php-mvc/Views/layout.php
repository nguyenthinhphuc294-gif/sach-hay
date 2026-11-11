<?php
$e = static fn(mixed $value): string => htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$money = static fn(mixed $value): string => number_format((int) ($value ?? 0), 0, ',', '.') . ' ₫';
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
            <div class="notification-box" id="notification-box">
                <button type="button" class="notif-bell-btn" id="notif-bell-btn" aria-label="Thông báo" aria-expanded="false" title="Thông báo Nhà sách">
                    <span class="quick-icon notif-icon-wrap">
                        <?php $icon = 'bell'; require __DIR__ . '/store-icon.php'; ?>
                        <span class="notif-badge-dot" id="notif-badge-dot">5</span>
                    </span>
                </button>
                <div class="notif-popover" id="notif-popover" role="dialog" aria-label="Trung tâm thông báo" hidden>
                    <div class="notif-popover-header">
                        <div class="notif-header-title">
                            <span class="notif-title-bell">🔔</span>
                            <strong>Thông Báo</strong>
                            <span class="notif-unread-tag" id="notif-unread-tag">5 mới</span>
                        </div>
                        <button type="button" class="notif-btn-mark-read" onclick="markAllNotifsRead(event)">
                            Đã đọc tất cả ✓
                        </button>
                    </div>

                    <div class="notif-filter-tabs">
                        <button type="button" class="ntab-chip active" onclick="filterNotifCategory('all', this)">Tất cả</button>
                        <button type="button" class="ntab-chip" onclick="filterNotifCategory('promo', this)">Khuyến mãi</button>
                        <button type="button" class="ntab-chip" onclick="filterNotifCategory('order', this)">Đơn hàng</button>
                        <button type="button" class="ntab-chip" onclick="filterNotifCategory('system', this)">Hệ thống</button>
                    </div>

                    <div class="notif-list-body" id="notif-list-body">
                        <!-- 1. Voucher -->
                        <a href="/account#vouchers" class="notif-item unread" data-id="notif-1" data-category="promo" onclick="markSingleNotifRead(this)">
                            <div class="notif-item-icon promo">🎟️</div>
                            <div class="notif-item-content">
                                <div class="notif-item-head">
                                    <strong class="notif-item-title">Mở Kho 43 Mã Voucher &amp; Freeship!</strong>
                                    <span class="notif-dot"></span>
                                </div>
                                <p class="notif-item-desc">Đã mở 17 mã Miễn phí vận chuyển từ 0đ và voucher giảm đến 100k. Nhấn để áp dụng ngay!</p>
                                <span class="notif-item-time">Vừa xong · Ưu đãi độc quyền</span>
                            </div>
                        </a>

                        <!-- 2. Flash Sale -->
                        <a href="/#flash-sale" class="notif-item unread" data-id="notif-2" data-category="promo" onclick="markSingleNotifRead(this)">
                            <div class="notif-item-icon flash">⚡</div>
                            <div class="notif-item-content">
                                <div class="notif-item-head">
                                    <strong class="notif-item-title">Flash Sale Giờ Vàng Đang Diễn Ra</strong>
                                    <span class="notif-dot"></span>
                                </div>
                                <p class="notif-item-desc">Sách kinh tế, AI và kỹ năng sống giảm sốc đến 22% chỉ từ 95.000 ₫. Khung giờ vàng hôm nay!</p>
                                <span class="notif-item-time">15 phút trước · Flash Sale</span>
                            </div>
                        </a>

                        <!-- 3. Freeship -->
                        <a href="/about" class="notif-item unread" data-id="notif-3" data-category="order" onclick="markSingleNotifRead(this)">
                            <div class="notif-item-icon shipping">🚚</div>
                            <div class="notif-item-content">
                                <div class="notif-item-head">
                                    <strong class="notif-item-title">Miễn Phí Giao Hàng Toàn Quốc Từ 250k</strong>
                                    <span class="notif-dot"></span>
                                </div>
                                <p class="notif-item-desc">Đơn hàng sách từ 250.000 ₫ được freeship tự động tiêu chuẩn trên toàn quốc, giao tận nơi nhanh chóng.</p>
                                <span class="notif-item-time">1 giờ trước · Vận chuyển</span>
                            </div>
                        </a>

                        <!-- 4. Hội viên -->
                        <a href="/account#membership" class="notif-item unread" data-id="notif-4" data-category="system" onclick="markSingleNotifRead(this)">
                            <div class="notif-item-icon member">⭐</div>
                            <div class="notif-item-content">
                                <div class="notif-item-head">
                                    <strong class="notif-item-title">Đặc Quyền Hội Viên: Tặng 150 Sách Xu</strong>
                                    <span class="notif-dot"></span>
                                </div>
                                <p class="notif-item-desc">Tạo tài khoản nhận ngay 150 Sách Xu tích lũy đổi voucher ưu đãi. Tích điểm 2% giá trị mọi đơn hàng.</p>
                                <span class="notif-item-time">3 giờ trước · Hội viên Sách Hay</span>
                            </div>
                        </a>

                        <!-- 5. Cam kết -->
                        <a href="/about" class="notif-item unread" data-id="notif-5" data-category="system" onclick="markSingleNotifRead(this)">
                            <div class="notif-item-icon quality">🛡️</div>
                            <div class="notif-item-content">
                                <div class="notif-item-head">
                                    <strong class="notif-item-title">Cam Kết 100% Sách Thật &amp; Chính Hãng</strong>
                                    <span class="notif-dot"></span>
                                </div>
                                <p class="notif-item-desc">Bảo hành in ấn và đổi trả miễn phí trong 7 ngày nếu sách bị lỗi từ nhà xuất bản. Đọc sách an tâm tuyệt đối.</p>
                                <span class="notif-item-time">Hôm qua · Thông báo chung</span>
                            </div>
                        </a>
                    </div>

                    <div class="notif-popover-footer">
                        <a href="/account#vouchers" class="notif-footer-link">Xem tất cả 43 ưu đãi trong Tài khoản &rarr;</a>
                    </div>
                </div>
            </div>
            <a href="/cart" class="cart-link" aria-label="Giỏ hàng"><span class="quick-icon cart-icon-wrap"><?php $icon = 'cart'; require __DIR__ . '/store-icon.php'; ?><span class="cart-badge" data-cart-badge style="<?= ($cartCount ?? 0) > 0 ? '' : 'display:none;' ?>"><?= $cartCount ?? 0 ?></span></span><span class="cart-label">Giỏ hàng</span></a>
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
