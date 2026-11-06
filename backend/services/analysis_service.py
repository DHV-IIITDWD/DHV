"""Controlled analysis engine: executes a validated Plan with pandas/numpy. No LLM-generated code is ever executed;
every column name is checked against the real schema and every operation comes from a fixed whitelist."""
from typing import Any
import numpy as np
import pandas as pd
from config import MAX_RESULT_ROWS
from schemas.response import Plan, ChartHint


class PlanError(ValueError):
    pass


def _col(df: pd.DataFrame, name: str | None) -> str:
    if not name:
        raise PlanError("The analysis plan is missing a column.")
    if name in df.columns:
        return name
    m = [c for c in df.columns if c.lower() == str(name).lower()]
    if m:
        return m[0]
    raise PlanError(f"Column '{name}' does not exist in this dataset. Available: {', '.join(df.columns)}")


def _num(df, name):
    c = _col(df, name)
    if not pd.api.types.is_numeric_dtype(df[c]):
        raise PlanError(f"Column '{c}' is not numeric.")
    return c


def _clean_val(v: Any):
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating, float)):
        return None if pd.isna(v) else round(float(v), 4)
    if pd.isna(v) if not isinstance(v, (list, dict)) else False:
        return None
    return v


def to_records(df: pd.DataFrame) -> list[dict]:
    return [{str(k): _clean_val(v) for k, v in r.items()} for r in df.head(MAX_RESULT_ROWS).to_dict("records")]


def _coerce(series: pd.Series, v):
    if pd.api.types.is_numeric_dtype(series):
        try:
            return float(v)
        except (TypeError, ValueError):
            raise PlanError(f"Value '{v}' is not numeric for column '{series.name}'.")
    return str(v)


def apply_filters(df: pd.DataFrame, plan: Plan, warnings: list[str]) -> pd.DataFrame:
    for f in plan.filters:
        c = _col(df, f.column)
        s = df[c]
        if f.op == "between":
            lo, hi = f.value if isinstance(f.value, (list, tuple)) and len(f.value) == 2 else (None, None)
            if lo is None:
                raise PlanError("'between' needs [low, high].")
            mask = s.between(_coerce(s, lo), _coerce(s, hi))
        elif f.op in ("in", "eq", "ne") and not pd.api.types.is_numeric_dtype(s):
            vals = [str(x).lower() for x in (f.value if isinstance(f.value, list) else [f.value])]
            low = s.astype("string").str.lower()
            mask = low.isin(vals)
            if not mask.any():   # fall back to substring match, e.g. "Karnataka" / partial names
                mask = pd.Series(False, index=s.index)
                for v in vals:
                    mask |= low.str.contains(v, regex=False, na=False)
                if mask.any():
                    warnings.append(f"No exact match for {f.value} in '{c}'; used partial matching.")
            if f.op == "ne":
                mask = ~mask
        elif f.op == "in":
            mask = s.isin([_coerce(s, x) for x in (f.value if isinstance(f.value, list) else [f.value])])
        elif f.op == "contains":
            mask = s.astype("string").str.contains(str(f.value), case=False, regex=False, na=False)
        else:
            v = _coerce(s, f.value)
            mask = {"eq": s == v, "ne": s != v, "gt": s > v, "gte": s >= v, "lt": s < v, "lte": s <= v}[f.op]
        df = df[mask.fillna(False)]
    return df


def _sort_limit(res: pd.DataFrame, plan: Plan) -> pd.DataFrame:
    if plan.sort:
        by = _col(res, plan.sort.by)
        res = res.sort_values(by, ascending=not plan.sort.desc, kind="stable")
    return res.head(plan.limit) if plan.limit else res


