<?php
$itemCount = count($lines);
$totalQuantity = 0;
$subtotal = 0;

foreach ($lines as $line) {
    $qty = (int)($line['quantity'] ?? 1);
    $totalQuantity += $qty;
    if (!empty($line['book'])) {
        $subtotal += ((int)$line['book']['price'] * $qty);
    }
}

$shippingFee = ($subtotal >= 250000 || $subtotal === 0) ? 0 : 25000;
$estimatedTotal = $subtotal + $shippingFee;
?>

<!-- Breadcrumb -->
<nav class="book-crumb" aria-label="Điều hướng">
    <a href="/">Trang chủ</a>
    <span class="crumb-sep">></span>
    <span class="crumb-current">
        <?= $checkout ? 'Thanh toán đơn hàng' : 'Giỏ hàng (' . $itemCount . ' sản phẩm)' ?>
    </span>
</nav>

<?php if (!$checkout): ?>
    <?php if (!$lines): ?>
        <div class="empty-cart-card">
            <div class="empty-cart-icon">
                <?php $icon = 'cart'; require __DIR__ . '/store-icon.php'; ?>
            </div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy khám phá hàng ngàn tựa sách hấp dẫn tại Sách Hay và chọn cho mình cuốn sách yêu thích nhé!</p>
            <a href="/books" class="btn-continue-shopping">Tiếp tục mua sắm ngay</a>
        </div>
    <?php else: ?>
        <div class="cart-layout-grid">
            <!-- LEFT COLUMN: CART ITEMS LIST -->
            <div class="cart-main-col">
                <!-- Select All Bar -->
                <div class="cart-header-bar">
                    <label class="select-all-label">
                        <input type="checkbox" id="selectAllCheckbox" checked onchange="toggleAllCartItems(this)">
                        <span>Chọn tất cả (<?= $itemCount ?> sản phẩm)</span>
                    </label>
                    <span class="header-unit-label">Đơn giá / Số lượng</span>
                </div>

                <!-- Items Container -->
                <div class="cart-items-container">
                    <?php foreach ($lines as $line): ?>
                        <?php
                        $book = $line['book'] ?? null;
                        $linePrice = $book ? ($book['price'] * $line['quantity']) : 0;
                        $cat = '';
                        $author = '';
                        if ($book && !empty($book['catalog'])) {
                            $catData = json_decode($book['catalog'], true);
                            $cat = $catData['categoryName'] ?? '';
                            $author = $catData['author'] ?? '';
                        }
                        ?>
                        <div class="cart-item-row" id="cart-item-<?= $e($line['bookId']) ?>">
                            <!-- Checkbox -->
                            <div class="item-check">
                                <input type="checkbox" class="cart-item-checkbox" checked onchange="updateCartSummary()">
                            </div>

                            <!-- Thumbnail -->
                            <div class="item-thumb-box">
                                <?php if ($book): ?>
                                    <a href="/books/<?= $e($line['bookId']) ?>">
                                        <img src="<?= $e($book['cover_path']) ?>" alt="<?= $e($book['title']) ?>" class="item-thumb-img">
                                    </a>
                                <?php else: ?>
                                    <div class="item-thumb-empty">N/A</div>
                                <?php endif; ?>
                            </div>

                            <!-- Info -->
                            <div class="item-info-box">
                                <?php if ($book): ?>
                                    <a href="/books/<?= $e($line['bookId']) ?>" class="item-title">
                                        <?= $e($book['title']) ?>
                                    </a>
                                    <div class="item-subtitle">
                                        <?= $e($author) ?><?= ($author && $cat) ? ' · ' : '' ?><?= $e($cat) ?>
                                    </div>
                                <?php else: ?>
                                    <span class="item-title text-muted">Sách không còn bán</span>
                                <?php endif; ?>
                            </div>

                            <!-- Pricing, Quantity & Remove Actions -->
                            <div class="item-actions-box">
                                <div class="item-prices">
                                    <span class="item-total-price" id="line-total-<?= $e($line['bookId']) ?>">
                                        <?= number_format($linePrice, 0, ',', '.') ?>đ
                                    </span>
                                    <?php if ($book): ?>
                                        <span class="item-unit-price">
                                            <?= number_format($book['price'], 0, ',', '.') ?>đ / cuốn
                                        </span>
                                    <?php endif; ?>
                                </div>

                                <div class="item-qty-actions">
                                    <form method="post" action="/cart" class="cart-qty-form" id="qty-form-<?= $e($line['bookId']) ?>">
                                        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                                        <input type="hidden" name="book" value="<?= $e($line['bookId']) ?>">
                                        <input type="hidden" name="quantity" id="qty-input-<?= $e($line['bookId']) ?>" value="<?= $line['quantity'] ?>">

                                        <div class="cart-stepper">
                                            <button type="button" class="stepper-btn" onclick="stepCartQty('<?= $e($line['bookId']) ?>', -1)" aria-label="Giảm">−</button>
                                            <span class="stepper-val" id="qty-display-<?= $e($line['bookId']) ?>"><?= $line['quantity'] ?></span>
                                            <button type="button" class="stepper-btn" onclick="stepCartQty('<?= $e($line['bookId']) ?>', 1)" aria-label="Tăng">+</button>
                                        </div>
                                    </form>

                                    <form method="post" action="/cart" class="cart-remove-form">
                                        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                                        <input type="hidden" name="book" value="<?= $e($line['bookId']) ?>">
                                        <button type="submit" name="action" value="remove" class="btn-remove-item" title="Xóa sản phẩm">
                                            <span class="remove-icon"><?php $icon = 'trash'; require __DIR__ . '/store-icon.php'; ?></span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- RIGHT COLUMN: SUMMARY & VOUCHER -->
            <div class="cart-side-col">
                <!-- Voucher Box -->
                <div class="cart-card voucher-card">
                    <div class="voucher-card-head">
                        <span class="voucher-icon"><?php $icon = 'tag'; require __DIR__ . '/store-icon.php'; ?></span>
                        <strong class="voucher-title">MÃ GIẢM GIÁ & KHUYẾN MÃI</strong>
                    </div>
                    <p class="voucher-subtext">Bạn có thể nhập voucher ở bước thanh toán.</p>
                </div>

                <!-- Order Summary Box -->
                <div class="cart-card summary-card">
                    <h2 class="summary-title">TÓM TẮT ĐƠN HÀNG</h2>
                    <div class="summary-row">
                        <span class="summary-label">Tạm tính (<span id="summaryQty"><?= $totalQuantity ?></span> sản phẩm):</span>
                        <span class="summary-value" id="summarySubtotal"><?= number_format($subtotal, 0, ',', '.') ?>đ</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Phí vận chuyển:</span>
                        <span class="summary-value" id="summaryShipping">
                            <?= $shippingFee === 0 ? 'Miễn phí' : number_format($shippingFee, 0, ',', '.') . 'đ' ?>
                        </span>
                    </div>
                    <hr class="summary-divider">
                    <div class="summary-row total-row">
                        <span class="total-label">Tổng dự kiến:</span>
                        <span class="total-value" id="summaryGrandTotal"><?= number_format($estimatedTotal, 0, ',', '.') ?>đ</span>
                    </div>
                    <div class="summary-vat-note">(Đã bao gồm VAT nếu có)</div>

                    <a href="/checkout" class="btn-checkout-submit">
                        Tiến hành đặt hàng (<span id="btnCheckoutQty"><?= $totalQuantity ?></span>)
                        <span class="btn-arrow">→</span>
                    </a>

                    <div class="summary-security-note">
                        <span class="sec-icon"><?php $icon = 'shield'; require __DIR__ . '/store-icon.php'; ?></span>
                        <span>Bảo mật đơn hàng 100% · Hỗ trợ COD tận nơi</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- BOTTOM TRUST BADGES -->
        <div class="cart-trust-badges">
            <div class="trust-badge-col">
                <span class="trust-icon icon-truck"><?php $icon = 'truck'; require __DIR__ . '/store-icon.php'; ?></span>
                <div class="trust-text">
                    <strong>Giao Hàng Toàn Quốc</strong>
                    <p>Miễn phí cho đơn từ 250k</p>
                </div>
            </div>
            <div class="trust-badge-col">
                <span class="trust-icon icon-return"><?php $icon = 'return'; require __DIR__ . '/store-icon.php'; ?></span>
                <div class="trust-text">
                    <strong>Đổi Trả Trong 7 Ngày</strong>
                    <p>Đổi trả dễ dàng nếu lỗi in ấn</p>
                </div>
            </div>
            <div class="trust-badge-col">
                <span class="trust-icon icon-shield"><?php $icon = 'shield'; require __DIR__ . '/store-icon.php'; ?></span>
                <div class="trust-text">
                    <strong>100% Sách Thật</strong>
                    <p>Cam kết từ các NXB uy tín</p>
                </div>
            </div>
            <div class="trust-badge-col">
                <span class="trust-icon icon-card"><?php $icon = 'card'; require __DIR__ . '/store-icon.php'; ?></span>
                <div class="trust-text">
                    <strong>Thanh Toán Linh Hoạt</strong>
                    <p>Hỗ trợ COD & Nhận tại nhà sách</p>
                </div>
            </div>
        </div>
    <?php endif; ?>

