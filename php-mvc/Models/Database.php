<?php
declare(strict_types=1);

final class Database extends PDO
{
    public function __construct()
    {
        $file = getenv('SACHHAY_DB_FILE') ?: dirname(__DIR__) . '/storage/sachhay.sqlite';
        $directory = dirname($file);
        if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
            throw new RuntimeException('Cannot create private database directory');
        }
        parent::__construct('sqlite:' . $file, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $this->exec('PRAGMA busy_timeout=5000');
        $this->exec('PRAGMA foreign_keys=ON');
        $this->sqliteCreateFunction('sachhay_lower', static fn(string $value): string => mb_strtolower($value, 'UTF-8'), 1);
        $ready = $this->one("SELECT name FROM sqlite_master WHERE name='schema_ready'");
        if (!$ready || $this->one('SELECT version FROM schema_ready')['version'] < 3) {
            $this->write(function (): void {
                if (!$this->one("SELECT name FROM sqlite_master WHERE name='schema_ready'")) {
                    $this->install();
                }
                $version = $this->one('SELECT version FROM schema_ready')['version'];
                if ($version < 2) {
                    $details = json_decode(file_get_contents(dirname(__DIR__) . '/book-metadata.json'), true, 64, JSON_THROW_ON_ERROR);
                    foreach ($details as $id => $book) {
                        $this->run('UPDATE books SET catalog=? WHERE id=? AND catalog IS NULL',
                            [json_encode($book, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),$id]);
                    }
                }
                if ($version < 3) {
                    $this->exec('CREATE TABLE IF NOT EXISTS newsletter_subscribers (email TEXT PRIMARY KEY, created_at TEXT NOT NULL)');
                    $this->exec('UPDATE schema_ready SET version=3');
                }
            });
        }
    }

    private function install(): void
    {
        $this->exec(file_get_contents(dirname(__DIR__) . '/schema.sql'));
        $seed = dirname(__DIR__) . '/demo-books.json';
        $books = json_decode(file_get_contents($seed), true, 512, JSON_THROW_ON_ERROR);
        foreach ($books as $book) {
            $this->run('INSERT INTO books(id,title,price,stock,sold_count,cover_path) VALUES(?,?,?,?,?,?)', [
                $book['id'], $book['title'], $book['price'], $book['stock'], $book['soldCount'] ?? 0, $book['coverImage'],
            ]);
        }
        $now = time();
        $seedVouchers = [
            ['SACHHAY20K', 'fixed', 20000, 150000, null],
            ['GIAM15', 'percentage', 15, 300000, 60000],
            ['FREESHIP', 'shipping', 25000, 100000, null],
            ['FREESHIP0D', 'shipping', 25000, 0, null],
            ['FREESHIP50K', 'shipping', 25000, 50000, null],
            ['SHIP0DONG', 'shipping', 25000, 70000, null],
            ['FREESHIPXTRA', 'shipping', 35000, 150000, null],
            ['SHIPTIETKIEM', 'shipping', 20000, 80000, null],
            ['FREESHIPVIP', 'shipping', 40000, 200000, null],
            ['FREESHIPCUOITUAN', 'shipping', 25000, 99000, null],
            ['FREESHIPHOATOC', 'shipping', 30000, 180000, null],
            ['SHIP24H', 'shipping', 25000, 120000, null],
            ['FREESHIPDONGNAI', 'shipping', 25000, 50000, null],
            ['FREESHIPHCM', 'shipping', 25000, 50000, null],
            ['FREESHIPHN', 'shipping', 25000, 50000, null],
            ['FREESHIPMIENTAY', 'shipping', 25000, 80000, null],
            ['FREESHIPMIENTRUNG', 'shipping', 25000, 80000, null],
            ['SHIPTOANQUOC', 'shipping', 25000, 100000, null],
            ['FREESHIPPLUS', 'shipping', 30000, 160000, null],
            ['BANMOI10', 'percentage', 10, 80000, 30000],
            ['GIAM5', 'percentage', 5, 100000, 25000],
            ['GIAM8', 'percentage', 8, 120000, 35000],
            ['GIAM10', 'percentage', 10, 150000, 40000],
            ['GIAM12', 'percentage', 12, 180000, 50000],
            ['GIAM18', 'percentage', 18, 250000, 70000],
            ['GIAM20', 'percentage', 20, 300000, 80000],
            ['GIAM25', 'percentage', 25, 400000, 100000],
            ['GIAM30', 'percentage', 30, 500000, 120000],
            ['HOIVIEN15', 'percentage', 15, 200000, 60000],
            ['SINHNHAT20', 'percentage', 20, 150000, 70000],
            ['TRIAN10', 'percentage', 10, 130000, 45000],
            ['SACH10K', 'fixed', 10000, 79000, null],
            ['SACH15K', 'fixed', 15000, 110000, null],
            ['SACH25K', 'fixed', 25000, 170000, null],
            ['SACH30K', 'fixed', 30000, 210000, null],
            ['SACH40K', 'fixed', 40000, 260000, null],
            ['SACH50K', 'fixed', 50000, 320000, null],
            ['SACH70K', 'fixed', 70000, 450000, null],
            ['SACH100K', 'fixed', 100000, 650000, null],
            ['KINHTE20K', 'fixed', 20000, 140000, null],
            ['VANHOC15K', 'fixed', 15000, 120000, null],
            ['KYNANG25K', 'fixed', 25000, 160000, null],
            ['THIEUNHI15K', 'fixed', 15000, 100000, null],
        ];
        foreach ($seedVouchers as $voucher) {
            $this->run('INSERT INTO vouchers(code,kind,value,minimum,cap,valid_from,valid_until,max_uses,max_per_user) VALUES(?,?,?,?,?,?,?,?,?)',
                [...$voucher, $now, $now + 365 * 86400, 1000, 10]);
        }
        $this->exec('CREATE TABLE schema_ready (version INTEGER NOT NULL)');
        $this->exec('INSERT INTO schema_ready VALUES (1)');
    }

    public function run(string $sql, array $args = []): PDOStatement
    {
        $statement = $this->prepare($sql);
        foreach (array_values($args) as $index => $value) {
            $type = match (true) { $value === null => PDO::PARAM_NULL, is_int($value) => PDO::PARAM_INT, default => PDO::PARAM_STR };
            $statement->bindValue($index + 1, $value, $type);
        }
        $statement->execute();
        return $statement;
    }

    public function one(string $sql, array $args = []): ?array
    {
        return $this->run($sql, $args)->fetch() ?: null;
    }

    public function write(callable $operation): mixed
    {
        // Take the writer lock before reading stock, voucher counters, or request keys.
        $this->exec('BEGIN IMMEDIATE');
        try {
            $result = $operation();
            $this->exec('COMMIT');
            return $result;
        } catch (Throwable $error) {
            $this->exec('ROLLBACK');
            throw $error;
        }
    }
}
