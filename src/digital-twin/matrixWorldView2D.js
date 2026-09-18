/**
 * SAP Resilient: 2D Dotted Matrix World Visualization
 * Implements the exact aesthetic requested by the user:
 * - Deep tactical charcoal space background (#070a12)
 * - Dotted matrix / stippled particle world continents
 * - Radiant pulsing red disruption beacons / flare hotspots with white-hot cores
 * - Natural geographical aspect ratio and smooth offscreen rendering
 * - Interactive supply chain workflow, tooltips, and click-to-inspect
 */

import { store } from '../app/store.js';
import worldDotsData from '../data/worldDotMatrix.json';

export class MatrixWorldView2D {
  constructor(containerId = 'matrix-world-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'matrix-world-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.cursor = 'crosshair';

    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Offscreen canvas for cached continent dots (zero runtime lag, 60fps solid)
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');

    this.dots = worldDotsData; // 7,109 normalized [x, y] coordinates
    this.isActive = false;
    this.animationFrameId = null;

    // Hotspot beacons matching the user's reference image
    this.beacons = [
      { id: 'BEACON-USA', name: 'US Industrial Logistics Corridor', lat: 39.5, lon: -89.0, severity: 'CRITICAL', exposure: '$82M', status: 'CRITICAL', shipments: 28, phase: 0 },
      { id: 'BEACON-EUR', name: 'Western European Gateway (Rotterdam-Rhine)', lat: 49.5, lon: 4.5, severity: 'CRITICAL', exposure: '$110M', status: 'CRITICAL', shipments: 34, phase: 1.2 },
      { id: 'BEACON-RUS', name: 'Northern Eurasian Transit Corridor', lat: 58.0, lon: 48.0, severity: 'CRITICAL', exposure: '$45M', status: 'CRITICAL', shipments: 19, phase: 2.4 },
      { id: 'BEACON-CASIA', name: 'Central Asia Intermodal Hub', lat: 46.0, lon: 68.0, severity: 'CRITICAL', exposure: '$38M', status: 'CRITICAL', shipments: 14, phase: 3.1 },
      { id: 'BEACON-EASIA', name: 'East Asia Mega-Cluster (Shanghai / Hsinchu)', lat: 31.5, lon: 118.0, severity: 'CRITICAL', exposure: '$210M', status: 'CRITICAL', shipments: 52, phase: 4.0 },
      { id: 'BEACON-HORN', name: 'Red Sea / Bab el-Mandeb Chokepoint', lat: 10.0, lon: 43.0, severity: 'CRITICAL', exposure: '$98M', status: 'CRITICAL', shipments: 38, phase: 0.8 },
      { id: 'BEACON-SAF', name: 'Southern Africa Industrial Hub (Santos-Durban)', lat: -27.0, lon: 27.5, severity: 'CRITICAL', exposure: '$41M', status: 'CRITICAL', shipments: 16, phase: 2.1 },
      { id: 'PORT-SIN', name: 'Port of Singapore (PSA Global Hub)', lat: 1.264, lon: 103.840, severity: 'CRITICAL', exposure: '$142M', status: 'CRITICAL', shipments: 47, phase: 1.5, isFlagship: true }
    ];

    // Inter-hub supply chain flow routes
    this.flows = [
      { from: 'BEACON-USA', to: 'BEACON-EUR', progress: 0.2 },
      { from: 'BEACON-EUR', to: 'BEACON-HORN', progress: 0.6 },
      { from: 'BEACON-HORN', to: 'PORT-SIN', progress: 0.4 },
      { from: 'PORT-SIN', to: 'BEACON-EASIA', progress: 0.8 },
      { from: 'BEACON-CASIA', to: 'BEACON-EASIA', progress: 0.3 },
      { from: 'BEACON-RUS', to: 'BEACON-CASIA', progress: 0.7 },
      { from: 'BEACON-HORN', to: 'BEACON-SAF', progress: 0.5 }
    ];

    this.hoveredBeacon = null;
    this.mouse = { x: -1000, y: -1000 };

    this.initEvents();
    this.handleResize();
  }

  initEvents() {
    window.addEventListener('resize', () => {
      if (this.isActive) this.handleResize();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      let found = null;
      for (const b of this.beacons) {
        const pt = this.geoToScreen(b.lat, b.lon);
        const dist = Math.hypot(this.mouse.x - pt.x, this.mouse.y - pt.y);
        if (dist < 34) {
          found = b;
          break;
        }
      }
      this.hoveredBeacon = found;
      this.canvas.style.cursor = found ? 'pointer' : 'crosshair';
    });

    this.canvas.addEventListener('click', () => {
      if (this.hoveredBeacon) {
        const state = store.getState();
        if (this.hoveredBeacon.isFlagship) {
          const disr = state.entities.disruptions[0];
          if (disr) store.selectEntity(disr);
        } else {
          store.selectEntity({
            id: this.hoveredBeacon.id,
            name: this.hoveredBeacon.name,
            type: 'DISRUPTION_HOTSPOT',
            severity: this.hoveredBeacon.severity,
            exposure: this.hoveredBeacon.exposure,
            status: this.hoveredBeacon.status,
            shipmentsCount: this.hoveredBeacon.shipments,
            summary: `Active logistics constraint detected at ${this.hoveredBeacon.name}. Regional supply chain buffers degraded.`
          });
        }
      }
    });
  }

