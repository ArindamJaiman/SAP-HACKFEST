/**
 * SAP Resilient: Procedural Entity Renderer for Cesium Digital Twin
 * Sections 13, 15, 16, 17, 95:
 * - Dynamic moving vessels with progress interpolation along routes
 * - Procedural facility markers with status glows
 * - 3D Vertical Inventory Columns for warehouses
 * - Pulsing radial shockwaves for disruptions
 */

import * as Cesium from 'cesium';
import { store } from '../app/store.js';
import { interpolateGeodesic } from '../utils/geo.js';

export class EntityRenderer {
  constructor(viewer) {
    this.viewer = viewer;
    this.entityCollections = {
      ports: new Cesium.CustomDataSource('ports'),
      factories: new Cesium.CustomDataSource('factories'),
      suppliers: new Cesium.CustomDataSource('suppliers'),
      warehouses: new Cesium.CustomDataSource('warehouses'),
      inventoryBars: new Cesium.CustomDataSource('inventoryBars'),
      demandCenters: new Cesium.CustomDataSource('demandCenters'),
      vessels: new Cesium.CustomDataSource('vessels'),
      disruptions: new Cesium.CustomDataSource('disruptions')
    };

    // Add all data sources to Cesium viewer
    Object.values(this.entityCollections).forEach(ds => this.viewer.dataSources.add(ds));

    // Cache procedural SVG tactical icons as Data URLs
    this.iconCache = {
      port: this.createSvgIcon('#38bdf8', 'port', 18),
      factory: this.createSvgIcon('#f97316', 'factory', 16),
      supplier: this.createSvgIcon('#f59e0b', 'diamond', 14),
      warehouse: this.createSvgIcon('#3b82f6', 'square', 14),
      demand: this.createSvgIcon('#8b5cf6', 'ring', 14),
      vessel: this.createSvgIcon('#f8fafc', 'triangle', 11),
      vesselDelayed: this.createSvgIcon('#f59e0b', 'triangle', 12),
      disruption: this.createSvgIcon('#ef4444', 'cross', 22)
    };

    this.startTime = Date.now();
  }

  createSvgIcon(color, shape, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');
    const center = size;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 3;
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;

    if (shape === 'port') {
      // Procedural container crane / anchor node
      ctx.beginPath();
      ctx.arc(center, center, size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(center - 1.5, center - size * 0.4, 3, size * 0.8);
      ctx.fillRect(center - size * 0.4, center - 1.5, size * 0.8, 3);
    } else if (shape === 'factory') {
      // Procedural industrial facility
      ctx.fillRect(center - size * 0.7, center - size * 0.5, size * 1.4, size);
      ctx.strokeRect(center - size * 0.7, center - size * 0.5, size * 1.4, size);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(center - size * 0.4, center - size * 0.8, 3, size * 0.4);
      ctx.fillRect(center + size * 0.1, center - size * 0.8, 3, size * 0.4);
    } else if (shape === 'square') {
      const s = size * 1.1;
      ctx.fillRect(center - s / 2, center - s / 2, s, s);
      ctx.strokeRect(center - s / 2, center - s / 2, s, s);
    } else if (shape === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(center, center - size * 0.7);
      ctx.lineTo(center + size * 0.7, center);
      ctx.lineTo(center, center + size * 0.7);
      ctx.lineTo(center - size * 0.7, center);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (shape === 'triangle') {
      // Dynamic heading arrow for moving vessel
      ctx.beginPath();
      ctx.moveTo(center, center - size * 0.8);
      ctx.lineTo(center + size * 0.6, center + size * 0.7);
      ctx.lineTo(center, center + size * 0.4);
      ctx.lineTo(center - size * 0.6, center + size * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (shape === 'cross') {
      ctx.beginPath();
      ctx.arc(center, center, size * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ef4444';
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(center - 2, center - size * 0.5, 4, size * 0.6);
      ctx.fillRect(center - 2, center + size * 0.25, 4, 4);
    } else {
      ctx.beginPath();
      ctx.arc(center, center, size * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    return canvas.toDataURL();
  }

  renderAllEntities(entities) {
    this.renderPorts(entities.ports);
    this.renderFactories(entities.factories);
    this.renderSuppliers(entities.suppliers);
    this.renderWarehouses(entities.warehouses);
    this.renderDemandCenters(entities.demandCenters);
    this.renderMovingVessels(entities.vessels, entities.routes);
    this.renderDisruptions(entities.disruptions);
  }

  renderPorts(ports) {
    const ds = this.entityCollections.ports.entities;
    ds.removeAll();
    ports.forEach(p => {
      const isDisrupted = p.id === 'PORT-SIN';
      ds.add({
        id: p.id,
        name: p.name,
        position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 500),
        billboard: {
          image: isDisrupted ? this.iconCache.disruption : this.iconCache.port,
          scale: isDisrupted ? 1.3 : 1.0,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 25000000)
        },
        label: {
          text: p.name.replace('Port of ', 'PORT '),
          font: '10px "Inter", sans-serif',
          fillColor: isDisrupted ? Cesium.Color.fromCssColorString('#ef4444') : Cesium.Color.fromCssColorString('#38bdf8'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -14),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6000000)
        },
        properties: p
      });
    });
  }

  renderFactories(factories) {
    const ds = this.entityCollections.factories.entities;
    ds.removeAll();
    factories.forEach(f => {
      ds.add({
        id: f.id,
        name: f.name,
        position: Cesium.Cartesian3.fromDegrees(f.lon, f.lat, 200),
        billboard: {
          image: this.iconCache.factory,
          scale: 0.9,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12000000)
        },
        properties: f
      });
    });
  }

  renderSuppliers(suppliers) {
    const ds = this.entityCollections.suppliers.entities;
    ds.removeAll();
    suppliers.forEach(s => {
      ds.add({
        id: s.id,
        name: s.name,
        position: Cesium.Cartesian3.fromDegrees(s.lon, s.lat, 100),
        billboard: {
          image: this.iconCache.supplier,
          scale: 0.75,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6000000) // LOD culling
        },
        properties: s
      });
    });
  }

  renderWarehouses(warehouses) {
    const ds = this.entityCollections.warehouses.entities;
    const barDs = this.entityCollections.inventoryBars.entities;
    ds.removeAll();
    barDs.removeAll();

    warehouses.forEach(w => {
      const isCritical = w.stockoutRisk === 'CRITICAL';
      ds.add({
        id: w.id,
        name: w.name,
        position: Cesium.Cartesian3.fromDegrees(w.lon, w.lat, 200),
        billboard: {
          image: this.iconCache.warehouse,
          scale: isCritical ? 1.2 : 0.85,
          color: isCritical ? Cesium.Color.fromCssColorString('#ef4444') : Cesium.Color.WHITE,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000000)
        },
        properties: w
      });

      // Section 95: 3D Vertical Inventory Columns for Warehouses
      const colHeight = Math.max(15000, Math.min(180000, w.daysOfCover * 5000));
      barDs.add({
        id: `INV-COL-${w.id}`,
        name: `${w.name} Inventory Runway`,
        position: Cesium.Cartesian3.fromDegrees(w.lon, w.lat, colHeight / 2),
        cylinder: {
          length: colHeight,
          topRadius: 6000,
          bottomRadius: 6000,
          material: isCritical
            ? new Cesium.Color(0.93, 0.26, 0.26, 0.6)
            : new Cesium.Color(0.23, 0.51, 0.96, 0.4),
          outline: true,
          outlineColor: isCritical
            ? Cesium.Color.fromCssColorString('#ef4444')
            : Cesium.Color.fromCssColorString('#38bdf8'),
          outlineWidth: 1.0
        }
      });
    });
  }

  renderDemandCenters(demands) {
    const ds = this.entityCollections.demandCenters.entities;
    ds.removeAll();
    demands.forEach(d => {
      ds.add({
        id: d.id,
        name: d.name,
        position: Cesium.Cartesian3.fromDegrees(d.lon, d.lat, 200),
        billboard: {
          image: this.iconCache.demand,
          scale: 0.9,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 18000000)
        },
        properties: d
      });
    });
  }

