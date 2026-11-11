<p class="crumb"><a href="/">Trang chủ</a> / <a href="/books">Sách</a> / <?= $e($book['title']) ?></p>
<article class="panel book-detail">
    <a href="<?= $e($book['cover_path']) ?>" aria-label="Xem bìa sách lớn">
        <img src="<?= $e($book['cover_path']) ?>" alt="Bìa <?= $e($book['title']) ?>">
    </a>
    <div>
        <h1><?= $e($book['title']) ?></h1>
        <dl>
            <?php foreach (['author'=>'Tác giả','publisher'=>'Nhà xuất bản','isbn'=>'ISBN','categoryName'=>'Danh mục'] as $key=>$label): ?>
                <?php if (!empty($details[$key])): ?><dt><?= $e($label) ?></dt><dd><?= $e($details[$key]) ?></dd><?php endif; ?>
            <?php endforeach; ?>
        </dl>
        <p class="price large"><?= $money($book['price']) ?></p>
        <p><?= $book['stock'] > 0 ? 'Còn ' . $book['stock'] . ' cuốn' : 'Hết hàng' ?></p>
        <?php if ($book['stock'] > 0): ?>
            <form action="/cart" method="post" class="inline">
                <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                <input type="hidden" name="action" value="add">
                <input type="hidden" name="book" value="<?= $e($book['id']) ?>">
                <label>Số lượng <input type="number" name="quantity" min="1" max="<?= min(99, $book['stock']) ?>" value="1" required></label>
                <button>Thêm vào giỏ</button>
            </form>
        <?php endif; ?>
        <?php if (!empty($details['description'])): ?><h2>Giới thiệu sách</h2><p><?= nl2br($e($details['description'])) ?></p><?php endif; ?>
    </div>
</article>
