import logging

from fastapi import APIRouter, HTTPException

from models.schemas import GenerateRequest, GenerateResponse
from services.watsonx import generate_facets

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/planner", tags=["planner"])


@router.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    try:
        result = generate_facets(request)
    except Exception as exc:
        logger.error("generate_facets failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))
    return result
