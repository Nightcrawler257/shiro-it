import sys
import os

# Append current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import mongo

NEW_DATA = [
    # CPUs
    {"name": "AMD Ryzen 5 5600G", "category": "CPU", "price": 0, "stock": 1, "featured": True, "specs": "AMD"},
    {"name": "Intel Core i5-12400F", "category": "CPU", "price": 0, "stock": 1, "featured": False, "specs": "Intel"},
    {"name": "Intel Core i5-13400F", "category": "CPU", "price": 0, "stock": 1, "featured": True, "specs": "Intel"},
    {"name": "Intel Core i7-14700K", "category": "CPU", "price": 0, "stock": 1, "featured": True, "specs": "Intel"},

    # Motherboards
    {"name": "ASRock H810M-X Gen 5 WiFi 6", "category": "Motherboard", "price": 650, "stock": 1, "featured": True, "specs": "LGA1851 | WiFi 6 | Gen 5", "image": "images/asrock_h810m_x.jpg"},
    {"name": "MSI A520M-A Pro", "category": "Motherboard", "price": 350, "stock": 1, "featured": False, "specs": "AM4 | DDR4"},
    {"name": "MSI B550M-A Pro", "category": "Motherboard", "price": 480, "stock": 1, "featured": True, "specs": "AM4 | DDR4"},
    {"name": "Gigabyte A620M H", "category": "Motherboard", "price": 550, "stock": 1, "featured": False, "specs": "AM5 | DDR5"},

    # RAM Desktop
    {"name": "Apacer 16GB DDR4 3200MHz", "category": "RAM", "price": 185, "stock": 1, "featured": True, "specs": "DDR4 | 3200MHz"},
    {"name": "Apacer 32GB DDR5 5600MHz", "category": "RAM", "price": 460, "stock": 1, "featured": True, "specs": "DDR5 | 5600MHz"},
    {"name": "Lexar 16GB DDR4 3200MHz", "category": "RAM", "price": 175, "stock": 3, "featured": False, "specs": "DDR4 | 3200MHz"},
    {"name": "Acer 16GB DDR5 5600MHz", "category": "RAM", "price": 290, "stock": 1, "featured": False, "specs": "DDR5 | 5600MHz"},

    # RAM Laptop
    {"name": "Value RAM 8GB DDR4 2666MHz SODIMM", "category": "RAM Laptop", "price": 120, "stock": 5, "featured": False},
    {"name": "Value RAM 8GB DDR4 3200MHz SODIMM", "category": "RAM Laptop", "price": 135, "stock": 3, "featured": False},
    {"name": "Value RAM 16GB DDR4 2666MHz SODIMM", "category": "RAM Laptop", "price": 240, "stock": 1, "featured": False},
    {"name": "Value RAM 16GB DDR5 5600MHz SODIMM", "category": "RAM Laptop", "price": 320, "stock": 5, "featured": True},

    # Storage
    {"name": "Apacer 240GB SATA SSD", "category": "Storage", "price": 95, "stock": 1, "featured": False, "specs": "SATA SSD", "health": "100%"},
    {"name": "Skynix 512GB SATA SSD", "category": "Storage", "price": 140, "stock": 1, "featured": False, "specs": "SATA SSD", "health": "100%"},
    {"name": "Semsotai 120GB SATA SSD", "category": "Storage", "price": 45, "stock": 1, "featured": False, "specs": "SATA SSD", "health": "98%"},
    {"name": "Kingston 480GB SATA SSD", "category": "Storage", "price": 130, "stock": 1, "featured": True, "specs": "SATA SSD", "health": "100%"},
    {"name": "Gigabyte 256GB SATA SSD", "category": "Storage", "price": 85, "stock": 1, "featured": True, "specs": "SATA SSD", "health": "100%"},
    {"name": "Samsung 990 Pro 1TB NVMe", "category": "Storage", "price": 480, "stock": 24, "featured": True, "specs": "NVMe M.2", "health": "100%"},
    {"name": "Samsung 990 Pro 2TB NVMe", "category": "Storage", "price": 860, "stock": 2, "featured": True, "specs": "NVMe M.2", "health": "100%"},

    # GPUs
    {"name": "Nvidia iGame GeForce RTX 3070 Ultra W OC LHR", "category": "GPU", "price": 2250, "stock": 1, "featured": True, "specs": "NVIDIA | White"},
    {"name": "Nvidia iGame GeForce RTX 3070 Advanced LHR", "category": "GPU", "price": 2150, "stock": 2, "featured": False, "specs": "NVIDIA"},
    {"name": "PNY Nvidia GeForce RTX 5070 12GB", "category": "GPU", "price": 3499, "stock": 1, "featured": True, "specs": "NVIDIA | Next-Gen"},
    {"name": "Colorful BattleAX GeForce RTX 5060 Ti 16GB", "category": "GPU", "price": 2399, "stock": 1, "featured": False, "specs": "NVIDIA"},
    {"name": "MSI Nvidia Shadow 2X 8GB GeForce RTX 5060", "category": "GPU", "price": 1699, "stock": 1, "featured": False, "specs": "NVIDIA"},
    {"name": "Gigabyte GeForce RTX 5050 8GB", "category": "GPU", "price": 1150, "stock": 1, "featured": False, "specs": "NVIDIA"},
    {"name": "Asus AMD Radeon RX 9060 XT", "category": "GPU", "price": 1450, "stock": 1, "featured": False, "specs": "AMD"},

    # Case & PSU
    {"name": "Segotep Brave W1 Black", "category": "Case", "price": 180, "stock": 5, "featured": True, "specs": "Mid-Tower"},
    {"name": "Segotep Brave W1 White", "category": "Case", "price": 190, "stock": 3, "featured": True, "specs": "Mid-Tower"},
    {"name": "Segotep Lumi 3T White", "category": "Case", "price": 220, "stock": 2, "featured": False, "specs": "ARGB Tower"},
    {"name": "Segotep Endro Pro+ Black", "category": "Case", "price": 165, "stock": 8, "featured": False, "specs": "Mid-Tower"},
    {"name": "Inovasion Case Gaming Black", "category": "Case", "price": 150, "stock": 4, "featured": False, "specs": "Gaming Case"},
    {"name": "NZXT H5 Flow Black", "category": "Case", "price": 380, "stock": 2, "featured": True, "specs": "Mid-Tower"},
    {"name": "Lian Li O11 Dynamic EVO", "category": "Case", "price": 750, "stock": 1, "featured": False, "specs": "Premium Tower"},
    {"name": "1stPlayer Trilobite T3 Black", "category": "Case", "price": 135, "stock": 10, "featured": False, "specs": "M-ATX Case"},
    
    # Power Supplies
    {"name": "Corsair RM850e 850W Gold", "category": "PSU", "price": 580, "stock": 3, "featured": True, "specs": "Fully Modular"},
    {"name": "Segotep AN650W 80+", "category": "PSU", "price": 180, "stock": 5, "featured": False, "specs": "Power Supply"},
    {"name": "SilverStone 650W 80+ Bronze", "category": "PSU", "price": 280, "stock": 5, "featured": False, "specs": "Essential Power"},
    {"name": "1stPlayer Black.Sir 500W 80+", "category": "PSU", "price": 125, "stock": 15, "featured": False, "specs": "Value PSU"},

    # Coolers & AIO Fans
    {"name": "Thermalright Frozen Warframe 360 Black ARGB", "category": "AIO Cooling", "price": 450, "stock": 2, "featured": True, "specs": "360mm AIO | LCD | ARGB"},
    {"name": "Thermalright Peerless Assassin 120", "category": "Cooling", "price": 180, "stock": 3, "featured": True, "specs": "Air Cooler"},
    {"name": "Jonsbo CR-1000 EVO Cooler Fan", "category": "Cooling", "price": 85, "stock": 3, "featured": False, "specs": "Air Cooler"},
    {"name": "DeepCool AK400 Cooler Fan", "category": "Cooling", "price": 120, "stock": 4, "featured": False, "specs": "Air Cooler"},
    {"name": "Generic 120mm RGB Case Fan", "category": "Case Fan", "price": 25, "stock": 10, "featured": False, "specs": "Case Fan"},

    # Monitors
    {"name": "AOC AGON AG275QZN 27\" IPS 2K 260Hz QHD", "category": "Monitor", "price": 1450, "stock": 1, "featured": True, "specs": "IPS | 0.5ms | 1440p"},
    {"name": "MSI G244F E2 24\" 180Hz G-Sync", "category": "Monitor", "price": 540, "stock": 4, "featured": True, "specs": "IPS | 1ms | 1080p"},
    {"name": "Samsung Odyssey G5 27\" 144Hz WQHD", "category": "Monitor", "price": 1250, "stock": 2, "featured": True, "specs": "VA | 1ms | 1440p"},
    {"name": "Acer Nitro 21.5\" 75Hz Full HD", "category": "Monitor", "price": 320, "stock": 8, "featured": False, "specs": "IPS | 1080p"},
    {"name": "Gigabyte G27F 27\" 165Hz Full HD", "category": "Monitor", "price": 780, "stock": 3, "featured": False, "specs": "IPS | 1080p"},

    # Keyboards
    {"name": "Logitech G Pro X Mechanical TKL", "category": "Keyboard", "price": 450, "stock": 3, "featured": True, "specs": "GX Blue/Red/Brown"},
    {"name": "Razer BlackWidow V4 Pro", "category": "Keyboard", "price": 780, "stock": 2, "featured": False, "specs": "Mechanical | RGB"},
    {"name": "Tecware Phantom 87 TKL RGB", "category": "Keyboard", "price": 165, "stock": 10, "featured": True, "specs": "Mechanical | Gateron"},
    {"name": "Ducky One 3 Daybreak TKL", "category": "Keyboard", "price": 420, "stock": 1, "featured": False, "specs": "Cherry MX"},

    # Mice
    {"name": "Logitech G102 Lightsync Gaming Mouse", "category": "Mouse", "price": 89, "stock": 15, "featured": False, "specs": "8000 DPI | RGB"},
    {"name": "Logitech G502 X Plus Wireless", "category": "Mouse", "price": 580, "stock": 3, "featured": True, "specs": "LIGHTSPEED | 25K HERO"},
    {"name": "Razer DeathAdder V3 Pro", "category": "Mouse", "price": 590, "stock": 2, "featured": True, "specs": "Optical Gen-3 | 30K"},
    {"name": "SteelSeries Rival 3 Wireless", "category": "Mouse", "price": 185, "stock": 6, "featured": False, "specs": "Dual Wireless"},

    # CPUs
    {"name": "Intel Core Ultra 5 245KF", "category": "CPU", "price": 1350, "stock": 1, "featured": True, "specs": "14 Core | 14 Thread | LGA1851"},
    {"name": "AMD Ryzen 5 5600G", "category": "CPU", "price": 580, "stock": 5, "featured": True, "specs": "6C/12T | iGPU"},


    # PSUs
    {"name": "MSI MPG A850G PCIE5 850W 80+ Gold", "category": "PSU", "price": 650, "stock": 2, "featured": True, "specs": "ATX 3.0 | Fully Modular"},
    {"name": "Corsair RM850e 850W Gold", "category": "PSU", "price": 580, "stock": 3, "featured": True, "specs": "Fully Modular"},

    # Accessories
    {"name": "ZT32 HDMI Cable 3m", "category": "Accessories", "price": 25, "stock": 10, "featured": False, "specs": "4K | Gold-Plated"},
    {"name": "ZT170 DP to DP Cable 1.8m", "category": "Accessories", "price": 35, "stock": 5, "featured": False, "specs": "DisplayPort 1.4"},
    {"name": "Laptop 2 Pin Power Cable (ZT45/ZT44)", "category": "Accessories", "price": 15, "stock": 15, "featured": False, "specs": "Power Cord"},
    {"name": "ZT21 VGA to HDMI Converter", "category": "Accessories", "price": 45, "stock": 5, "featured": False, "specs": "Adapter"},
    {"name": "ZT30 HDMI Cable 3m", "category": "Accessories", "price": 25, "stock": 10, "featured": False, "specs": "1080p | 4K Support"},
    {"name": "ZL50 2nd HDD Caddy 9mm", "category": "Accessories", "price": 40, "stock": 3, "featured": False, "specs": "Laptop Drive Bay"},
    {"name": "GameSir Nova Lite Wireless Controller", "category": "Accessories", "price": 150, "stock": 2, "featured": True, "specs": "Multi-Platform"},
    {"name": "Logitech C922 Pro HD Stream Webcam", "category": "Accessories", "price": 380, "stock": 1, "featured": True, "specs": "1080p | 60FPS"},
    {"name": "SteelSeries Mouse Bungee", "category": "Accessories", "price": 95, "stock": 2, "featured": False, "specs": "Cable Management"},
    {"name": "Ugreen 5-in-1 USB-C Hub", "category": "Accessories", "price": 120, "stock": 3, "featured": True, "specs": "Multifunction Adapter"},
    {"name": "BT 5.3 Wireless Adapter", "category": "Accessories", "price": 35, "stock": 10, "featured": False, "specs": "Bluetooth 5.3 Dongle"},
    {"name": "Wireless Network Adapter", "category": "Accessories", "price": 45, "stock": 8, "featured": False, "specs": "WiFi Dongle"}
]

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        print("Clearing existing PC components from DB...")
        mongo.db.pc_components.delete_many({})
        print("Inserting new requested list of components...")
        mongo.db.pc_components.insert_many(NEW_DATA)
        print("Successfully inserted %d items." % len(NEW_DATA))
