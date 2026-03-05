"""
Shared Flask extensions for SHIRO IT backend.
Import from here instead of app.py to avoid circular imports.
"""

from flask_pymongo import PyMongo

mongo = PyMongo()
