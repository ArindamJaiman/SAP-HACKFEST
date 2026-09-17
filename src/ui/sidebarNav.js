/**
 * SAP Resilient: Expandable Command-Center Sidebar Navigation (Section 5)
 * Sections: COMMAND, INTELLIGENCE, PLANNING, GOVERNANCE, SYSTEM
 * Keyboard shortcuts: G+O (Overview), G+D (Digital Twin), G+S (Scenarios), G+A (AI Agents)
 */

import { store } from '../app/store.js';

export class SidebarNav {
  constructor(containerId = 'left-panel') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.activeTab = 'NAV'; // 'NAV' | 'LAYERS'
    this.pendingKeyPrefix = null;
    this.keyTimer = null;

    this.render();
    store.subscribe(() => this.updateState());
    this.initKeyboardShortcuts();
  }

  render() {
    const state = store.getState();
    const activePage = state.ui.activePage || 'OVERVIEW';
    const pendingApprovalsCount = state.governance.pendingApproval ? 1 : 0;
    const disruptionsCount = state.entities.disruptions.length;
    const atRiskShipments = state.derived?.atRiskShipmentsCount || 47;

    this.container.innerHTML = `
      <div class="sidebar-top-tabs">
        <button class="sidebar-tab ${this.activeTab === 'NAV' ? 'active' : ''}" id="tab-btn-nav">
          <svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
          Console
        </button>
        <button class="sidebar-tab ${this.activeTab === 'LAYERS' ? 'active' : ''}" id="tab-btn-layers">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Layers (${Object.values(state.layers).filter(Boolean).length})
        </button>
        <button class="sidebar-collapse-btn" id="btn-toggle-left-collapse" title="Collapse / Expand Sidebar">
          ◀
        </button>
      </div>

      <div class="sidebar-scrollable-area" id="sidebar-content-area">
        ${this.activeTab === 'NAV' ? this.renderNavigation(activePage, pendingApprovalsCount, disruptionsCount, atRiskShipments) : this.renderLayers(state)}
      </div>

      <div class="sidebar-footer-status">
        <div class="footer-status-pill">
          <span class="status-dot green"></span>
          <span>SAP BTP Orchestrator Active</span>
        </div>
        <div class="footer-keyboard-hint">
          Shortcuts: <kbd>G</kbd>+<kbd>O</kbd> / <kbd>G</kbd>+<kbd>D</kbd> / <kbd>G</kbd>+<kbd>S</kbd> / <kbd>G</kbd>+<kbd>A</kbd>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderNavigation(activePage, pendingApprovals, disruptionsCount, atRiskShipments) {
    const navSections = [
      {
        section: 'COMMAND',
        items: [
          { id: 'OVERVIEW', label: 'Overview', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', shortcut: 'G O', badge: null },
          { id: 'DIGITAL_TWIN', label: 'Digital Twin (3D)', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', shortcut: 'G D', badge: 'LIVE' },
          { id: 'LIVE_OPS', label: 'Live Operations', icon: 'M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.01-4.09l-2.46-1.45C16.03 17.81 14.15 19 12 19z', shortcut: null, badge: `${atRiskShipments} Risk` }
        ]
      },
      {
        section: 'INTELLIGENCE',
        items: [
          { id: 'AGENTS', label: 'AI Agents Console', icon: 'M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z', shortcut: 'G A', badge: '9 Active' },
          { id: 'DISRUPTIONS', label: 'Disruptions & Incidents', icon: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z', shortcut: null, badge: `${disruptionsCount} Active`, badgeClass: 'danger' },
          { id: 'RISK', label: 'Risk Intelligence', icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z', shortcut: null, badge: null },
          { id: 'FORECAST', label: 'Forecasting & Demand', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z', shortcut: null, badge: null }
        ]
      },
      {
        section: 'PLANNING',
        items: [
          { id: 'SCENARIOS', label: 'Scenarios Workbench', icon: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z', shortcut: 'G S', badge: '5 Ready' },
          { id: 'WHAT_IF', label: 'What-If Simulation', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z', shortcut: null, badge: 'Compare' },
          { id: 'INVENTORY', label: 'Inventory Control Tower', icon: 'M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-1 18H5V9h14v11zm1-13H4V4h16v3z', shortcut: null, badge: 'Runway' },
          { id: 'SUPPLIERS', label: 'Supplier Intelligence', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', shortcut: null, badge: '160 T1/2' },
          { id: 'LOGISTICS', label: 'Logistics & Routes', icon: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z', shortcut: null, badge: '320 Units' }
        ]
      },
      {
        section: 'GOVERNANCE',
        items: [
          { id: 'APPROVALS', label: 'Approval Queue', icon: 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z', shortcut: null, badge: pendingApprovals > 0 ? `${pendingApprovals} Action` : '0', badgeClass: pendingApprovals > 0 ? 'warning' : '' },
          { id: 'AUDIT', label: 'Audit Trail & History', icon: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z', shortcut: null, badge: null },
          { id: 'COMPLIANCE', label: 'Compliance & Trade', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z', shortcut: null, badge: 'Compliant' },
          { id: 'SUSTAINABILITY', label: 'Sustainability & ESG', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', shortcut: null, badge: 'CO2 -18%' }
        ]
      },
      {
        section: 'SYSTEM',
        items: [
          { id: 'DATA_SOURCES', label: 'Data Sources & SAP Adapters', icon: 'M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z', shortcut: null, badge: '5 Adapters' },
          { id: 'HEALTH', label: 'System Health & Latency', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z', shortcut: null, badge: '28ms' },
          { id: 'SETTINGS', label: 'Settings & Demo Config', icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z', shortcut: null, badge: null }
        ]
      }
    ];

    return navSections.map(sec => `
      <div class="nav-section-group">
        <div class="nav-section-title">${sec.section}</div>
        <div class="nav-items-list">
          ${sec.items.map(item => `
            <button class="nav-item-btn ${activePage === item.id ? 'active' : ''}" data-page="${item.id}">
              <svg class="nav-icon" viewBox="0 0 24 24"><path d="${item.icon}"/></svg>
              <span class="nav-label">${item.label}</span>
              ${item.badge ? `<span class="nav-badge ${item.badgeClass || ''}">${item.badge}</span>` : ''}
              ${item.shortcut ? `<span class="nav-shortcut">${item.shortcut}</span>` : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  renderLayers(state) {
    const { entities, layers } = state;
    const layerDefinitions = [
      { key: 'ports', label: 'Ports & Maritime Terminals', color: '#38bdf8', count: entities.ports.length },
      { key: 'factories', label: 'Manufacturing Facilities', color: '#f97316', count: entities.factories.length },
      { key: 'suppliers', label: 'Tier-1/2 Suppliers', color: '#f59e0b', count: entities.suppliers.length },
      { key: 'warehouses', label: 'Fulfillment Centers', color: '#3b82f6', count: entities.warehouses.length },
      { key: 'vessels', label: 'Commercial Fleet', color: '#f8fafc', count: entities.vessels.length },
      { key: 'shipments', label: 'In-Transit Shipments', color: '#10b981', count: entities.shipments.length },
      { key: 'demand', label: 'Regional Demand Markets', color: '#8b5cf6', count: entities.demandCenters.length },
      { key: 'network', label: 'Intermodal Shipping Lanes', color: '#64748b', count: entities.routes.length },
      { key: 'disruptions', label: 'Active Disruptions', color: '#ef4444', count: entities.disruptions.length },
      { key: 'aiRoutes', label: 'Contingency Corridors', color: '#10b981', count: '4' }
    ];

    return `
      <div style="padding: 12px 14px;">
        <div style="font-size:11px; font-weight:600; color:var(--color-neutral); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:10px;">
          Global Map Layers
        </div>
        ${layerDefinitions.map(def => `
          <div class="layer-card" data-layer="${def.key}">
            <div class="layer-info">
              <span class="layer-indicator" style="background:${def.color};"></span>
              <span class="layer-title">${def.label}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="layer-badge">${def.count}</span>
              <input type="checkbox" ${layers[def.key] ? 'checked' : ''} style="cursor:pointer;" />
            </div>
          </div>
        `).join('')}

        <div style="margin-top:16px; padding:12px; background:rgba(30,41,59,0.35); border:1px solid var(--border-subtle); border-radius:var(--radius-sm);">
          <div style="font-size:11px; font-weight:600; color:var(--color-primary-light); margin-bottom:8px; text-transform:uppercase;">
            Fast Scenario Trigger
          </div>
          <select id="select-quick-scenario" style="width:100%; font-size:11px; margin-bottom:10px;">
            <option value="SCENARIO-01">Singapore Port Closure (5-Day Halt)</option>
            <option value="SCENARIO-02">Suez Canal Transit Restriction</option>
            <option value="SCENARIO-03">Hsinchu Semiconductor Fab Outage</option>
            <option value="SCENARIO-04">22% European Demand Surge</option>
            <option value="SCENARIO-05">Bay of Bengal Cyclone Rerouting</option>
          </select>
          <button class="btn-tactical primary" id="btn-quick-trigger" style="width:100%; padding:8px 10px; font-size:11px;">
            Run Disruption Simulation
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Top Tabs toggle
    const tabNav = document.getElementById('tab-btn-nav');
    const tabLayers = document.getElementById('tab-btn-layers');
    if (tabNav && tabLayers) {
      tabNav.addEventListener('click', () => {
        this.activeTab = 'NAV';
        this.render();
      });
      tabLayers.addEventListener('click', () => {
        this.activeTab = 'LAYERS';
        this.render();
      });
    }

    // Collapse sidebar button
    const collapseBtn = document.getElementById('btn-toggle-left-collapse');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        this.container.classList.toggle('collapsed');
        const isCollapsed = this.container.classList.contains('collapsed');
        collapseBtn.textContent = isCollapsed ? '▶' : '◀';
        store.setState(s => { s.ui.leftPanelCollapsed = isCollapsed; });
      });
    }

    // Navigation buttons
    this.container.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.getAttribute('data-page');
        store.setActivePage(page);
      });
    });

    // Layer checkboxes
    this.container.querySelectorAll('.layer-card').forEach(card => {
      const key = card.getAttribute('data-layer');
      const checkbox = card.querySelector('input[type="checkbox"]');
      card.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        store.toggleLayer(key);
      });
    });

    // Quick Trigger button
    const quickBtn = document.getElementById('btn-quick-trigger');
    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        const select = document.getElementById('select-quick-scenario');
        const scenarioId = select?.value || 'SCENARIO-01';
        const { disruptions } = store.getState().entities;
        const disr = disruptions[0]; // Singapore Flagship
        window.__appOrchestrator?.triggerDisruptionWorkflow(disr);
      });
    }
  }

  updateState() {
    const state = store.getState();
    const activePage = state.ui.activePage || 'OVERVIEW';

    // Highlight active nav item
    this.container.querySelectorAll('.nav-item-btn').forEach(btn => {
      if (btn.getAttribute('data-page') === activePage) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update pending approvals badge if present
    const approvalsBtn = this.container.querySelector('[data-page="APPROVALS"] .nav-badge');
    if (approvalsBtn) {
      const pendingCount = state.governance.pendingApproval ? 1 : 0;
      approvalsBtn.textContent = pendingCount > 0 ? `${pendingCount} Action` : '0';
      approvalsBtn.className = `nav-badge ${pendingCount > 0 ? 'warning' : ''}`;
    }
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      const key = e.key.toUpperCase();

      // Handle two-key chord "G then X"
      if (this.pendingKeyPrefix === 'G') {
        clearTimeout(this.keyTimer);
        this.pendingKeyPrefix = null;

        if (key === 'O') {
          e.preventDefault();
          store.setActivePage('OVERVIEW');
        } else if (key === 'D') {
          e.preventDefault();
          store.setActivePage('DIGITAL_TWIN');
        } else if (key === 'S') {
          e.preventDefault();
          store.setActivePage('SCENARIOS');
        } else if (key === 'A') {
          e.preventDefault();
          store.setActivePage('AGENTS');
        }
        return;
      }

      if (key === 'G') {
        this.pendingKeyPrefix = 'G';
        this.keyTimer = setTimeout(() => {
          this.pendingKeyPrefix = null;
        }, 1200);
      }
    });
  }
}
