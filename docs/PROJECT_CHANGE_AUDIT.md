# Project change audit — integrated submission

This document records the changes integrated into the user-provided `DHV-main` source ZIP. The changes port the applicable behaviour from the earlier map, chart-selection, table-first and data-quality patches into the current React/Vite dashboard architecture; they do not transplant the old repository's directory tree.

## Frontend data ingestion and quality

- `frontend/src/data.ts` and `frontend/src/types.ts` recognise stable `inst_id`, source `filled` provenance, city fallback, exact ranks, closed rank intervals and open-ended rank bands.
- Rank label, lower bound, upper bound and exactness are kept separately. Rows with a valid year and institution name are retained even if rank is absent.
- Dedupe identity prefers `inst_id`; without one it uses normalised name + state + city.
- The default analytical dataset excludes rows flagged `filled`. A global opt-in control enables them and the dataset manager reports the provenance counts.
- The cleaned merged CSV is bundled at `frontend/public/data/nirf_merged.csv` and auto-loads on startup; uploads remain available from Dataset Manager.

## Annexure questions and chart choices

- `frontend/src/analysis/questions.ts` was updated so rank transitions require exact ranks and stable IDs, threshold membership does not silently assign rank bands that cross a cutoff, Q2.5 counts first observed ranked records, and several rank displays use the source rank label.
- Q5.4 now matches institutions by stable identity across its selected years rather than exact display name alone.
- Questions with valid alternative chart encodings expose a Graph type selector. The calculation and result table remain unchanged when the viewer changes chart encoding.
- Tables are presented before the associated visual analysis; question-specific supporting tables and extra charts are retained.
- Q7.1's main result is only the “Entered Top 50” count, with an institution-level table of actual movers from rank band 51–100 to 1–50.

## Question 2.2 map

- An India choropleth displays all 28 states and 8 Union Territories, including zero-count regions.
- Sequential colour values and compact region-code/count labels are used; full region names and values are shown on hover.
- A complete 36-region results table and a supporting historical trend for the top seven state/UT regions are included.
- State aliases and GeoJSON polygon merging are handled in `indiaMap.ts`.
- `ChartRenderer.tsx` registers ECharts' map only after the GeoJSON loads and provides a safe visible fallback on failure.
- `vite.config.ts` proxies `/map-assets` to GeoDataViewer, avoiding the upstream browser CORS issue during local Vite development.

## Setup and submission hygiene

- `frontend/README.md` was rewritten to remove unresolved merge-conflict markers and give correct macOS/Windows/Linux install instructions.
- The app is an independent npm project: install and run from `frontend/`, not from the repository root.
- The final ZIP intentionally excludes `node_modules`, `.venv`, `.env`, `.git`, generated `dist`, and Python cache folders. `package-lock.json` is retained for reproducible `npm ci`.

## Files added or materially updated

- `frontend/src/data.ts`, `frontend/src/types.ts`, `frontend/src/store.ts`
- `frontend/src/main.tsx`, `frontend/src/components/ui.tsx`, `frontend/src/components/Layout.tsx`
- `frontend/src/components/ChartRenderer.tsx`, `frontend/src/analysis/indiaMap.ts`
- `frontend/src/analysis/charts.ts`, `frontend/src/analysis/questions.ts`
- `frontend/src/pages/Section.tsx`, `frontend/src/pages/Overview.tsx`, `frontend/src/pages/Explorer.tsx`, `frontend/src/pages/DatasetManager.tsx`
- `frontend/vite.config.ts`, `frontend/README.md`, repository `README.md`
- `frontend/public/data/nirf_merged.csv`
- `docs/QUESTION_REVIEW.md`, `docs/QUESTION_2_2_MAP.md`, `docs/VALIDATION_STATUS.md`, and this audit.

## Validation boundary

The bundled dataset audit and seven deterministic rank-parser checks passed. The TypeScript no-emit check passed. A production Vite bundle and exhaustive browser execution of all 40 questions were not completed in this environment; see `VALIDATION_STATUS.md` for the platform-specific Rollup and npm-registry constraints. The source ZIP retains its lockfile, and the local Mac setup steps are documented.
