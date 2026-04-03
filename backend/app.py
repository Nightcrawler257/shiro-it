"""
SHIRO IT Backend Server
=======================
Flask-based backend with MongoDB for the SHIRO IT website.
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
from extensions import mongo

# Determine the parent directory (where static HTML files live)
PARENT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__,
                template_folder='templates',
                static_folder=None)

    app.config.from_object(Config)

    # Enable CORS for API routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize MongoDB
    mongo.init_app(app)

    # Create uploads directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register API route blueprints
    from routes.contact import contact_bp
    from routes.jobs import jobs_bp
    from routes.appointments import appointments_bp
    from routes.quotes import quotes_bp
    from routes.services import services_bp
    from routes.admin import admin_bp

    app.register_blueprint(contact_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(quotes_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(admin_bp)

    # API index — shows available endpoints
    @app.route('/api')
    def api_index():
        return jsonify({
            'name': 'SHIRO IT API',
            'version': '2.0',
            'endpoints': {
                'POST /api/contact': 'Submit a contact message',
                'POST /api/job-application': 'Submit a job application',
                'POST /api/appointment': 'Book an appointment',
                'POST /api/quote': 'Request a PC build quote',
                'GET  /api/services': 'Get service catalog',
                'POST /api/service-booking': 'Book a service',
            }
        })
    # Serve static files from the parent directory (SHIRO IT folder)
    @app.route('/')
    def serve_index():
        return send_from_directory(PARENT_DIR, 'shiro-v2.html')

    @app.route('/<path:filename>')
    def serve_static(filename):
        """Serve all static files (HTML, CSS, JS, images, videos)."""
        filepath = os.path.join(PARENT_DIR, filename)
        if os.path.isfile(filepath):
            return send_from_directory(PARENT_DIR, filename)
        html_path = os.path.join(PARENT_DIR, filename + '.html')
        if os.path.isfile(html_path):
            return send_from_directory(PARENT_DIR, filename + '.html')
        return 'Page not found', 404

    # Verify MongoDB connection
    with app.app_context():
        try:
            mongo.db.command('ping')
            print("[OK] MongoDB connected")
        except Exception as e:
            print(f"[WARNING] MongoDB not available: {e}")
            print("  Make sure MongoDB is running or MONGO_URI is set correctly")

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
|  Database: MongoDB (shiro_it)                |
|  Admin Login:                                |
|    Username: admin                           |
|    Password: shiroadmin2026                  |
+==============================================+
    """)

    app.run(host='0.0.0.0', port=port, debug=True)
