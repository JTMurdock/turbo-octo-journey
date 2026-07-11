from fastapi import APIRouter

router = APIRouter(prefix="/planner", tags=["planner"])


@router.post("/generate")
def generate_placeholder():
    # Full implementation in Sub-Task 2
    return {"message": "planner endpoint scaffolded"}
