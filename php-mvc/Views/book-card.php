<?php
$details = Catalog::details($book);
$original = $details['originalPrice'] ?? 0;
$discount = $original > $book['price'] ? (int) round(100 * (1 - $book['price'] / $original)) : 0;
?>
<article class="book-card">
    <a href="/books/<?= $e($book['id']) ?>">
        <?php if ($discount): ?><span class="discount">-<?= $discount ?>%</span><?php endif; ?>
        <img src="<?= $e($book['cover_path']) ?>" alt="Bìa <?= $e($book['title']) ?>" loading="lazy">
        <p class="muted book-byline"><?= $e(implode(' · ', array_filter([$details['categoryName'] ?? '',$details['author'] ?? '']))) ?></p>
        <h3><?= $e($book['title']) ?></h3>
    </a>
    <div class="book-prices">
        <span class="price"><?= $money($book['price']) ?></span>
        <?php if ($discount): ?><del class="original-price"><?= $money($original) ?></del><?php endif; ?>
    </div>
    <?php if (($shelf['style'] ?? '') === 'sale'): ?>
        <?php $sold = $book['sold_count']; $total = max(1, $sold + $book['stock']); ?>
        <div class="flash-progress"><span style="width: <?= (int) round(100 * $sold / $total) ?>%"></span><small>Đã bán <?= number_format($sold, 0, ',', '.') ?></small></div>
    <?php endif; ?>
    <?php if ($book['stock']): ?>
        <form action="/cart" method="post">
            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
            <input type="hidden" name="action" value="add">
            <input type="hidden" name="book" value="<?= $e($book['id']) ?>">
            <input type="hidden" name="quantity" value="1">
            <button class="secondary with-icon"><?php $icon = 'cart'; require __DIR__ . '/store-icon.php'; ?> Thêm vào giỏ</button>
        </form>
    <?php else: ?><p class="muted">Hết hàng</p><?php endif; ?>
</article>
