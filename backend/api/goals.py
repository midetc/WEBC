from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from database import get_db
from models import Goal
from api.auth import get_current_user

router = APIRouter()

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_amount: float = Field(..., gt=0)
    target_date: str

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0)
    target_date: Optional[str] = None

class GoalAddMoney(BaseModel):
    amount: float = Field(..., gt=0)

class GoalResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    target_amount: float
    current_amount: float
    target_date: str
    is_achieved: bool
    progress_percentage: float = 0.0
    remaining_amount: float = 0.0
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[GoalResponse])
async def get_goals(
    achieved_only: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Отримати всі цілі користувача"""
    query = db.query(Goal).filter(Goal.user_id == current_user.id)
    
    if achieved_only is not None:
        query = query.filter(Goal.is_achieved == achieved_only)
    
    goals = query.order_by(Goal.is_achieved, Goal.target_date).all()
    
    for goal in goals:
        goal.progress_percentage = (goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0
        goal.remaining_amount = max(0, goal.target_amount - goal.current_amount)
    
    return goals

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Створити нову ціль"""
    db_goal = Goal(
        title=goal.title,
        description=goal.description,
        target_amount=goal.target_amount,
        current_amount=0.0,
        target_date=goal.target_date,
        is_achieved=False,
        user_id=current_user.id
    )
    
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    db_goal.progress_percentage = 0.0
    db_goal.remaining_amount = db_goal.target_amount
    
    return db_goal

@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Оновити ціль"""
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ціль не знайдена"
        )
    
    if goal_data.title is not None:
        db_goal.title = goal_data.title
    if goal_data.description is not None:
        db_goal.description = goal_data.description
    if goal_data.target_amount is not None:
        db_goal.target_amount = goal_data.target_amount
        db_goal.is_achieved = db_goal.current_amount >= db_goal.target_amount
    if goal_data.target_date is not None:
        db_goal.target_date = goal_data.target_date
    
    db.commit()
    db.refresh(db_goal)
    
    db_goal.progress_percentage = (db_goal.current_amount / db_goal.target_amount * 100) if db_goal.target_amount > 0 else 0
    db_goal.remaining_amount = max(0, db_goal.target_amount - db_goal.current_amount)
    
    return db_goal

@router.patch("/{goal_id}/add-money", response_model=GoalResponse)
async def add_money_to_goal(
    goal_id: int,
    money_data: GoalAddMoney,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Додати гроші до цілі"""
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ціль не знайдена"
        )
    
    if db_goal.is_achieved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ціль вже досягнута"
        )
    
    db_goal.current_amount += money_data.amount
    
    if db_goal.current_amount >= db_goal.target_amount:
        db_goal.is_achieved = True
        db_goal.current_amount = db_goal.target_amount  
    
    db.commit()
    db.refresh(db_goal)
    
    db_goal.progress_percentage = (db_goal.current_amount / db_goal.target_amount * 100) if db_goal.target_amount > 0 else 0
    db_goal.remaining_amount = max(0, db_goal.target_amount - db_goal.current_amount)
    
    return db_goal

@router.patch("/{goal_id}/withdraw", response_model=GoalResponse)
async def withdraw_money_from_goal(
    goal_id: int,
    money_data: GoalAddMoney,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Зняти гроші з цілі"""
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ціль не знайдена"
        )
    
    if money_data.amount > db_goal.current_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостатньо коштів у цілі"
        )
    
    db_goal.current_amount -= money_data.amount
    
    if db_goal.current_amount < db_goal.target_amount:
        db_goal.is_achieved = False
    
    db.commit()
    db.refresh(db_goal)
    
    db_goal.progress_percentage = (db_goal.current_amount / db_goal.target_amount * 100) if db_goal.target_amount > 0 else 0
    db_goal.remaining_amount = max(0, db_goal.target_amount - db_goal.current_amount)
    
    return db_goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Видалити ціль"""
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ціль не знайдена"
        )
    
    db.delete(db_goal)
    db.commit()
    
    return None 