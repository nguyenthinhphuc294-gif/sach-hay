<h1><?= $e($title) ?></h1>
<section class="panel">
<?php if (!$lines): ?>
    <p>Giỏ hàng đang trống.</p><a class="button" href="/books">Tiếp tục mua sách</a>
<?php else: ?>
    <?php foreach ($lines as $line): ?>
        <div class="cart-line">
            <?php if ($line['book']): ?>
                <img src="<?= $e($line['book']['cover_path']) ?>" alt="" width="50" height="70" style="width: 50px; height: 70px; object-fit: contain; flex-shrink: 0; border-radius: 4px; background: #f8f8f8;">
                <div><a href="/books/<?= $e($line['bookId']) ?>"><?= $e($line['book']['title']) ?></a>
                <p class="price"><?= $money($line['book']['price'] * $line['quantity']) ?></p></div>
            <?php else: ?><p>Sách không còn bán</p><?php endif; ?>
            <form method="post" action="/cart" class="inline">
                <input type="hidden" name="csrf" value="<?= $e($csrf) ?>"><input type="hidden" name="book" value="<?= $e($line['bookId']) ?>">
                <label>Số lượng <input type="number" name="quantity" min="0" max="99" value="<?= $line['quantity'] ?>"></label>
                <button class="secondary">Cập nhật</button>
                <button class="link-button" name="action" value="remove" formnovalidate>Xóa</button>
            </form>
        </div>
    <?php endforeach; ?>
    <?php if (!$checkout): ?><a class="button" href="/checkout">Tiến hành thanh toán</a><?php endif; ?>
<?php endif; ?>
</section>
<?php if ($checkout && $lines): ?>
    <?php if ($purchase): $quote = $purchase['quote']; ?>
        <section class="panel">
            <h2>Xác nhận đơn hàng</h2>
            <p>Người nhận: <?= $e($purchase['input']['customerName']) ?> · <?= $e($purchase['input']['phone']) ?></p>
            <dl><dt>Tiền sách</dt><dd><?= $money($quote['subtotal']) ?></dd><dt>Phí giao hàng</dt><dd><?= $money($quote['shippingFee']) ?></dd>
                <dt>Giảm giá</dt><dd><?= $money($quote['discount']) ?></dd><dt>Tổng thanh toán</dt><dd class="price"><?= $money($quote['total']) ?></dd></dl>
            <form action="/checkout" method="post">
                <input type="hidden" name="csrf" value="<?= $e($csrf) ?>"><input type="hidden" name="key" value="<?= $e($purchase['key']) ?>">
                <button name="action" value="place">Đặt hàng</button>
            </form>
        </section>
    <?php endif; ?>
    <section class="panel">
        <h2>Thông tin nhận hàng</h2>
        <form action="/checkout" method="post" class="form-grid">
            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
            <label>Họ tên<input name="customerName" required maxlength="100" value="<?= $e($purchase['input']['customerName'] ?? '') ?>"></label>
            <label>Số điện thoại<input name="phone" type="tel" required pattern="0[0-9]{9}" value="<?= $e($purchase['input']['phone'] ?? '') ?>"></label>
            <label>Email<input name="email" type="email" required value="<?= $e($purchase['input']['email'] ?? $email) ?>"></label>
            <label>Tỉnh / thành<input name="province" maxlength="150" value="<?= $e($purchase['input']['province'] ?? '') ?>"></label>
            <label>Quận / huyện<input name="district" maxlength="150" value="<?= $e($purchase['input']['district'] ?? '') ?>"></label>
            <label>Phường / xã<input name="ward" maxlength="150" value="<?= $e($purchase['input']['ward'] ?? '') ?>"></label>
            <label>Địa chỉ<input name="address" maxlength="150" value="<?= $e($purchase['input']['address'] ?? '') ?>"></label>
            <label>Mã giảm giá<input name="voucherCode" id="checkout-voucher-input" maxlength="40" value="<?= $e($purchase['input']['voucherCode'] ?? '') ?>" placeholder="Nhập hoặc chọn mã giảm giá / freeship"></label>
            <?php if (!empty($vouchers)): ?>
                <div class="checkout-voucher-selector">
                    <div class="cv-header">
                        <span>🏷️ Gợi ý mã ưu đãi:</span>
                        <a href="/account#vouchers" class="cv-view-all">Xem tất cả <?= count($vouchers) ?> mã &rarr;</a>
                    </div>
                    <div class="cv-chips-scroll">
                        <?php foreach (array_slice($vouchers, 0, 12) as $cv): 
                            $isShip = $cv['kind'] === 'shipping' || stripos($cv['code'], 'SHIP') !== false;
                            $label = $isShip ? '🚚 ' . $cv['code'] . ' (Freeship)' : ($cv['kind'] === 'percentage' ? ('🏷️ ' . $cv['code'] . ' (-' . $cv['value'] . '%)') : ('💰 ' . $cv['code'] . ' (-' . number_format($cv['value'] / 1000) . 'k)'));
                        ?>
                            <button type="button" class="cv-chip <?= $isShip ? 'cv-chip-freeship' : '' ?>" onclick="applyCheckoutVoucher('<?= $e($cv['code']) ?>')" title="Nhấp để áp dụng <?= $e($cv['code']) ?>">
                                <?= $e($label) ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>
            <label>Thanh toán<select name="paymentMethod">
                <?php foreach (['COD'=>'Thanh toán khi nhận hàng','STORE_PICKUP'=>'Nhận tại cửa hàng','BANK_TRANSFER'=>'Chuyển khoản VietQR'] as $key=>$label): ?>
                    <?php if ($key !== 'BANK_TRANSFER' || $bankAvailable): ?><option value="<?= $e($key) ?>"<?= ($purchase['input']['paymentMethod'] ?? 'COD') === $key ? ' selected' : '' ?>><?= $e($label) ?></option><?php endif; ?>
                <?php endforeach; ?>
            </select></label>
            <label>Ghi chú<textarea name="notes" maxlength="400"><?= $e($purchase['input']['notes'] ?? '') ?></textarea></label>
            <div><button name="action" value="quote">Kiểm tra tổng tiền</button></div>
        </form>
    </section>
<?php endif; ?>
