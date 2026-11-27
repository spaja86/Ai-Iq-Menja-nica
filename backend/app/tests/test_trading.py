"""
Tests for trading API and engine.
"""
import pytest
from fastapi import status
from app.models import Order, OrderSide, OrderType, OrderStatus


def test_create_limit_order(client, auth_headers, db_session):
    """Test creating a limit order."""
    response = client.post(
        "/api/trading/orders",
        headers=auth_headers,
        json={
            "trading_pair": "BTC/USD",
            "side": "buy",
            "order_type": "limit",
            "price": 50000.0,
            "quantity": 0.1
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["trading_pair"] == "BTC/USD"
    assert data["side"] == "buy"
    assert data["quantity"] == 0.1
    assert data["price"] == 50000.0


def test_create_market_order(client, auth_headers):
    """Test creating a market order."""
    response = client.post(
        "/api/trading/orders",
        headers=auth_headers,
        json={
            "trading_pair": "ETH/USD",
            "side": "sell",
            "order_type": "market",
            "quantity": 1.0
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["trading_pair"] == "ETH/USD"
    assert data["side"] == "sell"


def test_get_orders(client, auth_headers):
    """Test getting user orders."""
    # Create an order first
    client.post(
        "/api/trading/orders",
        headers=auth_headers,
        json={
            "trading_pair": "BTC/USD",
            "side": "buy",
            "order_type": "limit",
            "price": 50000.0,
            "quantity": 0.1
        }
    )
    
    # Get orders
    response = client.get("/api/trading/orders", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0
    assert data[0]["trading_pair"] == "BTC/USD"


def test_get_order_book(client):
    """Test getting order book."""
    response = client.get("/api/trading/orderbook/BTC/USD")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "bids" in data
    assert "asks" in data
    assert data["trading_pair"] == "BTC/USD"


def test_get_trading_pairs(client):
    """Test getting available trading pairs."""
    response = client.get("/api/trading/pairs")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "pairs" in data
    assert len(data["pairs"]) > 0


def test_cancel_order(client, auth_headers, db_session, test_user):
    """Test cancelling an order."""
    # Create an order
    create_response = client.post(
        "/api/trading/orders",
        headers=auth_headers,
        json={
            "trading_pair": "BTC/USD",
            "side": "buy",
            "order_type": "limit",
            "price": 50000.0,
            "quantity": 0.1
        }
    )
    
    order_id = create_response.json()["id"]
    
    # Cancel the order
    response = client.delete(
        f"/api/trading/orders/{order_id}",
        headers=auth_headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    assert "cancelled" in response.json()["message"].lower()
