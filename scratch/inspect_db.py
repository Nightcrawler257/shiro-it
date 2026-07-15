import sqlite3
import json

db_path = r"c:\Users\USER\Desktop\SHIRO IT\backend\shiroit.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row['name'] for row in cur.fetchall()]
print("Tables:")
for table in tables:
    count = conn.execute(f"SELECT count(*) FROM [{table}]").fetchone()[0]
    print(f"  {table}: {count} rows")

print("\nPC Components:")
components = conn.execute("SELECT * FROM pc_components").fetchall()
for comp in components:
    print(dict(comp))

print("\nPrebuilt PCs:")
prebuilts = conn.execute("SELECT * FROM prebuilt_pcs").fetchall()
for pb in prebuilts:
    print(dict(pb))
