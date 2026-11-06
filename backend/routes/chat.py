"""Natural-language analytics endpoints used by the existing React AIQuery page."""
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services import dataset_service as ds, analysis_service as an
from services import gemini_service as llm

router = APIRouter()


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)
    dataset_id: str | None = "active_dataset"
    history: list[dict[str, Any]] = Field(default_factory=list, max_length=8)


class SimpleChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)


def _http_error(exc: llm.LLMError):
    raise HTTPException(status_code=exc.status, detail={"message": str(exc), "provider": exc.provider, "retryable": exc.status in (408, 429, 500, 502, 503, 504)})


@router.post("/api/ai/query")
@router.post("/api/chat")
def ai_query(body: ChatRequest):
    question = body.question.strip()
    if not question:
        raise HTTPException(422, "Question cannot be empty.")
    try:
        meta = ds.get_meta()
        df = ds.get_df()
        hints = ds.entity_hints(question)
        plan = llm.make_plan(question, meta, hints, body.history)
        if plan.needs_clarification:
            return {
                "success": True, "intent": "Clarification needed", "operation": "clarification",
                "filters": {}, "chart_type": "none", "chart": None,
                "explanation": plan.needs_clarification, "warnings": [], "insights": [],
                "data": [], "sql_or_analysis": "No analysis executed.", "plan": plan.model_dump(),
            }
        try:
            result, description, warnings = an.run(plan, df)
        except an.PlanError as exc:
            raise HTTPException(422, f"The generated analysis plan could not be executed safely: {exc}") from exc
        records = an.to_records(result)
        chart = an.build_chart(result, plan.chart, plan) if not result.empty else None
        try:
            explanation = llm.explain(question, plan, description, records, len(result), warnings)
            answer, insights = explanation.answer, explanation.insights
        except llm.LLMError:
            # Computation remains useful even if the second LLM call hits a temporary outage.
            answer = f"I computed the requested analysis: {description}. The result contains {len(result)} row(s). See the result table and chart below."
            insights = []
        except (ValueError, TypeError):
            answer = f"I computed the requested analysis: {description}. The result contains {len(result)} row(s)."
            insights = []
        return {
            "success": True,
            "intent": plan.intent or description,
            "filters": [f.model_dump() for f in plan.filters],
            "operation": plan.operation,
            "chart_type": chart.get("type", "none") if chart else "none",
            "chart": chart,
            "explanation": answer,
            "warnings": warnings,
            "insights": insights,
            "data": records,
            "sql_or_analysis": f"Pandas analysis: {description}",
            "plan": plan.model_dump(),
        }
    except llm.LLMError as exc:
        _http_error(exc)
    except ds.DatasetError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/chat")
def simple_chat(body: SimpleChatRequest):
    """Compatibility endpoint for direct text prompts; dataset analytics should use /api/ai/query."""
    try:
        text = llm._generate(
            "You are a helpful assistant for a NIRF analytics dashboard. Be concise and do not invent dataset statistics.",
            body.prompt,
        )
        return {"response": text, "provider": "gemini"}
    except llm.LLMError as exc:
        _http_error(exc)
