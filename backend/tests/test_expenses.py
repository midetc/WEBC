import pytest
from datetime import datetime, date

class TestExpenses:
    
    def test_create_expense_success(self, client, authenticated_user, test_expense_data):
        """Test successful expense creation"""
        response = client.post(
            "/api/expenses/",
            json=test_expense_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == test_expense_data["amount"]
        assert data["description"] == test_expense_data["description"]
        assert data["category"] == test_expense_data["category"]
        assert data["date"] == test_expense_data["date"]
        assert "id" in data
        assert "created_at" in data
    
    def test_create_expense_unauthorized(self, client, test_expense_data):
        """Test expense creation without authentication"""
        response = client.post("/api/expenses/", json=test_expense_data)
        assert response.status_code == 401
    
    def test_create_expense_invalid_data(self, client, authenticated_user):
        """Test expense creation with invalid data"""
        invalid_data = {
            "amount": -100, 
            "description": "", 
            "category": "",  
            "date": "invalid-date"  
        }
        
        response = client.post(
            "/api/expenses/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
    
    def test_get_expenses_success(self, client, authenticated_user, test_expense_data):
        """Test getting user expenses"""
        client.post(
            "/api/expenses/",
            json=test_expense_data,
            headers=authenticated_user["headers"]
        )
        
        response = client.get("/api/expenses/", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["amount"] == test_expense_data["amount"]
    
    def test_get_expenses_unauthorized(self, client):
        """Test getting expenses without authentication"""
        response = client.get("/api/expenses/")
        assert response.status_code == 401
    
    def test_get_expenses_with_filters(self, client, authenticated_user):
        """Test getting expenses with category filter"""
        expense1 = {
            "amount": 50.0,
            "description": "Lunch",
            "category": "food",
            "date": "2024-01-15"
        }
        expense2 = {
            "amount": 30.0,
            "description": "Bus ticket",
            "category": "transport",
            "date": "2024-01-15"
        }
        
        client.post("/api/expenses/", json=expense1, headers=authenticated_user["headers"])
        client.post("/api/expenses/", json=expense2, headers=authenticated_user["headers"])
        
        response = client.get(
            "/api/expenses/?category=food",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["category"] == "food"
    
    def test_update_expense_success(self, client, authenticated_user, test_expense_data):
        """Test successful expense update"""
        create_response = client.post(
            "/api/expenses/",
            json=test_expense_data,
            headers=authenticated_user["headers"]
        )
        expense_id = create_response.json()["id"]
        
        updated_data = {
            "amount": 200.0,
            "description": "Updated expense",
            "category": "entertainment",
            "date": "2024-01-20"
        }
        
        response = client.put(
            f"/api/expenses/{expense_id}",
            json=updated_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == updated_data["amount"]
        assert data["description"] == updated_data["description"]
        assert data["category"] == updated_data["category"]
    
    def test_update_expense_unauthorized(self, client, authenticated_user, test_expense_data):
        """Test expense update without authentication"""
        create_response = client.post(
            "/api/expenses/",
            json=test_expense_data,
            headers=authenticated_user["headers"]
        )
        expense_id = create_response.json()["id"]
        
        updated_data = {"amount": 200.0}
        response = client.put(f"/api/expenses/{expense_id}", json=updated_data)
        
        assert response.status_code == 401
    
    def test_update_nonexistent_expense(self, client, authenticated_user):
        """Test updating non-existent expense"""
        updated_data = {
            "amount": 200.0,
            "description": "Updated expense",
            "category": "entertainment",
            "date": "2024-01-20"
        }
        
        response = client.put(
            "/api/expenses/99999",
            json=updated_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 404
    
    def test_delete_expense_success(self, client, authenticated_user, test_expense_data):
        """Test successful expense deletion"""
        create_response = client.post(
            "/api/expenses/",
            json=test_expense_data,
            headers=authenticated_user["headers"]
        )
        expense_id = create_response.json()["id"]
        
        response = client.delete(
            f"/api/expenses/{expense_id}",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 204
        
        get_response = client.get(
            f"/api/expenses/{expense_id}",
            headers=authenticated_user["headers"]
        )
        assert get_response.status_code == 404
    
    def test_delete_expense_unauthorized(self, client, authenticated_user, test_expense_data):
        """Test expense deletion without authentication"""
        create_response = client.post(
            "/api/expenses/",
            json=test_expense_data,
            headers=authenticated_user["headers"]
        )
        expense_id = create_response.json()["id"]
        
        response = client.delete(f"/api/expenses/{expense_id}")
        assert response.status_code == 401
    
    def test_delete_nonexistent_expense(self, client, authenticated_user):
        """Test deleting non-existent expense"""
        response = client.delete(
            "/api/expenses/99999",
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 404

class TestExpenseValidation:
    
    def test_expense_amount_validation(self, client, authenticated_user):
        """Test expense amount validation"""
        invalid_data = {
            "amount": -50.0,
            "description": "Test expense",
            "category": "food",
            "date": "2024-01-15"
        }
        
        response = client.post(
            "/api/expenses/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
        
        invalid_data["amount"] = 0.0
        response = client.post(
            "/api/expenses/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
    
    def test_expense_date_validation(self, client, authenticated_user):
        """Test expense date validation"""
        invalid_data = {
            "amount": 50.0,
            "description": "Test expense",
            "category": "food",
            "date": "invalid-date-format"
        }
        
        response = client.post(
            "/api/expenses/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
    
    def test_expense_required_fields(self, client, authenticated_user):
        """Test that all required fields are validated"""
        incomplete_data = {
            "description": "Test expense",
            "category": "food",
            "date": "2024-01-15"
        }
        
        response = client.post(
            "/api/expenses/",
            json=incomplete_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422 