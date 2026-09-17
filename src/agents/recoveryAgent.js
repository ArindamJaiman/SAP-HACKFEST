/**
 * Specialist Agent 8: RECOVERY AGENT (Section 11 & Section 41)
 * Role: Tracks real-time network recovery velocity, ETA restoration & restabilization
 */

import { eventBus } from '../app/events.js';
import { store } from '../app/store.js';

export class RecoveryAgent {
  constructor() {
    this.name = 'RECOVERY AGENT';
    this.intervalId = null;
    this.initListeners();
  }

  initListeners() {
    eventBus.on('HUMAN_APPROVED_ACTION', (evt) => {
      this.beginRecoveryTracking(evt.payload.recommendation, evt.correlationId);
    });
  }

  beginRecoveryTracking(recommendation, correlationId) {
    store.setState(s => {
      s.simulation.recoveryStatus = 'IN_RECOVERY';
      s.simulation.activeRecoveryPercent = 5;
      s.simulation.recoveryStartedAt = Date.now();
    });

    store.addAgentMessage(this.name, `Human approval verified. Executing automated recovery protocol for "${recommendation.title}".`, 'governor');

    if (this.intervalId) clearInterval(this.intervalId);

    // Simulate progressive network stabilization curve
    this.intervalId = setInterval(() => {
      const currPct = store.getState().simulation.activeRecoveryPercent;
      if (currPct >= 100) {
        clearInterval(this.intervalId);
        store.setState(s => {
          s.simulation.recoveryStatus = 'RECOVERED';
          s.simulation.activeRecoveryPercent = 100;
          s.ui.incidentMode = false;
        });

        store.addAgentMessage(this.name, `Recovery 100% complete. Global network health restored to 94/100. Service level: 98.3%.`, 'governor');

        eventBus.emit('RECOVERY_COMPLETE', {
          recommendationId: recommendation.id,
          finalHealth: 94,
          finalServiceLevel: 98.3
        }, {
          source: this.name,
          severity: 'INFO',
          correlationId
        });
        return;
      }

      const nextPct = Math.min(100, currPct + 5);
      store.setState(s => {
        s.simulation.activeRecoveryPercent = nextPct;
      });

      if (nextPct === 50) {
        store.addAgentMessage(this.name, `Recovery progress 50%: 24/47 vessels successfully rerouted; warehouse buffer restabilized.`, 'governor');
      }
    }, 1200);
  }

  resetRecovery() {
    if (this.intervalId) clearInterval(this.intervalId);
    store.setState(s => {
      s.simulation.recoveryStatus = 'IDLE';
      s.simulation.activeRecoveryPercent = 0;
      s.simulation.recoveryStartedAt = null;
    });
  }
}

export const recoveryAgent = new RecoveryAgent();
