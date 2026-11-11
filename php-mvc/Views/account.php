<h1>Tài khoản và đơn hàng</h1>
<?php if (!$email): ?>
    <section class="panel narrow">
        <h2>Đăng nhập hoặc đăng ký</h2>
        <form action="/account" method="post" class="stack">
            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
            <label>Email<input type="email" name="email" required maxlength="254" autocomplete="email"></label>
            <label>Mật khẩu<input type="password" name="password" required minlength="10" maxlength="128"></label>
            <div class="inline"><button name="action" value="login">Đăng nhập</button><button class="secondary" name="action" value="register">Đăng ký</button></div>
        </form>
    </section>
<?php else: ?>
    <form class="panel inline" action="/account" method="post">
        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
        <span><?= $e($email) ?></span><button class="secondary" name="action" value="logout">Đăng xuất</button>
    </form>
<?php endif; ?>
<section class="panel">
    <h2>Đơn hàng của bạn</h2>
    <?php if (!$orders): ?><p class="muted">Bạn chưa có đơn hàng trong phiên này.</p><?php endif; ?>
    <?php foreach ($orders as $record): $order = $record['order']; $payment = $record['payment'] ?? null; ?>
        <details class="order"<?= $record === $orders[0] ? ' open' : '' ?>>
            <summary><strong><?= $e($order['orderCode']) ?></strong> · <?= $e($statusNames[$order['status']] ?? $order['status']) ?> · <?= $money($order['total']) ?></summary>
            <ul><?php foreach ($order['items'] as $item): ?><li><?= $e($item['title']) ?> × <?= $item['quantity'] ?></li><?php endforeach; ?></ul>
            <?php if ($payment): ?>
                <?php if ($payment['status'] === 'pending'): ?>
                    <div class="payment" data-payment-url="/api/checkout/orders/<?= $e($order['orderCode']) ?>/payment" data-payment-token="<?= $e($payment['token']) ?>">
                        <img src="<?= $e($payment['qrUrl']) ?>" alt="Mã VietQR">
                        <p><?= $e($payment['bankName']) ?> · <?= $e($payment['accountNumber']) ?> · <?= $e($payment['accountName']) ?></p>
                        <p>Số tiền <?= $money($payment['amount']) ?>. Nội dung <?= $e($order['orderCode']) ?>.</p>
                        <p role="status">Đang chờ xác nhận thanh toán.</p>
                    </div>
                <?php elseif ($payment['status'] === 'paid'): ?><p class="notice">Đã thanh toán.</p><?php endif; ?>
            <?php endif; ?>
            <?php if ($order['status'] === 'pending' && ($payment['status'] ?? '') !== 'paid'): ?>
                <form action="/account" method="post">
                    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>"><input type="hidden" name="id" value="<?= $e($order['id']) ?>">
                    <button class="secondary" name="action" value="cancel">Hủy đơn</button>
                </form>
            <?php endif; ?>
        </details>
    <?php endforeach; ?>
</section>
