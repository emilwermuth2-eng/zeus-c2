import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

export function initOsintMap() {
  const token = import.meta.env.VITE_CESIUM_ION;
  if (token) Cesium.Ion.defaultAccessToken = token;

  const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain(),
    baseLayerPicker: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    geocoder: false,
    homeButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false,
  });

  // Dark atmosphere
  viewer.scene.skyAtmosphere.show = true;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0a0d12');

  return viewer;
}
