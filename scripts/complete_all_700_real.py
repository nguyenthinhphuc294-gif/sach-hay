# -*- coding: utf-8 -*-
import subprocess
import json
import urllib.parse
import re
import sqlite3
import random
import os

DB_FILE = r"C:\Users\PHUC THINH\OneDrive\Tài liệu\ChatGPT\wed\sachhay\php-mvc\storage\sachhay.sqlite"
META_FILE = r"C:\Users\PHUC THINH\OneDrive\Tài liệu\ChatGPT\wed\sachhay\php-mvc\book-metadata.json"
DEMO_FILE = r"C:\Users\PHUC THINH\OneDrive\Tài liệu\ChatGPT\wed\sachhay\php-mvc\demo-books.json"

def curl_tiki(q, limit=40, page=1):
    encoded_q = urllib.parse.quote(q)
    url = f"https://tiki.vn/api/v2/products?limit={limit}&page={page}&q={encoded_q}"
    cmd = [
        "curl.exe", "-s",
        "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "-H", "Accept: application/json, text/plain, */*",
        "-H", f"Referer: https://tiki.vn/search?q={encoded_q}",
        url
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
        if res.stdout and res.stdout.strip().startswith("{"):
            d = json.loads(res.stdout)
            return d.get("data", [])
    except Exception as e:
        print(f"Error curling {q}: {e}")
    return []

def clean_title(title):
    t = re.sub(r'^(Sách\s*[-–:]*\s*|Combo\s*[-–:]*\s*|\[.*?\]\s*|\(.*?\)\s*)', '', title, flags=re.I)
    t = re.sub(r'\s*[-–:]\s*(Tặng kèm|Bản đặc biệt|Tái bản).*$', '', t, flags=re.I)
    t = re.sub(r'\s+', ' ', t).strip()
    return t or title.strip()

def fetch_items(queries, target_count, cat_name, cat_id, default_author, default_publisher, existing_titles=set()):
    collected = {}
    for q in queries:
        for page in range(1, 6):
            if len(collected) >= target_count:
                break
            items = curl_tiki(q, limit=40, page=page)
            for item in items:
                raw_name = item.get("name", "").strip()
                img = item.get("thumbnail_url", "")
                price = item.get("price", 0)
                if raw_name and img and price > 0 and "tikicdn.com" in img:
                    title = clean_title(raw_name)
                    if title not in collected and title not in existing_titles:
                        img_highres = img.replace("/280x280/", "/750x750/")
                        author = default_author
                        if item.get("authors"):
                            author = item["authors"][0].get("name", author)
                        elif item.get("brand_name"):
                            author = item["brand_name"]

                        orig_price = item.get("original_price") or price
                        if orig_price < price:
                            orig_price = int(price * 1.2)

                        collected[title] = {
                            "title": title,
                            "img": img_highres,
                            "price": price,
                            "orig_price": orig_price,
                            "author": author,
                            "publisher": default_publisher,
                            "categoryName": cat_name,
                            "categoryId": cat_id
                        }
                        if len(collected) >= target_count:
                            break
    return list(collected.values())[:target_count]

def main():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    # Load currently stored books from database
    cur.execute("SELECT id, title, price, stock, sold_count, cover_path, catalog, created_at FROM books ORDER BY id")
    rows = cur.fetchall()

    by_cat = {}
    all_titles = set()
    for row in rows:
        cat_data = json.loads(row[6])
        cname = cat_data["categoryName"]
        if cname not in by_cat:
            by_cat[cname] = []
        by_cat[cname].append({
            "title": row[1],
            "price": row[2],
            "stock": row[3],
            "sold_count": row[4],
            "img": row[5],
            "orig_price": cat_data.get("originalPrice", row[2]),
            "author": cat_data.get("author", ""),
            "publisher": cat_data.get("publisher", ""),
            "categoryName": cname,
            "categoryId": cat_data.get("categoryId", "")
        })
        all_titles.add(row[1])

    print("Existing categories loaded:")
    for k, v in by_cat.items():
        print(f"  {k}: {len(v)} items")

    # 1. Fill missing for 'Sách Ngoại Văn' (needs 25 more to reach 100)
    current_nv = by_cat.get("Sách Ngoại Văn", [])
    needed_nv = 100 - len(current_nv)
    if needed_nv > 0:
        print(f"\nFetching {needed_nv} more for Sách Ngoại Văn via curl...")
        new_nv = fetch_items(
            ["sách tiếng anh toeic", "sách tiếng anh ielts", "oxford bookworms library", "english novel penguin"],
            needed_nv, "Sách Ngoại Văn", "cat-ngoai-van", "International Author", "Oxford / Cambridge Press",
            all_titles
        )
        current_nv.extend(new_nv)
        by_cat["Sách Ngoại Văn"] = current_nv[:100]
        for item in new_nv:
            all_titles.add(item["title"])
        print(f"Sách Ngoại Văn now has: {len(by_cat['Sách Ngoại Văn'])} items.")

    # 2. Fill 100 for 'Văn Phòng Phẩm'
    current_vpp = by_cat.get("Văn Phòng Phẩm", [])
    needed_vpp = 100 - len(current_vpp)
    if needed_vpp > 0:
        print(f"\nFetching {needed_vpp} for Văn Phòng Phẩm via curl...")
        new_vpp = fetch_items(
            ["bút bi deli", "bút gel xóa được", "sổ tay campus", "dụng cụ học tập deli", "màu vẽ acrylic", "thước kẻ compa", "máy tính casio"],
            needed_vpp, "Văn Phòng Phẩm", "cat-van-phong-pham", "Deli / Thiên Long / Campus", "Tập Đoàn Thiên Long & Deli",
            all_titles
        )
        current_vpp.extend(new_vpp)
        by_cat["Văn Phòng Phẩm"] = current_vpp[:100]
        for item in new_vpp:
            all_titles.add(item["title"])
        print(f"Văn Phòng Phẩm now has: {len(by_cat['Văn Phòng Phẩm'])} items.")

    # Prepare final 700 products
    category_order = ["Văn Học", "Sách Kinh Tế", "Tâm Lý - Kỹ Năng", "Manga - Comic", "Sách Thiếu Nhi", "Sách Ngoại Văn", "Văn Phòng Phẩm"]
    final_books = []
    metadata = {}
    demo_books = []
    counter = 1

    for cat_name in category_order:
        items = by_cat.get(cat_name, [])[:100]
        print(f"Final {cat_name}: {len(items)} items")
        for it in items:
            book_id = f"book-{counter:03d}"
            isbn = f"978-604-{random.randint(100,999)}-{random.randint(100,999)}-{random.randint(0,9)}"
            stock = it.get("stock") or random.randint(25, 200)
            sold_count = it.get("sold_count") or random.randint(80, 9500)
            author = it.get("author") or "Chính Hãng"
            publisher = it.get("publisher") or "Nhà Xuất Bản / Nhà Sản Xuất"
            desc = (f"Sản phẩm '{it['title']}' chính hãng thuộc danh mục {cat_name}. "
                    f"Thương hiệu / Tác giả: {author}, cung cấp bởi {publisher}. "
                    f"Hình ảnh thật được chụp thực tế từ sản phẩm phân phối chính thức.")

            cat_info = {
                "author": author,
                "publisher": publisher,
                "isbn": isbn,
                "categoryName": cat_name,
                "categoryId": it["categoryId"],
                "description": desc,
                "originalPrice": it["orig_price"]
            }

            final_books.append({
                "id": book_id,
                "title": it["title"],
                "price": it["price"],
                "stock": stock,
                "sold_count": sold_count,
                "cover_path": it["img"],
                "catalog": json.dumps(cat_info, ensure_ascii=False),
                "created_at": "2026-11-11 12:00:00"
            })

            metadata[book_id] = cat_info
            demo_books.append({
                "id": book_id,
                "title": it["title"],
                "price": it["price"],
                "stock": stock,
                "soldCount": sold_count,
                "coverImage": it["img"]
            })
            counter += 1

    print(f"\nTotal products prepared: {len(final_books)}")

    # Write to database
    cur.execute("DELETE FROM books")
    cur.executemany("""
        INSERT INTO books (id, title, price, stock, sold_count, active, cover_path, catalog, created_at)
        VALUES (:id, :title, :price, :stock, :sold_count, 1, :cover_path, :catalog, :created_at)
    """, final_books)
    conn.commit()

    # Save JSON files
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    with open(DEMO_FILE, "w", encoding="utf-8") as f:
        json.dump(demo_books, f, ensure_ascii=False, indent=2)
    print("Saved JSON metadata and demo files.")

    cur.execute("SELECT json_extract(catalog, '$.categoryName') as cat, COUNT(*) FROM books GROUP BY cat")
    for r in cur.fetchall():
        print(f"  {r[0]}: {r[1]} sản phẩm")

    cur.execute("SELECT COUNT(*) FROM books")
    print(f"\nTổng cộng sản phẩm trong database: {cur.fetchone()[0]}")
    conn.close()

if __name__ == "__main__":
    main()
