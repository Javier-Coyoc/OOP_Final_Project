// dashboard.js
// Handles: navigation, user display, clock, stats population,
//          receipt history view, staff view, modals, toast.
// DB calls are stubbed — wire them up in your controllers.
// All fetches wrapped in try/catch.

'use strict';

// ─────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────

const API_BASE = '';  // e.g. 'http://localhost:3000'

// Promo codes that the receipt builder recognises
const PROMO_MAP = {
  'WELCOME10':  0.10,
  'SUMMER25':   0.25,
  'STAFF_DISC': 0.50,
};

const TAX_RATE = 0.08;

// ─────────────────────────────────────────────────────────────
//  SHARED STATE  (imported by pos.js via window)
// ─────────────────────────────────────────────────────────────

window.appState = {
  products: [],
  receipts: [],
  users:    [],
  cart:     [],   // managed by pos.js
};

// ─────────────────────────────────────────────────────────────
//  UTILITY – apiFetch
// ─────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} – ${path}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────────────

let _toastTimer;

window.toast = {
  show(msg, type = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className   = `toast show ${type}`;
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  },
};

// ─────────────────────────────────────────────────────────────
//  NAV
// ─────────────────────────────────────────────────────────────

const VIEW_META = {
  dashboard: { title: 'Overview',         cta: '+ New Receipt', ctaView: 'pos' },
  products:  { title: 'Product Catalogue', cta: 'Go to Cart →',  ctaView: 'pos' },
  pos:       { title: 'New Receipt',       cta: 'Browse Products', ctaView: 'products' },
  history:   { title: 'Receipt History',   cta: '+ New Receipt', ctaView: 'pos' },
  staff:     { title: 'Staff',             cta: '+ New Receipt', ctaView: 'pos' },
};

window.nav = {
  current: 'dashboard',

  switchTo(viewId) {
    // RBAC check: block navigation to views the current role can't access
    const viewPermission = {
      dashboard: 'dashboard',
      history:   'history',
      staff:     'staff',
      pos:       'pos',
      products:  'products',
    };
    const perm = viewPermission[viewId];
    if (perm && !can(perm)) {
      toast.show('You do not have permission to view this section.', 'error');
      return;
    }

    // hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // show target
    document.getElementById('view-' + viewId)?.classList.add('active');
    document.querySelector(`.nav-item[data-view="${viewId}"]`)?.classList.add('active');

    // update topbar
    const meta = VIEW_META[viewId] || { title: viewId, cta: '', ctaView: 'dashboard' };
    document.getElementById('topbar-title').textContent = meta.title;

    const ctaBtn = document.getElementById('topbar-cta');
    ctaBtn.textContent = meta.cta;
    ctaBtn.onclick     = () => nav.switchTo(meta.ctaView);

    this.current = viewId;

    // lazy-render each view
    if (viewId === 'products') products.render();
    if (viewId === 'history')  history.render();
    if (viewId === 'staff')    staff.render();
    if (viewId === 'pos')      pos.renderCart();
  },
};

// Set up sidebar click listeners
document.querySelectorAll('.nav-item[data-view]').forEach(item => {
  item.addEventListener('click', () => nav.switchTo(item.dataset.view));
});

// ─────────────────────────────────────────────────────────────
//  USER DISPLAY  (reads from localStorage set by login.js)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
//  RBAC HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Role permission matrix:
 *
 *  Feature / View         Cashier   Manager   Admin
 *  ─────────────────────────────────────────────────
 *  POS (new receipt)        ✓         ✓         ✓
 *  Products catalogue       ✓         ✓         ✓
 *  Receipt history          ✗         ✓         ✓
 *  Staff management         ✗         ✓ (view)  ✓ (view + toggle)
 *  Dashboard overview       ✗         ✓         ✓
 *  Toggle user status       ✗         ✗         ✓
 */
const ROLE_PERMISSIONS = {
  Admin:   { dashboard: true, history: true, staff: true, pos: true, products: true, toggleUsers: true  },
  Manager: { dashboard: true, history: true, staff: true, pos: true, products: true, toggleUsers: false },
  Cashier: { dashboard: false,history: false,staff: false,pos: true, products: true, toggleUsers: false },
};

