from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from extensions import mongo
from models import serialize_doc, serialize_docs
from routes.admin import login_required

content_bp = Blueprint('content', __name__)

# ==========================================
# PUBLIC ENDPOINTS (For shiro-v2.html)
# ==========================================

@content_bp.route('/api/prebuilt_pcs', methods=['GET'])
def get_public_pcs():
    pcs = list(mongo.db.prebuilt_pcs.find().sort('_id', 1))
    return jsonify({'success': True, 'data': serialize_docs(pcs)})

@content_bp.route('/api/it_tips', methods=['GET'])
def get_public_tips():
    # Only fetch the number of tips specified in settings, or all if 0/not set
    settings = mongo.db.site_settings.find_one({'_id': 'general_settings'})
    limit = 0
    if settings and 'tips_display_count' in settings:
        try:
            limit = int(settings['tips_display_count'])
        except ValueError:
            limit = 0
    
    cursor = mongo.db.it_tips.find().sort('_id', -1)
    if limit > 0:
        cursor = cursor.limit(limit)
        
    tips = list(cursor)
    return jsonify({'success': True, 'data': serialize_docs(tips)})

@content_bp.route('/api/site_settings', methods=['GET'])
def get_public_settings():
    settings = mongo.db.site_settings.find_one({'_id': 'general_settings'})
    if not settings:
        settings = {'active_festival': 'none', 'tips_display_count': 0}
    return jsonify({'success': True, 'data': settings})


# ==========================================
# ADMIN ENDPOINTS (CRUD)
# ==========================================

# --- Prebuilt PCs ---
@content_bp.route('/admin/api/prebuilt_pcs', methods=['GET'])
@login_required
def admin_get_pcs():
    pcs = list(mongo.db.prebuilt_pcs.find().sort('_id', 1))
    return jsonify({'success': True, 'data': serialize_docs(pcs)})

@content_bp.route('/admin/api/prebuilt_pcs', methods=['POST'])
@login_required
def admin_add_pc():
    data = request.get_json()
    new_pc = {
        'tier_name': data.get('tier_name', '').strip(),
        'tier_badge': data.get('tier_badge', '').strip(),
        'name': data.get('name', '').strip(),
        'price': data.get('price', '').strip(),
        'discount': data.get('discount', '').strip(),
        'photo_url': data.get('photo_url', '').strip(),
        'specs': data.get('specs', []),
        'tier_color': data.get('tier_color', '#0066FF').strip(),
        'featured': data.get('featured', False)
    }
    result = mongo.db.prebuilt_pcs.insert_one(new_pc)
    new_pc['_id'] = result.inserted_id
    return jsonify({'success': True, 'data': serialize_doc(new_pc)})

@content_bp.route('/admin/api/prebuilt_pcs/<pc_id>', methods=['PUT'])
@login_required
def admin_update_pc(pc_id):
    if not ObjectId.is_valid(pc_id):
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400
    data = request.get_json()
    
    update_data = {
        'tier_name': data.get('tier_name', '').strip(),
        'tier_badge': data.get('tier_badge', '').strip(),
        'name': data.get('name', '').strip(),
        'price': data.get('price', '').strip(),
        'discount': data.get('discount', '').strip(),
        'photo_url': data.get('photo_url', '').strip(),
        'specs': data.get('specs', []),
        'tier_color': data.get('tier_color', '').strip(),
        'featured': data.get('featured', False)
    }
    
    result = mongo.db.prebuilt_pcs.update_one({'_id': ObjectId(pc_id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'success': False, 'error': 'PC not found'}), 404
        
    updated = mongo.db.prebuilt_pcs.find_one({'_id': ObjectId(pc_id)})
    return jsonify({'success': True, 'data': serialize_doc(updated)})

@content_bp.route('/admin/api/prebuilt_pcs/<pc_id>', methods=['DELETE'])
@login_required
def admin_delete_pc(pc_id):
    if not ObjectId.is_valid(pc_id):
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400
    mongo.db.prebuilt_pcs.delete_one({'_id': ObjectId(pc_id)})
    return jsonify({'success': True})


# --- IT Tips Gallery ---
@content_bp.route('/admin/api/it_tips', methods=['GET'])
@login_required
def admin_get_tips():
    tips = list(mongo.db.it_tips.find().sort('_id', -1))
    return jsonify({'success': True, 'data': serialize_docs(tips)})

@content_bp.route('/admin/api/it_tips', methods=['POST'])
@login_required
def admin_add_tip():
    data = request.get_json()
    new_tip = {
        'title': data.get('title', '').strip(),
        'description': data.get('description', '').strip(),
        'media_type': data.get('media_type', 'video').strip(), # 'video' or 'image'
        'media_url': data.get('media_url', '').strip(),
        'tags': data.get('tags', [])
    }
    result = mongo.db.it_tips.insert_one(new_tip)
    new_tip['_id'] = result.inserted_id
    return jsonify({'success': True, 'data': serialize_doc(new_tip)})

@content_bp.route('/admin/api/it_tips/<tip_id>', methods=['PUT'])
@login_required
def admin_update_tip(tip_id):
    if not ObjectId.is_valid(tip_id):
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400
    data = request.get_json()
    update_data = {
        'title': data.get('title', '').strip(),
        'description': data.get('description', '').strip(),
        'media_type': data.get('media_type', 'video').strip(),
        'media_url': data.get('media_url', '').strip(),
        'tags': data.get('tags', [])
    }
    mongo.db.it_tips.update_one({'_id': ObjectId(tip_id)}, {'$set': update_data})
    updated = mongo.db.it_tips.find_one({'_id': ObjectId(tip_id)})
    return jsonify({'success': True, 'data': serialize_doc(updated)})

@content_bp.route('/admin/api/it_tips/<tip_id>', methods=['DELETE'])
@login_required
def admin_delete_tip(tip_id):
    if not ObjectId.is_valid(tip_id):
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400
    mongo.db.it_tips.delete_one({'_id': ObjectId(tip_id)})
    return jsonify({'success': True})


# --- Site Settings (Festivals & Display Counts) ---
@content_bp.route('/admin/api/settings', methods=['GET'])
@login_required
def admin_get_settings():
    settings = mongo.db.site_settings.find_one({'_id': 'general_settings'})
    if not settings:
        settings = {'_id': 'general_settings', 'active_festival': 'none', 'tips_display_count': 0}
        mongo.db.site_settings.insert_one(settings)
    return jsonify({'success': True, 'data': settings})

@content_bp.route('/admin/api/settings', methods=['POST'])
@login_required
def admin_update_settings():
    data = request.get_json()
    update_data = {
        'active_festival': data.get('active_festival', 'none'),
        'tips_display_count': int(data.get('tips_display_count', 0))
    }
    mongo.db.site_settings.update_one(
        {'_id': 'general_settings'},
        {'$set': update_data},
        upsert=True
    )
    return jsonify({'success': True, 'data': update_data})
