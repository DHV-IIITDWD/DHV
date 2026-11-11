<<<<<<< HEAD
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
=======
<<<<<<< HEAD
# DHV
=======
# DHV NIRF Analytics Dashboard

A React + TypeScript dashboard for exploring and analyzing National Institutional Ranking Framework (NIRF) data. The app helps users upload CSV/XLSX datasets, map raw columns to standard fields, visualize rankings across years and categories, and ask natural-language questions about the dataset through an AI-powered assistant.

## Overview

This frontend is designed for university or institutional analytics teams who want to:

- import NIRF data from one or more CSV/XLSX files
- clean and normalize incoming institutional ranking records
- compare institutions, categories, states, and score trends over time
- cross-filter charts to drill into specific states or ranking slices
- ask conversational questions such as "Which states have the highest representation in the top 100?"
- export cleaned data for downstream analysis

## Features

- Multi-file dataset ingestion for CSV and XLSX uploads
- Automatic column mapping for common NIRF fields such as year, institution name, state, rank, score, and category
- Duplicate removal and validation for incomplete rows
- KPI overview cards for overall dataset performance
- Interactive ECharts visualizations for:
  - top institutions
  - score distribution
  - year-wise trends
  - category-wise performance
  - state-wise institutional representation
- Cross-filtering interactions between charts and summary views
- AI query assistant that converts natural-language prompts into structured analysis requests
- Downloadable cleaned CSV output

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- ECharts + echarts-for-react
- Zustand for state management
- Papa Parse and xlsx for file ingestion
- React Router for screen navigation

## Project Structure

```text
frontend/
├── src/
│   ├── analysis/        # chart specs, stats, and query helpers
│   ├── components/      # shared UI and chart components
│   ├── pages/           # Overview, Explorer, AIQuery, DatasetManager
│   ├── services/        # API and AI service integrations
│   ├── App.tsx          # app routing
│   ├── data.ts          # dataset parsing and column normalization
│   ├── store.ts         # global dashboard state
│   ├── types.ts         # shared domain types
│   └── main.tsx         # app entry point
├── .env.example         # example environment configuration
├── index.html           # Vite HTML entry
├── package.json         # scripts and dependencies
├── postcss.config.js    # Tailwind PostCSS config
├── tailwind.config.js   # Tailwind theme config
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
└── README.md            # project documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file from the example:

```bash
copy .env.example .env
```

The default AI backend URL is:

```env
VITE_API_URL=http://localhost:8000
```

If your backend runs elsewhere, update the value to match that host.

### Run the app in development mode

```bash
npm run dev
```

The dashboard will start in Vite development mode and typically be available at:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev     # start the Vite dev server
npm run build   # type-check and build the production bundle
npm run preview # preview the production build locally
```

## Data Workflow

1. Upload one or more NIRF CSV/XLSX files.
2. Review detected columns and map them to the expected fields.
3. Confirm required fields such as year, institution name, and rank.
4. Inspect the generated analytics dashboard and charts.
5. Use the AI Query view to ask questions in plain English.
6. Download the cleaned dataset as CSV when ready.

## AI Assistant

The AI query page calls a backend API using `VITE_API_URL` and sends questions such as:

- "Show the top 10 engineering colleges in Karnataka in 2025"
- "Compare IIT Bombay and IIT Delhi from 2017 to 2025"
- "Which states have the highest representation in the top 100?"

The backend converts those prompts into structured queries against the active dataset and returns an explanation plus chart output when applicable.

## Notes

- Required mapping fields are year, institution name, and rank.
- If a dataset does not include enough structured metadata, some charts may be disabled until those fields are mapped.
- Data quality reports highlight dropped rows, duplicates, and missing values after ingestion.

## License

This project is intended for internal or project-specific analytics use. Update licensing information here if the project is to be released publicly.
>>>>>>> 56e088a4e38f53be52a4a2e05c20d359a98eac80
>>>>>>> origin/main
