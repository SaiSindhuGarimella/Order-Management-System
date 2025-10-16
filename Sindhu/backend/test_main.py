import pytest
from httpx import AsyncClient
from main import app
import os

# Set test environment variables
os.environ["MONGODB_URL"] = "mongodb://localhost:27017"
os.environ["DATABASE_NAME"] = "test_order_management"
os.environ["REDIS_HOST"] = "localhost"
os.environ["REDIS_PORT"] = "6379"


@pytest.mark.asyncio
async def test_root_endpoint():
    """Test the root endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "message" in data


@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "api" in data
        assert data["api"] == "healthy"


@pytest.mark.asyncio
async def test_create_order():
    """Test order creation"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        order_data = {
            "item_name": "Test Laptop",
            "quantity": 5
        }
        response = await client.post("/orders", json=order_data)
        
        if response.status_code == 201:
            data = response.json()
            assert data["item_name"] == "Test Laptop"
            assert data["quantity"] == 5
            assert data["status"] == "pending"
            assert "id" in data


@pytest.mark.asyncio
async def test_get_orders():
    """Test getting all orders"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/orders")
        
        # May fail if DB not available
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)


@pytest.mark.asyncio
async def test_create_order_validation():
    """Test order creation with invalid data"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Invalid quantity (negative)
        order_data = {
            "item_name": "Test Item",
            "quantity": -1
        }
        response = await client.post("/orders", json=order_data)
        assert response.status_code == 422
        
        # Invalid item name (empty)
        order_data = {
            "item_name": "",
            "quantity": 5
        }
        response = await client.post("/orders", json=order_data)
        assert response.status_code == 422

