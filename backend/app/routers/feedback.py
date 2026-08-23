from pathlib import Path
import sys

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.db.database import (
    get_run,
    latest_run,
    list_cases,
    list_transactions,
    save_feedback,
)
from backend.app.events import publish_event
from ml.scenario_generator.generate_scenario import mutate_scenario


router = APIRouter(
    prefix="/feedback",
    tags=["feedback"],
)


class FeedbackRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    run_id: str | None = None
    notes: str | None = None


def choose_mutation(
    false_positive_rate: float,
    detection_rate: float,
    average_risk_score: float,
) -> str:
    if false_positive_rate >= 0.15:
        return "mixed"

    if detection_rate >= 0.85:
        return "reduce_amount"

    if detection_rate >= 0.70:
        return "lower_velocity"

    if average_risk_score >= 0.75:
        return "reuse_device"

    return "baseline"


@router.post("")
def create_feedback(payload: FeedbackRequest):
    run = (
        get_run(payload.run_id)
        if payload.run_id
        else latest_run()
    )

    if run is None:
        raise HTTPException(
            status_code=404,
            detail="No simulation run found.",
        )

    run_id = run["run_id"]
    publish_event(
        "LOOP",
        f"Blue Team feedback analysis started for {run_id}",
        run_id=run_id,
    )
    transactions = list_transactions(
        run_id=run_id,
        limit=run["total_transactions"],
    )
    cases = list_cases(
        run_id=run_id,
        limit=run["total_transactions"],
    )

    fraud_transactions = [
        transaction
        for transaction in transactions
        if transaction["label"] == 1
    ]
    legitimate_transactions = [
        transaction
        for transaction in transactions
        if transaction["label"] == 0
    ]

    flagged_transaction_ids = {
        case["transaction_id"]
        for case in cases
        if case["decision"] in {"VERIFY", "BLOCK"}
    }

    fraud_detected = sum(
        transaction["transaction_id"] in flagged_transaction_ids
        for transaction in fraud_transactions
    )
    fraud_missed = len(fraud_transactions) - fraud_detected
    false_positives = sum(
        transaction["transaction_id"] in flagged_transaction_ids
        for transaction in legitimate_transactions
    )

    detection_rate = (
        fraud_detected / len(fraud_transactions)
        if fraud_transactions
        else 0.0
    )
    evasion_rate = 1.0 - detection_rate
    false_positive_rate = (
        false_positives / len(legitimate_transactions)
        if legitimate_transactions
        else 0.0
    )
    average_risk_score = (
        sum(case["risk_score"] for case in cases) / len(cases)
        if cases
        else 0.0
    )

    recommended_mutation = choose_mutation(
        false_positive_rate=false_positive_rate,
        detection_rate=detection_rate,
        average_risk_score=average_risk_score,
    )

    feedback = {
        "scenario_id": run["scenario_id"],
        "attack_family": run["attack_family"],
        "attack_round": run["attack_round"],
        "total_transactions": len(transactions),
        "fraud_transactions": len(fraud_transactions),
        "fraud_detected": fraud_detected,
        "fraud_missed": fraud_missed,
        "detection_rate": round(detection_rate, 4),
        "evasion_rate": round(evasion_rate, 4),
        "false_positive_rate": round(false_positive_rate, 4),
        "average_risk_score": round(average_risk_score, 4),
        "recommended_mutation": recommended_mutation,
    }

    if payload.notes:
        feedback["notes"] = payload.notes

    try:
        next_scenario = mutate_scenario(
            run["scenario"],
            feedback,
        )
    except ValueError as error:
        publish_event(
            "ERROR",
            f"Adaptive scenario mutation failed validation: {error}",
            level="error",
            run_id=run_id,
        )
        raise HTTPException(status_code=422, detail=str(error)) from error

    save_feedback(run_id, feedback)
    publish_event(
        "LOOP",
        (
            f"Detection {detection_rate:.0%}; evasion {evasion_rate:.0%}; "
            f"next mutation {recommended_mutation}"
        ),
        run_id=run_id,
        data={
            "detection_rate": round(detection_rate, 4),
            "evasion_rate": round(evasion_rate, 4),
            "recommended_mutation": recommended_mutation,
        },
    )
    publish_event(
        "RED",
        f"Adaptive round {next_scenario['attack_round']} scenario is ready",
        run_id=run_id,
        data={"scenario_id": next_scenario["scenario_id"]},
    )

    return {
        "run_id": run_id,
        "feedback": feedback,
        "next_scenario": next_scenario,
    }
