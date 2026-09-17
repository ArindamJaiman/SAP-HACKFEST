/**
 * Specialist Agent 6: PROCUREMENT AGENT (Section 11)
 * Role: Identifies alternate qualified suppliers, compares lead-times and cost
 */

import { eventBus } from '../app/events.js';
import { store } from '../app/store.js';

export class ProcurementAgent {
  constructor() {
    this.name = 'PROCUREMENT AGENT';
  }

  findAlternativeSuppliers(disruptedSupplierId) {
    const { suppliers } = store.getState().entities;
    const target = suppliers.find(s => s.id === disruptedSupplierId);
    if (!target) return [];

    const candidates = suppliers.filter(s =>
      s.id !== disruptedSupplierId &&
      s.category === target.category &&
      s.status === 'OPERATIONAL' &&
      s.reliabilityScore >= 80
    );

    candidates.sort((a, b) => b.reliabilityScore - a.reliabilityScore);
    const topCandidates = candidates.slice(0, 3);

    store.addAgentMessage(this.name, `Identified ${topCandidates.length} pre-qualified second-source suppliers for ${target.category}.`, 'sentinel');
    return topCandidates;
  }
}

export const procurementAgent = new ProcurementAgent();
