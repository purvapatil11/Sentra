import random
import uuid


CUSTOMER_SEGMENTS = [
    "retail",
    "student",
    "salary",
    "small_business",
    "high_value",
]

HOME_REGIONS = [
    "Bengaluru",
    "Mumbai",
    "Delhi NCR",
    "Hyderabad",
    "Chennai",
    "Pune",
]


def generate_customers(count: int = 100):
    customers = []

    for _ in range(count):
        segment = random.choice(CUSTOMER_SEGMENTS)

        if segment == "high_value":
            avg_transaction_amount = round(random.uniform(8000, 30000), 2)
            account_age_days = random.randint(365, 3000)
            device_trust_score = round(random.uniform(0.65, 1.0), 2)
        elif segment == "student":
            avg_transaction_amount = round(random.uniform(150, 2500), 2)
            account_age_days = random.randint(30, 900)
            device_trust_score = round(random.uniform(0.45, 0.95), 2)
        elif segment == "small_business":
            avg_transaction_amount = round(random.uniform(3000, 18000), 2)
            account_age_days = random.randint(180, 2400)
            device_trust_score = round(random.uniform(0.55, 0.98), 2)
        else:
            avg_transaction_amount = round(random.uniform(500, 10000), 2)
            account_age_days = random.randint(30, 2000)
            device_trust_score = round(random.uniform(0.5, 1.0), 2)

        customer = {
            "customer_id": f"CUS_{uuid.uuid4().hex[:8]}",
            "segment": segment,
            "home_region": random.choice(HOME_REGIONS),
            "avg_transaction_amount": avg_transaction_amount,
            "account_age_days": account_age_days,
            "device_trust_score": device_trust_score,
        }

        customers.append(customer)

    return customers

if __name__ == "__main__":
    customers = generate_customers(5)

    for customer in customers:
        print(customer)
