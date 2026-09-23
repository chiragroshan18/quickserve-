/* ==========================================================================
   QUICK SERVE — Modular Frontend JavaScript Architecture
   ========================================================================== */

// Shared State Container
const AppState = {
  services: [],
  providers: [],
  requests: [],
  selectedService: null,
  selectedProvider: null
};

// ==============================================================================
// 1. REUSABLE UTILITIES & API HELPERS
// ==============================================================================

/**
 * Universal fetch wrapper for JSON API requests.
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}: Server Error`);
    }
    return result;
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err.message);
    throw err;
  }
}

/**
 * Toast Notification System.
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-weight: 700; font-size: 1.1rem; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); border-radius: 50%;">${iconMap[type] || 'ℹ'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(1rem)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * HTML Escaping utility to prevent XSS.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Icon SVG Generator for Service Categories.
 */
function getServiceIconSVG(iconName) {
  const icons = {
    zap: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    droplet: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>',
    sparkles: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v3m0 12v3M3 12h3m12 0h3m-3.5-6.5l-2 2m-7 7l-2 2m0-11l2 2m7 7l2 2"></path></svg>',
    wind: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>',
    wrench: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
    hammer: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0-.83-.83-.83-2.17 0-3L12 9"></path><path d="M17.64 3.76a2.1 2.1 0 0 1 2.97 2.97L18 9.36l-3.36-3.36 2.99-2.24z"></path></svg>',
    laptop: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>',
    paintbrush: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.37 2.63a2.12 2.12 0 0 1 3 3L13.5 13.5 9 9l9.37-6.37z"></path><path d="M9 9l-6 6a3 3 0 0 0 4.24 4.24l6-6"></path></svg>'
  };
  return icons[iconName] || icons.zap;
}

/**
 * Returns formatted status badge HTML.
 */
function getStatusBadgeHTML(status) {
  const statusSlug = status.toLowerCase().replace(/\s+/g, '-');
  return `<span class="badge badge-${statusSlug}">${escapeHtml(status)}</span>`;
}

// ==============================================================================
// 2. PAGE SPECIFIC MODULES
// ==============================================================================

/**
 * Load Services Page Component.
 */
async function initServicesPage() {
  const grid = document.getElementById('services-grid-container');
  if (!grid) return;

  try {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><span class="spinner spinner-dark"></span> Loading services...</div>`;
    const res = await apiRequest('/api/services');
    AppState.services = res.services;
    renderServicesGrid(grid, AppState.services);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><div class="empty-title">Failed to load services</div><p class="empty-desc">${escapeHtml(err.message)}</p></div>`;
  }
}

