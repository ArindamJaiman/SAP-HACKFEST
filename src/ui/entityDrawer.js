/**
 * SAP Resilient: Contextual Entity Inspector (Section 34)
 * 360° asset details, upstream dependencies, downstream risks, and What-If Knockout actions
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
        <span>ASSET INSPECTOR</span>
        <button id="btn-close-drawer" style="font-size:12px; color:var(--color-text-muted);">✕</button>
      </div>
      <div class="panel-content" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:var(--color-text-dim); padding:40px 20px;">
        <svg style="width:36px; height:36px; fill:var(--color-text-dim); margin-bottom:12px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase;">No Asset Selected</div>
        <div style="font-size:11px; margin-top:4px;">Click any port, vessel, plant, or warehouse to inspect live telemetry.</div>
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
        <span style="color:${isDisrupted ? 'var(--color-red)' : 'var(--color-cyan)'};">${selected.name}</span>
        <button id="btn-close-drawer" style="font-size:12px; color:var(--color-text-muted);">✕</button>
      </div>

      <div class="panel-content">
        <!-- Status & Type Chip -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:rgba(6,12,20,0.6); border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
          <span style="font-family:var(--font-mono); font-size:11px; color:var(--color-text-muted);">${selected.type} · ${selected.id}</span>
          <span class="brand-status-chip ${isDisrupted ? '' : 'live'}" style="${isDisrupted ? 'background:rgba(255,42,75,0.2); color:var(--color-red); border-color:var(--color-red);' : ''}">
            ${selected.status || 'OPERATIONAL'}
          </span>
        </div>

        <!-- Telemetry Attributes Grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px;">
          ${this.renderAttributeCells(selected)}
        </div>

        <!-- AI Causal Analysis Box -->
        <div style="margin-top:10px; padding:10px; background:rgba(18,28,42,0.6); border-left:3px solid ${isDisrupted ? 'var(--color-red)' : 'var(--color-cyan)'}; border-radius:var(--radius-sm);">
          <div style="font-family:var(--font-mono); font-size:10px; font-weight:700; color:var(--color-cyan); margin-bottom:4px; text-transform:uppercase;">
            AI AGENT ASSESSMENT
          </div>
          <div style="font-size:11px; line-height:1.4; color:var(--color-white);">
            ${this.generateAiAssessment(selected)}
          </div>
        </div>

        <!-- Downstream Dependency Chain -->
        <div style="margin-top:10px;">
          <div style="font-family:var(--font-mono); font-size:10px; font-weight:700; color:var(--color-text-muted); margin-bottom:6px; text-transform:uppercase;">
            CONNECTED ASSETS IN CASCADE
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; font-family:var(--font-mono); font-size:10px;">
            <div style="padding:4px 8px; background:rgba(255,42,75,0.15); border:1px solid rgba(255,42,75,0.3); border-radius:var(--radius-xs); color:var(--color-red);">
              ➔ 47 Inbound Delayed Shipments (Vessel ETA +4.8d)
            </div>
            <div style="padding:4px 8px; background:rgba(255,102,0,0.15); border:1px solid rgba(255,102,0,0.3); border-radius:var(--radius-xs); color:var(--color-orange);">
              ➔ WH-17 Safety Stock Depletion in 41 Hours
            </div>
            <div style="padding:4px 8px; background:rgba(45,125,255,0.15); border:1px solid rgba(45,125,255,0.3); border-radius:var(--radius-xs); color:var(--color-blue);">
              ➔ Assembly Plant FAC-04 Production Curtailment (-22%)
            </div>
          </div>
        </div>

        <!-- Action Control Buttons -->
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:14px;">
          <button class="btn-tactical cyan" id="btn-inspect-why" style="width:100%;">
            VIEW "WHY?" CAUSAL TREE
          </button>
          <button class="btn-tactical red" id="btn-whatif-knockout" style="width:100%;">
            WHAT-IF: SIMULATE NODE KNOCKOUT
          </button>
          <button class="btn-tactical green" id="btn-trigger-recovery" style="width:100%;">
            GENERATE RECOVERY PLAN
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
        <div class="kpi-item"><span class="kpi-label">CONGESTION</span><span class="kpi-value">${entity.berthUtilization}%</span></div>
        <div class="kpi-item"><span class="kpi-label">VESSEL QUEUE</span><span class="kpi-value">${entity.vesselQueue} Ships</span></div>
        <div class="kpi-item"><span class="kpi-label">THROUGHPUT</span><span class="kpi-value">${entity.throughput}M TEU</span></div>
        <div class="kpi-item"><span class="kpi-label">CUSTOMS DELAY</span><span class="kpi-value">+${entity.customsDelay} Days</span></div>
      `;
    } else if (entity.type === 'WAREHOUSE') {
      return `
        <div class="kpi-item"><span class="kpi-label">DAYS OF COVER</span><span class="kpi-value">${entity.daysOfCover}d</span></div>
        <div class="kpi-item"><span class="kpi-label">CURRENT STOCK</span><span class="kpi-value">${entity.currentStock.toLocaleString()}</span></div>
        <div class="kpi-item"><span class="kpi-label">SAFETY STOCK</span><span class="kpi-value">${entity.safetyStock.toLocaleString()}</span></div>
        <div class="kpi-item"><span class="kpi-label">INV VALUE</span><span class="kpi-value">$${Math.round(entity.inventoryValue/1000000)}M</span></div>
      `;
    } else if (entity.type === 'VESSEL') {
      return `
        <div class="kpi-item"><span class="kpi-label">SPEED</span><span class="kpi-value">${entity.speedKnots} kts</span></div>
        <div class="kpi-item"><span class="kpi-label">DELAY</span><span class="kpi-value" style="color:var(--color-red);">+${entity.delayHours} hrs</span></div>
        <div class="kpi-item"><span class="kpi-label">CARGO</span><span class="kpi-value">${entity.cargoTEU} TEU</span></div>
        <div class="kpi-item"><span class="kpi-label">DESTINATION</span><span class="kpi-value">${entity.destinationId}</span></div>
      `;
    } else {
      return `
        <div class="kpi-item"><span class="kpi-label">CAPACITY</span><span class="kpi-value">${entity.capacity || entity.productionCapacity || 5000}</span></div>
        <div class="kpi-item"><span class="kpi-label">RISK SCORE</span><span class="kpi-value">${entity.riskScore || 20}/100</span></div>
        <div class="kpi-item"><span class="kpi-label">COUNTRY</span><span class="kpi-value">${entity.country || 'Global'}</span></div>
        <div class="kpi-item"><span class="kpi-label">RELIABILITY</span><span class="kpi-value">${entity.reliabilityScore || 94}%</span></div>
      `;
    }
  }

  generateAiAssessment(entity) {
    if (entity.id === 'PORT-SIN') {
      return 'Terminal handling paused due to berth saturation. Force majeure projected to cascade 4.8 days delay across 47 shipments, triggering critical safety-stock breaches at WH-17 within 41 hours.';
    } else if (entity.id === 'WH-17') {
      return 'Inventory runway is down to 4.8 days of cover against minimum safety threshold of 7 days. Inbound replenishment vessel Ever Zenith delayed at Singapore.';
    } else {
      return `Telemetry healthy. Operational capacity at 88%. Redundant shipping lanes active with no immediate single-point-of-failure vulnerabilities.`;
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
        window.__appGovernance?.showWhyExplanation(entity);
      });
    }

    const btnKnockout = document.getElementById('btn-whatif-knockout');
    if (btnKnockout) {
      btnKnockout.addEventListener('click', () => {
        const result = store.graph.simulateNodeKnockout(entity.id);
        alert(`WHAT-IF KNOCKOUT ANALYSIS FOR ${entity.name}:\n\n` +
              `• Severed Inbound Connections: ${result.severedInboundFlows}\n` +
              `• Severed Outbound Flows: ${result.severedOutboundFlows}\n` +
              `• Downstream Affected Nodes: ${result.downstreamCascade.totalAffectedNodes}\n` +
              `• Top Alternative Hub: ${result.topAlternatives[0]?.candidateName || 'None'}\n` +
              `• Redundancy Rating: ${result.resilienceScore}`);
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
