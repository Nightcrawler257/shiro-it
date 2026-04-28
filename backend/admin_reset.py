"""
Reset or create the emergency admin account in SQLite.
Run THIS from a PythonAnywhere bash console:
  cd /home/Hareshhh/shiro-it/backend
  python admin_reset.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
import db
from werkzeug.security import generate_password_hash

# ── Emergency admin credentials ───────────
TARGET_USERNAME = "ShiroIT"
NEW_PASSWORD    = "REPLACE_WITH_YOUR_PASSWORD"   # change before running!
# ──────────────────────────────────────────

app = create_app()

with app.app_context():
    conn = db.get_conn()
    existing = conn.execute("SELECT id FROM staff_users WHERE username = ?", (TARGET_USERNAME,)).fetchone()
    
    if existing:
        conn.execute("UPDATE staff_users SET password = ? WHERE username = ?", 
                     (generate_password_hash(NEW_PASSWORD), TARGET_USERNAME))
        print(f"[OK] Password for '{TARGET_USERNAME}' has been reset to '{NEW_PASSWORD}'.")
    else:
        conn.execute("INSERT INTO staff_users (username, password) VALUES (?, ?)", 
                     (TARGET_USERNAME, generate_password_hash(NEW_PASSWORD)))
        print(f"[OK] Created new admin user '{TARGET_USERNAME}' with password '{NEW_PASSWORD}'.")
        
    conn.commit()
    conn.close()
