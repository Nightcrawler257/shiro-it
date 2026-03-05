from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app
from extensions import mongo
from models import is_valid_email

appointments_bp = Blueprint('appointments', __name__)


@appointments_bp.route('/api/appointment', methods=['POST'])
def book_appointment():
    """Handle appointment booking requests."""
    data = request.get_json()

    required = ['name', 'email', 'phone', 'service_type', 'preferred_date', 'preferred_time']
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
            'service_type': data['service_type'].strip(),
            'preferred_date': data['preferred_date'].strip(),
            'preferred_time': data['preferred_time'].strip(),
            'notes': data.get('notes', '').strip(),
            'created_at': datetime.now(timezone.utc),
            'status': 'Pending'
        }
        result = mongo.db.appointments.insert_one(doc)

        return jsonify({
            'success': True,
            'message': f'Appointment booked! We\'ll confirm your appointment for {data["preferred_date"]} at {data["preferred_time"]} via phone or WhatsApp.',
            'id': str(result.inserted_id)
        }), 201

    except Exception as e:
        current_app.logger.error(f'Appointment booking failed: {e}')
        return jsonify({'success': False, 'error': 'Failed to book appointment. Please try again.'}), 500
