# Dinesh AI/ML Demo Notes

Use this as the short explanation for the AI/ML side of AegisPay during team
syncs, PR review, and judging.

## One-Line Pitch

The Red Team LLM generates structured fraud scenarios, the simulator turns them
into transactions, the Blue Team scores them, and feedback mutates the next
attack round to make fraud more evasive.

## Attack Stories

### Account Takeover

An attacker gains access to an existing customer account, signs in from a
low-trust new device, and quickly transfers a larger-than-usual amount to a new
beneficiary. The strongest signals are amount ratio, short-window velocity, new
device, new beneficiary, and possible geo distance.

### AI Social Engineering

An LLM-assisted impersonation attack creates personalized support messages that
convince a high-value customer to approve OTP-backed transfers or add a new
beneficiary. This is GenAI-specific because the fraud is powered by personalized
LLM persuasion, not just a normal stolen-login pattern. The signal can be subtle
because the genuine customer may approve the transaction.

### Synthetic Identity

A new account behaves normally at first, then increases transaction amount and
frequency after trust is established. The strongest signals are young account
age, gradually rising velocity, new beneficiary use, and moderate anomaly score.

## What I Own

- Scenario generation for `account_takeover`, `ai_social_engineering`, and
  `synthetic_identity`.
- Scenario validation against `shared/schemas/scenario_schema.json`.
- Adaptive mutation from Blue Team feedback.
- XGBoost known-fraud model training.
- Isolation Forest anomaly model training.
- 70/30 risk score fusion.
- Analyst-style case explanations using actual transaction features.

## Judge Q&A

Why XGBoost?

XGBoost is strong for known fraud patterns because it learns nonlinear
relationships between features like amount ratio, velocity, device trust, and
beneficiary age.

Why Isolation Forest?

Isolation Forest helps catch behavior that does not look like the normal
transaction population, including new or mutated attack patterns.

Why 70/30 fusion?

The MVP gives 70% weight to supervised XGBoost because labeled fraud patterns
should dominate known attacks. The remaining 30% keeps anomaly detection in the
decision so adaptive or novel attacks still affect the final risk score.

How does the adaptive loop work?

After each run, the Blue Team reports detection rate, evasion rate, false
positive rate, and recommended mutation. The Red Team uses that feedback to
adjust amount, velocity, device reuse, beneficiary timing, geo anomaly, or a
mixed strategy in the next scenario.

What makes `ai_social_engineering` GenAI-specific?

The attack uses LLM-generated personalized persuasion or support impersonation
to get the real customer to authorize risky payment behavior. That makes the
fraud mechanism different from simple account takeover.

## Pending

Model training is blocked until generated transaction data exists at
`backend/data/transactions.csv`. Once that file is available, train both models
and test `ml/models/predict.py`.
