import pytest
from fastapi.testclient import TestClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TestAuthentication:
    
    def test_register_user_success(self, client, test_user_data):
        """Test successful user registration"""
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["name"] == test_user_data["name"]
        assert "id" in data
        assert "password" not in data
        assert "hashed_password" not in data
    
    def test_register_user_duplicate_email(self, client, test_user_data):
        """Test registration with existing email"""
        client.post("/api/auth/register", json=test_user_data)
        
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_register_user_invalid_email(self, client):
        """Test registration with invalid email"""
        invalid_data = {
            "email": "invalid-email",
            "password": "testpassword123",
            "name": "Test User"
        }
        
        response = client.post("/api/auth/register", json=invalid_data)
        assert response.status_code == 422
    
    def test_login_success(self, client, test_user_data):
        """Test successful login"""
        client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == test_user_data["email"]
    
    def test_login_wrong_password(self, client, test_user_data):
        """Test login with wrong password"""
        client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "email": test_user_data["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_get_current_user(self, client, authenticated_user):
        """Test getting current user info"""
        response = client.get("/api/auth/me", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == authenticated_user["user_id"]
        assert "email" in data
        assert "name" in data
    
    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 401
    
    def test_get_current_user_no_token(self, client):
        """Test getting current user without token"""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 401

class TestPasswordSecurity:
    
    def test_password_hashing(self, client, test_user_data):
        """Test that passwords are properly hashed"""
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "password" not in data
        assert "hashed_password" not in data
    
    def test_password_verification(self, client, test_user_data):
        """Test password verification during login"""
        client.post("/api/auth/register", json=test_user_data)
        
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 200
        
        login_data["password"] = "wrongpassword"
        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401 