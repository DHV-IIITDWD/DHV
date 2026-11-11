# DHV – NIRF Analytics Platform

<<<<<<< HEAD
A React + ECharts dashboard backed by FastAPI, Pandas and a Gemini-first LLM analytics service. The dashboard includes the 40 Annexure analyses, an interactive Explorer, Dataset Manager, graph alternatives for supported questions, the Q2.2 India map and an optional AI-query API.
=======
A React + ECharts dashboard backed by FastAPI, Pandas and a Gemini-first LLM analytics service. The dashboard UI is retained; the AI query API and LLM reliability layer have been repaired.
>>>>>>> origin/main

## What the AI does

1. User asks a question in natural language from the AI Query page.
2. FastAPI sends the question, dataset schema, relevant entity-value hints and recent validated plans to Gemini.
3. Gemini returns a structured JSON analysis plan (not Python code).
4. Pydantic validates the plan and the controlled Pandas engine executes only allow-listed operations against the active CSV.
5. The backend builds chart data from the actual computed result.
6. Gemini explains the computed result. If only the explanation request fails, the backend still returns the real computed result with a factual fallback explanation.

**The LLM does not calculate dataset metrics and generated code is never executed.** This prevents the model from inventing numeric answers or running arbitrary code.

Supported operations: filtered queries, grouping/aggregation, pivots and trends, correlations, change between periods, volatility, outliers, descriptive statistics and distributions. Charts include bar, line, area, pie, scatter, heatmap, histogram and box.

## LLM reliability

- Primary model: `gemini-3.8-flash`.
- Configurable Gemini model fallback: `gemini-3.5-flash-lite` by default. Availability depends on the Google AI Studio project/API key; remove a fallback model if your key cannot access it.
- Bounded exponential retries for transient overload, rate-limit and gateway errors.
- Optional Groq fallback, enabled only when `GROQ_API_KEY` is supplied.
- Model names, retry count and timeout are read from `backend/.env`.
- `/api/health` and `/api/health/llm` report configuration only; they do not spend tokens or guarantee live provider availability.
- Invalid credentials/model IDs are reported clearly rather than retried forever.

Gemini model availability can change and access may vary by project/tier. Check Google's [Gemini models documentation](https://ai.google.dev/gemini-api/docs/models) before changing model IDs.

## Project layout

```text
DHV/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/          # upload, AI query, direct analysis
│   ├── schemas/         # validated LLM plan and response models
│   └── services/        # Gemini/Groq, dataset and Pandas engine
├── data handling/
│   └── nirf_merged.csv
├── dataset/             # yearly NIRF source CSVs
└── frontend/            # existing React dashboard
```

## Setup – Windows PowerShell / CMD

### 1. Backend

```powershell
cd backend
py -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
copy .env.example .env
```

Open `backend/.env` and add your own API key:

```env
GEMINI_API_KEY=PASTE_YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-3.8-flash
GEMINI_FALLBACK_MODELS=gemini-3.5-flash-lite
LLM_RETRIES=2
LLM_TIMEOUT_SECONDS=45
MAX_UPLOAD_MB=25
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). Do not put the key in frontend files or commit `.env` to Git.

Optional Groq backup:

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY
GROQ_MODEL=llama-3.3-70b-versatile
```

Start the backend from the `backend` directory:

```powershell
uvicorn main:app --reload --port 8000
```

### 2. Frontend (new terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. The frontend API defaults to `http://localhost:8000`. To override it, create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Verify

- API root: `http://localhost:8000/`
- Health/config: `http://localhost:8000/api/health`
- LLM config: `http://localhost:8000/api/health/llm`
- Swagger: `http://localhost:8000/docs`

Health endpoints only verify configuration and dataset loading. To verify live Gemini access, submit a question from the AI Query page.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API, LLM configuration and dataset status |
| GET | `/api/health/llm` | LLM provider/model configuration |
| POST | `/api/upload` | Upload and activate a CSV (size-limited) |
| GET | `/api/dataset/info` | Active dataset schema and metadata |
| POST | `/api/ai/query` | Dynamic question → validated plan → Pandas result → explanation/chart |
| POST | `/api/chat` | Alias for the dataset-aware AI query |
| POST | `/chat` | Basic direct LLM text prompt compatibility endpoint |
| POST | `/api/analyze` | Execute a validated analysis plan without an LLM call |

AI query body:

```json
{
  "question": "Compare IIT Bombay and IIT Delhi from 2017 to 2025",
  "dataset_id": "active_dataset",
  "history": []
}
```

The response retains the existing frontend fields: `intent`, `filters`, `operation`, `chart_type`, `chart`, `explanation`, `warnings`, `data`, `insights`, `sql_or_analysis`, and `plan`.

## Notes

<<<<<<< HEAD
- The backend defaults to `data handling/nirf_merged.csv`; browser-side CSV/XLSX replacement is available from Dataset Manager. The bundled frontend copy loads automatically on dashboard startup.
=======
- The default dataset is `data handling/nirf_merged.csv`; upload another CSV from the AI Query page to activate it.
>>>>>>> origin/main
- Only one active dataset is held in backend memory. Restarting the backend resets an uploaded dataset to the default CSV.
- The API key is intentionally not included in this ZIP. Create your own `backend/.env` from `.env.example`.
- The backend retries temporary 429/5xx errors a bounded number of times. A provider outage or exhausted quota can still prevent new LLM plans; configure the optional Groq backup for an additional provider path.
- Keep `.env`, `.venv`, `node_modules`, `.git` and generated build folders out of project ZIPs and source control.
<<<<<<< HEAD


## Run locally (macOS / Windows / Linux)

The frontend is an independent Vite project. Run commands from the `frontend` folder (not the repository root):

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The dashboard loads the bundled `frontend/public/data/nirf_merged.csv` automatically. You can replace it at runtime by uploading your own CSV/XLSX in **Dataset Manager**.

To create a production frontend bundle:

```bash
cd frontend
npm ci
npm run build
npm run preview
```

The India choropleth fetches its state-boundary GeoJSON through a Vite development proxy and therefore needs internet access on first load. For production hosting, serve the same GeoJSON from your own same-origin `/map-assets/india-states.geojson` endpoint or static file. The map's 2011-vintage boundary layer is illustrative, not an authoritative legal boundary.

## Optional AI backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Add your Gemini API key if using AI Query
uvicorn main:app --reload --port 8000
```

The analytics dashboard works without the optional AI backend; AI Query requires a working backend and API key.


## Submission-ready dashboard features

- All 40 sample-question IDs are registered across the eight assignment domains.
- Supported questions expose alternate graph types without changing the underlying result data.
- Question 2.2 includes an India state/UT choropleth, a 36-region table and a historical trend chart. See `docs/QUESTION_2_2_MAP.md` for boundary provenance and limitations.
- Rank intervals, stable institution IDs, missing-rank rows and imputation provenance are retained through frontend parsing. Estimated rows are excluded by default and can be included explicitly.
- Install frontend dependencies from `frontend/` with `npm ci`; do not run Vite scripts from the repository root.

See `docs/PROJECT_CHANGE_AUDIT.md` and `docs/VALIDATION_STATUS.md` for the integration record and exact validation limits.
=======
>>>>>>> origin/main
