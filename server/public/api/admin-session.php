<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $data): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function openAdminSession(bool $secure): void
{
    session_name('SachHayAdmin');
    if (!session_start([
        'use_strict_mode' => true,
        'use_only_cookies' => true,
        'cookie_httponly' => true,
        'cookie_secure' => $secure,
        'cookie_samesite' => 'Strict',
        'cookie_path' => '/',
        'gc_maxlifetime' => 28800,
    ])) {
        respond(503, ['error' => 'Không mở được phiên quản trị.']);
    }
}

// Keep the hash and throttle state outside the website's document root.
$projectRoot = dirname(__DIR__, 3);
$privateRoot = is_dir($projectRoot . '/php-mvc') ? $projectRoot : dirname(__DIR__, 2);
$hashFile = getenv('SACHHAY_ADMIN_HASH_FILE') ?: $privateRoot . '/.sachhay-admin.hash';
$hash = is_readable($hashFile) ? trim((string) file_get_contents($hashFile)) : '';
$method = $_SERVER['REQUEST_METHOD'];
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

if (!$secure && PHP_SAPI !== 'cli-server') {
    respond(403, ['error' => 'Đăng nhập quản trị yêu cầu HTTPS.']);
}

if ($method === 'GET') {
    if (!isset($_COOKIE['SachHayAdmin']) || $hash === '') {
        respond(200, ['authenticated' => false]);
    }
    openAdminSession($secure);
    $authenticated = ($_SESSION['admin_until'] ?? 0) > time()
        && hash_equals(hash('sha256', $hash), (string) ($_SESSION['admin_config'] ?? ''));
    respond(200, ['authenticated' => $authenticated, 'expiresAt' => $authenticated ? $_SESSION['admin_until'] : null]);
}

if ($method !== 'POST') {
    header('Allow: GET, POST');
    respond(405, ['error' => 'Phương thức không được hỗ trợ.']);
}
if (($_SERVER['HTTP_X_SACHHAY_REQUEST'] ?? '') !== '1'
    || !str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
    respond(403, ['error' => 'Yêu cầu không hợp lệ.']);
}

$input = json_decode((string) file_get_contents('php://input', false, null, 0, 4096), true);
if (!is_array($input)) {
    respond(400, ['error' => 'Dữ liệu đăng nhập không hợp lệ.']);
}

if (($input['action'] ?? '') === 'logout') {
    if (isset($_COOKIE['SachHayAdmin'])) {
        openAdminSession($secure);
        $_SESSION = [];
        session_destroy();
        setcookie('SachHayAdmin', '', [
            'expires' => 1, 'path' => '/', 'secure' => $secure,
            'httponly' => true, 'samesite' => 'Strict',
        ]);
        setcookie('SachHayAdmin', '', [
            'expires' => 1, 'path' => '/api/admin-session.php', 'secure' => $secure,
            'httponly' => true, 'samesite' => 'Strict',
        ]);
    }
    respond(200, ['authenticated' => false]);
}
if (($input['action'] ?? '') !== 'login') {
    respond(400, ['error' => 'Thao tác không hợp lệ.']);
}
if ($hash === '') {
    respond(503, ['error' => 'Máy chủ chưa cấu hình mật khẩu quản trị.']);
}

$username = $input['username'] ?? null;
$password = $input['password'] ?? null;
if (!is_string($username) || strlen($username) > 64 || !is_string($password) || strlen($password) > 72) {
    respond(400, ['error' => 'Thông tin đăng nhập không hợp lệ.']);
}

umask(0077);
$attemptFile = @fopen($hashFile . '.attempts', 'c+');
if ($attemptFile === false || !flock($attemptFile, LOCK_EX)) {
    respond(503, ['error' => 'Máy chủ xác thực tạm thời không khả dụng.']);
}
$now = time();
$ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
$attempts = json_decode((string) stream_get_contents($attemptFile), true) ?: [];
$attempts = array_filter($attempts, static fn(array $record): bool => $record['expires'] > $now);
$attempt = $attempts[$ip] ?? ['count' => 0, 'expires' => $now + 300];
if ($attempt['count'] >= 5) {
    header('Retry-After: ' . ($attempt['expires'] - $now));
    respond(429, ['error' => 'Bạn đã thử quá nhiều lần. Hãy đợi vài phút rồi thử lại.']);
}

$validPassword = password_verify($password, $hash);
$valid = $validPassword && hash_equals('admin', trim($username));
if ($valid) {
    unset($attempts[$ip]);
} else {
    $attempt['count']++;
    $attempts[$ip] = $attempt;
}
$attemptJson = json_encode($attempts, JSON_THROW_ON_ERROR);
if (!rewind($attemptFile) || !ftruncate($attemptFile, 0)
    || fwrite($attemptFile, $attemptJson) !== strlen($attemptJson) || !fflush($attemptFile)) {
    respond(503, ['error' => 'Máy chủ xác thực tạm thời không khả dụng.']);
}
fclose($attemptFile);
if (!$valid) {
    respond(401, ['error' => 'Sai tài khoản hoặc mật khẩu.']);
}

openAdminSession($secure);
if (!session_regenerate_id(true)) {
    respond(503, ['error' => 'Không khởi tạo được phiên quản trị.']);
}
$_SESSION = ['admin_until' => $now + 28800, 'admin_config' => hash('sha256', $hash)];
setcookie('SachHayAdmin', '', [
    'expires' => 1, 'path' => '/api/admin-session.php', 'secure' => $secure,
    'httponly' => true, 'samesite' => 'Strict',
]);
respond(200, ['authenticated' => true, 'expiresAt' => $_SESSION['admin_until']]);
