"""Direct statistical analysis without the LLM: POST a Plan-shaped JSON body, get computed results."""
from fastapi import APIRouter, HTTPException
from schemas.response import Plan
from services import dataset_service as ds, analysis_service as an

router = APIRouter()


@router.post("/api/analyze")
def analyze(plan: Plan):
    try:
        res, desc, warns = an.run(plan, ds.get_df())
    except (an.PlanError, ds.DatasetError) as e:
        raise HTTPException(422, str(e))
    chart = an.build_chart(res, plan.chart, plan) if len(res) else None
    return {"success": True, "data": an.to_records(res), "visualization": chart, "warnings": warns, "sql_or_analysis": f"Pandas analysis: {desc}"}
