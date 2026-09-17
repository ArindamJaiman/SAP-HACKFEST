/**
 * SAP Resilient: Central Reactive State Store (Section 37)
 */

import { generateSeedData } from '../data/seedData.js';
import { buildSupplyChainGraph } from '../supply-chain/graph.js';
import { eventBus } from './events.js';

class CentralStore {
  constructor() {
    this.subscribers = new Set();
    this.init();
  }

  init() {
    const rawData = generateSeedData();
    this.graph = buildSupplyChainGraph(rawData);

    this.state = {
      // Raw Persistent World Entities
      entities: {
        ports: rawData.ports,
        suppliers: rawData.suppliers,
        factories: rawData.factories,
        warehouses: rawData.warehouses,
        demandCenters: rawData.demandCenters,
        routes: rawData.routes,
        vessels: rawData.vessels,
        shipments: rawData.shipments,
        disruptions: rawData.disruptions
      },

      // Simulation Clock & Execution State
      simulation: {
        isPlaying: true,
        speedMultiplier: 1, // 1x, 5x, 20x, 100x
        simulationTime: new Date('2026-09-17T08:00:00Z').getTime(),
        activeDisruption: rawData.disruptions[0], // Singapore by default
        activeScenarioId: 'SCENARIO-01',
        activeRecoveryPercent: 0,
        recoveryStatus: 'IDLE', // IDLE | SIMULATING | APPROVED | IN_RECOVERY | RECOVERED
        recoveryStartedAt: null,
      },

      // Operational Layers Visibility
      layers: {
        network: true,
        suppliers: true,
        factories: true,
        ports: true,
        warehouses: true,
        vessels: true,
        shipments: true,
        demand: true,
        inventory: false,
        risk: false,
        disruptions: true,
        aiRoutes: true
      },

      // UI View & Navigation
      ui: {
        viewMode: '3D', // '3D' | '2D' | 'GRAPH'
        selectedEntity: null,
        incidentMode: true,
        activeIncidentTitle: 'PORT OF SINGAPORE DISRUPTION',
        searchQuery: '',
        activeFilter: 'ALL',
        leftPanelCollapsed: false,
        rightDrawerCollapsed: false
      },

      // Human-in-the-Loop Governance
      governance: {
        pendingApproval: null, // Active recommendation awaiting human click
        approvalHistory: [],
        auditLog: []
      },

      // Realtime Agent Stream Log
      agentStream: []
    };

    this.calculateDerivedMetrics();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  notify() {
    for (const listener of this.subscribers) {
      try { listener(this.state); } catch (err) { console.error('[Store Notify Error]', err); }
    }
  }

  setState(updater) {
    if (typeof updater === 'function') {
      updater(this.state);
    } else {
      Object.assign(this.state, updater);
    }
    this.calculateDerivedMetrics();
    this.notify();
  }

  /**
   * Transparent Composite Network Health Model (Section 20)
   */
  calculateDerivedMetrics() {
    const { ports, warehouses, shipments, suppliers, demandCenters, disruptions } = this.state.entities;
    const isRecovery = this.state.simulation.recoveryStatus === 'IN_RECOVERY';
    const recPct = this.state.simulation.activeRecoveryPercent / 100;

    // 1. Resilience Dimension (Port availability & route redundancy)
    const baseResilience = 78;
    const resilienceScore = isRecovery ? Math.round(baseResilience + recPct * 18) : baseResilience;

    // 2. Inventory Dimension (Safety stock levels & stockout runway)
    const atRiskWarehouses = warehouses.filter(w => w.stockoutRisk === 'CRITICAL' || w.stockoutRisk === 'ELEVATED');
    const baseInvScore = 84;
    const inventoryScore = isRecovery ? Math.round(baseInvScore + recPct * 12) : baseInvScore;

    // 3. Transportation Dimension (Vessel delays & route congestion)
    const delayedVessels = shipments.filter(s => s.atRisk).length;
    const baseTransScore = 74;
    const transportScore = isRecovery ? Math.round(baseTransScore + recPct * 22) : baseTransScore;

    // 4. Supplier Risk Dimension
    const baseSupScore = 83;
    const supplierScore = baseSupScore;

    // 5. Demand Stability Dimension
    const baseDemandScore = 86;
    const demandScore = isRecovery ? Math.round(baseDemandScore + recPct * 11) : baseDemandScore;

    // Weighted Composite
    const compositeHealth = Math.round(
      resilienceScore * 0.25 +
      inventoryScore * 0.25 +
      transportScore * 0.20 +
      supplierScore * 0.15 +
      demandScore * 0.15
    );

    // High Level KPIs
    const serviceLevel = isRecovery ? (91.2 + recPct * 7.1).toFixed(1) : '91.2';
    const atRiskShipments = isRecovery ? Math.round(47 - recPct * 35) : 47;
    const atRiskInventoryUSD = isRecovery ? Math.round(142000000 * (1 - recPct * 0.8)) : 142000000;
    const activeDisruptionsCount = disruptions.length;

    this.state.derived = {
      compositeHealth,
      healthBreakdown: {
        resilience: resilienceScore,
        inventory: inventoryScore,
        transportation: transportScore,
        supplier: supplierScore,
        demand: demandScore
      },
      serviceLevel: parseFloat(serviceLevel),
      atRiskShipmentsCount: atRiskShipments,
      revenueAtRiskUSD: atRiskInventoryUSD,
      activeDisruptionsCount,
      onTimeDeliveryRate: isRecovery ? (88.5 + recPct * 9.2).toFixed(1) : '88.5',
      networkUtilization: '86.4%'
    };
  }

  // Quick Action Dispatchers
  selectEntity(entity) {
    this.setState(s => {
      s.ui.selectedEntity = entity;
      s.ui.rightDrawerCollapsed = false;
    });
    eventBus.emit('ENTITY_SELECTED', { entity }, { source: 'USER', severity: 'INFO' });
  }

  toggleLayer(layerKey) {
    this.setState(s => {
      if (s.layers[layerKey] !== undefined) {
        s.layers[layerKey] = !s.layers[layerKey];
      }
    });
  }

  setViewMode(mode) {
    this.setState(s => {
      s.ui.viewMode = mode;
    });
    eventBus.emit('VIEW_MODE_CHANGED', { mode }, { source: 'USER' });
  }

  addAgentMessage(source, text, tag = 'sentinel') {
    const msg = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      source,
      text,
      tag
    };
    this.setState(s => {
      s.agentStream.unshift(msg);
      if (s.agentStream.length > 50) s.agentStream.pop();
    });
  }
}

export const store = new CentralStore();
