import pytest
import os
import tempfile
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import get_db, Base
from models import User, Category, Expense, Budget, Goal

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def test_user_data():
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "name": "Test User"
    }

@pytest.fixture
def test_expense_data():
    return {
        "amount": 100.50,
        "description": "Test expense",
        "category": "food",
        "date": "2024-01-15"
    }

@pytest.fixture
def test_budget_data():
    return {
        "name": "Monthly Food Budget",
        "amount": 500.0,
        "period": "monthly",
        "start_date": "2024-01-01",
        "end_date": "2024-01-31"
    }

@pytest.fixture
def authenticated_user(client, test_user_data, db_session):
    response = client.post("/api/auth/register", json=test_user_data)
    assert response.status_code == 200
    
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"]
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    
    token = response.json()["access_token"]
    user_id = response.json()["user"]["id"]
    
    return {
        "token": token,
        "user_id": user_id,
        "headers": {"Authorization": f"Bearer {token}"}
    } 