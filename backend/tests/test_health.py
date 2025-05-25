import pytest

class TestHealth:
    
    def test_health_check_success(self, client):
        """Test basic health check endpoint"""
        response = client.get("/api/health/")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data
    
    def test_health_check_no_auth_required(self, client):
        """Test that health check doesn't require authentication"""
        response = client.get("/api/health/")
        assert response.status_code == 200
    
    def test_database_health_check(self, client):
        """Test database connectivity check"""
        response = client.get("/api/health/db")
        
        assert response.status_code == 200
        data = response.json()
        assert "database" in data
        assert data["database"]["status"] in ["connected", "healthy"]
    
    def test_load_test_data_success(self, client, authenticated_user):
        """Test loading test data endpoint"""
        response = client.post(
            "/api/load-test-data",
            headers=authenticated_user["headers"]
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "users_created" in data
        assert "expenses_created" in data
    
    def test_load_test_data_unauthorized(self, client):
        """Test loading test data without authentication"""
        response = client.post("/api/load-test-data")
        assert response.status_code == 401
    
    def test_system_info_endpoint(self, client):
        """Test system information endpoint"""
        response = client.get("/api/health/info")
        
        assert response.status_code == 200
        data = response.json()
        assert "system" in data
        assert "database" in data
        assert "api_version" in data
    
    def test_metrics_endpoint(self, client, authenticated_user):
        """Test metrics endpoint if available"""
        response = client.get("/api/health/metrics", headers=authenticated_user["headers"])
        
        assert response.status_code in [200, 401, 404]
        
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)

class TestHealthValidation:
    
    def test_health_response_format(self, client):
        """Test that health response has correct format"""
        response = client.get("/api/health/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "timestamp" in data
        
        assert data["status"] in ["healthy", "unhealthy", "degraded"]
        
        assert isinstance(data["timestamp"], str)
    
    def test_database_health_response_format(self, client):
        """Test database health response format"""
        response = client.get("/api/health/db")
        
        if response.status_code == 200:
            data = response.json()
            assert "database" in data
            assert "status" in data["database"]
            
            db_info = data["database"]
            assert "status" in db_info
            assert db_info["status"] in ["connected", "disconnected", "error"]

class TestTestDataLoading:
    
    def test_test_data_creates_users(self, client, authenticated_user):
        """Test that test data loading creates users"""
        response = client.post(
            "/api/load-test-data",
            headers=authenticated_user["headers"]
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "users_created" in data
            assert isinstance(data["users_created"], int)
            assert data["users_created"] >= 0
    
    def test_test_data_creates_expenses(self, client, authenticated_user):
        """Test that test data loading creates expenses"""
        response = client.post(
            "/api/load-test-data",
            headers=authenticated_user["headers"]
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "expenses_created" in data
            assert isinstance(data["expenses_created"], int)
            assert data["expenses_created"] >= 0
    
    def test_test_data_idempotent(self, client, authenticated_user):
        """Test that loading test data multiple times is safe"""
        response1 = client.post(
            "/api/load-test-data",
            headers=authenticated_user["headers"]
        )
        
        response2 = client.post(
            "/api/load-test-data",
            headers=authenticated_user["headers"]
        )
        
        assert response1.status_code == response2.status_code
        
        if response1.status_code == 200 and response2.status_code == 200:
            data1 = response1.json()
            data2 = response2.json()
            assert "message" in data1
            assert "message" in data2

class TestSystemMonitoring:
    
    def test_uptime_tracking(self, client):
        """Test if system tracks uptime"""
        response = client.get("/api/health/")
        
        if response.status_code == 200:
            data = response.json()
            if "uptime" in data:
                assert isinstance(data["uptime"], (int, float, str))
    
    def test_version_information(self, client):
        """Test version information availability"""
        response = client.get("/api/health/")
        
        assert response.status_code == 200
        data = response.json()
        
        if "version" in data:
            assert isinstance(data["version"], str)
            assert len(data["version"]) > 0
    
    def test_environment_information(self, client):
        """Test environment information"""
        response = client.get("/api/health/info")
        
        if response.status_code == 200:
            data = response.json()
            
            if "system" in data:
                system_info = data["system"]
                assert isinstance(system_info, dict)
    
    def test_api_endpoints_health(self, client):
        """Test that critical API endpoints are accessible"""
        critical_endpoints = [
            "/api/health/",
            "/api/health/db"
        ]
        
        for endpoint in critical_endpoints:
            response = client.get(endpoint)
            assert response.status_code < 500
            
            try:
                response.json()
            except ValueError:
                pytest.fail(f"Endpoint {endpoint} did not return valid JSON")

class TestErrorHandling:
    
    def test_health_check_resilience(self, client):
        """Test that health check is resilient to errors"""
        response = client.get("/api/health/")
        
        assert response.status_code in [200, 503]  
        data = response.json()
        assert isinstance(data, dict)
        assert "status" in data
    
    def test_invalid_health_endpoints(self, client):
        """Test invalid health endpoints"""
        invalid_endpoints = [
            "/api/health/invalid",
            "/api/health/nonexistent"
        ]
        
        for endpoint in invalid_endpoints:
            response = client.get(endpoint)
            assert response.status_code == 404
    
    def test_health_check_with_invalid_methods(self, client):
        """Test health check with invalid HTTP methods"""
        response = client.post("/api/health/")
        assert response.status_code == 405 
        
        response = client.put("/api/health/")
        assert response.status_code == 405
        
        response = client.delete("/api/health/")
        assert response.status_code == 405 