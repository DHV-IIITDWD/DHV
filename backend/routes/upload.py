from fastapi import APIRouter, File, HTTPException, UploadFile
from config import MAX_UPLOAD_MB
from services import dataset_service as ds

router = APIRouter()


@router.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(400, "Only .csv files are supported.")
    raw = await file.read(MAX_UPLOAD_MB * 1024 * 1024 + 1)
    if len(raw) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(413, f"File too large. Maximum upload size is {MAX_UPLOAD_MB} MB.")
    try:
        return {"success": True, "dataset": ds.load_csv_bytes(raw, file.filename or "uploaded.csv")}
    except ds.DatasetError as exc:
        raise HTTPException(400, str(exc)) from exc
