from pathlib import Path
import sys
import uuid
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field


PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.db.database import (
    list_runs,
    save_cases,
    save_run,
    save_transactions,
)
from backend.app.events import publish_event
from backend.app.simulator.generate_transactions import generate_transaction_batch
from ml.models.predict import predict_transaction
from ml.scenario_generator.scenario_service import get_scenario


router = APIRouter(
    prefix="/simulate",
    tags=["simulate"],
)


class LaunchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    attack_family: Literal[
        "account_takeover",
        "ai_social_engineering",
        "synthetic_identity",
    ] = "account_takeover"
    volume: int = Field(default=250, ge=1, le=5000)
    fraud_ratio: float | None = Field(default=None, ge=0, le=1)
    score_all: bool = True


@router.post("/launch")
def launch_simulation(payload: LaunchRequest):
    run_id = f"RUN-{uuid.uuid4().hex[:8].upper()}"
    publish_event(
        "EDGE",
        f"Simulation request accepted for {payload.attack_family}",
        run_id=run_id,
        data={"volume": payload.volume, "fraud_ratio": payload.fraud_ratio},
    )
    publish_event(
        "AGENT",
        "Requesting an adversarial scenario from the Red Team agent",
        run_id=run_id,
    )

    try:
        scenario = get_scenario(payload.attack_family)
    except ValueError as error:
        publish_event(
            "ERROR",
            f"Scenario generation rejected: {error}",
            level="error",
            run_id=run_id,
        )
        raise HTTPException(status_code=400, detail=str(error)) from error

    generation = scenario.get("_generation", {})
    generation_source = generation.get("source", "unknown")
    publish_event(
        "RED",
        (
            f"Scenario {scenario['scenario_id']} ready for {scenario['attack_family']} "
            f"via {generation_source}"
        ),
        run_id=run_id,
        data={
            "scenario_id": scenario["scenario_id"],
            "generation_source": generation_source,
            "provider": generation.get("provider"),
            "model": generation.get("model"),
            "response_id": generation.get("response_id"),
        },
    )

    if payload.fraud_ratio is not None:
        scenario["fraud_ratio"] = payload.fraud_ratio

    transactions = generate_transaction_batch(
        total_transactions=payload.volume,
        fraud_ratio=scenario["fraud_ratio"],
        attack_family=scenario["attack_family"],
        evasion_strength=scenario["evasion_strength"],
        hard_negative_ratio=min(0.18, 0.06 + 0.12 * scenario["evasion_strength"]),
        scenario=scenario,
    )
    fraud_count = sum(transaction["label"] == 1 for transaction in transactions)
    publish_event(
        "SIM",
        f"Generated {len(transactions)} transactions with {fraud_count} labeled fraud attempts",
        run_id=run_id,
        data={
            "transactions": len(transactions),
            "fraud_transactions": fraud_count,
            "evasion_strength": scenario["evasion_strength"],
        },
    )

    cases = []
    scored_transactions = []
    if payload.score_all:
        publish_event(
            "MODEL",
            f"Fusion engine started scoring {len(transactions)} transactions",
            run_id=run_id,
        )
        try:
            checkpoints = {
                max(1, round(len(transactions) * fraction))
                for fraction in (0.25, 0.5, 0.75, 1.0)
            }
            for index, transaction in enumerate(transactions, start=1):
                result = predict_transaction(transaction)
                scored_transactions.append({
                    **transaction,
                    "score": result,
                })

                if result["decision"] in {"VERIFY", "BLOCK"}:
                    cases.append(result)

                if index in checkpoints:
                    publish_event(
                        "MODEL",
                        f"Scoring progress {index}/{len(transactions)}",
                        run_id=run_id,
                        data={"processed": index, "total": len(transactions)},
                    )
        except FileNotFoundError as error:
            publish_event(
                "ERROR",
                f"Fraud model artifacts unavailable: {error}",
                level="error",
                run_id=run_id,
            )
            raise HTTPException(
                status_code=503,
                detail=f"Fraud models are not trained yet: {error}",
            ) from error
    else:
        scored_transactions = transactions

    save_run(run_id, scenario, transactions)
    save_transactions(run_id, scored_transactions)
    save_cases(run_id, cases)
    blocked = sum(case["decision"] == "BLOCK" for case in cases)
    verified = sum(case["decision"] == "VERIFY" for case in cases)
    publish_event(
        "POLICY",
        f"Decisioning completed: {blocked} blocked, {verified} sent to verification",
        run_id=run_id,
        data={"blocked": blocked, "verified": verified, "cases": len(cases)},
    )
    publish_event(
        "SYSTEM",
        f"Run {run_id} persisted and available to Blue Team Cases",
        run_id=run_id,
        data={"scenario_id": scenario["scenario_id"]},
    )

    return {
        "run_id": run_id,
        "scenario": scenario,
        "total_transactions": len(transactions),
        "fraud_transactions": fraud_count,
        "flagged_cases": len(cases),
    }


@router.get("/runs")
def get_runs(limit: int = 20):
    return {
        "runs": list_runs(limit=limit)
    }
