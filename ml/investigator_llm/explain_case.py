from __future__ import annotations

from pathlib import Path
from typing import Any
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from ml.risk_engine.explain import build_explanation, get_top_risk_factors


def explain_case(
    transaction: dict[str, Any],
    risk_result: dict[str, Any],
) -> dict[str, Any]:
    """
    Deterministic investigator explanation for demo reliability.

    This intentionally does not require an LLM call. A live LLM layer can be
    added later, but the demo should always have grounded explanations that cite
    actual model features.
    """

    top_risk_factors = get_top_risk_factors(transaction)

    return {
        "explanation": build_explanation(
            transaction=transaction,
            risk_result=risk_result,
            top_risk_factors=top_risk_factors,
        ),
        "top_risk_factors": top_risk_factors,
    }
