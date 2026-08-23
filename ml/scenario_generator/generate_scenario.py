import uuid
from typing import Dict
import json
from pathlib import Path

from jsonschema import validate
from jsonschema.exceptions import ValidationError


def validate_scenario(scenario: dict) -> bool:

    project_root = Path(__file__).resolve().parents[2]

    schema_path = (
        project_root
        / "shared"
        / "schemas"
        / "scenario_schema.json"
    )

    with open(schema_path, "r", encoding="utf-8") as file:
        schema = json.load(file)

    try:
        validate(instance=scenario, schema=schema)
        return True

    except ValidationError as error:
        print("Scenario validation failed:")
        print(error.message)
        return False


def generate_scenario(attack_family: str) -> Dict:

    scenario_id = f"SCN-{uuid.uuid4().hex[:8].upper()}"

    scenarios = {

        "account_takeover": {
            "scenario_id": scenario_id,
            "attack_family": "account_takeover",
            "target_profile": "existing_customer",
            "fraud_ratio": 0.10,
            "amount_multiplier": 3.5,
            "velocity_multiplier": 4.0,
            "new_device_probability": 0.85,
            "new_beneficiary_probability": 0.80,
            "geo_anomaly_probability": 0.70,
            "evasion_strength": 0.30,
            "attack_round": 1,
            "mutation_strategy": "baseline",
            "objective": "maximize_detection_evasion"
        },

        "ai_social_engineering": {
            "scenario_id": scenario_id,
            "attack_family": "ai_social_engineering",
            "target_profile": "high_value_customer",
            "fraud_ratio": 0.08,
            "amount_multiplier": 2.8,
            "velocity_multiplier": 1.5,
            "new_device_probability": 0.20,
            "new_beneficiary_probability": 0.90,
            "geo_anomaly_probability": 0.10,
            "evasion_strength": 0.50,
            "attack_round": 1,
            "mutation_strategy": "baseline",
            "objective": "maximize_detection_evasion"
        },

        "synthetic_identity": {
            "scenario_id": scenario_id,
            "attack_family": "synthetic_identity",
            "target_profile": "new_customer",
            "fraud_ratio": 0.15,
            "amount_multiplier": 1.8,
            "velocity_multiplier": 2.0,
            "new_device_probability": 0.35,
            "new_beneficiary_probability": 0.65,
            "geo_anomaly_probability": 0.20,
            "evasion_strength": 0.70,
            "attack_round": 1,
            "mutation_strategy": "baseline",
            "objective": "maximize_detection_evasion"
        }
    }

    if attack_family not in scenarios:
        raise ValueError(
            f"Unsupported attack family: {attack_family}"
        )

    return scenarios[attack_family]


def mutate_scenario(
    scenario: dict,
    feedback: dict,
) -> dict:
    next_scenario = dict(scenario)
    mutation = feedback.get(
        "recommended_mutation",
        "baseline",
    )

    next_scenario["scenario_id"] = f"SCN-{uuid.uuid4().hex[:8].upper()}"
    next_scenario["attack_round"] = int(
        scenario.get("attack_round", 1)
    ) + 1
    next_scenario["mutation_strategy"] = mutation

    evasion_rate = float(feedback.get("evasion_rate", 0) or 0)
    detection_rate = float(feedback.get("detection_rate", 0) or 0)

    if mutation == "reduce_amount":
        next_scenario["amount_multiplier"] *= 0.80
    elif mutation == "lower_velocity":
        next_scenario["velocity_multiplier"] *= 0.75
    elif mutation == "reuse_device":
        next_scenario["new_device_probability"] *= 0.55
    elif mutation == "delay_beneficiary":
        next_scenario["new_beneficiary_probability"] *= 0.65
    elif mutation == "reduce_geo_anomaly":
        next_scenario["geo_anomaly_probability"] *= 0.60
    elif mutation == "mixed":
        next_scenario["amount_multiplier"] *= 0.88
        next_scenario["velocity_multiplier"] *= 0.85
        next_scenario["new_device_probability"] *= 0.80
        next_scenario["geo_anomaly_probability"] *= 0.80

    if detection_rate >= 0.70:
        next_scenario["evasion_strength"] += 0.12
    elif evasion_rate >= 0.50:
        next_scenario["fraud_ratio"] += 0.02

    bounded_probability_fields = [
        "fraud_ratio",
        "new_device_probability",
        "new_beneficiary_probability",
        "geo_anomaly_probability",
        "evasion_strength",
    ]

    for field in bounded_probability_fields:
        next_scenario[field] = round(
            max(0.0, min(1.0, float(next_scenario[field]))),
            4,
        )

    for field in ["amount_multiplier", "velocity_multiplier"]:
        next_scenario[field] = round(
            max(0.1, float(next_scenario[field])),
            4,
        )

    if not validate_scenario(next_scenario):
        raise ValueError("Mutated scenario failed schema validation.")

    return next_scenario

if __name__ == "__main__":

    scenario = generate_scenario("account_takeover")

    if validate_scenario(scenario):
        print("Scenario is valid")
        print(json.dumps(scenario, indent=2))

    else:
        print("Scenario is invalid")
