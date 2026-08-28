from pathlib import Path
from typing import Any
import sys
import uuid

import joblib
import pandas as pd


# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Allows:
# python ml\models\predict.py
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from ml.investigator_llm.explain_case import explain_case
from ml.risk_engine.engine import calculate_risk


# ============================================================
# MODEL PATHS
# ============================================================

MODEL_DIR = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "saved"
)

XGBOOST_MODEL_PATH = (
    MODEL_DIR
    / "xgboost_fraud_model.joblib"
)

ISOLATION_MODEL_PATH = (
    MODEL_DIR
    / "isolation_forest_model.joblib"
)


# ============================================================
# MODEL FEATURES
# ============================================================

FEATURES = [
    "amount",
    "customer_avg_amount",
    "amount_ratio",
    "transaction_hour",
    "velocity_10m",
    "velocity_24h",
    "account_age_days",
    "beneficiary_age_minutes",
    "device_trust_score",
    "geo_distance_km",
    "is_new_device",
    "is_new_beneficiary",
    "channel",
    "authentication_method",
    "authentication_success",
]


# ============================================================
# MODEL CACHE
# ============================================================

_xgboost_model = None
_isolation_model = None


# ============================================================
# LOAD MODELS
# ============================================================

def load_models():

    global _xgboost_model
    global _isolation_model

    if not XGBOOST_MODEL_PATH.exists():
        raise FileNotFoundError(
            f"XGBoost model not found: "
            f"{XGBOOST_MODEL_PATH}"
        )

    if not ISOLATION_MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Isolation Forest model not found: "
            f"{ISOLATION_MODEL_PATH}"
        )

    if _xgboost_model is None:
        _xgboost_model = joblib.load(
            XGBOOST_MODEL_PATH
        )

    if _isolation_model is None:
        _isolation_model = joblib.load(
            ISOLATION_MODEL_PATH
        )

    return (
        _xgboost_model,
        _isolation_model,
    )


# ============================================================
# VALIDATE TRANSACTION
# ============================================================

def validate_transaction(
    transaction: dict[str, Any]
) -> None:

    missing_fields = [
        feature
        for feature in FEATURES
        if feature not in transaction
    ]

    if missing_fields:
        raise ValueError(
            "Missing required transaction fields: "
            f"{missing_fields}"
        )


# ============================================================
# NORMALIZE ANOMALY SCORE
# ============================================================

def normalize_anomaly_score(
    decision_score: float
) -> float:
    """
    Isolation Forest decision_function:

    Positive score = more normal
    Negative score = more anomalous

    Convert the value into an approximate
    0-1 anomaly risk.

    0 = low anomaly risk
    1 = high anomaly risk
    """

    anomaly_risk = 0.5 - decision_score

    return max(
        0.0,
        min(
            1.0,
            anomaly_risk,
        ),
    )


# ============================================================
# MAIN PREDICTION
# ============================================================

def predict_transaction(
    transaction: dict[str, Any]
) -> dict[str, Any]:

    # --------------------------------------------------------
    # 1. Validate input
    # --------------------------------------------------------

    validate_transaction(
        transaction
    )


    # --------------------------------------------------------
    # 2. Load trained models
    # --------------------------------------------------------

    xgboost_model, isolation_model = (
        load_models()
    )


    # --------------------------------------------------------
    # 3. Convert transaction to DataFrame
    # --------------------------------------------------------

    transaction_df = pd.DataFrame(
        [
            {
                feature: transaction[feature]
                for feature in FEATURES
            }
        ]
    )


    # ========================================================
    # XGBOOST PREDICTION
    # ========================================================

    fraud_probability = float(
        xgboost_model.predict_proba(
            transaction_df
        )[0][1]
    )


    # ========================================================
    # ISOLATION FOREST PREDICTION
    # ========================================================

    isolation_prediction = int(
        isolation_model.predict(
            transaction_df
        )[0]
    )

    decision_score = float(
        isolation_model.decision_function(
            transaction_df
        )[0]
    )

    anomaly_risk = normalize_anomaly_score(
        decision_score
    )


    # ========================================================
    # RISK ENGINE
    # ========================================================

    risk_result = calculate_risk(
        fraud_probability=fraud_probability,
        anomaly_score=anomaly_risk,
    )

    explanation_result = explain_case(
        transaction=transaction,
        risk_result=risk_result,
    )


    # ========================================================
    # RESPONSE
    # ========================================================

    xgboost_score = round(fraud_probability, 4)
    anomaly_score = round(anomaly_risk, 4)
    transaction_id = transaction.get(
        "transaction_id",
        "UNKNOWN_TRANSACTION",
    )

    return {
        "case_id": f"CASE-{uuid.uuid4().hex[:8].upper()}",
        "transaction_id": transaction_id,
        "xgboost_score": xgboost_score,
        "fraud_probability": xgboost_score,
        "anomaly_score": anomaly_score,

        "is_anomaly":
            isolation_prediction == -1,

        "risk_score":
            risk_result["risk_score"],

        "risk_level":
            risk_result["risk_level"],

        "decision":
            risk_result["decision"],

        "action":
            risk_result["action"],

        "explanation":
            explanation_result["explanation"],

        "top_risk_factors":
            explanation_result["top_risk_factors"],

        "model_version": "sentra-ml-v1",
    }


def predict_transactions(
    transactions: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    return [
        predict_transaction(transaction)
        for transaction in transactions
    ]


# ============================================================
# LOCAL TEST
# ============================================================

if __name__ == "__main__":

    sample_transaction = {

        "amount": 15000.0,

        "customer_avg_amount": 1200.0,

        "amount_ratio": 12.5,

        "transaction_hour": 2,

        "velocity_10m": 12,

        "velocity_24h": 65,

        "account_age_days": 500,

        "beneficiary_age_minutes": 5,

        "device_trust_score": 0.12,

        "geo_distance_km": 1800.0,

        "is_new_device": 1,

        "is_new_beneficiary": 1,

        "channel": "upi",

        "authentication_method": "otp",

        "authentication_success": 1,
    }

    try:

        result = predict_transaction(
            sample_transaction
        )

        print(
            "\n=============================="
        )

        print(
            "SENTRA BLUE TEAM RESULT"
        )

        print(
            "=============================="
        )

        for key, value in result.items():

            print(
                f"{key}: {value}"
            )

    except FileNotFoundError as error:

        print(
            "\nModels are not trained yet."
        )

        print(error)

    except ValueError as error:

        print(
            "\nInvalid transaction."
        )

        print(error)
