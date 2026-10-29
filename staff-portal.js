/* ============================================================
   SHIRO IT — Staff Portal (staff-portal.js)
   Triggers:
   - Click "Staff Portal" in footer or shield icon in navbar
   - Keyboard shortcut: Ctrl + Shift + L or Ctrl + Shift + S
   - Global function: window.openStaffPortal()
   ============================================================ */

(function () {
  'use strict';

  /* ── API base ─────────────────────────────────────────────── */
  const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
    ? 'http://localhost:5000'
    : window.location.origin;

  /* ── State ───────────────────────────────────────────────── */
  let spLoggedIn    = false;
  let spUsername    = '';
  let spActivePanel = 'dashboard';
  let spFormCallback = null;   // function called on form save
  let spTagValues   = [];      // current tags in tag-input
  let spUploadField = null;    // which form field receives uploaded url

  /* ── DOM injection ───────────────────────────────────────── */
  function injectDOM() {
    // Login overlay
    document.body.insertAdjacentHTML('beforeend', `
      <div id="sp-login-overlay">
        <div class="sp-login-box">
          <button class="sp-login-close" id="sp-login-close-btn" title="Close">&#x2715;</button>
          <div class="sp-login-logo">
            <i class="fas fa-shield-alt"></i>
            <span>SHIRO IT</span>
          </div>
          <div class="sp-login-sub">Staff Portal — Authorised Access Only</div>
          <h2>Sign In</h2>
          <div class="sp-field">
            <label>Username</label>
            <input type="text" id="sp-username" placeholder="Enter username" autocomplete="username" />
          </div>
          <div class="sp-field">
            <label>Password</label>
            <input type="password" id="sp-password" placeholder="Enter password" autocomplete="current-password" />
          </div>
          <button class="sp-login-btn" id="sp-login-btn">Sign In</button>
          <div class="sp-login-error" id="sp-login-error"></div>
          <div class="sp-shortcut-hint">Shortcut: <kbd>Ctrl+Shift+L</kbd> or <kbd>Ctrl+Shift+S</kbd></div>
        </div>
      </div>

      <!-- Staff Dashboard -->
      <div id="sp-dashboard">
        <!-- Sidebar -->
        <div class="sp-sidebar">
          <div class="sp-sidebar-header">
            <div class="sp-sidebar-logo">
              <i class="fas fa-microchip"></i>
              <span class="sp-sidebar-logo-text">SHIRO IT</span>
            </div>
            <div class="sp-sidebar-role">Staff Portal</div>
            <div class="sp-user-badge">
              <div class="sp-user-avatar" id="sp-avatar-letter">S</div>
              <div class="sp-user-info">
                <div class="sp-user-name" id="sp-sidebar-username">Staff</div>
                <div class="sp-user-role">Authorised Staff</div>
              </div>
            </div>
          </div>

          <nav class="sp-nav">
            <div class="sp-nav-section">
              <div class="sp-nav-section-title">Overview</div>
              <button class="sp-nav-item active" data-panel="dashboard">
                <i class="fas fa-tachometer-alt"></i> Dashboard
              </button>
            </div>
            <div class="sp-nav-section">
              <div class="sp-nav-section-title">Inbox</div>
              <button class="sp-nav-item" data-panel="contacts">
                <i class="fas fa-envelope"></i> Messages
                <span class="sp-badge" id="sp-badge-contacts" style="display:none"></span>
              </button>
              <button class="sp-nav-item" data-panel="appointments">
                <i class="fas fa-calendar-check"></i> Appointments
                <span class="sp-badge" id="sp-badge-appointments" style="display:none"></span>
              </button>
              <button class="sp-nav-item" data-panel="quotes">
                <i class="fas fa-file-invoice-dollar"></i> PC Quotes
                <span class="sp-badge" id="sp-badge-quotes" style="display:none"></span>
              </button>
              <button class="sp-nav-item" data-panel="bookings">
                <i class="fas fa-tools"></i> Service Bookings
                <span class="sp-badge" id="sp-badge-bookings" style="display:none"></span>
              </button>
              <button class="sp-nav-item" data-panel="applications">
                <i class="fas fa-user-tie"></i> Job Applications
                <span class="sp-badge" id="sp-badge-applications" style="display:none"></span>
              </button>
            </div>
            <div class="sp-nav-section">
              <div class="sp-nav-section-title">Catalogue</div>
              <button class="sp-nav-item" data-panel="inventory">
                <i class="fas fa-boxes"></i> Inventory
              </button>
              <button class="sp-nav-item" data-panel="products">
                <i class="fas fa-desktop"></i> Prebuilt PCs
              </button>
              <button class="sp-nav-item" data-panel="careers">
                <i class="fas fa-briefcase"></i> Careers
              </button>
            </div>
            <div class="sp-nav-section">
              <div class="sp-nav-section-title">Content</div>
              <button class="sp-nav-item" data-panel="slides">
                <i class="fas fa-images"></i> Hero Slides
              </button>
              <button class="sp-nav-item" data-panel="tips">
                <i class="fas fa-lightbulb"></i> IT Tips
              </button>
              <button class="sp-nav-item" data-panel="testimonials">
                <i class="fas fa-star"></i> Testimonials
              </button>
              <button class="sp-nav-item" data-panel="team">
                <i class="fas fa-users"></i> Team Members
              </button>
            </div>
            <div class="sp-nav-section">
              <div class="sp-nav-section-title">Config</div>
              <button class="sp-nav-item" data-panel="settings">
                <i class="fas fa-cog"></i> Site Settings
              </button>
            </div>
          </nav>

          <div class="sp-sidebar-footer">
            <button class="sp-exit-btn" id="sp-exit-btn">
              <i class="fas fa-arrow-left"></i> Back to Website
            </button>
            <button class="sp-logout-btn" id="sp-logout-btn">
              <i class="fas fa-sign-out-alt"></i> Sign Out
            </button>
          </div>
        </div>

        <!-- Main -->
        <div class="sp-main">
          <div class="sp-topbar">
            <div class="sp-topbar-title" id="sp-topbar-title">
              <i class="fas fa-tachometer-alt"></i> Dashboard
            </div>
            <div class="sp-topbar-actions">
              <button class="sp-refresh-btn" id="sp-refresh-btn">
                <i class="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
          </div>

          <div class="sp-content">
            <!-- Dashboard panel -->
            <div class="sp-panel active" id="sp-panel-dashboard">
              <div class="sp-stats-row" id="sp-stats-row">
                <div class="sp-loading"><div class="sp-spinner"></div> Loading...</div>
              </div>
            </div>

            <!-- Contacts -->
            <div class="sp-panel" id="sp-panel-contacts">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-envelope"></i> Contact Messages</h3>
                </div>
                <div id="sp-contacts-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Appointments -->
            <div class="sp-panel" id="sp-panel-appointments">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-calendar-check"></i> Appointments</h3>
                </div>
                <div id="sp-appointments-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Quotes -->
            <div class="sp-panel" id="sp-panel-quotes">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-file-invoice-dollar"></i> PC Build Quotes</h3>
                </div>
                <div id="sp-quotes-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Bookings -->
            <div class="sp-panel" id="sp-panel-bookings">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-tools"></i> Service Bookings</h3>
                </div>
                <div id="sp-bookings-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Applications -->
            <div class="sp-panel" id="sp-panel-applications">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-user-tie"></i> Job Applications</h3>
                </div>
                <div id="sp-applications-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Inventory -->
            <div class="sp-panel" id="sp-panel-inventory">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-boxes"></i> PC Components Inventory</h3>
                  <button class="sp-add-btn" id="sp-inventory-add-btn"><i class="fas fa-plus"></i> Add Component</button>
                </div>
                <div id="sp-inventory-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Products / Prebuilt PCs -->
            <div class="sp-panel" id="sp-panel-products">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-desktop"></i> Prebuilt PCs</h3>
                  <button class="sp-add-btn" id="sp-products-add-btn"><i class="fas fa-plus"></i> Add PC</button>
                </div>
                <div id="sp-products-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Careers -->
            <div class="sp-panel" id="sp-panel-careers">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-briefcase"></i> Career Listings</h3>
                  <button class="sp-add-btn" id="sp-careers-add-btn"><i class="fas fa-plus"></i> Add Listing</button>
                </div>
                <div id="sp-careers-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Hero Slides -->
            <div class="sp-panel" id="sp-panel-slides">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-images"></i> Hero Slides</h3>
                  <button class="sp-add-btn" id="sp-slides-add-btn"><i class="fas fa-plus"></i> Add Slide</button>
                </div>
                <div id="sp-slides-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- IT Tips -->
            <div class="sp-panel" id="sp-panel-tips">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-lightbulb"></i> IT Tips & Tricks</h3>
                  <button class="sp-add-btn" id="sp-tips-add-btn"><i class="fas fa-plus"></i> Add Tip</button>
                </div>
                <div id="sp-tips-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Testimonials -->
            <div class="sp-panel" id="sp-panel-testimonials">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-star"></i> Testimonials</h3>
                  <button class="sp-add-btn" id="sp-testimonials-add-btn"><i class="fas fa-plus"></i> Add</button>
                </div>
                <div id="sp-testimonials-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Team -->
            <div class="sp-panel" id="sp-panel-team">
              <div class="sp-table-wrap">
                <div class="sp-table-header">
                  <h3><i class="fas fa-users"></i> Team Members</h3>
                  <button class="sp-add-btn" id="sp-team-add-btn"><i class="fas fa-plus"></i> Add Member</button>
                </div>
                <div id="sp-team-body"><div class="sp-loading"><div class="sp-spinner"></div></div></div>
              </div>
            </div>

            <!-- Settings -->
            <div class="sp-panel" id="sp-panel-settings">
              <div class="sp-table-wrap" id="sp-settings-body">
                <div class="sp-loading"><div class="sp-spinner"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form modal -->
      <div id="sp-form-overlay">
        <div class="sp-form-box" id="sp-form-box">
          <!-- filled dynamically -->
        </div>
      </div>

      <!-- Toast container -->
      <div id="sp-toast"></div>

      <!-- Hidden file input for image upload -->
      <input type="file" id="sp-file-input" accept="image/*,video/*" style="display:none" />
    `);
  }

  /* ── Toast ───────────────────────────────────────────────── */
  function spToast(msg, type = 'info', dur = 3200) {
    const icons = { success: 'check-circle', error: 'times-circle', info: 'info-circle' };
    const el = document.createElement('div');
    el.className = `sp-toast-item ${type}`;
    el.innerHTML = `<i class="fas fa-${icons[type]}"></i> ${msg}`;
    document.getElementById('sp-toast').appendChild(el);
    setTimeout(() => el.remove(), dur);
  }

  /* ── API helpers ─────────────────────────────────────────── */
  async function spGet(path) {
    const r = await fetch(API + path, { credentials: 'include' });
    return r.json();
  }

  async function spPost(path, body) {
    const r = await fetch(API + path, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return r.json();
  }

  async function spPut(path, body) {
    const r = await fetch(API + path, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return r.json();
  }

  async function spDelete(path) {
    const r = await fetch(API + path, { method: 'DELETE', credentials: 'include' });
    return r.json();
  }

  /* ── Login / logout ──────────────────────────────────────── */
  async function doLogin() {
    const u = document.getElementById('sp-username').value.trim();
    const p = document.getElementById('sp-password').value;
    const btn = document.getElementById('sp-login-btn');
    const err = document.getElementById('sp-login-error');
    err.style.display = 'none';
    if (!u || !p) { err.textContent = 'Please enter username and password.'; err.style.display = 'block'; return; }
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    try {
      const d = await spPost('/admin/login', { username: u, password: p });
      if (d.success) {
        spLoggedIn = true;
        spUsername = u;
        document.getElementById('sp-login-overlay').classList.remove('active');
        openDashboard();
      } else {
        err.textContent = d.error || 'Invalid credentials.';
        err.style.display = 'block';
      }
    } catch(e) {
      err.textContent = 'Connection error. Make sure the backend server is running (port 5000).';
      err.style.display = 'block';
    }
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }

  async function doLogout() {
    try {
      await spPost('/admin/logout', {});
    } catch(e) { /* ignore */ }
    spLoggedIn = false;
    document.getElementById('sp-dashboard').classList.remove('active');
    spToast('Signed out', 'info');
  }

  /* ── Dashboard open / close ──────────────────────────────── */
  function openDashboard() {
    const dash = document.getElementById('sp-dashboard');
    dash.classList.add('active');
    document.getElementById('sp-sidebar-username').textContent = spUsername || 'Staff';
    document.getElementById('sp-avatar-letter').textContent = (spUsername ? spUsername[0] : 'S').toUpperCase();
    switchPanel('dashboard');
    loadStats();
  }

  function closeDashboard() {
    document.getElementById('sp-dashboard').classList.remove('active');
  }

  /* ── Panel switching ─────────────────────────────────────── */
  const panelMeta = {
    dashboard:    { title: 'Dashboard',         icon: 'tachometer-alt',   load: loadStats },
    contacts:     { title: 'Contact Messages',  icon: 'envelope',         load: loadContacts },
    appointments: { title: 'Appointments',      icon: 'calendar-check',   load: loadAppointments },
    quotes:       { title: 'PC Build Quotes',   icon: 'file-invoice-dollar', load: loadQuotes },
    bookings:     { title: 'Service Bookings',  icon: 'tools',            load: loadBookings },
    applications: { title: 'Job Applications',  icon: 'user-tie',         load: loadApplications },
    inventory:    { title: 'Inventory',         icon: 'boxes',            load: loadInventory },
    products:     { title: 'Prebuilt PCs',      icon: 'desktop',          load: loadProducts },
    careers:      { title: 'Career Listings',   icon: 'briefcase',        load: loadCareers },
    slides:       { title: 'Hero Slides',       icon: 'images',           load: loadSlides },
    tips:         { title: 'IT Tips & Tricks',  icon: 'lightbulb',        load: loadTips },
    testimonials: { title: 'Testimonials',      icon: 'star',             load: loadTestimonials },
    team:         { title: 'Team Members',      icon: 'users',            load: loadTeam },
    settings:     { title: 'Site Settings',     icon: 'cog',              load: loadSettings },
  };

  function switchPanel(id) {
    spActivePanel = id;
    // Update nav items
    document.querySelectorAll('.sp-nav-item').forEach(el => el.classList.remove('active'));
    const navEl = document.querySelector(`.sp-nav-item[data-panel="${id}"]`);
    if (navEl) navEl.classList.add('active');
    // Update panels
    document.querySelectorAll('.sp-panel').forEach(el => el.classList.remove('active'));
    document.getElementById(`sp-panel-${id}`)?.classList.add('active');
    // Update topbar
    const meta = panelMeta[id] || {};
    document.getElementById('sp-topbar-title').innerHTML =
      `<i class="fas fa-${meta.icon}"></i> ${meta.title}`;
    // Load data
    if (meta.load) meta.load();
  }

  /* ── Stats (Dashboard) ───────────────────────────────────── */
  async function loadStats() {
    const row = document.getElementById('sp-stats-row');
    row.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div> Loading...</div>';
    try {
      const d = await spGet('/admin/api/stats');
      if (!d.success) throw new Error(d.error);
      const s = d.stats;
      // Update sidebar badges
      setBadge('sp-badge-contacts', s.contacts_unread);
      setBadge('sp-badge-appointments', s.appointments_pending);
      setBadge('sp-badge-quotes', s.quotes_new);
      setBadge('sp-badge-bookings', s.bookings_new);
      setBadge('sp-badge-applications', s.applications_new);

      const cards = [
        { n: s.contacts,     label: 'Messages',      icon: 'envelope',              bg: 'rgba(99,102,241,0.15)',  col: '#818cf8', sub: s.contacts_unread + ' unread' },
        { n: s.appointments, label: 'Appointments',  icon: 'calendar-check',        bg: 'rgba(245,158,11,0.15)', col: '#fbbf24', sub: s.appointments_pending + ' pending' },
        { n: s.quotes,       label: 'PC Quotes',     icon: 'file-invoice-dollar',   bg: 'rgba(59,130,246,0.15)', col: '#60a5fa', sub: s.quotes_new + ' new' },
        { n: s.bookings,     label: 'Bookings',      icon: 'tools',                 bg: 'rgba(16,185,129,0.15)', col: '#34d399', sub: s.bookings_new + ' new' },
        { n: s.applications, label: 'Applications',  icon: 'user-tie',              bg: 'rgba(167,139,250,0.15)', col: '#a78bfa', sub: s.applications_new + ' new' },
        { n: s.inventory,    label: 'Inventory',     icon: 'boxes',                 bg: 'rgba(239,68,68,0.15)', col: '#f87171', sub: 'PC components' },
      ];
      row.innerHTML = cards.map(c => `
        <div class="sp-stat-card">
          <div class="sp-stat-icon" style="background:${c.bg}">
            <i class="fas fa-${c.icon}" style="color:${c.col}"></i>
          </div>
          <h3>${c.n}</h3>
          <p>${c.label}</p>
          <p style="margin-top:4px;color:${c.col};font-size:11px">${c.sub}</p>
        </div>
      `).join('');
    } catch(e) {
      row.innerHTML = `<div class="sp-empty"><i class="fas fa-exclamation-circle"></i><p>Failed to load: ${e.message}</p></div>`;
    }
  }

  function setBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) { el.textContent = count; el.style.display = ''; }
    else { el.style.display = 'none'; }
  }

  /* ── Helpers ─────────────────────────────────────────────── */
  function fmtDate(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function statusBadge(status, isRead) {
    if (isRead !== undefined) {
      return isRead
        ? '<span class="sp-status read">Read</span>'
        : '<span class="sp-status unread">Unread</span>';
    }
    const map = {
      'New':          'new',
      'Pending':      'pending',
      'In Progress':  'progress',
      'Completed':    'done',
      'Rejected':     'rejected',
      'Interviewed':  'progress',
      'Hired':        'done',
      'Read':         'read',
    };
    const cls = map[status] || 'new';
    return `<span class="sp-status ${cls}">${status || 'New'}</span>`;
  }

  function confirmDelete(msg, cb) {
    if (window.confirm(msg)) cb();
  }

  /* ── Contacts ───────────────────────────────────────────── */
  async function loadContacts() {
    const el = document.getElementById('sp-contacts-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/contacts');
    if (!d.success) { el.innerHTML = `<div class="sp-empty"><i class="fas fa-times"></i><p>${d.error}</p></div>`; return; }
    if (!d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-inbox"></i><p>No messages yet</p></div>'; return; }
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.name)}</td>
          <td>${esc(r.email)}</td>
          <td>
            ${esc(r.subject)}
            <div class="sp-msg-expand" id="sp-msg-${r.id}">${esc(r.message)}</div>
          </td>
          <td class="sp-td-muted">${fmtDate(r.created_at)}</td>
          <td>${statusBadge(null, r.is_read)}</td>
          <td>
            <button class="sp-act-btn primary" onclick="spToggleMsg(${r.id})"><i class="fas fa-eye"></i> View</button>
            ${r.is_read
              ? `<button class="sp-act-btn warning" onclick="spMarkContact(${r.id}, 0)"><i class="fas fa-envelope"></i> Unread</button>`
              : `<button class="sp-act-btn success" onclick="spMarkContact(${r.id}, 1)"><i class="fas fa-check"></i> Mark Read</button>`
            }
            <button class="sp-act-btn danger" onclick="spDeleteItem('contact', ${r.id}, loadContacts)"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  window.spToggleMsg = function(id) {
    const el = document.getElementById(`sp-msg-${id}`);
    if (el) el.classList.toggle('show');
  };

  window.spMarkContact = async function(id, val) {
    const d = await spPost('/admin/api/update-status', { type: 'contact', id, status: val ? 'Read' : 'Unread' });
    if (d.success) { spToast('Status updated', 'success'); loadContacts(); } else spToast(d.error, 'error');
  };

  /* ── Generic delete ──────────────────────────────────────── */
  window.spDeleteItem = function(type, id, reloadFn) {
    confirmDelete('Are you sure you want to delete this item?', async () => {
      const d = await spPost('/admin/api/delete', { type, id });
      if (d.success) { spToast('Deleted', 'success'); reloadFn(); } else spToast(d.error || 'Failed', 'error');
    });
  };

  /* ── Generic status update ───────────────────────────────── */
  window.spUpdateStatus = async function(type, id, status, reloadFn) {
    const d = await spPost('/admin/api/update-status', { type, id, status });
    if (d.success) { spToast('Status updated', 'success'); reloadFn(); } else spToast(d.error || 'Failed', 'error');
  };

  /* ── Appointments ────────────────────────────────────────── */
  async function loadAppointments() {
    const el = document.getElementById('sp-appointments-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/appointments');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-calendar"></i><p>No appointments yet</p></div>'; return; }
    const statuses = ['Pending','In Progress','Completed','Rejected'];
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Name</th><th>Service</th><th>Date / Time</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.name)}</td>
          <td>${esc(r.service_type)}</td>
          <td>${esc(r.preferred_date)} ${esc(r.preferred_time)}</td>
          <td>${esc(r.phone)}</td>
          <td>${statusBadge(r.status)}</td>
          <td>
            <select class="sp-mini-select" onchange="spUpdateStatus('appointment', ${r.id}, this.value, loadAppointments)" style="background:rgba(255,255,255,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:6px;color:#fff;padding:5px 8px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif">
              ${statuses.map(s => `<option value="${s}" style="background:#1a1a2e" ${r.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
            <button class="sp-act-btn danger" onclick="spDeleteItem('appointment', ${r.id}, loadAppointments)"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  /* ── Quotes ──────────────────────────────────────────────── */
  async function loadQuotes() {
    const el = document.getElementById('sp-quotes-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/quotes');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-file"></i><p>No quotes yet</p></div>'; return; }
    const statuses = ['New','In Progress','Completed','Rejected'];
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Budget</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.name)}</td>
          <td>${esc(r.email)}</td>
          <td>${esc(r.phone)}</td>
          <td>${r.build_config && r.build_config.budget ? 'RM ' + esc(r.build_config.budget) : '—'}</td>
          <td class="sp-td-muted">${fmtDate(r.created_at)}</td>
          <td>${statusBadge(r.status)}</td>
          <td>
            <select onchange="spUpdateStatus('quote', ${r.id}, this.value, loadQuotes)" style="background:rgba(255,255,255,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:6px;color:#fff;padding:5px 8px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif">
              ${statuses.map(s => `<option value="${s}" style="background:#1a1a2e" ${r.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
            <button class="sp-act-btn danger" onclick="spDeleteItem('quote', ${r.id}, loadQuotes)"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  /* ── Bookings ────────────────────────────────────────────── */
  async function loadBookings() {
    const el = document.getElementById('sp-bookings-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/bookings');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-tools"></i><p>No bookings yet</p></div>'; return; }
    const statuses = ['New','In Progress','Completed','Rejected'];
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Name</th><th>Service</th><th>Email</th><th>Phone</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.name)}</td>
          <td>${esc(r.service_name||r.service_type||'—')}</td>
          <td>${esc(r.email)}</td>
          <td>${esc(r.phone)}</td>
          <td class="sp-td-muted">${fmtDate(r.created_at)}</td>
          <td>${statusBadge(r.status)}</td>
          <td>
            <select onchange="spUpdateStatus('booking', ${r.id}, this.value, loadBookings)" style="background:rgba(255,255,255,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:6px;color:#fff;padding:5px 8px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif">
              ${statuses.map(s => `<option value="${s}" style="background:#1a1a2e" ${r.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
            <button class="sp-act-btn danger" onclick="spDeleteItem('booking', ${r.id}, loadBookings)"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  /* ── Applications ────────────────────────────────────────── */
  async function loadApplications() {
    const el = document.getElementById('sp-applications-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/applications');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-users"></i><p>No applications yet</p></div>'; return; }
    const statuses = ['New','Interviewed','Hired','Rejected'];
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Name</th><th>Position</th><th>Email</th><th>Phone</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.name)}</td>
          <td>${esc(r.position)}</td>
          <td>${esc(r.email)}</td>
          <td>${esc(r.phone)}</td>
          <td class="sp-td-muted">${fmtDate(r.created_at)}</td>
          <td>${statusBadge(r.status)}</td>
          <td>
            ${r.resume_filename ? `<a href="${API}/admin/api/download-resume/${esc(r.resume_filename)}" target="_blank" class="sp-act-btn primary"><i class="fas fa-file-pdf"></i> CV</a>` : ''}
            <select onchange="spUpdateStatus('application', ${r.id}, this.value, loadApplications)" style="background:rgba(255,255,255,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:6px;color:#fff;padding:5px 8px;font-size:12px;cursor:pointer;font-family:Inter,sans-serif">
              ${statuses.map(s => `<option value="${s}" style="background:#1a1a2e" ${r.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
            <button class="sp-act-btn danger" onclick="spDeleteItem('application', ${r.id}, loadApplications)"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  /* ── Inventory ───────────────────────────────────────────── */
  async function loadInventory() {
    const el = document.getElementById('sp-inventory-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/inventory');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-boxes"></i><p>No components yet</p></div>'; return; }
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Name</th><th>Category</th><th>Brand</th><th>Price (RM)</th><th>Badge</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.name)}</td>
          <td>${esc(r.category)}</td>
          <td>${esc(r.brand||'—')}</td>
          <td>${r.price ? 'RM '+Number(r.price).toFixed(2) : '—'}</td>
          <td>${r.badge ? `<span class="sp-status new">${esc(r.badge)}</span>` : '—'}</td>
          <td>
            <button class="sp-act-btn primary" onclick="spEditInventory(${JSON.stringify(r).replace(/"/g,'&quot;')})"><i class="fas fa-edit"></i> Edit</button>
            <button class="sp-act-btn danger" onclick="spDelInventory(${r.id})"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  window.spEditInventory = function(r) {
    showForm('Edit Component', [
      { label:'Name', id:'inv-name', val: r.name },
      { label:'Category', id:'inv-cat', type:'select', val: r.category,
        options:['CPU','GPU','RAM','Motherboard','Storage','PSU','Cooling','Case','Monitor','Peripheral','Other'] },
      { label:'Brand', id:'inv-brand', val: r.brand||'' },
      { label:'Price (RM)', id:'inv-price', type:'number', val: r.price||0 },
      { label:'Specs / Description', id:'inv-specs', type:'textarea', val: r.specs||'' },
      { label:'Badge (e.g. New, Hot)', id:'inv-badge', val: r.badge||'' },
    ], async (vals) => {
      const d = await spPut(`/admin/api/inventory/${r.id}`, {
        name: vals['inv-name'], category: vals['inv-cat'], brand: vals['inv-brand'],
        price: parseFloat(vals['inv-price'])||0, specs: vals['inv-specs'], badge: vals['inv-badge']
      });
      if (d.success) { spToast('Component updated', 'success'); closeForm(); loadInventory(); }
      else spToast(d.error||'Failed', 'error');
    });
  };

  window.spDelInventory = function(id) {
    confirmDelete('Delete this component?', async () => {
      const d = await spDelete(`/admin/api/delete/inventory/${id}`);
      if (d.success) { spToast('Deleted', 'success'); loadInventory(); } else spToast(d.error||'Failed', 'error');
    });
  };

  document.addEventListener('click', function(e) {
    if (e.target.id === 'sp-inventory-add-btn' || e.target.closest('#sp-inventory-add-btn')) {
      showForm('Add Component', [
        { label:'Name', id:'inv-name' },
        { label:'Category', id:'inv-cat', type:'select',
          options:['CPU','GPU','RAM','Motherboard','Storage','PSU','Cooling','Case','Monitor','Peripheral','Other'] },
        { label:'Brand', id:'inv-brand' },
        { label:'Price (RM)', id:'inv-price', type:'number' },
        { label:'Specs / Description', id:'inv-specs', type:'textarea' },
        { label:'Badge (e.g. New, Hot)', id:'inv-badge' },
      ], async (vals) => {
        const d = await spPost('/admin/api/inventory', {
          name: vals['inv-name'], category: vals['inv-cat'], brand: vals['inv-brand'],
          price: parseFloat(vals['inv-price'])||0, specs: vals['inv-specs'], badge: vals['inv-badge']
        });
        if (d.success) { spToast('Component added', 'success'); closeForm(); loadInventory(); }
        else spToast(d.error||'Failed', 'error');
      });
    }
  });

  /* ── Prebuilt PCs ────────────────────────────────────────── */
  async function loadProducts() {
    const el = document.getElementById('sp-products-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/prebuilt_pcs');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-desktop"></i><p>No prebuilt PCs yet</p></div>'; return; }
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Name</th><th>Tier</th><th>Price</th><th>Type</th><th>Featured</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.name)}</td>
          <td>${esc(r.tier_name)||'—'} ${r.tier_badge?`<span class="sp-status new">${esc(r.tier_badge)}</span>`:''}</td>
          <td>${r.price ? 'RM '+esc(String(r.price)) : '—'}</td>
          <td>${esc(r.pc_type||'Gaming PC')}</td>
          <td>${r.featured ? '<span class="sp-status done">Yes</span>' : '<span class="sp-status unread">No</span>'}</td>
          <td>
            <button class="sp-act-btn primary" onclick="spEditPC(${r.id})"><i class="fas fa-edit"></i> Edit</button>
            <button class="sp-act-btn danger" onclick="spDelPC(${r.id})"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  window.spEditPC = async function(id) {
    const d = await spGet('/admin/api/prebuilt_pcs');
    if (!d.success) return;
    const r = d.data.find(x => x.id === id);
    if (!r) return;
    showForm('Edit Prebuilt PC', [
      { label:'PC Name', id:'pc-name', val: r.name },
      { label:'Tier Name', id:'pc-tier', val: r.tier_name||'' },
      { label:'Tier Badge (e.g. 🔥 Best Value)', id:'pc-tier-badge', val: r.tier_badge||'' },
      { label:'Price (e.g. 2,499)', id:'pc-price', val: r.price||'' },
      { label:'Discount (e.g. 2,999)', id:'pc-discount', val: r.discount||'' },
      { label:'PC Type', id:'pc-type', val: r.pc_type||'Gaming PC' },
      { label:'Tier Color (hex)', id:'pc-color', type:'color', val: r.tier_color||'#0066FF' },
      { label:'Image / Video URL', id:'pc-photo', val: r.photo_url||'', uploadable: true },
      { label:'Media Type', id:'pc-media', type:'select', val: r.media_type||'image', options:['image','video'] },
      { label:'Specs (one per line)', id:'pc-specs', type:'textarea', val: Array.isArray(r.specs) ? r.specs.join('\n') : '' },
      { label:'Tags (press Enter)', id:'pc-tags', type:'tags', val: Array.isArray(r.tags) ? r.tags : [] },
      { label:'Display Style', id:'pc-display', type:'select', val: r.display_style||'specs', options:['specs','tags'] },
      { label:'Featured', id:'pc-featured', type:'checkbox', val: !!r.featured },
      { label:'Hide Price', id:'pc-hideprice', type:'checkbox', val: !!r.hide_price },
    ], async (vals) => {
      const payload = {
        name: vals['pc-name'], tier_name: vals['pc-tier'], tier_badge: vals['pc-tier-badge'],
        price: vals['pc-price'], discount: vals['pc-discount'], pc_type: vals['pc-type'],
        tier_color: vals['pc-color'], photo_url: vals['pc-photo'], media_type: vals['pc-media'],
        specs: vals['pc-specs'].split('\n').map(s=>s.trim()).filter(Boolean),
        tags: spTagValues, display_style: vals['pc-display'],
        featured: vals['pc-featured'] === true, hide_price: vals['pc-hideprice'] === true
      };
      const d = await spPut(`/admin/api/prebuilt_pcs/${id}`, payload);
      if (d.success) { spToast('PC updated', 'success'); closeForm(); loadProducts(); }
      else spToast(d.error||'Failed', 'error');
    });
  };

  window.spDelPC = function(id) {
    confirmDelete('Delete this prebuilt PC?', async () => {
      const d = await fetch(API + `/admin/api/prebuilt_pcs/${id}`, { method:'DELETE', credentials:'include' });
      const j = await d.json();
      if (j.success) { spToast('Deleted', 'success'); loadProducts(); } else spToast(j.error||'Failed', 'error');
    });
  };

  document.addEventListener('click', function(e) {
    if (e.target.id === 'sp-products-add-btn' || e.target.closest('#sp-products-add-btn')) {
      showForm('Add Prebuilt PC', [
        { label:'PC Name', id:'pc-name' },
        { label:'Tier Name', id:'pc-tier' },
        { label:'Tier Badge', id:'pc-tier-badge' },
        { label:'Price (e.g. 2,499)', id:'pc-price' },
        { label:'Discount (e.g. 2,999)', id:'pc-discount' },
        { label:'PC Type', id:'pc-type', val:'Gaming PC' },
        { label:'Tier Color (hex)', id:'pc-color', type:'color', val:'#0066FF' },
        { label:'Image / Video URL', id:'pc-photo', uploadable: true },
        { label:'Media Type', id:'pc-media', type:'select', val:'image', options:['image','video'] },
        { label:'Specs (one per line)', id:'pc-specs', type:'textarea' },
        { label:'Tags (press Enter)', id:'pc-tags', type:'tags', val:[] },
        { label:'Display Style', id:'pc-display', type:'select', val:'specs', options:['specs','tags'] },
        { label:'Featured', id:'pc-featured', type:'checkbox' },
        { label:'Hide Price', id:'pc-hideprice', type:'checkbox' },
      ], async (vals) => {
        const payload = {
          name: vals['pc-name'], tier_name: vals['pc-tier'], tier_badge: vals['pc-tier-badge'],
          price: vals['pc-price'], discount: vals['pc-discount'], pc_type: vals['pc-type'],
          tier_color: vals['pc-color'], photo_url: vals['pc-photo'], media_type: vals['pc-media'],
          specs: vals['pc-specs'].split('\n').map(s=>s.trim()).filter(Boolean),
          tags: spTagValues, display_style: vals['pc-display'],
          featured: vals['pc-featured']===true, hide_price: vals['pc-hideprice']===true
        };
        const d = await spPost('/admin/api/prebuilt_pcs', payload);
        if (d.success) { spToast('PC added', 'success'); closeForm(); loadProducts(); }
        else spToast(d.error||'Failed', 'error');
      });
    }
  });

  /* ── Careers ─────────────────────────────────────────────── */
  async function loadCareers() {
    const el = document.getElementById('sp-careers-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/careers');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-briefcase"></i><p>No listings yet</p></div>'; return; }
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Title</th><th>Type</th><th>Active</th><th>Order</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.title)}</td>
          <td>${esc(r.job_type)}</td>
          <td>${r.is_active ? '<span class="sp-status done">Active</span>' : '<span class="sp-status rejected">Hidden</span>'}</td>
          <td>${r.order_index}</td>
          <td>
            <button class="sp-act-btn primary" onclick="spEditCareer(${r.id})"><i class="fas fa-edit"></i> Edit</button>
            <button class="sp-act-btn danger" onclick="spDelCareer(${r.id})"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  window.spEditCareer = async function(id) {
    const d = await spGet('/admin/api/careers');
    if (!d.success) return;
    const r = d.data.find(x => x.id === id);
    if (!r) return;
    showForm('Edit Career Listing', [
      { label:'Title', id:'car-title', val: r.title },
      { label:'Job Type', id:'car-type', type:'select', val: r.job_type, options:['Full-time','Part-time','Contract','Internship'] },
      { label:'Description', id:'car-desc', type:'textarea', val: r.description||'' },
      { label:'Requirements', id:'car-req', type:'textarea', val: r.requirements||'' },
      { label:'WhatsApp Message', id:'car-wa', type:'textarea', val: r.whatsapp_msg||'' },
      { label:'Display Order', id:'car-order', type:'number', val: r.order_index||0 },
      { label:'Active', id:'car-active', type:'checkbox', val: !!r.is_active },
    ], async (vals) => {
      const d = await spPut(`/admin/api/careers/${id}`, {
        title: vals['car-title'], job_type: vals['car-type'], description: vals['car-desc'],
        requirements: vals['car-req'], whatsapp_msg: vals['car-wa'],
        order_index: parseInt(vals['car-order'])||0, is_active: vals['car-active']===true
      });
      if (d.success) { spToast('Career updated', 'success'); closeForm(); loadCareers(); }
      else spToast(d.error||'Failed', 'error');
    });
  };

  window.spDelCareer = function(id) {
    confirmDelete('Delete this career listing?', async () => {
      const d = await spDelete(`/admin/api/careers/${id}`);
      if (d.success) { spToast('Deleted', 'success'); loadCareers(); } else spToast(d.error||'Failed', 'error');
    });
  };

  document.addEventListener('click', function(e) {
    if (e.target.id === 'sp-careers-add-btn' || e.target.closest('#sp-careers-add-btn')) {
      showForm('Add Career Listing', [
        { label:'Title', id:'car-title' },
        { label:'Job Type', id:'car-type', type:'select', options:['Full-time','Part-time','Contract','Internship'] },
        { label:'Description', id:'car-desc', type:'textarea' },
        { label:'Requirements', id:'car-req', type:'textarea' },
        { label:'WhatsApp Message', id:'car-wa', type:'textarea' },
        { label:'Display Order', id:'car-order', type:'number', val:'0' },
        { label:'Active', id:'car-active', type:'checkbox', val:true },
      ], async (vals) => {
        const d = await spPost('/admin/api/careers', {
          title: vals['car-title'], job_type: vals['car-type'], description: vals['car-desc'],
          requirements: vals['car-req'], whatsapp_msg: vals['car-wa'],
          order_index: parseInt(vals['car-order'])||0, is_active: vals['car-active']===true
        });
        if (d.success) { spToast('Listing added', 'success'); closeForm(); loadCareers(); }
        else spToast(d.error||'Failed', 'error');
      });
    }
  });

  /* ── Hero Slides ─────────────────────────────────────────── */
  async function loadSlides() {
    const el = document.getElementById('sp-slides-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/hero_slides');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-images"></i><p>No slides yet</p></div>'; return; }
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Title</th><th>Subtitle</th><th>Button</th><th>Target</th><th>Order</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.title)}</td>
          <td>${esc(r.subtitle||'').substring(0,50)}${(r.subtitle||'').length>50?'…':''}</td>
          <td>${esc(r.button_text||'—')}</td>
          <td>${esc(r.target_page||'—')}</td>
          <td>${r.order_index}</td>
          <td>
            <button class="sp-act-btn primary" onclick="spEditSlide(${r.id})"><i class="fas fa-edit"></i> Edit</button>
            <button class="sp-act-btn danger" onclick="spDelSlide(${r.id})"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  window.spEditSlide = async function(id) {
    const d = await spGet('/admin/api/hero_slides');
    if (!d.success) return;
    const r = d.data.find(x => x.id === id);
    if (!r) return;
    showForm('Edit Hero Slide', [
      { label:'Title', id:'sl-title', val: r.title },
      { label:'Subtitle', id:'sl-sub', type:'textarea', val: r.subtitle||'' },
      { label:'Media URL', id:'sl-url', val: r.media_url||'', uploadable: true },
      { label:'Media Type', id:'sl-media', type:'select', val: r.media_type||'image', options:['image','video'] },
      { label:'Button Text', id:'sl-btn', val: r.button_text||'' },
      { label:'Target Page', id:'sl-target', val: r.target_page||'home' },
      { label:'Order Index', id:'sl-order', type:'number', val: r.order_index||0 },
    ], async (vals) => {
      const d = await spPut(`/admin/api/hero_slides/${id}`, {
        title: vals['sl-title'], subtitle: vals['sl-sub'], media_url: vals['sl-url'],
        media_type: vals['sl-media'], button_text: vals['sl-btn'],
        target_page: vals['sl-target'], order_index: parseInt(vals['sl-order'])||0
      });
      if (d.success) { spToast('Slide updated', 'success'); closeForm(); loadSlides(); }
      else spToast(d.error||'Failed', 'error');
    });
  };

  window.spDelSlide = function(id) {
    confirmDelete('Delete this slide?', async () => {
      const d = await spDelete(`/admin/api/hero_slides/${id}`);
      if (d.success) { spToast('Deleted', 'success'); loadSlides(); } else spToast(d.error||'Failed', 'error');
    });
  };

  document.addEventListener('click', function(e) {
    if (e.target.id === 'sp-slides-add-btn' || e.target.closest('#sp-slides-add-btn')) {
      showForm('Add Hero Slide', [
        { label:'Title', id:'sl-title' },
        { label:'Subtitle', id:'sl-sub', type:'textarea' },
        { label:'Media URL', id:'sl-url', uploadable: true },
        { label:'Media Type', id:'sl-media', type:'select', val:'image', options:['image','video'] },
        { label:'Button Text', id:'sl-btn', val:'Learn More' },
        { label:'Target Page', id:'sl-target', val:'home' },
        { label:'Order Index', id:'sl-order', type:'number', val:'0' },
      ], async (vals) => {
        const d = await spPost('/admin/api/hero_slides', {
          title: vals['sl-title'], subtitle: vals['sl-sub'], media_url: vals['sl-url'],
          media_type: vals['sl-media'], button_text: vals['sl-btn'],
          target_page: vals['sl-target'], order_index: parseInt(vals['sl-order'])||0
        });
        if (d.success) { spToast('Slide added', 'success'); closeForm(); loadSlides(); }
        else spToast(d.error||'Failed', 'error');
      });
    }
  });

  /* ── IT Tips ─────────────────────────────────────────────── */
  async function loadTips() {
    const el = document.getElementById('sp-tips-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/it_tips');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-lightbulb"></i><p>No tips yet</p></div>'; return; }
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Title</th><th>Tags</th><th>Media Type</th><th>Target Page</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.title)}</td>
          <td>${(Array.isArray(r.tags)?r.tags:[]).map(t=>`<span class="sp-tag">${esc(t)}</span>`).join('')||'—'}</td>
          <td>${esc(r.media_type||'video')}</td>
          <td>${esc(r.target_page||'home')}</td>
          <td>
            <button class="sp-act-btn primary" onclick="spEditTip(${r.id})"><i class="fas fa-edit"></i> Edit</button>
            <button class="sp-act-btn danger" onclick="spDelTip(${r.id})"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  window.spEditTip = async function(id) {
    const d = await spGet('/admin/api/it_tips');
    if (!d.success) return;
    const r = d.data.find(x => x.id === id);
    if (!r) return;
    showForm('Edit IT Tip', [
      { label:'Title', id:'tip-title', val: r.title },
      { label:'Description', id:'tip-desc', type:'textarea', val: r.description||'' },
      { label:'Media URL', id:'tip-url', val: r.media_url||'', uploadable: true },
      { label:'Media Type', id:'tip-media', type:'select', val: r.media_type||'video', options:['video','image','none'] },
      { label:'Tags (press Enter)', id:'tip-tags', type:'tags', val: Array.isArray(r.tags)?r.tags:[] },
      { label:'Target Page', id:'tip-page', val: r.target_page||'home' },
    ], async (vals) => {
      const d = await spPut(`/admin/api/it_tips/${id}`, {
        title: vals['tip-title'], description: vals['tip-desc'], media_url: vals['tip-url'],
        media_type: vals['tip-media'], tags: spTagValues, target_page: vals['tip-page']
      });
      if (d.success) { spToast('Tip updated', 'success'); closeForm(); loadTips(); }
      else spToast(d.error||'Failed', 'error');
    });
  };

  window.spDelTip = function(id) {
    confirmDelete('Delete this tip?', async () => {
      const d = await spDelete(`/admin/api/it_tips/${id}`);
      if (d.success) { spToast('Deleted', 'success'); loadTips(); } else spToast(d.error||'Failed', 'error');
    });
  };

  document.addEventListener('click', function(e) {
    if (e.target.id === 'sp-tips-add-btn' || e.target.closest('#sp-tips-add-btn')) {
      showForm('Add IT Tip', [
        { label:'Title', id:'tip-title' },
        { label:'Description', id:'tip-desc', type:'textarea' },
        { label:'Media URL', id:'tip-url', uploadable: true },
        { label:'Media Type', id:'tip-media', type:'select', val:'video', options:['video','image','none'] },
        { label:'Tags (press Enter)', id:'tip-tags', type:'tags', val:[] },
        { label:'Target Page', id:'tip-page', val:'home' },
      ], async (vals) => {
        const d = await spPost('/admin/api/it_tips', {
          title: vals['tip-title'], description: vals['tip-desc'], media_url: vals['tip-url'],
          media_type: vals['tip-media'], tags: spTagValues, target_page: vals['tip-page']
        });
        if (d.success) { spToast('Tip added', 'success'); closeForm(); loadTips(); }
        else spToast(d.error||'Failed', 'error');
      });
    }
  });

  /* ── Testimonials ────────────────────────────────────────── */
  async function loadTestimonials() {
    const el = document.getElementById('sp-testimonials-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/testimonials');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-star"></i><p>No testimonials yet</p></div>'; return; }
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Name</th><th>Role</th><th>Rating</th><th>Preview</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.name)}</td>
          <td>${esc(r.role||'—')}</td>
          <td>${'★'.repeat(Math.min(5,Math.max(1,r.rating||5)))}</td>
          <td class="sp-td-muted">${esc((r.content||'').substring(0,60))}…</td>
          <td>
            <button class="sp-act-btn primary" onclick="spEditTestimonial(${r.id})"><i class="fas fa-edit"></i> Edit</button>
            <button class="sp-act-btn danger" onclick="spDelTestimonial(${r.id})"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  window.spEditTestimonial = async function(id) {
    const d = await spGet('/admin/api/testimonials');
    if (!d.success) return;
    const r = d.data.find(x => x.id === id);
    if (!r) return;
    showForm('Edit Testimonial', [
      { label:'Name', id:'tes-name', val: r.name },
      { label:'Role', id:'tes-role', val: r.role||'' },
      { label:'Review', id:'tes-content', type:'textarea', val: r.content||'' },
      { label:'Rating (1–5)', id:'tes-rating', type:'number', val: r.rating||5 },
      { label:'Avatar Image URL', id:'tes-img', val: r.image_url||'', uploadable: true },
    ], async (vals) => {
      const d = await spPut(`/admin/api/testimonials/${id}`, {
        name: vals['tes-name'], role: vals['tes-role'], content: vals['tes-content'],
        rating: parseInt(vals['tes-rating'])||5, image_url: vals['tes-img']
      });
      if (d.success) { spToast('Testimonial updated', 'success'); closeForm(); loadTestimonials(); }
      else spToast(d.error||'Failed', 'error');
    });
  };

  window.spDelTestimonial = function(id) {
    confirmDelete('Delete this testimonial?', async () => {
      const d = await spDelete(`/admin/api/testimonials/${id}`);
      if (d.success) { spToast('Deleted', 'success'); loadTestimonials(); } else spToast(d.error||'Failed', 'error');
    });
  };

  document.addEventListener('click', function(e) {
    if (e.target.id === 'sp-testimonials-add-btn' || e.target.closest('#sp-testimonials-add-btn')) {
      showForm('Add Testimonial', [
        { label:'Name', id:'tes-name' },
        { label:'Role', id:'tes-role' },
        { label:'Review', id:'tes-content', type:'textarea' },
        { label:'Rating (1–5)', id:'tes-rating', type:'number', val:'5' },
        { label:'Avatar Image URL', id:'tes-img', uploadable: true },
      ], async (vals) => {
        const d = await spPost('/admin/api/testimonials', {
          name: vals['tes-name'], role: vals['tes-role'], content: vals['tes-content'],
          rating: parseInt(vals['tes-rating'])||5, image_url: vals['tes-img']
        });
        if (d.success) { spToast('Testimonial added', 'success'); closeForm(); loadTestimonials(); }
        else spToast(d.error||'Failed', 'error');
      });
    }
  });

  /* ── Team Members ────────────────────────────────────────── */
  async function loadTeam() {
    const el = document.getElementById('sp-team-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/team');
    if (!d.success || !d.data.length) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-users"></i><p>No team members yet</p></div>'; return; }
    el.innerHTML = `<div class="sp-table-container"><table class="sp-table">
      <thead><tr><th>#</th><th>Name</th><th>Role</th><th>Order</th><th>Actions</th></tr></thead>
      <tbody>${d.data.map(r => `
        <tr>
          <td class="sp-td-muted">${r.id}</td>
          <td class="sp-td-bold">${esc(r.name)}</td>
          <td>${esc(r.role||'—')}</td>
          <td>${r.order_index}</td>
          <td>
            <button class="sp-act-btn primary" onclick="spEditTeam(${r.id})"><i class="fas fa-edit"></i> Edit</button>
            <button class="sp-act-btn danger" onclick="spDelTeam(${r.id})"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  window.spEditTeam = async function(id) {
    const d = await spGet('/admin/api/team');
    if (!d.success) return;
    const r = d.data.find(x => x.id === id);
    if (!r) return;
    showForm('Edit Team Member', [
      { label:'Name', id:'tm-name', val: r.name },
      { label:'Role', id:'tm-role', val: r.role||'' },
      { label:'Bio', id:'tm-bio', type:'textarea', val: r.bio||'' },
      { label:'Image URL', id:'tm-img', val: r.image_url||'', uploadable: true },
      { label:'Order Index', id:'tm-order', type:'number', val: r.order_index||0 },
    ], async (vals) => {
      const d = await spPut(`/admin/api/team/${id}`, {
        name: vals['tm-name'], role: vals['tm-role'], bio: vals['tm-bio'],
        image_url: vals['tm-img'], order_index: parseInt(vals['tm-order'])||0
      });
      if (d.success) { spToast('Member updated', 'success'); closeForm(); loadTeam(); }
      else spToast(d.error||'Failed', 'error');
    });
  };

  window.spDelTeam = function(id) {
    confirmDelete('Delete this team member?', async () => {
      const d = await spDelete(`/admin/api/team/${id}`);
      if (d.success) { spToast('Deleted', 'success'); loadTeam(); } else spToast(d.error||'Failed', 'error');
    });
  };

  document.addEventListener('click', function(e) {
    if (e.target.id === 'sp-team-add-btn' || e.target.closest('#sp-team-add-btn')) {
      showForm('Add Team Member', [
        { label:'Name', id:'tm-name' },
        { label:'Role', id:'tm-role' },
        { label:'Bio', id:'tm-bio', type:'textarea' },
        { label:'Image URL', id:'tm-img', uploadable: true },
        { label:'Order Index', id:'tm-order', type:'number', val:'0' },
      ], async (vals) => {
        const d = await spPost('/admin/api/team', {
          name: vals['tm-name'], role: vals['tm-role'], bio: vals['tm-bio'],
          image_url: vals['tm-img'], order_index: parseInt(vals['tm-order'])||0
        });
        if (d.success) { spToast('Member added', 'success'); closeForm(); loadTeam(); }
        else spToast(d.error||'Failed', 'error');
      });
    }
  });

  /* ── Settings ────────────────────────────────────────────── */
  async function loadSettings() {
    const el = document.getElementById('sp-settings-body');
    el.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div></div>';
    const d = await spGet('/admin/api/settings');
    if (!d.success) { el.innerHTML = '<div class="sp-empty"><i class="fas fa-cog"></i><p>Failed to load</p></div>'; return; }
    const s = d.data;
    el.innerHTML = `
      <div class="sp-table-header"><h3><i class="fas fa-cog"></i> Site Settings</h3></div>
      <div style="padding:28px">
        <div class="sp-form-group">
          <label>Active Festival / Theme</label>
          <select id="ss-festival" style="background:rgba(255,255,255,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:11px 14px;color:#fff;font-size:14px;font-family:Inter,sans-serif;width:100%;outline:none">
            ${['none','raya','deepavali','christmas','cny'].map(v=>`<option value="${v}" style="background:#1a1a2e" ${s.active_festival===v?'selected':''}>${v}</option>`).join('')}
          </select>
        </div>
        <div class="sp-form-group">
          <label>Tips Display Count (0 = all)</label>
          <input type="number" id="ss-tips" value="${s.tips_display_count||0}" style="background:rgba(255,255,255,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:11px 14px;color:#fff;font-size:14px;font-family:Inter,sans-serif;width:100%;outline:none;box-sizing:border-box">
        </div>
        <div class="sp-form-group">
          <label>Hero Slide Duration (seconds)</label>
          <input type="number" id="ss-dur" value="${s.hero_slide_duration||8}" style="background:rgba(255,255,255,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:11px 14px;color:#fff;font-size:14px;font-family:Inter,sans-serif;width:100%;outline:none;box-sizing:border-box">
        </div>
        <div class="sp-form-group">
          <label>Hero Display Limit (0 = all)</label>
          <input type="number" id="ss-limit" value="${s.hero_display_limit||0}" style="background:rgba(255,255,255,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:11px 14px;color:#fff;font-size:14px;font-family:Inter,sans-serif;width:100%;outline:none;box-sizing:border-box">
        </div>
        <div class="sp-form-group">
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;text-transform:none;letter-spacing:0;font-weight:400;color:rgba(255,255,255,0.7)">
            <input type="checkbox" id="ss-hideprice" ${s.hide_price==='1'||s.hide_price===1?'checked':''} style="width:16px;height:16px;accent-color:#6366f1;cursor:pointer">
            Hide Prices on Website
          </label>
        </div>
        <button class="sp-add-btn" id="ss-save-btn"><i class="fas fa-save"></i> Save Settings</button>
        <span id="ss-msg" style="margin-left:14px;font-size:13px;color:#34d399;display:none">✓ Saved!</span>
      </div>`;

    document.getElementById('ss-save-btn').addEventListener('click', async () => {
      const btn = document.getElementById('ss-save-btn');
      btn.disabled = true;
      const payload = {
        active_festival: document.getElementById('ss-festival').value,
        tips_display_count: parseInt(document.getElementById('ss-tips').value)||0,
        hero_slide_duration: parseInt(document.getElementById('ss-dur').value)||8,
        hero_display_limit: parseInt(document.getElementById('ss-limit').value)||0,
        hide_price: document.getElementById('ss-hideprice').checked ? 1 : 0,
      };
      const d = await spPost('/admin/api/settings', payload);
      btn.disabled = false;
      if (d.success) {
        const msg = document.getElementById('ss-msg');
        msg.style.display = 'inline';
        setTimeout(() => { msg.style.display = 'none'; }, 2500);
        spToast('Settings saved', 'success');
      } else {
        spToast(d.error||'Failed to save', 'error');
      }
    });
  }

  /* ── Generic form builder ────────────────────────────────── */
  /**
   * fields: [{ label, id, type?, val?, options?, uploadable?, placeholder? }]
   * type: 'text'|'textarea'|'select'|'number'|'checkbox'|'tags'|'color'
   * onSave: async (vals: Object<id,value>) => void
   */
  function showForm(title, fields, onSave) {
    spTagValues = [];
    spFormCallback = onSave;
    const box = document.getElementById('sp-form-box');
    box.innerHTML = `
      <h3><i class="fas fa-edit"></i> ${title}</h3>
      ${fields.map(f => buildField(f)).join('')}
      <div class="sp-form-actions">
        <button class="sp-form-cancel" id="sp-form-cancel-btn">Cancel</button>
        <button class="sp-form-save" id="sp-form-save-btn"><i class="fas fa-save"></i> Save</button>
      </div>
    `;
    // init tags
    fields.filter(f => f.type === 'tags').forEach(f => initTagsInput(f));
    // init upload buttons
    fields.filter(f => f.uploadable).forEach(f => initUpload(f.id));
    // init image preview
    fields.filter(f => f.uploadable).forEach(f => {
      const inp = document.getElementById(f.id);
      if (inp && f.val) updateImgPreview(f.id + '-preview', f.val);
      if (inp) inp.addEventListener('input', () => updateImgPreview(f.id + '-preview', inp.value));
    });

    document.getElementById('sp-form-cancel-btn').addEventListener('click', closeForm);
    document.getElementById('sp-form-save-btn').addEventListener('click', handleFormSave);
    document.getElementById('sp-form-overlay').classList.add('active');
  }

  function buildField(f) {
    const id = f.id;
    const val = f.val !== undefined ? f.val : '';
    switch (f.type) {
      case 'textarea':
        return `<div class="sp-form-group"><label>${f.label}</label><textarea id="${id}" rows="4">${esc(String(val))}</textarea></div>`;
      case 'select':
        return `<div class="sp-form-group"><label>${f.label}</label><select id="${id}">${(f.options||[]).map(o=>`<option value="${o}" ${o===val?'selected':''}>${o}</option>`).join('')}</select></div>`;
      case 'checkbox':
        return `<div class="sp-form-group"><label class="sp-checkbox-label"><input type="checkbox" id="${id}" ${val?'checked':''}>${f.label}</label></div>`;
      case 'tags':
        return `<div class="sp-form-group"><label>${f.label}</label><div class="sp-tags-input-wrap" id="${id}-wrap"><input type="text" id="${id}-input" placeholder="Type and press Enter…"></div></div>`;
      case 'number':
        return `<div class="sp-form-group"><label>${f.label}</label><input type="number" id="${id}" value="${esc(String(val))}"></div>`;
      case 'color':
        return `<div class="sp-form-group"><label>${f.label}</label><div style="display:flex;align-items:center;gap:12px"><input type="color" id="${id}" value="${esc(String(val))}" style="width:50px;height:40px;background:none;border:1px solid rgba(99,102,241,0.3);border-radius:8px;cursor:pointer"><input type="text" id="${id}-hex" value="${esc(String(val))}" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:11px 14px;color:#fff;font-size:14px;font-family:Inter,sans-serif;outline:none"></div></div>`;
      default: // text + uploadable
        const base = `<div class="sp-form-group"><label>${f.label}</label><input type="text" id="${id}" value="${esc(String(val))}">`;
        const upload = f.uploadable ? `<button type="button" class="sp-upload-btn" data-target="${id}"><i class="fas fa-upload"></i> Upload Image / Video</button><img id="${id}-preview" class="sp-img-preview" alt="Preview">` : '';
        return base + upload + '</div>';
    }
  }

  function initTagsInput(f) {
    const tags = Array.isArray(f.val) ? [...f.val] : [];
    spTagValues = [...tags];
    const wrap = document.getElementById(f.id + '-wrap');
    const inp  = document.getElementById(f.id + '-input');
    if (!wrap || !inp) return;

    function renderTags() {
      // Remove existing tag elements but keep input
      wrap.querySelectorAll('.sp-tag-item').forEach(e => e.remove());
      spTagValues.forEach((tag, i) => {
        const el = document.createElement('span');
        el.className = 'sp-tag-item';
        el.innerHTML = `${esc(tag)}<button type="button" title="Remove">&times;</button>`;
        el.querySelector('button').onclick = () => { spTagValues.splice(i,1); renderTags(); };
        wrap.insertBefore(el, inp);
      });
    }

    renderTags();
    inp.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ',') && inp.value.trim()) {
        e.preventDefault();
        spTagValues.push(inp.value.trim());
        inp.value = '';
        renderTags();
      } else if (e.key === 'Backspace' && !inp.value && spTagValues.length) {
        spTagValues.pop();
        renderTags();
      }
    });
    wrap.addEventListener('click', () => inp.focus());
  }

  function initUpload(fieldId) {
    const btns = document.querySelectorAll(`.sp-upload-btn[data-target="${fieldId}"]`);
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        spUploadField = fieldId;
        document.getElementById('sp-file-input').click();
      });
    });
    // color sync
    const colorEl = document.getElementById(fieldId);
    const hexEl   = document.getElementById(fieldId + '-hex');
    if (colorEl && hexEl && colorEl.type === 'color') {
      colorEl.addEventListener('input', () => { hexEl.value = colorEl.value; });
      hexEl.addEventListener('input',   () => { if (/^#[0-9a-fA-F]{6}$/.test(hexEl.value)) colorEl.value = hexEl.value; });
    }
  }

  function updateImgPreview(previewId, url) {
    const el = document.getElementById(previewId);
    if (!el) return;
    const resolved = resolveUrl(url);
    if (resolved && (resolved.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || resolved.startsWith('data:'))) {
      el.src = resolved;
      el.classList.add('show');
    } else {
      el.classList.remove('show');
    }
  }

  function resolveUrl(url) {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return API + url;
    return url;
  }

  async function handleFormSave() {
    const btn = document.getElementById('sp-form-save-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
    const vals = {};
    document.querySelectorAll('#sp-form-box input, #sp-form-box textarea, #sp-form-box select').forEach(el => {
      if (!el.id || el.type === 'file') return;
      if (el.type === 'checkbox') vals[el.id] = el.checked;
      else vals[el.id] = el.value;
    });
    // Merge color hex fields (prefer -hex version)
    Object.keys(vals).forEach(k => {
      if (k.endsWith('-hex')) {
        const base = k.replace('-hex','');
        if (vals[base] !== undefined) vals[base] = vals[k];
      }
    });
    try {
      await spFormCallback(vals);
    } catch(e) {
      spToast('Error: ' + e.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Save';
    }
  }

  function closeForm() {
    document.getElementById('sp-form-overlay').classList.remove('active');
    spFormCallback = null;
    spTagValues = [];
  }

  /* ── File upload ─────────────────────────────────────────── */
  document.addEventListener('change', async function(e) {
    if (e.target.id !== 'sp-file-input') return;
    const file = e.target.files[0];
    if (!file || !spUploadField) return;
    e.target.value = '';
    spToast('Uploading…', 'info');
    const fd = new FormData();
    fd.append('image', file);
    try {
      const r = await fetch(API + '/admin/api/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      const d = await r.json();
      if (d.success) {
        const inp = document.getElementById(spUploadField);
        if (inp) { inp.value = d.url; inp.dispatchEvent(new Event('input')); }
        spToast('Upload successful', 'success');
      } else {
        spToast('Upload failed: ' + (d.error||'Unknown'), 'error');
      }
    } catch(e) {
      spToast('Upload error: ' + e.message, 'error');
    }
  });

  /* ── Escape helper ───────────────────────────────────────── */
  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Portal open / close / toggle ──────────────────────────── */
  function openPortal() {
    if (spLoggedIn) {
      openDashboard();
    } else {
      const overlay = document.getElementById('sp-login-overlay');
      if (overlay) {
        overlay.classList.add('active');
        setTimeout(() => {
          document.getElementById('sp-username')?.focus();
        }, 80);
      }
    }
  }

  function closePortal() {
    if (spLoggedIn) {
      closeDashboard();
    } else {
      document.getElementById('sp-login-overlay')?.classList.remove('active');
    }
  }

  function togglePortal() {
    if (spLoggedIn) {
      const dash = document.getElementById('sp-dashboard');
      if (dash && dash.classList.contains('active')) {
        closeDashboard();
      } else {
        openDashboard();
      }
    } else {
      const overlay = document.getElementById('sp-login-overlay');
      if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
      } else if (overlay) {
        overlay.classList.add('active');
        setTimeout(() => {
          document.getElementById('sp-username')?.focus();
        }, 80);
      }
    }
  }

  // Expose global methods
  window.openStaffPortal   = openPortal;
  window.closeStaffPortal  = closePortal;
  window.toggleStaffPortal = togglePortal;
  window.openStaffLogin    = openPortal;

  /* ── Init & event wiring ──────────────────────────────────── */
  function init() {
    injectDOM();

    // Keyboard shortcuts:
    // 1) Ctrl + Shift + L (recommended, avoids browser screenshot conflicts)
    // 2) Ctrl + Shift + S (fixed for lowercase/CapsLock/Mac)
    document.addEventListener('keydown', function(e) {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const keyUpper = (e.key || '').toUpperCase();
      const code = e.code || '';

      const isS = keyUpper === 'S' || code === 'KeyS';
      const isL = keyUpper === 'L' || code === 'KeyL';

      if (isCmdOrCtrl && isShift && (isS || isL)) {
        e.preventDefault();
        e.stopPropagation();
        togglePortal();
      }

      // Escape closes panels
      if (e.key === 'Escape') {
        document.getElementById('sp-form-overlay')?.classList.remove('active');
        document.getElementById('sp-login-overlay')?.classList.remove('active');
      }
    });

    // Login button
    document.getElementById('sp-login-btn').addEventListener('click', doLogin);
    document.getElementById('sp-username').addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });
    document.getElementById('sp-password').addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });
    document.getElementById('sp-login-close-btn').addEventListener('click', () => {
      document.getElementById('sp-login-overlay').classList.remove('active');
    });

    // Nav items
    document.querySelectorAll('.sp-nav-item').forEach(btn => {
      btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
    });

    // Sidebar actions
    document.getElementById('sp-logout-btn').addEventListener('click', doLogout);
    document.getElementById('sp-exit-btn').addEventListener('click', closeDashboard);
    document.getElementById('sp-refresh-btn').addEventListener('click', () => {
      const meta = panelMeta[spActivePanel];
      if (meta && meta.load) meta.load();
    });

    // Close form on overlay backdrop click
    document.getElementById('sp-form-overlay').addEventListener('click', function(e) {
      if (e.target === this) closeForm();
    });

    // Login overlay backdrop click
    document.getElementById('sp-login-overlay').addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('active');
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