function renderServicesGrid(container, services) {
  if (!services || services.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><div class="empty-title">No services found</div></div>`;
    return;
  }

  container.innerHTML = services.map(s => `
    <div class="card card-interactive service-card">
      <div class="service-header">
        <div class="service-icon-box">
          ${getServiceIconSVG(s.icon)}
        </div>
        <span class="badge badge-accepted">${s.available_providers} Providers</span>
      </div>
      <h3 class="service-title">${escapeHtml(s.name)}</h3>
      <p class="service-desc">${escapeHtml(s.description)}</p>
      <div class="service-footer">
        <div class="service-price">From <strong>₹${s.starting_price}</strong></div>
        <a href="/providers?service=${encodeURIComponent(s.id)}" class="btn btn-primary btn-sm">
          View Providers →
        </a>
      </div>
    </div>
  `).join('');
}

/**
 * Load Providers Page Component with Real-Time Filtering.
 */
async function initProvidersPage() {
  const container = document.getElementById('providers-grid-container');
  if (!container) return;

  const searchInput = document.getElementById('search-provider');
  const serviceFilter = document.getElementById('filter-service');
  const ratingFilter = document.getElementById('filter-rating');
  const availFilter = document.getElementById('filter-availability');

  try {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><span class="spinner spinner-dark"></span> Loading providers...</div>`;
    
    const [provRes, servRes] = await Promise.all([
      apiRequest('/api/providers'),
      apiRequest('/api/services')
    ]);

    AppState.providers = provRes.providers;
    AppState.services = servRes.services;

    // Populate service dropdown filter
    if (serviceFilter) {
      serviceFilter.innerHTML = `<option value="">All Service Categories</option>` +
        AppState.services.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    }

    // Check URL parameters for pre-selected service
    const urlParams = new URLSearchParams(window.location.search);
    const preService = urlParams.get('service');
    if (preService && serviceFilter) {
      serviceFilter.value = preService;
    }

    const applyFilters = () => {
      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const sVal = serviceFilter ? serviceFilter.value : '';
      const rVal = ratingFilter ? parseFloat(ratingFilter.value) || 0 : 0;
      const aVal = availFilter ? availFilter.value : '';

      const filtered = AppState.providers.filter(p => {
        const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.service_name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        const matchesService = !sVal || p.service_id === sVal;
        const matchesRating = !rVal || p.rating >= rVal;
        const matchesAvail = !aVal || (aVal === 'today' && p.availability.toLowerCase().includes('today'));
        return matchesSearch && matchesService && matchesRating && matchesAvail;
      });

      renderProvidersGrid(container, filtered);
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (serviceFilter) serviceFilter.addEventListener('change', applyFilters);
    if (ratingFilter) ratingFilter.addEventListener('change', applyFilters);
    if (availFilter) availFilter.addEventListener('change', applyFilters);

    applyFilters();

  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><div class="empty-title">Error loading providers</div><p class="empty-desc">${escapeHtml(err.message)}</p></div>`;
  }
}

function renderProvidersGrid(container, providers) {
  if (!providers || providers.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">No Service Providers Found</h3>
        <p class="empty-desc">Try adjusting your search criteria or clearing filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = providers.map(p => `
    <div class="card card-interactive provider-card">
      <div class="provider-header">
        <div class="provider-avatar">${escapeHtml(p.name.charAt(0))}</div>
        <div class="provider-meta">
          <h3 class="provider-name">${escapeHtml(p.name)}</h3>
          <div class="provider-category">${escapeHtml(p.service_name)}</div>
        </div>
        <div class="rating-badge">★ ${p.rating}</div>
      </div>
      <p class="provider-body">${escapeHtml(p.description)}</p>
      <div class="provider-tags">
        <span class="tag tag-avail">${escapeHtml(p.availability)}</span>
        <span class="tag">Exp: ${p.experience_years} yrs</span>
        <span class="tag">Area: ${escapeHtml(p.service_area)}</span>
      </div>
      <div class="provider-footer">
        <div>
          <span style="font-size: 0.8rem; color: var(--slate-500);">Service Charge</span>
          <div style="font-size: 1.15rem; font-weight: 800; color: var(--slate-900);">₹${p.price}</div>
        </div>
        <a href="/request?service=${encodeURIComponent(p.service_id)}&provider=${encodeURIComponent(p.id)}" class="btn btn-primary btn-sm">
          Select & Book →
        </a>
      </div>
    </div>
  `).join('');
}

/**
 * Load Service Request Form Component with Dynamic Validation.
 */
async function initRequestFormPage() {
  const form = document.getElementById('service-request-form');
  if (!form) return;

  const serviceSelect = document.getElementById('req-service');
  const providerSelect = document.getElementById('req-provider');
  const priceDisplay = document.getElementById('estimated-price-display');

  try {
    const [servRes, provRes] = await Promise.all([
      apiRequest('/api/services'),
      apiRequest('/api/providers')
    ]);

    AppState.services = servRes.services;
    AppState.providers = provRes.providers;

    // Populate Service options
    serviceSelect.innerHTML = `<option value="">-- Select Service Category --</option>` +
      AppState.services.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');

    const updateProvidersDropdown = (selectedServiceId, selectedProviderId = null) => {
      if (!selectedServiceId) {
        providerSelect.innerHTML = `<option value="">-- Select Service First --</option>`;
        providerSelect.disabled = true;
        if (priceDisplay) priceDisplay.innerText = '₹0';
        return;
      }

      const available = AppState.providers.filter(p => p.service_id === selectedServiceId);
      providerSelect.disabled = false;
      providerSelect.innerHTML = `<option value="">-- Select Available Provider --</option>` +
        available.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (₹${p.price} • ${p.rating}★)</option>`).join('');

      if (selectedProviderId) {
        providerSelect.value = selectedProviderId;
        const prov = AppState.providers.find(p => p.id === selectedProviderId);
        if (prov && priceDisplay) priceDisplay.innerText = `₹${prov.price}`;
      }
    };

    serviceSelect.addEventListener('change', (e) => {
      updateProvidersDropdown(e.target.value);
    });

    providerSelect.addEventListener('change', (e) => {
      const p = AppState.providers.find(prov => prov.id === e.target.value);
      if (p && priceDisplay) {
        priceDisplay.innerText = `₹${p.price}`;
      } else if (priceDisplay) {
        priceDisplay.innerText = '₹0';
      }
    });

    // Check pre-filled URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const paramService = urlParams.get('service');
    const paramProvider = urlParams.get('provider');

    if (paramService) {
      serviceSelect.value = paramService;
      updateProvidersDropdown(paramService, paramProvider);
    }

    // Form Submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const btnOriginalHTML = submitBtn.innerHTML;
      
      const payload = {
        customer_name: document.getElementById('req-name').value,
        customer_phone: document.getElementById('req-phone').value,
        customer_email: document.getElementById('req-email').value,
        service_id: serviceSelect.value,
        provider_id: providerSelect.value,
        address: document.getElementById('req-address').value,
        preferred_date: document.getElementById('req-date').value,
        preferred_time: document.getElementById('req-time').value,
        problem_description: document.getElementById('req-description').value,
        urgency: document.getElementById('req-urgency').value
      };

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner"></span> Submitting...`;

        const res = await apiRequest('/api/requests', 'POST', payload);
        
        showToast(`Request ${res.request_id} created successfully!`, 'success');
        
        setTimeout(() => {
          window.location.href = `/tracking?id=${res.request_id}`;
        }, 1200);

      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnOriginalHTML;
      }
    });

  } catch (err) {
    showToast(`Initialization failed: ${err.message}`, 'error');
  }
}

