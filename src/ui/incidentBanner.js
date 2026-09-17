/**
 * SAP Resilient: Incident Advisory Banner
 */

import { store } from '../app/store.js';

export class IncidentBanner {
  constructor(containerId = 'incident-banner-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    store.subscribe(() => this.update());
    this.update();
  }

  update() {
    const { incidentMode, activeIncidentTitle } = store.getState().ui;
    const { activeDisruption } = store.getState().simulation;

    if (!incidentMode) {
      this.container.innerHTML = '';
      return;
    }

    this.container.innerHTML = `
      <div class="incident-banner">
        <div class="incident-pulse-badge">CRITICAL ADVISORY</div>
        <div style="display:flex; align-items:baseline; gap:8px;">
          <span class="incident-text-primary">${activeIncidentTitle || 'Port of Singapore Force Majeure'}</span>
          <span class="incident-text-sub">
            47 Vessels Delayed · Projected Service Drop: -6.4% · Exposure: $142M
          </span>
        </div>
        <button class="btn-tactical danger" id="btn-focus-incident" style="padding:3px 10px; font-size:10px; margin-left:6px;">
          Focus Epicenter
        </button>
      </div>
    `;

    const focusBtn = document.getElementById('btn-focus-incident');
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        const epicenter = activeDisruption || { lat: 1.264, lon: 103.840 };
        window.__appSceneController?.flyToCoordinates(epicenter.lat, epicenter.lon, 450000, 1.8);
      });
    }
  }
}
