<?php
declare(strict_types=1);

final class Orders
{
    public function __construct(private Database $db) {}

    public static function bank(): ?array
    {
        $number = (string) getenv('VIETQR_ACCOUNT_NUMBER');
        $name = trim((string) getenv('VIETQR_ACCOUNT_NAME'));
        $template = getenv('VIETQR_TEMPLATE') ?: 'compact2';
        if (getenv('VIETQR_BANK_BIN') !== '970457' || !preg_match('/^\d{6,19}$/D', $number)
            || $name === '' || mb_strlen($name) > 100 || !preg_match('/^[a-zA-Z0-9_-]{1,64}$/D', $template)
            || strlen(self::sepaySecret()) < 24) return null;
        return ['bankBin'=>'970457','bankName'=>'Woori Bank','accountNumber'=>$number,'accountName'=>$name,'template'=>$template];
    }

    public static function sepaySecret(): string
    {
        return trim((string) getenv('SEPAY_WEBHOOK_SECRET'));
    }

    public static function input(array $data, bool $order): array
    {
        $method = $data['paymentMethod'] ?? null;
        if (!in_array($method, ['COD','STORE_PICKUP','BANK_TRANSFER'], true)) Http::invalid();
        $items = $data['items'] ?? null;
        if (!is_array($items) || !array_is_list($items) || count($items) < 1 || count($items) > 30) Http::invalid();
        $quantities = [];
        foreach ($items as $item) {
            if (!is_array($item)) Http::invalid();
            $id = $item['bookId'] ?? null;
            $quantity = $item['quantity'] ?? null;
            if (!is_string($id) || !preg_match('/^[a-zA-Z0-9_-]{1,80}$/D', $id) || !is_int($quantity)
                || $quantity < 1 || $quantity > 99) Http::invalid();
            $quantities[$id] = ($quantities[$id] ?? 0) + $quantity;
            if ($quantities[$id] > 99) Http::invalid('Mỗi tựa sách chỉ được đặt tối đa 99 cuốn.');
        }
        ksort($quantities, SORT_STRING);
        $voucher = isset($data['voucherCode']) ? strtoupper(Http::text($data['voucherCode'], 40)) : null;
        if ($voucher !== null && !preg_match('/^[A-Z0-9_-]+$/D', $voucher)) Http::invalid();
        $input = ['items'=>$quantities,'voucherCode'=>$voucher,'paymentMethod'=>$method];
        if (!$order) return $input;
        $input['quoteVersion'] = Http::text($data['quoteVersion'] ?? null, 64, 64);
        $input['customerName'] = Http::text($data['customerName'] ?? null, 100);
        $input['phone'] = Http::text($data['phone'] ?? null, 10, 10);
        if (!preg_match('/^0\d{9}$/D', $input['phone'])) Http::invalid('Số điện thoại không hợp lệ.');
        $input['email'] = Http::email($data['email'] ?? null);
        foreach (['province','district','ward','address'] as $field) {
            $input[$field] = Http::text($data[$field] ?? '', 150, $method === 'STORE_PICKUP' ? 0 : 1);
        }
        $input['notes'] = Http::text($data['notes'] ?? '', 400, 0);
        return $input;
    }

