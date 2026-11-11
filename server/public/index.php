<?php
declare(strict_types=1);

$documentRoot = __DIR__;
$app = getenv('SACHHAY_MVC_DIR') ?: dirname(__DIR__) . '/sachhay-php-mvc';
if (!is_file($app . '/index.php')) {
    http_response_code(503);
    exit('Chưa cấu hình ứng dụng PHP MVC.');
}
require $app . '/index.php';
