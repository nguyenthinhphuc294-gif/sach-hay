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

SERIES_CONFIG = [
    {
        "name": "Doraemon",
        "author": "Fujiko F. Fujio",
        "publisher": "NXB Kim Đồng",
        "queries": ["doraemon tập", "truyện tranh doraemon", "doraemon truyện dài tập", "doraemon bóng chày tập", "doraemon màu"]
    },
    {
        "name": "One Piece",
        "author": "Eiichiro Oda",
        "publisher": "NXB Kim Đồng",
        "queries": ["one piece tập", "truyện tranh one piece", "one piece bìa áo", "one piece đại chiến"]
    },
    {
        "name": "7 Viên Ngọc Rồng (Dragon Ball)",
        "author": "Akira Toriyama",
        "publisher": "NXB Kim Đồng",
        "queries": ["dragon ball tập", "7 viên ngọc rồng tập", "dragon ball super tập", "7 viên ngọc rồng kim đồng"]
    },
    {
        "name": "Naruto",
        "author": "Masashi Kishimoto",
        "publisher": "NXB Kim Đồng",
        "queries": ["naruto tập", "truyện tranh naruto", "naruto tái bản tập", "naruto đại chiến"]
    }
]

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

def main():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()

    # Get current max id number
    cur.execute("SELECT id FROM books")
    existing_ids = [row[0] for row in cur.fetchall()]
    max_num = 0
    for bid in existing_ids:
        if bid.startswith("book-"):
            try:
                num = int(bid.split("-")[1])
                if num > max_num:
                    max_num = num
            except:
                pass
    
    # Get existing titles to prevent duplicates
    cur.execute("SELECT title FROM books")
    existing_titles = set(row[0] for row in cur.fetchall())

    new_books = []
    new_metadata = {}
    new_demo = []

    cat_name = "Manga Huyền Thoại"
    cat_id = "cat-manga-huyen-thoai"

    for series in SERIES_CONFIG:
        s_name = series["name"]
        print(f"Collecting 50 real volumes for {s_name}...")
        collected = {}
        for q in series["queries"]:
            for page in range(1, 6):
                if len(collected) >= 50:
                    break
                items = curl_tiki(q, limit=40, page=page)
                for it in items:
                    raw_name = it.get("name", "").strip()
                    img = it.get("thumbnail_url", "")
                    price = it.get("price", 0)
                    if raw_name and img and price > 0 and "tikicdn.com" in img:
                        title = clean_title(raw_name)
                        if title not in collected and title not in existing_titles:
                            img_highres = img.replace("/280x280/", "/750x750/")
                            orig_price = it.get("original_price") or int(price * 1.25)
                            collected[title] = {
                                "title": title,
                                "img": img_highres,
                                "price": price,
                                "orig_price": orig_price,
                                "author": series["author"],
                                "publisher": series["publisher"]
                            }
                            if len(collected) >= 50:
                                break
        
        print(f" -> Found {len(collected)} real volumes for {s_name}.")
        
        for p in collected.values():
            max_num += 1
            book_id = f"book-{max_num:03d}"
            isbn = f"978-604-{random.randint(100,999)}-{random.randint(100,999)}-{random.randint(0,9)}"
            stock = random.randint(30, 220)
            sold_count = random.randint(150, 9900)
            
            desc = (f"Tác phẩm truyện tranh kinh điển '{p['title']}' thuộc series huyền thoại {s_name}. "
                    f"Tác giả: {p['author']}, bản quyền tiếng Việt chính thức bởi {p['publisher']}. "
                    f"Hình ảnh thật được chụp thực tế từ tập truyện phát hành chính hãng.")

            cat_info = {
                "author": p["author"],
                "publisher": p["publisher"],
                "isbn": isbn,
                "categoryName": cat_name,
                "categoryId": cat_id,
                "description": desc,
                "originalPrice": p["orig_price"]
            }

            new_books.append({
                "id": book_id,
                "title": p["title"],
                "price": p["price"],
                "stock": stock,
                "sold_count": sold_count,
                "cover_path": p["img"],
                "catalog": json.dumps(cat_info, ensure_ascii=False),
                "created_at": "2026-11-11 14:00:00"
            })

            new_metadata[book_id] = cat_info
            new_demo.append({
                "id": book_id,
                "title": p["title"],
                "price": p["price"],
                "stock": stock,
                "soldCount": sold_count,
                "coverImage": p["img"]
            })
            existing_titles.add(p["title"])

    print(f"\nTotal new items to insert in '{cat_name}': {len(new_books)}")

    # Insert into database
    cur.executemany("""
        INSERT INTO books (id, title, price, stock, sold_count, active, cover_path, catalog, created_at)
        VALUES (:id, :title, :price, :stock, :sold_count, 1, :cover_path, :catalog, :created_at)
    """, new_books)
    conn.commit()

    # Update JSON files
    with open(META_FILE, "r", encoding="utf-8") as f:
        meta_all = json.load(f)
    meta_all.update(new_metadata)
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(meta_all, f, ensure_ascii=False, indent=2)

    with open(DEMO_FILE, "r", encoding="utf-8") as f:
        demo_all = json.load(f)
    demo_all.extend(new_demo)
    with open(DEMO_FILE, "w", encoding="utf-8") as f:
        json.dump(demo_all, f, ensure_ascii=False, indent=2)

    print("Updated metadata and demo JSON files.")

    cur.execute("SELECT json_extract(catalog, '$.categoryName') as cat, COUNT(*) FROM books GROUP BY cat")
    print("\n--- Final Category Breakdown in Database ---")
    for r in cur.fetchall():
        print(f"  {r[0]}: {r[1]} sản phẩm")

    cur.execute("SELECT COUNT(*) FROM books")
    print(f"\nTổng cộng sản phẩm trong toàn bộ hệ thống: {cur.fetchone()[0]}")
    conn.close()

if __name__ == "__main__":
    main()
