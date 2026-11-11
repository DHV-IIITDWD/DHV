# DHV NIRF Analytics Dashboard

A React 18 + TypeScript + Vite dashboard for exploring NIRF institutional rankings and scores from 2017–2025. It includes the 40 Annexure A question analyses, an interactive chart explorer, dataset management, an India state/UT choropleth for Question 2.2, and an optional natural-language AI query interface.

## Start the frontend

Requirements: Node.js 18+ and npm 9+.

Run these commands **from this `frontend` directory**. This is an independent npm project, not an npm workspace:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The merged dataset in `public/data/nirf_merged.csv` is loaded automatically. You can replace or supplement it using **Dataset Manager** and CSV/XLSX uploads.

For a production bundle:

```bash
npm ci
npm run build
npm run preview
```

## Dashboard sections

- Overview: KPIs, score distribution, year trends, category/state comparisons, and cross-filtering.
- Eight Annexure analysis sections: all 40 sample-question IDs are present in the question registry.
- Chart Explorer: change metrics, grouping, chart families and filters.
- Dataset Manager: upload CSV/XLSX, inspect mapping/quality, and review missing, rank-band and imputed-row counts.
- AI Query: optional natural-language analytics through the FastAPI backend.

## Graph alternatives

Questions with analytically equivalent chart choices expose a **Graph type** selector. The selected question's result data stays the same while the display changes (for example, line/area/columns, bar/lollipop, radar/grouped bars/parallel coordinates, scatter with or without a trend line, and supported distribution modes). The selector is not offered for views where changing chart family would misrepresent the result. Question 2.2 keeps the choropleth as its primary view and offers a separate historical trend chart.

## Data handling notes

- `inst_id` is used as the preferred institution identity. When it is unavailable, name + state + city is used as a conservative fallback.
- Rank intervals and open-ended ranks retain their original labels and upper bounds. They are not treated as exact places in rank-movement calculations.
- Rows with a valid year and institution name are retained even when rank is missing, so score-based analyses can still use them.
- Rows flagged by the source `filled` column are classified as estimated/imputed. They are excluded by default, and the global **Include estimated rows** control makes inclusion explicit.
- Imputed/structural values are not original published observations. In particular, a zero used where a parameter is not measured must not be interpreted as zero institutional performance.

## Question 2.2 — India choropleth

The map displays all 28 states and 8 Union Territories, including regions with zero top-100 institutions. Labels use compact region codes and counts; hover reveals the full name and count. A supporting table and a historical state-wise trend are also provided. Counts include only rows whose complete rank interval is within 1–100.

The boundary GeoJSON is retrieved through the Vite same-origin `/map-assets` proxy from DataMeet/GeoDataViewer. The community boundary snapshot is 2011-vintage and illustrative, not an authoritative current legal boundary reference. The first map load requires internet access. For production hosting, serve the GeoJSON from a same-origin `/map-assets/india-states.geojson` endpoint or static file.

## Optional AI backend

The visual dashboard and sample questions work without the AI backend. To run AI Query, start the backend in another terminal:

```bash
cd ../backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
```

Add your own `GEMINI_API_KEY` to `backend/.env`, then run:

```bash
uvicorn main:app --reload --port 8000
```

The frontend defaults to `http://localhost:8000`. To use another backend URL, create `frontend/.env` with `VITE_API_URL=http://localhost:8000` (replace the value as needed). Never commit a real API key or `.env` file.

## Project structure

```text
frontend/
├── public/data/nirf_merged.csv   # bundled demonstration dataset
├── src/analysis/                 # question registry, statistics, charts, India map
├── src/components/               # app layout, controls and chart/table renderer
├── src/pages/                    # dashboard pages
├── src/data.ts                   # CSV/XLSX parsing and rank semantics
├── src/store.ts                  # shared filters and data state
├── package.json                  # frontend dependencies and scripts
└── vite.config.ts                # React plugin and India GeoJSON proxy
```
