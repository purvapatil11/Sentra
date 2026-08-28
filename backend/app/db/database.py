import json
import os
import sqlite3
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DB_PATH = PROJECT_ROOT / "backend" / "data" / "sentra.sqlite"
DB_PATH = Path(os.getenv("SENTRA_DB_PATH", str(DEFAULT_DB_PATH))).expanduser()


def get_connection():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS runs (
                run_id TEXT PRIMARY KEY,
                scenario_id TEXT NOT NULL,
                attack_family TEXT NOT NULL,
                attack_round INTEGER NOT NULL,
                scenario_json TEXT NOT NULL,
                total_transactions INTEGER NOT NULL,
                fraud_transactions INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS customers (
                customer_id TEXT PRIMARY KEY,
                payload_json TEXT NOT NULL,
                segment TEXT NOT NULL,
                home_region TEXT NOT NULL,
                avg_transaction_amount REAL NOT NULL,
                account_age_days INTEGER NOT NULL,
                device_trust_score REAL NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                label INTEGER NOT NULL,
                attack_type TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS cases (
                case_id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                transaction_id TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                risk_score REAL NOT NULL,
                decision TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS feedback (
                feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )


def save_customers(customers: list[dict[str, Any]]):
    with get_connection() as connection:
        connection.executemany(
            """
            INSERT OR REPLACE INTO customers (
                customer_id,
                payload_json,
                segment,
                home_region,
                avg_transaction_amount,
                account_age_days,
                device_trust_score
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    customer["customer_id"],
                    json.dumps(customer),
                    customer["segment"],
                    customer["home_region"],
                    float(customer["avg_transaction_amount"]),
                    int(customer["account_age_days"]),
                    float(customer["device_trust_score"]),
                )
                for customer in customers
            ],
        )


def list_customers(limit: int = 100) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT payload_json
            FROM customers
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    return [
        json.loads(row["payload_json"])
        for row in rows
    ]


def customer_summary() -> dict[str, Any]:
    with get_connection() as connection:
        total = connection.execute(
            "SELECT COUNT(*) AS total FROM customers"
        ).fetchone()["total"]
        segment_rows = connection.execute(
            """
            SELECT segment, COUNT(*) AS count
            FROM customers
            GROUP BY segment
            ORDER BY count DESC
            """
        ).fetchall()
        region_rows = connection.execute(
            """
            SELECT home_region, COUNT(*) AS count
            FROM customers
            GROUP BY home_region
            ORDER BY count DESC
            """
        ).fetchall()

    return {
        "total_customers": total,
        "segments": [
            row_to_dict(row)
            for row in segment_rows
        ],
        "regions": [
            row_to_dict(row)
            for row in region_rows
        ],
    }


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return dict(row)


def save_run(
    run_id: str,
    scenario: dict[str, Any],
    transactions: list[dict[str, Any]],
):
    fraud_transactions = sum(
        transaction.get("label") == 1
        for transaction in transactions
    )

    with get_connection() as connection:
        connection.execute(
            """
            INSERT OR REPLACE INTO runs (
                run_id,
                scenario_id,
                attack_family,
                attack_round,
                scenario_json,
                total_transactions,
                fraud_transactions
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                run_id,
                scenario["scenario_id"],
                scenario["attack_family"],
                scenario["attack_round"],
                json.dumps(scenario),
                len(transactions),
                fraud_transactions,
            ),
        )


def save_transactions(
    run_id: str,
    transactions: list[dict[str, Any]],
):
    with get_connection() as connection:
        connection.executemany(
            """
            INSERT OR REPLACE INTO transactions (
                transaction_id,
                run_id,
                payload_json,
                label,
                attack_type
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            [
                (
                    transaction["transaction_id"],
                    run_id,
                    json.dumps(transaction),
                    int(transaction["label"]),
                    transaction.get("attack_type"),
                )
                for transaction in transactions
            ],
        )


def save_cases(
    run_id: str,
    cases: list[dict[str, Any]],
):
    with get_connection() as connection:
        connection.executemany(
            """
            INSERT OR REPLACE INTO cases (
                case_id,
                run_id,
                transaction_id,
                payload_json,
                risk_score,
                decision,
                risk_level
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    case["case_id"],
                    run_id,
                    case["transaction_id"],
                    json.dumps(case),
                    float(case["risk_score"]),
                    case["decision"],
                    case["risk_level"],
                )
                for case in cases
            ],
        )


def save_feedback(
    run_id: str,
    feedback: dict[str, Any],
):
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO feedback (
                run_id,
                payload_json
            )
            VALUES (?, ?)
            """,
            (
                run_id,
                json.dumps(feedback),
            ),
        )


def latest_run() -> dict[str, Any] | None:
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM runs
            ORDER BY created_at DESC
            LIMIT 1
            """
        ).fetchone()

    if row is None:
        return None

    run = row_to_dict(row)
    run["scenario"] = json.loads(run.pop("scenario_json"))
    return run


def get_run(run_id: str) -> dict[str, Any] | None:
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM runs
            WHERE run_id = ?
            """,
            (run_id,),
        ).fetchone()

    if row is None:
        return None

    run = row_to_dict(row)
    run["scenario"] = json.loads(run.pop("scenario_json"))
    return run


def list_runs(limit: int = 20) -> list[dict[str, Any]]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT *
            FROM runs
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    runs = []
    for row in rows:
        run = row_to_dict(row)
        run["scenario"] = json.loads(run.pop("scenario_json"))
        runs.append(run)

    return runs


def list_transactions(
    run_id: str | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    if run_id is None:
        run = latest_run()
        if run is None:
            return []
        run_id = run["run_id"]

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT payload_json
            FROM transactions
            WHERE run_id = ?
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (run_id, limit),
        ).fetchall()

    return [
        json.loads(row["payload_json"])
        for row in rows
    ]


def list_cases(
    run_id: str | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    if run_id is None:
        run = latest_run()
        if run is None:
            return []
        run_id = run["run_id"]

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT payload_json
            FROM cases
            WHERE run_id = ?
            ORDER BY risk_score DESC
            LIMIT ?
            """,
            (run_id, limit),
        ).fetchall()

    return [
        json.loads(row["payload_json"])
        for row in rows
    ]
