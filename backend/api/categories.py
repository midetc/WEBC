from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models import Category
from api.auth import get_current_user

router = APIRouter()

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#607D8B"
    icon: Optional[str] = "📦"

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    color: str
    icon: str
    is_default: bool
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    include_default: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Category)
    
    if include_default:
        query = query.filter(
            (Category.user_id == current_user.id) | 
            (Category.is_default == True)
        )
    else:
        query = query.filter(Category.user_id == current_user.id)
    
    categories = query.order_by(Category.is_default.desc(), Category.name).all()
    return categories

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    existing = db.query(Category).filter(
        Category.name == category.name,
        Category.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Категорія з такою назвою вже існує"
        )
    
    db_category = Category(
        name=category.name,
        description=category.description,
        color=category.color,
        icon=category.icon,
        is_default=False,
        user_id=current_user.id
    )
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id,
        Category.is_default == False  
    ).first()
    
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категорія не знайдена або не може бути змінена"
        )
    
    db_category.name = category_data.name
    db_category.description = category_data.description
    db_category.color = category_data.color
    db_category.icon = category_data.icon
    
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id,
        Category.is_default == False  
    ).first()
    
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Категорія не знайдена або не може бути видалена"
        )
    
    db.delete(db_category)
    db.commit()
    
    return None 