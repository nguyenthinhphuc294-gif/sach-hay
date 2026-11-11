<?php
// Tính toán số liệu giỏ hàng
$subtotal = 0;
$totalItems = 0;
foreach ($lines as $line) {
    if (!empty($line['book'])) {
        $subtotal += (int) $line['book']['price'] * (int) $line['quantity'];
        $totalItems += (int) $line['quantity'];
    }
}

$freeshipThreshold = 250000;
$freeshipRemaining = max(0, $freeshipThreshold - $subtotal);
$freeshipPercent = min(100, round(($subtotal / $freeshipThreshold) * 100));
$estShipping = ($subtotal >= $freeshipThreshold || (!empty($purchase['input']['paymentMethod']) && $purchase['input']['paymentMethod'] === 'STORE_PICKUP')) ? 0 : 25000;

// Dữ liệu mặc định người nhận (prefill từ tài khoản / purchase trước đó)
$defaultName = $purchase['input']['customerName'] ?? ($customerName ?? '');
$defaultPhone = $purchase['input']['phone'] ?? ($customerPhone ?? '');
$defaultEmail = $purchase['input']['email'] ?? ($email ?? '');
$defaultAddress = $purchase['input']['address'] ?? ($customerAddress ?? '');
$defaultVoucher = $purchase['input']['voucherCode'] ?? ($_GET['voucher'] ?? '');
?>

