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

Model training is unblocked. Generated transaction data now exists at
`backend/data/transactions.csv`.

Latest local demo run:

- Generated 5,000 transactions with 609 fraud examples.
- Trained XGBoost and saved `ml/models/saved/xgboost_fraud_model.joblib`.
- Trained Isolation Forest and saved
  `ml/models/saved/isolation_forest_model.joblib`.
- Smoke-tested `ml/models/predict.py`; the sample high-risk transaction returns
  `decision: BLOCK`.
- Wired the trained model into the backend `/score` API and live-tested it with
  a high-risk transaction payload.

Useful commands:

```powershell
.\.venv\Scripts\python.exe backend\app\simulator\generate_transactions.py --customers 500 --transactions-per-customer 10 --fraud-ratio 0.12
.\.venv\Scripts\python.exe ml\models\train_xgboost.py
.\.venv\Scripts\python.exe ml\models\train_isolation_forest.py
.\.venv\Scripts\python.exe ml\models\predict.py
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Live API smoke test:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/score -Method Post -ContentType 'application/json' -Body '{"transaction_id":"TXN_DEMO_001","amount":15000.0,"customer_avg_amount":1200.0,"amount_ratio":12.5,"transaction_hour":2,"velocity_10m":12,"velocity_24h":65,"account_age_days":500,"beneficiary_age_minutes":5,"device_trust_score":0.12,"geo_distance_km":1800.0,"is_new_device":1,"is_new_beneficiary":1,"channel":"upi","authentication_method":"otp","authentication_success":1}' | ConvertTo-Json -Depth 6
```

Demo caveat: the current synthetic fraud rules are highly separable, so XGBoost
can score perfectly on this generated dataset. For judging, describe it as an
MVP validation dataset rather than real-world model performance.
