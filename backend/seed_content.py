import urllib.request
import json

base_url = 'http://localhost:5000/admin/api/'

# Initial Pre-built PCs
pcs = [
    {
        "tier_name": "ENTRY",
        "tier_badge": "Best Value",
        "name": "Phantom Lite",
        "price": 2499.00,
        "discount": "",
        "photo_url": "",
        "specs": ["RTX 4060", "Intel i5-14400F", "16GB DDR5", "512GB NVMe"],
        "tier_color": "#3388FF",
        "featured": False
    },
    {
        "tier_name": "MID",
        "tier_badge": "Most Popular",
        "name": "Phantom Pro",
        "price": 4999.00,
        "discount": "",
        "photo_url": "",
        "specs": ["RTX 4070 Super", "AMD Ryzen 7 7800X3D", "32GB DDR5", "1TB NVMe Gen4"],
        "tier_color": "#0066FF",
        "featured": True
    },
    {
        "tier_name": "HIGH-END",
        "tier_badge": "Ultimate Power",
        "name": "Phantom Ultra",
        "price": 8999.00,
        "discount": "",
        "photo_url": "",
        "specs": ["RTX 5080", "AMD Ryzen 9 9900X", "64GB DDR5", "2TB NVMe Gen5"],
        "tier_color": "#FF0033",
        "featured": False
    }
]

# Initial Tips (Since there are 22 videos, I'll seed a few that match the first cards)
tips = [
    {
        "title": "Types of computer cables",
        "description": "Learn the basics of computer cables and their uses.",
        "media_type": "video",
        "media_url": "video/PC 1 video.mp4",
        "tags": ["Hardware", "Cable"]
    },
    {
        "title": "Integrated Graphics vs Dedicated Graphics",
        "description": "A quick guide to finding the difference between integrated graphics and dedicated graphics.",
        "media_type": "video",
        "media_url": "video/Integrated Graphics vs Dedicated Graphics.mp4",
        "tags": ["Graphics"]
    },
    {
        "title": "Windows 11 Keyboard Shortcuts",
        "description": "Learn the basics of Windows 11 keyboard shortcuts.",
        "media_type": "video",
        "media_url": "video/Windows 11 Keyboard Shortcuts.mp4",
        "tags": ["Software", "Shortcuts"]
    },
    {
        "title": "Router vs Switch",
        "description": "Learn the difference between a router and a switch and when to use each.",
        "media_type": "video",
        "media_url": "video/PC 2 video .mp4",
        "tags": ["Networking"]
    }
]

# Write directly to mongo to avoid auth overhead for seed
import pymongo
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['shiro_it']

if db.prebuilt_pcs.count_documents({}) == 0:
    db.prebuilt_pcs.insert_many(pcs)
    print("Inserted PCs")
else:
    print("PCs exist")

if db.it_tips.count_documents({}) == 0:
    db.it_tips.insert_many(tips)
    print("Inserted Tips")
else:
    print("Tips exist")

db.site_settings.update_one({'_id': 'general_settings'}, {'$set': {'active_festival': 'none', 'tips_display_count': 0}}, upsert=True)
print("Seeding complete.")
