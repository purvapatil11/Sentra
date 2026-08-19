import random
import uuid


def generate_customers(count: int = 100):
    customers = []

    for _ in range(count):
        customer = {
            "customer_id": f"CUS_{uuid.uuid4().hex[:8]}",
            "avg_transaction_amount": round(random.uniform(500, 10000), 2),
            "account_age_days": random.randint(30, 2000),
            "device_trust_score": round(random.uniform(0.5, 1.0), 2)
        }

        customers.append(customer)

    return customers

if __name__ == "__main__":
    customers = generate_customers(5)

    for customer in customers:
        print(customer)