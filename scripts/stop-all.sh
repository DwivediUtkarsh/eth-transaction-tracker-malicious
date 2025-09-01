#!/bin/bash

echo "🛑 Stopping Ethereum Transaction Tracker Services..."
echo "=================================================="

# Kill processes by port
echo "Stopping services by port..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

# Kill by process name
echo "Stopping services by process name..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "python main.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Kill by PID files if they exist
if [ -f "logs/backend.pid" ]; then
    kill $(cat logs/backend.pid) 2>/dev/null || true
    rm logs/backend.pid
fi

if [ -f "logs/contract-analyzer.pid" ]; then
    kill $(cat logs/contract-analyzer.pid) 2>/dev/null || true
    rm logs/contract-analyzer.pid
fi

if [ -f "logs/frontend.pid" ]; then
    kill $(cat logs/frontend.pid) 2>/dev/null || true
    rm logs/frontend.pid
fi

sleep 2

echo "✅ All services stopped!"
echo ""
echo "📝 Logs are preserved in the logs/ directory"
echo "🚀 To restart: ./scripts/start-with-alchemy.sh"

