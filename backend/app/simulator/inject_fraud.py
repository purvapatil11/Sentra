import random


ATTACK_FAMILIES = [
    "account_takeover",
    "ai_social_engineering",
    "synthetic_identity"
]


def inject_fraud(transaction, attack_family=None):
    """
    Convert a normal transaction into a synthetic fraud transaction.
    """

    if attack_family is None:
        attack_family = random.choice(ATTACK_FAMILIES)

    transaction = transaction.copy()

    transaction["attack_type"] = attack_family
    transaction["label"] = 1

    if attack_family == "account_takeover":
        transaction = apply_account_takeover(transaction)

    elif attack_family == "ai_social_engineering":
        transaction = apply_ai_social_engineering(transaction)

    elif attack_family == "synthetic_identity":
        transaction = apply_synthetic_identity(transaction)

    return transaction


def apply_account_takeover(transaction):
    """
    Simulate an attacker gaining access to an existing customer's account.
    """

    transaction["amount"] = round(
        transaction["customer_avg_amount"] * random.uniform(2.0, 4.0),
        2
    )

    transaction["amount_ratio"] = round(
        transaction["amount"] /
        transaction["customer_avg_amount"],
        2
    )

    transaction["is_new_device"] = 1
    transaction["device_trust_score"] = round(
        random.uniform(0.1, 0.4),
        2
    )

    transaction["geo_distance_km"] = round(
        random.uniform(100, 1000),
        2
    )

    transaction["velocity_10m"] = random.randint(3, 8)
    transaction["velocity_24h"] = random.randint(10, 30)

    return transaction


def apply_ai_social_engineering(transaction):
    """
    Simulate fraud caused by AI-assisted social engineering.
    """

    transaction["amount"] = round(
        transaction["customer_avg_amount"] * random.uniform(1.5, 3.0),
        2
    )

    transaction["amount_ratio"] = round(
        transaction["amount"] /
        transaction["customer_avg_amount"],
        2
    )

    transaction["is_new_beneficiary"] = 1
    transaction["beneficiary_age_minutes"] = random.randint(1, 60)

    transaction["authentication_success"] = 1

    transaction["velocity_10m"] = random.randint(2, 5)
    transaction["velocity_24h"] = random.randint(5, 15)

    return transaction


def apply_synthetic_identity(transaction):
    """
    Simulate transactions associated with a synthetic identity.
    """

    transaction["amount"] = round(
        transaction["customer_avg_amount"] * random.uniform(1.2, 2.5),
        2
    )

    transaction["amount_ratio"] = round(
        transaction["amount"] /
        transaction["customer_avg_amount"],
        2
    )

    transaction["account_age_days"] = random.randint(1, 60)

    transaction["is_new_device"] = 1
    transaction["is_new_beneficiary"] = 1

    transaction["device_trust_score"] = round(
        random.uniform(0.2, 0.6),
        2
    )

    transaction["beneficiary_age_minutes"] = random.randint(1, 120)

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