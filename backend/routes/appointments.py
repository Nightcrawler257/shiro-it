from flask import Blueprint, request, jsonify, current_app
import db
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
        conn = db.get_conn()
        cursor = conn.execute(
            '''INSERT INTO appointments
               (name, email, phone, service_type, preferred_date, preferred_time, notes, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')''',
            (data['name'].strip(), data['email'].strip(), data['phone'].strip(),
             data['service_type'].strip(), data['preferred_date'].strip(),
             data['preferred_time'].strip(), data.get('notes', '').strip())
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()

        return jsonify({
            'success': True,
            'message': f"Appointment booked! We'll confirm your appointment for {data['preferred_date']} at {data['preferred_time']} via phone or WhatsApp.",
            'id': new_id
        }), 201

    except Exception as e:
        current_app.logger.error(f'Appointment booking failed: {e}')
        return jsonify({'success': False, 'error': 'Failed to book appointment. Please try again.'}), 500
