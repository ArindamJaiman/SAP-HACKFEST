/**
 * SAP Resilient: Operational Layers Panel (Section 33)
 */

import { store } from '../app/store.js';

export class LayersPanel {
  constructor(containerId = 'left-panel') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  }

  render() {
    const { entities, layers } = store.getState();

    const layerDefinitions = [
      { key: 'ports', label: 'Ports & Maritime Hubs', color: '#00f0ff', count: `${entities.ports.length} (1 Disrupted)` },
      { key: 'factories', label: 'Manufacturing Plants', color: '#ff6600', count: `${entities.factories.length} Active` },
      { key: 'suppliers', label: 'Tier-1/2 Suppliers', color: '#ffaa00', count: `${entities.suppliers.length} Nodes` },
      { key: 'warehouses', label: 'Fulfillment Hubs', color: '#2d7dff', count: `${entities.warehouses.length} Hubs` },
      { key: 'vessels', label: 'Commercial Fleet', color: '#ffffff', count: `${entities.vessels.length} (47 Delayed)` },
      { key: 'shipments', label: 'Active Shipments', color: '#00e676', count: `${entities.shipments.length} POs` },
      { key: 'demand', label: 'Demand Markets', color: '#b34eff', count: `${entities.demandCenters.length} Regions` },
      { key: 'network', label: 'Intermodal Routes', color: '#44566c', count: `${entities.routes.length} Lanes` },
      { key: 'disruptions', label: 'Active Disruptions', color: '#ff2a4b', count: `${entities.disruptions.length} Epics` },
      { key: 'aiRoutes', label: 'AI Proposed Reroutes', color: '#00e676', count: '4 Active' }
    ];

    this.container.innerHTML = `
      <div class="panel-header">
        <span>OPERATIONAL LAYERS</span>
        <button id="btn-collapse-left" style="font-size:12px; color:var(--color-text-muted);">◀</button>
      </div>
      <div class="panel-content">
        ${layerDefinitions.map(def => `
          <div class="layer-card" data-layer="${def.key}">
            <div class="layer-info">
              <span class="layer-indicator" style="background:${def.color}; box-shadow:0 0 6px ${def.color};"></span>
              <span class="layer-title">${def.label}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="layer-badge">${def.count}</span>
              <input type="checkbox" ${layers[def.key] ? 'checked' : ''} style="cursor:pointer;" />
            </div>
          </div>
        `).join('')}

        <div style="margin-top:12px; padding:10px; background:rgba(6,12,20,0.6); border:1px solid var(--border-subtle); border-radius:var(--radius-sm);">
          <div style="font-family:var(--font-mono); font-size:10px; font-weight:700; color:var(--color-cyan); margin-bottom:6px; text-transform:uppercase;">
            SCENARIO WORKSPACE
          </div>
          <select id="select-active-scenario" style="width:100%; font-size:11px; margin-bottom:8px;">
            <option value="SCENARIO-01">Singapore Port Closure (5-Day Halt)</option>
            <option value="SCENARIO-02">Suez Canal Sandstorm Disruption</option>
            <option value="SCENARIO-03">Hsinchu Semiconductor Fab Outage</option>
            <option value="SCENARIO-04">15% European Demand Surge</option>
            <option value="SCENARIO-05">Bay of Bengal Cyclone Rerouting</option>
          </select>
          <button class="btn-tactical cyan" id="btn-trigger-scenario" style="width:100%;">
            SIMULATE SCENARIO
          </button>
        </div>
      </div>
    `;

    this.initEvents();
  }

  initEvents() {
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

    const triggerBtn = document.getElementById('btn-trigger-scenario');
    triggerBtn.addEventListener('click', () => {
      const select = document.getElementById('select-active-scenario');
      const scenarioId = select.value;
      const { disruptions } = store.getState().entities;
      const disr = disruptions[0]; // Singapore
      window.__appOrchestrator?.triggerDisruptionWorkflow(disr);
    });
  }
}
