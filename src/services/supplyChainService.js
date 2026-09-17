/**
 * SAP Resilient: Domain Services Layer (Section 74)
 * Decouples mock data and business logic from UI components.
 */

import { store } from '../app/store.js';
import { eventBus } from '../app/events.js';
import { sapAdapters } from './sapAdapters.js';

export class SupplyChainService {
  getEntities() {
    return store.getState().entities;
  }

  getEntityById(type, id) {
    const { entities } = store.getState();
    const collection = entities[type] || entities[`${type}s`];
    if (!collection) return null;
    return collection.find(item => item.id === id);
  }

  getDownstreamImpact(nodeId) {
    return store.graph.simulateKnockout(nodeId);
  }
}

export class ScenarioService {
  getActiveScenario() {
    return store.getState().simulation.activeScenarioId;
  }

  getScenarioPresets() {
    return [
      {
        id: 'SCENARIO-01',
        title: 'Port of Singapore Cascade (Flagship)',
        category: 'Maritime Bottleneck',
        severity: 'CRITICAL',
        estimatedExposure: '$142M',
        recoveryBaselineDays: 9.4,
        description: 'Monsoon squalls and labor disputes induce a 5-day handling stoppage at Singapore container terminals, threatening 47 inbound shipments.'
      },
      {
        id: 'SCENARIO-02',
        title: 'Suez Canal Sandstorm Lockdown',
        category: 'Chokepoint Closure',
        severity: 'HIGH',
        estimatedExposure: '$98M',
        recoveryBaselineDays: 6.2,
        description: 'Zero-visibility gale forces container convoys to hold at Great Bitter Lake; Asia-Europe supply lines halted.'
      },
      {
        id: 'SCENARIO-03',
        title: 'Hsinchu Semiconductor Fab Grid Trip',
        category: 'Supplier Outage',
        severity: 'CRITICAL',
        estimatedExposure: '$210M',
        recoveryBaselineDays: 14.0,
        description: 'Substation fault interrupts cleanroom lithography; critical automotive and robotics microcontrollers delayed 21 days.'
      },
      {
        id: 'SCENARIO-04',
        title: 'European Automotive Demand Surge (+22%)',
        category: 'Demand Shock',
        severity: 'MEDIUM',
        estimatedExposure: '$65M',
        recoveryBaselineDays: 4.5,
        description: 'Accelerated EV rebate adoption spikes demand in Germany, France, and Benelux, depleting buffer stocks.'
      },
      {
        id: 'SCENARIO-05',
        title: 'Tropical Cyclone Asani Tracking Bay of Bengal',
        category: 'MetOcean Hazard',
        severity: 'HIGH',
        estimatedExposure: '$64M',
        recoveryBaselineDays: 5.0,
        description: 'Category 3 cyclone generates 9m swells; Indian Ocean shipping routes diversion adds 4.2 days.'
      }
    ];
  }
}

export class SimulationService {
  setSpeed(multiplier) {
    store.setState(s => {
      s.simulation.speedMultiplier = multiplier;
    });
    eventBus.emit('SIMULATION_SPEED_CHANGED', { speed: multiplier });
  }

  togglePlayback() {
    const isPlaying = !store.getState().simulation.isPlaying;
    store.setState(s => {
      s.simulation.isPlaying = isPlaying;
    });
    eventBus.emit('SIMULATION_PLAYBACK_TOGGLED', { isPlaying });
    return isPlaying;
  }

  seekTime(timestampMs) {
    store.setState(s => {
      s.simulation.simulationTime = timestampMs;
    });
    eventBus.emit('SIMULATION_TIME_SEEK', { timestamp: timestampMs });
  }
}

export class ExecutionService {
  async approveRecommendation(recommendation) {
    // 1. Post to SAP TM adapter
    const sapResult = await sapAdapters.tm.executeReroute(
      'SHP-47-CONVOY',
      recommendation.actionDetails?.targetPort || 'PORT-KLG'
    );

    // 2. Post to SAP EWM for warehouse transfer
    await sapAdapters.ewm.createWarehouseTask({
      sourceBin: 'WH-KLANG-BAY',
      destBin: 'WH-17-INBOUND'
    });

    // 3. Mutate simulation state
    store.setState(s => {
      s.simulation.recoveryStatus = 'IN_RECOVERY';
      s.simulation.activeRecoveryPercent = 35;
      s.governance.pendingApproval = null;
      s.governance.approvalHistory.push({
        id: `APPR-${Date.now()}`,
        recommendationId: recommendation.id,
        title: recommendation.title,
        approvedAt: new Date().toISOString(),
        approver: 'Arindam Jaiman (Staff SC Architect)',
        status: 'EXECUTED_CONFIRMED',
        sapDocument: sapResult.freightDocumentUpdated ? 'SAP-TM-6100842' : 'N/A'
      });
      s.governance.auditLog.unshift({
        timestamp: new Date().toLocaleTimeString(),
        actor: 'OPERATOR (Arindam Jaiman)',
        agent: 'LOGISTICS & GOVERNOR AGENT',
        action: 'APPROVED & DISPATCHED REROUTE',
        entity: 'PORT-SIN ➔ PORT-KLG (47 Shipments)',
        reason: 'Avoid projected 9.4-day congestion exposure',
        beforeState: 'Status: CRITICAL · Risk: 88 · Exposure: $142M',
        afterState: 'Status: IN_RECOVERY · Reroute Active · ETA: +14h',
        result: 'SUCCESS'
      });
    });

    eventBus.emit('ACTION_APPROVED', { recommendation, sapResult }, { source: 'HUMAN_GOVERNOR', severity: 'SUCCESS' });
    return sapResult;
  }

  rejectRecommendation(recommendation, reason = 'Operator rejected contingency') {
    store.setState(s => {
      s.governance.pendingApproval = null;
      s.governance.auditLog.unshift({
        timestamp: new Date().toLocaleTimeString(),
        actor: 'OPERATOR',
        agent: 'GOVERNOR AGENT',
        action: 'REJECTED CONTINGENCY',
        entity: recommendation.title,
        reason,
        beforeState: 'Status: PENDING_APPROVAL',
        afterState: 'Status: REJECTED',
        result: 'ABORTED'
      });
    });
    eventBus.emit('ACTION_REJECTED', { recommendation, reason }, { source: 'HUMAN_GOVERNOR', severity: 'WARNING' });
  }
}

export const supplyChainService = new SupplyChainService();
export const scenarioService = new ScenarioService();
export const simulationService = new SimulationService();
export const executionService = new ExecutionService();