function can(permission) {
  const role = localStorage.getItem('role') || 'Cashier';
  return !!(ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role][permission]);
}

function initUser() {
  const name = localStorage.getItem('full_name') || 'User';
  const role = localStorage.getItem('role')      || 'Cashier';

  // Guard: if no token/role in storage, kick to login
  if (!localStorage.getItem('token') || !role) {
    window.location.replace('login.html');
    return;
  }

  document.getElementById('sb-user-name').textContent = name;
  document.getElementById('sb-user-role').textContent = role;

  // Initials avatar
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  document.getElementById('sb-avatar').textContent = initials;

  // ── Nav visibility ──────────────────────────────────────────
  // History nav item
  const navHistory = document.querySelector('.nav-item[data-view="history"]');
  if (navHistory) navHistory.style.display = can('history') ? '' : 'none';

  // Staff section + nav item
  const navManageSection = document.querySelector('.nav-manage-section');
  const navStaffItem     = document.querySelector('.nav-staff-item');
  if (navManageSection) navManageSection.style.display = can('staff') ? '' : 'none';
  if (navStaffItem)     navStaffItem.style.display     = can('staff') ? '' : 'none';

  // Dashboard quick-access staff cell
  const qaStaffCell = document.querySelector('.qa-staff-cell');
  const qaPrintCell = document.querySelector('.qa-print-cell');
  if (qaStaffCell) qaStaffCell.style.display = can('staff') ? '' : 'none';
  if (qaPrintCell) qaPrintCell.style.display = can('staff') ? 'none' : '';

  // ── Default view by role ─────────────────────────────────────
  // Cashiers don't have access to the overview dashboard — send them straight to POS
  if (!can('dashboard')) {
    // Queue after init so nav listeners are attached
    setTimeout(() => nav.switchTo('pos'), 0);

    // Also hide the dashboard nav item so they can't navigate back
    const navDash = document.querySelector('.nav-item[data-view="dashboard"]');
    if (navDash) navDash.style.display = 'none';
  }

  // ── Admin-only: show toggle buttons in staff view ────────────
  // The staff.render() function checks window.currentUserCanToggle at render time
  window.currentUserCanToggle = can('toggleUsers');
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  try {
    localStorage.clear();
  } catch (err) {
    console.error('Logout clear error:', err);
  }
  window.location.href = 'login.html';
});

// ─────────────────────────────────────────────────────────────
//  CLOCK
// ─────────────────────────────────────────────────────────────

function initClock() {
  function tick() {
    const now = new Date();
    try {
      document.getElementById('topbar-time').textContent =
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      document.getElementById('topbar-date').textContent =
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (err) {
      console.error('Clock render error:', err);
    }
  }
  tick();
  setInterval(tick, 10_000);
}

// ─────────────────────────────────────────────────────────────
//  DATA LOADING
// ─────────────────────────────────────────────────────────────

async function loadData() {
  // Products
  try {
    appState.products = await apiFetch('/products');
  } catch (err) {
    console.warn('Could not load products – using mock data.', err);
    appState.products = MOCK_PRODUCTS;
  }

  // Receipts
  try {
    appState.receipts = await apiFetch('/receipts');
  } catch (err) {
    console.warn('Could not load receipts – using mock data.', err);
    appState.receipts = MOCK_RECEIPTS;
  }

  // Users (Admin / Manager only)
  const role = localStorage.getItem('role');
  if (role === 'Admin' || role === 'Manager') {
    try {
      appState.users = await apiFetch('/users');
    } catch (err) {
      console.warn('Could not load users – using mock data.', err);
      appState.users = MOCK_USERS;
    }
  }
}

// ─────────────────────────────────────────────────────────────
//  MOCK DATA  (used when server is offline)
// ─────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  { id:1, sku:'ELEC-001', name:'Wireless Mouse',      category:'Electronics', price:'25.99' },
  { id:2, sku:'ELEC-002', name:'Mechanical Keyboard',  category:'Electronics', price:'89.50' },
  { id:3, sku:'OFFC-010', name:'Ergonomic Chair',      category:'Furniture',   price:'199.00' },
  { id:4, sku:'OFFC-011', name:'Standing Desk',        category:'Furniture',   price:'350.00' },
  { id:5, sku:'SOFT-999', name:'Antivirus License',    category:'Software',    price:'49.99' },
];

