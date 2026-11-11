# Local setup and evaluation guide

## Frontend dashboard

Requirements: Node.js 18+ and npm 9+. The frontend is an independent npm project. Run from `frontend/`, not from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The merged data at `frontend/public/data/nirf_merged.csv` loads automatically. CSV/XLSX files can be uploaded through Dataset Manager.

Build/preview:

```bash
npm ci
npm run build
npm run preview
```

## Optional AI backend

The core dashboard and Annexure sample analyses work without the backend. AI Query requires the FastAPI service and an API key:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Add a valid `GEMINI_API_KEY` to `backend/.env`, then run:

```bash
uvicorn main:app --reload --port 8000
```

The default API URL is `http://localhost:8000`; `frontend/.env` can override it with `VITE_API_URL`. Do not include `.env` or API keys in the submission ZIP.

## Recommended evaluation sequence

1. **Overview:** explain year/category filters, KPI scope and score trend.
2. **Question 1.1:** choose an institution and show exact ranks separately from rank-band labels.
3. **Question 2.2:** select a year, inspect all 36 state/UT regions, hover for exact names/counts, and open the historical trend. Explain the 2011 illustrative boundary limitation.
4. **Question 3.1 or 3.5:** show a score histogram or category distribution and identify sample size.
5. **Question 4.1:** explain RPC vs overall-score correlation, pairwise sample size and why correlation is not causation.
6. **Question 5.1:** change the graph type (radar/grouped bars/parallel coordinates) while explaining that the underlying data stays the same.
7. **Question 7.1:** show the single Entered Top 50 bar and the table of institutions that actually moved from 51–100 to 1–50.
8. **Question 8.x:** explain the stated outlier screening rule and why exact ranks are required for rank volatility.
9. **Include estimated rows:** toggle it on and off to demonstrate provenance-aware analysis; explain that `filled` rows contain estimates/structural placeholders.
10. **Explorer:** change metric/grouping/chart and export results.
11. **AI Query:** demonstrate only after the backend health endpoint and a real query succeed; otherwise explain that this is an optional API integration.

## Evaluation checklist

- Test the question IDs under categories/years where the required fields are available.
- Test a category-year combination that does not exist and confirm the empty state is clear.
- Test institution matching with IDs and with name/state/city fallback.
- Confirm rank-band rows are never described as exact movement.
- Confirm filled rows are excluded by default and the opt-in toggle changes the data scope.
- Verify CSV and PNG exports.
- Test map loading with an internet connection and the graceful fallback without one.
