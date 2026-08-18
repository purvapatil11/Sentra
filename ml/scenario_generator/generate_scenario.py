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

if __name__ == "__main__":

    scenario = generate_scenario("account_takeover")

    if validate_scenario(scenario):
        print("✅ Scenario is valid")
        print(json.dumps(scenario, indent=2))

    else:
        print("❌ Scenario is invalid")