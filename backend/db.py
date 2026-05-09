"""
SQLite database module for SHIRO IT backend.
Replaces MongoDB/PyMongo with Python's built-in sqlite3.
No extra packages needed — works on PythonAnywhere free tier.
"""

import sqlite3
import os

_DB_PATH = None


def init_db(db_path):
    """Initialize the database at the given path and create all tables."""
    global _DB_PATH
    _DB_PATH = db_path
    _create_tables()


def get_conn():
    """Return a database connection with Row factory enabled."""
    if _DB_PATH is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    conn = sqlite3.connect(_DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")   # better concurrent reads
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def count(table, where=None, params=()):
    """Return COUNT(*) from a table with an optional WHERE clause."""
    sql = f"SELECT COUNT(*) FROM {table}"
    if where:
        sql += f" WHERE {where}"
    conn = get_conn()
    n = conn.execute(sql, params).fetchone()[0]
    conn.close()
    return n


# ---------------------------------------------------------------------------
# Table creation
# ---------------------------------------------------------------------------

def _create_tables():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS staff_users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT    UNIQUE NOT NULL,
            password TEXT    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS contact_messages (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT,
            email      TEXT,
            phone      TEXT,
            subject    TEXT,
            message    TEXT,
            is_read    INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
        );

        CREATE TABLE IF NOT EXISTS job_applications (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            name            TEXT,
            email           TEXT,
            phone           TEXT,
            position        TEXT,
            education       TEXT,
            experience      TEXT,
            cover_letter    TEXT,
            refs            TEXT,
            availability    TEXT,
            resume_filename TEXT,
            status          TEXT DEFAULT 'New',
            created_at      TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            name           TEXT,
            email          TEXT,
            phone          TEXT,
            service_type   TEXT,
            preferred_date TEXT,
            preferred_time TEXT,
            notes          TEXT,
            status         TEXT DEFAULT 'Pending',
            created_at     TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
        );

        CREATE TABLE IF NOT EXISTS quote_requests (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            name         TEXT,
            email        TEXT,
            phone        TEXT,
            build_config TEXT,
            total_price  REAL DEFAULT 0,
            notes        TEXT,
            status       TEXT DEFAULT 'New',
            created_at   TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
        );

        CREATE TABLE IF NOT EXISTS service_bookings (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            name                TEXT,
            email               TEXT,
            phone               TEXT,
            service_name        TEXT,
            preferred_date      TEXT,
            device_model        TEXT DEFAULT '',
            problem_description TEXT DEFAULT '',
            photo_url           TEXT DEFAULT '',
            notes               TEXT,
            status              TEXT DEFAULT 'New',
            created_at          TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
        );

        CREATE TABLE IF NOT EXISTS pc_components (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT    NOT NULL,
            category TEXT    NOT NULL,
            brand    TEXT    DEFAULT '',
            price    REAL    DEFAULT 0,
            specs    TEXT,
            badge    TEXT,
            stock    INTEGER DEFAULT 1,
            featured INTEGER DEFAULT 0,
            image    TEXT,
            health   TEXT
        );

        CREATE TABLE IF NOT EXISTS prebuilt_pcs (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            tier_name  TEXT,
            tier_badge TEXT,
            name       TEXT,
            price      TEXT,
            discount   TEXT,
            photo_url  TEXT,
            specs      TEXT,
            tier_color TEXT DEFAULT '#0066FF',
            featured   INTEGER DEFAULT 0,
            media_type TEXT DEFAULT 'image',
            tags       TEXT,
            display_style TEXT DEFAULT 'specs',
            pc_type    TEXT DEFAULT 'Standard Gaming PC'
        );

        CREATE TABLE IF NOT EXISTS it_tips (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT,
            description TEXT,
            media_type  TEXT DEFAULT 'video',
            media_url   TEXT,
            tags        TEXT
        );

        CREATE TABLE IF NOT EXISTS site_settings (
            key   TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS testimonials (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT,
            role       TEXT,
            content    TEXT,
            rating     INTEGER DEFAULT 5,
            image_url  TEXT
        );

        CREATE TABLE IF NOT EXISTS hero_slides (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT,
            subtitle    TEXT,
            media_type  TEXT DEFAULT 'image',
            media_url   TEXT,
            button_text TEXT DEFAULT 'Learn More',
            target_page TEXT DEFAULT 'home',
            order_index INTEGER DEFAULT 0
        );
    """)
    conn.commit()

    # --- Migrations: add new columns to existing tables safely ---
    _migrate(conn)

    conn.close()


def _migrate(conn):
    """Apply schema migrations for existing databases (idempotent)."""
    migrations = [
        # Add brand column to pc_components if not present
        'ALTER TABLE pc_components ADD COLUMN brand TEXT DEFAULT ""',
        # Add target_page column to it_tips for widget navigation
        'ALTER TABLE it_tips ADD COLUMN target_page TEXT DEFAULT "home"',
        # Add hero_slide_duration setting
        "INSERT OR IGNORE INTO site_settings (key, value) VALUES ('hero_slide_duration', '8')",
        # Add hero_display_limit setting
        "INSERT OR IGNORE INTO site_settings (key, value) VALUES ('hero_display_limit', '0')",
        # Add tips_display_count setting
        "INSERT OR IGNORE INTO site_settings (key, value) VALUES ('tips_display_count', '0')",
        # Add service booking detail columns
        "ALTER TABLE service_bookings ADD COLUMN device_model TEXT DEFAULT ''",
        "ALTER TABLE service_bookings ADD COLUMN problem_description TEXT DEFAULT ''",
        "ALTER TABLE service_bookings ADD COLUMN photo_url TEXT DEFAULT ''",
        # Add missing columns to prebuilt_pcs if not present
        "ALTER TABLE prebuilt_pcs ADD COLUMN tier_color TEXT DEFAULT '#0066FF'",
        "ALTER TABLE prebuilt_pcs ADD COLUMN featured INTEGER DEFAULT 0",
        "ALTER TABLE prebuilt_pcs ADD COLUMN media_type TEXT DEFAULT 'image'",
        "ALTER TABLE prebuilt_pcs ADD COLUMN tags TEXT DEFAULT ''",
        "ALTER TABLE prebuilt_pcs ADD COLUMN display_style TEXT DEFAULT 'specs'",
        "ALTER TABLE prebuilt_pcs ADD COLUMN pc_type TEXT DEFAULT 'Standard Gaming PC'",
    ]
    for sql in migrations:
        try:
            conn.execute(sql)
            conn.commit()
        except Exception:
            pass  # column / change already exists — safe to ignore
            
    # Seed testimonials if empty
    test_count = conn.execute("SELECT COUNT(*) FROM testimonials").fetchone()[0]
    if test_count == 0:
        seed_data = [
            ("Ahmad R.", "Gamer / Developer", "SHIRO IT built my dream PC perfectly. The cable management is incredible and games run flawlessly on Ultra. Recommended!", 5, ""),
            ("Sarah L.", "Content Creator", "Needed a reliable editing rig and they delivered. Fast rendering times and responsive service from start to finish.", 5, ""),
            ("Farid H.", "Student", "Affordable and transparent. Fixed my laptop right before assignments were due. Very grateful for their quick turnaround.", 4, ""),
            ("David T.", "Business Owner", "They handled our entire office network upgrade seamlessly. Zero downtime and great after-sales support.", 5, "")
        ]
        conn.executemany("INSERT INTO testimonials (name, role, content, rating, image_url) VALUES (?, ?, ?, ?, ?)", seed_data)
        conn.commit()

    # Seed prebuilt PCs if they don't exist
    import json
    entry_count = conn.execute("SELECT COUNT(*) FROM prebuilt_pcs WHERE tier_name = 'ENTRY'").fetchone()[0]
    if entry_count == 0:
        seed_pcs = [
            ("ENTRY", "Office Ready", "Essential Office PC", "1499.00", "", "", json.dumps(["Processor: AMD Ryzen 5 5600G", "Motherboard: A520M", "RAM: 16GB DDR4", "Storage: 512GB SSD", "Power Supply: 500W", "Case: X-FIVE CASE"]), "#3b82f6", 1, "image", json.dumps(["Office", "Everyday Use", "Value"]), "specs", "Office PC"),
            ("MAINSTREAM", "Best Seller", "Advanced Gaming PC", "3299.00", "", "", json.dumps(["Processor: Intel Core i5 10th Gen", "Motherboard: H410M", "RAM: 16GB DDR4", "Storage: 240GB SATA SSD", "Graphics: NVIDIA RTX 4060 8GB", "Power Supply: 550W 80Plus", "Case: Segotep Brave W1 (3x RGB Fans)"]), "#10b981", 1, "image", json.dumps(["Gaming", "1080p", "RGB"]), "specs", "Gaming PC"),
            ("HIGH-END", "Premium Build", "Elite Ultra Gaming PC", "5899.00", "", "", json.dumps(["Processor: Intel Core i5-13400F", "Motherboard: B760M WiFi", "RAM: 32GB DDR5 5600MHz", "Storage: 1TB NVMe M.2 Gen4 SSD", "Graphics: NVIDIA RTX 4070 12GB", "Power Supply: 750W 80Plus Gold", "Case: Lian Li Lancool 216 RGB"]), "#f59e0b", 1, "image", json.dumps(["1440p Gaming", "Enthusiast", "Performance"]), "specs", "Upgraded Gaming PC")
        ]
        conn.executemany("INSERT INTO prebuilt_pcs (tier_name, tier_badge, name, price, discount, photo_url, specs, tier_color, featured, media_type, tags, display_style, pc_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", seed_pcs)
        conn.commit()

    poster_count = conn.execute("SELECT COUNT(*) FROM prebuilt_pcs WHERE display_style = 'poster'").fetchone()[0]
    if poster_count == 0:
        seed_posters = [
            ("", "", "Office Pro Workstation", "1899.00", "", "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=80", "[]", "#0066FF", 1, "image", "[]", "poster", "Office PC"),
            ("", "", "Neon Strike RTX 4060", "3499.00", "", "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=80", "[]", "#0066FF", 1, "image", "[]", "poster", "Gaming PC"),
            ("", "", "Titan Xtreme RTX 4080", "8999.00", "", "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=600&q=80", "[]", "#0066FF", 1, "image", "[]", "poster", "Upgraded Gaming PC")
        ]
        conn.executemany("INSERT INTO prebuilt_pcs (tier_name, tier_badge, name, price, discount, photo_url, specs, tier_color, featured, media_type, tags, display_style, pc_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", seed_posters)
        conn.commit()

