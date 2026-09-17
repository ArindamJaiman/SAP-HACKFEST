/**
 * SAP Resilient: Cesium Digital Twin Viewer
 * High-performance 3D Globe + 2D Flat Map with tactical dark atmosphere
 */

import * as Cesium from 'cesium';

export function createDigitalTwinViewer(containerId = 'cesiumContainer') {
  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Container #${containerId} not found`);

  // Create credit container to keep provider attributions clean and subtle
  let creditContainer = document.getElementById('cesium-credits');
  if (!creditContainer) {
    creditContainer = document.createElement('div');
    creditContainer.id = 'cesium-credits';
    creditContainer.style.display = 'none';
    document.body.appendChild(creditContainer);
  }

  Cesium.Ion.defaultAccessToken = '';

  // Tactical keyless base imagery (Esri World Imagery or OSM fallback)
  const esriImagery = new Cesium.ArcGisMapServerImageryProvider({
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    enablePickFeatures: false
  });

  const viewer = new Cesium.Viewer(container, {
    animation: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    vrButton: false,
    creditContainer,
    baseLayer: new Cesium.ImageryLayer(esriImagery),
    msaaSamples: 4,
    contextOptions: {
      webgl: {
        preserveDrawingBuffer: true,
        alpha: true
      }
    }
  });

  // Suppress modal popup error dialogs in UI
  if (viewer.cesiumWidget) {
    viewer.cesiumWidget.showErrorPanel = (title, message, error) => {
      console.warn('[Cesium Engine Notice]', title, message);
    };
  }

  // Aerospace Tactical Atmosphere Settings
  const scene = viewer.scene;
  scene.globe.show = true;
  scene.globe.baseColor = Cesium.Color.fromCssColorString('#06090e');
  scene.globe.enableLighting = false;

  if (scene.skyAtmosphere) {
    scene.skyAtmosphere.show = true;
    scene.skyAtmosphere.atmosphereLightIntensity = 12.0;
    scene.skyAtmosphere.saturationShift = -0.3;
    scene.skyAtmosphere.brightnessShift = -0.2;
  }

  if (scene.skyBox) {
    scene.skyBox.show = false; // Pure dark space background
  }
  scene.backgroundColor = Cesium.Color.fromCssColorString('#06090e');

  // Initial Camera Positioning (High Earth Orbit overlooking East Asia & Pacific)
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(108.0, 14.0, 18000000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0.0
    }
  });

  return viewer;
}
