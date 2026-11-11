<?php
$browseUrl = static fn(array $params = []): string => '/books' . ($params ? '?' . http_build_query($params) : '');
?>
<?php if ($home): ?>
    <?php require __DIR__ . '/home.php'; ?>
<?php else: ?>
    <p class="crumb"><a href="/">Trang chủ</a> / <a href="/books">Tất cả sách</a><?= $category ? ' / ' . $e($category) : '' ?></p>
    <div class="catalog-layout">
        <aside class="panel catalog-sidebar">
            <h2>Danh mục sản phẩm</h2>
            <a href="<?= $e($browseUrl(['q'=>$q,'sort'=>$sort])) ?>"<?= !$category ? ' aria-current="page"' : '' ?>>Tất cả sách</a>
            <?php foreach ($categories as $label): ?>
                <a href="<?= $e($browseUrl(['q'=>$q,'sort'=>$sort,'category'=>$label])) ?>"<?= $category === $label ? ' aria-current="page"' : '' ?>><?= $e($label) ?></a>
            <?php endforeach; ?>
        </aside>
        <section class="panel">
            <div class="section-head">
                <h1><?= $e($q ? 'Kết quả tìm kiếm' : ($category ?: ($sort === 'sale' ? 'Sách khuyến mãi' : 'Tất cả sách'))) ?></h1>
                <form action="/books" class="filters">
                    <input type="hidden" name="q" value="<?= $e($q) ?>">
                    <input type="hidden" name="category" value="<?= $e($category) ?>">
                    <select name="sort" aria-label="Sắp xếp">
                        <?php foreach ([''=>'Mới cập nhật','popular'=>'Bán chạy','price'=>'Giá tăng dần','price-desc'=>'Giá giảm dần','title'=>'Tên A–Z','sale'=>'Đang giảm giá'] as $key=>$label): ?>
                            <option value="<?= $e($key) ?>"<?= $sort === $key ? ' selected' : '' ?>><?= $e($label) ?></option>
                        <?php endforeach; ?>
                    </select>
                    <button class="secondary">Áp dụng</button>
                </form>
            </div>
            <?php if (!$books): ?><p>Chưa tìm thấy sách phù hợp.</p><?php endif; ?>
            <div class="book-grid"><?php foreach ($books as $book) require __DIR__ . '/book-card.php'; ?></div>
            <?php if ($pages > 1): ?><nav class="pagination" aria-label="Phân trang">
                <?php for ($number = max(1, $page - 2); $number <= min($pages, $page + 2); $number++): ?>
                    <a href="<?= $e($browseUrl(['q'=>$q,'category'=>$category,'sort'=>$sort,'page'=>$number])) ?>"<?= $page === $number ? ' aria-current="page"' : '' ?>><?= $number ?></a>
                <?php endfor; ?>
            </nav><?php endif; ?>
        </section>
    </div>
<?php endif; ?>
