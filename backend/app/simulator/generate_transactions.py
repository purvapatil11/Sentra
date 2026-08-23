import random
import uuid

try:
    from .generate_customers import generate_customers
    from .inject_fraud import inject_fraud
except ImportError:
    from generate_customers import generate_customers
    from inject_fraud import inject_fraud


CHANNELS = ["upi", "card", "net_banking", "wallet"]

AUTH_METHODS = [
    "pin",
    "otp",
    "biometric",
    "password",
    "none"
]


def generate_transaction(customer):
    """
    Generate one normal transaction for a customer.
    """

    amount = round(
        random.uniform(
            customer["avg_transaction_amount"] * 0.3,
            customer["avg_transaction_amount"] * 1.5
        ),
        2
    )

    customer_avg_amount = customer["avg_transaction_amount"]

    amount_ratio = round(
        amount / customer_avg_amount,
        2
    )

    transaction = {
        "transaction_id": f"TXN_{uuid.uuid4().hex[:8]}",
        "customer_id": customer["customer_id"],

        "amount": amount,
        "customer_avg_amount": customer_avg_amount,
        "amount_ratio": amount_ratio,

        "transaction_hour": random.randint(0, 23),

        "velocity_10m": random.randint(0, 2),
        "velocity_24h": random.randint(1, 10),

        "account_age_days": customer["account_age_days"],
        "beneficiary_age_minutes": random.randint(60, 50000),

        "device_trust_score": customer["device_trust_score"],
        "geo_distance_km": round(random.uniform(0, 20), 2),

        "is_new_device": 0,
        "is_new_beneficiary": 0,

        "channel": random.choice(CHANNELS),

        "authentication_method": random.choice(
            AUTH_METHODS[:4]
        ),

        "authentication_success": 1,

        "attack_type": None,
        "label": 0
    }

    return transaction


def generate_transactions(
    customer_count: int = 500,
    transactions_per_customer: int = 10,
    fraud_ratio: float = 0.12,
    attack_family: str | None = None,
):
    """
    Generate a labeled transaction dataset for model training and demos.
    """

    if customer_count <= 0:
        raise ValueError("customer_count must be greater than 0")

    if transactions_per_customer <= 0:
        raise ValueError("transactions_per_customer must be greater than 0")

    if not 0 <= fraud_ratio <= 1:
        raise ValueError("fraud_ratio must be between 0 and 1")

    customers = generate_customers(customer_count)
    transactions = []

    for customer in customers:
        for _ in range(transactions_per_customer):
            transaction = generate_transaction(customer)

            if random.random() < fraud_ratio:
                transaction = inject_fraud(transaction, attack_family)

            transactions.append(transaction)

    return transactions


def generate_transaction_batch(
    total_transactions: int = 1000,
    fraud_ratio: float = 0.12,
    attack_family: str | None = None,
    customer_count: int = 250,
):
    """
    Generate a transaction stream with a specific total volume.
    """

    if total_transactions <= 0:
        raise ValueError("total_transactions must be greater than 0")

    if customer_count <= 0:
        raise ValueError("customer_count must be greater than 0")

    if not 0 <= fraud_ratio <= 1:
        raise ValueError("fraud_ratio must be between 0 and 1")

    customers = generate_customers(customer_count)
    transactions = []

    for _ in range(total_transactions):
        customer = random.choice(customers)
        transaction = generate_transaction(customer)

        if random.random() < fraud_ratio:
            transaction = inject_fraud(transaction, attack_family)

        transactions.append(transaction)

    return transactions


if __name__ == "__main__":
    import argparse
    import csv
    from pathlib import Path

    parser = argparse.ArgumentParser(
        description="Generate AegisPay training transactions."
    )
    parser.add_argument("--customers", type=int, default=500)
    parser.add_argument("--transactions-per-customer", type=int, default=10)
    parser.add_argument("--volume", type=int)
    parser.add_argument("--fraud-ratio", type=float, default=0.12)
    parser.add_argument(
        "--attack-family",
        choices=[
            "account_takeover",
            "ai_social_engineering",
            "synthetic_identity",
        ],
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[2]
        / "data"
        / "transactions.csv",
    )

    args = parser.parse_args()

    if args.volume:
        dataset = generate_transaction_batch(
            total_transactions=args.volume,
            customer_count=args.customers,
            fraud_ratio=args.fraud_ratio,
            attack_family=args.attack_family,
        )
    else:
        dataset = generate_transactions(
            customer_count=args.customers,
            transactions_per_customer=args.transactions_per_customer,
            fraud_ratio=args.fraud_ratio,
            attack_family=args.attack_family,
        )

    args.output.parent.mkdir(parents=True, exist_ok=True)

    with args.output.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=dataset[0].keys())
        writer.writeheader()
        writer.writerows(dataset)

    normal_count = sum(transaction["label"] == 0 for transaction in dataset)
    fraud_count = len(dataset) - normal_count

    print(f"Wrote {len(dataset)} transactions to {args.output}")
    print(f"Legitimate: {normal_count}")
    print(f"Fraud: {fraud_count}")