<div class="cart-portal-wrapper">
    <!-- 1. THANH TIẾN TRÌNH MUA HÀNG (STEP BAR) -->
    <div class="cart-step-bar">
        <a href="/cart" class="cart-step-item <?= !$checkout ? 'active' : 'completed' ?>">
            <span class="step-num"><?= $checkout ? '✓' : '1' ?></span>
            <span class="step-text">Giỏ Hàng (<?= $totalItems ?> sản phẩm)</span>
        </a>
        <span class="step-arrow">&rarr;</span>
        <a href="/checkout" class="cart-step-item <?= $checkout ? 'active' : '' ?>">
            <span class="step-num">2</span>
            <span class="step-text">Đặt Hàng &amp; Thanh Toán</span>
        </a>
        <span class="step-arrow">&rarr;</span>
        <span class="cart-step-item disabled">
            <span class="step-num">3</span>
            <span class="step-text">Hoàn Tất Đơn</span>
        </span>
    </div>

    <?php if (!$lines): ?>
        <!-- GIAO DIỆN KHI GIỎ HÀNG TRỐNG -->
        <div class="cart-empty-card">
            <div class="empty-cart-icon-wrap">
                <span class="empty-icon">🛒</span>
            </div>
            <h2>Giỏ Hàng Của Bạn Đang Trống</h2>
            <p class="empty-subtext">Bạn chưa thêm cuốn sách nào vào giỏ hàng. Hãy khám phá hàng ngàn tựa sách hay cùng ưu đãi Freeship độc quyền!</p>
            <?php if (!empty($_GET['voucher'])): ?>
                <div class="empty-voucher-alert">
                    <span>🎉 Đã chọn mã ưu đãi: <code><?= $e($_GET['voucher']) ?></code>. Chọn sách ngay để được áp dụng tại bước thanh toán!</span>
                </div>
            <?php endif; ?>
            <div class="empty-actions">
                <a href="/books" class="button btn-browse-books">Khám Phá Sách Ngay &rarr;</a>
                <a href="/account#vouchers" class="secondary btn-empty-vouchers">Xem Kho Voucher &rarr;</a>
            </div>
        </div>

    <?php else: ?>

        <!-- 2. THANH TIẾN ĐỘ FREESHIP (MIỄN PHÍ VẬN CHUYỂN) -->
        <div class="freeship-progress-card">
            <div class="freeship-progress-header">
                <?php if ($freeshipRemaining > 0): ?>
                    <span class="freeship-icon">🚚</span>
                    <span class="freeship-text">
                        Mua thêm <strong><?= $money($freeshipRemaining) ?></strong> để được <strong>MIỄN PHÍ GIAO HÀNG</strong> toàn quốc!
                    </span>
                    <a href="/books" class="freeship-add-btn">+ Chọn thêm sách</a>
                <?php else: ?>
                    <span class="freeship-icon success">🎉</span>
                    <span class="freeship-text success">
                        Chúc mừng! Đơn hàng của bạn đã đạt điều kiện <strong>MIỄN PHÍ GIAO HÀNG TOÀN QUỐC</strong> (Freeship 250k)!
                    </span>
                <?php endif; ?>
            </div>
            <div class="freeship-progress-track">
                <div class="freeship-progress-fill" style="width: <?= $freeshipPercent ?>%;"></div>
            </div>
        </div>

        <!-- 3. BỐ CỤC 2 CỘT CHÍNH (MAIN GRID) -->
        <div class="cart-main-grid">
            <!-- CỘT TRÁI: CHI TIẾT SẢN PHẨM HOẶC FORM CHECKOUT -->
            <div class="cart-col-left">
                <?php if (!$checkout): ?>
                    <!-- BẢNG DANH SÁCH SÁCH TRONG GIỎ HÀNG -->
                    <div class="cart-items-panel">
                        <div class="cart-table-header">
                            <span class="col-head-product">Tựa Sách &amp; Chi Tiết (<?= count($lines) ?> tựa)</span>
                            <span class="col-head-price">Đơn Giá</span>
                            <span class="col-head-qty">Số Lượng</span>
                            <span class="col-head-total">Thành Tiền</span>
                            <span class="col-head-action">Thao Tác</span>
                        </div>

                        <div class="cart-items-list">
                            <?php foreach ($lines as $line): 
                                $book = $line['book'];
                                $linePrice = $book ? ($book['price'] * $line['quantity']) : 0;
                            ?>
                                <div class="cart-row-item" data-book-id="<?= $e($line['bookId']) ?>">
                                    <!-- Cột thông tin sách -->
                                    <div class="item-product-cell">
                                        <?php if ($book): ?>
                                            <a href="/books/<?= $e($line['bookId']) ?>" class="item-cover-link">
                                                <img src="<?= $e($book['cover_path']) ?>" alt="<?= $e($book['title']) ?>" class="item-cover-img" loading="lazy">
                                            </a>
                                            <div class="item-meta">
                                                <a href="/books/<?= $e($line['bookId']) ?>" class="item-title"><?= $e($book['title']) ?></a>
                                                <div class="item-tags">
                                                    <span class="in-stock-tag">✓ Còn hàng</span>
                                                    <span class="stock-limit-note">Kho: <?= min(99, $book['stock']) ?></span>
                                                </div>
                                            </div>
                                        <?php else: ?>
                                            <div class="item-meta"><p class="text-danger">Sách tạm thời ngừng kinh doanh</p></div>
                                        <?php endif; ?>
                                    </div>

                                    <!-- Cột đơn giá -->
                                    <div class="item-price-cell">
                                        <span class="cell-label-mobile">Đơn giá:</span>
                                        <strong class="unit-price"><?= $book ? $money($book['price']) : '0 ₫' ?></strong>
                                    </div>

                                    <!-- Cột số lượng với bộ tăng giảm stepper -->
                                    <div class="item-qty-cell">
                                        <span class="cell-label-mobile">Số lượng:</span>
                                        <form method="post" action="/cart" class="qty-stepper-form">
                                            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                                            <input type="hidden" name="book" value="<?= $e($line['bookId']) ?>">
                                            <div class="qty-stepper">
                                                <button type="button" class="btn-step" onclick="stepCartQty(this, -1)" title="Giảm 1">-</button>
                                                <input type="number" name="quantity" min="1" max="<?= min(99, $book['stock'] ?? 99) ?>" value="<?= $line['quantity'] ?>" class="qty-input" onchange="this.form.submit()">
                                                <button type="button" class="btn-step" onclick="stepCartQty(this, 1)" title="Tăng 1">+</button>
                                            </div>
                                        </form>
                                    </div>

                                    <!-- Cột thành tiền -->
                                    <div class="item-total-cell">
                                        <span class="cell-label-mobile">Thành tiền:</span>
                                        <strong class="line-total-price"><?= $money($linePrice) ?></strong>
                                    </div>

                                    <!-- Cột nút xóa -->
                                    <div class="item-action-cell">
                                        <form method="post" action="/cart" class="remove-form" onsubmit="return confirm('Bạn có chắc muốn xóa cuốn sách này khỏi giỏ hàng?');">
                                            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                                            <input type="hidden" name="book" value="<?= $e($line['bookId']) ?>">
                                            <button class="btn-remove-item" name="action" value="remove" title="Xóa cuốn sách này">
                                                🗑️ <span class="remove-text">Xóa</span>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <div class="cart-table-footer">
                            <a href="/books" class="btn-back-catalog">&larr; Tiếp tục chọn thêm sách</a>
                            <span class="cart-total-badge"><?= $totalItems ?> cuốn sách trong giỏ</span>
                        </div>
                    </div>

                <?php else: ?>
                    <!-- KHI Ở BƯỚC /checkout: FORM THÔNG TIN GIAO HÀNG & PHƯƠNG THỨC THANH TOÁN -->
                    <div class="checkout-forms-panel">
                        <?php if ($purchase): $quote = $purchase['quote']; ?>
                            <div class="checkout-confirmed-banner">
                                <div class="confirmed-badge-icon">✓</div>
                                <div>
                                    <h3 style="margin:0 0 .25rem; font-size:1.05rem; color:#15803d;">Thông Tin Đơn Hàng Đã Sẵn Sàng</h3>
                                    <p class="muted" style="margin:0; font-size:.84rem;">
                                        Người nhận: <strong><?= $e($purchase['input']['customerName']) ?></strong> (<?= $e($purchase['input']['phone']) ?>) · Giao đến: <?= $e($purchase['input']['address']) ?>, <?= $e($purchase['input']['ward'] ?? '') ?>, <?= $e($purchase['input']['district'] ?? '') ?>, <?= $e($purchase['input']['province'] ?? '') ?>
                                    </p>
                                </div>
                            </div>
                        <?php endif; ?>

                        <form action="/checkout" method="post" id="checkout-main-form" class="checkout-form-styled">
                            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">

                            <!-- THẺ 1: THÔNG TIN NGƯỜI NHẬN -->
                            <div class="form-section-card">
                                <div class="fsec-header">
                                    <span class="fsec-num">1</span>
                                    <h3>Thông Tin Người Nhận Hàng</h3>
                                </div>
                                <div class="form-row-2">
                                    <div class="form-field">
                                        <label for="co-name">Họ và tên người nhận <span class="required">*</span></label>
                                        <input id="co-name" name="customerName" required maxlength="100" value="<?= $e($defaultName) ?>" placeholder="Ví dụ: Nguyễn Văn A">
                                    </div>
                                    <div class="form-field">
                                        <label for="co-phone">Số điện thoại liên hệ <span class="required">*</span></label>
                                        <input id="co-phone" name="phone" type="tel" required pattern="0[0-9]{9}" value="<?= $e($defaultPhone) ?>" placeholder="Ví dụ: 0912345678 (10 số)">
                                    </div>
                                </div>
                                <div class="form-field">
                                    <label for="co-email">Địa chỉ Email nhận thông tin đơn <span class="required">*</span></label>
                                    <input id="co-email" name="email" type="email" required value="<?= $e($defaultEmail) ?>" placeholder="email@gmail.com để nhận hóa đơn">
                                </div>
                            </div>

                            <!-- THẺ 2: ĐỊA CHỈ GIAO HÀNG -->
                            <div class="form-section-card">
                                <div class="fsec-header">
                                    <span class="fsec-num">2</span>
                                    <h3>Địa Chỉ Giao Hàng Tận Nơi</h3>
                                </div>
                                <div class="form-row-3">
                                    <div class="form-field">
                                        <label for="co-prov">Tỉnh / Thành phố <span class="required">*</span></label>
                                        <input id="co-prov" name="province" required maxlength="150" value="<?= $e($purchase['input']['province'] ?? 'Đồng Nai') ?>" placeholder="Tỉnh / Thành phố">
                                    </div>
                                    <div class="form-field">
                                        <label for="co-dist">Quận / Huyện <span class="required">*</span></label>
                                        <input id="co-dist" name="district" required maxlength="150" value="<?= $e($purchase['input']['district'] ?? 'Biên Hòa') ?>" placeholder="Quận / Huyện">
                                    </div>
                                    <div class="form-field">
                                        <label for="co-ward">Phường / Xã <span class="required">*</span></label>
                                        <input id="co-ward" name="ward" required maxlength="150" value="<?= $e($purchase['input']['ward'] ?? 'Phước Tân') ?>" placeholder="Phường / Xã">
                                    </div>
                                </div>
                                <div class="form-field">
                                    <label for="co-addr">Địa chỉ cụ thể (Số nhà, tên đường...) <span class="required">*</span></label>
                                    <input id="co-addr" name="address" required maxlength="150" value="<?= $e($defaultAddress) ?>" placeholder="Ví dụ: 123 Đường Nguyễn Ái Quốc, KP 3">
                                </div>
                            </div>

                            <!-- THẺ 3: PHƯƠNG THỨC THANH TOÁN -->
                            <div class="form-section-card">
                                <div class="fsec-header">
                                    <span class="fsec-num">3</span>
                                    <h3>Phương Thức Thanh Toán</h3>
                                </div>
                                <div class="payment-methods-grid">
                                    <?php 
                                    $currMethod = $purchase['input']['paymentMethod'] ?? 'COD';
                                    $methods = [
                                        'COD' => [
                                            'title' => 'Thanh toán tiền mặt khi nhận hàng (COD)',
                                            'desc' => 'Quý khách nhận sách tại nhà, kiểm tra rồi mới thanh toán tiền mặt cho bưu tá.',
                                            'icon' => '💵'
                                        ],
                                        'BANK_TRANSFER' => [
                                            'title' => 'Chuyển khoản VietQR tức thì (Miễn phí)',
                                            'desc' => 'Quét mã VietQR qua app ngân hàng bất kỳ, hệ thống đối soát tự động tức thì.',
                                            'icon' => '🏦',
                                            'available' => $bankAvailable
                                        ],
                                        'STORE_PICKUP' => [
                                            'title' => 'Nhận trực tiếp tại nhà sách Sách Hay',
                                            'desc' => 'Miễn phí vận chuyển 100%, sách được giữ sẵn tại quầy phục vụ của nhà sách.',
                                            'icon' => '🏪'
                                        ]
                                    ];
                                    ?>
                                    <?php foreach ($methods as $key => $m): 
                                        if (isset($m['available']) && !$m['available']) continue;
                                    ?>
                                        <label class="payment-radio-card <?= $currMethod === $key ? 'selected' : '' ?>">
                                            <input type="radio" name="paymentMethod" value="<?= $e($key) ?>" <?= $currMethod === $key ? 'checked' : '' ?> onchange="selectPaymentMethod(this)">
                                            <div class="pradio-icon"><?= $m['icon'] ?></div>
                                            <div class="pradio-content">
                                                <strong class="pradio-title"><?= $e($m['title']) ?></strong>
                                                <p class="pradio-desc"><?= $e($m['desc']) ?></p>
                                            </div>
                                            <span class="pradio-check">✓</span>
                                        </label>
                                    <?php endforeach; ?>
                                </div>
                            </div>

                            <!-- THẺ 4: GHI CHÚ ĐƠN HÀNG -->
                            <div class="form-section-card">
                                <div class="fsec-header">
                                    <span class="fsec-num">4</span>
                                    <h3>Ghi Chú Đơn Hàng (Tùy chọn)</h3>
                                </div>
                                <div class="form-field">
                                    <textarea name="notes" rows="2" maxlength="400" placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao, đóng gói cẩn thận..."><?= $e($purchase['input']['notes'] ?? '') ?></textarea>
                                </div>
                            </div>

                            <!-- MÃ VOUCHER ĐI KÈM FORM -->
                            <input type="hidden" name="voucherCode" id="hidden-voucher-input" value="<?= $e($defaultVoucher) ?>">
                            <input type="hidden" name="action" value="quote" id="checkout-action-field">
                        </form>
                    </div>
                <?php endif; ?>
            </div>

            <!-- CỘT PHẢI: BẢNG TÓM TẮT ĐƠN HÀNG (STICKY SUMMARY) -->
            <div class="cart-col-right">
                <div class="order-summary-card">
                    <h3 class="summary-title">Tóm Tắt Đơn Hàng</h3>

                    <!-- KHUNG VOUCHER TRỰC TIẾP -->
                    <div class="summary-voucher-section">
                        <label for="summary-voucher-input" class="sv-label">Mã Giảm Giá &amp; Freeship</label>
                        <div class="sv-input-group">
                            <input type="text" id="summary-voucher-input" value="<?= $e($defaultVoucher) ?>" placeholder="Nhập mã ưu đãi..." maxlength="40">
                            <button type="button" class="btn-apply-coupon" onclick="applyCouponCode()">Áp Dụng</button>
                        </div>

                        <?php if (!empty($vouchers)): ?>
                            <div class="sv-quick-chips">
                                <span class="sv-chips-title">Gợi ý mã hot:</span>
                                <div class="sv-chips-list">
                                    <?php foreach (array_slice($vouchers, 0, 8) as $cv): 
                                        $isShip = $cv['kind'] === 'shipping' || stripos($cv['code'], 'SHIP') !== false;
                                    ?>
                                        <button type="button" class="sv-mini-chip <?= $isShip ? 'freeship-chip' : '' ?>" onclick="pickVoucherChip('<?= $e($cv['code']) ?>')" title="Áp dụng mã <?= $e($cv['code']) ?>">
                                            <?= $isShip ? '🚚 ' : '🏷️ ' ?><?= $e($cv['code']) ?>
                                        </button>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>

                    <!-- BẢNG TÍNH TIỀN CHI TIẾT -->
                    <div class="summary-price-lines">
                        <div class="s-line">
                            <span class="s-label">Tạm tính tiền sách:</span>
                            <strong class="s-value"><?= $money($subtotal) ?></strong>
                        </div>

                        <div class="s-line">
                            <span class="s-label">Phí vận chuyển:</span>
                            <?php if ($estShipping === 0): ?>
                                <strong class="s-value freeship-tag">Miễn phí (Freeship)</strong>
                            <?php else: ?>
                                <strong class="s-value"><?= $money($estShipping) ?></strong>
                            <?php endif; ?>
                        </div>

                        <?php if ($purchase): 
                            $quote = $purchase['quote'];
                        ?>
                            <?php if ($quote['discount'] > 0): ?>
                                <div class="s-line discount-line">
                                    <span class="s-label">Giảm giá voucher:</span>
                                    <strong class="s-value discount-amount">-<?= $money($quote['discount']) ?></strong>
                                </div>
                            <?php endif; ?>
                        <?php endif; ?>

                        <div class="s-line points-line">
                            <span class="s-label">Tích lũy Sách Xu:</span>
                            <span class="s-value points-val">+<?= number_format(floor($subtotal / 5000)) ?> Xu 🪙</span>
                        </div>

                        <hr class="summary-divider">

                        <div class="s-line grand-total-line">
                            <span class="s-label">Tổng thanh toán:</span>
                            <strong class="s-value grand-total-price">
                                <?= $money($purchase ? $purchase['quote']['total'] : ($subtotal + $estShipping)) ?>
                            </strong>
                        </div>
                        <small class="vat-note">(Đã bao gồm VAT và ưu đãi giao hàng)</small>
                    </div>

                    <!-- NÚT HÀNH ĐỘNG CHÍNH -->
                    <div class="summary-actions">
                        <?php if (!$checkout): ?>
                            <a href="/checkout" class="btn-checkout-primary">
                                Tiến Hành Đặt Hàng &rarr;
                            </a>
                        <?php else: ?>
                            <?php if ($purchase): ?>
                                <form action="/checkout" method="post" class="place-order-form">
                                    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                                    <input type="hidden" name="key" value="<?= $e($purchase['key']) ?>">
                                    <button type="submit" name="action" value="place" class="btn-checkout-primary btn-place-order">
                                        Xác Nhận Đặt Hàng Ngay &rarr;
                                    </button>
                                </form>
                            <?php else: ?>
                                <button type="button" onclick="submitCheckoutQuote()" class="btn-checkout-primary">
                                    Kiểm Tra Tổng Tiền &amp; Đặt Hàng &rarr;
                                </button>
                            <?php endif; ?>
                        <?php endif; ?>
                    </div>

                    <!-- 3 CAM KẾT UY TÍN -->
                    <div class="trust-perks-box">
                        <div class="perk-row">
                            <span class="p-icon">🚚</span>
                            <div class="p-text"><strong>Giao Hàng Nhanh Toàn Quốc</strong><span>Nhận sách từ 1 - 3 ngày</span></div>
                        </div>
                        <div class="perk-row">
                            <span class="p-icon">🛡️</span>
                            <div class="p-text"><strong>100% Sách Thật Chính Hãng</strong><span>Bảo hành in ấn trực tiếp từ NXB</span></div>
                        </div>
                        <div class="perk-row">
                            <span class="p-icon">🔄</span>
                            <div class="p-text"><strong>Đổi Trả Miễn Phí Trong 7 Ngày</strong><span>Nếu phát hiện lỗi đóng gói hoặc in ấn</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    <?php endif; ?>