const MOCK_RECEIPTS = [
  { id:1, timestamp:'2025-04-14T09:23:00', promo_code:'WELCOME10', tax_rate:'0.08', discount_percent:'0.10',
    payment:{ type:'CARD', amount:'127.33', card_last4:'4422', card_type:'Visa' } },
  { id:2, timestamp:'2025-04-14T10:11:00', promo_code:null, tax_rate:'0.08', discount_percent:'0.00',
    payment:{ type:'CASH', amount:'214.92', change_due:'5.08' } },
  { id:3, timestamp:'2025-04-15T11:55:00', promo_code:'SUMMER25', tax_rate:'0.05', discount_percent:'0.25',
    payment:{ type:'CARD', amount:'196.84', card_last4:'9012', card_type:'Mastercard' } },
  { id:4, timestamp:'2025-04-16T08:02:00', promo_code:null, tax_rate:'0.08', discount_percent:'0.00',
    payment:{ type:'CASH', amount:'378.00', change_due:'22.00' } },
  { id:5, timestamp:'2025-04-16T14:30:00', promo_code:'STAFF_DISC', tax_rate:'0.00', discount_percent:'0.50',
    payment:{ type:'CARD', amount:'175.00', card_last4:'1111', card_type:'Amex' } },
];

const MOCK_USERS = [
  { id:1, username:'admin_user',  role:'Admin',   full_name:'Alice Johnson', email:'alice@system.com',   is_active:true },
  { id:2, username:'cashier_01',  role:'Cashier', full_name:'Bob Smith',     email:'bob@system.com',     is_active:true },
  { id:3, username:'cashier_02',  role:'Cashier', full_name:'Charlie Davis', email:'charlie@system.com', is_active:true },
  { id:4, username:'manager_ken', role:'Manager', full_name:'Ken Thompson',  email:'ken@system.com',     is_active:true },
  { id:5, username:'dev_tester',  role:'Admin',   full_name:'Dana White',    email:'dana@system.com',    is_active:false },
];

// ─────────────────────────────────────────────────────────────
//  DASHBOARD VIEW
// ─────────────────────────────────────────────────────────────

function renderDashboard() {
  try {
    const { receipts, products } = appState;

    // Stats
    const totalRevenue = receipts.reduce((s, r) => s + parseFloat(r.payment?.amount || 0), 0);
    const avg          = receipts.length ? totalRevenue / receipts.length : 0;

    document.getElementById('stat-revenue').textContent      = '$' + totalRevenue.toFixed(2);
    document.getElementById('stat-revenue-sub').textContent  = `${receipts.length} transaction(s)`;
    document.getElementById('stat-count').textContent        = receipts.length;
    document.getElementById('stat-products').textContent     = products.length;
    document.getElementById('stat-avg').textContent          = '$' + avg.toFixed(2);

    // Recent receipts table (last 5)
    const tbody  = document.getElementById('dash-recent-tbody');
    const recent = [...receipts].reverse().slice(0, 5);

    if (!recent.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="tbl-loading">No receipts yet.</td></tr>';
    } else {
      tbody.innerHTML = recent.map(r => {
        const d       = new Date(r.timestamp);
        const dateStr = d.toLocaleDateString([], { month:'short', day:'numeric' })
                      + ' ' + d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
        const promo   = r.promo_code
          ? `<span class="badge b-amber">${r.promo_code}</span>`
          : '<span class="muted">—</span>';
        const pay     = r.payment?.type === 'CARD'
          ? `<span class="badge b-blue">Card</span>`
          : `<span class="badge b-green">Cash</span>`;
        const amt     = r.payment?.amount ? '$' + parseFloat(r.payment.amount).toFixed(2) : '—';

        return `<tr style="cursor:pointer" onclick="modal.open(${r.id})">
          <td><span class="mono muted">#RG-${String(r.id).padStart(4,'0')}</span></td>
          <td style="font-size:12px;color:#aaa">${dateStr}</td>
          <td>${promo}</td>
          <td>${pay}</td>
          <td><span class="mono" style="font-weight:600">${amt}</span></td>
        </tr>`;
      }).join('');
    }

    // Product snapshot
    const snap = document.getElementById('dash-products-snap');
    if (!products.length) {
      snap.innerHTML = '<div class="tbl-loading">No products loaded.</div>';
    } else {
      snap.innerHTML = products.slice(0, 4).map(p =>
        `<div class="mini-row">
          <div>
            <div style="font-size:13px;color:#1a1410">${p.name}</div>
            <div class="mono muted" style="font-size:10px">${p.sku}</div>
          </div>
          <span class="mono" style="font-weight:600">$${parseFloat(p.price).toFixed(2)}</span>
        </div>`
      ).join('');
    }

  } catch (err) {
    console.error('Dashboard render error:', err);
  }
}