/**
 * Load Tracking Page Component.
 */
async function initTrackingPage() {
  const container = document.getElementById('tracking-container');
  const searchForm = document.getElementById('tracking-search-form');
  const searchInput = document.getElementById('tracking-id-input');

  if (!container) return;

  const loadRequest = async (requestId) => {
    try {
      container.innerHTML = `<div style="text-align: center; padding: 4rem;"><span class="spinner spinner-dark"></span> Fetching request details...</div>`;
      const res = await apiRequest(`/api/requests/${requestId}`);
      renderTrackingView(container, res.request);
    } catch (err) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">❌</div>
          <h3 class="empty-title">Request Not Found</h3>
          <p class="empty-desc">No service request found with ID "<strong>${escapeHtml(requestId)}</strong>". Please check your ID and try again.</p>
        </div>
      `;
    }
  };

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = searchInput.value.trim().toUpperCase();
      if (id) {
        loadRequest(id);
      }
    });
  }

  // Load ID from URL if provided
  const urlParams = new URLSearchParams(window.location.search);
  const reqId = urlParams.get('id');
  if (reqId) {
    if (searchInput) searchInput.value = reqId;
    loadRequest(reqId);
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">Track Your Service Request</h3>
        <p class="empty-desc">Enter your Request ID (e.g. <strong>QS1001</strong>) above to check real-time status.</p>
      </div>
    `;
  }
}

