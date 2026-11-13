<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/php-mvc/Models/Database.php';

$db = new Database();
$email = 'khach.demo@example.com';
$password = 'SachHayDemo2026!';
$db->run('INSERT INTO customers (id, email, password_hash) VALUES (?, ?, ?) ON CONFLICT(email) DO NOTHING', [
    bin2hex(random_bytes(16)),
    $email,
    password_hash(hash('sha256', $password), PASSWORD_DEFAULT),
]);
$customer = $db->one('SELECT password_hash FROM customers WHERE email = ?', [$email]);
if (!password_verify(hash('sha256', $password), $customer['password_hash'])) {
    fwrite(STDERR, "Email demo đã tồn tại với mật khẩu khác. Hãy dùng SQLite mới cho buổi demo.\n");
    exit(1);
}

echo "Tài khoản khách demo đã sẵn sàng tại /account.\n";
