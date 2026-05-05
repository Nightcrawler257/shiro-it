import json
from flask import Blueprint, request, jsonify
import db
from models import serialize_row, serialize_rows
from routes.admin import login_required

content_bp = Blueprint('content', __name__)


# ---------------------------------------------------------------------------
# JSON-field helpers
# ---------------------------------------------------------------------------

def _parse_pc(row):
    """Deserialize specs and tags (JSON list) in a prebuilt_pcs row."""
    d = serialize_row(row)
    if d:
        if isinstance(d.get('specs'), str):
            try: d['specs'] = json.loads(d['specs'])
            except: d['specs'] = []
        if isinstance(d.get('tags'), str):
            try: d['tags'] = json.loads(d['tags'])
            except: d['tags'] = []
    return d


def _parse_tip(row):
    """Deserialize tags (JSON list) in an it_tips row."""
    d = serialize_row(row)
    if d and isinstance(d.get('tags'), str):
        try:
            d['tags'] = json.loads(d['tags'])
        except (json.JSONDecodeError, TypeError):
            d['tags'] = []
    return d


# ===========================================================================
# PUBLIC ENDPOINTS  (used by shiro-v2.html)
# ===========================================================================

@content_bp.route('/api/prebuilt_pcs', methods=['GET'])
def get_public_pcs():
    conn = db.get_conn()
    rows = conn.execute('SELECT * FROM prebuilt_pcs ORDER BY id').fetchall()
    conn.close()
    return jsonify({'success': True, 'data': [_parse_pc(r) for r in rows]})


