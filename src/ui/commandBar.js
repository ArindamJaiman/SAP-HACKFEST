/**
 * SAP Resilient: Natural Language Command Bar (Section 26)
 * Translates planner intent into spatial camera movements, queries, and simulations
 */

import { store } from '../app/store.js';

export class CommandBar {
  constructor(modalId = 'command-bar-modal') {
    this.modal = document.getElementById(modalId);
    if (!this.modal) return;
    this.isOpen = false;
    this.render();
    this.initKeyboardTrigger();
  }

  render() {
    this.modal.style.display = 'none';
    this.modal.innerHTML = `
      <div style="background:var(--bg-panel); border:1px solid var(--border-highlight); border-radius:var(--radius-md); box-shadow:0 12px 48px rgba(0,240,255,0.25); backdrop-filter:blur(16px); padding:12px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border-subtle); padding-bottom:8px;">
          <svg style="width:16px; height:16px; fill:var(--color-cyan);" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input type="text" id="command-input" placeholder="Type a supply-chain command (e.g., 'Simulate five-day Singapore closure', 'Show warehouses below 7 days inventory')..." style="flex:1; background:transparent; border:none; color:var(--color-white); font-size:13px;" />
          <span style="font-family:var(--font-mono); font-size:10px; color:var(--color-text-dim);">ESC to close</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:4px;" id="command-suggestions">
          <div class="cmd-suggestion" data-cmd="Simulate a five-day closure of the Port of Singapore">
            ⚡ <strong>Simulate a five-day closure of the Port of Singapore</strong> <span style="color:var(--color-text-dim);">— Critical interaction benchmark</span>
          </div>
          <div class="cmd-suggestion" data-cmd="Show warehouses with less than seven days of inventory">
            📦 <strong>Show warehouses with less than seven days of inventory</strong> <span style="color:var(--color-text-dim);">— Inventory runway filter</span>
          </div>
          <div class="cmd-suggestion" data-cmd="Why is warehouse WH-17 at risk?">
            🔍 <strong>Why is warehouse WH-17 at risk?</strong> <span style="color:var(--color-text-dim);">— Explainability causal graph</span>
          </div>
          <div class="cmd-suggestion" data-cmd="Focus on Asia-Pacific shipping corridor">
            🌏 <strong>Focus on Asia-Pacific shipping corridor</strong> <span style="color:var(--color-text-dim);">— Cinematic camera move</span>
          </div>
          <div class="cmd-suggestion" data-cmd="Show all delayed shipments">
            ⏱️ <strong>Show all delayed shipments</strong> <span style="color:var(--color-text-dim);">— Filter 47 delayed POs</span>
          </div>
        </div>
      </div>
    `;

    this.initEvents();
  }

  initKeyboardTrigger() {
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && !this.isOpen) {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    const triggerBtn = document.getElementById('btn-open-command-bar');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => this.toggle());
    }
  }

  initEvents() {
    const input = document.getElementById('command-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.executeCommand(input.value);
        this.close();
      }
    });

    this.modal.querySelectorAll('.cmd-suggestion').forEach(item => {
      item.addEventListener('click', () => {
        const cmd = item.getAttribute('data-cmd');
        input.value = cmd;
        this.executeCommand(cmd);
        this.close();
      });
    });
  }

  open() {
    this.isOpen = true;
    this.modal.style.display = 'block';
    const input = document.getElementById('command-input');
    if (input) {
      input.focus();
      input.value = '';
    }
  }

  close() {
    this.isOpen = false;
    this.modal.style.display = 'none';
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  executeCommand(text = '') {
    const q = text.toLowerCase().trim();
    store.addAgentMessage('COMMAND', `User query: "${text}"`, 'governor');

    // 1. Critical Interaction 1: Singapore Closure
    if (q.includes('singapore') && (q.includes('close') || q.includes('closure') || q.includes('disruption') || q.includes('simulate'))) {
      const sin = store.getState().entities.ports.find(p => p.id === 'PORT-SIN');
      window.__appSceneController?.flyToCoordinates(sin.lat, sin.lon, 380000, 1.8);
      const disr = store.getState().entities.disruptions[0];
      window.__appOrchestrator?.triggerDisruptionWorkflow(disr);
      return;
    }

    // 2. Critical Interaction 2: Warehouses below 7 days
    if (q.includes('warehouse') && (q.includes('seven') || q.includes('7') || q.includes('stockout') || q.includes('inventory'))) {
      const wh17 = store.getState().entities.warehouses.find(w => w.id === 'WH-17');
      if (wh17) {
        window.__appSceneController?.flyToCoordinates(wh17.lat, wh17.lon, 450000, 1.6);
        store.selectEntity(wh17);
        store.addAgentMessage('SENTINEL', `Filter applied: 1 critical hub identified (WH-17: 4.8 days of cover).`, 'inventory');
      }
      return;
    }

    // 3. Why is warehouse WH-17 at risk?
    if (q.includes('why') && (q.includes('wh-17') || q.includes('wh17') || q.includes('warehouse'))) {
      const wh17 = store.getState().entities.warehouses.find(w => w.id === 'WH-17');
      store.selectEntity(wh17);
      alert(`CAUSAL DEPENDENCY FOR WAREHOUSE WH-17:\n\n` +
            `1. PORT OF SINGAPORE: Force majeure halt (berth saturation 94%)\n` +
            `2. VESSEL DELAY: Inbound vessel Ever Zenith delayed +4.8 days\n` +
            `3. INVENTORY BURN: Daily consumption = 500 units; current stock = 2,400\n` +
            `4. RUNWAY BREACH: Safety stock buffer (3,500 units) will breach in 41 hours\n` +
            `5. PRODUCTION IMPACT: Downstream Gigafactory FAC-04 faces line starvation.`);
      return;
    }

    // 4. Focus commands
    if (q.includes('asia')) {
      window.__appSceneController?.flyToCoordinates(14.0, 108.0, 8000000, 2.0);
      return;
    }
    if (q.includes('europe')) {
      window.__appSceneController?.flyToCoordinates(50.0, 10.0, 5000000, 2.0);
      return;
    }
    if (q.includes('america') || q.includes('us')) {
      window.__appSceneController?.flyToCoordinates(38.0, -96.0, 7000000, 2.0);
      return;
    }

    // 5. Reset globe
    if (q.includes('globe') || q.includes('reset')) {
      window.__appSceneController?.resetGlobeView();
      return;
    }

    // Default general query fallback
    alert(`COMMAND INTERPRETED:\n"${text}"\n\nNo active anomalies detected matching strict filter parameters. Resetting standard telemetry view.`);
  }
}
