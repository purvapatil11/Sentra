# Sentra Shared Contracts

These contracts are the boundary between Purva's systems/backend work and
Dinesh's AI/ML work. Edit them together only. If one side changes a field name,
type, or enum here, the other side must update in the same commit.

## 1. Transaction Schema

File: `shared/schemas/transaction_schema.json`

Owner: Purva produces it, Dinesh consumes it.

Purpose: one raw or simulated payment transaction.

Important fields:

- `transaction_id`, `customer_id`: stable identifiers used by API responses and
  case records.
- `amount`, `customer_avg_amount`, `amount_ratio`: payment size and customer
  baseline comparison.
- `transaction_hour`, `velocity_10m`, `velocity_24h`: timing and velocity
  signals.
- `account_age_days`, `beneficiary_age_minutes`: account and payee maturity.
- `device_trust_score`, `geo_distance_km`, `is_new_device`,
  `is_new_beneficiary`: behavioral and device risk signals.
- `channel`, `authentication_method`, `authentication_success`: payment and
  auth context.
- `label`: `0` for legitimate, `1` for fraud. Required for training/evaluation.
- `attack_type`: optional fraud family label for demos and analysis.
- `score`: optional Blue Team case-schema result attached after simulation
  scoring. Raw training transactions may omit it; persisted scored runs include
  it for every transaction.

## 2. Scenario Schema

File: `shared/schemas/scenario_schema.json`

Owner: Dinesh produces it, Purva's simulator consumes it.

Purpose: structured Red Team attack parameters. The LLM scenario generator and
deterministic fallback must both return this format.

After schema validation, runtime responses append `_generation` provenance.
It identifies `llm`, `local_fallback`, or `adaptive_engine` output and records
the provider, model, generation time, response ID, and any fallback reason.

Allowed `attack_family` values:

- `account_takeover`
- `ai_social_engineering`
- `synthetic_identity`

Simulator control fields:

- `fraud_ratio`: fraction of the generated batch that should be fraud.
- `amount_multiplier`: how much larger fraud amounts are than customer baseline.
- `velocity_multiplier`: how aggressively fraud increases transaction velocity.
- `new_device_probability`, `new_beneficiary_probability`,
  `geo_anomaly_probability`: probabilities for injected behavioral signals.
- `evasion_strength`: how subtle/adaptive the attack should be.
- `attack_round`, `mutation_strategy`: adaptive loop state.

## 3. Model Input Schema

File: `shared/schemas/model_input_schema.json`

Owner: Purva supplies it through `/score`, Dinesh's models consume it.

Purpose: the exact feature vector sent into XGBoost and Isolation Forest.

This schema intentionally excludes labels and IDs. IDs can travel beside the
feature vector in API payloads, but the model should only receive the listed
features.

## 4. Case Schema

File: `shared/schemas/case_schema.json`

Owner: Dinesh produces it, Purva renders it.

Purpose: Blue Team scoring result for one transaction.

Required scoring fields:

- `xgboost_score`: supervised fraud probability from the XGBoost pipeline.
- `anomaly_score`: normalized Isolation Forest risk, where `1` is most anomalous.
- `risk_score`: fused score from the risk engine.
- `decision`: one of `ALLOW`, `MONITOR`, `VERIFY`, `BLOCK`.
- `risk_level`: one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- `explanation`: short analyst-style reason for the decision.
- `top_risk_factors`: concrete feature/value reasons, not generic text.

## 5. Feedback Schema

File: `shared/schemas/feedback_schema.json`

Owner: Purva computes round metrics, Dinesh consumes them for Red Team mutation.

Purpose: closes the adaptive loop. The Red Team should use `detection_rate`,
`evasion_rate`, `false_positive_rate`, `average_risk_score`, and
`recommended_mutation` to alter the next scenario.

Recommended mutation behavior:

- `reduce_amount`: lower `amount_multiplier`.
- `lower_velocity`: lower `velocity_multiplier`.
- `reuse_device`: lower `new_device_probability`.
- `delay_beneficiary`: lower `new_beneficiary_probability`.
- `reduce_geo_anomaly`: lower `geo_anomaly_probability`.
- `mixed`: make several smaller evasive changes.
- `none`: keep the scenario stable.
