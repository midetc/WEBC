from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from database import get_db
from models import Expense
from api.auth import get_current_user

router = APIRouter()

class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0)
    description: str
    category: str
    date: str

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: str
    category: str
    date: str
    user_id: int  # Додаємо user_id для перевірки ізоляції
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    try:
        db_expense = Expense(
            amount=expense.amount,
            description=expense.description,
            category=expense.category,
            date=expense.date,
            user_id=current_user.id
        )
        
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)
        
        return db_expense
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create expense: {str(e)}"
        )

@router.get("/", response_model=List[ExpenseResponse])
async def get_expenses(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None, 
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    
    if category:
        query = query.filter(Expense.category == category)
    
    if start_date:
        query = query.filter(Expense.date >= start_date)
    
    if end_date:
        query = query.filter(Expense.date <= end_date)
    
    expenses = query.order_by(Expense.date.desc()).offset(skip).limit(limit).all()
    
    return expenses

@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    
    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    return expense

@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int, 
    expense_data: ExpenseCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    db_expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    
    if db_expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    db_expense.amount = expense_data.amount
    db_expense.description = expense_data.description
    db_expense.category = expense_data.category
    db_expense.date = expense_data.date
    
    db.commit()
    db.refresh(db_expense)
    
    return db_expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    
    if db_expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    db.delete(db_expense)
    db.commit()
    
    return None 