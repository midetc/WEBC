from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import User, Expense, Category, Budget, Goal
import utils

router = APIRouter()

@router.get("/health", tags=["health"])
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1")).first()
        
        return {
            "status": "ok",
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "error": str(e)
        }

@router.get("/database-status")
def database_status(db: Session = Depends(get_db)):
    """Перевірка стану бази даних"""
    try:
        users_count = db.query(User).count()
        expenses_count = db.query(Expense).count()
        categories_count = db.query(Category).count()
        budgets_count = db.query(Budget).count()
        goals_count = db.query(Goal).count()
        
        return {
            "status": "connected",
            "tables": {
                "users": users_count,
                "expenses": expenses_count,
                "categories": categories_count,
                "budgets": budgets_count,
                "goals": goals_count
            },
            "total_records": users_count + expenses_count + categories_count + budgets_count + goals_count,
            "has_data": users_count > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка підключення до БД: {str(e)}")

@router.post("/load-test-data")
def load_test_data(db: Session = Depends(get_db)):
    """Завантаження реалістичних тестових даних"""
    try:
        users_count = db.query(User).count()
        
        if users_count > 0:
            return {
                "status": "skipped",
                "message": f"Тестові дані вже існують ({users_count} користувачів)",
                "suggestion": "Використовуйте /api/reset-database для очищення БД перед завантаженням нових даних"
            }
        
        utils.create_realistic_test_data()
        
        users_count = db.query(User).count()
        expenses_count = db.query(Expense).count()
        budgets_count = db.query(Budget).count()
        goals_count = db.query(Goal).count()
        
        return {
            "status": "success",
            "message": "Реалістичні тестові дані завантажено!",
            "data": {
                "users": users_count,
                "expenses": expenses_count,
                "budgets": budgets_count,
                "goals": goals_count
            },
            "test_accounts": [
                {"email": "test@example.com", "name": "Тестовий Користувач", "password": "password123"},
                {"email": "anna.ivanova@gmail.com", "name": "Анна Іванова", "password": "mypassword"},
                {"email": "dmitry.petrov@outlook.com", "name": "Дмитро Петров", "password": "securepass"}
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка при завантаженні тестових даних: {str(e)}")

@router.post("/reset-database")
def reset_database(db: Session = Depends(get_db)):
    """Очищення бази даних"""
    try:
        utils.reset_database()
        
        utils.seed_database()
        
        return {
            "status": "success",
            "message": "База даних очищена та заповнена стандартними категоріями",
            "suggestion": "Використовуйте /api/load-test-data для завантаження тестових даних"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка при очищенні БД: {str(e)}")