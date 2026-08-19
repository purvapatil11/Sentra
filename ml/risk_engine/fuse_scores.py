from __future__ import annotations

from typing import Literal, TypedDict


Decision = Literal["ALLOW", "MONITOR", "VERIFY", "BLOCK"]
RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]


class RiskResult(TypedDict):
    risk_score: float
    risk_level: RiskLevel
    decision: Decision
    action: Decision


def clamp_score(value: float) -> float:
    return max(0.0, min(1.0, float(value)))


def fuse_scores(
    fraud_probability: float,
    anomaly_score: float,
    supervised_weight: float = 0.70,
) -> float:
    """
    Fuse known-pattern and anomaly risk into one score.

    The default 70/30 split favors XGBoost because labeled fraud patterns should
    dominate known attacks, while Isolation Forest still keeps novel behavior in
    the score for adversarial rounds.
    """

    supervised_weight = clamp_score(supervised_weight)
    anomaly_weight = 1.0 - supervised_weight

    risk_score = (
        supervised_weight * clamp_score(fraud_probability)
        + anomaly_weight * clamp_score(anomaly_score)
    )

    return round(clamp_score(risk_score), 4)


def score_to_decision(risk_score: float) -> tuple[RiskLevel, Decision]:
    risk_score = clamp_score(risk_score)

    if risk_score >= 0.90:
        return "CRITICAL", "BLOCK"

    if risk_score >= 0.75:
        return "HIGH", "BLOCK"

    if risk_score >= 0.55:
        return "MEDIUM", "VERIFY"

    if risk_score >= 0.35:
        return "LOW", "MONITOR"

    return "LOW", "ALLOW"


def calculate_risk(
    fraud_probability: float,
    anomaly_score: float,
    supervised_weight: float = 0.70,
) -> RiskResult:
    risk_score = fuse_scores(
        fraud_probability=fraud_probability,
        anomaly_score=anomaly_score,
        supervised_weight=supervised_weight,
    )
    risk_level, decision = score_to_decision(risk_score)

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "decision": decision,
        "action": decision,
    }
