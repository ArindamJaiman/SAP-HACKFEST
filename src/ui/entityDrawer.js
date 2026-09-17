/**
 * SAP Resilient: Contextual Entity Inspector
 * 360° asset details, upstream dependencies, downstream risks, and node outage simulations
 */

import { store } from '../app/store.js';

export class EntityDrawer {
  constructor(containerId = 'right-drawer') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.renderEmpty();
    store.subscribe(() => this.update());
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="panel-header">
        <span>Asset Inspector</span>
        <button id="btn-close-drawer" style="font-size:12px; color:var(--color-neutral);">✕</button>
      </div>
      <div class="panel-content" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:var(--color-text-dim); padding:40px 20px;">
        <svg style="width:32px; height:32px; fill:var(--color-text-dim); margin-bottom:12px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        <div style="font-size:12px; font-weight:500; color:var(--color-neutral);">No Asset Selected</div>
        <div style="font-size:11px; margin-top:4px; color:var(--color-text-dim);">Select any port, vessel, facility, or distribution center to inspect live telemetry.</div>
      </div>
    `;
    this.initCloseBtn();
  }

  update() {
    const selected = store.getState().ui.selectedEntity;
    if (!selected) {
      this.renderEmpty();
      return;
    }

    const isDisrupted = selected.status === 'DISRUPTED' || selected.id === 'PORT-SIN';

    this.container.innerHTML = `
      <div class="panel-header">
        <span style="color:${isDisrupted ? 'var(--color-danger)' : 'var(--color-primary-light)'};">${selected.name}</span>
        <button id="btn-close-drawer" style="font-size:12px; color:var(--color-neutral);">✕</button>
      </div>

      <div class="panel-content">
        <!-- Status & Type Chip -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:rgba(30,41,59,0.4); border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
          <span style="font-family:var(--font-mono); font-size:11px; color:var(--color-neutral);">${selected.type} · ${selected.id}</span>
          <span class="brand-status-chip ${isDisrupted ? '' : 'live'}" style="${isDisrupted ? 'background:rgba(239,68,68,0.12); color:#fca5a5; border-color:rgba(239,68,68,0.3);' : ''}">
            ${selected.status || 'OPERATIONAL'}
          </span>
        </div>

        <!-- Telemetry Attributes Grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px;">
          ${this.renderAttributeCells(selected)}
        </div>

        <!-- Situational Diagnostic Analysis Box -->
        <div style="margin-top:10px; padding:10px 12px; background:rgba(30,41,59,0.35); border-left:3px solid ${isDisrupted ? 'var(--color-danger)' : 'var(--color-primary)'}; border-radius:var(--radius-sm);">
          <div style="font-size:10px; font-weight:600; color:var(--color-primary-light); margin-bottom:4px; text-transform:uppercase; letter-spacing:0.03em;">
            Situational Diagnostic
          </div>
          <div style="font-size:11.5px; line-height:1.45; color:var(--color-text-main);">
            ${this.generateAiAssessment(selected)}
          </div>
        </div>

        <!-- Downstream Dependency Cascade -->
        <div style="margin-top:10px;">
          <div style="font-size:10px; font-weight:600; color:var(--color-neutral); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.03em;">
            Downstream Dependencies
          </div>
          <div style="display:flex; flex-direction:column; gap:5px; font-size:11px;">
            <div style="padding:6px 8px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:var(--radius-xs); color:#fca5a5;">
              • 47 Inbound Delayed Shipments (ETA +4.8d)
            </div>
            <div style="padding:6px 8px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); border-radius:var(--radius-xs); color:#fcd34d;">
              • WH-17 Safety Stock Buffer Depletion in 41 Hours
            </div>
            <div style="padding:6px 8px; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.25); border-radius:var(--radius-xs); color:#93c5fd;">
              • Plant FAC-04 Production Curtailment (-22%)
            </div>
          </div>
        </div>