    public function quote(array $input, ?string $customer): array
    {
        $lines = [];
        foreach ($input['items'] as $id => $quantity) {
            $book = $this->db->one('SELECT title,stock,price,cover_path FROM books WHERE id=? AND active=1', [(string) $id]);
            if (!$book) throw new ApiError(404, 'BOOK_NOT_FOUND', 'Giỏ hàng có sách chưa được đồng bộ.');
            if ($book['stock'] < $quantity) throw new ApiError(409, 'OUT_OF_STOCK', 'Sách “' . $book['title'] . '” chỉ còn ' . $book['stock'] . ' cuốn.');
            $lines[] = ['bookId'=>(string) $id,'quantity'=>$quantity,'title'=>$book['title'],'coverImage'=>$book['cover_path'],
                'price'=>$book['price'],'total'=>$book['price'] * $quantity];
        }
        $subtotal = array_sum(array_column($lines, 'total'));
        $shippingFee = $input['paymentMethod'] === 'STORE_PICKUP' || $subtotal >= 250000 ? 0 : 25000;
        $discount = 0;
        $voucherCode = $input['voucherCode'];
        if ($voucherCode !== null) {
            if ($customer === null) throw new ApiError(401, 'VOUCHER_LOGIN_REQUIRED', 'Đăng nhập để dùng voucher.');
            $now = time();
            $voucher = $this->db->one('SELECT * FROM vouchers WHERE code=? AND active=1 AND valid_from<=? AND valid_until>?',
                [$voucherCode, $now, $now]);
            if (!$voucher) throw new ApiError(404, 'VOUCHER_NOT_FOUND', 'Voucher không tồn tại hoặc đã hết hạn.');
            if ($subtotal < $voucher['minimum']) throw new ApiError(400, 'MINIMUM_NOT_MET',
                'Voucher áp dụng cho đơn từ ' . number_format($voucher['minimum'], 0, ',', '.') . ' ₫.');
            if ($voucher['max_uses'] !== null && $voucher['used'] >= $voucher['max_uses'])
                throw new ApiError(409, 'VOUCHER_EXHAUSTED', 'Voucher đã hết lượt sử dụng.');
            $usage = $this->db->one('SELECT used FROM voucher_uses WHERE code=? AND customer_id=?', [$voucherCode, $customer]);
            if (($usage['used'] ?? 0) >= $voucher['max_per_user'])
                throw new ApiError(409, 'VOUCHER_USER_LIMIT', 'Tài khoản đã dùng hết lượt cho voucher này.');
            $cap = $voucher['cap'] ?? PHP_INT_MAX;
            if ($voucher['kind'] === 'shipping') {
                if ($shippingFee === 0) throw new ApiError(400, 'NO_SHIPPING_FEE', 'Đơn này đã được miễn phí giao hàng.');
                $shippingFee -= min($shippingFee, $voucher['value'], $cap);
            } else {
                $value = $voucher['kind'] === 'percentage' ? intdiv($subtotal * $voucher['value'], 100) : $voucher['value'];
                $discount = min($subtotal, $value, $cap);
            }
        }
        $total = $subtotal - $discount + $shippingFee;
        $bankTransferAvailable = self::bank() !== null;
        if ($input['paymentMethod'] === 'BANK_TRANSFER') {
            if (!$bankTransferAvailable) throw new ApiError(503, 'BANK_TRANSFER_DISABLED', 'Chuyển khoản VietQR chưa được cấu hình.');
            if ($total <= 0) Http::invalid('Đơn hàng không có khoản cần chuyển.');
        }
        $prices = array_map(static fn(array $line): array => [$line['bookId'], $line['quantity'], $line['price']], $lines);
        $quoteVersion = hash('sha256', json_encode([$prices,$voucherCode,$discount,$shippingFee,$input['paymentMethod']], JSON_THROW_ON_ERROR));
        return compact('lines','subtotal','discount','shippingFee','total','voucherCode','quoteVersion','bankTransferAvailable');
    }

