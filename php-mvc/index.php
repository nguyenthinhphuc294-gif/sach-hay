<?php
declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
header('X-Content-Type-Options: nosniff');

if (!str_starts_with($path, '/api/')) {
    if (!in_array($method, ['GET','HEAD'], true)) {
        http_response_code(405);
        exit;
    }
    require __DIR__ . '/Views/store.php';
    return;
}

header('Cache-Control: no-store');
require __DIR__ . '/Http.php';
foreach (['Models/Database','Models/Accounts','Models/Catalog','Models/Orders','Controllers/StoreController'] as $file) {
    require __DIR__ . '/' . $file . '.php';
}

try {
    $controller = new StoreController(new Database());
    if ($path === '/api/catalog/books') $controller->catalog($method, null, false);
    if (preg_match('~^/api/catalog/books/(book-[a-f0-9-]{32,36})/cover$~D', $path, $match))
        $controller->catalog($method, $match[1], false);
    if (preg_match('~^/api/admin-session\.php/books(?:/(book-[a-f0-9-]{32,36}))?$~D', $path, $match))
        $controller->catalog($method, $match[1] ?? null, true);
    if (str_starts_with($path, '/api/checkout/')) $controller->checkout($method, substr($path, strlen('/api/checkout')));
    if ($method === 'POST') {
        match ($path) {
            '/api/contact' => $controller->contact(),
            '/api/bookbot' => $controller->bookbot(),
            '/api/payment/sepay-webhook' => $controller->webhook(),
            default => throw new ApiError(404, 'NOT_FOUND', 'API không tồn tại.'),
        };
    }
    throw new ApiError(404, 'NOT_FOUND', 'API không tồn tại.');
} catch (ApiError $error) {
    Http::json(['code'=>$error->errorCode,'message'=>$error->getMessage()], $error->status);
} catch (Throwable $error) {
    error_log('Sách Hay API: ' . get_class($error) . ' (' . $error->getCode() . ') at ' . basename($error->getFile()) . ':' . $error->getLine());
    Http::json(['code'=>'SERVER_ERROR','message'=>'Hệ thống chưa xử lý được yêu cầu. Vui lòng thử lại.'], 500);
}
