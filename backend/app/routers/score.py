from pathlib import Path
import sys
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field


PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.models.predict import predict_transaction


router = APIRouter(
    prefix="/score",
    tags=["score"],
)


class ScoreRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    amount: float = Field(ge=0)
    customer_avg_amount: float = Field(ge=0)
    amount_ratio: float = Field(ge=0)
    transaction_hour: int = Field(ge=0, le=23)
    velocity_10m: int = Field(ge=0)
    velocity_24h: int = Field(ge=0)
    account_age_days: int = Field(ge=0)
    beneficiary_age_minutes: int = Field(ge=0)
    device_trust_score: float = Field(ge=0, le=1)
    geo_distance_km: float = Field(ge=0)
    is_new_device: Literal[0, 1]
    is_new_beneficiary: Literal[0, 1]
    channel: Literal["upi", "card", "net_banking", "wallet"]
    authentication_method: Literal[
        "pin",
        "otp",
        "biometric",
        "password",
        "none",
    ]
    authentication_success: Literal[0, 1]
    transaction_id: str | None = None


@router.post("")
def score_transaction(payload: ScoreRequest):
    transaction = payload.model_dump()

    if transaction["transaction_id"] is None:
        transaction.pop("transaction_id")

    try:
        return predict_transaction(transaction)
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail=f"Fraud models are not trained yet: {error}",
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error
