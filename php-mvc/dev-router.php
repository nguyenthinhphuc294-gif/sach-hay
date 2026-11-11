<?php
declare(strict_types=1);

$publicDir = __DIR__ . '/../server/public';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

if ($path !== '/' && $path !== '/index.php') {
    $target = $publicDir . rawurldecode($path);
    if (is_file($target)) {
        return false;
    }
}

require __DIR__ . '/index.php';
