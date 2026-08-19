from fastapi import FastAPI

app = FastAPI(
    title="AegisPay API",
    description="Adversarial AI Payment Fraud Simulation System",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "AegisPay backend is running"
    }