// ─────────────────────────────────────────────────────────────
//  PRODUCTS VIEW
// ─────────────────────────────────────────────────────────────

let _filteredProducts = [];

window.products = {
  render() {
    try {
      _filteredProducts = [...appState.products];
      this._populateCatFilter();
      this._renderGrid(_filteredProducts);
    } catch (err) {
      console.error('Products render error:', err);
    }
  },

  filter() {
    try {
      const q   = document.getElementById('product-search').value.toLowerCase();
      const cat = document.getElementById('product-cat').value;

      _filteredProducts = appState.products.filter(p =>
        (!q   || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
        (!cat || p.category === cat)
      );

      this._renderGrid(_filteredProducts);
    } catch (err) {
      console.error('Product filter error:', err);
    }
  },

  _populateCatFilter() {
    const cats = [...new Set(appState.products.map(p => p.category).filter(Boolean))];
    const sel  = document.getElementById('product-cat');
    sel.innerHTML = '<option value="">All Categories</option>'
      + cats.map(c => `<option value="${c}">${c}</option>`).join('');
  },

  _renderGrid(list) {
    const grid   = document.getElementById('products-grid');
    const cartIds = appState.cart.map(i => i.product.id);

    if (!list.length) {
      grid.innerHTML = '<div class="tbl-loading" style="grid-column:1/-1">No products match.</div>';
      return;
    }

    grid.innerHTML = list.map(p => {
      const inCart = cartIds.includes(p.id);
      return `<div class="product-card ${inCart ? 'in-cart' : ''}">
        <div class="prod-sku">${p.sku}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-cat">${p.category || '—'}</div>
        <div class="prod-price">$${parseFloat(p.price).toFixed(2)}</div>
        <button class="prod-btn ${inCart ? 'remove' : ''}"
          onclick="pos.toggleProduct(${p.id})">
          ${inCart ? '✕ Remove' : '+ Add to Cart'}
        </button>
      </div>`;
    }).join('');
  },
};

// ─────────────────────────────────────────────────────────────
//  HISTORY VIEW
// ─────────────────────────────────────────────────────────────

window.history = {
  render() {
    this._renderTable([...appState.receipts].reverse());
  },

  filter() {
    try {
      const q = document.getElementById('history-search').value.toLowerCase();
      const filtered = [...appState.receipts].reverse().filter(r =>
        !q
        || String(r.id).includes(q)
        || (r.promo_code || '').toLowerCase().includes(q)
      );
      this._renderTable(filtered);
    } catch (err) {
      console.error('History filter error:', err);
    }
  },

  _renderTable(list) {
    try {
      const tbody = document.getElementById('history-tbody');

      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="tbl-loading">No receipts found.</td></tr>';
        return;
      }

      tbody.innerHTML = list.map(r => {
        const d        = new Date(r.timestamp);
        const dateStr  = d.toLocaleDateString([], { year:'numeric', month:'short', day:'numeric' })
                       + ' ' + d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
        const taxPct   = r.tax_rate       ? (parseFloat(r.tax_rate)*100).toFixed(0)+'%'        : '0%';
        const discPct  = r.discount_percent && parseFloat(r.discount_percent) > 0
                         ? (parseFloat(r.discount_percent)*100).toFixed(0)+'%' : '—';
        const promo    = r.promo_code
          ? `<span class="badge b-amber">${r.promo_code}</span>`
          : '<span class="muted">—</span>';
        const pay      = r.payment?.type === 'CARD'
          ? `<span class="badge b-blue">Card ···${r.payment.card_last4 || ''}</span>`
          : `<span class="badge b-green">Cash</span>`;
        const amt      = r.payment?.amount
          ? '$' + parseFloat(r.payment.amount).toFixed(2) : '—';

        return `<tr style="cursor:pointer" onclick="modal.open(${r.id})">
          <td><span class="mono muted">#RG-${String(r.id).padStart(4,'0')}</span></td>
          <td style="font-size:12px;color:#aaa">${dateStr}</td>
          <td>${promo}</td>
          <td class="muted" style="font-size:12px">${taxPct}</td>
          <td class="muted" style="font-size:12px">${discPct}</td>
          <td>${pay}</td>
          <td><span class="mono" style="font-weight:600">${amt}</span></td>
          <td>
            <button class="dash-btn" style="padding:5px 12px;font-size:9px;letter-spacing:1px"
              onclick="event.stopPropagation();modal.open(${r.id})">View</button>
          </td>
        </tr>`;
      }).join('');

    } catch (err) {
      console.error('History table render error:', err);
    }
  },
};

