from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from database import get_db
from models import Budget, Category
from api.auth import get_current_user

router = APIRouter()

class BudgetCreate(BaseModel):
    name: str
    amount: float = Field(..., gt=0)
    period: str = Field(..., pattern="^(monthly|weekly|yearly)$")
    start_date: str
    end_date: str
    category_id: Optional[int] = None

class BudgetResponse(BaseModel):
    id: int
    name: str
    amount: float
    spent: float
    period: str
    start_date: str
    end_date: str
    category_id: Optional[int]
    is_active: bool
    remaining: float = 0.0
    percentage_used: float = 0.0
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[BudgetResponse])
async def get_budgets(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Budget).filter(Budget.user_id == current_user.id)
    
    if active_only:
        query = query.filter(Budget.is_active == True)
    
    budgets = query.order_by(Budget.created_at.desc()).all()
    
    for budget in budgets:
        budget.remaining = max(0, budget.amount - budget.spent)
        budget.percentage_used = (budget.spent / budget.amount * 100) if budget.amount > 0 else 0
    
    return budgets

@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if budget.category_id:
        category = db.query(Category).filter(
            Category.id == budget.category_id,
            (Category.user_id == current_user.id) | (Category.is_default == True)
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Категорія не знайдена"
            )
    
    db_budget = Budget(
        name=budget.name,
        amount=budget.amount,
        spent=0.0,
        period=budget.period,
        start_date=budget.start_date,
        end_date=budget.end_date,
        category_id=budget.category_id,
        is_active=True,
        user_id=current_user.id
    )
    
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    
    db_budget.remaining = db_budget.amount
    db_budget.percentage_used = 0.0
    
    return db_budget

@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: int,
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Обновить бюджет"""
    db_budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not db_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бюджет не знайден"
        )
    
    if budget_data.category_id:
        category = db.query(Category).filter(
            Category.id == budget_data.category_id,
            (Category.user_id == current_user.id) | (Category.is_default == True)
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Категорія не знайдена"
            )
    
    db_budget.name = budget_data.name
    db_budget.amount = budget_data.amount
    db_budget.period = budget_data.period
    db_budget.start_date = budget_data.start_date
    db_budget.end_date = budget_data.end_date
    db_budget.category_id = budget_data.category_id
    
    db.commit()
    db.refresh(db_budget)
    
    db_budget.remaining = max(0, db_budget.amount - db_budget.spent)
    db_budget.percentage_used = (db_budget.spent / db_budget.amount * 100) if db_budget.amount > 0 else 0
    
    return db_budget

@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not db_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бюджет не знайден"
        )
    
    db.delete(db_budget)
    db.commit()
    
    return None

@router.patch("/{budget_id}/toggle", response_model=BudgetResponse)
async def toggle_budget_status(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not db_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бюджет не знайден"
        )
    
    db_budget.is_active = not db_budget.is_active
    db.commit()
    db.refresh(db_budget)
    
    db_budget.remaining = max(0, db_budget.amount - db_budget.spent)
    db_budget.percentage_used = (db_budget.spent / db_budget.amount * 100) if db_budget.amount > 0 else 0
    
    return db_budget 