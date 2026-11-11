# Integrated patch notes

The improvements below are already applied to this working tree; these are implementation notes, not instructions for a future manual overlay.

## Data parser and types

- Recognises `inst_id` and `filled` in the supplied merged CSV.
- Retains original rank label, lower and upper bounds, and exact-rank status.
- Retains rows with valid year + institution name even when rank is missing.
- Prefers stable institution ID for de-duplication; falls back to normalised name + state + city.
- Parses imputation provenance and reports rank-band and filled-row counts.
- Keeps browser parsing free of additional imputation.

## Dashboard state and filters

- The bundled merged CSV is automatically loaded from `frontend/public/data/nirf_merged.csv`.
- A global Include estimated rows toggle is off by default and affects the analysis pages consistently.
- Dataset Manager explains missing-rank retention, rank intervals and estimated/structural source values.

## Question analysis and graph selection

- Longitudinal matching uses `inst_id` where present and exact ranks where exact place movement is calculated.
- Rank-band thresholds count only bands wholly within a threshold; ambiguous cross-boundary intervals are not silently classified.
- Q2.5 counts first observations among ranked rows and labels them as first observed, not necessarily newly established institutions.
- Q5.4 uses stable institution matching across selected years.
- Supported analytical questions expose mathematically valid alternative chart views; the data and result table remain unchanged.
- Result tables appear before their charts.
- Q7.1 displays a single Entered Top 50 result and an institution-level table of true 51–100 to 1–50 movers.

## Question 2.2 map

- Adds the 36-region choropleth with compact state/UT code labels, counts and hover details.
- Includes every region, including zero-count regions, and a 36-region table.
- Adds a supporting historical trend for the seven highest-representation regions.
- Fetches GeoJSON through a Vite same-origin proxy; validates/normalises it before ECharts registration and shows a fallback on failure.
- Map provenance and 2011 boundary limitation are documented in `QUESTION_2_2_MAP.md`.

## Setup and package hygiene

- Corrected the frontend README and removed merge-conflict markers.
- Retained `package-lock.json`; final ZIP excludes platform-specific `node_modules`, local virtual environments, `.env`, Git metadata and build output.
- The frontend is an independent npm project and must be installed/run from `frontend/`.
