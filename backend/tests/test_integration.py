import pytest
from datetime import datetime, timedelta

class TestFullUserFlow:
    """Integration tests for complete user workflows"""
    
    def test_complete_expense_management_flow(self, client, test_user_data):
        """Test complete flow: register -> login -> create expense -> get analytics"""
        
        register_response = client.post("/api/auth/register", json=test_user_data)
        assert register_response.status_code == 200
        user_id = register_response.json()["id"]
        
        login_response = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        expenses = [
            {"amount": 50.0, "description": "Lunch", "category": "food", "date": "2024-01-15"},
            {"amount": 30.0, "description": "Bus", "category": "transport", "date": "2024-01-15"},
            {"amount": 100.0, "description": "Groceries", "category": "food", "date": "2024-01-16"},
        ]
        
        expense_ids = []
        for expense in expenses:
            response = client.post("/api/expenses/", json=expense, headers=headers)
            assert response.status_code == 200
            expense_ids.append(response.json()["id"])
        
        expenses_response = client.get("/api/expenses/", headers=headers)
        assert expenses_response.status_code == 200
        user_expenses = expenses_response.json()
        assert len(user_expenses) == 3
        
        analytics_response = client.get("/api/analytics/expenses-by-category", headers=headers)
        assert analytics_response.status_code == 200
        analytics_data = analytics_response.json()
        
        food_total = sum(item["total"] for item in analytics_data if item["category"] == "food")
        transport_total = sum(item["total"] for item in analytics_data if item["category"] == "transport")
        
        assert food_total == 150.0 
        assert transport_total == 30.0
        
        updated_expense = {
            "amount": 75.0,
            "description": "Updated lunch",
            "category": "food",
            "date": "2024-01-15"
        }
        update_response = client.put(f"/api/expenses/{expense_ids[0]}", json=updated_expense, headers=headers)
        assert update_response.status_code == 200
        
        updated_analytics = client.get("/api/analytics/expenses-by-category", headers=headers)
        assert updated_analytics.status_code == 200
        updated_data = updated_analytics.json()
        
        updated_food_total = sum(item["total"] for item in updated_data if item["category"] == "food")
        assert updated_food_total == 175.0  
        
        delete_response = client.delete(f"/api/expenses/{expense_ids[1]}", headers=headers)
        assert delete_response.status_code == 204
        
        final_expenses = client.get("/api/expenses/", headers=headers)
        assert final_expenses.status_code == 200
        assert len(final_expenses.json()) == 2
    
    def test_budget_expense_integration(self, client, authenticated_user):
        """Test integration between budgets and expenses"""
        
        budget_data = {
            "name": "Food Budget",
            "amount": 200.0,
            "period": "monthly",
            "start_date": "2024-01-01",
            "end_date": "2024-01-31"
        }
        
        budget_response = client.post("/api/budgets/", json=budget_data, headers=authenticated_user["headers"])
        assert budget_response.status_code == 200
        budget_id = budget_response.json()["id"]
        
        expenses = [
            {"amount": 50.0, "description": "Lunch", "category": "food", "date": "2024-01-15"},
            {"amount": 75.0, "description": "Dinner", "category": "food", "date": "2024-01-16"},
        ]
        
        for expense in expenses:
            response = client.post("/api/expenses/", json=expense, headers=authenticated_user["headers"])
            assert response.status_code == 200
        
        budget_status = client.get(f"/api/budgets/{budget_id}", headers=authenticated_user["headers"])
        assert budget_status.status_code == 200
        
    
    def test_analytics_data_consistency(self, client, authenticated_user):
        """Test that analytics data is consistent across different endpoints"""
        
        expenses = [
            {"amount": 100.0, "description": "Food 1", "category": "food", "date": "2024-01-15"},
            {"amount": 50.0, "description": "Food 2", "category": "food", "date": "2024-01-20"},
            {"amount": 30.0, "description": "Transport", "category": "transport", "date": "2024-01-18"},
        ]
        
        for expense in expenses:
            client.post("/api/expenses/", json=expense, headers=authenticated_user["headers"])
        
        category_analytics = client.get("/api/analytics/expenses-by-category", headers=authenticated_user["headers"])
        monthly_trends = client.get("/api/analytics/monthly-trends", headers=authenticated_user["headers"])
        
        assert category_analytics.status_code == 200
        assert monthly_trends.status_code == 200
        
        category_data = category_analytics.json()
        monthly_data = monthly_trends.json()
        
        category_total = sum(item["total"] for item in category_data)
        
        monthly_total = sum(item["total"] for item in monthly_data)
        
        assert category_total == monthly_total == 180.0

class TestErrorHandling:
    """Integration tests for error handling across modules"""
    
    def test_invalid_token_across_endpoints(self, client):
        """Test that invalid tokens are handled consistently across all endpoints"""
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        
        endpoints = [
            ("/api/auth/me", "GET"),
            ("/api/expenses/", "GET"),
            ("/api/expenses/", "POST"),
            ("/api/budgets/", "GET"),
            ("/api/budgets/", "POST"),
            ("/api/analytics/expenses-by-category", "GET"),
            ("/api/analytics/monthly-trends", "GET"),
        ]
        
        for endpoint, method in endpoints:
            if method == "GET":
                response = client.get(endpoint, headers=invalid_headers)
            elif method == "POST":
                response = client.post(endpoint, json={}, headers=invalid_headers)
            
            assert response.status_code == 401
            assert "detail" in response.json()
    
    def test_database_transaction_rollback(self, client, authenticated_user):
        """Test that database transactions are properly rolled back on errors"""
        
        valid_expense = {
            "amount": 50.0,
            "description": "Valid expense",
            "category": "food",
            "date": "2024-01-15"
        }
        
        response = client.post("/api/expenses/", json=valid_expense, headers=authenticated_user["headers"])
        assert response.status_code == 200
        
        initial_response = client.get("/api/expenses/", headers=authenticated_user["headers"])
        initial_count = len(initial_response.json())
        
        invalid_expense = {
            "amount": -50.0,  
            "description": "Invalid expense",
            "category": "food",
            "date": "invalid-date"
        }
        
        response = client.post("/api/expenses/", json=invalid_expense, headers=authenticated_user["headers"])
        assert response.status_code == 422
        
        final_response = client.get("/api/expenses/", headers=authenticated_user["headers"])
        final_count = len(final_response.json())
        
        assert final_count == initial_count

class TestPerformance:
    """Basic performance and load tests"""
    
    def test_large_dataset_handling(self, client, authenticated_user):
        """Test system behavior with larger datasets"""
        
        expenses = []
        for i in range(50):  
            expense = {
                "amount": 10.0 + (i % 10),
                "description": f"Expense {i}",
                "category": "food" if i % 2 == 0 else "transport",
                "date": f"2024-01-{(i % 28) + 1:02d}"
            }
            expenses.append(expense)
        
        for expense in expenses:
            response = client.post("/api/expenses/", json=expense, headers=authenticated_user["headers"])
            assert response.status_code == 200
        
        analytics_response = client.get("/api/analytics/expenses-by-category", headers=authenticated_user["headers"])
        assert analytics_response.status_code == 200
        
        paginated_response = client.get("/api/expenses/?limit=10&skip=0", headers=authenticated_user["headers"])
        assert paginated_response.status_code == 200
        assert len(paginated_response.json()) == 10
        
        filtered_response = client.get("/api/expenses/?category=food", headers=authenticated_user["headers"])
        assert filtered_response.status_code == 200
        food_expenses = filtered_response.json()
        assert all(expense["category"] == "food" for expense in food_expenses) 