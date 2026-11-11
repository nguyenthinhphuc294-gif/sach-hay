<?php
declare(strict_types=1);

// Vite renders the existing React storefront after the PHP page response.
$page = $documentRoot . '/storefront.html';
if (!is_readable($page)) {
    http_response_code(503);
    echo 'Vui lòng build giao diện Sách Hay trước khi mở website.';
    return;
}
header('Content-Type: text/html; charset=utf-8');
readfile($page);
