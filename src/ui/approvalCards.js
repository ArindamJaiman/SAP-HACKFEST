/**
 * SAP Resilient: Human-in-the-Loop Contingency Directives (Section 14)
 * Actionable decision cards with full reasoning inputs, trade-offs, and governance buttons
 */

import { store } from '../app/store.js';
import { governor } from '../agents/governor.js';

export class ApprovalCardsManager {
  constructor(containerId = 'approval-cards-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    store.subscribe(() => this.update());
  }

  update() {
    const pending = store.getState().governance.pendingApproval;
    if (!pending) {
      this.container.innerHTML = '';
      return;
    }

    this.container.innerHTML = `
      <div class="recommendation-card">
        <div class="rec-header-row">
          <span class="rec-badge">Awaiting Authorization · ${pending.approvalLevel.replace('_', ' ')}</span>
          <span style="font-family:var(--font-mono); font-size:10px; color:var(--color-neutral);">Confidence: ${pending.confidence}%</span>
        </div>

        <div class="rec-action-title">${pending.actionTitle}</div>
        <div style="font-size:11.5px; color:var(--color-neutral); line-height:1.4;">${pending.summary}</div>

        <!-- Trade-off Metrics Matrix -->
        <div class="rec-metrics-grid">
          <div class="rec-metric-cell">
            <span class="rec-metric-label">Estimated Cost</span>
            <span class="rec-metric-val" style="color:var(--color-warning);">$${pending.incrementalCostUSD.toLocaleString()}</span>
          </div>
          <div class="rec-metric-cell">
            <span class="rec-metric-label">ETA Variance</span>
            <span class="rec-metric-val">${pending.etaImpact}</span>
          </div>
          <div class="rec-metric-cell">
            <span class="rec-metric-label">Service Level</span>
            <span class="rec-metric-val" style="color:var(--color-success);">${pending.serviceLevelImpact}</span>
          </div>
          <div class="rec-metric-cell">
            <span class="rec-metric-label">Inventory Risk</span>
            <span class="rec-metric-val" style="color:var(--color-primary-light); font-size:10px;">Buffer Protected</span>
          </div>
          <div class="rec-metric-cell">
            <span class="rec-metric-label">CO2 Delta</span>
            <span class="rec-metric-val">+${pending.carbonImpactKg.toLocaleString()} kg</span>
          </div>
          <div class="rec-metric-cell">
            <span class="rec-metric-label">Reversibility</span>
            <span class="rec-metric-val" style="font-size:10px;">6h Window</span>
          </div>
        </div>

        <!-- Reasoning & Assumptions Preview -->
        <div style="padding:8px 10px; background:rgba(30,41,59,0.35); border-left:3px solid var(--color-primary); border-radius:var(--radius-xs); font-size:11px; line-height:1.4;">
          <strong style="color:var(--color-text-main);">Operational Rationale:</strong> ${pending.why}
        </div>

        <!-- Interactive Governance Buttons -->
        <div class="rec-action-buttons">
          <button class="btn-tactical success" id="btn-approve-rec" style="flex:1;">
            Approve & Execute
          </button>
          <button class="btn-tactical danger" id="btn-reject-rec">
            Reject
          </button>
          <button class="btn-tactical primary" id="btn-why-rec">
            Rationale
          </button>
        </div>
      </div>
    `;

    this.initCardEvents(pending);
  }

  initCardEvents(pending) {
    const btnApprove = document.getElementById('btn-approve-rec');
    if (btnApprove) {
      btnApprove.addEventListener('click', () => {
        governor.executeApprovedAction(pending, 'OPERATIONS_MANAGER', `APPROVAL-EVT-${Date.now()}`);
      });
    }

    const btnReject = document.getElementById('btn-reject-rec');
    if (btnReject) {
      btnReject.addEventListener('click', () => {
        governor.rejectAction(pending, 'Rejected by operations manager');
      });
    }

    const btnWhy = document.getElementById('btn-why-rec');
    if (btnWhy) {
      btnWhy.addEventListener('click', () => {
        alert(`DECISION SUPPORT RATIONALE:\n\n` +
              `• Observation: Port of Singapore force majeure terminal halt.\n` +
              `• Impact: 47 inbound shipments delayed by 4.8 days; WH-17 safety-stock breach in 41h.\n` +
              `• Trade-off Analysis: Port Klang Reroute (Top Score 88), Air Freight ($640k), Baseline Demurrage ($2.4M loss).\n` +
              `• Recommended Action: Reroute 24 container carriers to Port Klang and Colombo with bonded road shuttle.\n` +
              `• Projected Outcome: Avoid 4.1 days delay; service level protected from 91.2% up to 98.1%.\n` +
              `• Confidence: 88% based on verified berth allocations and transit corridor green light.`);
      });
    }
  }
}
