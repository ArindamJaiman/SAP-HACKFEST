/**
 * SAP Resilient: Multi-Agent Orchestrator
 * Connects the 9 specialist agents into a continuous sense-think-act-recover loop
 */

import { sentinel } from './sentinel.js';
import { impactAnalyst } from './impactAnalyst.js';
import { scenarioEngineer } from './scenarioEngineer.js';
import { routeOptimizer } from './routeOptimizer.js';
import { inventoryAgent } from './inventoryAgent.js';
import { procurementAgent } from './procurementAgent.js';
import { complianceAgent } from './complianceAgent.js';
import { recoveryAgent } from './recoveryAgent.js';
import { governor } from './governor.js';
import { store } from '../app/store.js';

export class AgentOrchestrator {
  constructor() {
    this.agents = {
      sentinel,
      impactAnalyst,
      scenarioEngineer,
      routeOptimizer,
      inventoryAgent,
      procurementAgent,
      complianceAgent,
      recoveryAgent,
      governor
    };
  }

  startSensingLoop() {
    // Initial scan
    sentinel.monitorNetwork();
    sentinel.detectShipmentAnomalies();
  }

  triggerDisruptionWorkflow(disruption) {
    store.setState(s => {
      s.simulation.activeDisruption = disruption;
      s.ui.incidentMode = true;
      s.ui.activeIncidentTitle = disruption.title;
    });

    const correlationId = `DISR-RUN-${Date.now()}`;
    store.addAgentMessage('ORCHESTRATOR', `Triggering multi-agent response workflow for "${disruption.title}".`, 'sentinel');

    // Step 1: Impact Analysis
    const portId = disruption.affectedPortId || 'PORT-SIN';
    impactAnalyst.analyzePortDisruption(portId, correlationId);
  }
}

export const orchestrator = new AgentOrchestrator();
