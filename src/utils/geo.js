/**
 * SAP Resilient: Geographic Projection & 3D Vector Math Utilities
 * Section 9 & 10: Centralized geoToVector3 and distance calculation
 */

import * as Cesium from 'cesium';

/**
 * Converts latitude and longitude into 3D Cartesian coordinates.
 * @param {number} lat - Latitude in decimal degrees (-90 to 90)
 * @param {number} lon - Longitude in decimal degrees (-180 to 180)
 * @param {number} height - Elevation above ellipsoid in meters (default 0)
 * @returns {Cesium.Cartesian3} Cartesian3 {x, y, z}
 */
export function geoToVector3(lat, lon, height = 0) {
  return Cesium.Cartesian3.fromDegrees(lon, lat, height);
}

/**
 * Normalized spherical Cartesian coordinates on a unit sphere (radius R)
 * Useful for procedural math and LOD calculations.
 */
export function geoToUnitSphere(lat, lon, radius = 1.0) {
  const phi = (lat * Math.PI) / 180.0;
  const theta = (lon * Math.PI) / 180.0;

  const x = radius * Math.cos(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi) * Math.sin(theta);
  const z = radius * Math.sin(phi);

  return { x, y, z };
}

/**
 * Great-circle distance between two geographic coordinates in kilometers (Haversine formula)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Interpolates a point along a geodesic great-circle arc between two coordinates.
 * @param {number} lat1 - Origin latitude
 * @param {number} lon1 - Origin longitude
 * @param {number} lat2 - Destination latitude
 * @param {number} lon2 - Destination longitude
 * @param {number} fraction - Normalized fraction between 0.0 and 1.0
 */
export function interpolateGeodesic(lat1, lon1, lat2, lon2, fraction) {
  const f = Math.max(0, Math.min(1, fraction));
  const p1 = Cesium.Cartographic.fromDegrees(lon1, lat1);
  const p2 = Cesium.Cartographic.fromDegrees(lon2, lat2);
  const geodesic = new Cesium.EllipsoidGeodesic(p1, p2);
  const pointCarto = geodesic.interpolateUsingFraction(f);
  return {
    lat: Cesium.Math.toDegrees(pointCarto.latitude),
    lon: Cesium.Math.toDegrees(pointCarto.longitude),
    cartesian: Cesium.Cartesian3.fromRadians(pointCarto.longitude, pointCarto.latitude)
  };
}
