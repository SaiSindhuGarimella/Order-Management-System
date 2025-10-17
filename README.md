# Order Management System

A full-stack asynchronous order processing platform with a React dashboard, FastAPI backend, Redis queue, MongoDB database, and automated worker service.

##  Features

- **Modern React UI** - Clean, responsive dashboard built with Material-UI
- **RESTful API** - FastAPI backend with automatic OpenAPI documentation
- **Asynchronous Processing** - Redis-based queue system for order fulfillment
- **Real-time Updates** - Live order status tracking on the dashboard
- **Containerized** - Full Docker and Docker Compose support
- **CI/CD Ready** - GitHub Actions pipeline for automated testing and deployment
- **Cloud-Ready** - MongoDB Atlas integration for cloud database



**Flow:**
1. User creates order via React UI
2. Backend API saves order to MongoDB and pushes to Redis queue
3. Worker service consumes from queue, processes order (5s delay simulation)
4. Worker updates order status in MongoDB
5. Frontend displays real-time status updates

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Material-UI v5** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Redis** - Message queue
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Worker
- **Python 3.11** - Worker runtime
- **Motor** - Database operations
- **Redis** - Queue consumption

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline
- **Nginx** - Frontend web server

### Database
- **MongoDB Atlas** - Cloud NoSQL database
- **Redis** - In-memory data store

## 📦 Prerequisites

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Node.js** (v18+) - for local development
- **Python** (v3.11+) - for local development
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- **Git**

##  Quick Start

### 1. Clone the Repository


git clone https://github.com/yourusername/order-management-system.git
cd order-management-system


### 2. Set Up MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Whitelist your IP address (or use 0.0.0.0/0 for testing)
4. Get your connection string (looks like: `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/`)

### 3. Configure Environment Variables

Create a `.env` file in the root directory:


# MongoDB Configuration
MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=order_management

# Redis Configuration (Docker service name)
REDIS_HOST=redis
REDIS_PORT=6379

# Worker Configuration
PROCESSING_DELAY=5

# Frontend API URL
VITE_API_URL=http://localhost:8000


### 4. Run with Docker Compose


# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build


### 5. Access the Application

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

### 6. Create Your First Order

1. Navigate to http://localhost:3000
2. Click "Create Order" in the sidebar
3. Enter item name and quantity
4. Submit the form
5. Watch the order progress through statuses: `pending` → `processing` → `completed`

##  Configuration
Edit `.env`:

env

MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=order_management
REDIS_HOST=redis
REDIS_PORT=6379
PROCESSING_DELAY=5
VITE_API_URL=http://localhost:8000


## 📚 API Documentation

### API Endpoints

- `GET /` - API info
- `GET /health` - Health check all services
- `POST /orders` - Create new order
- `GET /orders` - List all orders (with filters)
- `GET /orders/{id}` - Get specific order
- `GET /stats` - Order statistics

### UI Pages

- **Dashboard**: Real-time statistics overview
- **Create Order**: Simple, validated form
- **Orders List**: Live status tracking with filters
