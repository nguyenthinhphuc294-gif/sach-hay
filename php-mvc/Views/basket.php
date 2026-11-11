<?php
// Tính toán số liệu giỏ hàng
$subtotal = 0;
$totalItems = 0;
$selectedSubtotal = 0;
$selectedItemsCount = 0;
$selectedTitlesCount = 0;

foreach ($lines as $line) {
    if (!empty($line['book'])) {
        $qty = (int) $line['quantity'];
        $price = (int) $line['book']['price'];
        $subtotal += $price * $qty;
        $totalItems += $qty;
        $isSelected = !isset($line['selected']) || $line['selected'];
        if ($isSelected) {
            $selectedSubtotal += $price * $qty;
            $selectedItemsCount += $qty;
            $selectedTitlesCount++;
        }
    }
}

// Với /checkout thì $lines đã được filter theo selected items, với /cart thì dùng số liệu của các sản phẩm được tích chọn
$activeSubtotal = $checkout ? $subtotal : $selectedSubtotal;
$activeCount = $checkout ? $totalItems : $selectedItemsCount;

$freeshipThreshold = 250000;
$freeshipRemaining = max(0, $freeshipThreshold - $activeSubtotal);
$freeshipPercent = min(100, round(($activeSubtotal / $freeshipThreshold) * 100));
$estShipping = ($activeSubtotal >= $freeshipThreshold || (!empty($purchase['input']['paymentMethod']) && $purchase['input']['paymentMethod'] === 'STORE_PICKUP') || $activeCount === 0) ? 0 : 25000;

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
            <span class="step-text">Giỏ Hàng (<span id="step-bar-count"><?= $totalItems ?></span> sản phẩm)</span>
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
                        Mua thêm <strong id="freeship-remaining-text"><?= $money($freeshipRemaining) ?></strong> để được <strong>MIỄN PHÍ GIAO HÀNG</strong> toàn quốc!
                    </span>
                    <a href="/books" class="freeship-add-btn" id="freeship-add-btn">+ Chọn thêm sách</a>
                <?php else: ?>
                    <span class="freeship-icon success">🎉</span>
                    <span class="freeship-text success">
                        Chúc mừng! Đơn hàng của bạn đã đạt điều kiện <strong>MIỄN PHÍ GIAO HÀNG TOÀN QUỐC</strong> (Freeship 250k)!
                    </span>
                <?php endif; ?>
            </div>
            <div class="freeship-progress-track">
                <div class="freeship-progress-fill" id="freeship-progress-fill" style="width: <?= $freeshipPercent ?>%;"></div>
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
                            <!-- Nút tích chọn tất cả ở header -->
                            <div class="col-head-check">
                                <label class="custom-cart-checkbox" title="Chọn / Bỏ chọn tất cả">
                                    <input type="checkbox" id="select-all-checkbox" <?= ($selectedTitlesCount === count($lines) && count($lines) > 0) ? 'checked' : '' ?> onchange="toggleSelectAllCart(this)">
                                    <span class="checkbox-box"></span>
                                </label>
                            </div>
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
                                $isLineSelected = !isset($line['selected']) || $line['selected'];
                            ?>
                                <div class="cart-row-item <?= !$isLineSelected ? 'unselected' : '' ?>" 
                                     data-book-id="<?= $e($line['bookId']) ?>"
                                     data-price="<?= $book ? (int)$book['price'] : 0 ?>"
                                     data-qty="<?= (int)$line['quantity'] ?>">
                                    <!-- Nút checkbox tích chọn ở ngoài cùng bên trái sản phẩm -->
                                    <div class="item-check-cell">
                                        <label class="custom-cart-checkbox" title="Tích chọn để thanh toán sản phẩm này">
                                            <input type="checkbox" 
                                                   name="selected_books[]" 
                                                   value="<?= $e($line['bookId']) ?>" 
                                                   class="cart-item-checkbox" 
                                                   <?= $isLineSelected ? 'checked' : '' ?> 
                                                   onchange="onItemCheckChange(this)">
                                            <span class="checkbox-box"></span>
                                        </label>
                                    </div>

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
                                                <input type="number" name="quantity" min="1" max="<?= min(99, $book['stock'] ?? 99) ?>" value="<?= $line['quantity'] ?>" class="qty-input" onchange="stepCartQty(this, 0)">
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
                            <span class="cart-total-badge" style="margin-left: auto;"><?= $totalItems ?> cuốn sách trong giỏ</span>
                        </div>
                    </div>

                <?php else: ?>
                    <!-- KHI Ở BƯỚC /checkout: FORM THÔNG TIN GIAO HÀNG & PHƯƠNG THỨC THANH TOÁN -->
                    <div class="checkout-forms-panel">
                        <?php if (!empty($purchase['key']) && !empty($purchase['quote']) && !empty($purchase['input'])): $quote = $purchase['quote']; ?>
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

                    <?php if ($checkout && !empty($lines)): ?>
                        <!-- XEM TRƯỚC CÁC SẢN PHẨM ĐÃ CHỌN ĐỂ THANH TOÁN TẠI /CHECKOUT -->
                        <div class="checkout-selected-items-box">
                            <div class="cs-head">
                                <span class="cs-title">Sách thanh toán (<?= count($lines) ?> tựa)</span>
                                <a href="/cart" class="cs-edit-link">Thay đổi</a>
                            </div>
                            <div class="cs-list">
                                <?php foreach ($lines as $item): 
                                    $b = $item['book'];
                                    if (!$b) continue;
                                ?>
                                    <div class="cs-item">
                                        <img src="<?= $e($b['cover_path']) ?>" alt="" class="cs-thumb">
                                        <div class="cs-info">
                                            <div class="cs-book-title" title="<?= $e($b['title']) ?>"><?= $e($b['title']) ?></div>
                                            <div class="cs-book-meta"><?= $item['quantity'] ?> × <?= $money($b['price']) ?></div>
                                        </div>
                                        <div class="cs-line-total"><?= $money($b['price'] * $item['quantity']) ?></div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>

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
                            <strong class="s-value s-value-subtotal"><?= $money($activeSubtotal) ?></strong>
                        </div>

                        <div class="s-line">
                            <span class="s-label">Phí vận chuyển:</span>
                            <span class="s-shipping-wrap">
                                <?php if ($estShipping === 0): ?>
                                    <strong class="s-value freeship-tag">Miễn phí (Freeship)</strong>
                                <?php else: ?>
                                    <strong class="s-value s-value-shipping"><?= $money($estShipping) ?></strong>
                                <?php endif; ?>
                            </span>
                        </div>

                        <?php if (!empty($purchase['key']) && !empty($purchase['quote']) && !empty($purchase['input'])): $quote = $purchase['quote']; ?>
                            <?php if ($quote['discount'] > 0): ?>
                                <div class="s-line discount-line">
                                    <span class="s-label">Giảm giá voucher:</span>
                                    <strong class="s-value discount-amount">-<?= $money($quote['discount']) ?></strong>
                                </div>
                            <?php endif; ?>
                        <?php endif; ?>

                        <div class="s-line points-line">
                            <span class="s-label">Tích lũy Sách Xu:</span>
                            <span class="s-value points-val">+<?= number_format(floor($activeSubtotal / 5000)) ?> Xu 🪙</span>
                        </div>

                        <hr class="summary-divider">

                        <div class="s-line grand-total-line">
                            <span class="s-label">Tổng thanh toán:</span>
                            <strong class="s-value grand-total-price">
                                <?= $money(($checkout && !empty($purchase['quote']['total'])) ? $purchase['quote']['total'] : ($activeSubtotal + $estShipping)) ?>
                            </strong>
                        </div>
                        <small class="vat-note">(Đã bao gồm VAT và ưu đãi giao hàng)</small>
                    </div>

                    <!-- NÚT HÀNH ĐỘNG CHÍNH -->
                    <div class="summary-actions">
                        <?php if (!$checkout): ?>
                            <button type="button" id="btn-proceed-checkout" onclick="proceedToCheckout()" class="btn-checkout-primary <?= $activeCount === 0 ? 'disabled' : '' ?>">
                                Tiến Hành Đặt Hàng (<span id="selected-items-count"><?= $activeCount ?></span>) &rarr;
                            </button>
                        <?php else: ?>
                            <?php if (!empty($purchase['key']) && !empty($purchase['quote'])): ?>
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
function formatVND(num) {
    return new Intl.NumberFormat('vi-VN').format(Math.max(0, Math.round(num))) + ' ₫';
}

