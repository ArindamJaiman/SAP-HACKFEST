/**
 * SAP Resilient: Bottom Dock & Simulation Timeline Controls (Section 17 & Section 41)
 */

import { store } from '../app/store.js';

export class TimelineControls {
  constructor(containerId = 'bottom-dock') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
    store.subscribe(() => this.update());
  }

  render() {
    this.container.innerHTML = `
      <!-- Playback Controls -->
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="display:flex; align-items:center; gap:4px;">
          <button class="btn-tactical cyan" id="btn-play-pause" style="padding:4px 10px;">
            <span id="icon-play-pause">❚❚ PAUSE</span>
          </button>
          <button class="btn-tactical" id="btn-step-forward" style="padding:4px 8px; border:1px solid var(--border-subtle);">
            ▶| STEP
          </button>
        </div>

        <div class="segmented-control">
          <button class="segmented-btn active" data-speed="1">1X</button>
          <button class="segmented-btn" data-speed="5">5X</button>
          <button class="segmented-btn" data-speed="20">20X</button>
          <button class="segmented-btn" data-speed="100">100X</button>
        </div>

        <div style="display:flex; flex-direction:column; font-family:var(--font-mono); font-size:10px; line-height:1.2;">
          <span style="color:var(--color-text-muted);">SIM CLOCK: <strong style="color:var(--color-cyan);" id="sim-clock-display">2026-09-17 08:42:15 UTC</strong></span>
          <span style="color:var(--color-text-dim);">REAL TIME: <span id="real-clock-display">LIVE SYNC</span></span>
        </div>
      </div>

      <!-- Recovery Progress Meter (Section 41) -->
      <div style="display:flex; align-items:center; gap:14px; min-width:440px;" id="recovery-meter-cluster">
        <div style="display:flex; flex-direction:column; width:100%;">
          <div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:10px; margin-bottom:3px;">
            <span style="color:var(--color-cyan); font-weight:700;">NETWORK RECOVERY VELOCITY</span>
            <span id="recovery-percent-val" style="color:var(--color-white); font-weight:700;">0%</span>
          </div>
          <div style="width:100%; height:8px; background:rgba(6,12,20,0.8); border:1px solid var(--border-subtle); border-radius:4px; overflow:hidden;">
            <div id="recovery-progress-bar" style="width:0%; height:100%; background:linear-gradient(90deg, #00f0ff 0%, #00e676 100%); transition:width 0.4s ease;"></div>
          </div>
        </div>
      </div>

      <!-- Quick Reset & Framing -->
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="btn-tactical cyan" id="btn-reset-globe">
          RESET GLOBE [0]
        </button>
      </div>
    `;

    this.initEvents();
  }

  initEvents() {
    const playBtn = document.getElementById('btn-play-pause');
    const playIcon = document.getElementById('icon-play-pause');
    playBtn.addEventListener('click', () => {
      const isPlaying = store.getState().simulation.isPlaying;
      store.setState(s => { s.simulation.isPlaying = !isPlaying; });
      playIcon.textContent = !isPlaying ? '❚❚ PAUSE' : '▶ PLAY';
    });

    this.container.querySelectorAll('[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('[data-speed]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseInt(btn.getAttribute('data-speed'), 10);
        store.setState(s => { s.simulation.speedMultiplier = speed; });
      });
    });

    const resetGlobeBtn = document.getElementById('btn-reset-globe');
    resetGlobeBtn.addEventListener('click', () => {
      window.__appSceneController?.resetGlobeView();
    });

    // Realtime clock ticker
    setInterval(() => {
      const d = new Date();
      const realEl = document.getElementById('real-clock-display');
      if (realEl) realEl.textContent = d.toISOString().substr(11, 8) + ' UTC';
    }, 1000);
  }

  update() {
    const sim = store.getState().simulation;
    const bar = document.getElementById('recovery-progress-bar');
    const val = document.getElementById('recovery-percent-val');
    if (bar && val) {
      bar.style.width = `${sim.activeRecoveryPercent}%`;
      val.textContent = `${sim.activeRecoveryPercent}%`;
    }
  }
}
