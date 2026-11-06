# NIRF Analytics Dashboard (React + TypeScript + Vite + Tailwind + ECharts)

## Run
```
npm install
cp .env.example .env     # only needed for the AI assistant
npm run dev              # http://localhost:5173
```
Then open **Dataset Manager** and upload your cleaned NIRF CSV/XLSX (several files are merged).
Columns are auto-detected (Year, Category, Institute Name, State, Rank, Score, TLR, RPC, GO, OI, PR) and can be re-mapped by hand.
Rank bands such as "101-150" are read as 101. Duplicates (year+category+name) are removed. No sample data is bundled; nothing is shown until a dataset is loaded.

## What is implemented
- Layout, sidebar, global year/category filters, dataset upload/validation/mapping/preview/quality report, cleaned-CSV download
- Overview (6 KPIs, 6 charts, real activity log)
- 23 of the 40 sample questions (1.1-1.5, 2.1, 2.3, 3.1, 3.3, 3.4, 4.1-4.5, 5.2, 5.3, 6.2, 6.4, 7.1, 7.4, 7.5, 8.3). All 40 are listed with exact wording; the other 17 are marked "not implemented" in the UI.
- Dynamic Query Explorer (filters × metric × aggregation × group-by × chart / two-variable scatter with correlation)
- AI Query Assistant UI (calls the backend; shows a real error if it is down; never fakes answers)

## Not implemented / limitations
- Analysis runs in the browser (no FastAPI yet); only the AI assistant needs a backend.
- Missing: 17 questions, maps, radar/Sankey/bump/violin charts, dark mode, TanStack Table (plain tables used).
- Institutions are matched across years by name (use a stable ID column if names change).

## Backend contract for the AI assistant
`POST /api/ai/query` `{question, dataset_id}` →
`{intent, filters, operation, chart_type, chart:{type:'bar'|'line',title,x[],series[{name,data[]}],xLabel,yLabel}|null, explanation, warnings[]}`
The LLM must only produce intent+filters; the numbers in `chart` must be computed with pandas on the real dataset. Enable CORS for http://localhost:5173. `GET /api/health` is also expected.
