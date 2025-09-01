#!/bin/bash

echo "🚀 Starting Ethereum Transaction Tracker with Alchemy (Real Data)"
echo "================================================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to start service in background
start_service() {
    local service_name=$1
    local directory=$2
    local command=$3
    
    echo "🔄 Starting $service_name..."
    cd "$directory"
    
    # Start the service in background
    nohup bash -c "$command" > "../logs/${service_name,,}.log" 2>&1 &
    local pid=$!
    
    echo "   ✅ $service_name started (PID: $pid)"
    echo "$pid" > "../logs/${service_name,,}.pid"
    
    cd - > /dev/null
}

# Create logs directory
mkdir -p logs

# Kill any existing services
echo "🛑 Stopping any existing services..."
pkill -f "uvicorn.*8000" 2>/dev/null || true
pkill -f "uvicorn.*8001" 2>/dev/null || true  
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python3 is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Node.js/npm is required but not installed"
    exit 1
fi

# Check if virtual environments exist
if [ ! -d "backend/venv" ]; then
    echo "⚠️  Backend virtual environment not found. Creating..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

if [ ! -d "contract-analyzer/venv" ]; then
    echo "⚠️  Contract analyzer virtual environment not found. Creating..."
    cd contract-analyzer
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  Frontend dependencies not found. Installing..."
    npm install
fi

echo ""
echo "🌐 Configuration:"
echo "   • Ethereum Network: Alchemy Mainnet"
echo "   • RPC URL: https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY"
echo "   • Real Ethereum Data: ENABLED"
echo "   • Mock Analyzer: DISABLED (Using Gemini AI)"
echo ""

# Start Contract Analyzer (Port 8001)
start_service "Contract-Analyzer" "contract-analyzer" "source venv/bin/activate && python main.py"

# Wait for analyzer to start
echo "⏳ Waiting for Contract Analyzer to initialize..."
sleep 5

# Test analyzer connection
if curl -s http://localhost:8001/ > /dev/null; then
    echo "   ✅ Contract Analyzer is responding"
else
    echo "   ⚠️  Contract Analyzer may still be starting..."
fi

# Start Backend (Port 8000) with environment variables loaded
start_service "Backend" "backend" "source venv/bin/activate && python -c 'from dotenv import load_dotenv; load_dotenv()' && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

# Wait for backend to start
echo "⏳ Waiting for Backend to initialize..."
sleep 8

# Test backend connection
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ Backend is responding"
else
    echo "   ⚠️  Backend may still be starting..."
fi

# Start Frontend (Port 8081)
start_service "Frontend" "." "npm run dev"

# Wait for frontend to start
echo "⏳ Waiting for Frontend to initialize..."
sleep 5

echo ""
echo "🎉 All services started successfully!"
echo "================================================================"
echo ""
echo "📊 Service URLs:"
echo "   🎨 Frontend:          http://localhost:8081"
echo "   🔧 Backend API:       http://localhost:8000"
echo "   📚 API Docs:          http://localhost:8000/docs"
echo "   🤖 Contract Analyzer: http://localhost:8001"
echo ""
echo "🔄 Real-time Features:"
echo "   • Live Ethereum transactions from Alchemy"
echo "   • Real contract detection and analysis"
echo "   • AI-powered security analysis with Gemini"
echo "   • WebSocket updates for real-time UI"
echo ""
echo "📝 Logs:"
echo "   • Backend:    tail -f logs/backend.log"
echo "   • Analyzer:   tail -f logs/contract-analyzer.log"
echo "   • Frontend:   tail -f logs/frontend.log"
echo ""
echo "🛑 To stop all services: ./scripts/stop-all.sh"
echo ""
echo "🚀 Ready! Visit http://localhost:8081 to start exploring!"

