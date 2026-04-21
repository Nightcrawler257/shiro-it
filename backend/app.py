"""
SHIRO IT Backend Server
=======================
Flask-based backend with SQLite for the SHIRO IT website.
Provides API endpoints for form submissions, file uploads,
and an admin dashboard to manage all data.

Usage:
    cd backend
    pip install -r requirements.txt
    python app.py

Then visit http://localhost:5000
Admin dashboard at http://localhost:5000/admin
"""

import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from config import Config
import db as database

# Parent directory contains the static HTML/CSS/JS files
PARENT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__,
                template_folder='templates',
                static_folder=None)

    app.config.from_object(Config)

    # Enable CORS for all routes
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

    # Initialize SQLite database (creates tables if they don't exist)
    database.init_db(app.config['DATABASE_PATH'])

    # Create uploads directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register API route blueprints
    from routes.contact     import contact_bp
    from routes.jobs        import jobs_bp
    from routes.appointments import appointments_bp
    from routes.quotes      import quotes_bp
    from routes.services    import services_bp
    from routes.admin       import admin_bp
    from routes.inventory   import inventory_bp
    from routes.content     import content_bp

    app.register_blueprint(contact_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(quotes_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(content_bp)

    # API index — shows available endpoints
    @app.route('/api')
    def api_index():
        return jsonify({
            'name': 'SHIRO IT API',
            'version': '2.0',
            'database': 'SQLite',
            'endpoints': {
                'POST /api/contact':         'Submit a contact message',
                'POST /api/job-application': 'Submit a job application',
                'POST /api/appointment':     'Book an appointment',
                'POST /api/quote':           'Request a PC build quote',
                'GET  /api/services':        'Get service catalog',
                'POST /api/service-booking': 'Book a service',
            }
        })

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Serve static files from the parent directory (SHIRO IT folder)
    @app.route('/')
    def serve_index():
        return send_from_directory(PARENT_DIR, 'shiro-v2.html')

    @app.route('/<path:filename>')
    def serve_static(filename):
        """Serve all static files (HTML, CSS, JS, images, videos)."""
        # SECURITY FIX: Prevent unauthorized download of the database and backend code
        if filename.startswith('backend') or filename.endswith('.db') or filename.endswith('.py'):
            return 'Page not found', 404

        filepath = os.path.join(PARENT_DIR, filename)
        if os.path.isfile(filepath):
            return send_from_directory(PARENT_DIR, filename)
        html_path = os.path.join(PARENT_DIR, filename + '.html')
        if os.path.isfile(html_path):
            return send_from_directory(PARENT_DIR, filename + '.html')
        return 'Page not found', 404

    # Ensure a default admin account always exists on startup
    with app.app_context():
        from werkzeug.security import generate_password_hash
        DEFAULT_ADMIN_USERNAME = os.environ.get('DEFAULT_ADMIN_USERNAME', 'admin')
        DEFAULT_ADMIN_PASSWORD = os.environ.get('DEFAULT_ADMIN_PASSWORD', 'shiro2026')

        conn = database.get_conn()
        existing = conn.execute(
            'SELECT id FROM staff_users WHERE username = ?',
            (DEFAULT_ADMIN_USERNAME,)
        ).fetchone()

        if not existing:
            conn.execute(
                'INSERT INTO staff_users (username, password) VALUES (?, ?)',
                (DEFAULT_ADMIN_USERNAME, generate_password_hash(DEFAULT_ADMIN_PASSWORD))
            )
            conn.commit()
            print(f"[OK] Default admin created: '{DEFAULT_ADMIN_USERNAME}' / '{DEFAULT_ADMIN_PASSWORD}'")
        else:
            print(f"[OK] Admin account exists: '{DEFAULT_ADMIN_USERNAME}'")

        conn.close()
        print("[OK] SQLite database ready")

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))

    print(f"""
+==============================================+
|        SHIRO IT Backend Server               |
+==============================================+
|  Website:  http://localhost:{port}              |
|  Admin:    http://localhost:{port}/admin         |
|  API Base: http://localhost:{port}/api           |
+==============================================+
|  Database: SQLite (shiroit.db)               |
+==============================================+
    """)

    app.run(host='0.0.0.0', port=port, debug=True)
