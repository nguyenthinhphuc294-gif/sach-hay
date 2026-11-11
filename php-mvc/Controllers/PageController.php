<?php
declare(strict_types=1);

final class PageController
{
    private Catalog $catalog;
    private Orders $orders;
    private bool $admin = false;
    private ?string $customer = null;

    public function __construct(private Database $db)
    {
        $this->catalog = new Catalog($db);
        $this->orders = new Orders($db);
    }

    public function dispatch(string $path, string $method): void
    {
        if (!in_array($method, ['GET','HEAD','POST'], true)) {
            header('Allow: GET, HEAD, POST');
            http_response_code(405);
            return;
        }
        $path = rtrim($path, '/') ?: '/';
        if (str_starts_with($path, '/admin')) $this->admin = Accounts::adminAuthorized();
        Accounts::checkoutSession();
        if (($_SESSION['expires'] ?? 0) <= time()) {
            unset($_SESSION['customer_id'], $_SESSION['customer_email'], $_SESSION['expires']);
        }
        $this->customer = $_SESSION['customer_id'] ?? null;
        $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
        $_SESSION['owner_key'] ??= bin2hex(random_bytes(32));
        header('Cache-Control: private, no-store');
        try {
            if ($method === 'POST') {
                $token = $_POST['csrf'] ?? null;
                if (!is_string($token) || !hash_equals($_SESSION['csrf'], $token)) {
                    throw new ApiError(403, 'INVALID_REQUEST', 'Phiên đã thay đổi. Vui lòng tải lại trang và thử lại.');
                }
                $this->submit($path);
                return;
            }
            $this->show($path);
        } catch (ApiError $error) {
            http_response_code($error->status);
            $back = in_array($path, ['/cart','/checkout','/admin','/account'], true) ? $path : ($path === '/contact' ? '/about' : '/');
            $this->render('message', 'Sách Hay', ['message'=>$error->getMessage(), 'back'=>$back]);
        }
    }