    public function place(array $input, ?string $customer, string $key, string $owner): array
    {
        return $this->db->write(function () use ($input, $customer, $key, $owner): array {
            $hash = hash('sha256', json_encode($input, JSON_THROW_ON_ERROR));
            $existing = $this->db->one('SELECT * FROM orders WHERE request_key=?', [$key]);
            if ($existing) {
                if ($existing['request_hash'] !== $hash || !hash_equals($existing['owner_key'], $owner)
                    || $existing['customer_id'] !== $customer)
                    throw new ApiError(409, 'ORDER_KEY_REUSED', 'Mã gửi đơn đã dùng cho yêu cầu khác.');
                return [$this->response($existing), false];
            }
            $quote = $this->quote($input, $customer);
            if (!hash_equals($quote['quoteVersion'], $input['quoteVersion']))
                throw new ApiError(409, 'QUOTE_CHANGED', 'Giá đã thay đổi. Vui lòng kiểm tra lại tổng tiền.');
            if ($quote['voucherCode'] !== null) {
                $this->db->run('UPDATE vouchers SET used=used+1 WHERE code=?', [$quote['voucherCode']]);
                $this->db->run('INSERT INTO voucher_uses VALUES(?,?,1) ON CONFLICT(code,customer_id) DO UPDATE SET used=used+1',
                    [$quote['voucherCode'], $customer]);
            }
            $inventory = [];
            foreach ($quote['lines'] as $line) {
                $this->db->run('UPDATE books SET stock=stock-?,sold_count=sold_count+? WHERE id=?',
                    [$line['quantity'], $line['quantity'], $line['bookId']]);
                $book = $this->db->one('SELECT stock,sold_count FROM books WHERE id=?', [$line['bookId']]);
                $inventory[] = ['bookId'=>$line['bookId'],'stock'=>$book['stock'],'soldCount'=>$book['sold_count']];
            }
            $id = bin2hex(random_bytes(16));
            $bank = $input['paymentMethod'] === 'BANK_TRANSFER' ? self::bank() : null;
            $code = ($bank ? 'SACHHAY' : 'SH-') . strtoupper(bin2hex(random_bytes(8)));
            $now = gmdate(DATE_ATOM);
            $order = array_intersect_key($input, array_flip(['customerName','phone','email','province','district','ward','address','notes','paymentMethod']));
            $order += array_intersect_key($quote, array_flip(['subtotal','discount','shippingFee','total','voucherCode']));
            $order += ['id'=>$id,'orderCode'=>$code,'items'=>$quote['lines'],'status'=>'pending','source'=>'checkout-api',
                'createdAt'=>$now,'statusHistory'=>[['status'=>'pending','timestamp'=>$now,'note'=>'Đơn hàng đã được ghi nhận.']]];
            $payload = json_encode(['order'=>$order,'inventory'=>$inventory], JSON_THROW_ON_ERROR);
            $tokenHash = $bank ? hash('sha256', $this->token($id, $owner)) : null;
            $this->db->run('INSERT INTO orders VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [$id,$key,$hash,$customer,$owner,$code,$input['paymentMethod'],$quote['total'],$payload,
                    $bank ? json_encode($bank, JSON_THROW_ON_ERROR) : null,$tokenHash,$bank ? 'pending' : null,null,$now]);
            return [$this->response($this->db->one('SELECT * FROM orders WHERE id=?', [$id])), true];
        });
    }

    private function token(string $id, string $owner): string
    {
        return hash_hmac('sha256', 'payment:' . $id, $owner);
    }

    public function customerOrders(?string $customer, string $owner): array
    {
        $rows = $this->db->run('SELECT * FROM orders WHERE customer_id=? OR (customer_id IS NULL AND owner_key=?)
            ORDER BY created_at DESC LIMIT 100', [$customer, $owner])->fetchAll();
        return array_map($this->response(...), $rows);
    }

    public function adminOrders(int $page): array
    {
        $rows = $this->db->run('SELECT * FROM orders ORDER BY created_at DESC, id DESC LIMIT 21 OFFSET ?', [($page - 1) * 20])->fetchAll();
        $orders = array_map(fn(array $row): array => $this->response($row)['order'], array_slice($rows, 0, 20));
        return ['orders'=>$orders, 'hasNext'=>count($rows) > 20];
    }

    public function updateStatus(string $id, string $status, bool $customer = false, ?string $customerId = null, string $owner = ''): void
    {
        $this->db->write(function () use ($id, $status, $customer, $customerId, $owner): void {
            $row = $this->db->one('SELECT * FROM orders WHERE id=?', [$id]);
            if (!$row || ($customer && !($row['customer_id'] !== null
                ? $row['customer_id'] === $customerId : hash_equals($row['owner_key'], $owner)))) {
                throw new ApiError(404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.');
            }
            $data = json_decode($row['payload'], true, 64, JSON_THROW_ON_ERROR);
            $current = $data['order']['status'];
            if ($current === $status) return;
            $next = ['pending'=>['confirmed','cancelled'], 'confirmed'=>['processing','cancelled'],
                'processing'=>['shipping','cancelled'], 'shipping'=>['completed']];
            if (!in_array($status, $next[$current] ?? [], true) || ($customer && ($status !== 'cancelled' || $current !== 'pending'))
                || ($row['bank'] !== null && ($status === 'cancelled' ? $row['payment_status'] === 'paid' : $row['payment_status'] !== 'paid'))) {
                throw new ApiError(409, 'INVALID_STATUS', 'Không thể cập nhật đơn ở trạng thái hiện tại.');
            }
            if ($status === 'cancelled') {
                foreach ($data['order']['items'] as $line) {
                    $this->db->run('UPDATE books SET stock=stock+?,sold_count=sold_count-? WHERE id=?',
                        [$line['quantity'],$line['quantity'],$line['bookId']]);
                }
                $voucher = $data['order']['voucherCode'] ?? null;
                if ($voucher !== null && $row['customer_id'] !== null) {
                    $this->db->run('UPDATE vouchers SET used=used-1 WHERE code=? AND used>0', [$voucher]);
                    $this->db->run('DELETE FROM voucher_uses WHERE code=? AND customer_id=? AND used=1', [$voucher, $row['customer_id']]);
                    $this->db->run('UPDATE voucher_uses SET used=used-1 WHERE code=? AND customer_id=? AND used>1', [$voucher, $row['customer_id']]);
                }
            }
            $data['order']['status'] = $status;
            $data['order']['statusHistory'][] = ['status'=>$status, 'timestamp'=>gmdate(DATE_ATOM), 'note'=>'Đã cập nhật trạng thái đơn.'];
            $paymentStatus = $status === 'cancelled' && $row['bank'] !== null ? 'cancelled' : $row['payment_status'];
            $this->db->run('UPDATE orders SET payload=?,payment_status=? WHERE id=?',
                [json_encode($data, JSON_THROW_ON_ERROR),$paymentStatus,$id]);
        });
    }

    private function response(array $row): array
    {
        $data = json_decode($row['payload'], true, 64, JSON_THROW_ON_ERROR);
        if ($row['bank'] !== null) {
            $data['order']['paymentStatus'] = $row['payment_status'];
            $data['payment'] = $this->paymentDetails($row) + ['token'=>$this->token($row['id'], $row['owner_key'])];
        }
        return $data;
    }

    public function payment(string $code, string $token): array
    {
        $row = $this->db->one('SELECT * FROM orders WHERE order_code=? AND bank IS NOT NULL', [$code]);
        if (!$row || !preg_match('/^[a-f0-9]{64}$/D', $token) || !hash_equals($row['payment_token_hash'], hash('sha256', $token)))
            throw new ApiError(404, 'PAYMENT_NOT_FOUND', 'Không tìm thấy phiên thanh toán.');
        return $this->paymentDetails($row);
    }

    private function paymentDetails(array $row): array
    {
        $bank = json_decode($row['bank'], true, 32, JSON_THROW_ON_ERROR);
        $url = 'https://img.vietqr.io/image/' . $bank['bankBin'] . '-' . $bank['accountNumber'] . '-' . $bank['template'] . '.svg?'
            . http_build_query(['amount'=>$row['total'],'addInfo'=>$row['order_code'],'accountName'=>$bank['accountName']], '', '&', PHP_QUERY_RFC3986);
        return ['orderCode'=>$row['order_code'],'status'=>$row['payment_status'],'paidAt'=>$row['paid_at'],'amount'=>$row['total'],
            'bankName'=>$bank['bankName'],'accountNumber'=>$bank['accountNumber'],'accountName'=>$bank['accountName'],
            'qrUrl'=>$row['payment_status'] === 'pending' ? $url : null];
    }

    public function transfer(array $event, DateTimeImmutable $date): void
    {
        preg_match_all('/(?<![A-Z0-9])SACHHAY[A-F0-9]{16}(?![A-Z0-9])/', strtoupper($event['content']), $matches);
        $codes = array_values(array_unique($matches[0]));
        $code = count($codes) === 1 ? $codes[0] : null;
        $this->db->write(function () use ($event, $code, $date): void {
            if ($this->db->one('SELECT id FROM sepay_events WHERE id=?', [(string) $event['id']])) return;
            $row = $code === null ? null : $this->db->one('SELECT * FROM orders WHERE order_code=?', [$code]);
            $bank = isset($row['bank']) ? json_decode($row['bank'], true, 32, JSON_THROW_ON_ERROR) : null;
            $result = match (true) {
                $event['transferType'] !== 'in' => 'money_out',
                $code === null => 'missing_or_ambiguous_code',
                $bank === null => 'unknown_order',
                !preg_match('/^woori(?:\s+bank)?$/iD', $event['gateway']) || $event['accountNumber'] !== $bank['accountNumber'] => 'wrong_destination',
                $event['transferAmount'] !== $row['total'] => 'wrong_amount',
                $date->getTimestamp() < strtotime($row['created_at']) => 'transfer_before_order',
                $row['payment_status'] === 'cancelled' => 'cancelled_order',
                $row['payment_status'] !== 'pending' => 'already_paid',
                default => 'paid',
            };
            $timestamp = gmdate(DATE_ATOM, $date->getTimestamp());
            if ($result === 'paid') $this->db->run("UPDATE orders SET payment_status='paid',paid_at=? WHERE id=?", [$timestamp,$row['id']]);
            $this->db->run('INSERT INTO sepay_events VALUES(?,?,?,?,?)', [(string) $event['id'],$code,$event['transferAmount'],$result,$timestamp]);
        });
    }
}
