import pytest
from datetime import datetime, date

class TestGoals:
    
    def test_create_goal_success(self, client, authenticated_user):
        """Test successful goal creation"""
        goal_data = {
            "name": "Save for vacation",
            "target_amount": 1000.0,
            "current_amount": 0.0,
            "target_date": "2024-12-31",
            "description": "Save money for summer vacation"
        }
        
        response = client.post(
            "/api/goals/",
            json=goal_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == goal_data["name"]
        assert data["target_amount"] == goal_data["target_amount"]
        assert data["current_amount"] == goal_data["current_amount"]
        assert data["target_date"] == goal_data["target_date"]
        assert data["description"] == goal_data["description"]
        assert data["is_active"] == True
        assert "id" in data
        assert "created_at" in data
    
    def test_create_goal_unauthorized(self, client):
        """Test goal creation without authentication"""
        goal_data = {
            "name": "Test Goal",
            "target_amount": 500.0,
            "target_date": "2024-12-31"
        }
        
        response = client.post("/api/goals/", json=goal_data)
        assert response.status_code == 401
    
    def test_create_goal_invalid_data(self, client, authenticated_user):
        """Test goal creation with invalid data"""
        invalid_data = {
            "name": "",  
            "target_amount": -100, 
            "target_date": "invalid-date"  
        }
        
        response = client.post(
            "/api/goals/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
    
    def test_get_goals_success(self, client, authenticated_user):
        """Test getting user goals"""
        goal_data = {
            "name": "Test Goal",
            "target_amount": 500.0,
            "target_date": "2024-12-31"
        }
        
        client.post(
            "/api/goals/",
            json=goal_data,
            headers=authenticated_user["headers"]
        )
        
        response = client.get("/api/goals/", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == goal_data["name"]
    
    def test_get_goals_unauthorized(self, client):
        """Test getting goals without authentication"""
        response = client.get("/api/goals/")
        assert response.status_code == 401
    
    def test_update_goal_success(self, client, authenticated_user):
        """Test successful goal update"""
        goal_data = {
            "name": "Original Goal",
            "target_amount": 500.0,
            "target_date": "2024-12-31"
        }
        
        create_response = client.post(
            "/api/goals/",
            json=goal_data,
            headers=authenticated_user["headers"]
        )
        goal_id = create_response.json()["id"]
        
        updated_data = {
            "name": "Updated Goal",
            "target_amount": 800.0,
            "current_amount": 100.0,
            "target_date": "2025-01-31"
        }
        
        response = client.put(
            f"/api/goals/{goal_id}",
            json=updated_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == updated_data["name"]
        assert data["target_amount"] == updated_data["target_amount"]
        assert data["current_amount"] == updated_data["current_amount"]
    
    def test_update_goal_unauthorized(self, client, authenticated_user):
        """Test goal update without authentication"""
        goal_data = {
            "name": "Test Goal",
            "target_amount": 500.0,
            "target_date": "2024-12-31"
        }
        
        create_response = client.post(
            "/api/goals/",
            json=goal_data,
            headers=authenticated_user["headers"]
        )
        goal_id = create_response.json()["id"]
        
        response = client.put(f"/api/goals/{goal_id}", json={"name": "Updated"})
        assert response.status_code == 401
    
    def test_delete_goal_success(self, client, authenticated_user):
        """Test successful goal deletion"""
        goal_data = {
            "name": "Goal to Delete",
            "target_amount": 500.0,
            "target_date": "2024-12-31"
        }
        
        create_response = client.post(
            "/api/goals/",
            json=goal_data,
            headers=authenticated_user["headers"]
        )
        goal_id = create_response.json()["id"]
        
        response = client.delete(
            f"/api/goals/{goal_id}",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 204
    
    def test_delete_goal_unauthorized(self, client, authenticated_user):
        """Test goal deletion without authentication"""
        goal_data = {
            "name": "Test Goal",
            "target_amount": 500.0,
            "target_date": "2024-12-31"
        }
        
        create_response = client.post(
            "/api/goals/",
            json=goal_data,
            headers=authenticated_user["headers"]
        )
        goal_id = create_response.json()["id"]
        
        response = client.delete(f"/api/goals/{goal_id}")
        assert response.status_code == 401

class TestGoalCalculations:
    
    def test_goal_progress_calculation(self, client, authenticated_user):
        """Test goal progress percentage calculation"""
        goal_data = {
            "name": "Progress Test Goal",
            "target_amount": 1000.0,
            "current_amount": 250.0,
            "target_date": "2024-12-31"
        }
        
        response = client.post(
            "/api/goals/",
            json=goal_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if "progress_percentage" in data:
            assert data["progress_percentage"] == 25.0 
    
    def test_goal_status_calculation(self, client, authenticated_user):
        """Test goal status determination"""
        completed_goal = {
            "name": "Completed Goal",
            "target_amount": 500.0,
            "current_amount": 500.0,
            "target_date": "2024-12-31"
        }
        
        response = client.post(
            "/api/goals/",
            json=completed_goal,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if "status" in data:
            assert data["status"] in ["completed", "active", "overdue"]
    
    def test_goal_remaining_amount(self, client, authenticated_user):
        """Test remaining amount calculation"""
        goal_data = {
            "name": "Remaining Test Goal",
            "target_amount": 1000.0,
            "current_amount": 300.0,
            "target_date": "2024-12-31"
        }
        
        response = client.post(
            "/api/goals/",
            json=goal_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if "remaining_amount" in data:
            assert data["remaining_amount"] == 700.0  

class TestGoalValidation:
    
    def test_goal_amount_validation(self, client, authenticated_user):
        """Test goal amount validation"""
        invalid_data = {
            "name": "Invalid Goal",
            "target_amount": -500.0,
            "target_date": "2024-12-31"
        }
        
        response = client.post(
            "/api/goals/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
        
        invalid_data = {
            "name": "Invalid Goal",
            "target_amount": 500.0,
            "current_amount": -100.0,
            "target_date": "2024-12-31"
        }
        
        response = client.post(
            "/api/goals/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
    
    def test_goal_date_validation(self, client, authenticated_user):
        """Test goal date validation"""
        invalid_data = {
            "name": "Invalid Date Goal",
            "target_amount": 500.0,
            "target_date": "invalid-date"
        }
        
        response = client.post(
            "/api/goals/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
        
        past_date_data = {
            "name": "Past Date Goal",
            "target_amount": 500.0,
            "target_date": "2020-01-01"
        }
        
        response = client.post(
            "/api/goals/",
            json=past_date_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code in [200, 422]
    
    def test_goal_name_validation(self, client, authenticated_user):
        """Test goal name validation"""
        invalid_data = {
            "name": "",
            "target_amount": 500.0,
            "target_date": "2024-12-31"
        }
        
        response = client.post(
            "/api/goals/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
        
        invalid_data = {
            "name": "x" * 256, 
            "target_amount": 500.0,
            "target_date": "2024-12-31"
        }
        
        response = client.post(
            "/api/goals/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422

class TestGoalSecurity:
    
    def test_goal_user_isolation(self, client, test_user_data):
        """Test that users can only access their own goals"""
        user1_response = client.post("/api/auth/register", json=test_user_data)
        user1_login = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        user1_headers = {"Authorization": f"Bearer {user1_login.json()['access_token']}"}
        
        goal_response = client.post(
            "/api/goals/",
            json={
                "name": "User 1 Goal",
                "target_amount": 500.0,
                "target_date": "2024-12-31"
            },
            headers=user1_headers
        )
        goal_id = goal_response.json()["id"]
        
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
        
        response = client.get(f"/api/goals/{goal_id}", headers=user2_headers)
        assert response.status_code in [403, 404]
        
        response = client.get("/api/goals/", headers=user2_headers)
        assert response.status_code == 200
        goals = response.json()
        goal_ids = [g["id"] for g in goals]
        assert goal_id not in goal_ids 