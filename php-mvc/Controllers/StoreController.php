<?php
declare(strict_types=1);

final class StoreController
{
    public function __construct(private Database $db) {}

    public function catalog(string $method, ?string $id, bool $admin): never
    {
        $catalog = new Catalog($this->db);
        if (!$admin && $method === 'GET') {
            if ($id === null) Http::json($catalog->list());
            $cover = $catalog->book($id)['cover_base64'] ?? null;
            if ($cover === null) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Không tìm thấy ảnh bìa.');
            header('Content-Type: image/jpeg');
            header('Cache-Control: no-cache');
            echo base64_decode($cover, true);
            exit;
        }
        if ($admin && (($method === 'POST' && $id === null) || ($id !== null && in_array($method, ['PATCH','DELETE'], true)))) {
            if (($_SERVER['HTTP_X_SACHHAY_REQUEST'] ?? '') !== '1')
                throw new ApiError(403, 'INVALID_REQUEST', 'Yêu cầu không hợp lệ.');
            if (!Accounts::adminAuthorized()) throw new ApiError(401, 'ADMIN_REQUIRED', 'Vui lòng đăng nhập lại trang quản trị.');
            if ($method === 'DELETE') {
                $catalog->remove($id);
                Http::json(null, 204);
            }
            Http::json($catalog->save($id, Http::input(640 * 1024)), $id === null ? 201 : 200);
        }
        throw new ApiError(405, 'METHOD_NOT_ALLOWED', 'Phương thức không được hỗ trợ.');
    }

    public function checkout(string $method, string $path): never
    {
        $orders = new Orders($this->db);
        if ($method === 'GET' && preg_match('~^/orders/(SACHHAY[A-F0-9]{16})/payment$~D', $path, $matches)) {
            Http::json($orders->payment($matches[1], $_SERVER['HTTP_X_SACHHAY_PAYMENT_TOKEN'] ?? ''));
        }
        Accounts::checkoutSession();
        if (($_SESSION['expires'] ?? 0) <= time()) unset($_SESSION['customer_id'], $_SESSION['customer_email'], $_SESSION['expires']);
        if ($method === 'GET' && $path === '/session') Http::json(['email'=>$_SESSION['customer_email'] ?? null]);
        if ($method === 'POST') {
            $data = Http::input();
            if ($path === '/session/login' || $path === '/session/register') {
                Http::json((new Accounts($this->db))->authenticate(basename($path), $data), $path === '/session/register' ? 201 : 200);
            }
            if ($path === '/session/logout') {
                $_SESSION = [];
                session_destroy();
                setcookie('SachHayCheckoutPhp', '', ['expires'=>1,'path'=>'/','secure'=>Http::secure(),'httponly'=>true,'samesite'=>'Lax']);
                Http::json(null, 204);
            }
            $customer = $_SESSION['customer_id'] ?? null;
            $_SESSION['owner_key'] ??= bin2hex(random_bytes(32));
            $owner = $_SESSION['owner_key'];
            session_write_close();
            if ($path === '/quote') Http::json($orders->quote(Orders::input($data, false), $customer));
            if ($path === '/orders') {
                $key = strtolower($_SERVER['HTTP_IDEMPOTENCY_KEY'] ?? '');
                if (!preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/D', $key))
                    throw new ApiError(400, 'IDEMPOTENCY_REQUIRED', 'Thiếu mã gửi đơn hợp lệ.');
                [$payload, $created] = $orders->place(Orders::input($data, true), $customer, $key, $owner);
                Http::json($payload, $created ? 201 : 200);
            }
        }
        throw new ApiError(404, 'NOT_FOUND', 'API không tồn tại.');
    }

    public function contact(): never
    {
        $data = Http::input(16384);
        (new Accounts($this->db))->limit('contact', 600, 5);
        $id = bin2hex(random_bytes(16));
        $this->db->run('INSERT INTO contacts VALUES(?,?,?,?,?)', [$id, Http::text($data['name'] ?? null, 100, 2),
            Http::email($data['email'] ?? null), Http::text($data['message'] ?? null, 2000, 10), gmdate(DATE_ATOM)]);
        Http::json(['reference'=>$id], 201);
    }

    public function bookbot(): never
    {
        $data = Http::input(2048);
        (new Accounts($this->db))->limit('bookbot', 300, 25);
        if (isset($data['query'])) Http::text($data['query'], 360);
        $offers = $this->db->run('SELECT id,title,price,stock,sold_count FROM books WHERE active=1')->fetchAll();
        Http::json(['offers'=>array_map(static fn(array $book): array => [
            'id'=>$book['id'],'title'=>$book['title'],'price'=>$book['price'],
            'available'=>$book['stock'] > 0,'soldCount'=>$book['sold_count'],
        ], $offers), 'bankTransferAvailable'=>Orders::bank() !== null, 'suggestion'=>null]);
    }

    public function webhook(): never
    {
        $secret = Orders::sepaySecret();
        if (strlen($secret) < 24) Http::json(['success'=>false], 503);
        $raw = Http::raw(16384);
        $timestamp = $_SERVER['HTTP_X_SEPAY_TIMESTAMP'] ?? '';
        $signature = strtolower($_SERVER['HTTP_X_SEPAY_SIGNATURE'] ?? '');
        if (!preg_match('/^\d{10}$/D', $timestamp) || abs(time() - (int) $timestamp) > 300
            || !hash_equals('sha256=' . hash_hmac('sha256', $timestamp . '.' . $raw, $secret), $signature))
            Http::json(['success'=>false], 401);
        $event = Http::decode($raw);
        foreach (['id','transferAmount'] as $key) {
            if (!is_int($event[$key] ?? null) || $event[$key] <= 0) Http::json(['success'=>false], 400);
        }
        foreach (['gateway'=>100,'accountNumber'=>30,'content'=>4000,'transactionDate'=>19] as $key=>$limit) {
            if (!is_string($event[$key] ?? null) || strlen($event[$key]) > $limit) Http::json(['success'=>false], 400);
        }
        if (!in_array($event['transferType'] ?? null, ['in','out'], true)) Http::json(['success'=>false], 400);
        $date = DateTimeImmutable::createFromFormat('!Y-m-d H:i:s', $event['transactionDate'], new DateTimeZone('Asia/Ho_Chi_Minh'));
        if (!$date || $date->format('Y-m-d H:i:s') !== $event['transactionDate']) Http::json(['success'=>false], 400);
        (new Orders($this->db))->transfer($event, $date);
        Http::json(['success'=>true]);
    }
}
