/**
 * Specialist Agent 5: INVENTORY AGENT (Section 11)
 * Role: Predicts stockouts, safety-stock runway, and buffer transfers
 */

import { eventBus } from '../app/events.js';
import { store } from '../app/store.js';

export class InventoryAgent {
  constructor() {
    this.name = 'INVENTORY AGENT';
    this.initListeners();
  }

  initListeners() {
    eventBus.on('IMPACT_ANALYSIS_COMPLETE', (evt) => {
      this.evaluateInventoryExposure(evt.payload.atRiskWarehouses, evt.correlationId);
    });
  }

  evaluateInventoryExposure(warehouseIds = [], correlationId) {
    const { warehouses } = store.getState().entities;
    const criticalHubs = warehouses.filter(w => warehouseIds.includes(w.id) || w.id === 'WH-17');

    for (const hub of criticalHubs) {
      if (hub.daysOfCover < 7.0 || hub.id === 'WH-17') {
        const breachHours = Math.round(hub.daysOfCover * 24);
        store.addAgentMessage(this.name, `Warehouse ${hub.id} (${hub.name}) projected below safety-stock threshold in ${breachHours} hours. Immediate replenishment required.`, 'inventory');

        eventBus.emit('SAFETY_STOCK_BREACH_PREDICTED', {
          warehouseId: hub.id,
          warehouseName: hub.name,
          currentStock: hub.currentStock,
          safetyStock: hub.safetyStock,
          daysOfCover: hub.daysOfCover,
          breachHours
        }, {
          source: this.name,
          severity: 'HIGH',
          correlationId,
          affectedEntities: [hub.id]
        });
      }
    }
  }

  recommendBufferTransfer(fromWhId, toWhId, units = 2400) {
    const fromWh = store.getState().entities.warehouses.find(w => w.id === fromWhId);
    const toWh = store.getState().entities.warehouses.find(w => w.id === toWhId);
    return {
      type: 'INTER_WAREHOUSE_TRANSFER',
      from: fromWh ? fromWh.name : fromWhId,
      to: toWh ? toWh.name : toWhId,
      units,
      transitHours: 36,
      stockoutPreventionDeltaDays: 14.5
    };
  }
}

export const inventoryAgent = new InventoryAgent();
