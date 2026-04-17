import os
from functools import wraps
from flask import Blueprint, request, jsonify, session, render_template, send_from_directory, current_app
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from extensions import mongo
from models import serialize_doc, serialize_docs

admin_bp = Blueprint('admin', __name__)


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


@admin_bp.route('/admin')
def admin_page():
    """Render the admin dashboard."""
    if session.get('admin_logged_in'):
        return render_template('admin.html', logged_in=True, username=session.get('admin_username', 'Staff'))
    return render_template('admin.html', logged_in=False)


@admin_bp.route('/admin/login', methods=['POST'])
def admin_login():
    """Handle admin login."""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    user = mongo.db.staff_users.find_one({'username': username})
    if user and check_password_hash(user['password'], password):
        session['admin_logged_in'] = True
        session['admin_username'] = user['username']
        session['admin_id'] = str(user['_id'])
        return jsonify({'success': True, 'message': 'Login successful'})

    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401


@admin_bp.route('/admin/api/register', methods=['POST'])
def admin_register():
    """Handle staff registration."""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    reg_code = data.get('reg_code', '').strip()

    # Validate registration code
    if reg_code != current_app.config['STAFF_REGISTRATION_CODE']:
        return jsonify({'success': False, 'error': 'Invalid registration code'}), 403

    if not username or len(username) < 3:
        return jsonify({'success': False, 'error': 'Username must be at least 3 characters'}), 400
    if not password or len(password) < 6:
        return jsonify({'success': False, 'error': 'Password must be at least 6 characters'}), 400

    # Check if user already exists
    if mongo.db.staff_users.find_one({'username': username}):
        return jsonify({'success': False, 'error': 'Username already exists'}), 400

    # Create user
    try:
        mongo.db.staff_users.insert_one({
            'username': username,
            'password': generate_password_hash(password)
        })
        return jsonify({'success': True, 'message': 'Account created successfully! You can now log in.'})
    except Exception as e:
        current_app.logger.error(f'Registration failed: {e}')
        return jsonify({'success': False, 'error': 'Failed to create account'}), 500


@admin_bp.route('/admin/logout', methods=['POST'])
def admin_logout():
    """Handle admin logout."""
    session.pop('admin_logged_in', None)
    session.pop('admin_username', None)
    session.pop('admin_id', None)
    return jsonify({'success': True, 'message': 'Logged out'})


@admin_bp.route('/admin/api/reset-password', methods=['POST'])
@login_required
def reset_password():
    """Allow a logged-in staff member to reset any user's password."""
    data = request.get_json()
    target_username = data.get('username', '').strip()
    new_password    = data.get('new_password', '')

    if not target_username or not new_password:
        return jsonify({'success': False, 'error': 'username and new_password required'}), 400
    if len(new_password) < 6:
        return jsonify({'success': False, 'error': 'Password must be at least 6 characters'}), 400

    result = mongo.db.staff_users.update_one(
        {'username': target_username},
        {'$set': {'password': generate_password_hash(new_password)}}
    )
    if result.matched_count == 0:
        return jsonify({'success': False, 'error': f"User '{target_username}' not found"}), 404
    return jsonify({'success': True, 'message': f"Password for '{target_username}' updated"})


@admin_bp.route('/admin/api/staff-users', methods=['GET'])
@login_required
def list_staff_users():
    """List all staff usernames."""
    users = mongo.db.staff_users.find({}, {'username': 1, '_id': 1})
    return jsonify({'success': True, 'data': [
        {'id': str(u['_id']), 'username': u['username']} for u in users
    ]})


@admin_bp.route('/admin/api/staff-users/<user_id>', methods=['DELETE'])
@login_required
def delete_staff_user(user_id):
    """Delete a staff user by ID."""
    from bson import ObjectId
    try:
        oid = ObjectId(user_id)
    except Exception:
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400
    result = mongo.db.staff_users.delete_one({'_id': oid})
    if result.deleted_count == 0:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    return jsonify({'success': True, 'message': 'User deleted'})


