"""Central environment configuration for the DHV API."""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = ROOT.parent
load_dotenv(ROOT / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()
GEMINI_FALLBACK_MODELS = [m.strip() for m in os.getenv("GEMINI_FALLBACK_MODELS", "gemini-3.5-flash-lite").split(",") if m.strip()]
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").strip().lower()
LLM_RETRIES = max(0, min(int(os.getenv("LLM_RETRIES", "2")), 4))
LLM_TIMEOUT_SECONDS = max(10, min(int(os.getenv("LLM_TIMEOUT_SECONDS", "45")), 120))
MAX_UPLOAD_MB = max(1, min(int(os.getenv("MAX_UPLOAD_MB", "25")), 100))
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()]
_default = PROJECT_ROOT / "data handling" / "nirf_merged.csv"
DEFAULT_DATASET = Path(os.getenv("DEFAULT_DATASET", str(_default))).expanduser()
MAX_RESULT_ROWS = 500
LLM_SAMPLE_ROWS = 25
