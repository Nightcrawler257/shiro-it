import os
import json
from functools import wraps
from flask import Blueprint, request, jsonify, session, render_template, send_from_directory, current_app
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import db
from models import serialize_row, serialize_rows

admin_bp = Blueprint('admin', __name__)


# ---------------------------------------------------------------------------
# Auth decorator
# ---------------------------------------------------------------------------

def login_required(f):
    """Decorator to require admin login."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            if request.is_json or request.path.startswith('/admin/api/'):
                return jsonify({'success': False, 'error': 'Unauthorized'}), 401
            return render_template('admin.html', logged_in=False)
        return f(*args, **kwargs)
    return decorated_function


# ---------------------------------------------------------------------------
# Pages
# ---------------------------------------------------------------------------

@admin_bp.route('/admin')
def admin_page():
    """Render the admin dashboard."""
    if session.get('admin_logged_in'):
        return render_template('admin.html', logged_in=True, username=session.get('admin_username', 'Staff'))
    return render_template('admin.html', logged_in=False)


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------

@admin_bp.route('/admin/login', methods=['POST'])
def admin_login():
    """Handle admin login."""
    data     = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    conn = db.get_conn()
    user = conn.execute(
        'SELECT * FROM staff_users WHERE username = ?', (username,)
    ).fetchone()
    conn.close()

    if user and check_password_hash(user['password'], password):
        session['admin_logged_in'] = True
        session['admin_username']  = user['username']
        session['admin_id']        = user['id']
        return jsonify({'success': True, 'message': 'Login successful'})

    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401


@admin_bp.route('/admin/logout', methods=['POST'])
def admin_logout():
    """Handle admin logout."""
    session.pop('admin_logged_in', None)
    session.pop('admin_username',  None)
    session.pop('admin_id',        None)
    return jsonify({'success': True, 'message': 'Logged out'})


@admin_bp.route('/admin/api/register', methods=['POST'])
def admin_register():
    """Handle staff registration — no registration code required."""
    data     = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or len(username) < 3:
        return jsonify({'success': False, 'error': 'Username must be at least 3 characters'}), 400
    if not password or len(password) < 6:
        return jsonify({'success': False, 'error': 'Password must be at least 6 characters'}), 400

    conn = db.get_conn()
    existing = conn.execute(
        'SELECT id FROM staff_users WHERE username = ?', (username,)
    ).fetchone()

    if existing:
        conn.close()
        return jsonify({'success': False, 'error': 'Username already exists'}), 400

    try:
        conn.execute(
            'INSERT INTO staff_users (username, password) VALUES (?, ?)',
            (username, generate_password_hash(password))
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Account created successfully! You can now log in.'})
    except Exception as e:
        conn.close()
        current_app.logger.error(f'Registration failed: {e}')
        return jsonify({'success': False, 'error': 'Failed to create account'}), 500


# ---------------------------------------------------------------------------
# Staff management
# ---------------------------------------------------------------------------

@admin_bp.route('/admin/api/reset-password', methods=['POST'])
@login_required
def reset_password():
    """Allow a logged-in staff member to reset any user's password."""
    data            = request.get_json()
    target_username = data.get('username', '').strip()
    new_password    = data.get('new_password', '')

    if not target_username or not new_password:
        return jsonify({'success': False, 'error': 'username and new_password required'}), 400
    if len(new_password) < 6:
        return jsonify({'success': False, 'error': 'Password must be at least 6 characters'}), 400

    conn   = db.get_conn()
    result = conn.execute(
        'UPDATE staff_users SET password = ? WHERE username = ?',
        (generate_password_hash(new_password), target_username)
    )
    conn.commit()
    conn.close()

    if result.rowcount == 0:
        return jsonify({'success': False, 'error': f"User '{target_username}' not found"}), 404
    return jsonify({'success': True, 'message': f"Password for '{target_username}' updated"})


@admin_bp.route('/admin/api/staff-users', methods=['GET'])
@login_required
def list_staff_users():
    """List all staff accounts."""
    conn  = db.get_conn()
    rows  = conn.execute('SELECT id, username FROM staff_users').fetchall()
    conn.close()
    return jsonify({'success': True, 'data': [
        {'id': r['id'], 'username': r['username']} for r in rows
    ]})


