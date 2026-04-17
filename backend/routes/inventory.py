from flask import Blueprint, jsonify
import db
from models import serialize_rows

inventory_bp = Blueprint('inventory', __name__)


@inventory_bp.route('/api/inventory', methods=['GET'])
def get_inventory():
    """Return all available PC components from the database."""
    try:
        conn = db.get_conn()
        rows = conn.execute(
            'SELECT * FROM pc_components ORDER BY category'
        ).fetchall()
        conn.close()
        return jsonify({'success': True, 'components': serialize_rows(rows)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
