import os
import json
import time
import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as redis
from datetime import datetime
from bson import ObjectId

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "order_management")

# Redis connection
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# Worker configuration
PROCESSING_DELAY = int(os.getenv("PROCESSING_DELAY", 5))  # seconds


class OrderWorker:
    """Worker service to process orders from the queue"""
    
    def __init__(self):
        self.mongodb_client = None
        self.database = None
        self.redis_client = None
        self.running = False
    
    async def connect(self):
        """Establish connections to MongoDB and Redis"""
        try:
            # Connect to MongoDB
            self.mongodb_client = AsyncIOMotorClient(MONGODB_URL)
            self.database = self.mongodb_client[DATABASE_NAME]
            
            # Test MongoDB connection
            await self.mongodb_client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
            
            # Connect to Redis
            self.redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                decode_responses=True
            )
            await self.redis_client.ping()
            logger.info("Successfully connected to Redis")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to databases: {e}")
            return False
    
    async def disconnect(self):
        """Close all database connections"""
        if self.mongodb_client:
            self.mongodb_client.close()
            logger.info("MongoDB connection closed")
        
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Redis connection closed")
    
    async def update_order_status(self, order_id: str, status: str):
        """Update order status in MongoDB"""
        try:
            now = datetime.utcnow().isoformat()
            
            result = await self.database.orders.update_one(
                {"_id": ObjectId(order_id)},
                {
                    "$set": {
                        "status": status,
                        "updated_at": now
                    }
                }
            )
            
            if result.modified_count > 0:
                logger.info(f"Order {order_id} status updated to {status}")
                return True
            else:
                logger.warning(f"Order {order_id} not found for status update")
                return False
                
        except Exception as e:
            logger.error(f"Error updating order {order_id}: {e}")
            return False
    
    async def process_order(self, order_data: dict):
        """
        Process a single order
        Simulates order fulfillment with a delay
        """
        order_id = order_data.get("order_id")
        item_name = order_data.get("item_name")
        quantity = order_data.get("quantity")
        
        logger.info(f"Processing order {order_id}: {quantity}x {item_name}")
        
        try:
            # Update status to processing
            await self.update_order_status(order_id, "processing")
            
            # Simulate order processing (e.g., inventory check, payment, shipping)
            logger.info(f"Fulfilling order {order_id}... (this takes {PROCESSING_DELAY} seconds)")
            await asyncio.sleep(PROCESSING_DELAY)
            
            # Randomly simulate success/failure for demonstration
            import random
            success_rate = 0.9  # 90% success rate
            
            if random.random() < success_rate:
                # Order fulfilled successfully
                await self.update_order_status(order_id, "completed")
                logger.info(f"Order {order_id} completed successfully")
            else:
                # Order failed (e.g., out of stock)
                await self.update_order_status(order_id, "failed")
                logger.warning(f"Order {order_id} failed during processing")
            
        except Exception as e:
            logger.error(f"Error processing order {order_id}: {e}")
            await self.update_order_status(order_id, "failed")
    
    async def start(self):
        """Start the worker to consume from the queue"""
        self.running = True
        logger.info("Worker started, waiting for orders...")
        
        while self.running:
            try:
                # Block and wait for an order from the queue
                result = await self.redis_client.brpop("order_queue", timeout=5)
                
                if result:
                    queue_name, message = result
                    logger.info(f"Received order from queue: {message}")
                    
                    try:
                        order_data = json.loads(message)
                        await self.process_order(order_data)
                    except json.JSONDecodeError as e:
                        logger.error(f"Invalid JSON in queue message: {e}")
                    except Exception as e:
                        logger.error(f"Error processing queue message: {e}")
                else:
                    logger.debug("No orders in queue, waiting...")
                    
            except Exception as e:
                logger.error(f"Error in worker loop: {e}")
                await asyncio.sleep(5) 
    
    async def stop(self):
        """Stop the worker gracefully"""
        logger.info("Stopping worker...")
        self.running = False


async def main():
    """Main entry point for the worker"""
    worker = OrderWorker()
    
    # Connect to databases
    connected = await worker.connect()
    
    if not connected:
        logger.error("Failed to connect to databases. Retrying in 5 seconds...")
        await asyncio.sleep(5)
        return await main()  
    
    try:
        # Start processing orders
        await worker.start()
    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
    finally:
        await worker.stop()
        await worker.disconnect()


if __name__ == "__main__":
    # Run the worker
    asyncio.run(main())

