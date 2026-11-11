<div class="section-head"><h1>Quản trị Sách Hay</h1><button type="button" class="secondary" data-admin-logout>Đăng xuất</button></div>
<p role="alert" data-auth-message hidden></p>
<div class="stats">
    <div class="panel"><span>Tổng đơn hàng</span><strong><?= $stats['total'] ?></strong></div>
    <div class="panel"><span>Chờ xác nhận</span><strong><?= $stats['pending'] ?? 0 ?></strong></div>
    <div class="panel"><span>Doanh thu đơn hoàn thành</span><strong><?= $money($stats['revenue'] ?? 0) ?></strong></div>
</div>
<section class="panel">
    <h2>Quản lý sách</h2>
    <details class="order"><summary>Thêm sách mới</summary><?php $product = []; require __DIR__ . '/product-form.php'; ?></details>
    <?php foreach ($books as $product): ?>
        <details class="order">
            <summary><?= $e($product['title']) ?> · <?= $money($product['price']) ?> · Còn <?= $product['stock'] ?></summary>
            <?php require __DIR__ . '/product-form.php'; ?>
            <form action="/admin" method="post">
                <input type="hidden" name="csrf" value="<?= $e($csrf) ?>"><input type="hidden" name="id" value="<?= $e($product['id']) ?>">
                <button class="secondary" name="action" value="remove">Ẩn sách</button>
            </form>
        </details>
    <?php endforeach; ?>
</section>
<section class="panel">
    <h2>Đơn hàng</h2>
    <?php if (!$orders): ?><p>Chưa có đơn hàng.</p><?php endif; ?>
    <?php foreach ($orders as $order): ?>
        <details class="order">
            <summary><?= $e($order['orderCode']) ?> · <?= $e($statusNames[$order['status']] ?? $order['status']) ?> · <?= $money($order['total']) ?></summary>
            <p><?= $e($order['customerName']) ?> · <?= $e($order['phone']) ?> · <?= $e($order['email']) ?></p>
            <p><?= $e(implode(', ', array_filter([$order['address'],$order['ward'],$order['district'],$order['province']]))) ?></p>
            <ul><?php foreach ($order['items'] as $item): ?><li><?= $e($item['title']) ?> × <?= $item['quantity'] ?></li><?php endforeach; ?></ul>
            <?php $options = ['pending'=>['confirmed','cancelled'],'confirmed'=>['processing','cancelled'],'processing'=>['shipping','cancelled'],'shipping'=>['completed']][$order['status']] ?? []; ?>
            <?php if ($options): ?>
                <form method="post" action="/admin" class="inline">
                    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>"><input type="hidden" name="id" value="<?= $e($order['id']) ?>">
                    <select name="status" aria-label="Trạng thái mới"><?php foreach ($options as $option): ?><option value="<?= $e($option) ?>"><?= $e($statusNames[$option]) ?></option><?php endforeach; ?></select>
                    <button name="action" value="order">Cập nhật đơn</button>
                </form>
            <?php endif; ?>
        </details>
    <?php endforeach; ?>
    <nav class="pagination" aria-label="Trang đơn hàng">
        <?php if ($page > 1): ?><a href="/admin?page=<?= $page - 1 ?>">Trang trước</a><?php endif; ?>
        <?php if ($hasNext): ?><a href="/admin?page=<?= $page + 1 ?>">Trang sau</a><?php endif; ?>
    </nav>
</section>
<section class="panel">
    <h2>Voucher</h2>
    <?php foreach ($vouchers as $voucher): ?>
        <p><strong><?= $e($voucher['code']) ?></strong> · Đã dùng <?= $voucher['used'] ?> / <?= $voucher['max_uses'] ?? 'Không giới hạn' ?> lượt</p>
    <?php endforeach; ?>
</section>
<section class="panel">
    <h2>Tin nhắn liên hệ gần đây</h2>
    <?php if (!$contacts): ?><p>Chưa có tin nhắn.</p><?php endif; ?>
    <?php foreach ($contacts as $contact): ?><details class="order">
        <summary><?= $e($contact['name']) ?> · <?= $e($contact['email']) ?></summary><p><?= nl2br($e($contact['message'])) ?></p>
    </details><?php endforeach; ?>
</section>
