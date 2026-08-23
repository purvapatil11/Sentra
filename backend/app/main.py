from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.db.database import init_db
from backend.app.routers.cases import router as cases_router
from backend.app.routers.customers import router as customers_router
from backend.app.routers.events import router as events_router
from backend.app.routers.feedback import router as feedback_router
from backend.app.routers.score import router as score_router
from backend.app.routers.simulate import router as simulate_router
from backend.app.routers.transactions import router as transactions_router

app = FastAPI(
    title="AegisPay API",
    description="Adversarial AI Payment Fraud Simulation System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(customers_router)
app.include_router(events_router)
app.include_router(simulate_router)
app.include_router(transactions_router)
app.include_router(score_router)
app.include_router(cases_router)
app.include_router(feedback_router)


@app.get("/")
def root():
    return {
        "message": "AegisPay backend is running"
    }