  handleResize() {
    this.dpr = window.devicePixelRatio || 1;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Natural geographic aspect ratio preserved (360 lon / 140 lat = ~2.57)
    // Centered with aesthetic margins
    const targetAspect = 2.45;
    const maxAvailableWidth = this.width * 0.94;
    const maxAvailableHeight = this.height * 0.82;

    let mapW = maxAvailableWidth;
    let mapH = mapW / targetAspect;

    if (mapH > maxAvailableHeight) {
      mapH = maxAvailableHeight;
      mapW = mapH * targetAspect;
    }

    this.mapWidth = mapW;
    this.mapHeight = mapH;
    this.mapPaddingX = (this.width - this.mapWidth) / 2;
    // Position vertically balanced with slight clearance for top header
    this.mapPaddingY = (this.height - this.mapHeight) / 2 + 12;

    // Re-render cached static continent dots to offscreen canvas
    this.renderOffscreenDots();
  }

  renderOffscreenDots() {
    this.offscreenCanvas.width = this.width * this.dpr;
    this.offscreenCanvas.height = this.height * this.dpr;
    this.offscreenCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const ctx = this.offscreenCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Dotted Matrix Continents - Muted cyan-slate stippling matching image
    ctx.fillStyle = 'rgba(74, 95, 122, 0.72)';
    const dotRadius = this.width > 1400 ? 1.7 : 1.35;

    ctx.beginPath();
    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i];
      const px = this.mapPaddingX + d[0] * this.mapWidth;
      const py = this.mapPaddingY + d[1] * this.mapHeight;

      ctx.moveTo(px + dotRadius, py);
      ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  geoToScreen(lat, lon) {
    const normX = (lon + 180) / 360;
    const normY = (82 - lat) / 140;
    return {
      x: this.mapPaddingX + normX * this.mapWidth,
      y: this.mapPaddingY + normY * this.mapHeight
    };
  }

  activate() {
    this.isActive = true;
    this.container.classList.add('active');
    this.container.style.display = 'block';
    this.handleResize();
    this.startLoop();
  }

  deactivate() {
    this.isActive = false;
    this.container.classList.remove('active');
    this.container.style.display = 'none';
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  startLoop() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    const renderLoop = (time) => {
      if (!this.isActive) return;
      this.draw(time);
      this.animationFrameId = requestAnimationFrame(renderLoop);
    };
    this.animationFrameId = requestAnimationFrame(renderLoop);
  }

