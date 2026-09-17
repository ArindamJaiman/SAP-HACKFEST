/**
 * SAP Resilient: Executive KPI Bar
 * Real-time composite network health and strategic enterprise metrics
 */

import { store } from '../app/store.js';

export class ExecutiveHud {
  constructor(containerId = 'top-hud') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
    store.subscribe(() => this.update());
  }

  render() {
    this.container.innerHTML = `
      <div class="brand-group">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          SAP RESILIENT
        </div>
        <div class="brand-status-chip live">Control Tower</div>
      </div>

      <div class="kpi-cluster">
        <!-- Composite Health Tile -->
        <div class="health-score-card" id="btn-health-drilldown" title="Composite Network Health Breakdown">
          <div style="display:flex; flex-direction:column;">
            <span class="kpi-label">Health Score</span>
            <span class="health-score-val" id="hud-health-score">82</span>
          </div>
          <div style="font-size:10px; color:var(--color-primary-light); font-family:var(--font-mono); line-height:1.2;">
            RSL: <span id="val-resil">78</span><br>
            INV: <span id="val-invent">84</span>
          </div>
        </div>

        <div class="kpi-item" id="kpi-disruptions">
          <span class="kpi-label">Active Disruptions</span>
          <div class="kpi-value-row">
            <span class="kpi-value" style="color:var(--color-danger);" id="hud-disruptions">3</span>
            <span class="kpi-delta bad">CRITICAL</span>
          </div>
        </div>

        <div class="kpi-item" id="kpi-service-level">
          <span class="kpi-label">Service Level</span>
          <div class="kpi-value-row">
            <span class="kpi-value" id="hud-service-level">91.2%</span>
            <span class="kpi-delta bad" id="hud-service-delta">-6.4%</span>
          </div>
        </div>

        <div class="kpi-item" id="kpi-at-risk-shipments">
          <span class="kpi-label">At-Risk Shipments</span>
          <div class="kpi-value-row">
            <span class="kpi-value" style="color:var(--color-warning);" id="hud-at-risk-shipments">47</span>
            <span class="kpi-delta warn">> 24h</span>
          </div>
        </div>

        <div class="kpi-item" id="kpi-revenue-exposure">
          <span class="kpi-label">Revenue Exposure</span>
          <div class="kpi-value-row">
            <span class="kpi-value" id="hud-revenue-risk">$142M</span>
            <span class="kpi-delta bad">EXPOSURE</span>
          </div>
        </div>

        <div class="kpi-item" id="kpi-otd">
          <span class="kpi-label">On-Time Delivery</span>
          <div class="kpi-value-row">
            <span class="kpi-value" id="hud-otd">88.5%</span>
            <span class="kpi-delta warn">TGT 98%</span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <!-- 3D / 2D / GRAPH View Switcher -->
        <div class="segmented-control">
          <button class="segmented-btn active" id="btn-mode-3d">3D Globe</button>
          <button class="segmented-btn" id="btn-mode-2d">2D Map</button>
          <button class="segmented-btn" id="btn-mode-graph">Network Graph</button>
        </div>

        <button class="btn-tactical primary" id="btn-open-command-bar" title="Search or execute directives (Shortcut: /)">
          <svg style="width:12px; height:12px; fill:currentColor;" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          Command [/]
        </button>

        <button class="btn-tactical success" id="btn-demo-mode">
          Demo Presentation
        </button>
      </div>
    `;

    this.initEvents();
  }

  initEvents() {
    const btn3D = document.getElementById('btn-mode-3d');
    const btn2D = document.getElementById('btn-mode-2d');
    const btnGraph = document.getElementById('btn-mode-graph');

    btn3D.addEventListener('click', () => {
      this.setActiveBtn(btn3D);
      store.setViewMode('3D');
    });
    btn2D.addEventListener('click', () => {
      this.setActiveBtn(btn2D);
      store.setViewMode('2D');
    });
    btnGraph.addEventListener('click', () => {
      this.setActiveBtn(btnGraph);
      store.setViewMode('GRAPH');
    });
  }

  setActiveBtn(btn) {
    document.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  update() {
    const state = store.getState();
    const d = state.derived;
    if (!d) return;

    document.getElementById('hud-health-score').textContent = d.compositeHealth;
    document.getElementById('val-resil').textContent = d.healthBreakdown.resilience;
    document.getElementById('val-invent').textContent = d.healthBreakdown.inventory;
    document.getElementById('hud-disruptions').textContent = d.activeDisruptionsCount;
    document.getElementById('hud-service-level').textContent = `${d.serviceLevel}%`;
    document.getElementById('hud-at-risk-shipments').textContent = d.atRiskShipmentsCount;
    document.getElementById('hud-revenue-risk').textContent = `$${Math.round(d.revenueAtRiskUSD / 1000000)}M`;
    document.getElementById('hud-otd').textContent = `${d.onTimeDeliveryRate}%`;

    const sDelta = document.getElementById('hud-service-delta');
    if (d.serviceLevel >= 97) {
      sDelta.textContent = '+6.9% Restabilized';
      sDelta.className = 'kpi-delta good';
    } else {
      sDelta.textContent = '-6.4% Exposure';
      sDelta.className = 'kpi-delta bad';
    }
  }
}
