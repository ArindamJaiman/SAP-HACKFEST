/**
 * SAP Resilient: Disruption Propagation Overlay (Section 10)
 * Visualizes animated multi-hop causal arcs from the disruption epicenter
 */

import * as Cesium from 'cesium';

export class PropagationOverlay {
  constructor(viewer) {
    this.viewer = viewer;
    this.dataSource = new Cesium.CustomDataSource('propagationArcs');
    this.viewer.dataSources.add(this.dataSource);
  }

  renderCausalArcs(epicenterCoord, targetNodes = []) {
    const ds = this.dataSource.entities;
    ds.removeAll();

    targetNodes.forEach((node, idx) => {
      // Elevated parabolic Bezier-like arc between epicenter and affected node
      const midLon = (epicenterCoord.lon + node.lon) / 2;
      const midLat = (epicenterCoord.lat + node.lat) / 2;
      const arcHeight = 120000 + idx * 30000;

      ds.add({
        id: `PROPAGATION-ARC-${node.id}`,
        name: `Cascade ➔ ${node.name}`,
        polyline: {
          positions: [
            Cesium.Cartesian3.fromDegrees(epicenterCoord.lon, epicenterCoord.lat, 1000),
            Cesium.Cartesian3.fromDegrees(midLon, midLat, arcHeight),
            Cesium.Cartesian3.fromDegrees(node.lon, node.lat, 1000)
          ],
          width: 3.0,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString('#ff2a4b')
          }),
          arcType: Cesium.ArcType.NONE
        }
      });
    });
  }

  clear() {
    this.dataSource.entities.removeAll();
  }
}
