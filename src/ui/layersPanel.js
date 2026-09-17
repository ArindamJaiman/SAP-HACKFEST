/**
 * SAP Resilient: Operational Layers Panel
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
      { key: 'ports', label: 'Ports & Maritime Terminals', color: '#38bdf8', count: `${entities.ports.length}` },
      { key: 'factories', label: 'Manufacturing Facilities', color: '#f97316', count: `${entities.factories.length}` },
      { key: 'suppliers', label: 'Tier-1/2 Suppliers', color: '#f59e0b', count: `${entities.suppliers.length}` },
      { key: 'warehouses', label: 'Fulfillment Centers', color: '#3b82f6', count: `${entities.warehouses.length}` },
      { key: 'vessels', label: 'Commercial Fleet', color: '#f8fafc', count: `${entities.vessels.length}` },
      { key: 'shipments', label: 'In-Transit Shipments', color: '#10b981', count: `${entities.shipments.length}` },
      { key: 'demand', label: 'Regional Demand Markets', color: '#8b5cf6', count: `${entities.demandCenters.length}` },
      { key: 'network', label: 'Intermodal Shipping Lanes', color: '#64748b', count: `${entities.routes.length}` },
      { key: 'disruptions', label: 'Active Disruptions', color: '#ef4444', count: `${entities.disruptions.length}` },
      { key: 'aiRoutes', label: 'Contingency Corridors', color: '#10b981', count: '4' }
    ];

    this.container.innerHTML = `
      <div class="panel-header">
        <span>Operational Layers</span>
        <button id="btn-collapse-left" style="font-size:12px; color:var(--color-neutral); cursor:pointer;">◀</button>
      </div>
      <div class="panel-content">
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

        <!-- Scenario Simulation Control Block -->
        <div style="margin-top:14px; padding:12px; background:rgba(30,41,59,0.4); border:1px solid var(--border-subtle); border-radius:var(--radius-sm);">
          <div style="font-size:11px; font-weight:600; color:var(--color-primary-light); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.03em;">
            Scenario Simulator
          </div>
          <select id="select-active-scenario" style="width:100%; font-size:11px; margin-bottom:10px;">
            <option value="SCENARIO-01">Singapore Port Closure (5-Day Halt)</option>
            <option value="SCENARIO-02">Suez Canal Transit Restriction</option>
            <option value="SCENARIO-03">Hsinchu Semiconductor Fab Outage</option>
            <option value="SCENARIO-04">15% European Demand Surge</option>
            <option value="SCENARIO-05">Bay of Bengal Cyclone Rerouting</option>
          </select>
          <button class="btn-tactical primary" id="btn-trigger-scenario" style="width:100%; padding:8px 12px; font-weight:600;">
            Simulate Disruption
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
