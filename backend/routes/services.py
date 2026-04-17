from flask import Blueprint, request, jsonify, current_app
import db
from models import is_valid_email

services_bp = Blueprint('services', __name__)


# Service catalog data (hardcoded — no database required)
SERVICES_CATALOG = [
    {
        'category': 'Computer Repair',
        'services': [
            {'name': 'Computer & Laptop Repair', 'price': 'From RM 80', 'description': 'Hardware Diagnosis & Repair, Screen Replacement, Battery Replacement'},
            {'name': 'Virus & Security', 'price': 'From RM 99', 'description': 'Virus & Malware Removal, Antivirus Installation, Firewall Setup'},
            {'name': 'Data Recovery & Backup', 'price': 'From RM 199', 'description': 'Hard Drive Data Recovery, Backup System Setup, Cloud Backup'},
            {'name': 'Remote & On-Site Support', 'price': 'From RM 60/hour', 'description': 'Remote Troubleshooting, On-Site Technical Support'},
        ]
    },
    {
        'category': 'Maintenance',
        'services': [
            {'name': 'Basic Tune-up', 'price': 'RM 80', 'description': 'Disk cleanup, startup optimization, basic virus scan'},
            {'name': 'Premium Maintenance Package', 'price': 'RM 150', 'description': 'Full antivirus scan, driver updates, hardware health check'},
            {'name': 'Monthly Maintenance Plan', 'price': 'RM 60/month', 'description': 'Monthly check-up, automatic updates, performance monitoring'},
            {'name': 'Small Business Package', 'price': 'RM 299/month', 'description': 'Up to 5 computers, monthly visits, network health checks'},
            {'name': 'Professional Business Package', 'price': 'RM 599/month', 'description': 'Up to 15 devices, 24/7 server monitoring, weekly maintenance'},
            {'name': 'Enterprise Maintenance', 'price': 'RM 1,299/month', 'description': 'Unlimited devices, 24/7 monitoring, emergency response'},
        ]
    },
    {
        'category': 'Networking',
        'services': [
            {'name': 'Basic Home WiFi Setup', 'price': 'RM 120', 'description': 'Single router installation, basic network configuration'},
            {'name': 'Advanced Home Network', 'price': 'RM 250', 'description': 'WiFi optimization, guest network, parental controls'},
            {'name': 'Premium Mesh System', 'price': 'From RM 500', 'description': 'Mesh WiFi system installation, 50+ device support'},
            {'name': 'Network Cabling', 'price': 'RM 35-50/port', 'description': 'Cat6/Cat6a cables, wall plate, testing'},
            {'name': 'Office Network Setup', 'price': 'From RM 800', 'description': 'Complete network infrastructure up to 25 computers'},
            {'name': 'Business WiFi Solution', 'price': 'From RM 1,200', 'description': 'Enterprise-grade wireless, up to 5000 sq ft'},
        ]
    }
]


@services_bp.route('/api/services', methods=['GET'])
def get_services():
    """Return the full service catalog."""
    return jsonify({'success': True, 'services': SERVICES_CATALOG})


@services_bp.route('/api/service-booking', methods=['POST'])
def book_service():
    """Handle service booking requests."""
    data = request.get_json()

    if not data.get('name', '').strip():
        return jsonify({'success': False, 'error': 'Name is required'}), 400
    if not data.get('email', '').strip():
        return jsonify({'success': False, 'error': 'Email is required'}), 400
    if not data.get('phone', '').strip():
        return jsonify({'success': False, 'error': 'Phone is required'}), 400
    if not data.get('service_name', '').strip():
        return jsonify({'success': False, 'error': 'Service name is required'}), 400

    if not is_valid_email(data['email'].strip()):
        return jsonify({'success': False, 'error': 'Please enter a valid email address'}), 400

    try:
        conn = db.get_conn()
        cursor = conn.execute(
            '''INSERT INTO service_bookings (name, email, phone, service_name, preferred_date, notes, status)
               VALUES (?, ?, ?, ?, ?, ?, 'New')''',
            (data['name'].strip(), data['email'].strip(), data['phone'].strip(),
             data['service_name'].strip(), data.get('preferred_date', '').strip(),
             data.get('notes', '').strip())
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()

        return jsonify({
            'success': True,
            'message': f"Booking request for \"{data['service_name']}\" submitted! We'll contact you to confirm the details.",
            'id': new_id
        }), 201

    except Exception as e:
        current_app.logger.error(f'Service booking submission failed: {e}')
        return jsonify({'success': False, 'error': 'Failed to submit booking. Please try again.'}), 500
