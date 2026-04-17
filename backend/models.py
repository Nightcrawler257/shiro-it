"""
Helper functions for SHIRO IT backend (SQLite version).
"""

import re

# Simple but effective email regex
_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


def is_valid_email(email):
    """Return True if the email address looks valid."""
    return bool(_EMAIL_RE.match(email))


def serialize_row(row):
    """Convert an sqlite3.Row or dict to a JSON-serializable dict."""
    if row is None:
        return None
    d = dict(row) if not isinstance(row, dict) else dict(row)
    # Convert SQLite integers used as booleans to proper Python bools
    for key in ('is_read', 'featured'):
        if key in d:
            d[key] = bool(d[key])
    return d


def serialize_rows(rows):
    """Convert a list of sqlite3.Row objects to JSON-serializable dicts."""
    return [serialize_row(r) for r in rows]
