/**
 * SAP Resilient: Human-in-the-Loop Recommendation Cards (Section 14)
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
          <span class="rec-badge">AWAITING HUMAN APPROVAL · ${pending.approvalLevel}</span>
          <span style="font-family:var(--font-mono); font-size:10px; color:var(--color-cyan);">CONFIDENCE ${pending.confidence}%</span>
        </div>

        <div class="rec-action-title">${pending.actionTitle}</div>
        <div style="font-size:11px; color:var(--color-text-muted); line-height:1.35;">${pending.summary}</div>

        <!-- Trade-off Metrics Matrix -->
        <div class="rec-metrics-grid">
          <div class="rec-metric-cell">
            <span class="rec-metric-label">COST</span>
            <span class="rec-metric-val" style="color:var(--color-amber);">$${pending.incrementalCostUSD.toLocaleString()}</span>
          </div>
          <div class="rec-metric-cell">
            <span class="rec-metric-label">ETA IMPACT</span>
            <span class="rec-metric-val">${pending.etaImpact}</span>
          </div>
          <div class="rec-metric-cell">
            <span class="rec-metric-label">SERVICE LEVEL</span>
            <span class="rec-metric-val" style="color:var(--color-green);">${pending.serviceLevelImpact}</span>
          </div>
          <div class="rec-metric-cell">
            <span class="rec-metric-label">INVENTORY RISK</span>
            <span class="rec-metric-val" style="color:var(--color-cyan); font-size:10px;">AVERTED</span>
          </div>
          <div class="rec-metric-cell">
            <span class="rec-metric-label">CARBON DELTA</span>
            <span class="rec-metric-val">+${pending.carbonImpactKg} kg</span>
          </div>
          <div class="rec-metric-cell">
            <span class="rec-metric-label">REVERSIBILITY</span>
            <span class="rec-metric-val" style="font-size:10px;">6H WINDOW</span>
          </div>
        </div>

        <!-- Reasoning & Assumptions Preview -->
        <div style="padding:6px 8px; background:rgba(18,28,42,0.4); border-left:2px solid var(--color-purple); border-radius:var(--radius-xs); font-size:10px; line-height:1.4;">
          <strong style="color:var(--color-white);">CORE RATIONALE:</strong> ${pending.why}
        </div>

        <!-- Interactive Governance Buttons -->
        <div class="rec-action-buttons">
          <button class="btn-tactical green" id="btn-approve-rec" style="flex:1;">
            APPROVE & EXECUTE
          </button>
          <button class="btn-tactical red" id="btn-reject-rec">
            REJECT
          </button>
          <button class="btn-tactical cyan" id="btn-why-rec">
            WHY?
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
        governor.rejectAction(pending, 'Rejected by human operator in command tower');
      });
    }

    const btnWhy = document.getElementById('btn-why-rec');
    if (btnWhy) {
      btnWhy.addEventListener('click', () => {
        alert(`EXPLAINABLE AI REASONING FOR RECOMMENDATION:\n\n` +
              `• OBSERVATION: Port of Singapore force majeure handling halt.\n` +
              `• IMPACT: 47 inbound shipments delayed by 4.8 days; WH-17 safety-stock breach in 41h.\n` +
              `• OPTIONS CONSIDERED: Port Klang Reroute (Top Score 88), Air Freight ($640k), Baseline Demurrage ($2.4M loss).\n` +
              `• RECOMMENDED ACTION: Reroute 24 container ships to Port Klang and Colombo with bonded road shuttle.\n` +
              `• PROJECTED BENEFIT: Avoid 4.1 days delay; service level protected from 91.2% up to 98.1%.\n` +
              `• CONFIDENCE: 88% based on verified berth allocations and transit corridor green light.`);
      });
    }
  }
}
