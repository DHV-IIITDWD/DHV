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
