/**
 * SAP Resilient: Dedicated Operational Page Views (Sections 25-35, 57-59, 73)
 * Provides high-density, interactive enterprise workspaces for:
 * - AI Agents Console & Explainability
 * - What-If Simulation Workbench
 * - Disruptions & Incident Center
 * - Inventory Control Tower
 * - Supplier Intelligence
 * - Logistics Control Tower
 * - Audit Trail & Governance Log
 * - Compliance & Sustainability
 * - Data Sources & SAP Adapters
 */

import { store } from '../app/store.js';
import { eventBus } from '../app/events.js';
import { scenarioService, executionService } from '../services/supplyChainService.js';
import { sapAdapters } from '../services/sapAdapters.js';

export class PageViewsManager {
  constructor(containerId = 'operational-views-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      document.getElementById('center-viewport')?.appendChild(this.container);
    }

    // What-If local simulation state
    this.whatIfParams = {
      supplierDelayDays: 5,
      demandMultiplier: 1.15,
      expediteBudgetUSD: 150000,
      safetyStockBufferDays: 7,
      leadTimeVariance: 3
    };

    this.render();
    store.subscribe(() => this.update());
  }

  render() {
    const state = store.getState();
    const activePage = state.ui.activePage || 'OVERVIEW';

    // If on OVERVIEW or DIGITAL_TWIN, operational views container is hidden
    if (activePage === 'OVERVIEW' || activePage === 'DIGITAL_TWIN') {
      this.container.style.display = 'none';
      this.container.innerHTML = '';
      return;
    }

    this.container.style.display = 'block';

    switch (activePage) {
      case 'AGENTS':
        this.renderAgentsConsole(state);
        break;
      case 'WHAT_IF':
      case 'SCENARIOS':
        this.renderWhatIfWorkbench(state);
        break;
      case 'DISRUPTIONS':
      case 'LIVE_OPS':
        this.renderIncidentCenter(state);
        break;
      case 'INVENTORY':
        this.renderInventoryTower(state);
        break;
      case 'SUPPLIERS':
        this.renderSupplierIntelligence(state);
        break;
      case 'LOGISTICS':
        this.renderLogisticsTower(state);
        break;
      case 'APPROVALS':
        this.renderApprovalsView(state);
        break;
      case 'AUDIT':
        this.renderAuditTrail(state);
        break;
      case 'RISK':
      case 'COMPLIANCE':
      case 'SUSTAINABILITY':
        this.renderRiskComplianceView(state, activePage);
        break;
      case 'DATA_SOURCES':
      case 'HEALTH':
      case 'SETTINGS':
        this.renderSystemView(state);
        break;
      default:
        this.renderIncidentCenter(state);
    }

    this.bindEvents(activePage);
  }

  renderAgentsConsole(state) {
    const agents = [
      { id: 'AG-01', name: 'CONTROL TOWER ORCHESTRATOR', role: 'Autonomous Multi-Agent Synthesis', status: 'DELEGATING', confidence: 97.4, latency: '34ms', lastAction: 'Synthesized 3 contingency plans' },
      { id: 'AG-02', name: 'SENTINEL / RISK AGENT', role: 'Real-time Disruption Sensing & MetOcean', status: 'ANALYZING', confidence: 96.2, latency: '21ms', lastAction: 'Monitored AIS dwell time at Port of Singapore' },
      { id: 'AG-03', name: 'LOGISTICS & REROUTE AGENT', role: 'Multi-Modal Route Optimization', status: 'SIMULATING', confidence: 94.8, latency: '42ms', lastAction: 'Evaluated Port Klang maritime diversion' },
      { id: 'AG-04', name: 'INVENTORY & EWM AGENT', role: 'Safety Stock Runway & Rebalancing', status: 'EXECUTING', confidence: 95.1, latency: '28ms', lastAction: 'Reserved 2,400 TEU buffer stock at WH-17' },
      { id: 'AG-05', name: 'PROCUREMENT AGENT', role: 'Dual-Source Supplier Expediting', status: 'IDLE', confidence: 98.0, latency: '19ms', lastAction: 'Validated Tier-2 supplier lead time' },
      { id: 'AG-06', name: 'PRODUCTION AGENT', role: 'Factory Floor Line Balancing', status: 'ANALYZING', confidence: 93.6, latency: '38ms', lastAction: 'Scheduled battery pack shift at Gigafactory 4' },
      { id: 'AG-07', name: 'SUSTAINABILITY & ESG AGENT', role: 'Scope-3 Carbon Tracking & Tradeoffs', status: 'COMPLETED', confidence: 98.7, latency: '16ms', lastAction: 'Computed +8.3% CO2 penalty for air expedite' },
      { id: 'AG-08', name: 'COMPLIANCE AGENT', role: 'Customs & Cabotage Verification', status: 'COMPLETED', confidence: 99.5, latency: '12ms', lastAction: 'Verified ASEAN trade tariff compliance' },
      { id: 'AG-09', name: 'GOVERNOR / APPROVAL AGENT', role: 'Human-in-the-Loop Policy Enforcement', status: 'WAITING_APPROVAL', confidence: 99.0, latency: '14ms', lastAction: 'Awaiting human signoff for $142k reroute' }
    ];

    this.container.innerHTML = `
      <div class="operational-view-panel">
        <div class="op-panel-header">
          <div>
            <h2 class="op-panel-title">AI AGENT ORCHESTRATION CONSOLE</h2>
            <p class="op-panel-sub">9 Specialized agents collaborating continuously under governed human-in-the-loop policies.</p>
          </div>
          <button class="btn-tactical outline" id="btn-return-twin">View in 3D Twin ➔</button>
        </div>

        <!-- Section 28: Agent Activity Pipeline -->
        <div class="agent-pipeline-container">
          <div class="pipeline-title">Autonomous Deliberation & Resolution Pipeline</div>
          <div class="pipeline-steps">
            <div class="pipeline-step completed">
              <span class="step-num">1</span>
              <span class="step-name">Sentinel Detects</span>
            </div>
            <div class="pipeline-arrow">➔</div>
            <div class="pipeline-step completed">
              <span class="step-num">2</span>
              <span class="step-name">Risk Analyzes</span>
            </div>
            <div class="pipeline-arrow">➔</div>
            <div class="pipeline-step completed">
              <span class="step-num">3</span>
              <span class="step-name">Logistics Solves</span>
            </div>
            <div class="pipeline-arrow">➔</div>
            <div class="pipeline-step active">
              <span class="step-num">4</span>
              <span class="step-name">What-If Simulates</span>
            </div>
            <div class="pipeline-arrow">➔</div>
            <div class="pipeline-step ${state.simulation.recoveryStatus === 'IN_RECOVERY' ? 'completed' : 'pending'}">
              <span class="step-num">5</span>
              <span class="step-name">Human Approves</span>
            </div>
            <div class="pipeline-arrow">➔</div>
            <div class="pipeline-step ${state.simulation.recoveryStatus === 'IN_RECOVERY' ? 'completed' : ''}">
              <span class="step-num">6</span>
              <span class="step-name">SAP Executes</span>
            </div>
          </div>
        </div>

        <!-- Section 29: Agent Explainability Rationale Card -->
        <div class="explainability-card">
          <div class="explain-header">
            <span class="explain-badge">AI DECISION RATIONALE</span>
            <span class="explain-conf">Confidence: 94.8% · Deterministic Graph Evidence</span>
          </div>
          <div class="explain-body">
            <div class="explain-item">
              <strong>Problem Detected:</strong> 5-day handling stoppage at Port of Singapore (PORT-SIN) with 43 vessels in queue.
            </div>
            <div class="explain-item">
              <strong>Impact Propagation:</strong> 47 inbound shipments delayed > 24 hours; WH-17 inventory runway drops to 4.8 days; Gigafactory assembly shutdown predicted in 72 hours.
            </div>
            <div class="explain-item">
              <strong>Tradeoff Analysis:</strong> Port Klang (PORT-KLG) diversion adds only 14 transit hours and $142,000 cost, while preventing a $142,000,000 revenue write-off. Air freight was evaluated but added +182% carbon emissions and $640k cost.
            </div>
            <div class="explain-item">
              <strong>Recommended Action:</strong> Divert convoy of 47 vessels to Port Klang with pre-cleared automated feeder transit to WH-17.
            </div>
          </div>
        </div>

        <!-- Agents Roster Grid -->
        <div class="agents-roster-grid">
          ${agents.map(ag => `
            <div class="agent-roster-card">
              <div class="agent-card-top">
                <span class="agent-id">${ag.id}</span>
                <span class="agent-status-tag ${ag.status.toLowerCase()}">${ag.status}</span>
              </div>
              <div class="agent-name">${ag.name}</div>
              <div class="agent-role">${ag.role}</div>
              <div class="agent-meta-row">
                <span>Confidence: <strong>${ag.confidence}%</strong></span>
                <span>Latency: <strong>${ag.latency}</strong></span>
              </div>
              <div class="agent-last-action">
                <span class="action-icon">↳</span> ${ag.lastAction}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderWhatIfWorkbench(state) {
    const isRecovery = state.simulation.recoveryStatus === 'IN_RECOVERY';
    const delay = this.whatIfParams.supplierDelayDays;
    const demand = this.whatIfParams.demandMultiplier;
    const budget = this.whatIfParams.expediteBudgetUSD;

    // Deterministic simulation modeling
    const baseOtif = Math.max(78, Math.min(98, (94.2 - delay * 1.8 + (demand - 1) * -8))).toFixed(1);
    const planAOtif = '96.4';
    const planBOtif = '94.8';

    const baseCost = '$1.20M';
    const planACost = `$${(1.2 + budget / 1000000 * 1.8).toFixed(2)}M`;
    const planBCost = `$${(1.2 + budget / 1000000 * 0.9).toFixed(2)}M`;

    this.container.innerHTML = `
      <div class="operational-view-panel">
        <div class="op-panel-header">
          <div>
            <h2 class="op-panel-title">WHAT-IF SCENARIO WORKBENCH (Section 25 & 26)</h2>
            <p class="op-panel-sub">Simulate operational disruptions, tune resilience parameters, and evaluate trade-offs before governed execution.</p>
          </div>
          <button class="btn-tactical primary" id="btn-run-whatif-sim">Run Simulation ⚡</button>
        </div>

        <div class="whatif-split-layout">
          <!-- LEFT: Scenario Tuning Controls -->
          <div class="whatif-controls-card">
            <h3 class="card-section-title">Disruption Parameters</h3>

            <div class="slider-control-group">
              <div class="slider-header">
                <span>Supplier Delay Impact:</span>
                <strong id="val-supplier-delay">+${delay} Days</strong>
              </div>
              <input type="range" id="input-supplier-delay" min="1" max="21" value="${delay}" />
            </div>

            <div class="slider-control-group">
              <div class="slider-header">
                <span>Demand Surge Multiplier:</span>
                <strong id="val-demand-mult">${Math.round((demand - 1) * 100)}% Surge</strong>
              </div>
              <input type="range" id="input-demand-mult" min="100" max="150" value="${Math.round(demand * 100)}" />
            </div>

            <div class="slider-control-group">
              <div class="slider-header">
                <span>Contingency Expedite Budget:</span>
                <strong id="val-expedite-budget">$${Math.round(budget / 1000)}k</strong>
              </div>
              <input type="range" id="input-expedite-budget" min="20000" max="500000" step="10000" value="${budget}" />
            </div>

            <div class="slider-control-group">
              <div class="slider-header">
                <span>Safety Stock Minimum Runway:</span>
                <strong id="val-safety-stock">${this.whatIfParams.safetyStockBufferDays} Days</strong>
              </div>
              <input type="range" id="input-safety-stock" min="2" max="20" value="${this.whatIfParams.safetyStockBufferDays}" />
            </div>

            <div style="margin-top:16px;">
              <h4 style="font-size:11px; text-transform:uppercase; color:var(--color-neutral); margin-bottom:8px;">Flagship Scenario Presets</h4>
              <div class="preset-buttons-row">
                <button class="btn-tactical outline-subtle active" id="preset-port-sin">Singapore Congestion</button>
                <button class="btn-tactical outline-subtle" id="preset-suez">Suez Blockage</button>
                <button class="btn-tactical outline-subtle" id="preset-semi">Hsinchu Fab Trip</button>
              </div>
            </div>
          </div>

          <!-- RIGHT: Multi-Scenario Tradeoff Comparison Table -->
          <div class="whatif-results-card">
            <h3 class="card-section-title">Comparative Strategy Evaluation</h3>
            <div class="comparison-table-wrapper">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    <th>BASELINE (No Action)</th>
                    <th>PLAN A (Air Expedite)</th>
                    <th class="recommended-col">PLAN B (Port Klang Reroute) ★</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Projected OTIF</td>
                    <td class="bad-text">${baseOtif}%</td>
                    <td class="good-text">${planAOtif}%</td>
                    <td class="good-text font-bold">${planBOtif}%</td>
                  </tr>
                  <tr>
                    <td>Recovery Time</td>
                    <td class="bad-text">9.4 Days</td>
                    <td class="good-text">3.8 Days</td>
                    <td class="good-text font-bold">5.1 Days</td>
                  </tr>
                  <tr>
                    <td>Operational Cost</td>
                    <td>${baseCost}</td>
                    <td class="bad-text">${planACost}</td>
                    <td class="font-bold">${planBCost}</td>
                  </tr>
                  <tr>
                    <td>Revenue Exposure</td>
                    <td class="bad-text">$142,000,000</td>
                    <td class="good-text">$12,400,000</td>
                    <td class="good-text font-bold">$18,200,000</td>
                  </tr>
                  <tr>
                    <td>Scope-3 Carbon (CO2)</td>
                    <td>840t</td>
                    <td class="bad-text">1,420t (+69%)</td>
                    <td class="good-text font-bold">780t (-7.1%)</td>
                  </tr>
                  <tr>
                    <td>Resilience Index</td>
                    <td>64 / 100</td>
                    <td>82 / 100</td>
                    <td class="good-text font-bold">89 / 100</td>
                  </tr>
                  <tr>
                    <td>Recommendation</td>
                    <td>Unacceptable Exposure</td>
                    <td>Costly & High Emissions</td>
                    <td class="recommended-cell">
                      <button class="btn-tactical primary" id="btn-select-plan-b">
                        ${isRecovery ? 'Plan B Dispatched ✓' : 'Select Plan B ➔'}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="tradeoff-summary-box">
              <strong>Tradeoff Rationale:</strong> Plan B achieves 94.8% OTIF within 5.1 days at 42% lower cost than Plan A, while reducing overall carbon emissions by utilizing sea-feeder links via Port Klang.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderIncidentCenter(state) {
    const { disruptions } = state.entities;
    const isRecovery = state.simulation.recoveryStatus === 'IN_RECOVERY';

    this.container.innerHTML = `
      <div class="operational-view-panel">
        <div class="op-panel-header">
          <div>
            <h2 class="op-panel-title">DISRUPTIONS & INCIDENT MANAGEMENT (Section 31)</h2>
            <p class="op-panel-sub">Real-time incident response telemetry, causal dependency propagation, and resolution lifecycle.</p>
          </div>
          <button class="btn-tactical outline" id="btn-return-twin">Focus in 3D Twin ➔</button>
        </div>

        <div class="incident-layout-grid">
          <!-- Active Incidents List -->
          <div class="incidents-list-card">
            <h3 class="card-section-title">Active Global Incidents (${disruptions.length})</h3>
            <div class="incident-cards-scroll">
              ${disruptions.map(disr => `
                <div class="incident-item-card ${disr.id === 'DISR-01' ? 'selected' : ''}" data-id="${disr.id}">
                  <div class="incident-item-top">
                    <span class="incident-sev ${disr.severity.toLowerCase()}">${disr.severity}</span>
                    <span class="incident-time">Detected 14:32</span>
                  </div>
                  <div class="incident-item-title">${disr.title}</div>
                  <div class="incident-item-metrics">
                    <span>Impact: <strong>${disr.affectedShipmentsCount || 47} Shipments</strong></span>
                    <span>Exposure: <strong>$${Math.round((disr.estimatedRevenueExposureUSD || 142000000) / 1000000)}M</strong></span>
                  </div>
                  <div class="incident-item-summary">${disr.summary}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Chronological Incident Lifecycle Timeline (Section 31) -->
          <div class="incident-timeline-card">
            <div class="timeline-card-header">
              <h3 class="card-section-title">Incident Resolution Timeline: PORT-SIN</h3>
              <span class="status-badge-live ${isRecovery ? 'good' : 'crit'}">${isRecovery ? 'RESOLVING (Plan B Active)' : 'ACTIVE ESCALATION'}</span>
            </div>

            <div class="chronological-timeline">
              <div class="timeline-entry completed">
                <span class="time-marker">14:32:00</span>
                <div class="timeline-content">
                  <div class="timeline-actor">SENTINEL AGENT</div>
                  <div class="timeline-desc">Berth queue exceeded 40 vessels; AIS average dwell time jumped to 4.8 days. Disruption registered.</div>
                </div>
              </div>
              <div class="timeline-entry completed">
                <span class="time-marker">14:33:15</span>
                <div class="timeline-content">
                  <div class="timeline-actor">RISK INTELLIGENCE AGENT</div>
                  <div class="timeline-desc">Causal cascade traced: 47 inbound shipments delayed; WH-17 inventory runway drops to 4.8 days; $142M exposure flagged.</div>
                </div>
              </div>
              <div class="timeline-entry completed">
                <span class="time-marker">14:34:40</span>
                <div class="timeline-content">
                  <div class="timeline-actor">LOGISTICS OPTIMIZER AGENT</div>
                  <div class="timeline-desc">Identified 3 alternative routing corridors. Top recommendation: Port Klang (PORT-KLG) maritime feeder bypass.</div>
                </div>
              </div>
              <div class="timeline-entry completed">
                <span class="time-marker">14:35:50</span>
                <div class="timeline-content">
                  <div class="timeline-actor">WHAT-IF SIMULATION ENGINE</div>
                  <div class="timeline-desc">Deterministic comparison completed: Baseline vs Plan A (Air) vs Plan B (Port Klang). Plan B selected with 94.8% SLA recovery.</div>
                </div>
              </div>
              <div class="timeline-entry ${isRecovery ? 'completed' : 'pending'}">
                <span class="time-marker">14:37:10</span>
                <div class="timeline-content">
                  <div class="timeline-actor">HUMAN GOVERNOR (Arindam Jaiman)</div>
                  <div class="timeline-desc">${isRecovery ? 'Directive authorized. Electronic bills of lading updated via SAP TM adapter.' : 'Directive card dispatched to human approval queue. Awaiting operator signature.'}</div>
                </div>
              </div>
              <div class="timeline-entry ${isRecovery ? 'active' : ''}">
                <span class="time-marker">14:38:00</span>
                <div class="timeline-content">
                  <div class="timeline-actor">SAP S/4HANA & TM EXECUTION</div>
                  <div class="timeline-desc">${isRecovery ? '47 Vessels rerouted in digital twin. Recovery velocity advancing at 35%.' : 'Execution pending authorization.'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderInventoryTower(state) {
    const { warehouses } = state.entities;
    const isRecovery = state.simulation.recoveryStatus === 'IN_RECOVERY';

    this.container.innerHTML = `
      <div class="operational-view-panel">
        <div class="op-panel-header">
          <div>
            <h2 class="op-panel-title">INVENTORY CONTROL TOWER (Section 33 & 95)</h2>
            <p class="op-panel-sub">Real-time buffer stocks, days of supply, critical stockout runways, and warehouse rebalancing.</p>
          </div>
          <button class="btn-tactical outline" id="btn-return-twin">View 3D Inventory Columns ➔</button>
        </div>

        <div class="inventory-kpi-strip">
          <div class="inv-kpi-tile">
            <span class="inv-label">Total Network Inventory</span>
            <span class="inv-val">$1.84 Billion</span>
          </div>
          <div class="inv-kpi-tile">
            <span class="inv-label">Safety Stock Coverage</span>
            <span class="inv-val">22.4 Days</span>
          </div>
          <div class="inv-kpi-tile crit">
            <span class="inv-label">Critical Stockout Runways</span>
            <span class="inv-val">${isRecovery ? '1 Facility (Mitigating)' : '3 Facilities'}</span>
          </div>
          <div class="inv-kpi-tile">
            <span class="inv-label">Network Capacity Utilization</span>
            <span class="inv-val">84.5%</span>
          </div>
        </div>

        <div class="warehouse-table-card">
          <h3 class="card-section-title">Regional Fulfillment Hubs & Buffer Runways (${warehouses.length} Hubs)</h3>
          <div class="table-scroll-container">
            <table class="enterprise-table">
              <thead>
                <tr>
                  <th>Hub ID</th>
                  <th>Facility Name</th>
                  <th>Region</th>
                  <th>Current Stock</th>
                  <th>Safety Stock</th>
                  <th>Days of Cover</th>
                  <th>Stockout Risk</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${warehouses.slice(0, 15).map(w => `
                  <tr class="${w.id === 'WH-17' ? 'critical-row' : ''}">
                    <td><strong>${w.id}</strong></td>
                    <td>${w.name}</td>
                    <td>${w.region}</td>
                    <td>${w.currentStock.toLocaleString()} units</td>
                    <td>${w.safetyStock.toLocaleString()} units</td>
                    <td><strong>${w.daysOfCover}d</strong></td>
                    <td><span class="status-pill ${w.stockoutRisk.toLowerCase()}">${w.stockoutRisk}</span></td>
                    <td>
                      <button class="btn-tactical outline-subtle mini btn-inspect-wh" data-id="${w.id}">
                        Inspect Hub
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderSupplierIntelligence(state) {
    const { suppliers } = state.entities;
    this.container.innerHTML = `
      <div class="operational-view-panel">
        <div class="op-panel-header">
          <div>
            <h2 class="op-panel-title">SUPPLIER INTELLIGENCE & CONCENTRATION (Section 34 & 97)</h2>
            <p class="op-panel-sub">Tier-1 and Tier-2 supplier dependency analysis, single-source vulnerabilities, and qualification lead times.</p>
          </div>
          <button class="btn-tactical outline" id="btn-return-twin">View on Map ➔</button>
        </div>

        <div class="supplier-metrics-row">
          <div class="sup-tile">
            <span class="sup-label">Total Monitored Suppliers</span>
            <span class="sup-val">160 Tier-1/2</span>
          </div>
          <div class="sup-tile crit">
            <span class="sup-label">Single-Source Vulnerabilities</span>
            <span class="sup-val">4 Critical SKUs</span>
          </div>
          <div class="sup-tile">
            <span class="sup-label">Average Supplier OTIF</span>
            <span class="sup-val">93.4%</span>
          </div>
          <div class="sup-tile">
            <span class="sup-label">ESG Compliance Rate</span>
            <span class="sup-val">97.8%</span>
          </div>
        </div>

        <div class="table-scroll-container" style="margin-top:16px;">
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>Supplier ID</th>
                <th>Supplier Name</th>
                <th>Category</th>
                <th>Country</th>
                <th>Reliability</th>
                <th>Risk Score</th>
                <th>Lead Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${suppliers.slice(0, 16).map(s => `
                <tr>
                  <td><strong>${s.id}</strong></td>
                  <td>${s.name}</td>
                  <td>${s.category}</td>
                  <td>${s.country}</td>
                  <td>${s.reliabilityScore}%</td>
                  <td><strong>${s.riskScore}/100</strong></td>
                  <td>${s.leadTimeDays} days</td>
                  <td><span class="status-pill ${s.status === 'OPERATIONAL' ? 'good' : 'warn'}">${s.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderLogisticsTower(state) {
    const { routes, vessels, shipments } = state.entities;
    this.container.innerHTML = `
      <div class="operational-view-panel">
        <div class="op-panel-header">
          <div>
            <h2 class="op-panel-title">LOGISTICS CONTROL TOWER (Section 35)</h2>
            <p class="op-panel-sub">Multi-modal freight corridors, carrier performance, vessel queues, and delay analytics.</p>
          </div>
          <button class="btn-tactical outline" id="btn-return-twin">View in 3D Twin ➔</button>
        </div>

        <div class="logistics-kpi-grid">
          <div class="log-tile">
            <span class="log-label">Active Shipping Corridors</span>
            <span class="log-val">${routes.length} Lanes</span>
          </div>
          <div class="log-tile">
            <span class="log-label">Active Commercial Fleet</span>
            <span class="log-val">${vessels.length} Vessels</span>
          </div>
          <div class="log-tile crit">
            <span class="log-label">Delayed Shipments (> 24h)</span>
            <span class="log-val">${state.derived?.atRiskShipmentsCount || 47} Units</span>
          </div>
          <div class="log-tile">
            <span class="log-label">Active Carriers</span>
            <span class="log-val">16 Global Lines</span>
          </div>
        </div>

        <div class="table-scroll-container" style="margin-top:16px;">
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>Vessel / Carrier</th>
                <th>Origin ➔ Destination</th>
                <th>Cargo TEU</th>
                <th>Speed</th>
                <th>Delay</th>
                <th>ETA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${vessels.slice(0, 15).map(v => `
                <tr class="${v.delayHours > 24 ? 'critical-row' : ''}">
                  <td><strong>${v.name}</strong></td>
                  <td>${v.originId} ➔ ${v.destinationId}</td>
                  <td>${v.cargoTEU.toLocaleString()} TEU</td>
                  <td>${v.speedKnots} kts</td>
                  <td><strong style="color:${v.delayHours > 24 ? 'var(--color-danger)' : 'inherit'};">+${v.delayHours}h</strong></td>
                  <td>${v.etaDays}d</td>
                  <td><span class="status-pill ${v.status === 'DELAYED' ? 'crit' : 'good'}">${v.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderApprovalsView(state) {
    const { pendingApproval, approvalHistory } = state.governance;

    this.container.innerHTML = `
      <div class="operational-view-panel">
        <div class="op-panel-header">
          <div>
            <h2 class="op-panel-title">HUMAN-IN-THE-LOOP APPROVAL QUEUE (Section 30)</h2>
            <p class="op-panel-sub">Governed autonomy: AI agents propose; designated supply chain authorities authorize.</p>
          </div>
        </div>

        ${pendingApproval ? `
          <div class="approval-card-large">
            <div class="appr-header">
              <span class="appr-badge">AUTHORIZATION REQUIRED</span>
              <span class="appr-deadline">Deadline: 45 min remaining</span>
            </div>
            <h3 class="appr-title">${pendingApproval.title}</h3>
            <p class="appr-reason">${pendingApproval.rationale || 'High-impact maritime reroute to avoid 5-day Singapore berth stoppage.'}</p>

            <div class="appr-metrics-grid">
              <div class="appr-metric">
                <span class="m-lbl">Financial Exposure</span>
                <span class="m-val">$142,000,000</span>
              </div>
              <div class="appr-metric">
                <span class="m-lbl">Expedite / Reroute Cost</span>
                <span class="m-val">$142,000</span>
              </div>
              <div class="appr-metric">
                <span class="m-lbl">Service Level Impact</span>
                <span class="m-val">+5.8% SLA Restored</span>
              </div>
              <div class="appr-metric">
                <span class="m-lbl">Agent Confidence</span>
                <span class="m-val">94.8%</span>
              </div>
            </div>

            <div class="appr-actions-row">
              <button class="btn-tactical success" id="btn-queue-approve">Approve & Dispatch</button>
              <button class="btn-tactical outline" id="btn-queue-resimulate">Simulate Alternatives</button>
              <button class="btn-tactical danger" id="btn-queue-reject">Reject Directive</button>
            </div>
          </div>
        ` : `
          <div class="empty-state-box">
            <svg style="width:36px; height:36px; fill:var(--color-success); margin-bottom:10px;" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
            <div class="empty-title">All Monitored Actions Governed & Executed</div>
            <div class="empty-sub">No pending high-impact recommendations requiring human authorization at this moment.</div>
          </div>
        `}

        <div style="margin-top:24px;">
          <h3 class="card-section-title">Execution History (${approvalHistory.length})</h3>
          <div class="table-scroll-container">
            <table class="enterprise-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Directive Title</th>
                  <th>Approver</th>
                  <th>SAP Document</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${approvalHistory.length > 0 ? approvalHistory.map(h => `
                  <tr>
                    <td>${h.approvedAt.slice(11, 19)}</td>
                    <td><strong>${h.title}</strong></td>
                    <td>${h.approver}</td>
                    <td><code>${h.sapDocument}</code></td>
                    <td><span class="status-pill good">${h.status}</span></td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="5" style="text-align:center; color:var(--color-neutral);">No historical approvals recorded yet.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  renderAuditTrail(state) {
    const { auditLog } = state.governance;

    this.container.innerHTML = `
      <div class="operational-view-panel">
        <div class="op-panel-header">
          <div>
            <h2 class="op-panel-title">AUDIT TRAIL & GOVERNANCE LEDGER (Section 59 & 78)</h2>
            <p class="op-panel-sub">Immutable operational record of detections, agent deliberations, human sign-offs, and SAP postings.</p>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-tactical outline-subtle" id="btn-export-audit-json">Export JSON</button>
            <button class="btn-tactical outline-subtle" id="btn-export-audit-csv">Export CSV</button>
          </div>
        </div>

        <div class="table-scroll-container" style="margin-top:16px;">
          <table class="enterprise-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Agent</th>
                <th>Action</th>
                <th>Entity Target</th>
                <th>Reason / Evidence</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              ${auditLog.map(log => `
                <tr>
                  <td><code>${log.timestamp}</code></td>
                  <td><strong>${log.actor}</strong></td>
                  <td>${log.agent}</td>
                  <td><span class="status-pill ${log.result === 'CONFIRMED' || log.result === 'SUCCESS' ? 'good' : 'warn'}">${log.action}</span></td>
                  <td>${log.entity}</td>
                  <td style="max-width:320px;">${log.reason}</td>
                  <td><strong>${log.result}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderRiskComplianceView(state, page) {
    this.container.innerHTML = `
      <div class="operational-view-panel">
        <div class="op-panel-header">
          <div>
            <h2 class="op-panel-title">${page === 'COMPLIANCE' ? 'COMPLIANCE & TRADE INTEGRITY (Section 58)' : 'RISK & SUSTAINABILITY INTELLIGENCE (Section 32 & 57)'}</h2>
            <p class="op-panel-sub">Multi-layer environmental, trade sanction, and MetOcean hazard monitoring.</p>
          </div>
          <button class="btn-tactical outline" id="btn-return-twin">View on 3D Globe ➔</button>
        </div>

        <div class="risk-cards-grid">
          <div class="risk-stat-card">
            <span class="risk-title">Geopolitical Route Restrictions</span>
            <span class="risk-val good">100% Compliant</span>
            <span class="risk-sub">Red Sea / Suez routing compliant with maritime security advisories.</span>
          </div>
          <div class="risk-stat-card">
            <span class="risk-title">Scope-3 Carbon Emissions</span>
            <span class="risk-val">840t CO2</span>
            <span class="risk-sub">-18.4% vs 2025 baseline through optimized maritime routing.</span>
          </div>
          <div class="risk-stat-card">
            <span class="risk-title">Cold-Chain Temperature SLA</span>
            <span class="risk-val good">99.8%</span>
            <span class="risk-sub">All pharma & battery shipment telemetry within SLA bounds.</span>
          </div>
        </div>
      </div>
    `;
  }

  renderSystemView(state) {
    this.container.innerHTML = `
      <div class="operational-view-panel">
        <div class="op-panel-header">
          <div>
            <h2 class="op-panel-title">DATA SOURCES & SAP ADAPTERS (Section 73)</h2>
            <p class="op-panel-sub">Live health, round-trip latency, and integration telemetry across enterprise systems.</p>
          </div>
          <button class="btn-tactical outline" id="btn-return-twin">Return to Overview ➔</button>
        </div>

        <div class="adapters-grid">
          <div class="adapter-card">
            <div class="ad-top">
              <span class="ad-name">SAP S/4HANA</span>
              <span class="status-pill good">CONNECTED</span>
            </div>
            <div class="ad-desc">Enterprise Core & Material Master Service</div>
            <div class="ad-latency">Latency: 28ms · Client 100</div>
          </div>
          <div class="adapter-card">
            <div class="ad-top">
              <span class="ad-name">SAP IBP</span>
              <span class="status-pill good">CONNECTED</span>
            </div>
            <div class="ad-desc">Integrated Business Planning & Consensus Demand</div>
            <div class="ad-latency">Latency: 42ms · Planning Area SAPIBP1</div>
          </div>
          <div class="adapter-card">
            <div class="ad-top">
              <span class="ad-name">SAP EWM</span>
              <span class="status-pill good">CONNECTED</span>
            </div>
            <div class="ad-desc">Extended Warehouse Management & Bin Inventory</div>
            <div class="ad-latency">Latency: 19ms · WH01 Active</div>
          </div>
          <div class="adapter-card">
            <div class="ad-top">
              <span class="ad-name">SAP TM</span>
              <span class="status-pill good">CONNECTED</span>
            </div>
            <div class="ad-desc">Transportation Management & Freight Orders</div>
            <div class="ad-latency">Latency: 31ms · TM-GLOBAL-FREIGHT</div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(activePage) {
    // Return to 3D Twin button
    const returnBtn = document.getElementById('btn-return-twin');
    if (returnBtn) {
      returnBtn.addEventListener('click', () => {
        store.setActivePage('OVERVIEW');
      });
    }

    // What-If Sliders
    const sliderDelay = document.getElementById('input-supplier-delay');
    if (sliderDelay) {
      sliderDelay.addEventListener('input', (e) => {
        this.whatIfParams.supplierDelayDays = parseInt(e.target.value);
        const lbl = document.getElementById('val-supplier-delay');
        if (lbl) lbl.textContent = `+${this.whatIfParams.supplierDelayDays} Days`;
      });
    }

    const sliderDemand = document.getElementById('input-demand-mult');
    if (sliderDemand) {
      sliderDemand.addEventListener('input', (e) => {
        this.whatIfParams.demandMultiplier = parseInt(e.target.value) / 100;
        const lbl = document.getElementById('val-demand-mult');
        if (lbl) lbl.textContent = `${Math.round((this.whatIfParams.demandMultiplier - 1) * 100)}% Surge`;
      });
    }

    const sliderBudget = document.getElementById('input-expedite-budget');
    if (sliderBudget) {
      sliderBudget.addEventListener('input', (e) => {
        this.whatIfParams.expediteBudgetUSD = parseInt(e.target.value);
        const lbl = document.getElementById('val-expedite-budget');
        if (lbl) lbl.textContent = `$${Math.round(this.whatIfParams.expediteBudgetUSD / 1000)}k`;
      });
    }

    // Run What-If Sim button
    const runSimBtn = document.getElementById('btn-run-whatif-sim');
    if (runSimBtn) {
      runSimBtn.addEventListener('click', () => {
        this.render();
      });
    }

    // Select Plan B button
    const selectPlanB = document.getElementById('btn-select-plan-b');
    if (selectPlanB) {
      selectPlanB.addEventListener('click', async () => {
        const disr = store.getState().entities.disruptions[0];
        window.__appOrchestrator?.triggerDisruptionWorkflow(disr);
        store.setActivePage('OVERVIEW');
      });
    }

    // Approval Queue buttons
    const btnApprove = document.getElementById('btn-queue-approve');
    if (btnApprove) {
      btnApprove.addEventListener('click', async () => {
        const pending = store.getState().governance.pendingApproval;
        if (pending) {
          await executionService.approveRecommendation(pending);
          this.render();
        }
      });
    }

    const btnReject = document.getElementById('btn-queue-reject');
    if (btnReject) {
      btnReject.addEventListener('click', () => {
        const pending = store.getState().governance.pendingApproval;
        if (pending) {
          executionService.rejectRecommendation(pending);
          this.render();
        }
      });
    }

    // Export Audit Trail buttons
    const exportJson = document.getElementById('btn-export-audit-json');
    if (exportJson) {
      exportJson.addEventListener('click', () => {
        const data = JSON.stringify(store.getState().governance.auditLog, null, 2);
        this.downloadFile(data, 'sap-resilient-audit-trail.json', 'application/json');
      });
    }

    const exportCsv = document.getElementById('btn-export-audit-csv');
    if (exportCsv) {
      exportCsv.addEventListener('click', () => {
        const logs = store.getState().governance.auditLog;
        const headers = ['timestamp', 'actor', 'agent', 'action', 'entity', 'reason', 'result'];
        const csv = [
          headers.join(','),
          ...logs.map(l => `"${l.timestamp}","${l.actor}","${l.agent}","${l.action}","${l.entity}","${l.reason}","${l.result}"`)
        ].join('\n');
        this.downloadFile(csv, 'sap-resilient-audit-trail.csv', 'text/csv');
      });
    }

    // Warehouse inspect buttons
    this.container.querySelectorAll('.btn-inspect-wh').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const wh = store.getState().entities.warehouses.find(w => w.id === id);
        if (wh) {
          store.selectEntity(wh);
          store.setActivePage('OVERVIEW');
          window.__appSceneController?.flyToLocation(wh.lat, wh.lon, 450000);
        }
      });
    });
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  update() {
    const state = store.getState();
    const activePage = state.ui.activePage || 'OVERVIEW';
    if (activePage === 'OVERVIEW' || activePage === 'DIGITAL_TWIN') {
      this.container.style.display = 'none';
    } else {
      this.container.style.display = 'block';
      this.render();
    }
  }
}