@admin_bp.route('/admin/api/stats')
@login_required
def get_stats():
    """Get overview statistics."""
    contacts_total  = mongo.db.contact_messages.count_documents({})
    contacts_unread = mongo.db.contact_messages.count_documents({'is_read': False})
    apps_total  = mongo.db.job_applications.count_documents({})
    apps_new    = mongo.db.job_applications.count_documents({'status': 'New'})
    apt_total   = mongo.db.appointments.count_documents({})
    apt_pending = mongo.db.appointments.count_documents({'status': 'Pending'})
    q_total = mongo.db.quote_requests.count_documents({})
    q_new   = mongo.db.quote_requests.count_documents({'status': 'New'})
    b_total = mongo.db.service_bookings.count_documents({})
    b_new   = mongo.db.service_bookings.count_documents({'status': 'New'})
    inv_total = mongo.db.pc_components.count_documents({})
    inv_low   = mongo.db.pc_components.count_documents({'stock': {'$lte': 2}})

    stats = {
        # flat totals used by stat cards
        'contacts':     contacts_total,
        'quotes':       q_total,
        'bookings':     b_total,
        'applications': apps_total,
        'appointments': apt_total,
        'inventory':    inv_total,
        # badge counts (unread / pending / new)
        'contacts_unread': contacts_unread,
        'quotes_new':      q_new,
        'bookings_new':    b_new,
        'applications_new': apps_new,
        'appointments_pending': apt_pending,
        'inventory_low': inv_low,
    }
    return jsonify({'success': True, 'stats': stats})


@admin_bp.route('/admin/api/contacts')
@login_required
def get_contacts():
    """Get all contact messages."""
    messages = mongo.db.contact_messages.find().sort('created_at', -1)
    return jsonify({'success': True, 'data': serialize_docs(messages)})


@admin_bp.route('/admin/api/applications')
@login_required
def get_applications():
    """Get all job applications."""
    apps = mongo.db.job_applications.find().sort('created_at', -1)
    return jsonify({'success': True, 'data': serialize_docs(apps)})


@admin_bp.route('/admin/api/appointments')
@login_required
def get_appointments():
    """Get all appointments."""
    appts = mongo.db.appointments.find().sort('created_at', -1)
    return jsonify({'success': True, 'data': serialize_docs(appts)})


@admin_bp.route('/admin/api/quotes')
@login_required
def get_quotes():
    """Get all quote requests."""
    quotes = mongo.db.quote_requests.find().sort('created_at', -1)
    return jsonify({'success': True, 'data': serialize_docs(quotes)})


@admin_bp.route('/admin/api/bookings')
@login_required
def get_bookings():
    """Get all service bookings."""
    bookings = mongo.db.service_bookings.find().sort('created_at', -1)
    return jsonify({'success': True, 'data': serialize_docs(bookings)})


@admin_bp.route('/admin/api/update-status', methods=['POST'])
@login_required
def update_status():
    """Update the status of any submission."""
    data = request.get_json()
    item_type = data.get('type')
    item_id = data.get('id')
    new_status = data.get('status')

    if not all([item_type, item_id, new_status]):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400

    collection_map = {
        'contact': 'contact_messages',
        'application': 'job_applications',
        'appointment': 'appointments',
        'quote': 'quote_requests',
        'booking': 'service_bookings'
    }

    collection_name = collection_map.get(item_type)
    if not collection_name:
        return jsonify({'success': False, 'error': 'Invalid type'}), 400

    try:
        oid = ObjectId(item_id)
    except Exception:
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400

    collection = mongo.db[collection_name]

    if item_type == 'contact':
        result = collection.update_one({'_id': oid}, {'$set': {'is_read': new_status == 'Read'}})
    else:
        result = collection.update_one({'_id': oid}, {'$set': {'status': new_status}})

    if result.matched_count == 0:
        return jsonify({'success': False, 'error': 'Item not found'}), 404

    return jsonify({'success': True, 'message': 'Status updated'})