function onItemCheckChange(cb) {
    const row = cb.closest('.cart-row-item');
    if (row) {
        if (cb.checked) {
            row.classList.remove('unselected');
        } else {
            row.classList.add('unselected');
        }
    }
    recalcCartTotals();
    syncSelectedState();
}

function toggleSelectAllCart(masterCb) {
    const isChecked = masterCb.checked;
    const checkboxes = document.querySelectorAll('.cart-item-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        const row = cb.closest('.cart-row-item');
        if (row) {
            if (isChecked) {
                row.classList.remove('unselected');
            } else {
                row.classList.add('unselected');
            }
        }
    });
    recalcCartTotals();
    syncSelectedState();
}

function recalcCartTotals() {
    const checkboxes = document.querySelectorAll('.cart-item-checkbox');
    const master = document.getElementById('select-all-checkbox');
    
    let checkedCount = 0;
    let selectedSubtotal = 0;
    let selectedUnits = 0;
    
    checkboxes.forEach(cb => {
        if (cb.checked) {
            checkedCount++;
            const row = cb.closest('.cart-row-item');
            if (row) {
                const price = parseInt(row.getAttribute('data-price')) || 0;
                const qty = parseInt(row.getAttribute('data-qty')) || 1;
                selectedSubtotal += price * qty;
                selectedUnits += qty;
            }
        }
    });

    // Cập nhật trạng thái checkbox tổng (Chọn tất cả)
    if (master) {
        if (checkboxes.length > 0 && checkedCount === checkboxes.length) {
            master.checked = true;
            master.indeterminate = false;
        } else if (checkedCount > 0) {
            master.checked = false;
            master.indeterminate = true;
        } else {
            master.checked = false;
            master.indeterminate = false;
        }
    }

    // Cập nhật số lượng sản phẩm được chọn trên nút đặt hàng
    const selCountEl = document.getElementById('selected-items-count');
    if (selCountEl) {
        selCountEl.textContent = selectedUnits;
    }

    // Khóa hoặc mở nút Tiến hành đặt hàng
    const btnProceed = document.getElementById('btn-proceed-checkout');
    if (btnProceed) {
        if (checkedCount === 0) {
            btnProceed.classList.add('disabled');
        } else {
            btnProceed.classList.remove('disabled');
        }
    }

    // Cập nhật Tạm tính tiền sách
    const subtotalEl = document.querySelector('.s-value-subtotal');
    if (subtotalEl) {
        subtotalEl.textContent = formatVND(selectedSubtotal);
    }

    // Tính toán phí vận chuyển (Freeship nếu >= 250k hoặc không chọn cuốn nào)
    const threshold = 250000;
    const estShipping = (selectedSubtotal >= threshold || selectedUnits === 0) ? 0 : 25000;
    const shipWrap = document.querySelector('.s-shipping-wrap');
    if (shipWrap) {
        if (estShipping === 0) {
            shipWrap.innerHTML = '<strong class="s-value freeship-tag">Miễn phí (Freeship)</strong>';
        } else {
            shipWrap.innerHTML = '<strong class="s-value s-value-shipping">' + formatVND(estShipping) + '</strong>';
        }
    }

    // Cập nhật tổng thanh toán
    const grandTotalEl = document.querySelector('.grand-total-price');
    if (grandTotalEl) {
        grandTotalEl.textContent = formatVND(selectedSubtotal + estShipping);
    }

    // Cập nhật điểm tích lũy Sách Xu
    const pointsEl = document.querySelector('.points-val');
    if (pointsEl) {
        const pts = Math.floor(selectedSubtotal / 5000);
        pointsEl.textContent = '+' + new Intl.NumberFormat('vi-VN').format(pts) + ' Xu 🪙';
    }

    // Cập nhật thanh tiến độ Freeship
    const progressCard = document.querySelector('.freeship-progress-card');
    if (progressCard) {
        const remaining = Math.max(0, threshold - selectedSubtotal);
        const percent = Math.min(100, Math.round((selectedSubtotal / threshold) * 100));
        const fillEl = document.getElementById('freeship-progress-fill');
        if (fillEl) {
            fillEl.style.width = percent + '%';
        }
        const textEl = document.querySelector('.freeship-text');
        const iconEl = document.querySelector('.freeship-icon');
        const headerEl = document.querySelector('.freeship-progress-header');
        let addBtn = document.getElementById('freeship-add-btn');
        if (textEl && iconEl) {
            if (remaining > 0) {
                iconEl.className = 'freeship-icon';
                iconEl.textContent = '🚚';
                textEl.className = 'freeship-text';
                textEl.innerHTML = 'Mua thêm <strong id="freeship-remaining-text">' + formatVND(remaining) + '</strong> để được <strong>MIỄN PHÍ GIAO HÀNG</strong> toàn quốc!';
                if (!addBtn && headerEl) {
                    addBtn = document.createElement('a');
                    addBtn.href = '/books';
                    addBtn.className = 'freeship-add-btn';
                    addBtn.id = 'freeship-add-btn';
                    addBtn.textContent = '+ Chọn thêm sách';
                    headerEl.appendChild(addBtn);
                }
            } else {
                iconEl.className = 'freeship-icon success';
                iconEl.textContent = '🎉';
                textEl.className = 'freeship-text success';
                textEl.innerHTML = 'Chúc mừng! Đơn hàng của bạn đã đạt điều kiện <strong>MIỄN PHÍ GIAO HÀNG TOÀN QUỐC</strong> (Freeship 250k)!';
                if (addBtn) addBtn.remove();
            }
        }
    }
}

