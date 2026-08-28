import os
from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
 
# PATHS


PROJECT_ROOT = Path(__file__).resolve().parents[2]


DATA_PATH = Path(
    os.getenv(
        "SENTRA_DATASET",
        PROJECT_ROOT / "backend" / "data" / "transactions.csv"
    )
)

MODEL_DIR = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "saved"
)

MODEL_PATH = (
    MODEL_DIR
    / "isolation_forest_model.joblib"
)

# FEATURES


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


# LOAD DATA


def load_data():

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)

    missing_columns = [
        column
        for column in FEATURES
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    return df

# TRAIN


def train():

    print("Loading transaction dataset...")

    df = load_data()

    print(
        f"Total transactions: {len(df)}"
    )

    # Train mostly on legitimate transactions


    if "label" in df.columns:

        normal_df = df[
            df["label"] == 0
        ].copy()

        print(
            f"Legitimate transactions used for training: "
            f"{len(normal_df)}"
        )

    else:

        # Fallback if simulator dataset has no label yet
        normal_df = df.copy()

        print(
            "Warning: label column not found."
        )

        print(
            "Training Isolation Forest on full dataset."
        )


    X_train = normal_df[FEATURES]


    # PREPROCESSING
  
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
                NUMERIC_FEATURES
                + BINARY_FEATURES,
            ),
        ]
    )

    # ISOLATION FOREST
 

    model = IsolationForest(
        n_estimators=300,

        contamination=0.05,

        max_samples="auto",

        random_state=42,

        n_jobs=-1,
    )

    # PIPELINE

    pipeline = Pipeline(
        steps=[
            (
                "preprocessor",
                preprocessor,
            ),
            (
                "model",
                model,
            ),
        ]
    )


    print(
        "\nTraining Isolation Forest..."
    )

    pipeline.fit(
        X_train
    )

    X_all = df[FEATURES]

    predictions = pipeline.predict(
        X_all
    )

    anomaly_scores = pipeline.decision_function(
        X_all
    )


    # Isolation Forest:


    anomaly_count = (
        predictions == -1
    ).sum()

    normal_count = (
        predictions == 1
    ).sum()


    print(
        "\n=============================="
    )

    print(
        "ISOLATION FOREST RESULTS"
    )

    print(
        "=============================="
    )

    print(
        f"Normal transactions : "
        f"{normal_count}"
    )

    print(
        f"Anomalies detected  : "
        f"{anomaly_count}"
    )


    # OPTIONAL EVALUATION
 

    if "label" in df.columns:

        results = pd.DataFrame(
            {
                "actual_label":
                    df["label"],

                "prediction":
                    predictions,

                "anomaly_score":
                    anomaly_scores,
            }
        )


        # Convert IsolationForest output
        results[
            "predicted_anomaly"
        ] = (
            results["prediction"] == -1
        ).astype(int)


        print(
            "\nDetection by actual label:"
        )

        print(
            pd.crosstab(
                results[
                    "actual_label"
                ],
                results[
                    "predicted_anomaly"
                ],
                rownames=[
                    "Actual"
                ],
                colnames=[
                    "Detected anomaly"
                ],
            )
        )

    # SAVE MODEL

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

# ENTRY POINT


if __name__ == "__main__":
    train()
