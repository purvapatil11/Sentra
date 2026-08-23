from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

from backend.app.db.database import (
    customer_summary,
    list_customers,
    save_customers,
)
from backend.app.simulator.generate_customers import generate_customers


router = APIRouter(
    prefix="/customers",
    tags=["customers"],
)


class GenerateCustomersRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    count: int = Field(default=100, ge=1, le=10000)


@router.post("/generate")
def create_customers(payload: GenerateCustomersRequest):
    customers = generate_customers(payload.count)
    save_customers(customers)

    return {
        "created": len(customers),
        "customers": customers[:20],
        "summary": customer_summary(),
    }


@router.get("")
def get_customers(limit: int = 100):
    return {
        "customers": list_customers(limit=limit),
        "summary": customer_summary(),
    }


@router.get("/summary")
def get_customer_summary():
    return customer_summary()
