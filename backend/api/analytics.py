from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta

from database import get_db
from models import Expense, Category, Budget, Goal
from api.auth import get_current_user

router = APIRouter()

class ExpensesByCategory(BaseModel):
    category: str
    total: float
    count: int
    percentage: float

class MonthlyExpenses(BaseModel):
    month: str
    total: float
    count: int

class DashboardStats(BaseModel):
    total_expenses: float
    total_expenses_this_month: float
    active_budgets: int
    active_goals: int
    categories_count: int
    expenses_count: int

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    total_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id
    ).scalar() or 0.0
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    total_expenses_this_month = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        extract('month', func.datetime(Expense.date)) == current_month,
        extract('year', func.datetime(Expense.date)) == current_year
    ).scalar() or 0.0
    
    active_budgets = db.query(func.count(Budget.id)).filter(
        Budget.user_id == current_user.id,
        Budget.is_active == True
    ).scalar() or 0
    
    active_goals = db.query(func.count(Goal.id)).filter(
        Goal.user_id == current_user.id,
        Goal.is_achieved == False
    ).scalar() or 0
    
    categories_count = db.query(func.count(Category.id)).filter(
        (Category.user_id == current_user.id) | (Category.is_default == True)
    ).scalar() or 0
    
    expenses_count = db.query(func.count(Expense.id)).filter(
        Expense.user_id == current_user.id
    ).scalar() or 0
    
    return DashboardStats(
        total_expenses=total_expenses,
        total_expenses_this_month=total_expenses_this_month,
        active_budgets=active_budgets,
        active_goals=active_goals,
        categories_count=categories_count,
        expenses_count=expenses_count
    )

@router.get("/expenses-by-category", response_model=List[ExpensesByCategory])
async def get_expenses_by_category(
    period_days: int = 30,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    start_date = (datetime.now() - timedelta(days=period_days)).strftime('%Y-%m-%d')
    
    results = db.query(
        Expense.category,
        func.sum(Expense.amount).label('total'),
        func.count(Expense.id).label('count')
    ).filter(
        Expense.user_id == current_user.id,
        Expense.date >= start_date
    ).group_by(Expense.category).all()
    
    total_sum = sum(result.total for result in results)
    
    expenses_by_category = []
    for result in results:
        percentage = (result.total / total_sum * 100) if total_sum > 0 else 0
        expenses_by_category.append(ExpensesByCategory(
            category=result.category or "Без категории",
            total=result.total,
            count=result.count,
            percentage=round(percentage, 2)
        ))
    
    expenses_by_category.sort(key=lambda x: x.total, reverse=True)
    
    return expenses_by_category

@router.get("/monthly-expenses", response_model=List[MonthlyExpenses])
async def get_monthly_expenses(
    months: int = 12,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    results = db.query(
        func.strftime('%Y-%m', Expense.date).label('month'),
        func.sum(Expense.amount).label('total'),
        func.count(Expense.id).label('count')
    ).filter(
        Expense.user_id == current_user.id
    ).group_by(
        func.strftime('%Y-%m', Expense.date)
    ).order_by(
        func.strftime('%Y-%m', Expense.date).desc()
    ).limit(months).all()
    
    monthly_expenses = []
    for result in results:
        monthly_expenses.append(MonthlyExpenses(
            month=result.month,
            total=result.total,
            count=result.count
        ))
    
    monthly_expenses.reverse()
    
    return monthly_expenses

@router.get("/budget-status")
async def get_budget_status(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.is_active == True
    ).all()
    
    budget_status = []
    for budget in budgets:
        remaining = max(0, budget.amount - budget.spent)
        percentage_used = (budget.spent / budget.amount * 100) if budget.amount > 0 else 0
        
        status = "safe"
        if percentage_used >= 90:
            status = "danger"
        elif percentage_used >= 75:
            status = "warning"
        
        budget_status.append({
            "id": budget.id,
            "name": budget.name,
            "amount": budget.amount,
            "spent": budget.spent,
            "remaining": remaining,
            "percentage_used": round(percentage_used, 2),
            "status": status,
            "period": budget.period
        })
    
    return budget_status

@router.get("/goals-progress")
async def get_goals_progress(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).order_by(Goal.is_achieved, Goal.target_date).all()
    
    goals_progress = []
    for goal in goals:
        progress_percentage = (goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
        remaining = max(0, goal.target_amount - goal.current_amount)
        
        goals_progress.append({
            "id": goal.id,
            "title": goal.title,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "remaining": remaining,
            "progress_percentage": round(progress_percentage, 2),
            "target_date": goal.target_date,
            "is_achieved": goal.is_achieved
        })
    
    return goals_progress 