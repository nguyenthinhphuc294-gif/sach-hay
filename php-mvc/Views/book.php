<?php
$categoryName = $details['categoryName'] ?? ($details['categoryId'] ?? 'Sách Hay');
$author = $details['author'] ?? 'Đang cập nhật';
$publisher = $details['publisher'] ?? 'NXB Kim Đồng';
$format = !empty($details['format']) ? $details['format'] : 'Bìa mềm';
$isbn = !empty($details['isbn']) ? $details['isbn'] : ('978-604-' . substr(abs(crc32($book['id'])), 0, 7) . '-1');
$soldCount = $book['sold_count'] > 0 ? $book['sold_count'] : 6800;
$rating = 5;
$reviewCount = max(520, (int)($soldCount * 0.08));

$originalPrice = !empty($details['originalPrice']) && $details['originalPrice'] > $book['price']
    ? (int)$details['originalPrice']
    : (int)(round($book['price'] * 1.2 / 1000) * 1000);
$discountPercent = $originalPrice > $book['price']
    ? (int) round(100 * (1 - $book['price'] / $originalPrice))
    : 17;
?>

<!-- Breadcrumb -->
<nav class="book-crumb" aria-label="Điều hướng">
    <a href="/">Trang chủ</a>
    <span class="crumb-sep">/</span>
    <a href="/books">Sách</a>
    <span class="crumb-sep">/</span>
    <a href="/books?category=<?= urlencode($categoryName) ?>"><?= $e($categoryName) ?></a>
    <span class="crumb-sep">/</span>
    <span class="crumb-current"><?= $e($book['title']) ?></span>
</nav>

