import random


ATTACK_FAMILIES = [
    "account_takeover",
    "ai_social_engineering",
    "synthetic_identity"
]


def _clamp_probability(value):
    return max(0.0, min(1.0, float(value)))


def _blend(obvious_value, normal_value, evasion_strength):
    """Move an attack signal toward normal behavior as evasion increases."""
    return (
        obvious_value * (1.0 - evasion_strength)
        + normal_value * evasion_strength
    )


def inject_fraud(
    transaction,
    attack_family=None,
    evasion_strength=0.0,
    scenario=None,
):
    """
    Convert a normal transaction into a synthetic fraud transaction.
    """

    if attack_family is None:
        attack_family = random.choice(ATTACK_FAMILIES)

    transaction = transaction.copy()
    scenario = scenario or {}
    evasion_strength = _clamp_probability(evasion_strength)
    # Evasive campaigns contain a mixture of recognizable and stealthy attempts.
    # Applying the same blend to every transaction creates an artificial score
    # cluster and can make an entire attack family uniformly undetectable.
    applied_evasion = (
        evasion_strength
        if random.random() < evasion_strength
        else 0.0
    )

    transaction["attack_type"] = attack_family
    transaction["label"] = 1

    if attack_family == "account_takeover":
        transaction = apply_account_takeover(
            transaction,
            applied_evasion,
            scenario,
        )

    elif attack_family == "ai_social_engineering":
        transaction = apply_ai_social_engineering(
            transaction,
            applied_evasion,
            scenario,
        )

    elif attack_family == "synthetic_identity":
        transaction = apply_synthetic_identity(
            transaction,
            applied_evasion,
            scenario,
        )

    return transaction


def apply_account_takeover(transaction, evasion_strength=0.0, scenario=None):
    """
    Simulate an attacker gaining access to an existing customer's account.
    """

    scenario = scenario or {}
    normal_ratio = transaction["amount_ratio"]
    amount_multiplier = float(scenario.get("amount_multiplier", 3.0))
    obvious_ratio = random.uniform(
        max(1.8, amount_multiplier * 0.75),
        max(2.2, amount_multiplier * 1.2),
    )
    amount_ratio = _blend(obvious_ratio, max(0.8, normal_ratio), evasion_strength)
    transaction["amount"] = round(transaction["customer_avg_amount"] * amount_ratio, 2)

    transaction["amount_ratio"] = round(
        transaction["amount"] /
        transaction["customer_avg_amount"],
        2
    )

    new_device_probability = max(
        0.75,
        float(scenario.get("new_device_probability", 1.0)),
    )
    transaction["is_new_device"] = int(
        random.random() < new_device_probability * (1.0 - 0.65 * evasion_strength)
    )
    suspicious_trust = random.uniform(0.1, 0.4)
    transaction["device_trust_score"] = round(
        _blend(suspicious_trust, transaction["device_trust_score"], evasion_strength), 2
    )

    geo_probability = float(scenario.get("geo_anomaly_probability", 1.0))
    if random.random() < geo_probability * (1.0 - 0.55 * evasion_strength):
        transaction["geo_distance_km"] = round(
            _blend(random.uniform(100, 1000), transaction["geo_distance_km"], evasion_strength),
            2,
        )

    velocity_multiplier = float(scenario.get("velocity_multiplier", 3.0))
    transaction["velocity_10m"] = round(
        _blend(random.randint(3, 8) * max(0.5, velocity_multiplier / 3), transaction["velocity_10m"], evasion_strength)
    )
    transaction["velocity_24h"] = round(
        _blend(random.randint(10, 30), transaction["velocity_24h"], evasion_strength)
    )

    return transaction


def apply_ai_social_engineering(transaction, evasion_strength=0.0, scenario=None):
    """
    Simulate fraud caused by AI-assisted social engineering.
    """

    scenario = scenario or {}
    normal_ratio = transaction["amount_ratio"]
    amount_multiplier = float(scenario.get("amount_multiplier", 2.2))
    obvious_ratio = random.uniform(max(1.4, amount_multiplier * 0.7), max(1.8, amount_multiplier * 1.1))
    amount_ratio = _blend(obvious_ratio, max(0.8, normal_ratio), evasion_strength)
    transaction["amount"] = round(transaction["customer_avg_amount"] * amount_ratio, 2)

    transaction["amount_ratio"] = round(
        transaction["amount"] /
        transaction["customer_avg_amount"],
        2
    )

    beneficiary_probability = max(
        0.75,
        float(scenario.get("new_beneficiary_probability", 1.0)),
    )
    transaction["is_new_beneficiary"] = int(
        random.random() < beneficiary_probability * (1.0 - 0.35 * evasion_strength)
    )
    transaction["beneficiary_age_minutes"] = round(
        _blend(random.randint(1, 60), transaction["beneficiary_age_minutes"], evasion_strength)
    )

    transaction["authentication_success"] = 1

    transaction["velocity_10m"] = round(
        _blend(random.randint(2, 5), transaction["velocity_10m"], evasion_strength)
    )
    transaction["velocity_24h"] = round(
        _blend(random.randint(5, 15), transaction["velocity_24h"], evasion_strength)
    )

    return transaction


def apply_synthetic_identity(transaction, evasion_strength=0.0, scenario=None):
    """
    Simulate transactions associated with a synthetic identity.
    """

    scenario = scenario or {}
    normal_ratio = transaction["amount_ratio"]
    amount_multiplier = float(scenario.get("amount_multiplier", 1.8))
    obvious_ratio = random.uniform(max(1.15, amount_multiplier * 0.7), max(1.5, amount_multiplier * 1.15))
    amount_ratio = _blend(obvious_ratio, max(0.8, normal_ratio), evasion_strength)
    transaction["amount"] = round(transaction["customer_avg_amount"] * amount_ratio, 2)

    transaction["amount_ratio"] = round(
        transaction["amount"] /
        transaction["customer_avg_amount"],
        2
    )

    transaction["account_age_days"] = round(
        _blend(random.randint(1, 60), transaction["account_age_days"], evasion_strength)
    )

    new_device_probability = max(
        0.70,
        float(scenario.get("new_device_probability", 1.0)),
    )
    beneficiary_probability = max(
        0.80,
        float(scenario.get("new_beneficiary_probability", 1.0)),
    )
    transaction["is_new_device"] = int(
        random.random() < new_device_probability * (1.0 - 0.4 * evasion_strength)
    )
    transaction["is_new_beneficiary"] = int(
        random.random() < beneficiary_probability * (1.0 - 0.3 * evasion_strength)
    )

    transaction["device_trust_score"] = round(
        _blend(random.uniform(0.2, 0.6), transaction["device_trust_score"], evasion_strength),
        2,
    )

    transaction["beneficiary_age_minutes"] = round(
        _blend(random.randint(1, 120), transaction["beneficiary_age_minutes"], evasion_strength)
    )

    return transaction


if __name__ == "__main__":
    from generate_customers import generate_customers
    from generate_transactions import generate_transaction

    customers = generate_customers(1)

    normal_transaction = generate_transaction(customers[0])

    print("\nNORMAL TRANSACTION:")
    print(normal_transaction)

    print("\nFRAUD TRANSACTIONS:")

    for attack in ATTACK_FAMILIES:
        fraud_transaction = inject_fraud(
            normal_transaction,
            attack
        )

        print(f"\n{attack.upper()}:")
        print(fraud_transaction)
