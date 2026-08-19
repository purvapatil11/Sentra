import random
import uuid


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

if __name__ == "__main__":
    from generate_customers import generate_customers

    customers = generate_customers(1)
    transaction = generate_customers(customers[0])
    print(transaction)