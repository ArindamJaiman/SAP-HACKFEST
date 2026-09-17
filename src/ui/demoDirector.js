/**
 * SAP Resilient: Presentation Director & Flagship Demo Mode (Sections 60, 61, 88, 89)
 * Flagship Scenario: "PORT CLOSURE CASCADE"
 * 22-Step interactive or autonomous presentation journey
 * Controls: Start Demo, Pause Demo, Resume Demo, Next Step, Restart Demo
 */

import { store } from '../app/store.js';
import { governor } from '../agents/governor.js';

export class DemoDirector {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentStep = 0;
    this.stepResolve = null;
  }

  async runGlobalLogisticsShockDemo() {
    if (this.isRunning) {
      if (this.isPaused) {
        this.resumeDemo();
      }
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.currentStep = 1;

    const scene = window.__appSceneController;
    const orch = window.__appOrchestrator;
    const sinPort = store.getState().entities.ports.find(p => p.id === 'PORT-SIN');
    const wh17 = store.getState().entities.warehouses.find(w => w.id === 'WH-17');
    const disr = store.getState().entities.disruptions[0];

    store.setActivePage('OVERVIEW');

    try {
      // STEP 1: Global healthy network
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 1/22: Initializing global healthy baseline telemetry...', 'sentinel');
      scene?.resetGlobeView();
      await this.stepDelay(2400);

      // STEP 2: Start simulation
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 2/22: Activating global real-time simulation clock...', 'sentinel');
      store.setState(s => { s.simulation.isPlaying = true; s.simulation.speedMultiplier = 2; });
      await this.stepDelay(2000);

      // STEP 3: Port congestion appears
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 3/22: MetOcean squall strikes Port of Singapore (PORT-SIN)...', 'sentinel');
      scene?.flyToCoordinates(sinPort.lat, sinPort.lon, 1200000, 2.0);
      await this.stepDelay(2200);

      // STEP 4: Disruption ring expands
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 4/22: Disruption shockwave expands over Malacca Strait...', 'sentinel');
      scene?.flyToCoordinates(sinPort.lat, sinPort.lon, 450000, 1.8);
      store.selectEntity(sinPort);
      await this.stepDelay(2200);

      // STEP 5: Affected routes turn critical
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 5/22: Inbound maritime lanes turn critical (congested warning)...', 'route');
      orch?.triggerDisruptionWorkflow(disr);
      await this.stepDelay(2500);

      // STEP 6: Shipments become delayed
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 6/22: 47 container vessels delayed > 24 hours in queue...', 'impact');
      await this.stepDelay(2200);

      // STEP 7: Orders become at risk
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 7/22: Tracking causal ripple: $142M revenue exposure flagged...', 'impact');
      await this.stepDelay(2200);

      // STEP 8: Control Tower Agent activates
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 8/22: Control Tower Orchestrator activates multi-agent swarm...', 'governor');
      await this.stepDelay(1800);

      // STEP 9: Risk Agent investigates
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 9/22: Risk Agent evaluates MetOcean Squall & 4.8d berth dwell time...', 'sentinel');
      await this.stepDelay(1800);

      // STEP 10: Logistics Agent evaluates routes
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 10/22: Logistics Agent calculates 3 alternate corridors (Klang, Colombo, Tanjung Pelepas)...', 'route');
      await this.stepDelay(2000);

      // STEP 11: Inventory Agent checks alternate stock
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 11/22: Inventory Agent traces WH-17 stockout runway (4.8 days remaining)...', 'inventory');
      scene?.flyToCoordinates(wh17.lat, wh17.lon, 420000, 1.8);
      store.selectEntity(wh17);
      await this.stepDelay(2600);

      // STEP 12: Simulation engine runs three strategies
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 12/22: What-If Simulator runs 3 strategies: Baseline, Air Expedite, and Port Klang...', 'governor');
      await this.stepDelay(2200);

      // STEP 13: Comparison appears
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 13/22: Comparative tradeoff matrix generated (Cost vs OTIF vs Scope-3 CO2)...', 'governor');
      await this.stepDelay(2000);

      // STEP 14: Recommended action appears
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 14/22: Recommended Policy: Divert to Port Klang (94.8% SLA recovery at $142k)...', 'governor');
      scene?.flyToCoordinates(3.0, 102.5, 950000, 2.0);
      await this.stepDelay(2500);

      // STEP 15: Approval queue activates
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 15/22: High-impact directive card submitted to Human Approval Queue...', 'governor');
      await this.stepDelay(2000);

      // STEP 16: Operator approves
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 16/22: Operator (Arindam Jaiman) authorizes Port Klang reroute directive...', 'governor');
      const pending = store.getState().governance.pendingApproval;
      if (pending) {
        governor.executeApprovedAction(pending, 'OPERATIONS_DIRECTOR', `DEMO-APPR-${Date.now()}`);
      }
      await this.stepDelay(2500);

      // STEP 17: Shipment visibly reroutes
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 17/22: 3D Twin updates: Green contingency corridor rendered to Port Klang...', 'route');
      await this.stepDelay(2500);

      // STEP 18: Inventory allocation changes
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 18/22: SAP EWM triggers warehouse rebalance: 2,400 buffer units transferred to WH-17...', 'inventory');
      await this.stepDelay(2200);

      // STEP 19: Risk score declines
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 19/22: Exposure drops from $142M down to $18.2M...', 'impact');
      await this.stepDelay(2000);

      // STEP 20: OTIF projection improves
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 20/22: Projected On-Time Delivery restored to 94.8% (▲ +6.3%)...', 'governor');
      await this.stepDelay(2000);

      // STEP 21: Incident moves to resolving
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 21/22: Incident status updated: RESOLVING (Contingency Velocity 35%)...', 'governor');
      await this.stepDelay(2200);

      // STEP 22: Audit trail records the complete action
      store.addAgentMessage('DEMO DIRECTOR', 'STEP 22/22: Immutable audit trail entry committed to SAP Governance ledger.', 'governor');
      await this.stepDelay(1500);

      store.addAgentMessage('DEMO DIRECTOR', '✓ DEMO COMPLETE: End-to-end Agentic Supply Chain Control Loop verified successfully.', 'governor');
    } catch (err) {
      console.warn('[Demo Interrupted]', err);
    } finally {
      this.isRunning = false;
      this.isPaused = false;
    }
  }

  pauseDemo() {
    this.isPaused = true;
    store.addAgentMessage('DEMO DIRECTOR', '⏸ Demo presentation paused. Click "Resume" or "Next Step".', 'governor');
  }

  resumeDemo() {
    this.isPaused = false;
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
    store.addAgentMessage('DEMO DIRECTOR', '▶ Demo presentation resumed.', 'governor');
  }

  nextStep() {
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  restartDemo() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
    this.runGlobalLogisticsShockDemo();
  }

  stepDelay(ms) {
    return new Promise(resolve => {
      if (this.isPaused) {
        this.stepResolve = resolve;
      } else {
        const timer = setTimeout(() => {
          resolve();
        }, ms);
        this.stepResolve = () => {
          clearTimeout(timer);
          resolve();
        };
      }
    });
  }
}

export const demoDirector = new DemoDirector();
