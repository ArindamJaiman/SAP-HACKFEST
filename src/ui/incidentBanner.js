/**
 * SAP Resilient: Incident Mode Banner (Section 28)
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
        <div class="incident-pulse-badge">INCIDENT ACTIVE</div>
        <div style="display:flex; flex-direction:column;">
          <span class="incident-text-primary">${activeIncidentTitle || 'PORT OF SINGAPORE DISRUPTION'}</span>
          <span class="incident-text-sub">
            SEVERITY: <strong>CRITICAL</strong> · 47 SHIPMENTS AT RISK · SERVICE IMPACT: -8.4% · ESTIMATED EXPOSURE: $142M
          </span>
        </div>
        <button class="btn-tactical cyan" id="btn-focus-incident" style="padding:4px 10px; font-size:10px;">
          FOCUS EPICENTER
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
