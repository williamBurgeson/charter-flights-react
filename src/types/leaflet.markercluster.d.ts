// Minimal declaration for the leaflet.markercluster plugin.
// Place this file under `src/types/` so the project's `include: ["src"]`
// in `tsconfig.app.json` picks it up automatically.

import * as L from 'leaflet';

declare module 'leaflet.markercluster' {
  // Minimal interface used by the app. Keep `any` small and focused; if you
  // want richer types, install `@types/leaflet.markercluster`.
  export interface MarkerClusterGroup extends L.FeatureGroup {
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    clearLayers(): this;
    getLayer(id: number | string): L.Layer | undefined;
  }

  function markerClusterGroup(options?: any): MarkerClusterGroup;

  export = markerClusterGroup;
}

// Also augment the global L namespace so code that calls `L.markerClusterGroup()`
// directly (side-effect import of the plugin) will have that symbol typed.
declare global {
  namespace L {
    function markerClusterGroup(options?: any): FeatureGroup;
  }
}
