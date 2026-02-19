"""Basic tests for the API endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Ai IQ Menjačnica API"


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "environment" in data


def test_api_docs():
    """Test API documentation endpoint."""
    response = client.get("/api/v1/docs")
    assert response.status_code == 200


def test_login_endpoint():
    """Test login endpoint structure."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpass"}
    )
    # Currently returns mock data
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_get_markets():
    """Test get markets endpoint."""
    response = client.get("/api/v1/trading/markets")
    assert response.status_code == 200
    data = response.json()
    assert "markets" in data


def test_get_balances():
    """Test get balances endpoint."""
    response = client.get("/api/v1/wallet/balances")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
