"""
MongoDB collections and helper functions for SHIRO IT backend.

Collections:
    - contact_messages
    - job_applications
    - appointments
    - quote_requests
    - service_bookings
"""

import re
from datetime import datetime
from bson import ObjectId

# Simple but effective email regex
_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


def is_valid_email(email):
    """Return True if email looks valid."""
    return bool(_EMAIL_RE.match(email))


def serialize_doc(doc):
    """Convert a MongoDB document to a JSON-serializable dict."""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    if 'created_at' in doc and isinstance(doc['created_at'], datetime):
        doc['created_at'] = doc['created_at'].strftime('%Y-%m-%d %H:%M:%S')
    return doc


def serialize_docs(cursor):
    """Convert a list of MongoDB documents to JSON-serializable dicts."""
    return [serialize_doc(doc) for doc in cursor]
