/**
 * SAP Resilient: Real-time Specialist Agent Activity Feed (Section 13)
 */

import { store } from '../app/store.js';

export class AgentFeedBox {
  constructor(containerId = 'agent-feed-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
    store.subscribe(() => this.update());
  }

  render() {
    this.container.innerHTML = `
      <div class="agent-feed-box">
        <div class="agent-feed-header">
          <span>AI SPECIALIST ORCHESTRATION</span>
          <span style="font-size:9px; color:var(--color-text-dim);">LIVE TELEMETRY BUS</span>
        </div>
        <div class="agent-feed-list" id="agent-feed-items">
          <!-- Messages will be injected here -->
        </div>
      </div>
    `;
    this.update();
  }

  update() {
    const list = document.getElementById('agent-feed-items');
    if (!list) return;

    const messages = store.getState().agentStream;
    if (messages.length === 0) {
      list.innerHTML = `<div style="font-size:10px; color:var(--color-text-dim); text-align:center; padding:10px;">Agents standing by...</div>`;
      return;
    }

    list.innerHTML = messages.map(msg => `
      <div class="agent-msg-row">
        <span class="agent-timestamp">${msg.timestamp}</span>
        <span class="agent-tag ${msg.tag}">${msg.source}</span>
        <span style="color:var(--color-white);">${msg.text}</span>
      </div>
    `).join('');
  }
}