  draw(time) {
    const ctx = this.ctx;
    const t = time * 0.001;
    const state = store.getState();
    const isRecovery = state.simulation.recoveryStatus === 'IN_RECOVERY' || state.simulation.recoveryStatus === 'RECOVERED';
    const recPct = state.simulation.activeRecoveryPercent / 100;

    // 1. Deep tactical dark charcoal space background matching image
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle ambient vignette
    const bgGlow = ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.45, this.width * 0.05,
      this.width * 0.5, this.height * 0.45, this.width * 0.8
    );
    bgGlow.addColorStop(0, 'rgba(15, 25, 45, 0.45)');
    bgGlow.addColorStop(1, 'rgba(8, 12, 20, 0.96)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Draw Cached Dotted Matrix World Continents
    ctx.drawImage(this.offscreenCanvas, 0, 0, this.width, this.height);

    // 3. Render Inter-Hub Supply Chain Curved Arcs
    ctx.save();
    for (const flow of this.flows) {
      const b1 = this.beacons.find(b => b.id === flow.from);
      const b2 = this.beacons.find(b => b.id === flow.to);
      if (!b1 || !b2) continue;

      const p1 = this.geoToScreen(b1.lat, b1.lon);
      const p2 = this.geoToScreen(b2.lat, b2.lon);

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2 - Math.abs(p2.x - p1.x) * 0.12;

      // Base arc
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
      ctx.strokeStyle = 'rgba(255, 60, 80, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Moving photon flow packet along arc
      const simSpeed = state.simulation.isPlaying ? (state.simulation.speedMultiplier || 1) : 0;
      flow.progress = (flow.progress + 0.003 * simSpeed) % 1.0;

      const q = flow.progress;
      const curX = (1 - q) * (1 - q) * p1.x + 2 * (1 - q) * q * midX + q * q * p2.x;
      const curY = (1 - q) * (1 - q) * p1.y + 2 * (1 - q) * q * midY + q * q * p2.y;

      ctx.beginPath();
      ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4d6d';
      ctx.shadowColor = '#ff2a4b';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 4. Render the Radiant Glowing Red Flare Beacons (Matching user image!)
    for (const beacon of this.beacons) {
      const pt = this.geoToScreen(beacon.lat, beacon.lon);
      const isHovered = this.hoveredBeacon && this.hoveredBeacon.id === beacon.id;

      // Singapore turns green on recovery
      const isSin = beacon.isFlagship;
      const inRecovery = isSin && isRecovery;

      // Harmonic pulse animation
      const pulseSpeed = 3.2;
      const pulse = 1.0 + 0.22 * Math.sin(t * pulseSpeed + beacon.phase);
      const hoverBoost = isHovered ? 1.35 : 1.0;

      const outerRadius = 42 * pulse * hoverBoost;
      const midRadius = 18 * pulse * hoverBoost;
      const coreRadius = isHovered ? 7.0 : 5.2;

      // Color mapping
      let rGlow = inRecovery ? Math.round(255 - recPct * 200) : 255;
      let gGlow = inRecovery ? Math.round(30 + recPct * 200) : 30;
      let bGlow = inRecovery ? Math.round(50 + recPct * 80) : 50;

      ctx.save();
      // Screen blend mode makes overlapping flares bloom intensely
      ctx.globalCompositeOperation = 'screen';

      // A. Outer Diffuse Radiant Flare Halo
      const flareGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, outerRadius);
      flareGrad.addColorStop(0, `rgba(${rGlow}, ${gGlow}, ${bGlow}, 0.85)`);
      flareGrad.addColorStop(0.25, `rgba(${rGlow}, ${gGlow}, ${bGlow}, 0.50)`);
      flareGrad.addColorStop(0.65, `rgba(${rGlow}, ${gGlow}, ${bGlow}, 0.16)`);
      flareGrad.addColorStop(1, `rgba(${rGlow}, ${gGlow}, ${bGlow}, 0.0)`);

      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, outerRadius, 0, Math.PI * 2);
      ctx.fill();

      // B. Concentric expanding shockwave ripple ring
      const ringProg = ((t * 0.8 + beacon.phase) % 1.5) / 1.5;
      const ringRadius = 14 + ringProg * 40;
      const ringAlpha = Math.max(0, (1 - ringProg) * 0.65);

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rGlow}, ${gGlow}, ${bGlow}, ${ringAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // C. Intense Mid-Glow
      const midGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, midRadius);
      midGrad.addColorStop(0, `rgba(255, 255, 255, 0.95)`);
      midGrad.addColorStop(0.35, `rgba(${rGlow}, ${gGlow}, ${bGlow}, 0.88)`);
      midGrad.addColorStop(1, `rgba(${rGlow}, ${gGlow}, ${bGlow}, 0.0)`);

      ctx.fillStyle = midGrad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, midRadius, 0, Math.PI * 2);
      ctx.fill();

      // D. Brilliant White-Hot Center Core
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowColor = `rgb(${rGlow}, ${gGlow}, ${bGlow})`;
      ctx.shadowBlur = 14;
      ctx.fillStyle = inRecovery && recPct > 0.8 ? '#10b981' : '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Tooltip on Hover
    if (this.hoveredBeacon) {
      this.drawTooltip(this.hoveredBeacon);
    }
  }

  drawTooltip(beacon) {
    const ctx = this.ctx;
    const pt = this.geoToScreen(beacon.lat, beacon.lon);

    const title = beacon.name;
    const sub1 = `Severity: ${beacon.severity} · Exposure: ${beacon.exposure}`;
    const sub2 = `Inbound Delayed Shipments: ${beacon.shipments} Vessels`;
    const hint = `Click to inspect in Tactical Drawer ➔`;

    ctx.font = 'bold 11px Inter, sans-serif';
    const textW = Math.max(
      ctx.measureText(title).width,
      ctx.measureText(sub1).width,
      ctx.measureText(sub2).width,
      ctx.measureText(hint).width
    );

    const boxW = textW + 24;
    const boxH = 76;
    let boxX = pt.x + 16;
    let boxY = pt.y - boxH / 2;

    if (boxX + boxW > this.width - 20) boxX = pt.x - boxW - 16;
    if (boxY < 20) boxY = 20;

    // Tooltip Card Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // Tooltip Content
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`● ${title}`, boxX + 12, boxY + 18);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(sub1, boxX + 12, boxY + 36);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(sub2, boxX + 12, boxY + 52);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'italic 9px Inter, sans-serif';
    ctx.fillText(hint, boxX + 12, boxY + 68);
  }
}
