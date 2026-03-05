import os
from functools import wraps
from flask import Blueprint, request, jsonify, session, render_template, send_from_directory, current_app
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
        return render_template('admin.html', logged_in=True)
    return render_template('admin.html', logged_in=False)


@admin_bp.route('/admin/login', methods=['POST'])
def admin_login():
    """Handle admin login."""
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')

    if (username == current_app.config['ADMIN_USERNAME'] and
            password == current_app.config['ADMIN_PASSWORD']):
        session['admin_logged_in'] = True
        return jsonify({'success': True, 'message': 'Login successful'})

    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401


@admin_bp.route('/admin/logout', methods=['POST'])
def admin_logout():
    """Handle admin logout."""
    session.pop('admin_logged_in', None)
    return jsonify({'success': True, 'message': 'Logged out'})


@admin_bp.route('/admin/api/stats')
@login_required
def get_stats():
    """Get overview statistics."""
    stats = {
        'contacts': {
            'total': mongo.db.contact_messages.count_documents({}),
            'unread': mongo.db.contact_messages.count_documents({'is_read': False})
        },
        'applications': {
            'total': mongo.db.job_applications.count_documents({}),
            'new': mongo.db.job_applications.count_documents({'status': 'New'})
        },
        'appointments': {
            'total': mongo.db.appointments.count_documents({}),
            'pending': mongo.db.appointments.count_documents({'status': 'Pending'})
        },
        'quotes': {
            'total': mongo.db.quote_requests.count_documents({}),
            'new': mongo.db.quote_requests.count_documents({'status': 'New'})
        },
        'bookings': {
            'total': mongo.db.service_bookings.count_documents({}),
            'new': mongo.db.service_bookings.count_documents({'status': 'New'})
        }
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


@admin_bp.route('/admin/api/download-resume/<filename>')
@login_required
def download_resume(filename):
    """Download an uploaded resume file."""
    upload_dir = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_dir, filename, as_attachment=True)


@admin_bp.route('/admin/api/delete', methods=['POST'])
@login_required
def delete_item():
    """Delete a submission."""
    data = request.get_json()
    item_type = data.get('type')
    item_id = data.get('id')

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

    # If it's a job application, check for resume file
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
