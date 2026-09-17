/**
 * Specialist Agent 1: SENTINEL (Section 11)
 * Role: Continuous sensing & anomaly detection across global telemetry
 */

import { eventBus } from '../app/events.js';
import { store } from '../app/store.js';

export class SentinelAgent {
  constructor() {
    this.name = 'SENTINEL';
  }

  monitorNetwork() {
    const { ports, shipments } = store.getState().entities;
    // Check ports for severe congestion or closure
    for (const port of ports) {
      if (port.status === 'DISRUPTED' || port.berthUtilization > 90) {
        eventBus.emit('PORT_CONGESTION_DETECTED', {
          portId: port.id,
          portName: port.name,
          berthUtilization: port.berthUtilization,
          vesselQueue: port.vesselQueue,
          customsDelay: port.customsDelay
        }, {
          source: this.name,
          severity: 'CRITICAL',
          affectedEntities: [port.id]
        });

        store.addAgentMessage(this.name, `Detected severe congestion & berth lockdown at ${port.name} (${port.vesselQueue} vessels queued).`, 'sentinel');
        return;
      }
    }
  }

  detectShipmentAnomalies() {
    const { shipments } = store.getState().entities;
    const delayed = shipments.filter(s => s.delayDays > 1.5);
    if (delayed.length > 0) {
      store.addAgentMessage(this.name, `Telemetry scan complete: ${delayed.length} shipments flagged for delivery window breach.`, 'sentinel');
    }
  }
}

export const sentinel = new SentinelAgent();
