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

### Architecture 
<img width="283" height="810" alt="image" src="https://github.com/user-attachments/assets/a0dc2410-058d-41b9-8bc6-83f3fff014bb" />

### UI Screenshots 

- **Test Case 1- Create Order**
- Steps:
1.	Click “Create Order”
2.	Enter item name and quantity
3.	Click Submit
Expected Result:
Order appears in Orders List with Status = Processing
Screenshot: Before Submit — form filled out
<img width="1030" height="484" alt="image" src="https://github.com/user-attachments/assets/16ec0792-63e2-4be7-b19b-48e22d0cb9ee" />
After Submit — order visible in Orders List with processing status
<img width="940" height="326" alt="image" src="https://github.com/user-attachments/assets/3f603fc5-6a61-4f36-a3dd-3c8c3baeb913" />

- **Test Case 2 - Auto Refresh & Status Update** 
-Steps:
1.	Wait ~3 seconds after order creation
Expected Result: Status changes from Processing → Completed automatically
<img width="940" height="458" alt="image" src="https://github.com/user-attachments/assets/afb237f2-3810-4d6b-a396-9f478382847c" />

- **Test Case 3 - Filter by Status** 
- Steps: 
1.Click “Filter by Status” → select “Completed”
 Expected Result: Only Completed orders shown
<img width="263" height="231" alt="image" src="https://github.com/user-attachments/assets/f4c5b556-7f8a-4b65-b76f-654f33e2b794" />
<img width="1006" height="273" alt="image" src="https://github.com/user-attachments/assets/820f1063-5fdf-4a36-8869-d5b5a0a7f5e5" />

- **Test Case 4: Failed Order Example**
- Steps: 
1.	Create a test order that triggers failure 
Expected Result: Status = FAILED (red badge)
Screenshot: Orders List with one red badge labelled “FAILED”.
<img width="993" height="283" alt="image" src="https://github.com/user-attachments/assets/c21e0ced-ad70-49c5-bb6f-04cdd7cf6ad2" />






  

 



