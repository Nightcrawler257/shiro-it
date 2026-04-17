from flask import Blueprint, request, jsonify, current_app
import db
from models import is_valid_email

contact_bp = Blueprint('contact', __name__)


@contact_bp.route('/api/contact', methods=['POST'])
def submit_contact():
    """Handle contact form submissions."""
    data = request.get_json()

    required = ['name', 'email', 'phone', 'subject', 'message']
    for field in required:
        if not data.get(field, '').strip():
            return jsonify({'success': False, 'error': f'{field} is required'}), 400

    if not is_valid_email(data['email'].strip()):
        return jsonify({'success': False, 'error': 'Please enter a valid email address'}), 400

    try:
        conn = db.get_conn()
        cursor = conn.execute(
            '''INSERT INTO contact_messages (name, email, phone, subject, message, is_read)
               VALUES (?, ?, ?, ?, ?, 0)''',
            (data['name'].strip(), data['email'].strip(), data['phone'].strip(),
             data['subject'].strip(), data['message'].strip())
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()

        return jsonify({
            'success': True,
            'message': "Thank you! Your message has been sent successfully. We'll contact you within 1-2 business hours.",
            'id': new_id
        }), 201

    except Exception as e:
        current_app.logger.error(f'Contact submission failed: {e}')
        return jsonify({'success': False, 'error': 'Failed to send message. Please try again.'}), 500