@admin_bp.route('/admin/api/staff-users/<int:user_id>', methods=['DELETE'])
@login_required
def delete_staff_user(user_id):
    """Delete a staff user by ID."""
    conn   = db.get_conn()
    result = conn.execute('DELETE FROM staff_users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    return jsonify({'success': True, 'message': 'User deleted'})


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

@admin_bp.route('/admin/api/stats')
@login_required
def get_stats():
    """Get overview statistics."""
    stats = {
        # totals
        'contacts':     db.count('contact_messages'),
        'quotes':       db.count('quote_requests'),
        'bookings':     db.count('service_bookings'),
        'applications': db.count('job_applications'),
        'appointments': db.count('appointments'),
        'inventory':    db.count('pc_components'),
        # badge counts
        'contacts_unread':       db.count('contact_messages', 'is_read = 0'),
        'quotes_new':            db.count('quote_requests',   "status = 'New'"),
        'bookings_new':          db.count('service_bookings', "status = 'New'"),
        'applications_new':      db.count('job_applications', "status = 'New'"),
        'appointments_pending':  db.count('appointments',     "status = 'Pending'"),
        'inventory_low':         db.count('pc_components',    'stock <= 2'),
    }
    return jsonify({'success': True, 'stats': stats})


# ---------------------------------------------------------------------------
# Data retrieval (admin views)
# ---------------------------------------------------------------------------

@admin_bp.route('/admin/api/contacts')
@login_required
def get_contacts():
    conn = db.get_conn()
    rows = conn.execute(
        'SELECT * FROM contact_messages ORDER BY created_at DESC'
    ).fetchall()
    conn.close()
    return jsonify({'success': True, 'data': serialize_rows(rows)})


@admin_bp.route('/admin/api/applications')
@login_required
def get_applications():
    conn = db.get_conn()
    rows = conn.execute(
        'SELECT * FROM job_applications ORDER BY created_at DESC'
    ).fetchall()
    conn.close()
    # rename refs → references so the admin panel sees the expected field name
    result = []
    for r in rows:
        d = serialize_row(r)
        d['references'] = d.pop('refs', '')
        result.append(d)
    return jsonify({'success': True, 'data': result})


@admin_bp.route('/admin/api/appointments')
@login_required
def get_appointments():
    conn = db.get_conn()
    rows = conn.execute(
        'SELECT * FROM appointments ORDER BY created_at DESC'
    ).fetchall()
    conn.close()
    return jsonify({'success': True, 'data': serialize_rows(rows)})


@admin_bp.route('/admin/api/quotes')
@login_required
def get_quotes():
    conn = db.get_conn()
    rows = conn.execute(
        'SELECT * FROM quote_requests ORDER BY created_at DESC'
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = serialize_row(r)
        # parse build_config back from JSON string
        if isinstance(d.get('build_config'), str):
            try:
                d['build_config'] = json.loads(d['build_config'])
            except (json.JSONDecodeError, TypeError):
                d['build_config'] = {}
        result.append(d)
    return jsonify({'success': True, 'data': result})


@admin_bp.route('/admin/api/bookings')
@login_required
def get_bookings():
    conn = db.get_conn()
    rows = conn.execute(
        'SELECT * FROM service_bookings ORDER BY created_at DESC'
    ).fetchall()
    conn.close()
    return jsonify({'success': True, 'data': serialize_rows(rows)})


# ---------------------------------------------------------------------------
# Status updates
# ---------------------------------------------------------------------------

_TABLE_MAP = {
    'contact':     'contact_messages',
    'application': 'job_applications',
    'appointment': 'appointments',
    'quote':       'quote_requests',
    'booking':     'service_bookings',
}


@admin_bp.route('/admin/api/update-status', methods=['POST'])
@login_required
def update_status():
    """Update the status of any submission."""
    data       = request.get_json()
    item_type  = data.get('type')
    item_id    = data.get('id')
    new_status = data.get('status')

    if not all([item_type, item_id, new_status]):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400

    table = _TABLE_MAP.get(item_type)
    if not table:
        return jsonify({'success': False, 'error': 'Invalid type'}), 400

    try:
        item_id = int(item_id)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400

    conn = db.get_conn()
    if item_type == 'contact':
        result = conn.execute(
            'UPDATE contact_messages SET is_read = ? WHERE id = ?',
            (1 if new_status == 'Read' else 0, item_id)
        )
    else:
        result = conn.execute(
            f'UPDATE {table} SET status = ? WHERE id = ?',
            (new_status, item_id)
        )
    conn.commit()
    conn.close()

    if result.rowcount == 0:
        return jsonify({'success': False, 'error': 'Item not found'}), 404
    return jsonify({'success': True, 'message': 'Status updated'})


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------

_DELETE_TABLE_MAP = {
    'contact':     'contact_messages',
    'application': 'job_applications',
    'appointment': 'appointments',
    'quote':       'quote_requests',
    'booking':     'service_bookings',
    'inventory':   'pc_components',
}


def _do_delete(item_type, item_id):
    """Shared delete logic for all submission types."""
    table = _DELETE_TABLE_MAP.get(item_type)
    if not table:
        return jsonify({'success': False, 'error': 'Invalid type'}), 400

    try:
        item_id = int(item_id)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400

    conn = db.get_conn()

    # For job applications, also delete the associated resume file
    if item_type == 'application':
        doc = conn.execute(
            'SELECT resume_filename FROM job_applications WHERE id = ?', (item_id,)
        ).fetchone()
        if doc and doc['resume_filename']:
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], doc['resume_filename'])
            if os.path.exists(filepath):
                os.remove(filepath)

    result = conn.execute(f'DELETE FROM {table} WHERE id = ?', (item_id,))
    conn.commit()
    conn.close()

    if result.rowcount == 0:
        return jsonify({'success': False, 'error': 'Item not found'}), 404
    return jsonify({'success': True, 'message': 'Item deleted'})