@admin_bp.route('/admin/api/inventory', methods=['GET'])
@login_required
def get_inventory():
    try:
        items = mongo.db.pc_components.find().sort('category', 1)
        return jsonify({'success': True, 'data': serialize_docs(items)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@admin_bp.route('/admin/api/download-resume/<filename>')
@login_required
def download_resume(filename):
    """Download an uploaded resume file."""
    upload_dir = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_dir, filename, as_attachment=True)


def _do_delete(item_type, item_id):
    """Shared delete logic."""
    collection_map = {
        'contact': 'contact_messages',
        'application': 'job_applications',
        'appointment': 'appointments',
        'quote': 'quote_requests',
        'booking': 'service_bookings',
        'inventory': 'pc_components'
    }
    collection_name = collection_map.get(item_type)
    if not collection_name:
        return jsonify({'success': False, 'error': 'Invalid type'}), 400
    try:
        oid = ObjectId(item_id)
    except Exception:
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400
    collection = mongo.db[collection_name]
    if item_type == 'application':
        doc = collection.find_one({'_id': oid})
        if doc and doc.get('resume_filename'):
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], doc['resume_filename'])
            if os.path.exists(filepath):
                os.remove(filepath)
    result = collection.delete_one({'_id': oid})
    if result.deleted_count == 0:
        return jsonify({'success': False, 'error': 'Item not found'}), 404
    return jsonify({'success': True, 'message': 'Item deleted'})


@admin_bp.route('/admin/api/delete', methods=['POST'])
@login_required
def delete_item_post():
    """Delete a submission (POST body: {type, id})."""
    data = request.get_json()
    return _do_delete(data.get('type'), data.get('id'))


@admin_bp.route('/admin/api/delete/<item_type>/<item_id>', methods=['DELETE'])
@login_required
def delete_item_rest(item_type, item_id):
    """Delete a submission (REST style)."""
    return _do_delete(item_type, item_id)
    


@admin_bp.route('/admin/api/upload-image', methods=['POST'])
@login_required
def upload_image():
    """Handle media uploads (images + videos). Accepts field name 'image' or 'file'."""
    import time
    file = request.files.get('image') or request.files.get('file')
    if not file or file.filename == '':
        return jsonify({'success': False, 'error': 'No file provided'}), 400

    # Validate MIME type
    mime = file.content_type or ''
    if not (mime.startswith('image/') or mime.startswith('video/')):
        return jsonify({'success': False, 'error': f'Unsupported file type: {mime}'}), 400

    filename = secure_filename(file.filename)
    filename = f"{int(time.time())}_{filename}"
    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(upload_path)
    return jsonify({'success': True, 'url': f'/uploads/{filename}'})

@admin_bp.route('/admin/api/inventory', methods=['POST'])
@login_required
def add_inventory_item():
    """Add a new PC component to inventory."""
    data = request.get_json()
    if not data or not data.get('name') or not data.get('category'):
        return jsonify({'success': False, 'error': 'Name and Category are required'}), 400
    
    component = {
        'name': data.get('name'),
        'category': data.get('category'),
        'price': data.get('price', 0),
        'specs': data.get('specs', ''),
        'badge': data.get('badge', ''),
        'stock': data.get('stock', 1),
        'featured': data.get('featured', False),
        'image': data.get('image', ''),
        'health': data.get('health', '')
    }
    result = mongo.db.pc_components.insert_one(component)
    return jsonify({'success': True, 'message': 'Component added', 'id': str(result.inserted_id)})

@admin_bp.route('/admin/api/inventory/<item_id>', methods=['PUT'])
@login_required
def update_inventory_item(item_id):
    """Update an existing PC component."""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    try:
        oid = ObjectId(item_id)
    except Exception:
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400

    update_fields = {}
    if 'name' in data: update_fields['name'] = data['name']
    if 'category' in data: update_fields['category'] = data['category']
    if 'price' in data: update_fields['price'] = data['price']
    if 'specs' in data: update_fields['specs'] = data['specs']
    if 'badge' in data: update_fields['badge'] = data['badge']
    if 'stock' in data: update_fields['stock'] = data['stock']
    if 'featured' in data: update_fields['featured'] = data['featured']
    if 'image' in data: update_fields['image'] = data['image']
    if 'health' in data: update_fields['health'] = data['health']

    result = mongo.db.pc_components.update_one({'_id': oid}, {'$set': update_fields})
    if result.matched_count == 0:
        return jsonify({'success': False, 'error': 'Item not found'}), 404
        
    return jsonify({'success': True, 'message': 'Component updated'})
