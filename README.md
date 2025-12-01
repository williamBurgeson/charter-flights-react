# Charter-Flights-React (React + TypeScript + Vite)

This react app is intended to provide a demonstration, using latest best practices and notably the use of hooks, of a react application of moderate complexity which would eventually allow a user to view and create charter flights between any 2 airports in the world, against a dataset of over 4000 airports spread across every continent.

Note as this is a purely front-end vite based react app, the static data sources are json files containing the data for airports, territories and continents, and the flights database is an in-memory database within the application itself, which is seeded semi-randomly a for selection of inter and intra-continental flights upon app start-up, this process visible upon usage with the loading screen artificially slowed down to force a delay of a few seconds to mimic an actual application startup scenario.

Note also that at the current time the application is not functionally complete: it is possible to view flights in the immediate future, and to search for airports either by directly clicking on a map (leaflet) and zooming in, or by clicking on a map and selecting a point of reference which will show the nearest airport to that point. This latter functionality defaults to the user's current location, and if the geolocation is disallowed by the user the location 51°N 0°E is used.

The application is also designed to work equally well on mobile devices down to 400 pixels wide up to full screen of any size, with css breakpoints allowing the display to gracefully adjust to the constraints of reduced widths.

As the application is hosted on github pages and therefore in a subfolder of the host, the react/vite infrastructure is adjusted for the required paths to behave correctly according to the root of the application. Also, while the intention is to allow deep linking from external sources, any requests coming to pages other than the root of the application, coming from either external sources or a manual refresh of the browser are redirected to the root. This is another area of functionality which I intend to enhance when possible, while preserving the stability which the application currently enjoys.

For the sake of interest, I have left in the default blurb supplied by the vite template below.

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
