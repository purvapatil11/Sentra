from fastapi import APIRouter

from backend.app.db.database import list_cases


router = APIRouter(
    prefix="/cases",
    tags=["cases"],
)


@router.get("")
def get_cases(
    run_id: str | None = None,
    limit: int = 100,
):
    return {
        "cases": list_cases(
            run_id=run_id,
            limit=limit,
        )
    }