// ─────────────────────────────────────────────────────────────
//  STAFF VIEW
// ─────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#c8873a','#1a1410','#2d7a4f','#185fa5','#9a6b10','#553399'];

window.staff = {
  render() {
    try {
      const grid = document.getElementById('staff-grid');

      if (!appState.users.length) {
        grid.innerHTML = '<div class="tbl-loading">No staff data available.</div>';
        return;
      }

      grid.innerHTML = appState.users.map((u, i) => {
        const initials = (u.full_name || u.username)
          .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const color    = AVATAR_COLORS[i % AVATAR_COLORS.length];
        const roleBadge = { Admin:'b-dark', Manager:'b-amber', Cashier:'b-blue' }[u.role] || 'b-gray';
        const statusBadge = u.is_active
          ? '<span class="badge b-green">Active</span>'
          : '<span class="badge b-gray">Inactive</span>';

        // Admin-only: toggle active/inactive button
        const toggleBtn = window.currentUserCanToggle
          ? `<button
               class="dash-btn"
               style="margin-top:8px;padding:5px 10px;font-size:9px;letter-spacing:1px;width:100%;opacity:0.85"
               onclick="staff.toggleStatus(${u.id}, this)">
               ${u.is_active ? 'Deactivate' : 'Activate'}
             </button>`
          : '';

        return `<div class="staff-card">
          <div class="staff-avatar" style="background:${color}">${initials}</div>
          <div style="min-width:0;width:100%">
            <div class="staff-name">${u.full_name || u.username}</div>
            <div class="staff-username">@${u.username}</div>
            <div class="staff-email">${u.email || '—'}</div>
            <div class="staff-badges">
              <span class="badge ${roleBadge}">${u.role}</span>
              ${statusBadge}
            </div>
            ${toggleBtn}
          </div>
        </div>`;
      }).join('');

    } catch (err) {
      console.error('Staff render error:', err);
    }
  },

  async toggleStatus(userId, btn) {
    if (!window.currentUserCanToggle) {
      toast.show('Only Admins can change user status.', 'error');
      return;
    }
    const prev = btn.textContent.trim();
    btn.disabled = true;
    btn.textContent = '...';
    try {
      await apiFetch(`/auth/${userId}/toggle`, { method: 'PUT' });
      // Flip in local state so re-render reflects the change
      const u = appState.users.find(u => u.id === userId);
      if (u) u.is_active = !u.is_active;
      this.render();
      toast.show('User status updated.', 'success');
    } catch (err) {
      btn.disabled = false;
      btn.textContent = prev;
      toast.show('Failed to update status. ' + (err.message || ''), 'error');
    }
  },
};

// ─────────────────────────────────────────────────────────────
//  RECEIPT DETAIL MODAL
// ─────────────────────────────────────────────────────────────

