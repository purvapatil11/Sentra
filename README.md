# Sentra

Sentra is an adversarial AI payment-fraud simulation MVP. The Red Team
generates fraud scenarios, the simulator creates labeled payment transactions,
the Blue Team scores them with ML models, and feedback mutates the next attack
round.

## Current MVP

- Synthetic transaction simulator for normal and fraud traffic.
- Three attack families: account takeover, AI social engineering, and synthetic
  identity.
- XGBoost known-fraud model.
- Isolation Forest anomaly model.
- 70/30 fused risk scoring with analyst-style explanations.
- FastAPI endpoints for simulation, scoring, cases, transactions, and feedback.
- SQLite runtime persistence for demo runs.
- Next.js, TypeScript, Tailwind CSS, and Recharts command center.

## Setup

Use the local Windows virtual environment:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

If models are missing, regenerate data and train:

```powershell
.\.venv\Scripts\python.exe backend\app\simulator\generate_transactions.py --customers 500 --transactions-per-customer 10 --fraud-ratio 0.12
.\.venv\Scripts\python.exe ml\models\train_xgboost.py
.\.venv\Scripts\python.exe ml\models\train_isolation_forest.py
```

## Run Backend

```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Open:

- API root: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Run Frontend

In a second PowerShell terminal:

```powershell
cd frontend
pnpm install
pnpm dev
```

Open the Sentra dashboard at `http://127.0.0.1:3000`.

The dashboard includes the Main Dashboard, Red Team Lab, Blue Team Cases, and
the adaptive feedback loop. Keep the backend running on port `8000` while using
the frontend.

## Demo Flow

Generate demo customers:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/customers/generate -Method Post -ContentType 'application/json' -Body '{"count":100}' | ConvertTo-Json -Depth 6
```

View customer summary:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/customers/summary | ConvertTo-Json -Depth 6
```

Launch an attack run:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/simulate/launch -Method Post -ContentType 'application/json' -Body '{"attack_family":"ai_social_engineering","volume":100,"fraud_ratio":0.20}' | ConvertTo-Json -Depth 8
```

View generated transactions:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/transactions?limit=10" | ConvertTo-Json -Depth 6
```

View flagged cases:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/cases?limit=10" | ConvertTo-Json -Depth 8
```

Generate Blue Team feedback and the next Red Team scenario:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/feedback -Method Post -ContentType 'application/json' -Body '{}' | ConvertTo-Json -Depth 8
```

Score one transaction directly:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/score -Method Post -ContentType 'application/json' -Body '{"transaction_id":"TXN_DEMO_001","amount":15000.0,"customer_avg_amount":1200.0,"amount_ratio":12.5,"transaction_hour":2,"velocity_10m":12,"velocity_24h":65,"account_age_days":500,"beneficiary_age_minutes":5,"device_trust_score":0.12,"geo_distance_km":1800.0,"is_new_device":1,"is_new_beneficiary":1,"channel":"upi","authentication_method":"otp","authentication_success":1}' | ConvertTo-Json -Depth 6
```

## Demo Caveat

The current data is synthetic demo data, not real payment data. The fraud rules
are intentionally clear enough to validate the end-to-end MVP, so model metrics
can look very high. Present this as pipeline validation, not real-world fraud
model performance.
