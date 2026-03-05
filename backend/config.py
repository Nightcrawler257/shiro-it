import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'shiro-it-secret-key-2026')
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/shiro_it?serverSelectionTimeoutMS=2000')
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB max file size
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

    # Admin credentials (change in production!)
    ADMIN_USERNAME = 'admin'
    ADMIN_PASSWORD = 'shiroadmin2026'
