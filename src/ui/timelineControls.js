/**
 * SAP Resilient: Global Simulation Time Controller (Section 22)
 * Controls: Play, Pause, Rewind, Step, Speeds (1x, 2x, 5x, 10x, 24x), Timeline scrubber, Jump to Event
 * Clock drives movement, delay accumulation, and dynamic KPI restabilization.
 */

import { store } from '../app/store.js';
import { eventBus } from '../app/events.js';

export class TimelineControls {
  constructor(containerId = 'bottom-dock') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.simBaseTime = new Date('2026-09-17T08:00:00Z').getTime();
    this.elapsedSimSeconds = 0;
    this.timer = null;

    this.render();
    store.subscribe(() => this.update());
    this.startSimulationClock();
  }

  startSimulationClock() {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      const state = store.getState();
      if (!state.simulation.isPlaying) return;

      const multiplier = state.simulation.speedMultiplier || 1;
      // Advance by multiplier * 60 simulated seconds per real second (1s real = 1m sim at 1x)
      this.elapsedSimSeconds += multiplier * 20;

      const currentSimTime = this.simBaseTime + this.elapsedSimSeconds * 1000;
      const simDate = new Date(currentSimTime);

      const clockEl = document.getElementById('sim-clock-display');
      if (clockEl) {
        clockEl.textContent = `${simDate.toISOString().slice(0, 10)} ${simDate.toISOString().slice(11, 19)} UTC`;
      }

      const scrubber = document.getElementById('timeline-scrubber');
      if (scrubber) {
        // Scrubber maps 0 to 86400 seconds (24h)
        const dayProgress = (this.elapsedSimSeconds % 86400) / 864;
        scrubber.value = Math.min(100, Math.max(0, dayProgress));
      }

      // If in recovery, advance recovery percent smoothly
      if (state.simulation.recoveryStatus === 'IN_RECOVERY') {
        let rec = state.simulation.activeRecoveryPercent;
        if (rec < 100) {
          rec = Math.min(100, rec + 0.4 * multiplier);
          store.setState(s => {
            s.simulation.activeRecoveryPercent = rec;
            if (rec >= 100) {
              s.simulation.recoveryStatus = 'RECOVERED';
              s.governance.auditLog.unshift({
                timestamp: new Date().toLocaleTimeString(),
                actor: 'AI RECOVERY AGENT',
                agent: 'RECOVERY AGENT',
                action: 'INCIDENT FULLY RESOLVED',
                entity: 'PORT-SIN Corridor',
                reason: 'All 47 delayed shipments safely berthed at Port Klang feeder; SLA restored to 98.3%',
                beforeState: 'Status: IN_RECOVERY',
                afterState: 'Status: RECOVERED · Normal Operations Restored',
                result: 'COMPLETE'
              });
            }
          });
        }
      }
    }, 250);
  }

  render() {
    const state = store.getState();
    const isPlaying = state.simulation.isPlaying;
    const speed = state.simulation.speedMultiplier || 1;

    this.container.innerHTML = `
      <!-- Playback Controls (Section 22) -->
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="display:flex; align-items:center; gap:4px;">
          <button class="btn-tactical outline-subtle" id="btn-time-rewind" title="Rewind 1 Hour">
            ⏮
          </button>
          <button class="btn-tactical primary" id="btn-play-pause" style="padding:4px 12px; min-width:80px;">
            <span id="icon-play-pause">${isPlaying ? '❚❚ Pause' : '▶ Play'}</span>
          </button>
          <button class="btn-tactical outline-subtle" id="btn-step-forward" title="Step Forward 1 Hour">
            ⏭
          </button>
        </div>

        <!-- Speed Segmented Control: 1x, 2x, 5x, 10x, 24x -->
        <div class="segmented-control mini">
          <button class="segmented-btn ${speed === 1 ? 'active' : ''}" data-speed="1">1x</button>
          <button class="segmented-btn ${speed === 2 ? 'active' : ''}" data-speed="2">2x</button>
          <button class="segmented-btn ${speed === 5 ? 'active' : ''}" data-speed="5">5x</button>
          <button class="segmented-btn ${speed === 10 ? 'active' : ''}" data-speed="10">10x</button>
          <button class="segmented-btn ${speed === 24 ? 'active' : ''}" data-speed="24">24x</button>
        </div>

        <!-- Simulated Supply Chain Clock -->
        <div style="display:flex; align-items:center; gap:6px; font-family:var(--font-mono); font-size:11px;">
          <span style="color:var(--color-neutral);">Sim Time:</span>
          <strong style="color:#38bdf8;" id="sim-clock-display">2026-09-17 08:00:00 UTC</strong>
        </div>
      </div>

      <!-- Center Timeline Scrubber -->
      <div style="display:flex; align-items:center; gap:12px; flex:1; max-width:480px; margin:0 16px;">
        <span style="font-size:10px; color:var(--color-neutral); font-family:var(--font-mono);">00:00</span>
        <input type="range" id="timeline-scrubber" min="0" max="100" value="33" style="flex:1; accent-color:#00f0ff; height:4px; cursor:pointer;" />
        <span style="font-size:10px; color:var(--color-neutral); font-family:var(--font-mono);">24:00</span>
      </div>

      <!-- Right: Recovery Execution Velocity Meter & Jump to Event -->
      <div style="display:flex; align-items:center; gap:12px;">
        <button class="btn-tactical outline-subtle" id="btn-jump-event" title="Jump directly to Singapore disruption event">
          ⚡ Jump to Event
        </button>

        <div style="display:flex; flex-direction:column; width:180px;">
          <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:2px;">
            <span style="color:var(--color-neutral);">Recovery Velocity</span>
            <span id="recovery-percent-val" style="color:var(--color-text-main); font-family:var(--font-mono); font-weight:700;">
              ${Math.round(state.simulation.activeRecoveryPercent)}%
            </span>
          </div>
          <div style="width:100%; height:5px; background:rgba(30,41,59,0.7); border:1px solid var(--border-subtle); border-radius:3px; overflow:hidden;">
            <div id="recovery-progress-bar" style="width:${state.simulation.activeRecoveryPercent}%; height:100%; background:#10b981; transition:width 0.25s linear;"></div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const playBtn = document.getElementById('btn-play-pause');
    const playIcon = document.getElementById('icon-play-pause');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const isPlaying = !store.getState().simulation.isPlaying;
        store.setState(s => { s.simulation.isPlaying = isPlaying; });
        if (playIcon) playIcon.textContent = isPlaying ? '❚❚ Pause' : '▶ Play';
      });
    }

    const btnRewind = document.getElementById('btn-time-rewind');
    if (btnRewind) {
      btnRewind.addEventListener('click', () => {
        this.elapsedSimSeconds = Math.max(0, this.elapsedSimSeconds - 3600);
      });
    }

    const btnForward = document.getElementById('btn-step-forward');
    if (btnForward) {
      btnForward.addEventListener('click', () => {
        this.elapsedSimSeconds += 3600;
      });
    }

    // Speed buttons
    this.container.querySelectorAll('[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('[data-speed]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const spd = parseInt(btn.getAttribute('data-speed'), 10);
        store.setState(s => { s.simulation.speedMultiplier = spd; });
      });
    });

    // Scrubber scrubbing
    const scrubber = document.getElementById('timeline-scrubber');
    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.elapsedSimSeconds = (val / 100) * 86400;
      });
    }

    // Jump to event
    const jumpBtn = document.getElementById('btn-jump-event');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        const sinPort = store.getState().entities.ports.find(p => p.id === 'PORT-SIN');
        if (sinPort) {
          store.selectEntity(sinPort);
          window.__appSceneController?.flyToLocation(sinPort.lat, sinPort.lon, 650000);
        }
      });
    }
  }

  update() {
    const sim = store.getState().simulation;
    const bar = document.getElementById('recovery-progress-bar');
    const val = document.getElementById('recovery-percent-val');
    if (bar) bar.style.width = `${sim.activeRecoveryPercent}%`;
    if (val) val.textContent = `${Math.round(sim.activeRecoveryPercent)}%`;

    const playIcon = document.getElementById('icon-play-pause');
    if (playIcon) {
      playIcon.textContent = sim.isPlaying ? '❚❚ Pause' : '▶ Play';
    }
  }
}
