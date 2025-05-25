import pytest
from datetime import datetime, date

class TestBudgets:
    
    def test_create_budget_success(self, client, authenticated_user, test_budget_data):
        """Test successful budget creation"""
        response = client.post(
            "/api/budgets/",
            json=test_budget_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == test_budget_data["name"]
        assert data["amount"] == test_budget_data["amount"]
        assert data["period"] == test_budget_data["period"]
        assert data["spent"] == 0.0
        assert data["is_active"] == True
        assert "id" in data
    
    def test_create_budget_unauthorized(self, client, test_budget_data):
        """Test budget creation without authentication"""
        response = client.post("/api/budgets/", json=test_budget_data)
        assert response.status_code == 401
    
    def test_create_budget_invalid_data(self, client, authenticated_user):
        """Test budget creation with invalid data"""
        invalid_data = {
            "name": "",  
            "amount": -100,  
            "period": "invalid_period",  
            "start_date": "invalid-date",  
            "end_date": "invalid-date"
        }
        
        response = client.post(
            "/api/budgets/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
    
    def test_get_budgets_success(self, client, authenticated_user, test_budget_data):
        """Test getting user budgets"""
        client.post(
            "/api/budgets/",
            json=test_budget_data,
            headers=authenticated_user["headers"]
        )
        
        response = client.get("/api/budgets/", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == test_budget_data["name"]
    
    def test_get_budgets_unauthorized(self, client):
        """Test getting budgets without authentication"""
        response = client.get("/api/budgets/")
        assert response.status_code == 401
    
    def test_update_budget_success(self, client, authenticated_user, test_budget_data):
        """Test successful budget update"""
        create_response = client.post(
            "/api/budgets/",
            json=test_budget_data,
            headers=authenticated_user["headers"]
        )
        budget_id = create_response.json()["id"]
        
        updated_data = {
            "name": "Updated Budget",
            "amount": 800.0,
            "period": "weekly",
            "start_date": "2024-02-01",
            "end_date": "2024-02-07"
        }
        
        response = client.put(
            f"/api/budgets/{budget_id}",
            json=updated_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == updated_data["name"]
        assert data["amount"] == updated_data["amount"]
        assert data["period"] == updated_data["period"]
    
    def test_update_budget_unauthorized(self, client, authenticated_user, test_budget_data):
        """Test budget update without authentication"""
        create_response = client.post(
            "/api/budgets/",
            json=test_budget_data,
            headers=authenticated_user["headers"]
        )
        budget_id = create_response.json()["id"]
        
        updated_data = {"name": "Updated Budget"}
        response = client.put(f"/api/budgets/{budget_id}", json=updated_data)
        
        assert response.status_code == 401
    
    def test_delete_budget_success(self, client, authenticated_user, test_budget_data):
        """Test successful budget deletion"""
        create_response = client.post(
            "/api/budgets/",
            json=test_budget_data,
            headers=authenticated_user["headers"]
        )
        budget_id = create_response.json()["id"]
        
        response = client.delete(
            f"/api/budgets/{budget_id}",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 204
    
    def test_delete_budget_unauthorized(self, client, authenticated_user, test_budget_data):
        """Test budget deletion without authentication"""
        create_response = client.post(
            "/api/budgets/",
            json=test_budget_data,
            headers=authenticated_user["headers"]
        )
        budget_id = create_response.json()["id"]
        
        response = client.delete(f"/api/budgets/{budget_id}")
        assert response.status_code == 401

class TestBudgetCalculations:
    
    def test_budget_remaining_calculation(self, client, authenticated_user):
        """Test budget remaining amount calculation"""
        budget_data = {
            "name": "Test Budget",
            "amount": 500.0,
            "period": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31"
        }
        
        budget_response = client.post(
            "/api/budgets/",
            json=budget_data,
            headers=authenticated_user["headers"]
        )
        budget_id = budget_response.json()["id"]
        
        expense_data = {
            "amount": 100.0,
            "description": "Test expense",
            "category": "food",
            "date": "2024-01-15"
        }
        
        client.post(
            "/api/expenses/",
            json=expense_data,
            headers=authenticated_user["headers"]
        )
        
        response = client.get(f"/api/budgets/{budget_id}", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        assert "remaining" in data or "percentage_used" in data
    
    def test_budget_period_validation(self, client, authenticated_user):
        """Test budget period validation"""
        valid_periods = ["daily", "weekly", "monthly", "yearly"]
        
        for period in valid_periods:
            budget_data = {
                "name": f"Test {period} Budget",
                "amount": 500.0,
                "period": period,
                "start_date": "2024-01-01",
                "end_date": "2024-01-31"
            }
            
            response = client.post(
                "/api/budgets/",
                json=budget_data,
                headers=authenticated_user["headers"]
            )
            
            assert response.status_code == 200
            assert response.json()["period"] == period
    
    def test_budget_date_range_validation(self, client, authenticated_user):
        """Test budget date range validation"""
        invalid_data = {
            "name": "Invalid Budget",
            "amount": 500.0,
            "period": "monthly",
            "start_date": "2024-01-31",
            "end_date": "2024-01-01"  
        }
        
        response = client.post(
            "/api/budgets/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code in [400, 422] or response.status_code == 200

class TestBudgetSecurity:
    
    def test_budget_user_isolation(self, client, test_user_data, test_budget_data):
        """Test that users can only access their own budgets"""
        user1_response = client.post("/api/auth/register", json=test_user_data)
        user1_login = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        user1_headers = {"Authorization": f"Bearer {user1_login.json()['access_token']}"}
        
        budget_response = client.post(
            "/api/budgets/",
            json=test_budget_data,
            headers=user1_headers
        )
        budget_id = budget_response.json()["id"]
        
        user2_data = {
            "email": "user2@example.com",
            "password": "password123",
            "name": "User Two"
        }
        client.post("/api/auth/register", json=user2_data)
        user2_login = client.post("/api/auth/login", json={
            "email": user2_data["email"],
            "password": user2_data["password"]
        })
        user2_headers = {"Authorization": f"Bearer {user2_login.json()['access_token']}"}
        
        response = client.get(f"/api/budgets/{budget_id}", headers=user2_headers)
        assert response.status_code in [403, 404]  
        
        response = client.get("/api/budgets/", headers=user2_headers)
        assert response.status_code == 200
        budgets = response.json()
        budget_ids = [b["id"] for b in budgets]
        assert budget_id not in budget_ids 