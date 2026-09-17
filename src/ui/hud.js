/**
 * SAP Resilient: Persistent Application Shell Top Bar (Section 4)
 * LEFT: SAP Resilient Logo/Name
 * CENTER: Live operational status (● NETWORK ONLINE, ● LAST SYNC 00:04, ● DIGITAL TWIN LIVE)
 * RIGHT: Notifications, AI activity indicator, Scenario status, Operator profile, Settings & Presentation mode
 */

import { store } from '../app/store.js';

export class ExecutiveHud {
  constructor(containerId = 'top-hud') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.notificationsOpen = false;
    this.syncSeconds = 4;
    this.startSyncTimer();

    this.render();
    store.subscribe(() => this.update());
  }

  startSyncTimer() {
    setInterval(() => {
      this.syncSeconds++;
      if (this.syncSeconds > 59) this.syncSeconds = 1;
      const el = document.getElementById('hud-last-sync-time');
      if (el) el.textContent = `00:${String(this.syncSeconds).padStart(2, '0')}`;
    }, 1000);
  }

  render() {
    const state = store.getState();
    const unreadCount = state.notifications.filter(n => !n.read).length;
    const isRecovery = state.simulation.recoveryStatus === 'IN_RECOVERY';

    this.container.innerHTML = `
      <!-- LEFT: Brand & Identity -->
      <div class="topbar-left">
        <div class="brand-group" id="btn-brand-home" style="cursor:pointer;" title="Return to Overview (G+O)">
          <div class="brand-logo">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span class="brand-name">SAP RESILIENT</span>
          </div>
          <span class="brand-edition-tag">CONTROL TOWER</span>
        </div>
      </div>

      <!-- CENTER: Live Operational Telemetry Status (Section 4) -->
      <div class="topbar-center">
        <div class="live-status-strip">
          <div class="status-indicator-item online">
            <span class="status-dot green pulse"></span>
            <span class="status-text">NETWORK ONLINE</span>
          </div>
          <span class="status-divider">|</span>
          <div class="status-indicator-item sync">
            <span class="status-dot slate"></span>
            <span class="status-text">LAST SYNC <span id="hud-last-sync-time">00:04</span></span>
          </div>
          <span class="status-divider">|</span>
          <div class="status-indicator-item twin">
            <span class="status-dot cyan pulse"></span>
            <span class="status-text">DIGITAL TWIN LIVE</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Tactical Indicators, Notifications, Actions & Profile -->
      <div class="topbar-right">
        <!-- AI Agent Activity Indicator -->
        <div class="ai-status-indicator ${isRecovery ? 'active-exec' : 'active-sense'}" title="Agentic Sensing Loop Active">
          <span class="ai-pulse-icon">⚡</span>
          <span class="ai-status-label">${isRecovery ? 'AGENTS EXECUTING' : 'AI SENSING'}</span>
        </div>

        <!-- Scenario Status Chip -->
        <div class="scenario-status-chip" id="btn-topbar-scenario" title="Active Disruption Scenario">
          <span class="scenario-dot red"></span>
          <span>SIN CASCADE</span>
        </div>

        <!-- Notification Bell Dropdown -->
        <div class="notification-wrapper" style="position:relative;">
          <button class="topbar-icon-btn ${unreadCount > 0 ? 'has-unread' : ''}" id="btn-topbar-notifications" title="Operational Alerts & Notifications">
            <svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
            ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ''}
          </button>
          <div class="notifications-dropdown-menu" id="dropdown-notifications" style="display:none;">
            <div class="notif-header">
              <span>Operational Alerts (${state.notifications.length})</span>
              <button id="btn-clear-notifs" style="font-size:10px; color:var(--color-primary-light);">Mark All Read</button>
            </div>
            <div class="notif-list">
              ${state.notifications.map(n => `
                <div class="notif-item ${n.severity.toLowerCase()} ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
                  <div class="notif-title-row">
                    <span class="notif-sev-tag ${n.severity.toLowerCase()}">${n.severity}</span>
                    <span class="notif-time">${n.time}</span>
                  </div>
                  <div class="notif-title">${n.title}</div>
                  <div class="notif-msg">${n.message}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Global Command Bar Shortcut -->
        <button class="btn-tactical outline-subtle" id="btn-open-command-bar" title="Search Entities or Execute Commands (Ctrl+K or /)">
          <svg style="width:12px; height:12px; fill:currentColor;" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <span class="btn-text">Find</span>
          <kbd class="topbar-kbd">Ctrl+K</kbd>
        </button>

        <!-- Presentation Mode Toggle (Section 79) -->
        <button class="btn-tactical outline-subtle" id="btn-toggle-presentation" title="Toggle Clean Presentation Mode">
          <svg style="width:12px; height:12px; fill:currentColor;" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
          <span class="btn-text">Present</span>
        </button>

        <!-- Operator User Profile -->
        <div class="operator-profile-card" title="Enterprise Role: Supply Chain Architect">
          <div class="operator-avatar">AJ</div>
          <div class="operator-meta">
            <span class="operator-name">A. Jaiman</span>
            <span class="operator-role">Architect</span>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Brand home button
    const brandHome = document.getElementById('btn-brand-home');
    if (brandHome) {
      brandHome.addEventListener('click', () => {
        store.setActivePage('OVERVIEW');
      });
    }

    // Notifications toggle
    const notifBtn = document.getElementById('btn-topbar-notifications');
    const notifDropdown = document.getElementById('dropdown-notifications');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.notificationsOpen = !this.notificationsOpen;
        notifDropdown.style.display = this.notificationsOpen ? 'block' : 'none';
      });

      document.addEventListener('click', () => {
        if (this.notificationsOpen) {
          this.notificationsOpen = false;
          notifDropdown.style.display = 'none';
        }
      });
    }

    // Mark all read button
    const clearBtn = document.getElementById('btn-clear-notifs');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.setState(s => {
          s.notifications.forEach(n => n.read = true);
        });
      });
    }

    // Click notif item to view entity
    this.container.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const notif = store.getState().notifications.find(n => n.id === id);
        if (notif) {
          store.markNotificationRead(id);
          if (notif.entityType === 'port') {
            const port = store.getState().entities.ports.find(p => p.id === notif.entityId);
            if (port) store.selectEntity(port);
          }
        }
      });
    });

    // Presentation mode button
    const presentBtn = document.getElementById('btn-toggle-presentation');
    if (presentBtn) {
      presentBtn.addEventListener('click', () => {
        store.togglePresentationMode();
      });
    }

    // Scenario button jump
    const scenBtn = document.getElementById('btn-topbar-scenario');
    if (scenBtn) {
      scenBtn.addEventListener('click', () => {
        store.setActivePage('SCENARIOS');
      });
    }
  }

  update() {
    const state = store.getState();
    const isRecovery = state.simulation.recoveryStatus === 'IN_RECOVERY';
    const aiIndicator = this.container.querySelector('.ai-status-indicator');
    if (aiIndicator) {
      aiIndicator.className = `ai-status-indicator ${isRecovery ? 'active-exec' : 'active-sense'}`;
      const label = aiIndicator.querySelector('.ai-status-label');
      if (label) label.textContent = isRecovery ? 'AGENTS EXECUTING' : 'AI SENSING';
    }

    // Presentation Mode toggle styling
    const presentBtn = document.getElementById('btn-toggle-presentation');
    if (presentBtn) {
      if (state.ui.presentationMode) {
        presentBtn.classList.add('active');
        document.body.classList.add('presentation-mode-active');
      } else {
        presentBtn.classList.remove('active');
        document.body.classList.remove('presentation-mode-active');
      }
    }
  }
}
