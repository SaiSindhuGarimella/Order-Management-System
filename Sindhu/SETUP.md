# Setup Guide


## Prerequisites Checklist

-  Docker Desktop installed and running
-  MongoDB Atlas account created
-  Git installed
- Text editor (VS Code recommended)

## Step-by-Step Setup

### Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for a free account
   - Verify your email

2. **Create a Cluster**
   - Click "Build a Database"
   - Select "FREE" tier (M0)
   - Choose your preferred cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Grant "Read and write to any database" privileges
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For testing: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP address
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://...`)
   - Replace `<password>` with your actual password
   - Save this connection string for later

### Step 2: Clone and Configure

1. **Clone Repository**
   
   git clone <your-repo-url>
   cd order-management-system
   

2. **Create Environment File**
   
   cp .env.example .env
   

3. **Edit .env File**
   
   # Open in your text editor
   nano .env  # or use VS Code: code .env
   

   Replace the values:
   env
 d
   

   **Important**: Make sure there are no spaces around the `=` sign!

### Step 3: Start the Application

1. **Start Docker Desktop**
   - Make sure Docker Desktop is running
   - You should see the Docker icon in your system tray

2. **Build and Start Services**
   
   docker-compose up --build
   

   This will:
   - Build the backend, frontend, and worker containers
   - Download the Redis image
   - Start all services
   - Show logs in your terminal

3. **Wait for Services to Start**
   - Watch the logs until you see:
     
     order-backend   | INFO: Application startup complete
     order-frontend  | /docker-entrypoint.sh: Configuration complete
     order-worker    | INFO: Successfully connected to MongoDB
     

### Step 4: Verify Installation

1. **Check All Services are Running**
   
   docker-compose ps
   

   You should see:
   - order-backend (port 8000)
   - order-frontend (port 80)
   - order-worker
   - order-redis (port 6379)

2. **Test Backend API**
   
   curl http://localhost:8000/health
   

   Expected response:
   json
   {
     "api": "healthy",
     "mongodb": "healthy",
     "redis": "healthy"
   }
   

3. **Open Frontend**
   - Go to http://localhost:3000 in your browser
   - You should see the Order Management dashboard

### Step 5: Create Your First Order

1. **Navigate to Create Order**
   - Click "Create Order" in the sidebar

2. **Fill the Form**
   - Item Name: `Test Laptop`
   - Quantity: `5`
   - Click "Create Order"

3. **View Orders List**
   - Click "Orders List" in the sidebar
   - You should see your order with status "pending"
   - Wait 5 seconds and it will change to "processing"
   - After another few seconds, it becomes "completed"

## Useful Commands

### View Logs

# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f frontend


### Restart Services

# All services
docker-compose restart

# Specific service
docker-compose restart backend


### Stop Services

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v


### Rebuild After Code Changes

# Rebuild all
docker-compose up --build

# Rebuild specific service
docker-compose up --build backend


### Access Service Shell

# Backend shell
docker-compose exec backend sh

# Frontend shell  
docker-compose exec frontend sh
