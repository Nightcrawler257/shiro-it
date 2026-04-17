"""
Reset a staff user's password in MongoDB.
Run:  python reset_password.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import mongo
from werkzeug.security import generate_password_hash

# ── Change these as needed ──────────────────────────────
TARGET_USERNAME = "Doe"
NEW_PASSWORD    = "12345678"
# ────────────────────────────────────────────────────────

app = create_app()
with app.app_context():
    result = mongo.db.staff_users.update_one(
        {"username": TARGET_USERNAME},
        {"$set": {"password": generate_password_hash(NEW_PASSWORD)}}
    )
    if result.matched_count:
        print(f"[OK] Password for '{TARGET_USERNAME}' reset to '{NEW_PASSWORD}'")
    else:
        print(f"[ERROR] User '{TARGET_USERNAME}' not found in DB")
        print("Existing users:", [u["username"] for u in mongo.db.staff_users.find({}, {"username": 1, "_id": 0})])