</div>

<script>
function stepCartQty(btn, delta) {
    const form = btn.closest('.qty-stepper-form');
    if (!form) return;
    const input = form.querySelector('.qty-input');
    if (!input) return;

    let val = parseInt(input.value) || 1;
    let max = parseInt(input.max) || 99;

    let newVal = val + delta;
    if (newVal < 1) {
        if (confirm('Bạn có chắc muốn xóa cuốn sách này khỏi giỏ hàng?')) {
            const row = form.closest('.cart-row-item');
            if (row) {
                const removeForm = row.querySelector('.remove-form');
                if (removeForm) removeForm.submit();
            }
        }
        return;
    }
    if (newVal > max) {
        alert('Số lượng tối đa còn trong kho là ' + max + ' cuốn.');
        return;
    }
    input.value = newVal;
    form.submit();
}

function pickVoucherChip(code) {
    const input = document.getElementById('summary-voucher-input');
    if (input) {
        input.value = code;
        applyCouponCode();
    }
}

function applyCouponCode() {
    const input = document.getElementById('summary-voucher-input');
    const code = input ? input.value.trim().toUpperCase() : '';
    if (!code) {
        alert('Vui lòng nhập mã giảm giá.');
        return;
    }
    const hiddenInput = document.getElementById('hidden-voucher-input');
    const checkoutForm = document.getElementById('checkout-main-form');
    if (hiddenInput && checkoutForm) {
        hiddenInput.value = code;
        checkoutForm.submit();
    } else {
        window.location.href = '/checkout?voucher=' + encodeURIComponent(code);
    }
}

function selectPaymentMethod(radio) {
    document.querySelectorAll('.payment-radio-card').forEach(c => c.classList.remove('selected'));
    radio.closest('.payment-radio-card').classList.add('selected');
}

function submitCheckoutQuote() {
    const form = document.getElementById('checkout-main-form');
    if (form) {
        if (!form.reportValidity()) return;
        form.submit();
    }
}
</script>