        <!-- Action Control Buttons -->
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:14px;">
          <button class="btn-tactical primary" id="btn-inspect-why" style="width:100%;">
            View Causal Analysis
          </button>
          <button class="btn-tactical danger" id="btn-whatif-knockout" style="width:100%;">
            Simulate Facility Outage (What-If)
          </button>
          <button class="btn-tactical success" id="btn-trigger-recovery" style="width:100%;">
            Generate Contingency Plan
          </button>
        </div>
      </div>
    `;

    this.initCloseBtn();
    this.initActionButtons(selected);
  }

  renderAttributeCells(entity) {
    if (entity.type === 'PORT') {
      return `
        <div class="kpi-item"><span class="kpi-label">Congestion</span><span class="kpi-value">${entity.berthUtilization}%</span></div>
        <div class="kpi-item"><span class="kpi-label">Vessel Queue</span><span class="kpi-value">${entity.vesselQueue} Ships</span></div>
        <div class="kpi-item"><span class="kpi-label">Throughput</span><span class="kpi-value">${entity.throughput}M TEU</span></div>
        <div class="kpi-item"><span class="kpi-label">Customs Delay</span><span class="kpi-value">+${entity.customsDelay} Days</span></div>
      `;
    } else if (entity.type === 'WAREHOUSE') {
      return `
        <div class="kpi-item"><span class="kpi-label">Days of Cover</span><span class="kpi-value">${entity.daysOfCover}d</span></div>
        <div class="kpi-item"><span class="kpi-label">Current Stock</span><span class="kpi-value">${entity.currentStock.toLocaleString()}</span></div>
        <div class="kpi-item"><span class="kpi-label">Safety Stock</span><span class="kpi-value">${entity.safetyStock.toLocaleString()}</span></div>
        <div class="kpi-item"><span class="kpi-label">Inventory Value</span><span class="kpi-value">$${Math.round(entity.inventoryValue/1000000)}M</span></div>
      `;
    } else if (entity.type === 'VESSEL') {
      return `
        <div class="kpi-item"><span class="kpi-label">Speed</span><span class="kpi-value">${entity.speedKnots} kts</span></div>
        <div class="kpi-item"><span class="kpi-label">Delay</span><span class="kpi-value" style="color:var(--color-danger);">+${entity.delayHours} hrs</span></div>
        <div class="kpi-item"><span class="kpi-label">Cargo TEU</span><span class="kpi-value">${entity.cargoTEU}</span></div>
        <div class="kpi-item"><span class="kpi-label">Destination</span><span class="kpi-value">${entity.destinationId}</span></div>
      `;
    } else {
      return `
        <div class="kpi-item"><span class="kpi-label">Capacity</span><span class="kpi-value">${entity.capacity || entity.productionCapacity || 5000}</span></div>
        <div class="kpi-item"><span class="kpi-label">Risk Index</span><span class="kpi-value">${entity.riskScore || 20}/100</span></div>
        <div class="kpi-item"><span class="kpi-label">Country</span><span class="kpi-value">${entity.country || 'Global'}</span></div>
        <div class="kpi-item"><span class="kpi-label">Reliability</span><span class="kpi-value">${entity.reliabilityScore || 94}%</span></div>
      `;
    }
  }

  generateAiAssessment(entity) {
    if (entity.id === 'PORT-SIN') {
      return 'Terminal handling suspended due to berth saturation. Force majeure declaration projected to cascade 4.8 days delay across 47 container vessels, triggering safety-stock depletion at WH-17 within 41 hours.';
    } else if (entity.id === 'WH-17') {
      return 'Inventory runway is down to 4.8 days of cover against minimum safety threshold of 7.0 days. Inbound replenishment vessel Ever Zenith held in Singapore anchorage.';
    } else {
      return `Telemetry within standard tolerance. Operating capacity at 88%. Redundant shipping lanes active with no immediate single-point-of-failure exposure.`;
    }
  }

  initCloseBtn() {
    const btn = document.getElementById('btn-close-drawer');
    if (btn) {
      btn.addEventListener('click', () => {
        store.setState(s => { s.ui.selectedEntity = null; });
      });
    }
  }

  initActionButtons(entity) {
    const btnWhy = document.getElementById('btn-inspect-why');
    if (btnWhy) {
      btnWhy.addEventListener('click', () => {
        alert(`ROOT-CAUSE & CASCADE ANALYSIS FOR ${entity.name}:\n\n` +
              `• Root Cause: Port of Singapore terminal congestion & crane power grid trip.\n` +
              `• Direct Effect: Inbound container carriers delayed by 4.8 days average.\n` +
              `• First-Order Impact: Raw material components stalled at anchorage.\n` +
              `• Second-Order Impact: Regional warehouse buffer WH-17 projected to breach safety threshold in 41h.\n` +
              `• Strategic Directive: Execute maritime deviation via Port Klang with bonded cross-dock trucking.`);
      });
    }

    const btnKnockout = document.getElementById('btn-whatif-knockout');
    if (btnKnockout) {
      btnKnockout.addEventListener('click', () => {
        const result = store.graph.simulateNodeKnockout(entity.id);
        alert(`FACILITY OUTAGE SIMULATION (WHAT-IF) FOR ${entity.name}:\n\n` +
              `• Inbound Connections Severed: ${result.severedInboundFlows}\n` +
              `• Outbound Corridors Severed: ${result.severedOutboundFlows}\n` +
              `• Downstream Facilities Affected: ${result.downstreamCascade.totalAffectedNodes}\n` +
              `• Top Alternative Redundant Hub: ${result.topAlternatives[0]?.candidateName || 'None'}\n` +
              `• Network Redundancy Grade: ${result.resilienceScore}`);
      });
    }

    const btnRec = document.getElementById('btn-trigger-recovery');
    if (btnRec) {
      btnRec.addEventListener('click', () => {
        window.__appOrchestrator?.triggerDisruptionWorkflow(store.getState().entities.disruptions[0]);
      });
    }
  }
}
