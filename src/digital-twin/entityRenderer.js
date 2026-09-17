/**
 * SAP Resilient: Entity Renderer for Cesium Digital Twin (Section 7)
 * Renders procedural billboards, status rings, and semantic tactical markers.
 */

import * as Cesium from 'cesium';
import { store } from '../app/store.js';

export class EntityRenderer {
  constructor(viewer) {
    this.viewer = viewer;
    this.entityCollections = {
      ports: new Cesium.CustomDataSource('ports'),
      factories: new Cesium.CustomDataSource('factories'),
      suppliers: new Cesium.CustomDataSource('suppliers'),
      warehouses: new Cesium.CustomDataSource('warehouses'),
      demandCenters: new Cesium.CustomDataSource('demandCenters'),
      vessels: new Cesium.CustomDataSource('vessels'),
      disruptions: new Cesium.CustomDataSource('disruptions')
    };

    // Add all data sources to viewer
    Object.values(this.entityCollections).forEach(ds => this.viewer.dataSources.add(ds));

    // Cache procedural icons as Data URLs
    this.iconCache = {
      port: this.createSvgIcon('#00f0ff', 'circle', 20),
      factory: this.createSvgIcon('#ffaa00', 'rect', 18),
      supplier: this.createSvgIcon('#e6a100', 'diamond', 14),
      warehouse: this.createSvgIcon('#2d7dff', 'square', 16),
      demand: this.createSvgIcon('#b34eff', 'ring', 16),
      vessel: this.createSvgIcon('#ffffff', 'triangle', 12),
      disruption: this.createSvgIcon('#ff2a4b', 'cross', 26)
    };
  }

  createSvgIcon(color, shape, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d');
    const center = size;

    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(center, center, size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (shape === 'square') {
      const s = size * 1.1;
      ctx.fillRect(center - s/2, center - s/2, s, s);
      ctx.strokeRect(center - s/2, center - s/2, s, s);
    } else if (shape === 'rect') {
      ctx.fillRect(center - size*0.7, center - size*0.5, size*1.4, size);
      ctx.strokeRect(center - size*0.7, center - size*0.5, size*1.4, size);
    } else if (shape === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(center, center - size*0.7);
      ctx.lineTo(center + size*0.7, center);
      ctx.lineTo(center, center + size*0.7);
      ctx.lineTo(center - size*0.7, center);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (shape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(center, center - size*0.8);
      ctx.lineTo(center + size*0.6, center + size*0.7);
      ctx.lineTo(center - size*0.6, center + size*0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (shape === 'cross') {
      ctx.beginPath();
      ctx.arc(center, center, size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 42, 75, 0.35)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ff2a4b';
      ctx.stroke();
      // Inner exclamation
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(center - 2, center - size * 0.45, 4, size * 0.5);
      ctx.fillRect(center - 2, center + size * 0.25, 4, 4);
    } else {
      ctx.beginPath();
      ctx.arc(center, center, size * 0.6, 0, Math.PI * 2);
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
    this.renderVessels(entities.vessels);
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
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000000)
        },
        label: {
          text: p.name.replace('Port of ', 'PORT '),
          font: '10px "Chakra Petch", sans-serif',
          fillColor: isDisrupted ? Cesium.Color.fromCssColorString('#ff2a4b') : Cesium.Color.fromCssColorString('#00f0ff'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -14),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4500000)
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
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 10000000)
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
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000) // LOD culling
        },
        properties: s
      });
    });
  }

  renderWarehouses(warehouses) {
    const ds = this.entityCollections.warehouses.entities;
    ds.removeAll();
    warehouses.forEach(w => {
      const isCritical = w.stockoutRisk === 'CRITICAL';
      ds.add({
        id: w.id,
        name: w.name,
        position: Cesium.Cartesian3.fromDegrees(w.lon, w.lat, 200),
        billboard: {
          image: this.iconCache.warehouse,
          scale: isCritical ? 1.2 : 0.85,
          color: isCritical ? Cesium.Color.fromCssColorString('#ff2a4b') : Cesium.Color.WHITE,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000)
        },
        properties: w
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
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000)
        },
        properties: d
      });
    });
  }

  renderVessels(vessels) {
    const ds = this.entityCollections.vessels.entities;
    ds.removeAll();
    vessels.forEach(v => {
      const isDelayed = v.delayHours > 24;
      ds.add({
        id: v.id,
        name: v.name,
        position: Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 50),
        billboard: {
          image: this.iconCache.vessel,
          scale: isDelayed ? 0.9 : 0.75,
          color: isDelayed ? Cesium.Color.fromCssColorString('#ff6600') : Cesium.Color.fromCssColorString('#00f0ff'),
          rotation: Math.random() * Math.PI * 2,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12000000)
        },
        properties: v
      });
    });
  }

  renderDisruptions(disruptions) {
    const ds = this.entityCollections.disruptions.entities;
    ds.removeAll();
    disruptions.forEach(disr => {
      // Draw spatial shockwave circle
      ds.add({
        id: `CIRCLE-${disr.id}`,
        position: Cesium.Cartesian3.fromDegrees(disr.lon, disr.lat),
        ellipse: {
          semiMajorAxis: disr.radiusKm * 1000,
          semiMinorAxis: disr.radiusKm * 1000,
          material: new Cesium.Color(1.0, 0.16, 0.29, 0.22),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#ff2a4b'),
          outlineWidth: 2
        }
      });
    });
  }

  updateLayerVisibility(layerKey, isVisible) {
    if (this.entityCollections[layerKey]) {
      this.entityCollections[layerKey].show = isVisible;
    }
  }
}
