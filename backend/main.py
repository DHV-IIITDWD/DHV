from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import config
from routes import upload, chat, analysis
from services import dataset_service as ds, gemini_service as llm

app = FastAPI(title="DHV NIRF Analytics API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
for route in (upload.router, chat.router, analysis.router):
    app.include_router(route)


@app.get("/")
def root():
    return {"name": "DHV NIRF Analytics API", "status": "ok", "docs": "/docs"}


@app.get("/api/health")
def health():
    try:
        meta = ds.get_meta()
        dataset = {"name": meta["name"], "rows": meta["rows"], "columns": len(meta["columns"])}
    except ds.DatasetError:
        dataset = None
    return {"status": "ok", "llm": llm.llm_status(), "gemini_configured": bool(config.GEMINI_API_KEY), "model": config.GEMINI_MODEL, "dataset": dataset}


@app.get("/api/health/llm")
def llm_health():
    """Configuration check only; does not spend tokens or make a billable model request."""
    return llm.llm_status()
