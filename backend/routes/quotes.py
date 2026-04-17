import json
from flask import Blueprint, request, jsonify, current_app
import db
from models import is_valid_email

quotes_bp = Blueprint('quotes', __name__)


@quotes_bp.route('/api/quote', methods=['POST'])
def request_quote():
    """Handle PC build quote requests."""
    data = request.get_json()

    if not data.get('name', '').strip():
        return jsonify({'success': False, 'error': 'Name is required'}), 400
    if not data.get('email', '').strip():
        return jsonify({'success': False, 'error': 'Email is required'}), 400
    if not data.get('phone', '').strip():
        return jsonify({'success': False, 'error': 'Phone is required'}), 400
    if not data.get('build_config'):
        return jsonify({'success': False, 'error': 'Build configuration is required'}), 400

    if not is_valid_email(data['email'].strip()):
        return jsonify({'success': False, 'error': 'Please enter a valid email address'}), 400

    try:
        build_config_json = json.dumps(data['build_config'])

        conn = db.get_conn()
        cursor = conn.execute(
            '''INSERT INTO quote_requests (name, email, phone, build_config, total_price, notes, status)
               VALUES (?, ?, ?, ?, ?, ?, 'New')''',
            (data['name'].strip(), data['email'].strip(), data['phone'].strip(),
             build_config_json, data.get('total_price', 0), data.get('notes', '').strip())
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Quote request submitted! Our team will review your build configuration and send you a detailed quote within 24 hours.',
            'id': new_id
        }), 201

    except Exception as e:
        current_app.logger.error(f'Quote request submission failed: {e}')
        return jsonify({'success': False, 'error': 'Failed to submit quote request. Please try again.'}), 500
