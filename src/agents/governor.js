/**
 * Specialist Agent 9: GOVERNOR (Section 11, 14, 15)
 * Role: Supervisory governance, policy tier gating, and Human Approval Card generation
 */

import { eventBus } from '../app/events.js';
import { store } from '../app/store.js';
import { complianceAgent } from './complianceAgent.js';

export class GovernorAgent {
  constructor() {
    this.name = 'GOVERNOR';
    this.initListeners();
  }

  initListeners() {
    eventBus.on('SCENARIOS_OPTIMIZED', (evt) => {
      this.evaluateGovernancePolicy(evt.payload.recommendedScenario, evt.correlationId);
    });
  }

  evaluateGovernancePolicy(topScenario, correlationId) {
    // 1. Verify compliance
    const complianceResult = complianceAgent.validateAction(topScenario);
    if (!complianceResult.compliant) {
      store.addAgentMessage(this.name, `Action "${topScenario.title}" blocked by compliance constraints.`, 'governor');
      return;
    }

    // 2. Determine approval policy threshold (Section 15)
    let approvalTier = 'OPERATIONS_MANAGER';
    let requiresHumanApproval = true;

    if (topScenario.estimatedCostUSD < 25000) {
      approvalTier = 'AUTO_EXECUTE';
      requiresHumanApproval = false;
    } else if (topScenario.estimatedCostUSD <= 100000) {
      approvalTier = 'OPERATIONS_SUPERVISOR';
      requiresHumanApproval = true;
    } else if (topScenario.estimatedCostUSD <= 500000) {
      approvalTier = 'OPERATIONS_MANAGER';
      requiresHumanApproval = true;
    } else {
      approvalTier = 'EXECUTIVE_DIRECTOR';
      requiresHumanApproval = true;
    }

    const recommendation = {
      id: `REC-${Date.now()}`,
      actionTitle: topScenario.title,
      summary: topScenario.description,
      why: 'Avoiding a 4.8-day Singapore terminal freeze to protect downstream assembly schedules at FAC-04 and prevent stockouts at WH-17.',
      expectedBenefit: 'Avoid 4.1 days of demurrage and line stoppage',
      incrementalCostUSD: topScenario.estimatedCostUSD,
      serviceLevelImpact: '91.2% ➔ 98.1%',
      etaImpact: '+0.7 days (vs +4.8 unmitigated)',
      inventoryImpact: 'WH-17 safety-stock breach averted',
      carbonImpactKg: topScenario.carbonDeltaKg,
      risk: topScenario.risk,
      confidence: Math.round(topScenario.confidence * 100),
      approvalLevel: approvalTier,
      reversibility: 'HIGH (Can be revoked within 6 hours)',
      assumptions: [
        'Port Klang berth allocation confirmed via maritime EDI API',
        'Customs transit corridor operational across Johor-Singapore Causeway',
        'Secondary truck drayage capacity secured'
      ],
      affectedEntities: ['PORT-SIN', 'PORT-KLG', 'WH-17', 'FAC-04']
    };

    if (requiresHumanApproval) {
      store.setState(s => {
        s.governance.pendingApproval = recommendation;
      });

      store.addAgentMessage(this.name, `Supervisory review complete: Cost ($${topScenario.estimatedCostUSD.toLocaleString()}) requires ${approvalTier} approval. Awaiting human authorization.`, 'governor');

      eventBus.emit('APPROVAL_REQUESTED', { recommendation }, {
        source: this.name,
        severity: 'HIGH',
        correlationId,
        affectedEntities: recommendation.affectedEntities
      });
    } else {
      // Auto-execute low-impact
      store.addAgentMessage(this.name, `Auto-execution permitted for low-impact policy threshold (<$25k).`, 'governor');
      this.executeApprovedAction(recommendation, 'SYSTEM_AUTO_POLICY', correlationId);
    }

    return recommendation;
  }

  executeApprovedAction(recommendation, approver = 'OPERATIONS_MANAGER', correlationId) {
    store.setState(s => {
      s.governance.pendingApproval = null;
      s.governance.approvalHistory.unshift({
        ...recommendation,
        approvedBy: approver,
        approvedAt: new Date().toISOString()
      });
      s.governance.auditLog.unshift({
        timestamp: new Date().toISOString(),
        actor: approver,
        action: 'APPROVED_RECOMMENDATION',
        target: recommendation.actionTitle,
        cost: recommendation.incrementalCostUSD
      });
    });

    eventBus.emit('HUMAN_APPROVED_ACTION', {
      recommendation,
      approver
    }, {
      source: 'HUMAN_GOVERNANCE',
      severity: 'INFO',
      correlationId
    });
  }

  rejectAction(recommendation, reason = 'Operator preference') {
    store.setState(s => {
      s.governance.pendingApproval = null;
      s.governance.auditLog.unshift({
        timestamp: new Date().toISOString(),
        actor: 'OPERATOR',
        action: 'REJECTED_RECOMMENDATION',
        target: recommendation.actionTitle,
        reason
      });
    });
    store.addAgentMessage(this.name, `Recommendation "${recommendation.actionTitle}" rejected by operator: ${reason}.`, 'governor');
  }
}

export const governor = new GovernorAgent();
