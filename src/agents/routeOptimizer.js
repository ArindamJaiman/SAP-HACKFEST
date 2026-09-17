/**
 * Specialist Agent 4: ROUTE OPTIMIZER (Section 11 & Section 45)
 * Role: Evaluates multi-objective trade-offs (Cost, ETA, Risk, Carbon)
 */

import { eventBus } from '../app/events.js';
import { store } from '../app/store.js';

export class RouteOptimizerAgent {
  constructor() {
    this.name = 'ROUTE OPTIMIZER';
    // Default weights for balanced optimization
    this.weights = {
      cost: 0.25,
      eta: 0.35,
      risk: 0.25,
      carbon: 0.15
    };
    this.initListeners();
  }

  setWeights(priorityMode = 'BALANCED') {
    switch (priorityMode) {
      case 'MINIMIZE_COST':
        this.weights = { cost: 0.55, eta: 0.20, risk: 0.15, carbon: 0.10 };
        break;
      case 'MINIMIZE_DELAY':
        this.weights = { cost: 0.15, eta: 0.60, risk: 0.15, carbon: 0.10 };
        break;
      case 'MINIMIZE_RISK':
        this.weights = { cost: 0.20, eta: 0.20, risk: 0.50, carbon: 0.10 };
        break;
      case 'MINIMIZE_CARBON':
        this.weights = { cost: 0.20, eta: 0.15, risk: 0.15, carbon: 0.50 };
        break;
      case 'BALANCED':
      default:
        this.weights = { cost: 0.25, eta: 0.35, risk: 0.25, carbon: 0.15 };
        break;
    }
  }

  initListeners() {
    eventBus.on('SCENARIOS_GENERATED', (evt) => {
      this.optimizeScenarios(evt.payload.candidateScenarios, evt.correlationId);
    });
  }

  optimizeScenarios(scenarios, correlationId) {
    const scoredScenarios = scenarios.map(scen => {
      // Normalize metrics (0 to 1 scale, lower is better)
      const costNorm = Math.min(1, scen.estimatedCostUSD / 2500000);
      const etaNorm = Math.max(0, Math.min(1, (scen.delayDeltaDays + 2) / 7));
      const riskScoreMap = { LOW: 0.2, MEDIUM: 0.5, HIGH: 0.8, CRITICAL: 1.0 };
      const riskNorm = riskScoreMap[scen.risk] || 0.5;
      const carbonNorm = Math.min(1, Math.max(0, scen.carbonDeltaKg / 40000));

      // Weighted multi-objective composite score (lower is superior)
      const compositePenalty = (
        this.weights.cost * costNorm +
        this.weights.eta * etaNorm +
        this.weights.risk * riskNorm +
        this.weights.carbon * carbonNorm
      );

      const suitabilityScore = Math.round((1 - compositePenalty) * 100);

      return {
        ...scen,
        suitabilityScore,
        normalizedTradeoffs: {
          costNorm: Math.round(costNorm * 100),
          etaNorm: Math.round(etaNorm * 100),
          riskNorm: Math.round(riskNorm * 100),
          carbonNorm: Math.round(carbonNorm * 100)
        }
      };
    });

    // Sort descending by suitability score
    scoredScenarios.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    const topScenario = scoredScenarios[0];
    store.addAgentMessage(this.name, `Multi-objective evaluation finished. Top candidate: "${topScenario.title}" (Score: ${topScenario.suitabilityScore}/100).`, 'route');

    eventBus.emit('SCENARIOS_OPTIMIZED', {
      scoredScenarios,
      recommendedScenario: topScenario,
      activeWeights: this.weights
    }, {
      source: this.name,
      severity: 'INFO',
      correlationId
    });

    return scoredScenarios;
  }
}

export const routeOptimizer = new RouteOptimizerAgent();
