<form action="/admin" method="post" enctype="multipart/form-data" class="form-grid">
    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
    <input type="hidden" name="id" value="<?= $e($product['id'] ?? '') ?>">
    <?php if ($product): ?><input type="hidden" name="expectedStock" value="<?= $product['stock'] ?>"><?php endif; ?>
    <?php foreach (['title'=>'Tên sách','author'=>'Tác giả','publisher'=>'Nhà xuất bản','isbn'=>'ISBN','categoryName'=>'Danh mục'] as $key=>$label): ?>
        <label><?= $e($label) ?><input name="<?= $e($key) ?>" required maxlength="<?= $key === 'isbn' ? 40 : 160 ?>" value="<?= $e($product[$key] ?? '') ?>"></label>
    <?php endforeach; ?>
    <?php foreach (['price'=>'Giá bán','originalPrice'=>'Giá gốc','stock'=>'Tồn kho'] as $key=>$label): ?>
        <label><?= $e($label) ?><input name="<?= $e($key) ?>" type="number" min="0" required value="<?= $e($product[$key] ?? '') ?>"></label>
    <?php endforeach; ?>
    <label>Ảnh bìa<input type="file" name="cover" accept="image/jpeg,image/png,image/webp" <?= $product ? '' : 'required' ?>></label>
    <label>Mô tả<textarea name="description" maxlength="6000"><?= $e($product['description'] ?? '') ?></textarea></label>
    <div><button name="action" value="save">Lưu sách</button></div>
</form>