window.modal = {
  open(id) {
    try {
      const r = appState.receipts.find(r => r.id === id);
      if (!r) return;

      document.getElementById('modal-title').textContent =
        `#RG-${String(r.id).padStart(4,'0')}`;

      const d        = new Date(r.timestamp);
      const dateStr  = d.toLocaleString([], { month:'long', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
      const discount = parseFloat(r.discount_percent || 0);
      const taxRate  = parseFloat(r.tax_rate || TAX_RATE);
      const payLine  = r.payment?.type === 'CARD'
        ? `${r.payment.card_type} ···${r.payment.card_last4}`
        : `Cash · Change: $${parseFloat(r.payment?.change_due || 0).toFixed(2)}`;

      let itemRows = '';
      if (r.items?.length) {
        r.items.forEach(item => {
          const name  = item.product?.name || `Product #${item.product_id}`;
          const qty   = item.qty || item.quantity || 1;
          const price = parseFloat(item.price_at_purchase || item.product?.price || 0);
          itemRows += `<div class="modal-receipt-row"><span>${qty}× ${name}</span><span>$${(price*qty).toFixed(2)}</span></div>`;
        });
      } else {
        itemRows = `<div style="color:#bbb;font-size:8px">No line items recorded.</div>`;
      }

      document.getElementById('modal-receipt-content').innerHTML = `
        <div class="modal-receipt-title">RECEIPT GENERATOR</div>
        <div style="text-align:center;color:#aaa;font-size:7.5px;margin-bottom:8px;border-bottom:1px dashed #eee;padding-bottom:6px">${dateStr}</div>
        ${itemRows}
        ${r.promo_code ? `<div class="modal-receipt-row" style="color:#aaa"><span>Promo (${r.promo_code})</span><span>-${(discount*100).toFixed(0)}%</span></div>` : ''}
        <div class="modal-receipt-row" style="color:#aaa"><span>Tax (${(taxRate*100).toFixed(0)}%)</span><span>—</span></div>
        <div class="modal-receipt-total"><span>TOTAL</span><span>$${parseFloat(r.payment?.amount || 0).toFixed(2)}</span></div>
        <div style="text-align:center;margin-top:6px;font-size:7.5px;color:#bbb">${payLine}</div>
        <div class="modal-receipt-thanks">Thank you for your visit!</div>
      `;

      document.getElementById('receipt-modal').classList.add('open');

    } catch (err) {
      console.error('Modal open error:', err);
    }
  },

  close(event) {
    // close if clicking backdrop or the × button directly
    if (!event || event.target === document.getElementById('receipt-modal') || !event.target.closest('.modal-box')) {
      document.getElementById('receipt-modal').classList.remove('open');
    }
  },

  openSuccess(grand, promo, payType, cartSnapshot) {
    try {
      document.getElementById('success-sub').textContent =
        `$${grand.toFixed(2)} via ${payType}${promo ? ' · Promo: ' + promo : ''}`;

      let rows = '';
      cartSnapshot.forEach(i => {
        const line = (parseFloat(i.product.price) * i.qty).toFixed(2);
        rows += `<div class="modal-receipt-row"><span>${i.qty}× ${i.product.name}</span><span>$${line}</span></div>`;
      });

      document.getElementById('success-preview').innerHTML = `
        <div class="modal-receipt-title">RECEIPT GENERATOR</div>
        ${rows}
        <div class="modal-receipt-total"><span>TOTAL</span><span>$${grand.toFixed(2)}</span></div>
        <div class="modal-receipt-thanks">Thank you for your visit!</div>
      `;

      document.getElementById('success-modal').classList.add('open');

    } catch (err) {
      console.error('Success modal error:', err);
    }
  },

  closeSuccess(event) {
    if (!event || event.target === document.getElementById('success-modal') || !event.target.closest('.modal-box')) {
      document.getElementById('success-modal').classList.remove('open');
    }
  },
};

// ─────────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────────

(async function init() {
  try {
    initUser();
    initClock();
    await loadData();
    renderDashboard();
  } catch (err) {
    console.error('Init error:', err);
    toast.show('Failed to load data – check console.', 'error');
  }
})();