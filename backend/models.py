from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    expenses = relationship("Expense", back_populates="user")
    categories = relationship("Category", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
    goals = relationship("Goal", back_populates="user")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    color = Column(String)
    icon = Column(String)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="categories")
    expenses = relationship("Expense", back_populates="category_obj")

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    description = Column(String)
    category = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"))
    date = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="expenses")
    category_obj = relationship("Category", back_populates="expenses")

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    amount = Column(Float)
    spent = Column(Float, default=0.0)
    period = Column(String)
    start_date = Column(String)
    end_date = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="budgets")

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    target_amount = Column(Float)
    current_amount = Column(Float, default=0.0)
    target_date = Column(String)
    is_achieved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="goals") 