let syncTimer = null;
function syncSelectedState() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
        const checked = Array.from(document.querySelectorAll('.cart-item-checkbox:checked')).map(cb => cb.value);
        fetch('/cart?selected=' + encodeURIComponent(checked.join(',')), {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        }).catch(() => {});
    }, 250);
}

function proceedToCheckout() {
    const checked = Array.from(document.querySelectorAll('.cart-item-checkbox:checked')).map(cb => cb.value);
    if (checked.length === 0) {
        alert('Vui lòng tích chọn ít nhất 1 sản phẩm để tiến hành đặt hàng.');
        return;
    }
    window.location.href = '/checkout?selected=' + encodeURIComponent(checked.join(','));
}

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

    // Giữ nguyên các sản phẩm đang được tích chọn khi submit form cập nhật số lượng
    const checked = Array.from(document.querySelectorAll('.cart-item-checkbox:checked')).map(cb => cb.value);
    let selInput = form.querySelector('input[name="selected"]');
    if (!selInput) {
        selInput = document.createElement('input');
        selInput.type = 'hidden';
        selInput.name = 'selected';
        form.appendChild(selInput);
    }
    selInput.value = checked.join(',');

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
        const checked = Array.from(document.querySelectorAll('.cart-item-checkbox:checked')).map(cb => cb.value);
        let url = '/cart?voucher=' + encodeURIComponent(code);
        if (checked.length > 0) {
            url += '&selected=' + encodeURIComponent(checked.join(','));
        }
        window.location.href = url;
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

// Khởi tạo trạng thái indeterminate của nút Chọn tất cả khi tải trang
document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.cart-item-checkbox');
    if (checkboxes.length > 0) {
        recalcCartTotals();
    }
});
</script>
