CREATE TABLE books (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, price INTEGER NOT NULL CHECK(price >= 0),
    stock INTEGER NOT NULL CHECK(stock >= 0), sold_count INTEGER NOT NULL DEFAULT 0 CHECK(sold_count >= 0),
    active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), cover_path TEXT NOT NULL,
    cover_base64 TEXT, catalog TEXT, created_at TEXT
);
CREATE INDEX books_catalog ON books(active, created_at);
CREATE TABLE customers (
    id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL
);
CREATE TABLE vouchers (
    code TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('fixed','percentage','shipping')),
    value INTEGER NOT NULL CHECK(value > 0), minimum INTEGER NOT NULL CHECK(minimum >= 0), cap INTEGER,
    active INTEGER NOT NULL DEFAULT 1, valid_from INTEGER NOT NULL, valid_until INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0, max_uses INTEGER DEFAULT 100, max_per_user INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE voucher_uses (
    code TEXT NOT NULL REFERENCES vouchers(code), customer_id TEXT NOT NULL REFERENCES customers(id),
    used INTEGER NOT NULL CHECK(used > 0), PRIMARY KEY(code,customer_id)
);
CREATE TABLE orders (
    id TEXT PRIMARY KEY, request_key TEXT NOT NULL UNIQUE, request_hash TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id), owner_key TEXT NOT NULL,
    order_code TEXT NOT NULL UNIQUE, payment_method TEXT NOT NULL CHECK(payment_method IN ('COD','STORE_PICKUP','BANK_TRANSFER')),
    total INTEGER NOT NULL CHECK(total >= 0), payload TEXT NOT NULL,
    bank TEXT, payment_token_hash TEXT, payment_status TEXT, paid_at TEXT, created_at TEXT NOT NULL
);
CREATE INDEX orders_customer ON orders(customer_id, created_at);
CREATE TABLE sepay_events (
    id TEXT PRIMARY KEY, order_code TEXT, amount INTEGER NOT NULL, result TEXT NOT NULL, transferred_at TEXT NOT NULL
);
CREATE TABLE contacts (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE request_limits (
    bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX request_limits_expiry ON request_limits(expires_at);