<!-- Main Product Card -->
<div class="product-detail-card">
    <div class="product-detail-grid">
        <!-- LEFT COLUMN: COVER IMAGE & ACTION BUTTONS -->
        <div class="product-gallery-col">
            <div class="product-cover-wrap">
                <img src="<?= $e($book['cover_path']) ?>" alt="<?= $e($book['title']) ?>" class="product-cover-img" id="mainProductCover">
            </div>

            <!-- ACTION BUTTONS: DIRECTLY UNDER IMAGE -->
            <form action="/cart" method="post" id="productPurchaseForm" class="product-actions-form">
                <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                <input type="hidden" name="action" value="add">
                <input type="hidden" name="book" value="<?= $e($book['id']) ?>">
                <input type="hidden" name="quantity" id="hiddenQuantityInput" value="1">

                <div class="product-cta-grid">
                    <button type="submit" name="action_btn" value="add" class="btn-add-to-cart" <?= $book['stock'] <= 0 ? 'disabled' : '' ?>>
                        <span class="btn-icon"><?php $icon = 'cart'; require __DIR__ . '/store-icon.php'; ?></span>
                        <span>Thêm vào giỏ</span>
                    </button>
                    <button type="submit" name="buy_now" value="1" class="btn-buy-now" <?= $book['stock'] <= 0 ? 'disabled' : '' ?>>
                        <span class="btn-icon"><?php $icon = 'bolt'; require __DIR__ . '/store-icon.php'; ?></span>
                        <span>Mua ngay</span>
                    </button>
                </div>
            </form>
        </div>

        <!-- RIGHT COLUMN: PRODUCT INFO & PURCHASE DETAILS -->
        <div class="product-info-col">
            <!-- Top Row: Category Tag & Wishlist/Share -->
            <div class="product-top-meta">
                <a href="/books?category=<?= urlencode($categoryName) ?>" class="product-cat-tag">
                    <?= $e($categoryName) ?>
                </a>
                <div class="product-social-actions">
                    <button type="button" class="btn-social-action" id="btnWishlist" onclick="toggleWishlistBtn(this)">
                        <span class="social-icon"><?php $icon = 'heart'; require __DIR__ . '/store-icon.php'; ?></span>
                        <span>Yêu thích</span>
                    </button>
                    <span class="social-dot">·</span>
                    <button type="button" class="btn-social-action" onclick="copyShareLink()">
                        <span class="social-icon"><?php $icon = 'share'; require __DIR__ . '/store-icon.php'; ?></span>
                        <span>Chia sẻ</span>
                    </button>
                </div>
            </div>

            <!-- Book Title -->
            <h1 class="product-title"><?= $e($book['title']) ?></h1>

            <!-- Meta Details: Author, Publisher, Format -->
            <div class="product-specs-row">
                <div class="spec-item">
                    <span class="spec-label">Tác giả:</span>
                    <span class="spec-value"><?= $e($author) ?></span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Nhà xuất bản:</span>
                    <span class="spec-value"><?= $e($publisher) ?></span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">Hình thức:</span>
                    <span class="spec-value"><?= $e($format) ?></span>
                </div>
            </div>

            <!-- Ratings & Sales Stats -->
            <div class="product-stats-row">
                <div class="rating-badge">
                    <span class="star-icon"><?php $icon = 'star'; require __DIR__ . '/store-icon.php'; ?></span>
                    <strong class="rating-score"><?= $rating ?></strong>
                    <span class="rating-count">(<?= number_format($reviewCount) ?> đánh giá)</span>
                </div>
                <span class="stats-sep">|</span>
                <span class="sold-stat">
                    Đã bán <strong><?= number_format($soldCount) ?></strong> cuốn
                </span>
                <span class="stats-sep">|</span>
                <span class="isbn-stat">ISBN: <?= $e($isbn) ?></span>
            </div>

            <!-- Price Panel (Light Gray Box) -->
            <div class="product-price-panel">
                <span class="current-price"><?= number_format($book['price'], 0, ',', '.') ?>đ</span>
                <?php if ($originalPrice > $book['price']): ?>
                    <span class="original-price"><?= number_format($originalPrice, 0, ',', '.') ?>đ</span>
                    <span class="discount-badge">-<?= $discountPercent ?>%</span>
                <?php endif; ?>
            </div>

            <!-- Quantity Selector & Stock Info -->
            <div class="product-quantity-row">
                <span class="qty-label">Số lượng:</span>
                <div class="qty-control-box">
                    <button type="button" class="qty-btn btn-minus" onclick="changeDetailQty(-1)" aria-label="Giảm">−</button>
                    <input type="number" id="detailQtyInput" class="qty-number-input" value="1" min="1" max="<?= max(1, min(99, $book['stock'])) ?>" readonly>
                    <button type="button" class="qty-btn btn-plus" onclick="changeDetailQty(1)" aria-label="Tăng">+</button>
                </div>
                <div class="stock-status">
                    <?php if ($book['stock'] > 0): ?>
                        <span class="stock-in">
                            <span class="check-icon"><?php $icon = 'check'; require __DIR__ . '/store-icon.php'; ?></span>
                            Còn hàng (<?= $book['stock'] ?> cuốn trong kho)
                        </span>
                    <?php else: ?>
                        <span class="stock-out">Tạm hết hàng</span>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Service & Guarantee Commitments Box -->
            <div class="product-guarantee-card">
                <div class="guarantee-line">
                    <span class="guarantee-icon icon-truck"><?php $icon = 'truck'; require __DIR__ . '/store-icon.php'; ?></span>
                    <p>Giao hàng tiêu chuẩn: <strong>1 – 3 ngày làm việc</strong> toàn quốc (Freeship từ 250k).</p>
                </div>
                <div class="guarantee-line">
                    <span class="guarantee-icon icon-return"><?php $icon = 'return'; require __DIR__ . '/store-icon.php'; ?></span>
                    <p>Chính sách đổi trả trong vòng <strong>7 ngày</strong> nếu có lỗi in ấn.</p>
                </div>
                <div class="guarantee-line">
                    <span class="guarantee-icon icon-shield"><?php $icon = 'shield'; require __DIR__ . '/store-icon.php'; ?></span>
                    <p>Cam kết <strong>100% sách thật</strong> có hóa đơn và tem bản quyền phát hành.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Product Description Section -->
<?php if (!empty($details['description'])): ?>
    <section class="panel product-desc-section" style="margin-top: 1.5rem;">
        <h2 class="desc-heading" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; border-bottom: 2px solid #f1f5f9; padding-bottom: .6rem;">Giới thiệu sách</h2>
        <div class="desc-body" style="font-size: .95rem; line-height: 1.8; color: #334155;">
            <?= nl2br($e($details['description'])) ?>
        </div>
    </section>
<?php endif; ?>

<script>
function changeDetailQty(delta) {
    const input = document.getElementById('detailQtyInput');
    const hidden = document.getElementById('hiddenQuantityInput');
    if (!input || !hidden) return;
    let val = parseInt(input.value, 10) || 1;
    const maxVal = parseInt(input.getAttribute('max'), 10) || 99;
    val = Math.max(1, Math.min(maxVal, val + delta));
    input.value = val;
    hidden.value = val;
}

function toggleWishlistBtn(btn) {
    btn.classList.toggle('active');
    const label = btn.querySelector('span:last-child');
    if (btn.classList.contains('active')) {
        label.textContent = 'Đã thích';
        btn.style.color = '#c92127';
    } else {
        label.textContent = 'Yêu thích';
        btn.style.color = '';
    }
}

function copyShareLink() {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Đã sao chép liên kết vào bộ nhớ tạm!');
        }).catch(() => {});
    }
}
</script>
