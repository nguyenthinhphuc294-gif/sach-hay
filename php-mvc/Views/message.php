<section class="panel narrow"><h1><?= $e($message) ?></h1><a class="button" href="<?= $e(str_starts_with($back, '/') && !str_starts_with($back, '//') ? $back : '/') ?>">Quay lại</a></section>
