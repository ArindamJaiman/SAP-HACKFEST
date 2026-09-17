/**
 * SAP Resilient: Hero Overview Screen & Clickable Top-Level KPIs (Section 6)
 * "Sense disruptions. Simulate consequences. Orchestrate response."
 * 8 Clickable Executive KPIs that filter and focus the Digital Twin
 * Plus Section 52: Floating 3D UI Controls Toolbar
 */

import { store } from '../app/store.js';
import * as Cesium from 'cesium';

export class HeroOverview {
  constructor(containerId = 'center-viewport') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    store.subscribe(() => this.update());
  }

  render() {
    const state = store.getState();
    const d = state.derived || {};
    const isRecovery = state.simulation.recoveryStatus === 'IN_RECOVERY';
    const recPct = state.simulation.activeRecoveryPercent / 100;

    const health = d.compositeHealth || 82;
    const otif = d.onTimeDeliveryRate || '88.5';
    const inventoryRisk = isRecovery ? '9.4 Days' : '4.8 Days';
    const activeDisruptions = d.activeDisruptionsCount || 3;
    const ordersAtRisk = isRecovery ? Math.round(84 * (1 - recPct * 0.75)) : 84;
    const recoveryTime = isRecovery ? '4.1 Days' : '9.4 Days';
    const exposure = isRecovery ? `$${Math.round(142 * (1 - recPct * 0.8))}M` : '$142M';
    const carbon = isRecovery ? '910t CO2' : '840t CO2';

    this.container.innerHTML = `
      <!-- Hero Header Overlay (Section 6) -->
      <div class="hero-control-tower-banner" id="hero-banner">
        <div class="hero-banner-inner">
          <div class="hero-title-group">
            <h1 class="hero-main-title">RESILIENT CONTROL TOWER</h1>
            <p class="hero-subtitle">Sense disruptions. Simulate consequences. Orchestrate response.</p>
          </div>
          <div class="hero-twin-tag">
            <span class="pulse-ring-dot"></span>
            LIVE DIGITAL TWIN
          </div>
        </div>
      </div>

      <!-- 8 Top-Level Clickable Executive KPIs (Section 6) -->
      <div class="executive-kpi-grid" id="kpi-grid">
        <!-- 1. Network Health -->
        <div class="kpi-card clickable" id="kpi-network-health" title="Click to view health dimensions">
          <div class="kpi-card-header">
            <span class="kpi-card-label">Network Health</span>
            <span class="kpi-status-badge ${health > 85 ? 'good' : 'warn'}">${health > 85 ? 'HEALTHY' : 'DEGRADED'}</span>
          </div>
          <div class="kpi-card-val-row">
            <span class="kpi-card-value">${health}</span>
            <span class="kpi-card-sub">/ 100</span>
          </div>
          <div class="kpi-card-footer">
            <span class="kpi-sub-trend ${isRecovery ? 'positive' : 'negative'}">${isRecovery ? '▲ +14pts (Restabilizing)' : '▼ -8pts (Exposed)'}</span>
          </div>
        </div>

        <!-- 2. OTIF -->
        <div class="kpi-card clickable" id="kpi-otif" title="Click to drill down into delivery SLA">
          <div class="kpi-card-header">
            <span class="kpi-card-label">OTIF</span>
            <span class="kpi-status-badge ${parseFloat(otif) > 95 ? 'good' : 'warn'}">TGT 98%</span>
          </div>
          <div class="kpi-card-val-row">
            <span class="kpi-card-value">${otif}%</span>
          </div>
          <div class="kpi-card-footer">
            <span class="kpi-sub-trend ${isRecovery ? 'positive' : 'negative'}">${isRecovery ? '▲ +5.8% SLA recovered' : '▼ -1.8% vs Target'}</span>
          </div>
        </div>

        <!-- 3. Inventory Risk -->
        <div class="kpi-card clickable" id="kpi-inventory-risk" title="Click to highlight risky warehouses on 3D twin">
          <div class="kpi-card-header">
            <span class="kpi-card-label">Inventory Risk</span>
            <span class="kpi-status-badge ${isRecovery ? 'warn' : 'crit'}">${isRecovery ? 'BUFFERING' : 'CRITICAL'}</span>
          </div>
          <div class="kpi-card-val-row">
            <span class="kpi-card-value" style="color:var(--color-warning);">${inventoryRisk}</span>
            <span class="kpi-card-sub">cover</span>
          </div>
          <div class="kpi-card-footer">
            <span class="kpi-sub-trend negative">WH-17 at stockout risk</span>
          </div>
        </div>

        <!-- 4. Active Disruptions -->
        <div class="kpi-card clickable" id="kpi-active-disruptions" title="Click to focus camera smoothly on Singapore epicenter">
          <div class="kpi-card-header">
            <span class="kpi-card-label">Active Disruptions</span>
            <span class="kpi-status-badge crit">SEV-1 HIGH</span>
          </div>
          <div class="kpi-card-val-row">
            <span class="kpi-card-value" style="color:var(--color-danger);">${activeDisruptions}</span>
            <span class="kpi-card-sub">epicenters</span>
          </div>
          <div class="kpi-card-footer">
            <span class="kpi-sub-trend negative">Port of Singapore (Focus ➔)</span>
          </div>
        </div>

        <!-- 5. Orders at Risk -->
        <div class="kpi-card clickable" id="kpi-orders-at-risk" title="Click to filter 3D twin to affected orders & shipments">
          <div class="kpi-card-header">
            <span class="kpi-card-label">Orders at Risk</span>
            <span class="kpi-status-badge ${ordersAtRisk > 30 ? 'crit' : 'good'}">${ordersAtRisk > 30 ? 'ELEVATED' : 'PROTECTED'}</span>
          </div>
          <div class="kpi-card-val-row">
            <span class="kpi-card-value" style="color:var(--color-danger);">${ordersAtRisk}</span>
            <span class="kpi-card-sub">orders</span>
          </div>
          <div class="kpi-card-footer">
            <span class="kpi-sub-trend ${isRecovery ? 'positive' : 'negative'}">${isRecovery ? '▼ 62 orders re-secured' : '47 Inbound Shipments Delayed'}</span>
          </div>
        </div>

        <!-- 6. Recovery Time -->
        <div class="kpi-card clickable" id="kpi-recovery-time" title="Click to open Scenario What-If Simulator">
          <div class="kpi-card-header">
            <span class="kpi-card-label">Recovery Time</span>
            <span class="kpi-status-badge ${isRecovery ? 'good' : 'warn'}">${isRecovery ? 'OPTIMAL' : 'PROJECTED'}</span>
          </div>
          <div class="kpi-card-val-row">
            <span class="kpi-card-value">${recoveryTime}</span>
          </div>
          <div class="kpi-card-footer">
            <span class="kpi-sub-trend ${isRecovery ? 'positive' : 'warn'}">${isRecovery ? '▼ -5.3d with Port Klang' : 'Baseline 9.4d without AI'}</span>
          </div>
        </div>

        <!-- 7. Estimated Exposure -->
        <div class="kpi-card clickable" id="kpi-estimated-exposure" title="Click to open Disruption Impact Panel">
          <div class="kpi-card-header">
            <span class="kpi-card-label">Estimated Exposure</span>
            <span class="kpi-status-badge crit">REVENUE</span>
          </div>
          <div class="kpi-card-val-row">
            <span class="kpi-card-value" style="color:var(--color-danger);">${exposure}</span>
          </div>
          <div class="kpi-card-footer">
            <span class="kpi-sub-trend ${isRecovery ? 'positive' : 'negative'}">${isRecovery ? '▼ $114M mitigated' : 'High value auto/tech SKUs'}</span>
          </div>
        </div>

        <!-- 8. Carbon Impact -->
        <div class="kpi-card clickable" id="kpi-carbon-impact" title="Click to view Sustainability & ESG consequences">
          <div class="kpi-card-header">
            <span class="kpi-card-label">Carbon Impact</span>
            <span class="kpi-status-badge">ESG</span>
          </div>
          <div class="kpi-card-val-row">
            <span class="kpi-card-value">${carbon}</span>
          </div>
          <div class="kpi-card-footer">
            <span class="kpi-sub-trend warn">+8.3% Expedite Tradeoff</span>
          </div>
        </div>
      </div>

      <!-- Floating 3D Toolbar (Section 52) -->
      <div class="floating-3d-toolbar" id="digital-twin-toolbar">
        <div class="toolbar-group">
          <button class="toolbar-btn" id="btn-cam-reset" title="Reset Camera to Global Orbit">
            <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
            <span>Reset</span>
          </button>
          <button class="toolbar-btn" id="btn-cam-global" title="Global View">
            <span>Global</span>
          </button>
          <button class="toolbar-btn" id="btn-cam-regions" title="Asia-Pacific Focus">
            <span>APAC</span>
          </button>
          <button class="toolbar-btn" id="btn-cam-europe" title="Europe Corridor">
            <span>EMEA</span>
          </button>
          <button class="toolbar-btn" id="btn-cam-americas" title="Americas Corridor">
            <span>Americas</span>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button class="toolbar-btn ${state.layers.risk ? 'active' : ''}" id="btn-tool-risk" title="Toggle Risk Heatmap Layer">
            <span>Risk</span>
          </button>
          <button class="toolbar-btn ${state.ui.weatherLayer ? 'active' : ''}" id="btn-tool-weather" title="Toggle Simulated MetOcean Weather Layer">
            <span>Weather</span>
          </button>
          <button class="toolbar-btn ${state.layers.inventory ? 'active' : ''}" id="btn-tool-inventory" title="Toggle 3D Inventory Columns">
            <span>Inventory</span>
          </button>
          <button class="toolbar-btn ${state.ui.labelsVisible ? 'active' : ''}" id="btn-tool-labels" title="Toggle 3D Facility Labels">
            <span>Labels</span>
          </button>
          <button class="toolbar-btn ${state.ui.twinInspectMode ? 'active' : ''}" id="btn-tool-inspect" title="Twin Inspect Developer Mode">
            <span>Inspect</span>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <div class="segmented-control mini">
            <button class="segmented-btn ${state.ui.viewMode === '3D' ? 'active' : ''}" id="btn-submode-3d">3D</button>
            <button class="segmented-btn ${state.ui.viewMode === '2D' ? 'active' : ''}" id="btn-submode-2d">2D</button>
            <button class="segmented-btn ${state.ui.viewMode === 'GRAPH' ? 'active' : ''}" id="btn-submode-graph">Graph</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // 1. Network Health click
    const healthCard = document.getElementById('kpi-network-health');
    if (healthCard) {
      healthCard.addEventListener('click', () => {
        store.setActivePage('OVERVIEW');
        window.__appSceneController?.flyToGlobal();
      });
    }

    // 2. OTIF click
    const otifCard = document.getElementById('kpi-otif');
    if (otifCard) {
      otifCard.addEventListener('click', () => {
        store.setActivePage('LIVE_OPS');
      });
    }

    // 3. Inventory Risk click: highlight risky warehouses
    const invRiskCard = document.getElementById('kpi-inventory-risk');
    if (invRiskCard) {
      invRiskCard.addEventListener('click', () => {
        const wh17 = store.getState().entities.warehouses.find(w => w.id === 'WH-17');
        if (wh17) {
          store.selectEntity(wh17);
          window.__appSceneController?.flyToLocation(wh17.lat, wh17.lon, 450000);
        }
      });
    }

    // 4. Active Disruptions click: focus camera on Singapore disruption
    const disrCard = document.getElementById('kpi-active-disruptions');
    if (disrCard) {
      disrCard.addEventListener('click', () => {
        const sinPort = store.getState().entities.ports.find(p => p.id === 'PORT-SIN');
        if (sinPort) {
          store.selectEntity(sinPort);
          window.__appSceneController?.flyToLocation(sinPort.lat, sinPort.lon, 650000);
        }
      });
    }

    // 5. Orders at Risk click: filter twin
    const ordersCard = document.getElementById('kpi-orders-at-risk');
    if (ordersCard) {
      ordersCard.addEventListener('click', () => {
        store.setActivePage('LIVE_OPS');
      });
    }

    // 6. Recovery Time click: open Scenarios
    const recCard = document.getElementById('kpi-recovery-time');
    if (recCard) {
      recCard.addEventListener('click', () => {
        store.setActivePage('SCENARIOS');
      });
    }

    // 7. Estimated Exposure click: open Disruption details
    const expCard = document.getElementById('kpi-estimated-exposure');
    if (expCard) {
      expCard.addEventListener('click', () => {
        const disr = store.getState().entities.disruptions[0];
        if (disr) store.selectEntity(disr);
      });
    }

    // 8. Carbon Impact click: open Sustainability
    const carbonCard = document.getElementById('kpi-carbon-impact');
    if (carbonCard) {
      carbonCard.addEventListener('click', () => {
        store.setActivePage('SUSTAINABILITY');
      });
    }

    // Floating 3D Toolbar camera buttons
    const btnReset = document.getElementById('btn-cam-reset');
    if (btnReset) btnReset.addEventListener('click', () => window.__appSceneController?.flyToGlobal());

    const btnGlobal = document.getElementById('btn-cam-global');
    if (btnGlobal) btnGlobal.addEventListener('click', () => window.__appSceneController?.flyToGlobal());

    const btnApac = document.getElementById('btn-cam-regions');
    if (btnApac) btnApac.addEventListener('click', () => window.__appSceneController?.flyToLocation(14.0, 108.0, 8000000));

    const btnEmea = document.getElementById('btn-cam-europe');
    if (btnEmea) btnEmea.addEventListener('click', () => window.__appSceneController?.flyToLocation(48.0, 10.0, 7500000));

    const btnAmericas = document.getElementById('btn-cam-americas');
    if (btnAmericas) btnAmericas.addEventListener('click', () => window.__appSceneController?.flyToLocation(35.0, -95.0, 9000000));

    // Toolbar layer toggles
    const btnRisk = document.getElementById('btn-tool-risk');
    if (btnRisk) btnRisk.addEventListener('click', () => store.toggleLayer('risk'));

    const btnWeather = document.getElementById('btn-tool-weather');
    if (btnWeather) {
      btnWeather.addEventListener('click', () => {
        store.setState(s => { s.ui.weatherLayer = !s.ui.weatherLayer; });
      });
    }

    const btnInv = document.getElementById('btn-tool-inventory');
    if (btnInv) btnInv.addEventListener('click', () => store.toggleLayer('inventory'));

    const btnLabels = document.getElementById('btn-tool-labels');
    if (btnLabels) {
      btnLabels.addEventListener('click', () => {
        store.setState(s => { s.ui.labelsVisible = !s.ui.labelsVisible; });
      });
    }

    const btnInspect = document.getElementById('btn-tool-inspect');
    if (btnInspect) btnInspect.addEventListener('click', () => store.toggleTwinInspect());

    // 3D / 2D / Graph toggles in toolbar
    const btn3D = document.getElementById('btn-submode-3d');
    const btn2D = document.getElementById('btn-submode-2d');
    const btnGraph = document.getElementById('btn-submode-graph');
    if (btn3D) btn3D.addEventListener('click', () => store.setViewMode('3D'));
    if (btn2D) btn2D.addEventListener('click', () => store.setViewMode('2D'));
    if (btnGraph) btnGraph.addEventListener('click', () => store.setViewMode('GRAPH'));
  }

  update() {
    const state = store.getState();
    const activePage = state.ui.activePage || 'OVERVIEW';

    // If on pages other than OVERVIEW and DIGITAL_TWIN, hide the hero banner and KPI grid
    // to let the dedicated operational view shine
    const isTwinView = activePage === 'OVERVIEW' || activePage === 'DIGITAL_TWIN';
    const banner = document.getElementById('hero-banner');
    const grid = document.getElementById('kpi-grid');
    const toolbar = document.getElementById('digital-twin-toolbar');

    if (banner) banner.style.display = isTwinView ? 'block' : 'none';
    if (grid) grid.style.display = isTwinView ? 'grid' : 'none';
    if (toolbar) toolbar.style.display = isTwinView ? 'flex' : 'none';

    // If on DIGITAL_TWIN, reduce hero banner height to maximize map
    if (activePage === 'DIGITAL_TWIN' && banner) {
      banner.classList.add('compact');
    } else if (banner) {
      banner.classList.remove('compact');
    }
  }
}
