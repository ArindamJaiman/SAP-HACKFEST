/**
 * SAP Resilient: 2D Network Graph View (Section 35)
 * Synchronized topological DAG view connecting Suppliers -> Factories -> Ports -> Warehouses -> Demand
 */

import { store } from '../app/store.js';

export class NetworkGraphView {
  constructor(containerId = 'network-graph-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.nodes = [];
    this.links = [];
    this.selectedNodeId = null;
    this.hoveredNodeId = null;

    this.panX = 60;
    this.panY = 60;
    this.scale = 1.0;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    this.initCanvasResize();
    this.initInteraction();
  }

  initCanvasResize() {
    const resize = () => {
      this.canvas.width = this.container.clientWidth;
      this.canvas.height = this.container.clientHeight;
      this.render();
    };
    window.addEventListener('resize', resize);
    resize();
  }

  buildGraphData() {
    const { suppliers, factories, ports, warehouses, demandCenters } = store.getState().entities;
    this.nodes = [];
    this.links = [];

    // Columnar Layer Layout
    // Layer 0: Suppliers
    // Layer 1: Factories
    // Layer 2: Ports
    // Layer 3: Warehouses
    // Layer 4: Demand Centers
    const layers = [
      { type: 'SUPPLIER', items: suppliers.slice(0, 16), color: '#ffaa00', x: 100 },
      { type: 'FACTORY', items: factories.slice(0, 10), color: '#ff6600', x: 340 },
      { type: 'PORT', items: ports.slice(0, 10), color: '#00f0ff', x: 580 },
      { type: 'WAREHOUSE', items: warehouses.slice(0, 12), color: '#2d7dff', x: 820 },
      { type: 'DEMAND', items: demandCenters.slice(0, 10), color: '#b34eff', x: 1060 }
    ];

    const height = Math.max(800, this.canvas.height - 120);

    layers.forEach(col => {
      const spacing = height / (col.items.length + 1);
      col.items.forEach((item, idx) => {
        this.nodes.push({
          id: item.id,
          name: item.name,
          type: col.type,
          color: col.color,
          x: col.x,
          y: 60 + (idx + 1) * spacing,
          radius: col.type === 'PORT' ? 12 : (col.type === 'FACTORY' ? 10 : 8),
          raw: item
        });
      });
    });

    // Synthesize topological links between layers
    const suppliersNodes = this.nodes.filter(n => n.type === 'SUPPLIER');
    const factoriesNodes = this.nodes.filter(n => n.type === 'FACTORY');
    const portsNodes = this.nodes.filter(n => n.type === 'PORT');
    const warehousesNodes = this.nodes.filter(n => n.type === 'WAREHOUSE');
    const demandNodes = this.nodes.filter(n => n.type === 'DEMAND');

    // Supplier -> Factory
    factoriesNodes.forEach((fac, fIdx) => {
      const s1 = suppliersNodes[fIdx % suppliersNodes.length];
      const s2 = suppliersNodes[(fIdx + 1) % suppliersNodes.length];
      this.links.push({ from: s1, to: fac });
      this.links.push({ from: s2, to: fac });
    });

    // Factory -> Port
    factoriesNodes.forEach((fac, fIdx) => {
      const p = portsNodes[fIdx % portsNodes.length];
      this.links.push({ from: fac, to: p });
    });

    // Port -> Warehouse
    warehousesNodes.forEach((wh, wIdx) => {
      const p = portsNodes[wIdx % portsNodes.length];
      const isDisrupted = p.id === 'PORT-SIN';
      this.links.push({ from: p, to: wh, isDisrupted });
    });

    // Warehouse -> Demand
    demandNodes.forEach((dm, dIdx) => {
      const wh = warehousesNodes[dIdx % warehousesNodes.length];
      this.links.push({ from: wh, to: dm });
    });
  }

  initInteraction() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };

      const rect = this.canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left - this.panX) / this.scale;
      const clickY = (e.clientY - rect.top - this.panY) / this.scale;

      const hit = this.nodes.find(n => {
        const dx = n.x - clickX;
        const dy = n.y - clickY;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
      });

      if (hit) {
        this.selectedNodeId = hit.id;
        store.selectEntity(hit.raw);
      } else {
        this.selectedNodeId = null;
      }
      this.render();
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.panX += e.clientX - this.lastMouse.x;
        this.panY += e.clientY - this.lastMouse.y;
        this.lastMouse = { x: e.clientX, y: e.clientY };
        this.render();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.scale = Math.max(0.4, Math.min(2.5, this.scale * zoomFactor));
      this.render();
    });
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Layer Column Headers
    const headers = [
      { text: 'SUPPLIERS', x: 100 },
      { text: 'FACTORIES', x: 340 },
      { text: 'PORTS & HUBS', x: 580 },
      { text: 'WAREHOUSES', x: 820 },
      { text: 'DEMAND MARKETS', x: 1060 }
    ];
    ctx.font = '10px "Chakra Petch", sans-serif';
    ctx.fillStyle = '#7890a8';
    headers.forEach(hdr => {
      ctx.fillText(hdr.text, hdr.x - 30, 30);
    });

    // Draw Links
    this.links.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l.from.x, l.from.y);
      // Bezier S-curve
      const midX = (l.from.x + l.to.x) / 2;
      ctx.bezierCurveTo(midX, l.from.y, midX, l.to.y, l.to.x, l.to.y);

      if (l.isDisrupted) {
        ctx.strokeStyle = 'rgba(255, 42, 75, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
      } else {
        ctx.strokeStyle = 'rgba(70, 100, 140, 0.28)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([]);
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw Nodes
    this.nodes.forEach(n => {
      const isSelected = n.id === this.selectedNodeId;
      ctx.beginPath();
      ctx.arc(n.x, n.y, isSelected ? n.radius + 4 : n.radius, 0, Math.PI * 2);
      ctx.fillStyle = n.id === 'PORT-SIN' ? '#ff2a4b' : n.color;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = isSelected ? 16 : 6;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isSelected ? 2.5 : 1.0;
      ctx.stroke();

      // Label
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText(n.id, n.x + n.radius + 6, n.y + 3);
    });

    ctx.restore();
  }

  activate() {
    this.container.classList.add('active');
    this.buildGraphData();
    this.render();
  }

  deactivate() {
    this.container.classList.remove('active');
  }
}