def run(plan: Plan, df: pd.DataFrame) -> tuple[pd.DataFrame, str, list[str]]:
    """Returns (result table, human-readable description of what was computed, warnings)."""
    warnings: list[str] = []
    n0 = len(df)
    df = apply_filters(df, plan, warnings)
    desc = [f"{len(df)} of {n0} rows after filters"]
    if df.empty:
        warnings.append("No rows matched the filters.")
        return df, "; ".join(desc), warnings
    op = plan.operation

    if op == "query":
        if plan.group_by or plan.metrics:
            gb = [_col(df, g) for g in plan.group_by]
            if not plan.metrics:
                res = df.groupby(gb).size().reset_index(name="count")
                desc.append(f"count grouped by {gb}")
            else:
                spec = {}
                for m in plan.metrics:
                    c = _col(df, m.column)
                    if m.agg not in ("count", "nunique") and not pd.api.types.is_numeric_dtype(df[c]):
                        raise PlanError(f"Cannot compute {m.agg} of non-numeric column '{c}'.")
                    spec[m.alias or f"{m.agg}_{c}"] = pd.NamedAgg(column=c, aggfunc=m.agg)
                res = df.groupby(gb).agg(**spec).reset_index() if gb else pd.DataFrame([df.agg({v.column: v.aggfunc for v in spec.values()}.copy()).to_dict()]) if False else (df.groupby(gb).agg(**spec).reset_index() if gb else pd.DataFrame({k: [getattr(df[v.column], v.aggfunc)()] for k, v in spec.items()}))
                desc.append(f"{', '.join(f'{m.agg}({m.column})' for m in plan.metrics)}" + (f" grouped by {gb}" if gb else ""))
        else:
            cols = [_col(df, c) for c in plan.select] if plan.select else list(df.columns)
            res = df[cols]
            desc.append("row selection")
        res = _sort_limit(res, plan)

    elif op == "pivot":
        i, c, v = _col(df, plan.index), _col(df, plan.columns), _num(df, plan.values)
        res = df.pivot_table(index=i, columns=c, values=v, aggfunc=plan.agg)
        if res.shape[1] > 15:
            res = res[res.notna().sum().sort_values(ascending=False).index[:15]]
            warnings.append("More than 15 series; showing the 15 with most data.")
        res = res.reset_index()
        res.columns = [str(x) for x in res.columns]
        desc.append(f"pivot of {plan.agg}({v}) by {i} (rows) and {c} (columns)")
        res = res.sort_values(res.columns[0]).head(plan.limit) if plan.limit else res.sort_values(res.columns[0])

    elif op == "correlation":
        vars_ = [_num(df, v) for v in plan.variables] if plan.variables else [c for c in df.select_dtypes("number").columns if df[c].nunique() > 2]
        if len(vars_) < 2:
            raise PlanError("Correlation needs at least two numeric columns.")
        m = df[vars_].corr(method=plan.method)
        res = m.round(4).reset_index().rename(columns={"index": "variable"})
        desc.append(f"{plan.method} correlation matrix over {vars_}")

    elif op in ("change", "volatility"):
        e, t, v = _col(df, plan.entity), _col(df, plan.time), _num(df, plan.value)
        wide = df.pivot_table(index=e, columns=t, values=v, aggfunc="mean")
        if op == "change":
            a = _coerce(df[t], plan.from_t) if plan.from_t is not None else wide.columns.min()
            b = _coerce(df[t], plan.to_t) if plan.to_t is not None else wide.columns.max()
            if a not in wide.columns or b not in wide.columns:
                raise PlanError(f"'{t}' values {a} / {b} not both present. Available: {list(wide.columns)}")
            res = pd.DataFrame({e: wide.index, f"{v}_{_lbl(a)}": wide[a].values, f"{v}_{_lbl(b)}": wide[b].values}).dropna()
            res["change"] = res.iloc[:, 2] - res.iloc[:, 1]
            res["pct_change"] = (res["change"] / res.iloc[:, 1].replace(0, np.nan) * 100).round(2)
            key = {"increase": res["change"], "decrease": -res["change"], "abs": res["change"].abs()}[plan.direction]
            res = res.loc[key.sort_values(ascending=False, kind="stable").index]
            desc.append(f"change in {v} per {e} from {_lbl(a)} to {_lbl(b)} (only entities present in both)")
        else:
            res = pd.DataFrame({e: wide.index, "std_dev": wide.std(axis=1).values, "mean": wide.mean(axis=1).values,
                                "min": wide.min(axis=1).values, "max": wide.max(axis=1).values, "periods": wide.notna().sum(axis=1).values})
            res = res[res["periods"] >= 2].copy()
            res["range"] = res["max"] - res["min"]
            res = res.sort_values("std_dev", ascending=plan.direction == "decrease", kind="stable")
            desc.append(f"variability of {v} across {t} per {e} (std dev; lower = more consistent)")
        res = res.round(4).head(plan.limit or 20)

    elif op == "outliers":
        v = _num(df, plan.variables[0] if plan.variables else plan.value)
        keep = [c for c in (plan.select or []) if c in df.columns]
        s = df[v].dropna()
        q1, q3 = s.quantile(.25), s.quantile(.75)
        lo, hi = q1 - 1.5 * (q3 - q1), q3 + 1.5 * (q3 - q1)
        res = df[(df[v] < lo) | (df[v] > hi)]
        res = res[list(dict.fromkeys(keep + ([plan.entity] if plan.entity else []) + [v]))] if (keep or plan.entity) else res
        res = res.reindex((res[v] - s.median()).abs().sort_values(ascending=False).index)
        desc.append(f"IQR outliers in {v}: outside [{lo:.2f}, {hi:.2f}] ({len(res)} found)")
        res = res.head(plan.limit or 25)

    elif op == "describe":
        vars_ = [_num(df, v) for v in plan.variables] if plan.variables else list(df.select_dtypes("number").columns)
        res = df[vars_].describe().T.round(4).reset_index().rename(columns={"index": "variable"})
        desc.append(f"descriptive statistics of {vars_}")

    elif op == "distribution":
        v = _num(df, plan.variables[0] if plan.variables else plan.value)
        if plan.group_by:
            g = _col(df, plan.group_by[0])
            q = df.groupby(g)[v].describe(percentiles=[.25, .5, .75])
            res = q[["min", "25%", "50%", "75%", "max", "count"]].round(4).reset_index()
            res.columns = [g, "min", "q1", "median", "q3", "max", "count"]
            desc.append(f"five-number summary of {v} by {g}")
        else:
            cnt, edges = np.histogram(df[v].dropna(), bins=plan.bins)
            res = pd.DataFrame({"bin": [f"{edges[i]:.1f}–{edges[i+1]:.1f}" for i in range(len(cnt))], "count": cnt})
            desc.append(f"histogram of {v} ({plan.bins} bins)")
    else:  # pragma: no cover - Literal already prevents this
        raise PlanError(f"Unsupported operation {op}")
    return res.reset_index(drop=True), "; ".join(desc), warnings