function renderTrackingView(container, req) {
  const statuses = ['Pending', 'Accepted', 'In Progress', 'Completed'];
  const isCancelled = req.status === 'Cancelled';
  const currentIndex = statuses.indexOf(req.status);

  const stepsHTML = isCancelled ? `
    <div class="timeline-step cancelled" style="width: 100%;">
      <div class="step-icon">✕</div>
      <div class="step-label">Request Cancelled</div>
    </div>
  ` : statuses.map((st, idx) => {
    let stateClass = '';
    if (idx < currentIndex) stateClass = 'completed';
    else if (idx === currentIndex) stateClass = 'active';

    const iconSymbol = idx < currentIndex ? '✓' : (idx + 1);

    return `
      <div class="timeline-step ${stateClass}">
        <div class="step-icon">${iconSymbol}</div>
        <div class="step-label">${escapeHtml(st)}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="card timeline-card">
      <div class="timeline-header">
        <div>
          <span style="font-size: 0.85rem; color: var(--slate-500); font-weight: 600;">REQUEST ID</span>
          <h2 style="font-size: 1.75rem; color: var(--primary);">${escapeHtml(req.id)}</h2>
        </div>
        <div>${getStatusBadgeHTML(req.status)}</div>
      </div>

      <div class="timeline-steps">
        ${stepsHTML}
      </div>

      <div class="request-details-grid">
        <div class="detail-item">
          <span class="detail-label">Customer Name</span>
          <span class="detail-value">${escapeHtml(req.customer_name)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Service Category</span>
          <span class="detail-value">${escapeHtml(req.service_name)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Assigned Provider</span>
          <span class="detail-value">${escapeHtml(req.provider_name)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Scheduled Date & Time</span>
          <span class="detail-value">${escapeHtml(req.preferred_date)} at ${escapeHtml(req.preferred_time)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Estimated Amount</span>
          <span class="detail-value" style="color: var(--primary);">₹${req.estimated_amount}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Urgency Level</span>
          <span class="detail-value">${escapeHtml(req.urgency)}</span>
        </div>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--slate-200);">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem;">Problem Description</h4>
        <p style="font-size: 0.92rem; color: var(--slate-600); line-height: 1.6;">${escapeHtml(req.problem_description)}</p>
      </div>

      ${req.feedback ? `
        <div style="margin-top: 1.5rem; padding: 1.25rem; background: var(--success-bg); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--radius-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <strong style="color: var(--success);">★ Customer Feedback (${req.feedback.rating}/5)</strong>
            <small style="color: var(--slate-500);">${escapeHtml(req.feedback.created_at)}</small>
          </div>
          <p style="font-size: 0.92rem; color: var(--slate-700);">"${escapeHtml(req.feedback.comment)}"</p>
        </div>
      ` : ''}

      <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end; flex-wrap: wrap;">
        ${req.status === 'Completed' && !req.feedback ? `
          <a href="/feedback?id=${req.id}" class="btn btn-primary">
            ★ Give Feedback
          </a>
        ` : ''}
        <a href="/dashboard" class="btn btn-secondary">
          Go to Dashboard
        </a>
      </div>
    </div>
  `;
}

/**
 * Load Customer & Provider Dashboard Component.
 */
async function initDashboardPage() {
  const container = document.getElementById('dashboard-requests-container');
  if (!container) return;

  const loadDashboardData = async () => {
    try {
      const res = await apiRequest('/api/requests');
      AppState.requests = res.requests;
      
      // Update Summary Widgets
      if (res.stats) {
        document.getElementById('stat-total').innerText = res.stats.total;
        document.getElementById('stat-pending').innerText = res.stats.pending;
        document.getElementById('stat-active').innerText = res.stats.active;
        document.getElementById('stat-completed').innerText = res.stats.completed;
      }

      renderDashboardTable(container, AppState.requests);
    } catch (err) {
      container.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 2rem; color: var(--danger);">Failed to load requests: ${escapeHtml(err.message)}</td></tr>`;
    }
  };

  await loadDashboardData();
}

function renderDashboardTable(container, requests) {
  if (!requests || requests.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem;">
          <div class="empty-state" style="border: none;">
            <div class="empty-icon">📋</div>
            <h3 class="empty-title">No Requests Found</h3>
            <p class="empty-desc">Create your first service request to track it here.</p>
            <a href="/request" class="btn btn-primary btn-sm">Create Service Request</a>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = requests.map(r => `
    <tr>
      <td><strong>${escapeHtml(r.id)}</strong></td>
      <td>
        <div style="font-weight: 600;">${escapeHtml(r.customer_name)}</div>
        <div style="font-size: 0.8rem; color: var(--slate-500);">${escapeHtml(r.customer_phone)}</div>
      </td>
      <td>
        <div>${escapeHtml(r.service_name)}</div>
        <div style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">${escapeHtml(r.provider_name)}</div>
      </td>
      <td>
        <div>${escapeHtml(r.preferred_date)}</div>
        <div style="font-size: 0.8rem; color: var(--slate-500);">${escapeHtml(r.preferred_time)}</div>
      </td>
      <td>₹${r.estimated_amount}</td>
      <td>${getStatusBadgeHTML(r.status)}</td>
      <td>
        <div class="workflow-actions">
          <a href="/tracking?id=${r.id}" class="btn btn-secondary btn-sm" title="View Tracking">
            Track
          </a>
          <button onclick="openStatusModal('${r.id}', '${r.status}')" class="btn btn-primary btn-sm" style="background: var(--slate-800);" title="Provider Action">
            Action ⚡
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Provider Workflow Status Update Modal Handling.
 */
let currentModalRequestId = null;

function openStatusModal(requestId, currentStatus) {
  currentModalRequestId = requestId;
  const overlay = document.getElementById('status-modal-overlay');
  const infoSpan = document.getElementById('modal-req-info');
  const actionsBox = document.getElementById('modal-actions-box');

  if (!overlay) return;

  infoSpan.innerHTML = `Updating Request <strong>${escapeHtml(requestId)}</strong> (Current: ${getStatusBadgeHTML(currentStatus)})`;

  const validNext = {
    'Pending': [
      { status: 'Accepted', label: 'Accept Request', class: 'btn-primary' },
      { status: 'Cancelled', label: 'Reject / Cancel', class: 'btn-secondary' }
    ],
    'Accepted': [
      { status: 'In Progress', label: 'Start Service (In Progress)', class: 'btn-primary' },
      { status: 'Cancelled', label: 'Cancel Request', class: 'btn-secondary' }
    ],
    'In Progress': [
      { status: 'Completed', label: 'Mark as Completed ✓', class: 'btn-primary' },
      { status: 'Cancelled', label: 'Cancel Request', class: 'btn-secondary' }
    ],
    'Completed': [],
    'Cancelled': []
  };

  const allowed = validNext[currentStatus] || [];

  if (allowed.length === 0) {
    actionsBox.innerHTML = `<div style="text-align: center; color: var(--slate-500); font-size: 0.95rem;">No further status actions available for <strong>${escapeHtml(currentStatus)}</strong> request.</div>`;
  } else {
    actionsBox.innerHTML = allowed.map(a => `
      <button onclick="executeStatusUpdate('${a.status}')" class="btn ${a.class}" style="width: 100%; margin-bottom: 0.5rem;">
        ${escapeHtml(a.label)}
      </button>
    `).join('');
  }

  overlay.classList.add('active');
}

function closeStatusModal() {
  const overlay = document.getElementById('status-modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

async function executeStatusUpdate(newStatus) {
  if (!currentModalRequestId) return;

  try {
    const res = await apiRequest(`/api/requests/${currentModalRequestId}/status`, 'PATCH', { status: newStatus });
    showToast(res.message, 'success');
    closeStatusModal();
    
    // Refresh Dashboard if on dashboard page
    if (document.getElementById('dashboard-requests-container')) {
      initDashboardPage();
    } else if (document.getElementById('tracking-container')) {
      initTrackingPage();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Feedback Page Component with Interactive Star Rating.
 */
async function initFeedbackPage() {
  const form = document.getElementById('feedback-form');
  if (!form) return;

  const starsContainer = document.getElementById('star-rating-box');
  const ratingInput = document.getElementById('feedback-rating');
  const reqInfoDisplay = document.getElementById('feedback-req-info');

  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');

  if (!requestId) {
    showToast('No Request ID provided for feedback.', 'error');
    return;
  }

  try {
    const res = await apiRequest(`/api/requests/${requestId}`);
    const req = res.request;

    if (reqInfoDisplay) {
      reqInfoDisplay.innerHTML = `
        <div style="background: var(--slate-100); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
          <div>Request ID: <strong>${escapeHtml(req.id)}</strong></div>
          <div>Service: <strong>${escapeHtml(req.service_name)}</strong></div>
          <div>Provider: <strong>${escapeHtml(req.provider_name)}</strong></div>
        </div>
      `;
    }

    if (req.status !== 'Completed') {
      form.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3 class="empty-title">Cannot Submit Feedback</h3>
          <p class="empty-desc">Feedback can only be submitted for completed requests. Current status: <strong>${escapeHtml(req.status)}</strong></p>
          <a href="/tracking?id=${req.id}" class="btn btn-primary">Track Request Status</a>
        </div>
      `;
      return;
    }

    if (req.feedback) {
      form.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✓</div>
          <h3 class="empty-title">Feedback Already Submitted</h3>
          <p class="empty-desc">Thank you! You rated this service <strong>${req.feedback.rating}/5 stars</strong>.</p>
          <a href="/dashboard" class="btn btn-secondary">Go to Dashboard</a>
        </div>
      `;
      return;
    }

    // Star rating hover & click interactions
    if (starsContainer) {
      const stars = starsContainer.querySelectorAll('.star');
      stars.forEach((star, index) => {
        star.addEventListener('click', () => {
          ratingInput.value = index + 1;
          stars.forEach((s, idx) => {
            if (idx <= index) s.classList.add('selected');
            else s.classList.remove('selected');
          });
        });

        star.addEventListener('mouseenter', () => {
          stars.forEach((s, idx) => {
            if (idx <= index) s.classList.add('hovered');
            else s.classList.remove('hovered');
          });
        });

        starsContainer.addEventListener('mouseleave', () => {
          stars.forEach(s => s.classList.remove('hovered'));
        });
      });
    }

    // Submit Feedback
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const ratingVal = parseInt(ratingInput.value, 10);
      const commentVal = document.getElementById('feedback-comment').value;

      if (!ratingVal || ratingVal < 1 || ratingVal > 5) {
        showToast('Please select a star rating (1 to 5).', 'error');
        return;
      }

      try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';

        const result = await apiRequest(`/api/requests/${requestId}/feedback`, 'POST', {
          rating: ratingVal,
          comment: commentVal
        });

        showToast(result.message, 'success');
        setTimeout(() => {
          window.location.href = `/tracking?id=${requestId}`;
        }, 1200);

      } catch (err) {
        showToast(err.message, 'error');
      }
    });

  } catch (err) {
    showToast(`Failed to load request: ${err.message}`, 'error');
  }
}

// ==============================================================================
// 3. GLOBAL INITIALIZATION
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Drawer Toggle
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Page specific initializers based on present DOM elements
  initServicesPage();
  initProvidersPage();
  initRequestFormPage();
  initTrackingPage();
  initDashboardPage();
  initFeedbackPage();
});
