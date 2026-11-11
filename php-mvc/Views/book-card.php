<?php
$details = Catalog::details($book);
$original = $details['originalPrice'] ?? 0;
$discount = $original > $book['price'] ? (int) round(100 * (1 - $book['price'] / $original)) : 0;
?>
<article class="book-card">
    <a href="/books/<?= $e($book['id']) ?>">
        <img src="<?= $e($book['cover_path']) ?>" alt="Bìa <?= $e($book['title']) ?>" loading="lazy">
        <h3><?= $e($book['title']) ?></h3>
    </a>
    <p class="muted"><?= $e($details['author'] ?? '') ?></p>
    <p class="price"><?= $money($book['price']) ?> <?php if ($discount): ?><span class="discount">-<?= $discount ?>%</span><?php endif; ?></p>
    <?php if ($discount): ?><del class="original-price"><?= $money($original) ?></del><?php endif; ?>
    <?php if ($book['stock']): ?>
        <form action="/cart" method="post">
            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
            <input type="hidden" name="action" value="add">
            <input type="hidden" name="book" value="<?= $e($book['id']) ?>">
            <input type="hidden" name="quantity" value="1">
            <button class="secondary">Thêm vào giỏ</button>
        </form>
    <?php else: ?><p class="muted">Hết hàng</p><?php endif; ?>
</article>