@content_bp.route('/api/it_tips', methods=['GET'])
def get_public_tips():
    conn = db.get_conn()
    setting = conn.execute(
        "SELECT value FROM site_settings WHERE key = 'tips_display_count'"
    ).fetchone()
    limit = 0
    if setting:
        try:
            limit = int(setting['value'])
        except (ValueError, TypeError):
            limit = 0

    if limit > 0:
        rows = conn.execute(
            'SELECT * FROM it_tips ORDER BY id DESC LIMIT ?', (limit,)
        ).fetchall()
    else:
        rows = conn.execute('SELECT * FROM it_tips ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify({'success': True, 'data': [_parse_tip(r) for r in rows]})


@content_bp.route('/api/testimonials', methods=['GET'])
def get_public_testimonials():
    conn = db.get_conn()
    rows = conn.execute('SELECT * FROM testimonials ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify({'success': True, 'data': serialize_rows(rows)})


@content_bp.route('/api/site_settings', methods=['GET'])
def get_public_settings():
    conn = db.get_conn()
    rows = conn.execute('SELECT key, value FROM site_settings').fetchall()
    conn.close()
    settings = {r['key']: r['value'] for r in rows}
    if not settings:
        settings = {'active_festival': 'none', 'tips_display_count': '0', 'hero_slide_duration': '8'}
    return jsonify({'success': True, 'data': settings})


@content_bp.route('/api/hero_slides', methods=['GET'])
def get_public_slides():
    conn = db.get_conn()
    setting = conn.execute(
        "SELECT value FROM site_settings WHERE key = 'hero_display_limit'"
    ).fetchone()
    limit = 0
    if setting:
        try: limit = int(setting['value'])
        except (ValueError, TypeError): limit = 0

    if limit > 0:
        rows = conn.execute('SELECT * FROM hero_slides ORDER BY order_index ASC, id ASC LIMIT ?', (limit,)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM hero_slides ORDER BY order_index ASC, id ASC').fetchall()
    conn.close()
    return jsonify({'success': True, 'data': serialize_rows(rows)})


# ===========================================================================
# ADMIN ENDPOINTS  (CRUD — require login)
# ===========================================================================

# --- Prebuilt PCs ---

@content_bp.route('/admin/api/prebuilt_pcs', methods=['GET'])
@login_required
def admin_get_pcs():
    conn = db.get_conn()
    rows = conn.execute('SELECT * FROM prebuilt_pcs ORDER BY id').fetchall()
    conn.close()
    return jsonify({'success': True, 'data': [_parse_pc(r) for r in rows]})


@content_bp.route('/admin/api/prebuilt_pcs', methods=['POST'])
@login_required
def admin_add_pc():
    data = request.get_json()
    specs_json = json.dumps(data.get('specs', []))
    tags_json = json.dumps(data.get('tags', []))
    def _s(val, default=''):
        return str(val).strip() if val is not None else default

    conn = db.get_conn()
    cursor = conn.execute(
        '''INSERT INTO prebuilt_pcs
           (tier_name, tier_badge, name, price, discount, photo_url, specs, tier_color, featured, media_type, tags)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (_s(data.get('tier_name')), _s(data.get('tier_badge')),
         _s(data.get('name')), _s(data.get('price')),
         _s(data.get('discount')), _s(data.get('photo_url')),
         specs_json, _s(data.get('tier_color', '#0066FF')),
         1 if data.get('featured') else 0,
         _s(data.get('media_type', 'image')),
         tags_json)
    )
    conn.commit()
    new_id = cursor.lastrowid
    row = conn.execute('SELECT * FROM prebuilt_pcs WHERE id = ?', (new_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'data': _parse_pc(row)})


@content_bp.route('/admin/api/prebuilt_pcs/<int:pc_id>', methods=['PUT'])
@login_required
def admin_update_pc(pc_id):
    data = request.get_json()
    specs_json = json.dumps(data.get('specs', []))
    tags_json = json.dumps(data.get('tags', []))

    def _s(val, default=''):
        return str(val).strip() if val is not None else default

    conn = db.get_conn()
    result = conn.execute(
        '''UPDATE prebuilt_pcs
           SET tier_name=?, tier_badge=?, name=?, price=?, discount=?,
               photo_url=?, specs=?, tier_color=?, featured=?, media_type=?, tags=?
           WHERE id=?''',
        (_s(data.get('tier_name')), _s(data.get('tier_badge')),
         _s(data.get('name')), _s(data.get('price')),
         _s(data.get('discount')), _s(data.get('photo_url')),
         specs_json, _s(data.get('tier_color')),
         1 if data.get('featured') else 0,
         _s(data.get('media_type', 'image')),
         tags_json, pc_id)
    )
    if result.rowcount == 0:
        conn.close()
        return jsonify({'success': False, 'error': 'PC not found'}), 404
    conn.commit()
    row = conn.execute('SELECT * FROM prebuilt_pcs WHERE id = ?', (pc_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'data': _parse_pc(row)})


@content_bp.route('/admin/api/prebuilt_pcs/<int:pc_id>', methods=['DELETE'])
@login_required
def admin_delete_pc(pc_id):
    conn = db.get_conn()
    conn.execute('DELETE FROM prebuilt_pcs WHERE id = ?', (pc_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# --- IT Tips ---

@content_bp.route('/admin/api/it_tips', methods=['GET'])
@login_required
def admin_get_tips():
    conn = db.get_conn()
    rows = conn.execute('SELECT * FROM it_tips ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify({'success': True, 'data': [_parse_tip(r) for r in rows]})


@content_bp.route('/admin/api/it_tips', methods=['POST'])
@login_required
def admin_add_tip():
    data = request.get_json()
    tags_json = json.dumps(data.get('tags', []))
    conn = db.get_conn()
    cursor = conn.execute(
        'INSERT INTO it_tips (title, description, media_type, media_url, tags, target_page) VALUES (?, ?, ?, ?, ?, ?)',
        (data.get('title', '').strip(), data.get('description', '').strip(),
         data.get('media_type', 'video').strip(), data.get('media_url', '').strip(),
         tags_json, data.get('target_page', 'home'))
    )
    conn.commit()
    new_id = cursor.lastrowid
    row = conn.execute('SELECT * FROM it_tips WHERE id = ?', (new_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'data': _parse_tip(row)})


@content_bp.route('/admin/api/it_tips/<int:tip_id>', methods=['PUT'])
@login_required
def admin_update_tip(tip_id):
    data = request.get_json()
    tags_json = json.dumps(data.get('tags', []))
    conn = db.get_conn()
    conn.execute(
        'UPDATE it_tips SET title=?, description=?, media_type=?, media_url=?, tags=?, target_page=? WHERE id=?',
        (data.get('title', '').strip(), data.get('description', '').strip(),
         data.get('media_type', 'video').strip(), data.get('media_url', '').strip(),
         tags_json, data.get('target_page', 'home'), tip_id)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM it_tips WHERE id = ?', (tip_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'data': _parse_tip(row)})


@content_bp.route('/admin/api/it_tips/<int:tip_id>', methods=['DELETE'])
@login_required
def admin_delete_tip(tip_id):
    conn = db.get_conn()
    conn.execute('DELETE FROM it_tips WHERE id = ?', (tip_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# --- Testimonials ---

@content_bp.route('/admin/api/testimonials', methods=['GET'])
@login_required
def admin_get_testimonials():
    conn = db.get_conn()
    rows = conn.execute('SELECT * FROM testimonials ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify({'success': True, 'data': serialize_rows(rows)})


@content_bp.route('/admin/api/testimonials', methods=['POST'])
@login_required
def admin_add_testimonial():
    data = request.get_json()
    conn = db.get_conn()
    cursor = conn.execute(
        'INSERT INTO testimonials (name, role, content, rating, image_url) VALUES (?, ?, ?, ?, ?)',
        (data.get('name', '').strip(), data.get('role', '').strip(),
         data.get('content', '').strip(), int(data.get('rating', 5)),
         data.get('image_url', '').strip())
    )
    conn.commit()
    new_id = cursor.lastrowid
    row = conn.execute('SELECT * FROM testimonials WHERE id = ?', (new_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'data': serialize_row(row)})


@content_bp.route('/admin/api/testimonials/<int:t_id>', methods=['PUT'])
@login_required
def admin_update_testimonial(t_id):
    data = request.get_json()
    conn = db.get_conn()
    conn.execute(
        'UPDATE testimonials SET name=?, role=?, content=?, rating=?, image_url=? WHERE id=?',
        (data.get('name', '').strip(), data.get('role', '').strip(),
         data.get('content', '').strip(), int(data.get('rating', 5)),
         data.get('image_url', '').strip(), t_id)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM testimonials WHERE id = ?', (t_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'data': serialize_row(row)})


@content_bp.route('/admin/api/testimonials/<int:t_id>', methods=['DELETE'])
@login_required
def admin_delete_testimonial(t_id):
    conn = db.get_conn()
    conn.execute('DELETE FROM testimonials WHERE id = ?', (t_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# --- Site Settings ---

@content_bp.route('/admin/api/settings', methods=['GET'])
@login_required
def admin_get_settings():
    conn = db.get_conn()
    rows = conn.execute('SELECT key, value FROM site_settings').fetchall()
    conn.close()
    settings = {r['key']: r['value'] for r in rows}
    settings.setdefault('active_festival', 'none')
    settings.setdefault('tips_display_count', '0')
    settings.setdefault('hero_slide_duration', '8')
    settings.setdefault('hero_display_limit', '0')
    return jsonify({'success': True, 'data': settings})


@content_bp.route('/admin/api/settings', methods=['POST'])
@login_required
def admin_update_settings():
    data = request.get_json()
    def _safe_int(val, default=0):
        try:
            if val is None or str(val).strip() == '': return default
            return int(val)
        except (ValueError, TypeError): return default

    active_festival    = data.get('active_festival', 'none')
    tips_display_count   = str(_safe_int(data.get('tips_display_count'), 0))
    hero_slide_duration  = str(_safe_int(data.get('hero_slide_duration'), 8))
    hero_display_limit   = str(_safe_int(data.get('hero_display_limit'), 0))
    if int(hero_slide_duration) < 1: hero_slide_duration = '8'

    conn = db.get_conn()
    conn.execute(
        "INSERT OR REPLACE INTO site_settings (key, value) VALUES ('active_festival', ?)",
        (active_festival,)
    )
    conn.execute(
        "INSERT OR REPLACE INTO site_settings (key, value) VALUES ('tips_display_count', ?)",
        (tips_display_count,)
    )
    conn.execute(
        "INSERT OR REPLACE INTO site_settings (key, value) VALUES ('hero_slide_duration', ?)",
        (hero_slide_duration,)
    )
    conn.execute(
        "INSERT OR REPLACE INTO site_settings (key, value) VALUES ('hero_display_limit', ?)",
        (hero_display_limit,)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'data': {
        'active_festival': active_festival,
        'tips_display_count': int(tips_display_count),
        'hero_slide_duration': int(hero_slide_duration),
        'hero_display_limit': int(hero_display_limit)
    }})


# --- Hero Slides ---

@content_bp.route('/admin/api/hero_slides', methods=['GET'])
@login_required
def admin_get_slides():
    conn = db.get_conn()
    rows = conn.execute('SELECT * FROM hero_slides ORDER BY order_index ASC, id ASC').fetchall()
    conn.close()
    return jsonify({'success': True, 'data': serialize_rows(rows)})


@content_bp.route('/admin/api/hero_slides', methods=['POST'])
@login_required
def admin_add_slide():
    data = request.get_json()
    conn = db.get_conn()
    cursor = conn.execute(
        '''INSERT INTO hero_slides (title, subtitle, media_type, media_url, button_text, target_page, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?)''',
        (data.get('title', '').strip(), data.get('subtitle', '').strip(),
         data.get('media_type', 'image').strip(), data.get('media_url', '').strip(),
         data.get('button_text', 'Learn More').strip(), data.get('target_page', 'home').strip(),
         int(data.get('order_index', 0)))
    )
    conn.commit()
    new_id = cursor.lastrowid
    row = conn.execute('SELECT * FROM hero_slides WHERE id = ?', (new_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'data': serialize_row(row)})


@content_bp.route('/admin/api/hero_slides/<int:slide_id>', methods=['PUT'])
@login_required
def admin_update_slide(slide_id):
    data = request.get_json()
    conn = db.get_conn()
    conn.execute(
        '''UPDATE hero_slides SET title=?, subtitle=?, media_type=?, media_url=?,
           button_text=?, target_page=?, order_index=? WHERE id=?''',
        (data.get('title', '').strip(), data.get('subtitle', '').strip(),
         data.get('media_type', 'image').strip(), data.get('media_url', '').strip(),
         data.get('button_text', 'Learn More').strip(), data.get('target_page', 'home').strip(),
         int(data.get('order_index', 0)), slide_id)
    )
    conn.commit()
    row = conn.execute('SELECT * FROM hero_slides WHERE id = ?', (slide_id,)).fetchone()
    conn.close()
    return jsonify({'success': True, 'data': serialize_row(row)})


@content_bp.route('/admin/api/hero_slides/<int:slide_id>', methods=['DELETE'])
@login_required
def admin_delete_slide(slide_id):
    conn = db.get_conn()
    conn.execute('DELETE FROM hero_slides WHERE id = ?', (slide_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})
