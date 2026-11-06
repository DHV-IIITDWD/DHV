"""Dataset loading, validation, schema detection. One active dataset is kept in memory (metadata cached)."""
import io
import re
from typing import Optional
import numpy as np
import pandas as pd
from config import DEFAULT_DATASET, MAX_UPLOAD_MB

_state: dict = {"df": None, "meta": None, "name": None}
TEMPORAL = re.compile(r"(^|_)(year|yr|session|date)($|_)", re.I)
IDLIKE = re.compile(r"(^|_)(id|code|sno|serial)($|_)", re.I)


class DatasetError(ValueError):
    pass


def _clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [str(c).strip() for c in df.columns]
    df = df.dropna(how="all").dropna(axis=1, how="all")
    for c in df.columns:
        if df[c].dtype == object or str(df[c].dtype).startswith("str"):
            s = df[c].astype("string").str.strip()
            num = pd.to_numeric(s.str.replace(",", "", regex=False), errors="coerce")
            if s.notna().sum() and num.notna().sum() / max(s.notna().sum(), 1) > 0.9:
                df[c] = num                       # mostly numeric text -> numeric
            else:
                df[c] = s.replace("", pd.NA).astype(object)
    return df.reset_index(drop=True)


def _meta(df: pd.DataFrame, name: str) -> dict:
    cols = []
    for c in df.columns:
        s = df[c]
        nun = int(s.nunique(dropna=True))
        if pd.api.types.is_bool_dtype(s):
            kind = "boolean"
        elif pd.api.types.is_numeric_dtype(s):
            kind = "temporal" if TEMPORAL.search(c) else ("identifier" if IDLIKE.search(c) else "numeric")
        else:
            kind = "categorical"
        info = {"name": c, "dtype": str(s.dtype), "kind": kind, "missing": int(s.isna().sum()), "unique": nun}
        if kind in ("numeric", "temporal", "identifier"):
            info.update(min=_f(s.min()), max=_f(s.max()), mean=_f(s.mean()))
        else:
            vc = s.value_counts().head(60 if nun <= 60 else 5)
            info["values"] = [str(v) for v in vc.index]
        cols.append(info)
    return {"name": name, "rows": int(len(df)), "columns": cols,
            "numeric_columns": [c["name"] for c in cols if c["kind"] == "numeric"],
            "categorical_columns": [c["name"] for c in cols if c["kind"] == "categorical"],
            "temporal_columns": [c["name"] for c in cols if c["kind"] == "temporal"],
            "duplicate_rows": int(df.duplicated().sum())}


def _f(x):
    return None if pd.isna(x) else round(float(x), 4)


def set_dataset(df: pd.DataFrame, name: str) -> dict:
    if df.shape[1] < 2 or len(df) < 1:
        raise DatasetError("The CSV needs at least 2 columns and 1 data row.")
    df = _clean(df)
    _state.update(df=df, meta=_meta(df, name), name=name)
    return _state["meta"]


def load_csv_bytes(raw: bytes, name: str) -> dict:
    if len(raw) > MAX_UPLOAD_MB * 1024 * 1024:
        raise DatasetError(f"File too large (limit {MAX_UPLOAD_MB} MB).")
    if not raw.strip():
        raise DatasetError("The file is empty.")
    for enc in ("utf-8-sig", "latin-1"):
        try:
            df = pd.read_csv(io.BytesIO(raw), encoding=enc, sep=None, engine="python")
            break
        except UnicodeDecodeError:
            continue
        except Exception as e:  # noqa: BLE001
            raise DatasetError(f"Could not parse CSV: {e}") from e
    else:
        raise DatasetError("Could not decode the file as text.")
    return set_dataset(df, name)


def ensure_loaded() -> None:
    if _state["df"] is None and DEFAULT_DATASET.exists():
        set_dataset(pd.read_csv(DEFAULT_DATASET), DEFAULT_DATASET.name)


def get_df() -> pd.DataFrame:
    ensure_loaded()
    if _state["df"] is None:
        raise DatasetError("No dataset loaded. Upload a CSV first.")
    return _state["df"]


def get_meta() -> dict:
    get_df()
    return _state["meta"]


def entity_hints(question: str, limit: int = 12) -> dict[str, list[str]]:
    """For high-cardinality text columns (e.g. institution names) list values that share words with the question,
    so Gemini can map 'IIT Delhi' to the real stored name without receiving the whole column."""
    df = get_df()
    words = {w for w in re.findall(r"[A-Za-z]{3,}", question.lower())} - {"the", "and", "top", "show", "which", "what", "with", "from", "for", "over", "last", "years", "year", "rank", "ranking", "compare", "institutions", "institution", "score"}
    out: dict[str, list[str]] = {}
    if not words:
        return out
    for c in _state["meta"]["columns"]:
        if c["kind"] != "categorical" or c["unique"] <= 60:
            continue
        vals = pd.Series(df[c["name"]].dropna().unique(), dtype=object)
        low = vals.str.lower()
        score = low.map(lambda v: sum(w in v for w in words))
        best = vals[score > 0].iloc[np.argsort(-score[score > 0].values, kind="stable")][:limit]
        if len(best):
            out[c["name"]] = [str(v) for v in best]
    return out