    private function show(string $path): void
    {
        if ($path === '/' || $path === '/books') {
            $query = $this->query('q', 120);
            $category = $this->query('category', 160);
            $sort = $this->query('sort', 20);
            $home = $path === '/';
            $result = $this->catalog->browse($query, $category, $sort, $this->page());
            $categories = $this->catalog->categories();
            $homeShelves = [];
            if ($home) {
                $homeShelves[] = ['title'=>'Flash Sale','style'=>'sale','params'=>['sort'=>'sale'],
                    'books'=>array_slice($this->catalog->browse('', '', 'sale')['books'], 0, 5)];
                $homeShelves[] = ['title'=>'Xu hướng mua sắm','style'=>'trending','params'=>['sort'=>'popular'],
                    'books'=>array_slice($this->catalog->browse('', '', 'popular')['books'], 0, 5)];
                foreach ($categories as $label) {
                    $homeShelves[] = ['title'=>$label,'style'=>'category','params'=>['category'=>$label],
                        'books'=>array_slice($this->catalog->browse('', $label)['books'], 0, 5)];
                }
            }
            $this->render('books', $home ? 'Nhà sách trực tuyến' : 'Danh mục sách',
                $result + compact('home','category','sort','categories','homeShelves') + ['q'=>$query]);
            return;
        }
        if (preg_match('~^/books/([a-zA-Z0-9_-]{1,80})$~D', $path, $match)) {
            $book = $this->catalog->book($match[1]);
            if (!$book) $this->notFound();
            $this->render('book', $book['title'], ['book'=>$book,'details'=>Catalog::details($book)]);
            return;
        }
        switch ($path) {
            case '/about':
            case '/contact':
                $this->render('about', 'Về chúng tôi & Liên hệ');
                break;
            case '/cart':
            case '/checkout':
                $this->basket($path);
                break;
            case '/account':
            case '/orders':
                $this->render('account', 'Tài khoản và đơn hàng', [
                    'orders'=>$this->orders->customerOrders($this->customer, $_SESSION['owner_key']),
                ]);
                break;
            case '/admin':
                if (!$this->admin) {
                    $this->render('admin-login', 'Đăng nhập quản trị');
                    return;
                }
                $page = $this->page();
                $this->render('admin', 'Quản trị Sách Hay', $this->orders->adminOrders($page) + [
                    'books'=>$this->catalog->list(true), 'page'=>$page,
                    'stats'=>$this->db->one("SELECT COUNT(*) AS total,
                        SUM(CASE WHEN json_extract(payload,'$.order.status')='pending' THEN 1 ELSE 0 END) AS pending,
                        SUM(CASE WHEN json_extract(payload,'$.order.status')='completed' THEN total ELSE 0 END) AS revenue FROM orders"),
                    'contacts'=>$this->db->run('SELECT name,email,message,created_at FROM contacts ORDER BY created_at DESC LIMIT 20')->fetchAll(),
                    'vouchers'=>$this->db->run('SELECT code,value,kind,used,max_uses,valid_until FROM vouchers ORDER BY code')->fetchAll(),
                ]);
                break;
            default:
                $this->notFound();
        }
    }

    private function submit(string $path): never
    {
        $data = $_POST;
        $action = $data['action'] ?? '';
        $accounts = new Accounts($this->db);
        switch ($path) {
            case '/cart':
                $id = Http::text($data['book'] ?? null, 80);
                $quantity = $action === 'remove' ? 0 : filter_var($data['quantity'] ?? null, FILTER_VALIDATE_INT);
                if ($quantity === false || $quantity < 0 || $quantity > 99) Http::invalid('Số lượng phải từ 0 đến 99.');
                if ($action === 'add') $quantity += $_SESSION['cart'][$id] ?? 0;
                if ($quantity === 0) {
                    unset($_SESSION['cart'][$id], $_SESSION['purchase']);
                    $this->redirect('/cart');
                }
                $book = $this->catalog->book($id);
                if (!$book || $quantity > min(99, $book['stock'])) Http::invalid('Số lượng vượt tồn kho.');
                if (!isset($_SESSION['cart'][$id]) && count($_SESSION['cart'] ?? []) >= 30) Http::invalid('Giỏ hàng tối đa 30 tựa sách.');
                $_SESSION['cart'][$id] = $quantity;
                unset($_SESSION['purchase']);
                $this->redirect('/cart');
            case '/checkout':
                $this->checkout($data);
            case '/account':
                if ($action === 'login' || $action === 'register') {
                    $accounts->authenticate($action, $data);
                } elseif ($action === 'logout') {
                    unset($_SESSION['customer_id'], $_SESSION['customer_email'], $_SESSION['expires'], $_SESSION['purchase']);
                    if (!session_regenerate_id(true)) throw new RuntimeException('Cannot regenerate session');
                } elseif ($action === 'cancel') {
                    $this->orders->updateStatus(Http::text($data['id'] ?? null, 32), 'cancelled', true, $this->customer, $_SESSION['owner_key']);
                } else {
                    Http::invalid();
                }
                unset($_SESSION['purchase']);
                $this->redirect('/account');
            case '/contact':
                $accounts->limit('contact', 600, 5);
                $this->db->run('INSERT INTO contacts VALUES(?,?,?,?,?)', [bin2hex(random_bytes(16)),
                    Http::text($data['name'] ?? null, 100, 2), Http::email($data['email'] ?? null),
                    Http::text($data['message'] ?? null, 2000, 10), gmdate(DATE_ATOM)]);
                $this->redirect('/about', 'Đã gửi tin nhắn. Cảm ơn bạn.');
            case '/admin':
                if (!$this->admin) throw new ApiError(403, 'ADMIN_REQUIRED', 'Vui lòng đăng nhập quản trị.');
                $this->manage($action, $data);
                $this->redirect('/admin', 'Đã cập nhật.');
            default:
                $this->notFound();
        }
    }

    private function items(): array
    {
        $items = [];
        foreach ($_SESSION['cart'] ?? [] as $id=>$quantity) $items[] = ['bookId'=>(string) $id,'quantity'=>$quantity];
        return $items;
    }

    private function basket(string $path): void
    {
        $items = $this->items();
        $lines = [];
        foreach ($items as $item) $lines[] = $item + ['book'=>$this->catalog->book($item['bookId'])];
        $this->render('basket', $path === '/checkout' ? 'Thanh toán' : 'Giỏ hàng', [
            'lines'=>$lines, 'checkout'=>$path === '/checkout', 'purchase'=>$_SESSION['purchase'] ?? null,
            'bankAvailable'=>Orders::bank() !== null,
        ]);
    }

    private function checkout(array $data): never
    {
        $items = $this->items();
        if (($data['action'] ?? '') === 'place') {
            $purchase = $_SESSION['purchase'] ?? null;
            $key = $data['key'] ?? null;
            if (!$purchase || !is_string($key) || !hash_equals($purchase['key'], $key)) {
                Http::invalid('Vui lòng kiểm tra lại đơn hàng trước khi đặt.');
            }
            $this->orders->place($purchase['input'], $this->customer, $key, $_SESSION['owner_key']);
            unset($_SESSION['cart'], $_SESSION['purchase']);
            $this->redirect('/orders', 'Đã tạo đơn hàng.');
        }
        unset($_SESSION['purchase']);
        if (($data['voucherCode'] ?? '') === '') unset($data['voucherCode']);
        $data['items'] = $items;
        $quote = $this->orders->quote(Orders::input($data, false), $this->customer);
        $data['quoteVersion'] = $quote['quoteVersion'];
        $_SESSION['purchase'] = [
            'input'=>Orders::input($data, true),'quote'=>$quote,'key'=>bin2hex(random_bytes(16)),
        ];
        $this->redirect('/checkout');
    }

    private function manage(mixed $action, array $data): void
    {
        if ($action === 'order') {
            $this->orders->updateStatus(Http::text($data['id'] ?? null, 32), Http::text($data['status'] ?? null, 16));
            return;
        }
        if ($action === 'remove') {
            $this->catalog->remove(Http::text($data['id'] ?? null, 80));
            return;
        }
        if ($action !== 'save') Http::invalid();
        $id = ($data['id'] ?? '') === '' ? null : Http::text($data['id'], 80);
        foreach (['price','originalPrice','stock','expectedStock'] as $key) {
            if (isset($data[$key])) $data[$key] = filter_var($data[$key], FILTER_VALIDATE_INT);
        }
        $data['categoryName'] = Http::text($data['categoryName'] ?? null, 160);
        $data['categoryId'] = 'cat-' . substr(hash('sha256', mb_strtolower($data['categoryName'])), 0, 16);
        $file = $_FILES['cover'] ?? null;
        if ($file && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 12 * 1024 * 1024 || !is_uploaded_file($file['tmp_name'])) {
                Http::invalid('Ảnh bìa tải lên không hợp lệ.');
            }
            $bytes = file_get_contents($file['tmp_name']);
            $size = $bytes === false ? false : @getimagesizefromstring($bytes);
            if (!$size || !in_array($size[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)
                || $size[0] > 4096 || $size[1] > 4096) Http::invalid('Hãy chọn ảnh JPG, PNG hoặc WebP tối đa 4096 px mỗi chiều.');
            $image = @imagecreatefromstring($bytes);
            if (!$image) Http::invalid('Không đọc được ảnh bìa.');
            $scaled = $size[0] >= $size[1] ? imagescale($image, min(900, $size[0]))
                : imagescale($image, max(1, (int) round($size[0] * min(1, 900 / $size[1]))));
            if (!$scaled) Http::invalid('Không xử lý được ảnh bìa.');
            ob_start();
            imagejpeg($scaled, null, 82);
            $data['cover'] = base64_encode(ob_get_clean());
        }
        $this->catalog->save($id, $data);
    }

    private function query(string $key, int $max): string
    {
        return is_string($_GET[$key] ?? null) ? mb_substr(trim($_GET[$key]), 0, $max) : '';
    }

    private function page(): int
    {
        return max(1, min(10000, (int) $this->query('page', 6)));
    }

    private function render(string $view, string $title, array $data = []): void
    {
        $csrf = $_SESSION['csrf'];
        $cartCount = array_sum($_SESSION['cart'] ?? []);
        $email = $_SESSION['customer_email'] ?? '';
        $flash = $_SESSION['flash'] ?? '';
        unset($_SESSION['flash']);
        extract($data, EXTR_SKIP);
        require __DIR__ . '/../Views/layout.php';
    }

    private function redirect(string $path, string $message = ''): never
    {
        if ($message !== '') $_SESSION['flash'] = $message;
        header('Location: ' . $path, true, 303);
        exit;
    }

    private function notFound(): never
    {
        throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy trang.');
    }
}
