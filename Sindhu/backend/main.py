from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import os
import redis.asyncio as redis
import json
import logging
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Order Management API", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "order_management")

# Redis connection
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# Global variables for connections
mongodb_client = None
database = None
redis_client = None


class OrderCreate(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(..., gt=0, le=1000)


class Order(BaseModel):
    id: str
    item_name: str
    quantity: int
    status: str
    created_at: str
    updated_at: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "item_name": "Laptop",
                "quantity": 2,
                "status": "pending",
                "created_at": "2025-10-15T10:30:00",
                "updated_at": "2025-10-15T10:30:00"
            }
        }


@app.on_event("startup")
async def startup_db_client():
    """Initialize database and Redis connections on startup"""
    global mongodb_client, database, redis_client
    
    try:
        mongodb_client = AsyncIOMotorClient(MONGODB_URL)
        database = mongodb_client[DATABASE_NAME]
        
        # Test the connection
        await mongodb_client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes
        await database.orders.create_index("created_at")
        await database.orders.create_index("status")
        
        # Initialize Redis
        redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            decode_responses=True
        )
        await redis_client.ping()
        logger.info("Successfully connected to Redis")
        
    except Exception as e:
        logger.error(f"Failed to connect to databases: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connections on shutdown"""
    global mongodb_client, redis_client
    
    if mongodb_client:
        mongodb_client.close()
        logger.info("MongoDB connection closed")
    
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Order Management API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check for all services"""
    health_status = {
        "api": "healthy",
        "mongodb": "unknown",
        "redis": "unknown"
    }
    
    try:
        await mongodb_client.admin.command('ping')
        health_status["mongodb"] = "healthy"
    except Exception as e:
        health_status["mongodb"] = f"unhealthy: {str(e)}"
    
    try:
        await redis_client.ping()
        health_status["redis"] = "healthy"
    except Exception as e:
        health_status["redis"] = f"unhealthy: {str(e)}"
    
    return health_status


@app.post("/orders", response_model=Order, status_code=201)
async def create_order(order: OrderCreate):
    """Create a new order and add it to the processing queue"""
    try:
        now = datetime.utcnow().isoformat()
        
        order_data = {
            "item_name": order.item_name,
            "quantity": order.quantity,
            "status": "pending",
            "created_at": now,
            "updated_at": now
        }
        
        # Insert into MongoDB
        result = await database.orders.insert_one(order_data)
        order_id = str(result.inserted_id)
        
        logger.info(f"Order created: {order_id}")
        
        # Add to Redis queue for worker processing
        queue_message = {
            "order_id": order_id,
            "item_name": order.item_name,
            "quantity": order.quantity
        }
        
        await redis_client.lpush("order_queue", json.dumps(queue_message))
        logger.info(f"Order {order_id} added to queue")
        
        return Order(
            id=order_id,
            item_name=order.item_name,
            quantity=order.quantity,
            status="pending",
            created_at=now,
            updated_at=now
        )
        
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


@app.get("/orders", response_model=List[Order])
async def get_orders(status: Optional[str] = None, limit: int = 100):
    """Get all orders with optional status filter"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = database.orders.find(query).sort("created_at", -1).limit(limit)
        orders = []
        
        async for document in cursor:
            orders.append(Order(
                id=str(document["_id"]),
                item_name=document["item_name"],
                quantity=document["quantity"],
                status=document["status"],
                created_at=document["created_at"],
                updated_at=document["updated_at"]
            ))
        
        return orders
        
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")


@app.get("/orders/{order_id}", response_model=Order)
async def get_order_by_id(order_id: str):
    """Get a specific order by ID"""
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid order ID format")
        
        document = await database.orders.find_one({"_id": ObjectId(order_id)})
        
        if not document:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return Order(
            id=str(document["_id"]),
            item_name=document["item_name"],
            quantity=document["quantity"],
            status=document["status"],
            created_at=document["created_at"],
            updated_at=document["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order {order_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch order: {str(e)}")


@app.get("/stats")
async def get_order_stats():
    """Get order statistics"""
    try:
        total_orders = await database.orders.count_documents({})
        pending_orders = await database.orders.count_documents({"status": "pending"})
        processing_orders = await database.orders.count_documents({"status": "processing"})
        completed_orders = await database.orders.count_documents({"status": "completed"})
        failed_orders = await database.orders.count_documents({"status": "failed"})
        
        return {
            "total": total_orders,
            "pending": pending_orders,
            "processing": processing_orders,
            "completed": completed_orders,
            "failed": failed_orders
        }
        
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch statistics: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

