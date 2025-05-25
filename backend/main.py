from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import get_db, engine, Base
from api import auth, expenses, health, categories, budgets, goals, analytics
from models import User, Expense, Category, Budget, Goal

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Spendio API", 
              description="API для додатку обліку витрат",
              version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["budgets"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(health.router, prefix="/api", tags=["health"])

@app.get("/")
def read_root():
    return {"message": "Ласкаво просимо до Spendio API!"}

@app.get("/api/check-db")
def check_db(db = Depends(get_db)):
    return {"database": "connected"} 