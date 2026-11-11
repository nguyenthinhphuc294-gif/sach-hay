<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$path = $argv[1] ?? dirname(__DIR__) . '/.sachhay-admin.hash';
$password = rtrim((string) fgets(STDIN), "\r\n");
if (strlen($password) < 10 || strlen($password) > 72) {
    fwrite(STDERR, "Mật khẩu cần từ 10 đến 72 byte.\n");
    exit(1);
}

umask(0077);
$temporary = tempnam(dirname($path), '.sachhay-');
if ($temporary === false) {
    fwrite(STDERR, "Không tạo được tệp mật khẩu.\n");
    exit(1);
}

try {
    $hash = password_hash($password, PASSWORD_BCRYPT);
    if (!chmod($temporary, 0600) || file_put_contents($temporary, $hash . "\n") === false
        || !rename($temporary, $path)) {
        throw new RuntimeException('Không lưu được mật khẩu quản trị.');
    }
} finally {
    if (is_file($temporary)) {
        unlink($temporary);
    }
}

echo "Đã lưu bản băm mật khẩu cho tài khoản admin.\n";
