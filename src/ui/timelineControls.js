/**
 * SAP Resilient: Bottom Dock & Simulation Timeline Controls
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
          <button class="btn-tactical primary" id="btn-play-pause" style="padding:4px 12px;">
            <span id="icon-play-pause">❚❚ Pause</span>
          </button>
          <button class="btn-tactical" id="btn-step-forward" style="padding:4px 8px; border:1px solid var(--border-medium); color:var(--color-neutral);">
            ▶| Step
          </button>
        </div>

        <div class="segmented-control">
          <button class="segmented-btn active" data-speed="1">1x</button>
          <button class="segmented-btn" data-speed="5">5x</button>
          <button class="segmented-btn" data-speed="20">20x</button>
          <button class="segmented-btn" data-speed="100">100x</button>
        </div>

        <div style="display:flex; align-items:center; gap:8px; font-family:var(--font-mono); font-size:11px; margin-left:6px;">
          <span style="color:var(--color-neutral);">Sim Time: <strong style="color:var(--color-primary-light);" id="sim-clock-display">2026-09-17 08:42 UTC</strong></span>
          <span style="color:var(--color-text-dim);">|</span>
          <span style="color:var(--color-text-dim);">UTC: <span id="real-clock-display">LIVE</span></span>
        </div>
      </div>

      <!-- Recovery Progress Meter -->
      <div style="display:flex; align-items:center; gap:12px; min-width:400px;" id="recovery-meter-cluster">
        <div style="display:flex; flex-direction:column; width:100%;">
          <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:3px;">
            <span style="color:var(--color-neutral); font-weight:500;">Contingency Execution Velocity</span>
            <span id="recovery-percent-val" style="color:var(--color-text-main); font-family:var(--font-mono); font-weight:600;">0%</span>
          </div>
          <div style="width:100%; height:6px; background:rgba(30,41,59,0.6); border:1px solid var(--border-subtle); border-radius:3px; overflow:hidden;">
            <div id="recovery-progress-bar" style="width:0%; height:100%; background:#10b981; transition:width 0.4s ease;"></div>
          </div>
        </div>
      </div>

      <!-- Quick Reset & Framing -->
      <div style="display:flex; align-items:center; gap:8px;">
        <button class="btn-tactical" id="btn-reset-globe" style="border:1px solid var(--border-medium); color:var(--color-neutral);">
          Reset View [0]
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
      playIcon.textContent = !isPlaying ? '❚❚ Pause' : '▶ Play';
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
      if (realEl) realEl.textContent = d.toISOString().substr(11, 8);
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