  /**
   * Section 13: Moving Vehicles driven by normalized progress (0 -> 1)
   */
  renderMovingVessels(vessels, routes) {
    const ds = this.entityCollections.vessels.entities;
    ds.removeAll();

    const routesMap = new Map();
    routes.forEach(r => routesMap.set(r.id, r));

    vessels.forEach((v, idx) => {
      const route = routesMap.get(v.routeId) || routes[idx % routes.length];
      const initialProgress = (idx * 0.03 + (v.lat + 90) / 180) % 1.0;
      const speedMultiplier = 1.0 + (idx % 3) * 0.2;
      const isDelayed = v.delayHours > 24;

      // Realtime Dynamic Position via CallbackProperty
      const dynamicPosition = new Cesium.CallbackProperty(() => {
        const state = store.getState();
        const simSpeed = state.simulation.isPlaying ? (state.simulation.speedMultiplier || 1) : 0;
        const now = Date.now();
        const elapsedSec = ((now - this.startTime) / 1000) * simSpeed;

        // One complete loop every 120 simulated seconds
        const currentProgress = (initialProgress + (elapsedSec / 120) * speedMultiplier) % 1.0;
        const geoPt = interpolateGeodesic(
          route.originLat,
          route.originLon,
          route.destLat,
          route.destLon,
          currentProgress
        );
        return geoPt.cartesian;
      }, false);

      ds.add({
        id: v.id,
        name: v.name,
        position: dynamicPosition,
        billboard: {
          image: isDelayed ? this.iconCache.vesselDelayed : this.iconCache.vessel,
          scale: isDelayed ? 0.9 : 0.75,
          color: isDelayed ? Cesium.Color.fromCssColorString('#f59e0b') : Cesium.Color.fromCssColorString('#00f0ff'),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000)
        },
        properties: v
      });
    });
  }

  /**
   * Section 17: Disruption radial impact zone with pulsing perimeter
   */
  renderDisruptions(disruptions) {
    const ds = this.entityCollections.disruptions.entities;
    ds.removeAll();
    disruptions.forEach(disr => {
      ds.add({
        id: `CIRCLE-${disr.id}`,
        name: `Impact Zone: ${disr.title}`,
        position: Cesium.Cartesian3.fromDegrees(disr.lon, disr.lat),
        ellipse: {
          semiMajorAxis: disr.radiusKm * 1000,
          semiMinorAxis: disr.radiusKm * 1000,
          material: new Cesium.Color(0.93, 0.26, 0.26, 0.25),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#ef4444'),
          outlineWidth: 2
        },
        properties: disr
      });
    });
  }

  updateLayerVisibility(layerKey, isVisible) {
    if (this.entityCollections[layerKey]) {
      this.entityCollections[layerKey].show = isVisible;
    }
    // Also toggle inventory bars when inventory layer is checked
    if (layerKey === 'inventory' && this.entityCollections.inventoryBars) {
      this.entityCollections.inventoryBars.show = isVisible;
    }
  }
}
