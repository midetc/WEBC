import pytest
from datetime import datetime, date, timedelta

class TestAnalytics:
    
    def test_expenses_by_category(self, client, authenticated_user):
        """Test expenses by category analytics"""
        expenses = [
            {"amount": 100.0, "description": "Lunch", "category": "food", "date": "2024-01-15"},
            {"amount": 50.0, "description": "Dinner", "category": "food", "date": "2024-01-16"},
            {"amount": 30.0, "description": "Bus", "category": "transport", "date": "2024-01-15"},
            {"amount": 200.0, "description": "Movie", "category": "entertainment", "date": "2024-01-17"}
        ]
        
        for expense in expenses:
            client.post("/api/expenses/", json=expense, headers=authenticated_user["headers"])
        
        response = client.get("/api/analytics/expenses-by-category", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        categories = {item["category"]: item for item in data}
        assert "food" in categories
        assert "transport" in categories
        assert "entertainment" in categories
        
        assert categories["food"]["total"] == 150.0
        assert categories["transport"]["total"] == 30.0
        assert categories["entertainment"]["total"] == 200.0
    
    def test_monthly_trends(self, client, authenticated_user):
        """Test monthly trends analytics"""
        expenses = [
            {"amount": 100.0, "description": "Jan expense", "category": "food", "date": "2024-01-15"},
            {"amount": 150.0, "description": "Jan expense 2", "category": "food", "date": "2024-01-20"},
            {"amount": 200.0, "description": "Feb expense", "category": "food", "date": "2024-02-10"},
            {"amount": 75.0, "description": "Feb expense 2", "category": "transport", "date": "2024-02-15"}
        ]
        
        for expense in expenses:
            client.post("/api/expenses/", json=expense, headers=authenticated_user["headers"])
        
        response = client.get("/api/analytics/monthly-trends", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        months = {item["month"]: item for item in data}
        assert "2024-01" in months
        assert "2024-02" in months
        
        assert months["2024-01"]["total"] == 250.0
        assert months["2024-02"]["total"] == 275.0
    
    def test_analytics_unauthorized(self, client):
        """Test analytics endpoints without authentication"""
        endpoints = [
            "/api/analytics/expenses-by-category",
            "/api/analytics/monthly-trends",
            "/api/analytics/spending-forecast",
            "/api/analytics/anomaly-detection"
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 401
    
    def test_spending_forecast(self, client, authenticated_user):
        """Test spending forecast analytics"""
        base_date = datetime(2024, 1, 1)
        for i in range(30):  
            expense_date = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
            expense = {
                "amount": 50.0 + (i % 10) * 5,  
                "description": f"Daily expense {i}",
                "category": "food",
                "date": expense_date
            }
            client.post("/api/expenses/", json=expense, headers=authenticated_user["headers"])
        
        response = client.get("/api/analytics/spending-forecast", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        assert "forecast" in data
        assert "confidence_interval" in data
        assert isinstance(data["forecast"], list)
        
        if data["forecast"]:
            forecast_dates = [item["date"] for item in data["forecast"]]
            assert len(forecast_dates) > 0
    
    def test_anomaly_detection(self, client, authenticated_user):
        """Test anomaly detection analytics"""
        normal_expenses = [
            {"amount": 50.0, "description": "Normal lunch", "category": "food", "date": "2024-01-15"},
            {"amount": 45.0, "description": "Normal lunch", "category": "food", "date": "2024-01-16"},
            {"amount": 55.0, "description": "Normal lunch", "category": "food", "date": "2024-01-17"},
        ]
        
        anomaly_expense = {
            "amount": 500.0, 
            "description": "Expensive dinner",
            "category": "food",
            "date": "2024-01-18"
        }
        
        for expense in normal_expenses:
            client.post("/api/expenses/", json=expense, headers=authenticated_user["headers"])
        
        client.post("/api/expenses/", json=anomaly_expense, headers=authenticated_user["headers"])
        
        response = client.get("/api/analytics/anomaly-detection", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        assert "anomalies" in data
        assert isinstance(data["anomalies"], list)
        
        if data["anomalies"]:
            anomaly_amounts = [item["amount"] for item in data["anomalies"]]
            assert 500.0 in anomaly_amounts

class TestAnalyticsCalculations:
    
    def test_category_percentage_calculation(self, client, authenticated_user):
        """Test category percentage calculations"""
        expenses = [
            {"amount": 100.0, "description": "Food", "category": "food", "date": "2024-01-15"},
            {"amount": 50.0, "description": "Transport", "category": "transport", "date": "2024-01-15"},
            {"amount": 50.0, "description": "Entertainment", "category": "entertainment", "date": "2024-01-15"}
        ]
        
        for expense in expenses:
            client.post("/api/expenses/", json=expense, headers=authenticated_user["headers"])
        
        response = client.get("/api/analytics/expenses-by-category", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        total_amount = sum(item["total"] for item in data)
        assert total_amount == 200.0
        
        for item in data:
            if "percentage" in item:
                if item["category"] == "food":
                    assert item["percentage"] == 50.0  
                elif item["category"] in ["transport", "entertainment"]:
                    assert item["percentage"] == 25.0  
    
    def test_trend_calculation_accuracy(self, client, authenticated_user):
        """Test accuracy of trend calculations"""
        expenses = [
            {"amount": 100.0, "description": "Week 1", "category": "food", "date": "2024-01-01"},
            {"amount": 110.0, "description": "Week 2", "category": "food", "date": "2024-01-08"},
            {"amount": 120.0, "description": "Week 3", "category": "food", "date": "2024-01-15"},
            {"amount": 130.0, "description": "Week 4", "category": "food", "date": "2024-01-22"}
        ]
        
        for expense in expenses:
            client.post("/api/expenses/", json=expense, headers=authenticated_user["headers"])
        
        response = client.get("/api/analytics/monthly-trends", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        
        jan_data = next((item for item in data if item["month"] == "2024-01"), None)
        assert jan_data is not None
        assert jan_data["total"] == 460.0  
    
    def test_empty_data_handling(self, client, authenticated_user):
        """Test analytics with no expense data"""
        
        endpoints = [
            "/api/analytics/expenses-by-category",
            "/api/analytics/monthly-trends"
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint, headers=authenticated_user["headers"])
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) == 0  

class TestAnalyticsSecurity:
    
    def test_analytics_user_isolation(self, client, test_user_data):
        """Test that analytics only show user's own data"""
        user1_response = client.post("/api/auth/register", json=test_user_data)
        user1_login = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        user1_headers = {"Authorization": f"Bearer {user1_login.json()['access_token']}"}
        
        user1_expense = {
            "amount": 100.0,
            "description": "User 1 expense",
            "category": "food",
            "date": "2024-01-15"
        }
        client.post("/api/expenses/", json=user1_expense, headers=user1_headers)
        
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
        
        user2_expense = {
            "amount": 200.0,
            "description": "User 2 expense",
            "category": "food",
            "date": "2024-01-15"
        }
        client.post("/api/expenses/", json=user2_expense, headers=user2_headers)
        
        user1_analytics = client.get("/api/analytics/expenses-by-category", headers=user1_headers)
        user2_analytics = client.get("/api/analytics/expenses-by-category", headers=user2_headers)
        
        assert user1_analytics.status_code == 200
        assert user2_analytics.status_code == 200
        
        user1_data = user1_analytics.json()
        user2_data = user2_analytics.json()
        
        user1_total = sum(item["total"] for item in user1_data)
        assert user1_total == 100.0
        
        user2_total = sum(item["total"] for item in user2_data)
        assert user2_total == 200.0 