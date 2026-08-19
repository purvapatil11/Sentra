from __future__ import annotations

from typing import Any


def get_top_risk_factors(
    transaction: dict[str, Any],
    limit: int = 4,
) -> list[dict[str, Any]]:
    factors: list[dict[str, Any]] = []

    amount_ratio = float(transaction.get("amount_ratio", 0) or 0)
    if amount_ratio >= 5:
        factors.append(
            {
                "feature": "amount_ratio",
                "value": amount_ratio,
                "reason": "Amount is far above the customer's normal spend.",
            }
        )
    elif amount_ratio >= 2:
        factors.append(
            {
                "feature": "amount_ratio",
                "value": amount_ratio,
                "reason": "Amount is noticeably above customer baseline.",
            }
        )

    velocity_10m = int(transaction.get("velocity_10m", 0) or 0)
    if velocity_10m >= 6:
        factors.append(
            {
                "feature": "velocity_10m",
                "value": velocity_10m,
                "reason": "Short-window transaction velocity is elevated.",
            }
        )

    beneficiary_age = int(transaction.get("beneficiary_age_minutes", 999999) or 0)
    if beneficiary_age <= 30:
        factors.append(
            {
                "feature": "beneficiary_age_minutes",
                "value": beneficiary_age,
                "reason": "Beneficiary was added shortly before payment.",
            }
        )

    device_trust = float(transaction.get("device_trust_score", 1) or 0)
    if device_trust <= 0.35:
        factors.append(
            {
                "feature": "device_trust_score",
                "value": device_trust,
                "reason": "Device trust is low for this transaction.",
            }
        )

    geo_distance = float(transaction.get("geo_distance_km", 0) or 0)
    if geo_distance >= 500:
        factors.append(
            {
                "feature": "geo_distance_km",
                "value": geo_distance,
                "reason": "Transaction location is far from expected activity.",
            }
        )

    if int(transaction.get("is_new_device", 0) or 0) == 1:
        factors.append(
            {
                "feature": "is_new_device",
                "value": 1,
                "reason": "Payment originated from a new device.",
            }
        )

    if int(transaction.get("is_new_beneficiary", 0) or 0) == 1:
        factors.append(
            {
                "feature": "is_new_beneficiary",
                "value": 1,
                "reason": "Payment is going to a new beneficiary.",
            }
        )

    return factors[:limit]


def build_explanation(
    transaction: dict[str, Any],
    risk_result: dict[str, Any],
    top_risk_factors: list[dict[str, Any]] | None = None,
) -> str:
    factors = top_risk_factors or get_top_risk_factors(transaction)
    decision = risk_result["decision"]
    risk_score = risk_result["risk_score"]

    if not factors:
        return (
            f"Decision {decision}: fused risk score is {risk_score:.2f}; "
            "no individual feature crossed a high-risk rule threshold."
        )

    factor_text = "; ".join(
        f"{factor['feature']}={factor['value']}"
        for factor in factors[:3]
    )

    return (
        f"Decision {decision}: fused risk score is {risk_score:.2f}, driven by "
        f"{factor_text}."
    )
