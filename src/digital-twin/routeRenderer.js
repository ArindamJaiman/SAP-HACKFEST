/**
 * SAP Resilient: Route Renderer (Section 23)
 * Renders great-circle lanes, animated shipping flow polylines, and candidate reroutes
 */

import * as Cesium from 'cesium';

export class RouteRenderer {
  constructor(viewer) {
    this.viewer = viewer;
    this.routeDataSource = new Cesium.CustomDataSource('shippingRoutes');
    this.viewer.dataSources.add(this.routeDataSource);
  }

  renderRoutes(routes, highlightedRouteIds = []) {
    const ds = this.routeDataSource.entities;
    ds.removeAll();

    routes.forEach(route => {
      const isHighlighted = highlightedRouteIds.includes(route.id);
      const isDisrupted = route.status === 'CONGESTED_WARNING';

      let strokeColor = Cesium.Color.fromCssColorString('#00f0ff').withAlpha(0.28);
      let strokeWidth = 1.5;

      if (isDisrupted) {
        strokeColor = Cesium.Color.fromCssColorString('#ff6600').withAlpha(0.65);
        strokeWidth = 2.5;
      } else if (isHighlighted) {
        strokeColor = Cesium.Color.fromCssColorString('#b34eff').withAlpha(0.9);
        strokeWidth = 3.5;
      }

      ds.add({
        id: route.id,
        name: route.name,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            route.originLon, route.originLat,
            route.destLon, route.destLat
          ]),
          width: strokeWidth,
          material: new Cesium.PolylineDashMaterialProperty({
            color: strokeColor,
            dashLength: isHighlighted ? 12.0 : 20.0
          }),
          arcType: Cesium.ArcType.GEODESIC // Smooth great-circle curve over the sphere
        },
        properties: route
      });
    });
  }

  highlightRecoveryRoute(originCoord, destCoord, label = 'AI OPTIMAL REROUTE') {
    const ds = this.routeDataSource.entities;
    ds.add({
      id: 'ACTIVE-RECOVERY-PATH',
      name: label,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          originCoord.lon, originCoord.lat,
          destCoord.lon, destCoord.lat
        ]),
        width: 4.0,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          taperPower: 0.5,
          color: Cesium.Color.fromCssColorString('#00e676')
        }),
        arcType: Cesium.ArcType.GEODESIC
      }
    });
  }

  clearRecoveryRoutes() {
    this.routeDataSource.entities.removeById('ACTIVE-RECOVERY-PATH');
  }
}
