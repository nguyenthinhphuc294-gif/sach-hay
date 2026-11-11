<?php
declare(strict_types=1);

final class Catalog
{
    public function __construct(private Database $db) {}

    public function list(bool $includeSeeded = false): array
    {
        $filter = $includeSeeded ? 'catalog IS NOT NULL' : 'created_at IS NOT NULL';
        return array_map($this->product(...), $this->db->run(
            "SELECT * FROM books WHERE active=1 AND $filter ORDER BY created_at DESC, id DESC"
        )->fetchAll());
    }

    public function book(string $id): ?array
    {
        return $this->db->one('SELECT * FROM books WHERE id=? AND active=1', [$id]);
    }

    public function browse(string $query = '', string $category = '', string $sort = '', int $page = 1): array
    {
        $filters = ['active=1'];
        $args = [];
        if ($query !== '') {
            $filters[] = "instr(sachhay_lower(title || ' ' || coalesce(catalog,'')), sachhay_lower(?))>0";
            $args[] = $query;
        }
        if ($category !== '') {
            $filters[] = "json_extract(catalog,'$.categoryName')=?";
            $args[] = $category;
        }
        $where = implode(' AND ', $filters);
        $order = match ($sort) {
            'price' => 'price ASC', 'price-desc' => 'price DESC', 'title' => 'title ASC',
            'popular' => 'sold_count DESC', default => 'created_at DESC',
        };
        $total = $this->db->one("SELECT COUNT(*) AS total FROM books WHERE $where", $args)['total'];
        $pages = max(1, (int) ceil($total / 12));
        $page = min(max(1, $page), $pages);
        $books = $this->db->run("SELECT id,title,price,stock,sold_count,cover_path,catalog,created_at FROM books
            WHERE $where ORDER BY $order,id LIMIT 12 OFFSET ?", [...$args, ($page - 1) * 12])->fetchAll();
        return compact('books', 'pages', 'page');
    }

    public function categories(): array
    {
        return $this->db->run("SELECT DISTINCT json_extract(catalog,'$.categoryName') AS name FROM books
            WHERE active=1 AND catalog IS NOT NULL ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);
    }

    public static function details(array $book): array
    {
        return $book['catalog'] ? json_decode($book['catalog'], true, 32, JSON_THROW_ON_ERROR) : [];
    }

    private function product(array $row): array
    {
        $data = json_decode($row['catalog'], true, 32, JSON_THROW_ON_ERROR);
        $id = $row['id'];
        $image = $row['cover_path'];
        $original = $data['originalPrice'];
        return [...$data, 'id'=>$id, 'slug'=>$id, 'authorId'=>$id, 'supplier'=>$data['publisher'],
            'title'=>$row['title'], 'price'=>$row['price'], 'stock'=>$row['stock'], 'soldCount'=>$row['sold_count'],
            'coverImage'=>$image, 'thumbnails'=>[$image], 'discountPercent'=>$original > $row['price'] ?
                (int) round(100 * (1 - $row['price'] / $original)) : 0,
            'publicationYear'=>(int) substr($row['created_at'] ?? '', 0, 4), 'format'=>'Bìa mềm', 'language'=>'Tiếng Việt',
            'rating'=>0, 'reviewCount'=>0, 'pages'=>0, 'dimensions'=>'', 'weight'=>0, 'isNewRelease'=>true,
            'shortDescription'=>mb_substr($data['description'], 0, 100), 'source'=>'catalog-api'];
    }

    public function save(?string $id, array $data): array
    {
        $details = [];
        foreach (['author'=>160, 'publisher'=>160, 'isbn'=>40, 'categoryId'=>80, 'categoryName'=>160, 'description'=>6000] as $key=>$limit) {
            $details[$key] = Http::text($data[$key] ?? null, $limit, $key === 'description' ? 0 : 1);
        }
        if (!preg_match('/^[a-zA-Z0-9_-]+$/D', $details['categoryId'])) Http::invalid();
        foreach (['price'=>100000000, 'originalPrice'=>100000000, 'stock'=>1000000] as $key=>$limit) {
            if (!is_int($data[$key] ?? null) || $data[$key] < 0 || $data[$key] > $limit) Http::invalid();
        }
        $details['originalPrice'] = $data['originalPrice'];
        $title = Http::text($data['title'] ?? null, 160);
        $cover = $data['cover'] ?? null;
        if ($cover !== null) {
            $binary = is_string($cover) && strlen($cover) <= 600000 ? base64_decode($cover, true) : false;
            $image = $binary === false ? false : @getimagesizefromstring($binary);
            if (!$image || $image[2] !== IMAGETYPE_JPEG || base64_encode($binary) !== $cover
                || !str_ends_with($binary, "\xff\xd9") || $image[0] > 4096 || $image[1] > 4096) {
                throw new ApiError(400, 'INVALID_COVER', 'Ảnh bìa không hợp lệ. Vui lòng chọn lại ảnh.');
            }
        }
        if ($id === null && $cover === null) throw new ApiError(400, 'COVER_REQUIRED', 'Vui lòng chọn ảnh bìa.');
        $json = json_encode($details, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        return $this->db->write(function () use ($id, $data, $title, $json, $cover): array {
            if ($id === null) {
                $id = 'book-' . bin2hex(random_bytes(16));
                $path = '/api/catalog/books/' . $id . '/cover';
                $this->db->run('INSERT INTO books(id,title,price,stock,cover_path,cover_base64,catalog,created_at) VALUES(?,?,?,?,?,?,?,?)',
                    [$id, $title, $data['price'], $data['stock'], $path, $cover, $json, gmdate(DATE_ATOM)]);
            } else {
                $previous = $this->book($id);
                if (!$previous) $this->missing();
                $expected = $data['expectedStock'] ?? null;
                if (!is_int($expected) || $expected < 0 || $expected > 1000000) Http::invalid('Vui lòng mở lại sản phẩm để chỉnh sửa.');
                $changesStock = $data['stock'] !== $expected;
                if ($changesStock && $previous['stock'] !== $expected) {
                    throw new ApiError(409, 'STOCK_CHANGED', 'Tồn kho đã thay đổi. Hãy tải lại trang trước khi sửa.');
                }
                $path = $cover === null ? $previous['cover_path'] :
                    '/api/catalog/books/' . $id . '/cover?v=' . bin2hex(random_bytes(8));
                $this->db->run('UPDATE books SET title=?,price=?,stock=?,catalog=?,cover_path=?,cover_base64=? WHERE id=?',
                    [$title, $data['price'], $changesStock ? $data['stock'] : $previous['stock'], $json, $path,
                        $cover ?? $previous['cover_base64'], $id]);
            }
            return $this->product($this->book($id));
        });
    }

    public function remove(string $id): void
    {
        if (!$this->db->run('UPDATE books SET active=0 WHERE id=? AND active=1', [$id])->rowCount()) {
            $this->missing();
        }
    }

    private function missing(): never
    {
        throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Không tìm thấy sản phẩm.');
    }
}
