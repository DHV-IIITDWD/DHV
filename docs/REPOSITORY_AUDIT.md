# Repository audit — supplied DHV NIRF dashboard

## Project scope

The supplied repository contains a React 18 + TypeScript + Vite frontend, FastAPI backend, nine yearly NIRF datasets (2017–2025), two data-cleaning notebooks and a preprocessed merged CSV. The dashboard is organised around Overview, eight Annexure analysis domains, Chart Explorer, AI Query and Dataset Manager.

## Original data-quality risks identified

- The original parser reduced rank bands to their first integer and discarded the original label.
- The frontend did not preserve the merged file's stable `inst_id` or `filled` marker.
- Name-only duplicate keys could collapse same-name campuses.
- Rows missing rank were discarded even when scores/parameters were useful.
- Some longitudinal comparisons matched exact names and treated lower-bound rank values as exact ranks.
- `node_modules` in an archive is machine-specific and should not be distributed as an installed dependency tree.

These issues have been addressed in the current source where relevant. See `PROJECT_CHANGE_AUDIT.md` for the changed files and the implemented rules.

## Dataset characteristics verified from the bundled merged file

- 6,924 records and 14 columns.
- Year coverage 2017–2025 and 13 categories.
- 1,124 unique project-level institution IDs.
- 33 states represented.
- 255 rows marked `filled` (about 3.68%).
- No duplicate `(year, category, inst_id)` keys in the merged dataset.

## Imputation caveat

The notebook's `filled` flag marks rows touched by imputation or structural filling. A zero used for parameters not measured in a category must not be described as zero performance. The frontend's observed-only default and opt-in Include estimated rows control preserve this distinction.

## Runtime caveats

- Install dependencies in `frontend/` using `npm ci`; the project is not a root-level npm workspace.
- The choropleth boundary data is fetched through the Vite development proxy and needs internet access on first load. For production, host the GeoJSON on the same origin.
- AI Query requires a running backend and a valid provider API key; the dashboard's non-AI pages do not.
- The final integration validation boundary is recorded in `VALIDATION_STATUS.md`; do not claim a full production bundle or exhaustive browser test unless performed locally.
