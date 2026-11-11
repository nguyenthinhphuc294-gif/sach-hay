<?php
$saleTimezone = new DateTimeZone('Asia/Ho_Chi_Minh');
$saleWindow = new DateTimeImmutable('tomorrow', $saleTimezone);
$left = max(0, $saleWindow->getTimestamp() - time());
$clockParts = [intdiv($left, 3600), intdiv($left % 3600, 60), $left % 60];
?>
<section class="shelf flash-sale" aria-labelledby="flash-sale-title">
    <div class="flash-header">
        <div class="flash-heading">
            <div class="flash-title">
                <span class="flash-bolt"><?php $icon = 'bolt'; require __DIR__ . '/store-icon.php'; ?></span>
                <h2 id="flash-sale-title">Flash Sale <span>Giờ Vàng</span></h2>
            </div>
            <div class="flash-clock" data-flash-end="<?= $saleWindow->getTimestamp() ?>">
                <span class="flash-clock-label" title="Đếm ngược đến ngày mới theo giờ Việt Nam"><?php $icon = 'clock'; require __DIR__ . '/store-icon.php'; ?> Đổi ngày sau:</span>
                <?php foreach ($clockParts as $index=>$part): ?>
                    <?php if ($index): ?><span class="flash-separator" aria-hidden="true">:</span><?php endif; ?>
                    <span class="flash-digit" data-flash-digit><?= sprintf('%02d', $part) ?></span>
                <?php endforeach; ?>
            </div>
        </div>
        <a class="flash-view with-icon" href="<?= $e($browseUrl($shelf['params'])) ?>">Xem tất cả Flash Sale <?php $icon = 'right'; require __DIR__ . '/store-icon.php'; ?></a>
    </div>
    <div class="flash-products">
        <?php if (!$shelf['books']): ?><p>Chưa có sách trong chương trình này.</p><?php endif; ?>
        <div class="book-grid"><?php foreach ($shelf['books'] as $book) require __DIR__ . '/book-card.php'; ?></div>
    </div>
</section>
