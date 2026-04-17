import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY      = os.environ.get('SECRET_KEY', 'shiro-it-secret-key-2026')
    DATABASE_PATH   = os.environ.get('DATABASE_PATH', os.path.join(BASE_DIR, 'shiroit.db'))
    UPLOAD_FOLDER   = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024   # 100 MB — supports video uploads
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

    # Kept for backward-compat (no longer enforced in registration)
    STAFF_REGISTRATION_CODE = os.environ.get('STAFF_REGISTRATION_CODE', 'SHIRO-STAFF-2026')
