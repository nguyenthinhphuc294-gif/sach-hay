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
        if (!$this->one("SELECT name FROM sqlite_master WHERE name='schema_ready'")) {
            $this->write(function (): void {
                if ($this->one("SELECT name FROM sqlite_master WHERE name='schema_ready'")) return;
                $this->exec(file_get_contents(dirname(__DIR__) . '/schema.sql'));
                $seed = dirname(__DIR__) . '/demo-books.json';
                if (!is_file($seed)) $seed = dirname(__DIR__, 2) . '/server/checkout/demo-books.json';
                $books = json_decode(file_get_contents($seed), true, 512, JSON_THROW_ON_ERROR);
                foreach ($books as $book) {
                    $this->run('INSERT INTO books(id,title,price,stock,sold_count,cover_path) VALUES(?,?,?,?,?,?)', [
                        $book['id'], $book['title'], $book['price'], $book['stock'], $book['soldCount'] ?? 0, $book['coverImage'],
                    ]);
                }
                $now = time();
                foreach ([['SACHHAY20K','fixed',20000,150000,null], ['GIAM15','percentage',15,300000,60000],
                    ['FREESHIP','shipping',25000,100000,null]] as $voucher) {
                    $this->run('INSERT INTO vouchers(code,kind,value,minimum,cap,valid_from,valid_until) VALUES(?,?,?,?,?,?,?)',
                        [...$voucher, $now, $now + 365 * 86400]);
                }
                $this->exec('CREATE TABLE schema_ready (version INTEGER NOT NULL)');
                $this->exec('INSERT INTO schema_ready VALUES (1)');
            });
        }
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
