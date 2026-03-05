from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app
from extensions import mongo
from models import is_valid_email

contact_bp = Blueprint('contact', __name__)


@contact_bp.route('/api/contact', methods=['POST'])
def submit_contact():
    """Handle contact form submissions."""
    data = request.get_json()

    # Validate required fields
    required = ['name', 'email', 'phone', 'subject', 'message']
    for field in required:
        if not data.get(field, '').strip():
            return jsonify({'success': False, 'error': f'{field} is required'}), 400

    if not is_valid_email(data['email'].strip()):
        return jsonify({'success': False, 'error': 'Please enter a valid email address'}), 400

    try:
        doc = {
            'name': data['name'].strip(),
            'email': data['email'].strip(),
            'phone': data['phone'].strip(),
            'subject': data['subject'].strip(),
            'message': data['message'].strip(),
            'created_at': datetime.now(timezone.utc),
            'is_read': False
        }
        result = mongo.db.contact_messages.insert_one(doc)

        return jsonify({
            'success': True,
            'message': 'Thank you! Your message has been sent successfully. We\'ll contact you within 1-2 business hours.',
            'id': str(result.inserted_id)
        }), 201

    except Exception as e:
        current_app.logger.error(f'Contact submission failed: {e}')
        return jsonify({'success': False, 'error': 'Failed to send message. Please try again.'}), 500
