import sqlite3
import os

db_path = 'shiroit.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute("SELECT * FROM site_settings").fetchall()
        print("--- SITE SETTINGS ---")
        for r in rows:
            print(f"{r['key']}: {r['value']}")
    except Exception as e:
        print(f"Error: {e}")
    conn.close()
else:
    print(f"DB not found at {db_path}")
