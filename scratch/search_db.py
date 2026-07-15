import sqlite3

db_path = r"c:\Users\USER\Desktop\SHIRO IT\backend\shiroit.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row['name'] for row in cur.fetchall()]

for table in tables:
    cur.execute(f"PRAGMA table_info([{table}])")
    columns = [col['name'] for col in cur.fetchall()]
    
    rows = conn.execute(f"SELECT * FROM [{table}]").fetchall()
    for row in rows:
        row_dict = dict(row)
        for col, val in row_dict.items():
            if val and any(term in str(val) for term in ["5500", "Ryzen"]):
                print(f"Table: {table}, Column: {col}, Row ID: {row_dict.get('id') or row_dict.get('key')}")
                print(f"  Value: {val}")
                print("-" * 40)
