/**
 * SAP Resilient: Camera & Scene Controller
 * Smooth cinematic transitions, focus-to-entity, region framing, and 2D/3D mode toggling
 */

import * as Cesium from 'cesium';

export class SceneController {
  constructor(viewer) {
    this.viewer = viewer;
  }

  flyToCoordinates(lat, lon, height = 350000, duration = 1.8) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      duration,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-65),
        roll: 0.0
      }
    });
  }

  focusEntity(entity, height = 280000) {
    if (!entity || entity.lat === undefined || entity.lon === undefined) return;
    this.flyToCoordinates(entity.lat, entity.lon, height, 1.6);
  }

  resetGlobeView() {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(108.0, 14.0, 18000000),
      duration: 2.0,
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      }
    });
  }

  set2DMode() {
    this.viewer.scene.morphTo2D(1.2);
  }

  set3DMode() {
    this.viewer.scene.morphTo3D(1.2);
  }

  orbitLocation(lat, lon, distance = 400000, durationSec = 12) {
    const center = Cesium.Cartesian3.fromDegrees(lon, lat, 0);
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    this.viewer.scene.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(0, -Cesium.Math.toRadians(35), distance));

    let heading = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > durationSec) {
        this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        return;
      }
      heading += 0.005;
      this.viewer.scene.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(heading, -Cesium.Math.toRadians(35), distance));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
