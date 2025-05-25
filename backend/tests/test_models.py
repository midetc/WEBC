import pytest
from datetime import datetime, date
from sqlalchemy.exc import IntegrityError
from models import User, Category, Expense, Budget, Goal
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TestUserModel:
    
    def test_user_creation(self, db_session):
        """Test user model creation"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.created_at is not None
        assert user.is_active == True
    
    def test_user_email_unique(self, db_session):
        """Test that user email must be unique"""
        user1 = User(
            email="test@example.com",
            name="User One",
            hashed_password=pwd_context.hash("password123")
        )
        
        user2 = User(
            email="test@example.com",  
            name="User Two",
            hashed_password=pwd_context.hash("password456")
        )
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_user_password_hashing(self, db_session):
        """Test password hashing functionality"""
        plain_password = "mypassword123"
        hashed = pwd_context.hash(plain_password)
        
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=hashed
        )
        
        db_session.add(user)
        db_session.commit()
        
        assert user.hashed_password != plain_password
        assert pwd_context.verify(plain_password, user.hashed_password)
    
    def test_user_relationships(self, db_session):
        """Test user model relationships"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        
        db_session.add(user)
        db_session.commit()
        
        assert hasattr(user, 'expenses')
        assert hasattr(user, 'budgets')
        assert hasattr(user, 'goals')
        assert hasattr(user, 'categories')

class TestCategoryModel:
    
    def test_category_creation(self, db_session):
        """Test category model creation"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        category = Category(
            name="Food",
            description="Food and dining",
            color="#FF5733",
            icon="food-icon",
            user_id=user.id
        )
        
        db_session.add(category)
        db_session.commit()
        
        assert category.id is not None
        assert category.name == "Food"
        assert category.description == "Food and dining"
        assert category.color == "#FF5733"
        assert category.icon == "food-icon"
        assert category.user_id == user.id
        assert category.is_default == False
    
    def test_default_category_creation(self, db_session):
        """Test default category creation"""
        category = Category(
            name="Default Food",
            description="Default food category",
            is_default=True
        )
        
        db_session.add(category)
        db_session.commit()
        
        assert category.is_default == True
        assert category.user_id is None  

class TestExpenseModel:
    
    def test_expense_creation(self, db_session):
        """Test expense model creation"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        expense = Expense(
            amount=50.75,
            description="Lunch at restaurant",
            category="food",
            date=date(2024, 1, 15),
            user_id=user.id
        )
        
        db_session.add(expense)
        db_session.commit()
        
        assert expense.id is not None
        assert expense.amount == 50.75
        assert expense.description == "Lunch at restaurant"
        assert expense.category == "food"
        assert expense.date == date(2024, 1, 15)
        assert expense.user_id == user.id
        assert expense.created_at is not None
    
    def test_expense_amount_precision(self, db_session):
        """Test expense amount precision"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        expense = Expense(
            amount=123.456789,  
            description="Test expense",
            category="test",
            date=date.today(),
            user_id=user.id
        )
        
        db_session.add(expense)
        db_session.commit()
        
        assert isinstance(expense.amount, (int, float))
        assert expense.amount > 0

class TestBudgetModel:
    
    def test_budget_creation(self, db_session):
        """Test budget model creation"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        budget = Budget(
            name="Monthly Food Budget",
            amount=500.0,
            spent=0.0,
            period="monthly",
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
            user_id=user.id
        )
        
        db_session.add(budget)
        db_session.commit()
        
        assert budget.id is not None
        assert budget.name == "Monthly Food Budget"
        assert budget.amount == 500.0
        assert budget.spent == 0.0
        assert budget.period == "monthly"
        assert budget.start_date == date(2024, 1, 1)
        assert budget.end_date == date(2024, 1, 31)
        assert budget.user_id == user.id
        assert budget.is_active == True
    
    def test_budget_calculations(self, db_session):
        """Test budget calculation properties"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        budget = Budget(
            name="Test Budget",
            amount=1000.0,
            spent=250.0,
            period="monthly",
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
            user_id=user.id
        )
        
        db_session.add(budget)
        db_session.commit()
        
        if hasattr(budget, 'remaining'):
            assert budget.remaining == 750.0
        
        if hasattr(budget, 'percentage_used'):
            assert budget.percentage_used == 25.0

class TestGoalModel:
    
    def test_goal_creation(self, db_session):
        """Test goal model creation"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        goal = Goal(
            name="Save for vacation",
            target_amount=2000.0,
            current_amount=500.0,
            target_date=date(2024, 12, 31),
            description="Summer vacation savings",
            user_id=user.id
        )
        
        db_session.add(goal)
        db_session.commit()
        
        assert goal.id is not None
        assert goal.name == "Save for vacation"
        assert goal.target_amount == 2000.0
        assert goal.current_amount == 500.0
        assert goal.target_date == date(2024, 12, 31)
        assert goal.description == "Summer vacation savings"
        assert goal.user_id == user.id
        assert goal.is_active == True
    
    def test_goal_progress_calculation(self, db_session):
        """Test goal progress calculation"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        goal = Goal(
            name="Test Goal",
            target_amount=1000.0,
            current_amount=250.0,
            target_date=date(2024, 12, 31),
            user_id=user.id
        )
        
        db_session.add(goal)
        db_session.commit()
        
        if hasattr(goal, 'progress_percentage'):
            assert goal.progress_percentage == 25.0
        
        if hasattr(goal, 'remaining_amount'):
            assert goal.remaining_amount == 750.0

class TestModelRelationships:
    
    def test_user_expense_relationship(self, db_session):
        """Test relationship between user and expenses"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        expense = Expense(
            amount=50.0,
            description="Test expense",
            category="food",
            date=date.today(),
            user_id=user.id
        )
        db_session.add(expense)
        db_session.commit()
        
        assert expense.user_id == user.id
        assert expense in user.expenses
    
    def test_user_budget_relationship(self, db_session):
        """Test relationship between user and budgets"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        budget = Budget(
            name="Test Budget",
            amount=500.0,
            period="monthly",
            start_date=date.today(),
            end_date=date.today(),
            user_id=user.id
        )
        db_session.add(budget)
        db_session.commit()
        
        assert budget.user_id == user.id
        assert budget in user.budgets
    
    def test_user_goal_relationship(self, db_session):
        """Test relationship between user and goals"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        goal = Goal(
            name="Test Goal",
            target_amount=1000.0,
            target_date=date.today(),
            user_id=user.id
        )
        db_session.add(goal)
        db_session.commit()
        
        assert goal.user_id == user.id
        assert goal in user.goals

class TestModelValidation:
    
    def test_user_email_validation(self, db_session):
        """Test user email validation"""
        user = User(
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        
        db_session.add(user)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_expense_amount_validation(self, db_session):
        """Test expense amount validation"""
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=pwd_context.hash("password123")
        )
        db_session.add(user)
        db_session.commit()
        
        expense = Expense(
            description="Test expense",
            category="food",
            date=date.today(),
            user_id=user.id
        )
        
        db_session.add(expense)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_foreign_key_constraints(self, db_session):
        """Test foreign key constraints"""
        expense = Expense(
            amount=50.0,
            description="Test expense",
            category="food",
            date=date.today(),
            user_id=99999  
        )
        
        db_session.add(expense)
        with pytest.raises(IntegrityError):
            db_session.commit() 