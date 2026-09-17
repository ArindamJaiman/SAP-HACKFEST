/**
 * SAP Resilient: Event Bus & Structured Telemetry Stream (Section 12)
 */

export class AgentEventBus {
  constructor() {
    this.listeners = new Map(); // eventType -> Set of callbacks
    this.eventHistory = [];
    this.maxHistory = 1000;
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    return () => this.off(eventType, callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  emit(eventType, payload = {}, options = {}) {
    const event = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventType,
      source: options.source || 'SYSTEM',
      severity: options.severity || 'INFO', // INFO | WARNING | HIGH | CRITICAL
      correlationId: options.correlationId || `CORR-${Date.now()}`,
      previousEventId: options.previousEventId || null,
      affectedEntities: options.affectedEntities || [],
      payload
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.pop();
    }

    // Call specific listeners
    if (this.listeners.has(eventType)) {
      for (const cb of this.listeners.get(eventType)) {
        try { cb(event); } catch (err) { console.error(`[EventBus Error: ${eventType}]`, err); }
      }
    }

    // Call wildcard listeners
    if (this.listeners.has('*')) {
      for (const cb of this.listeners.get('*')) {
        try { cb(event); } catch (err) { console.error('[EventBus Wildcard Error]', err); }
      }
    }

    return event;
  }

  getHistory(limit = 100) {
    return this.eventHistory.slice(0, limit);
  }

  clear() {
    this.eventHistory = [];
  }
}

export const eventBus = new AgentEventBus();
