import sys
import os

# Append current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import mongo

INITIAL_DATA = [
    {"name": "Intel Core i5-14400F", "category": "CPU", "price": 699, "stock": 5, "featured": True},
    {"name": "AMD Ryzen 5 7600X", "category": "CPU", "price": 899, "stock": 5, "featured": False},
    {"name": "AMD Ryzen 7 7800X3D", "category": "CPU", "price": 1499, "stock": 2, "featured": True},
    {"name": "Intel Core i9-14900K", "category": "CPU", "price": 2499, "stock": 1, "featured": True},

    {"name": "NVIDIA RTX 4060 8GB", "category": "GPU", "price": 1299, "stock": 3, "featured": False},
    {"name": "NVIDIA RTX 4070 Super 12GB", "category": "GPU", "price": 2499, "stock": 2, "featured": True},
    {"name": "NVIDIA RTX 4090 24GB", "category": "GPU", "price": 8499, "stock": 1, "featured": True},

    {"name": "16GB DDR5-5200", "category": "RAM", "price": 249, "stock": 10, "featured": False},
    {"name": "32GB DDR5-6000 CL30", "category": "RAM", "price": 549, "stock": 5, "featured": True},

    {"name": "1TB NVMe Gen4", "category": "Storage", "price": 349, "stock": 8, "featured": True},
    {"name": "2TB NVMe Gen5", "category": "Storage", "price": 999, "stock": 2, "featured": False},

    {"name": "B650M (AMD, Micro-ATX)", "category": "Motherboard", "price": 499, "stock": 4, "featured": False},
    {"name": "Z790 (Intel, ATX)", "category": "Motherboard", "price": 999, "stock": 2, "featured": True},
    
    {"name": "Mid-Tower (Tempered Glass, White)", "category": "Case", "price": 349, "stock": 4, "featured": True},
    {"name": "750W 80+ Gold", "category": "PSU", "price": 399, "stock": 6, "featured": False},
    {"name": "360mm AIO Liquid", "category": "Cooling", "price": 499, "stock": 3, "featured": True},
]

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        count = mongo.db.pc_components.count_documents({})
        if count == 0:
            print("Seeding initial PC components...")
            mongo.db.pc_components.insert_many(INITIAL_DATA)
            print("Successfully inserted %d items." % len(INITIAL_DATA))
        else:
            print("Database already contains %d items. Skipping seed." % count)