@admin_bp.route('/admin/api/delete', methods=['POST'])
@login_required
def delete_item_post():
    """Delete a submission via POST body: {type, id}."""
    data = request.get_json()
    return _do_delete(data.get('type'), data.get('id'))


@admin_bp.route('/admin/api/delete/<item_type>/<item_id>', methods=['DELETE'])
@login_required
def delete_item_rest(item_type, item_id):
    """Delete a submission via REST-style URL."""
    return _do_delete(item_type, item_id)


# ---------------------------------------------------------------------------
# Inventory (PC components)
# ---------------------------------------------------------------------------

@admin_bp.route('/admin/api/inventory', methods=['GET'])
@login_required
def get_inventory():
    conn = db.get_conn()
    rows = conn.execute(
        'SELECT * FROM pc_components ORDER BY category'
    ).fetchall()
    conn.close()
    return jsonify({'success': True, 'data': serialize_rows(rows)})


@admin_bp.route('/admin/api/inventory', methods=['POST'])
@login_required
def add_inventory_item():
    """Add a new PC component to inventory."""
    data = request.get_json()
    if not data or not data.get('name') or not data.get('category'):
        return jsonify({'success': False, 'error': 'Name and Category are required'}), 400

    conn   = db.get_conn()
    cursor = conn.execute(
        '''INSERT INTO pc_components (name, category, price, specs, badge, stock, featured, image, health)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (data.get('name'),     data.get('category'),
         data.get('price', 0), data.get('specs', ''),
         data.get('badge', ''), data.get('stock', 1),
         1 if data.get('featured') else 0,
         data.get('image', ''), data.get('health', ''))
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({'success': True, 'message': 'Component added', 'id': new_id})


@admin_bp.route('/admin/api/inventory/<int:item_id>', methods=['PUT'])
@login_required
def update_inventory_item(item_id):
    """Update an existing PC component."""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    fields  = []
    values  = []
    allowed = ['name', 'category', 'price', 'specs', 'badge', 'stock', 'image', 'health']
    for key in allowed:
        if key in data:
            fields.append(f'{key} = ?')
            values.append(data[key])
    if 'featured' in data:
        fields.append('featured = ?')
        values.append(1 if data['featured'] else 0)

    if not fields:
        return jsonify({'success': False, 'error': 'No valid fields to update'}), 400

    values.append(item_id)
    conn   = db.get_conn()
    result = conn.execute(
        f"UPDATE pc_components SET {', '.join(fields)} WHERE id = ?",
        values
    )
    conn.commit()
    conn.close()

    if result.rowcount == 0:
        return jsonify({'success': False, 'error': 'Item not found'}), 404
    return jsonify({'success': True, 'message': 'Component updated'})


# ---------------------------------------------------------------------------
# File endpoints
# ---------------------------------------------------------------------------

@admin_bp.route('/admin/api/download-resume/<filename>')
@login_required
def download_resume(filename):
    """Download an uploaded resume file."""
    upload_dir = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_dir, filename, as_attachment=True)


@admin_bp.route('/admin/api/upload-image', methods=['POST'])
@login_required
def upload_image():
    """Handle media uploads (images + videos). Accepts field name 'image' or 'file'."""
    import time
    file = request.files.get('image') or request.files.get('file')
    if not file or file.filename == '':
        return jsonify({'success': False, 'error': 'No file provided'}), 400

    mime = file.content_type or ''
    if not (mime.startswith('image/') or mime.startswith('video/')):
        return jsonify({'success': False, 'error': f'Unsupported file type: {mime}'}), 400

    filename    = secure_filename(file.filename)
    filename    = f"{int(time.time())}_{filename}"
    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(upload_path)
    return jsonify({'success': True, 'url': f'/uploads/{filename}'})
