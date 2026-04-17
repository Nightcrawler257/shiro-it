from flask import Blueprint, jsonify
from extensions import mongo
from models import serialize_docs

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/api/inventory', methods=['GET'])
def get_inventory():
    """Return all available components from the database."""
    try:
        items = mongo.db.pc_components.find().sort('category', 1)
        return jsonify({
            'success': True,
            'components': serialize_docs(items)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
