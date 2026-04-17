import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import db
from models import is_valid_email

jobs_bp = Blueprint('jobs', __name__)


def allowed_file(filename):
    """Check if file extension is allowed."""
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'pdf', 'doc', 'docx'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


@jobs_bp.route('/api/job-application', methods=['POST'])
def submit_application():
    """Handle job application submissions with optional resume upload."""
    name         = request.form.get('name',         '').strip()
    email        = request.form.get('email',        '').strip()
    phone        = request.form.get('phone',        '').strip()
    position     = request.form.get('position',     '').strip()
    education    = request.form.get('education',    '').strip()
    experience   = request.form.get('experience',   '').strip()
    cover_letter = request.form.get('cover_letter', '').strip()
    references   = request.form.get('references',   '').strip()
    availability = request.form.get('availability', '').strip()

    if not all([name, email, phone, position, education, experience, availability]):
        return jsonify({'success': False, 'error': 'Please fill in all required fields'}), 400

    if not is_valid_email(email):
        return jsonify({'success': False, 'error': 'Please enter a valid email address'}), 400

    # Handle optional resume upload
    resume_filename = None
    if 'resume' in request.files:
        file = request.files['resume']
        if file and file.filename:
            if not allowed_file(file.filename):
                return jsonify({'success': False, 'error': 'Invalid file type. Only PDF, DOC, DOCX allowed.'}), 400
            ext = file.filename.rsplit('.', 1)[1].lower()
            safe_name = secure_filename(name.replace(' ', '_'))
            resume_filename = f"{safe_name}_{uuid.uuid4().hex[:8]}.{ext}"
            upload_dir = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_dir, exist_ok=True)
            file.save(os.path.join(upload_dir, resume_filename))

    try:
        conn = db.get_conn()
        cursor = conn.execute(
            '''INSERT INTO job_applications
               (name, email, phone, position, education, experience,
                cover_letter, refs, availability, resume_filename, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')''',
            (name, email, phone, position, education, experience,
             cover_letter, references, availability, resume_filename)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()

        return jsonify({
            'success': True,
            'message': f"Thank you {name}! Your application for {position} has been submitted successfully. We'll review it and contact you within 3-5 business days.",
            'id': new_id
        }), 201

    except Exception as e:
        current_app.logger.error(f'Job application submission failed: {e}')
        return jsonify({'success': False, 'error': 'Failed to submit application. Please try again.'}), 500
