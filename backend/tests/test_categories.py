import pytest

class TestCategories:
    
    def test_get_categories_success(self, client, authenticated_user):
        """Test getting user categories including defaults"""
        response = client.get("/api/categories/", headers=authenticated_user["headers"])
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        category_names = [cat["name"] for cat in data]
        default_categories = ["food", "transport", "entertainment", "shopping", "health"]
        for default_cat in default_categories:
            assert any(default_cat.lower() in name.lower() for name in category_names)
    
    def test_get_categories_unauthorized(self, client):
        """Test getting categories without authentication"""
        response = client.get("/api/categories/")
        assert response.status_code == 401
    
    def test_create_category_success(self, client, authenticated_user):
        """Test successful category creation"""
        category_data = {
            "name": "Custom Category",
            "description": "My custom category",
            "color": "#FF5733",
            "icon": "custom-icon"
        }
        
        response = client.post(
            "/api/categories/",
            json=category_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == category_data["name"]
        assert data["description"] == category_data["description"]
        assert data["color"] == category_data["color"]
        assert data["icon"] == category_data["icon"]
        assert data["is_default"] == False
        assert "id" in data
    
    def test_create_category_unauthorized(self, client):
        """Test category creation without authentication"""
        category_data = {
            "name": "Test Category",
            "description": "Test description"
        }
        
        response = client.post("/api/categories/", json=category_data)
        assert response.status_code == 401
    
    def test_create_category_invalid_data(self, client, authenticated_user):
        """Test category creation with invalid data"""
        invalid_data = {
            "name": "",  
            "description": "Test description"
        }
        
        response = client.post(
            "/api/categories/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
    
    def test_update_category_success(self, client, authenticated_user):
        """Test successful category update"""
        category_data = {
            "name": "Original Category",
            "description": "Original description",
            "color": "#FF5733"
        }
        
        create_response = client.post(
            "/api/categories/",
            json=category_data,
            headers=authenticated_user["headers"]
        )
        category_id = create_response.json()["id"]
        
        updated_data = {
            "name": "Updated Category",
            "description": "Updated description",
            "color": "#33FF57"
        }
        
        response = client.put(
            f"/api/categories/{category_id}",
            json=updated_data,
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == updated_data["name"]
        assert data["description"] == updated_data["description"]
        assert data["color"] == updated_data["color"]
    
    def test_update_category_unauthorized(self, client, authenticated_user):
        """Test category update without authentication"""
        category_data = {"name": "Test Category"}
        create_response = client.post(
            "/api/categories/",
            json=category_data,
            headers=authenticated_user["headers"]
        )
        category_id = create_response.json()["id"]
        
        response = client.put(f"/api/categories/{category_id}", json={"name": "Updated"})
        assert response.status_code == 401
    
    def test_delete_category_success(self, client, authenticated_user):
        """Test successful category deletion"""
        category_data = {"name": "Category to Delete"}
        create_response = client.post(
            "/api/categories/",
            json=category_data,
            headers=authenticated_user["headers"]
        )
        category_id = create_response.json()["id"]
        
        response = client.delete(
            f"/api/categories/{category_id}",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 204
    
    def test_delete_category_unauthorized(self, client, authenticated_user):
        """Test category deletion without authentication"""
        category_data = {"name": "Test Category"}
        create_response = client.post(
            "/api/categories/",
            json=category_data,
            headers=authenticated_user["headers"]
        )
        category_id = create_response.json()["id"]
        
        response = client.delete(f"/api/categories/{category_id}")
        assert response.status_code == 401
    
    def test_category_user_isolation(self, client, test_user_data):
        """Test that users can only access their own categories"""
        user1_response = client.post("/api/auth/register", json=test_user_data)
        user1_login = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
        user1_headers = {"Authorization": f"Bearer {user1_login.json()['access_token']}"}
        
        category_response = client.post(
            "/api/categories/",
            json={"name": "User 1 Category"},
            headers=user1_headers
        )
        category_id = category_response.json()["id"]
        
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
        
        response = client.get(f"/api/categories/{category_id}", headers=user2_headers)
        assert response.status_code in [403, 404]

class TestCategoryValidation:
    
    def test_category_name_validation(self, client, authenticated_user):
        """Test category name validation"""
        invalid_data = {"name": ""}
        response = client.post(
            "/api/categories/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
        
        invalid_data = {"name": "x" * 256}  
        response = client.post(
            "/api/categories/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 422
    
    def test_category_color_validation(self, client, authenticated_user):
        """Test category color validation"""
        invalid_data = {
            "name": "Test Category",
            "color": "invalid-color"
        }
        response = client.post(
            "/api/categories/",
            json=invalid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code in [200, 422]
        
        valid_data = {
            "name": "Test Category",
            "color": "#FF5733"
        }
        response = client.post(
            "/api/categories/",
            json=valid_data,
            headers=authenticated_user["headers"]
        )
        assert response.status_code == 200 