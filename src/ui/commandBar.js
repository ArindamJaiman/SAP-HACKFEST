/**
 * SAP Resilient: Global Command Palette & Fuzzy Search (Section 41 & 42)
 * Supports Ctrl+K / Cmd+K and / shortcuts.
 * Searches: shipments, suppliers, warehouses, products, SKUs, orders, facilities, disruptions, routes, agents.
 * Operational Commands: "Show critical shipments", "Focus Singapore", "Run resilience simulation", "Open approval queue"
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
      <div class="command-palette-box">
        <div class="command-input-row">
          <svg class="search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input type="text" id="command-input" placeholder="Search facilities, shipments, SKUs, or type an operational command..." />
          <span class="esc-badge">ESC to close</span>
        </div>

        <div class="command-results-list" id="command-results">
          <!-- Dynamic filtered search results or default suggestions -->
        </div>
      </div>
    `;

    this.initEvents();
  }

  initKeyboardTrigger() {
    window.addEventListener('keydown', (e) => {
      // Ctrl+K, Cmd+K, or slash when not already in an input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === '/' && !this.isOpen && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
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
    if (!input) return;

    input.addEventListener('input', (e) => {
      this.updateResults(e.target.value.trim());
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = input.value.trim();
        this.executeCommand(query);
        this.close();
      }
    });

    // Initial default suggestions
    this.updateResults('');
  }

  updateResults(query) {
    const resultsContainer = document.getElementById('command-results');
    if (!resultsContainer) return;

    const state = store.getState();
    const { ports, warehouses, suppliers, disruptions, vessels } = state.entities;

    if (!query) {
      // Default Operational Commands
      const defaultCommands = [
        { icon: '⚡', title: 'Start Port Congestion Scenario', category: 'Action', cmd: 'start port congestion scenario' },
        { icon: '🔍', title: 'Show Critical Shipments (> 24h delay)', category: 'Filter', cmd: 'show critical shipments' },
        { icon: '🌏', title: 'Focus Port of Singapore', category: 'Navigation', cmd: 'focus singapore' },
        { icon: '📦', title: 'Find Warehouse WH-17 (Stockout Risk)', category: 'Entity', cmd: 'find warehouse wh-17' },
        { icon: '🛡️', title: 'Show High-Risk Suppliers', category: 'Intelligence', cmd: 'show high-risk suppliers' },
        { icon: '📋', title: 'Open Approval Queue', category: 'Governance', cmd: 'open approval queue' },
        { icon: '🤖', title: 'Show AI Activity Console', category: 'Agents', cmd: 'show ai activity' },
        { icon: '📊', title: 'Run What-If Resilience Simulation', category: 'Simulation', cmd: 'run resilience simulation' }
      ];

      resultsContainer.innerHTML = `
        <div class="results-group-title">COMMAND PALETTE (Section 42)</div>
        ${defaultCommands.map(c => `
          <div class="command-result-item" data-cmd="${c.cmd}">
            <span class="cmd-icon">${c.icon}</span>
            <div class="cmd-info">
              <span class="cmd-title">${c.title}</span>
              <span class="cmd-cat">${c.category}</span>
            </div>
          </div>
        `).join('')}
      `;
    } else {
      const q = query.toLowerCase();
      const matches = [];

      // Search Ports
      ports.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.country.toLowerCase().includes(q)) {
          matches.push({
            type: 'Port',
            title: p.name,
            sub: `${p.country} · Throughput: ${p.throughput}M TEU · Berths: ${p.capacity / 1000}`,
            entity: p
          });
        }
      });

      // Search Warehouses
      warehouses.forEach(w => {
        if (w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q) || w.region.toLowerCase().includes(q)) {
          matches.push({
            type: 'Warehouse',
            title: `${w.name} (${w.id})`,
            sub: `Stock: ${w.currentStock.toLocaleString()} units · Runway: ${w.daysOfCover}d (${w.stockoutRisk})`,
            entity: w
          });
        }
      });

      // Search Suppliers
      suppliers.forEach(s => {
        if (s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) {
          matches.push({
            type: 'Supplier',
            title: s.name,
            sub: `${s.category} · Lead Time: ${s.leadTimeDays}d · Reliability: ${s.reliabilityScore}%`,
            entity: s
          });
        }
      });

      // Search Disruptions
      disruptions.forEach(d => {
        if (d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)) {
          matches.push({
            type: 'Disruption',
            title: d.title,
            sub: `Severity: ${d.severity} · Exposure: $${Math.round(d.estimatedRevenueExposureUSD / 1000000)}M`,
            entity: d
          });
        }
      });

      // Search Vessels
      vessels.slice(0, 50).forEach(v => {
        if (v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q)) {
          matches.push({
            type: 'Vessel',
            title: v.name,
            sub: `Cargo: ${v.cargoTEU} TEU · Speed: ${v.speedKnots} kts · Delay: +${v.delayHours}h`,
            entity: v
          });
        }
      });

      if (matches.length === 0) {
        resultsContainer.innerHTML = `
          <div style="padding: 16px; text-align: center; color: var(--color-neutral); font-size: 12px;">
            No entities matching "<strong>${query}</strong>". Press Enter to submit search command.
          </div>
        `;
      } else {
        resultsContainer.innerHTML = `
          <div class="results-group-title">MATCHING ENTITIES (${matches.length})</div>
          ${matches.slice(0, 10).map((m, idx) => `
            <div class="command-result-item" data-idx="${idx}">
              <span class="entity-type-badge">${m.type}</span>
              <div class="cmd-info">
                <span class="cmd-title">${m.title}</span>
                <span class="cmd-cat">${m.sub}</span>
              </div>
            </div>
          `).join('')}
        `;

        resultsContainer.querySelectorAll('.command-result-item').forEach((item, i) => {
          item.addEventListener('click', () => {
            const m = matches[i];
            if (m && m.entity) {
              store.selectEntity(m.entity);
              store.setActivePage('OVERVIEW');
              if (m.entity.lat && m.entity.lon) {
                window.__appSceneController?.flyToLocation(m.entity.lat, m.entity.lon, 500000);
              }
              this.close();
            }
          });
        });
      }
    }

    // Bind default command clicks
    resultsContainer.querySelectorAll('[data-cmd]').forEach(item => {
      item.addEventListener('click', () => {
        const cmd = item.getAttribute('data-cmd');
        this.executeCommand(cmd);
        this.close();
      });
    });
  }

  executeCommand(rawCmd) {
    const cmd = rawCmd.toLowerCase();

    if (cmd.includes('port congestion') || cmd.includes('singapore') && cmd.includes('scenario')) {
      const disr = store.getState().entities.disruptions[0];
      window.__appOrchestrator?.triggerDisruptionWorkflow(disr);
      store.setActivePage('OVERVIEW');
    } else if (cmd.includes('critical shipment') || cmd.includes('delayed shipment')) {
      store.setActivePage('LOGISTICS');
    } else if (cmd.includes('focus singapore')) {
      store.setActivePage('OVERVIEW');
      window.__appSceneController?.flyToLocation(1.264, 103.840, 650000);
    } else if (cmd.includes('focus india')) {
      store.setActivePage('OVERVIEW');
      window.__appSceneController?.flyToLocation(18.95, 72.95, 2500000);
    } else if (cmd.includes('warehouse wh-17') || cmd.includes('w-17') || cmd.includes('wh-17')) {
      const wh = store.getState().entities.warehouses.find(w => w.id === 'WH-17');
      if (wh) {
        store.selectEntity(wh);
        store.setActivePage('OVERVIEW');
        window.__appSceneController?.flyToLocation(wh.lat, wh.lon, 450000);
      }
    } else if (cmd.includes('supplier')) {
      store.setActivePage('SUPPLIERS');
    } else if (cmd.includes('approval')) {
      store.setActivePage('APPROVALS');
    } else if (cmd.includes('ai activity') || cmd.includes('agent')) {
      store.setActivePage('AGENTS');
    } else if (cmd.includes('resilience') || cmd.includes('what-if') || cmd.includes('simulation')) {
      store.setActivePage('WHAT_IF');
    } else {
      // Default: focus global
      store.setActivePage('OVERVIEW');
      window.__appSceneController?.flyToGlobal();
    }
  }

  open() {
    this.isOpen = true;
    this.modal.style.display = 'block';
    const input = document.getElementById('command-input');
    if (input) {
      input.focus();
      input.value = '';
      this.updateResults('');
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
}
