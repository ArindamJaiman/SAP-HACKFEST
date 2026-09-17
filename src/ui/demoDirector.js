/**
 * SAP Resilient: Cinematic Presentation Director ("Global Logistics Shock" Demo Mode)
 * Section 40 & Section 69 of the Master Build Prompt
 */

import { store } from '../app/store.js';
import { governor } from '../agents/governor.js';

export class DemoDirector {
  constructor() {
    this.isRunning = false;
  }

  async runGlobalLogisticsShockDemo() {
    if (this.isRunning) return;
    this.isRunning = true;

    const scene = window.__appSceneController;
    const orch = window.__appOrchestrator;
    const sinPort = store.getState().entities.ports.find(p => p.id === 'PORT-SIN');
    const wh17 = store.getState().entities.warehouses.find(w => w.id === 'WH-17');
    const disr = store.getState().entities.disruptions[0];

    store.addAgentMessage('DIRECTOR', '▶ STARTING CINEMATIC PRESENTATION: "GLOBAL LOGISTICS SHOCK"', 'governor');

    // Step 1: Global Network view
    scene?.resetGlobeView();
    await this.sleep(3000);

    // Step 2: Smooth camera zoom into Southeast Asia
    store.addAgentMessage('DIRECTOR', 'Phase 1: Zooming to Asia-Pacific logistics backbone...', 'sentinel');
    scene?.flyToCoordinates(sinPort.lat, sinPort.lon, 6500000, 2.5);
    await this.sleep(3200);

    // Step 3: Descend onto Port of Singapore
    store.addAgentMessage('DIRECTOR', 'Phase 2: Sensing terminal freeze at Port of Singapore...', 'sentinel');
    scene?.flyToCoordinates(sinPort.lat, sinPort.lon, 420000, 2.0);
    await this.sleep(2500);

    // Step 4: Disruption trigger & Multi-Agent cascade
    orch?.triggerDisruptionWorkflow(disr);
    await this.sleep(3500);

    // Step 5: Camera transitions to at-risk warehouse WH-17
    store.addAgentMessage('DIRECTOR', 'Phase 3: Tracking causal ripple to downstream warehouse WH-17...', 'impact');
    scene?.flyToCoordinates(wh17.lat, wh17.lon, 380000, 2.0);
    store.selectEntity(wh17);
    await this.sleep(4000);

    // Step 6: Return to regional tactical view showing proposed reroute
    store.addAgentMessage('DIRECTOR', 'Phase 4: Multi-Agent Governor synthesizes optimal reroute via Port Klang...', 'route');
    scene?.flyToCoordinates(3.0, 102.5, 950000, 2.0);
    await this.sleep(3500);

    // Step 7: Auto-simulate Human-in-the-loop approval
    const pending = store.getState().governance.pendingApproval;
    if (pending) {
      store.addAgentMessage('DIRECTOR', 'Phase 5: Operations Director approves AI recommendation.', 'governor');
      governor.executeApprovedAction(pending, 'OPERATIONS_DIRECTOR', `DEMO-APPROVAL-${Date.now()}`);
    }

    await this.sleep(3000);
    store.addAgentMessage('DIRECTOR', '✓ DEMO COMPLETE: Supply chain network successfully restabilized.', 'governor');
    this.isRunning = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const demoDirector = new DemoDirector();