<?php else: ?>
    <!-- CHECKOUT VIEW -->
    <?php if ($purchase): $quote = $purchase['quote']; ?>
        <section class="panel" style="background:#fff; border-radius:1rem; padding:1.5rem; margin-bottom:1.5rem; border:1px solid #e5e5e5;">
            <h2 style="font-size:1.25rem; font-weight:700; color:#0f172a; margin-bottom:1rem;">Xác nhận đơn hàng</h2>
            <p style="color:#475569; margin-bottom:1rem;">Người nhận: <strong><?= $e($purchase['input']['customerName']) ?></strong> · <?= $e($purchase['input']['phone']) ?></p>
            <dl style="display:grid; grid-template-columns:auto 1fr; gap:.5rem 1rem; margin-bottom:1.5rem;">
                <dt style="color:#64748b;">Tiền sách:</dt><dd style="font-weight:600;"><?= $money($quote['subtotal']) ?></dd>
                <dt style="color:#64748b;">Phí giao hàng:</dt><dd style="font-weight:600;"><?= $money($quote['shippingFee']) ?></dd>
                <dt style="color:#64748b;">Giảm giá:</dt><dd style="font-weight:600; color:#16a34a;">-<?= $money($quote['discount']) ?></dd>
                <dt style="color:#64748b; font-size:1.1rem; font-weight:700;">Tổng thanh toán:</dt>
                <dd style="color:#c92127; font-size:1.35rem; font-weight:800;"><?= $money($quote['total']) ?></dd>
            </dl>
            <form action="/checkout" method="post">
                <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                <input type="hidden" name="key" value="<?= $e($purchase['key']) ?>">
                <button name="action" value="place" class="btn-checkout-submit" style="display:inline-block; width:auto; padding:0.75rem 2rem;">
                    Xác nhận đặt hàng ngay
                </button>
            </form>
        </section>
    <?php endif; ?>

    <section class="panel" style="background:#fff; border-radius:1rem; padding:1.5rem; border:1px solid #e5e5e5;">
        <h2 style="font-size:1.25rem; font-weight:700; color:#0f172a; margin-bottom:1.2rem;">Thông tin nhận hàng</h2>
        <form action="/checkout" method="post" class="form-grid">
            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
            <label>Họ tên<input name="customerName" required maxlength="100" value="<?= $e($purchase['input']['customerName'] ?? '') ?>" placeholder="Nguyễn Văn A"></label>
            <label>Số điện thoại<input name="phone" type="tel" required pattern="0[0-9]{9}" value="<?= $e($purchase['input']['phone'] ?? '') ?>" placeholder="0912345678"></label>
            <label>Email<input name="email" type="email" required value="<?= $e($purchase['input']['email'] ?? ($email ?? '')) ?>" placeholder="email@example.com"></label>
            <label>Tỉnh / thành<input name="province" maxlength="150" value="<?= $e($purchase['input']['province'] ?? '') ?>" placeholder="Hà Nội, TP.HCM,..."></label>
            <label>Quận / huyện<input name="district" maxlength="150" value="<?= $e($purchase['input']['district'] ?? '') ?>" placeholder="Quận/Huyện"></label>
            <label>Phường / xã<input name="ward" maxlength="150" value="<?= $e($purchase['input']['ward'] ?? '') ?>" placeholder="Phường/Xã"></label>
            <label>Địa chỉ cụ thể<input name="address" maxlength="150" value="<?= $e($purchase['input']['address'] ?? '') ?>" placeholder="Số nhà, tên đường..."></label>
            <label>Mã giảm giá (nếu có)<input name="voucherCode" maxlength="40" value="<?= $e($purchase['input']['voucherCode'] ?? '') ?>" placeholder="Nhập mã voucher"></label>
            <label>Hình thức thanh toán<select name="paymentMethod">
                <?php foreach (['COD'=>'Thanh toán khi nhận hàng (COD)','STORE_PICKUP'=>'Nhận tại cửa hàng','BANK_TRANSFER'=>'Chuyển khoản VietQR'] as $key=>$label): ?>
                    <?php if ($key !== 'BANK_TRANSFER' || $bankAvailable): ?><option value="<?= $e($key) ?>"<?= ($purchase['input']['paymentMethod'] ?? 'COD') === $key ? ' selected' : '' ?>><?= $e($label) ?></option><?php endif; ?>
                <?php endforeach; ?>
            </select></label>
            <label style="grid-column: 1 / -1;">Ghi chú giao hàng<textarea name="notes" maxlength="400" placeholder="Ghi chú thêm về thời gian nhận sách..."><?= $e($purchase['input']['notes'] ?? '') ?></textarea></label>
            <div style="grid-column: 1 / -1; margin-top: 0.5rem;">
                <button name="action" value="quote" class="btn-checkout-submit" style="display:inline-block; width:auto; padding:0.75rem 2rem;">
                    Kiểm tra tổng tiền
                </button>
            </div>
        </form>
    </section>
<?php endif; ?>

<script>
function stepCartQty(bookId, delta) {
    const input = document.getElementById('qty-input-' + bookId);
    const form = document.getElementById('qty-form-' + bookId);
    if (!input || !form) return;
    let val = parseInt(input.value, 10) || 1;
    val = Math.max(0, Math.min(99, val + delta));
    input.value = val;
    form.submit();
}

function toggleAllCartItems(masterCheckbox) {
    const checkboxes = document.querySelectorAll('.cart-item-checkbox');
    checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
    updateCartSummary();
}

function updateCartSummary() {
    // Visual feedback when toggling checkboxes
    let totalItems = 0;
    const checkboxes = document.querySelectorAll('.cart-item-checkbox');
    checkboxes.forEach(cb => {
        const row = cb.closest('.cart-item-row');
        if (row) {
            if (cb.checked) {
                row.style.opacity = '1';
                row.style.background = '#fff';
            } else {
                row.style.opacity = '0.55';
                row.style.background = '#f8fafc';
            }
        }
    });
}
</script>
