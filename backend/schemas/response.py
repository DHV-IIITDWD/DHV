"""Pydantic models: the analysis plan Gemini must produce (validated) and the API responses."""
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field

Op = Literal["query", "pivot", "correlation", "change", "volatility", "outliers", "describe", "distribution"]
Agg = Literal["mean", "sum", "min", "max", "median", "count", "nunique", "std"]
FOp = Literal["eq", "ne", "gt", "gte", "lt", "lte", "in", "contains", "between"]
ChartType = Literal["none", "bar", "line", "area", "pie", "scatter", "histogram", "heatmap", "box"]


class Filter(BaseModel):
    column: str
    op: FOp = "eq"
    value: Any


class Metric(BaseModel):
    column: str
    agg: Agg = "mean"
    alias: Optional[str] = None


class Sort(BaseModel):
    by: str
    desc: bool = True


class ChartHint(BaseModel):
    type: ChartType = "none"
    x: Optional[str] = None
    y: list[str] = Field(default_factory=list)
    series: Optional[str] = None      # long-format column to split into series
    title: Optional[str] = None


class Plan(BaseModel):
    intent: str = ""
    operation: Op = "query"
    filters: list[Filter] = Field(default_factory=list)
    group_by: list[str] = Field(default_factory=list)
    metrics: list[Metric] = Field(default_factory=list)
    select: list[str] = Field(default_factory=list)       # plain columns for op=query without grouping
    sort: Optional[Sort] = None
    limit: Optional[int] = Field(default=None, ge=1, le=500)
    index: Optional[str] = None                           # pivot
    columns: Optional[str] = None
    values: Optional[str] = None
    agg: Agg = "mean"
    variables: list[str] = Field(default_factory=list)    # correlation / describe / outliers / distribution
    method: Literal["pearson", "spearman"] = "pearson"
    entity: Optional[str] = None                          # change / volatility
    time: Optional[str] = None
    value: Optional[str] = None
    from_t: Optional[Any] = None
    to_t: Optional[Any] = None
    direction: Literal["increase", "decrease", "abs"] = "increase"
    bins: int = Field(default=10, ge=2, le=50)
    chart: ChartHint = Field(default_factory=ChartHint)
    needs_clarification: Optional[str] = None             # set when the question can't be mapped to the dataset


class Explanation(BaseModel):
    answer: str
    insights: list[str] = Field(default_factory=list)
