// Allow importing plain CSS files
declare module '*.css';

// Allow importing common image assets used by Leaflet (so imports like
// "import markerIconUrl from 'leaflet/dist/images/marker-icon.png'" work)
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';
declare module '*.gif';
// NOTE: third-party / library-specific declaration files live under `src/types/`.
// For example, `src/types/leaflet.markercluster.d.ts` contains the lightweight
// declarations for the marker cluster plugin. Keeping those files separate
// makes them easier to maintain and avoids stuffing too many module shims in
// this single file.

// (If you prefer a single entry-point, create `src/global.d.ts` that contains
// triple-slash references to files under `src/types/`, e.g.:
// /// <reference path="./types/leaflet.markercluster.d.ts" />)
