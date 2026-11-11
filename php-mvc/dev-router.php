<?php
declare(strict_types=1);

$documentRoot = realpath(__DIR__ . '/../server/public');
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$file = realpath($documentRoot . rawurldecode($path));
if ($path !== '/index.php' && $file !== false && str_starts_with($file, $documentRoot . DIRECTORY_SEPARATOR) && is_file($file)) {
    return false;
}
require __DIR__ . '/index.php';
