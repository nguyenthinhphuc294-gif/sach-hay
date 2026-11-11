<?php
declare(strict_types=1);

final class Accounts
{
    public function __construct(private Database $db) {}

    public static function adminAuthorized(): bool
    {
        if ((!Http::secure() && PHP_SAPI !== 'cli-server') || !isset($_COOKIE['SachHayAdmin'])) return false;
        $file = getenv('SACHHAY_ADMIN_HASH_FILE') ?: dirname(__DIR__, 2) . '/.sachhay-admin.hash';
        if (!is_readable($file)) return false;
        $hash = trim((string) file_get_contents($file));
        if ($hash === '') return false;

        $previousActive = session_status() === PHP_SESSION_ACTIVE;
        $previousName = $previousActive ? session_name() : '';
        if ($previousActive) {
            session_write_close();
        }

        session_name('SachHayAdmin');
        if (!@session_start(['read_and_close'=>true, 'use_strict_mode'=>true, 'use_only_cookies'=>true])) {
            if ($previousActive) {
                session_name($previousName);
                @session_start();
            }
            return false;
        }

        $authorized = ($_SESSION['admin_until'] ?? 0) > time()
            && hash_equals(hash('sha256', $hash), (string) ($_SESSION['admin_config'] ?? ''));

        if ($previousActive) {
            session_name($previousName);
            @session_start();
        }

        return $authorized;
    }

    public static function checkoutSession(): void
    {
        session_name('SachHayCheckoutPhp');
        if (!session_start(['use_strict_mode'=>true, 'use_only_cookies'=>true, 'cookie_httponly'=>true,
            'cookie_secure'=>Http::secure(), 'cookie_samesite'=>'Lax', 'cookie_path'=>'/', 'gc_maxlifetime'=>7200])) {
            throw new RuntimeException('Checkout session unavailable');
        }
    }

    public function limit(string $action, int $seconds, int $maximum): void
    {
        $key = hash('sha256', $action . ':' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
        $now = time();
        $allowed = $this->db->write(function () use ($key, $now, $seconds, $maximum): bool {
            $this->db->run('DELETE FROM request_limits WHERE expires_at<=?', [$now]);
            $row = $this->db->one('SELECT attempts FROM request_limits WHERE bucket=?', [$key]);
            if (($row['attempts'] ?? 0) >= $maximum) return false;
            $this->db->run('INSERT INTO request_limits VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET attempts=attempts+1',
                [$key, $now + $seconds]);
            return true;
        });
        if (!$allowed) throw new ApiError(429, 'RATE_LIMITED', 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.');
    }

    public function authenticate(string $action, array $data): array
    {
        $this->limit('checkout-auth', 900, 20);
        $email = Http::email($data['email'] ?? null);
        $password = $data['password'] ?? null;
        if (!is_string($password) || mb_strlen($password) < 6 || mb_strlen($password) > 128
            || str_contains($password, "\0")) Http::invalid('Mật khẩu phải dài từ 6 đến 128 ký tự.');
        // Hash the full password before bcrypt so passwords longer than 72 bytes are not truncated.
        $material = hash('sha256', $password);
        $user = $this->db->one('SELECT * FROM customers WHERE email=?', [$email]);
        if ($action === 'register') {
            $id = bin2hex(random_bytes(16));
            $saved = $this->db->run('INSERT INTO customers VALUES(?,?,?) ON CONFLICT(email) DO NOTHING',
                [$id, $email, password_hash($material, PASSWORD_DEFAULT)]);
            if (!$saved->rowCount()) throw new ApiError(409, 'EMAIL_EXISTS', 'Email đã được đăng ký.');
        } else {
            $fallback = '$2y$10$7EqJtq98hPqEX7fNZaFWoO5u5jrsVdUq14ZdtyZB.w8pAR/OoKNtC';
            if (!password_verify($material, $user['password_hash'] ?? $fallback) || !$user) {
                throw new ApiError(401, 'BAD_LOGIN', 'Email hoặc mật khẩu không đúng.');
            }
            $id = $user['id'];
        }
        if (!headers_sent()) { @session_regenerate_id(true); }
        $_SESSION['customer_id'] = $id;
        $_SESSION['customer_email'] = $email;
        $_SESSION['expires'] = time() + 7200;
        return ['email'=>$email];
    }
}
