import os
from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    classification_report,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from xgboost import XGBClassifier


# Paths


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = Path(
    os.getenv(
        "SENTRA_DATASET",
        PROJECT_ROOT / "backend" / "data" / "transactions.csv"
    )
)

MODEL_DIR = PROJECT_ROOT / "ml" / "models" / "saved"

MODEL_PATH = MODEL_DIR / "xgboost_fraud_model.joblib"

# Model features


NUMERIC_FEATURES = [
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
]


BINARY_FEATURES = [
    "is_new_device",
    "is_new_beneficiary",
    "authentication_success",
]


CATEGORICAL_FEATURES = [
    "channel",
    "authentication_method",
]


FEATURES = (
    NUMERIC_FEATURES
    + BINARY_FEATURES
    + CATEGORICAL_FEATURES
)

TARGET = "label"


# Load dataset


def load_data():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)

    required_columns = FEATURES + [TARGET]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    return df

# Train model


def train():
    print("Loading transaction dataset...")

    df = load_data()

    print(f"Transactions loaded: {len(df)}")
    print("\nLabel distribution:")
    print(df[TARGET].value_counts())



    # Prepare X and y

    X = df[FEATURES]
    y = df[TARGET]


    # Train/test split
  
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )
 

    # Handle class imbalance


    fraud_count = (y_train == 1).sum()
    legitimate_count = (y_train == 0).sum()

    scale_pos_weight = (
        legitimate_count / fraud_count
        if fraud_count > 0
        else 1.0
    )

    print(
        f"\nscale_pos_weight: "
        f"{scale_pos_weight:.2f}"
    )

    # Preprocessing
 
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                CATEGORICAL_FEATURES,
            ),
            (
                "numeric",
                "passthrough",
                NUMERIC_FEATURES + BINARY_FEATURES,
            ),
        ]
    )
    # XGBoost classifier

    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="binary:logistic",
        eval_metric="aucpr",
        scale_pos_weight=scale_pos_weight,
        tree_method="hist",
        random_state=42,
        n_jobs=-1,
    )

    # Full ML pipeline

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    # Train

    print("\nTraining XGBoost fraud detector...")

    pipeline.fit(X_train, y_train)

    # Evaluation

    predictions = pipeline.predict(X_test)

    probabilities = pipeline.predict_proba(
        X_test
    )[:, 1]


    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    roc_auc = roc_auc_score(
        y_test,
        probabilities,
    )

    pr_auc = average_precision_score(
        y_test,
        probabilities,
    )


    print("\n==============================")
    print("XGBOOST RESULTS")
    print("==============================")

    print(f"Accuracy : {accuracy:.4f}")
    print(f"ROC AUC  : {roc_auc:.4f}")
    print(f"PR AUC   : {pr_auc:.4f}")

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            predictions,
            digits=4,
        )
    )
    # Save model
   
    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        pipeline,
        MODEL_PATH,
    )

    print(
        f"\nModel saved to:\n{MODEL_PATH}"
    )


if __name__ == "__main__":
    train()
