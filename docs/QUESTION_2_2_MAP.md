# Question 2.2 — India state/UT choropleth

Question 2.2 visualises the number of institutions in the NIRF top 100 by state/Union Territory for the currently selected year and category. The main result is a state/UT choropleth. A supporting table lists all 36 regions, including zero counts, and an additional trend chart compares the seven states with the highest cumulative top-100 representation across the available years.

## Data rules

- A ranking record contributes only when its full reported rank interval is contained in 1–100. A band crossing the 100 boundary is not counted as definitely inside the top 100.
- State names are canonicalised before joining to map features; aliases such as Orissa/Odisha and Pondicherry/Puducherry are handled.
- All 28 states and 8 Union Territories are supplied to the map, including zero values. Unknown state values are not assigned to a fabricated region.
- The map and historical trend use the same selected category and observed/imputed-row filter.
- Region labels use compact codes with counts. Hover tooltips show the full region name and exact count.

## Boundary data, CORS and attribution

The browser fetches `/map-assets/india-states.geojson`. Vite proxies this same-origin path to `https://static.geodataviewer.com/datasets/india-states.geojson`, which avoids the browser CORS failure encountered when fetching the upstream host directly. The frontend validates and normalises the GeoJSON, joins disconnected polygon features under one canonical state/UT name, and registers the map with ECharts only after a successful fetch. If loading fails, the question still exposes its table and trend, and the chart renderer shows a fallback message rather than mounting an unregistered ECharts map.

Source: DataMeet Community Maps Project via GeoDataViewer, **CC BY 2.5 India**. The boundary snapshot is **2011-vintage** and simplified. It is suitable for an illustrative classroom visualisation, not an authoritative current legal-boundary reference. Internet access is needed on first map load. For production deployment, host the GeoJSON as a same-origin static asset or endpoint instead of relying on the Vite development proxy.

## Files involved

- `frontend/src/analysis/indiaMap.ts` — region names, aliases, GeoJSON normalisation and feature merging.
- `frontend/src/analysis/charts.ts` — `indiaChoropleth()` chart configuration, sequential scale, labels and tooltip.
- `frontend/src/analysis/questions.ts` — Q2.2 state counts, map, full 36-region table and historical trend output.
- `frontend/src/components/ChartRenderer.tsx` — safe lazy map fetch, ECharts registration and fallback rendering.
- `frontend/vite.config.ts` — `/map-assets` development proxy.
- `frontend/src/pages/Section.tsx` — primary map layout, supporting trend, table-first presentation.
