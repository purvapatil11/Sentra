from fastapi import APIRouter

from backend.app.db.database import list_transactions


router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
)


@router.get("")
def get_transactions(
    run_id: str | None = None,
    limit: int = 100,
):
    return {
        "transactions": list_transactions(
            run_id=run_id,
            limit=limit,
        )
    }
