import sqlite3
import os

db_path = r'c:\Users\USER\Desktop\SHIRO IT\backend\shiroit.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.execute("PRAGMA table_info(prebuilt_pcs)")
    cols = [row[1] for row in cursor.fetchall()]
    print("Columns:", cols)
    conn.close()
else:
    print("DB not found")