def _lbl(x):
    return int(x) if isinstance(x, (float, np.floating)) and float(x).is_integer() else x


# ---------------------------------------------------------------- charts (built from the REAL result table)
def build_chart(res: pd.DataFrame, hint: ChartHint, plan: Plan) -> dict | None:
    t = hint.type
    if t == "none" or res.empty or len(res.columns) < 2 and t != "histogram":
        return None
    title = hint.title or plan.intent or "Result"
    cols = list(res.columns)
    num = [c for c in cols if pd.api.types.is_numeric_dtype(res[c])]

    def has(c):
        return c if c in cols else None

    x = has(hint.x) or (cols[0])
    ys = [c for c in hint.y if c in cols]
    base = {"type": t, "title": title, "xLabel": str(x), "yLabel": ys[0] if len(ys) == 1 else "", "x": [], "series": []}

    if t == "heatmap" or (plan.operation == "correlation" and t != "none"):
        labels = [str(v) for v in res[cols[0]]]
        mcols = [c for c in cols[1:] if c in num]
        cells = [[j, i, _clean_val(res.iloc[i][c])] for i in range(len(res)) for j, c in enumerate(mcols)]
        return {**base, "type": "heatmap", "xLabel": "", "yLabel": "", "heat": {"xs": mcols, "ys": labels, "cells": cells}}
    if t == "scatter":
        sx, sy = (ys[0] if len(ys) > 1 else x), (ys[1] if len(ys) > 1 else (ys[0] if ys else None))
        if sy is None or sx not in num or sy not in num:
            return None
        lab = next((c for c in cols if c not in num), None)
        pts = [{"x": _clean_val(r[sx]), "y": _clean_val(r[sy]), "name": str(r[lab]) if lab else ""} for _, r in res.iterrows()]
        return {**base, "xLabel": sx, "yLabel": sy, "points": pts}
    if t == "histogram":
        if "bin" in cols and "count" in cols:
            return {**base, "type": "bar", "xLabel": "bin", "yLabel": "count", "x": res["bin"].astype(str).tolist(), "series": [{"name": "count", "data": [_clean_val(v) for v in res["count"]]}]}
        return None
    if t == "box":
        need = ["min", "q1", "median", "q3", "max"]
        if not all(c in cols for c in need):
            return None
        return {**base, "x": res[cols[0]].astype(str).tolist(), "box": res[need].astype(float).round(4).values.tolist(), "yLabel": plan.variables[0] if plan.variables else ""}
    if t == "pie":
        y = ys[0] if ys else next((c for c in num if c != x), None)
        if y is None:
            return None
        return {**base, "pie": [{"name": str(a), "value": _clean_val(b)} for a, b in zip(res[x], res[y]) if _clean_val(b) is not None and b > 0]}

    # bar / line / area
    if hint.series and hint.series in cols and ys:   # long format -> series per value
        wide = res.pivot_table(index=x, columns=hint.series, values=ys[0], aggfunc="mean").sort_index()
        wide = wide.iloc[:, :12]
        return {**base, "x": [str(i) for i in wide.index], "series": [{"name": str(c), "data": [_clean_val(v) for v in wide[c]]} for c in wide.columns], "yLabel": ys[0]}
    ys = ys or [c for c in num if c != x][:8]
    if not ys:
        return None
    return {**base, "x": [str(v) for v in res[x]], "series": [{"name": c, "data": [_clean_val(v) for v in res[c]]} for c in ys[:12]]}
