# 📜 Scripts and Commands Documentation

Comprehensive guide to all available scripts, commands, and automation tools for the Ethereum Transaction Tracker project.

## 🚀 Quick Start Scripts

### Complete System Startup
```bash
# Start all services in the correct order
./scripts/start-all.sh
```

### Individual Service Startup
```bash
# Start contract analyzer (Terminal 1)
./scripts/start-analyzer.sh

# Start backend (Terminal 2) 
./scripts/start-backend.sh

# Start frontend (Terminal 3)
./scripts/start-frontend.sh
```

## 📁 Frontend Scripts (package.json)

### Development Scripts
```bash
# Start development server with hot reload
npm run dev
# Runs: vite --host --port 8081

# Start development server (alternative)
npm start
# Alias for npm run dev
```

### Build Scripts
```bash
# Build for production
npm run build
# Runs: tsc && vite build

# Preview production build locally
npm run preview
# Runs: vite preview --port 8081

# Build and preview in one command
npm run build:preview
# Runs: npm run build && npm run preview
```

### Code Quality Scripts
```bash
# Run ESLint for code linting
npm run lint
# Runs: eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0

# Fix ESLint issues automatically
npm run lint:fix
# Runs: eslint . --ext ts,tsx --fix

# Format code with Prettier
npm run format
# Runs: prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"

# Check code formatting
npm run format:check
# Runs: prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}"
```

### Testing Scripts
```bash
# Run all tests
npm test
# Runs: vitest

# Run tests in watch mode
npm run test:watch
# Runs: vitest --watch

# Run tests with coverage
npm run test:coverage
# Runs: vitest --coverage

# Run tests in UI mode
npm run test:ui
# Runs: vitest --ui

# Run E2E tests
npm run test:e2e
# Runs: cypress run

# Open Cypress test runner
npm run test:e2e:open
# Runs: cypress open
```

### Type Checking
```bash
# Run TypeScript type checking
npm run type-check
# Runs: tsc --noEmit

# Watch mode for type checking
npm run type-check:watch
# Runs: tsc --noEmit --watch
```

### Dependency Management
```bash
# Install dependencies
npm install

# Update dependencies
npm update

# Audit dependencies for vulnerabilities
npm audit

# Fix dependency vulnerabilities
npm audit fix

# Clean install (removes node_modules first)
npm ci
```

## 🔧 Backend Scripts

### Development Scripts
```bash
# Start development server with auto-reload
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start with specific configuration
USE_MOCK_ANALYZER=false uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start with real Ethereum data
USE_REAL_ETHEREUM=true ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Scripts
```bash
# Start production server
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Start with Gunicorn (recommended for production)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Database Scripts
```bash
# Initialize database (creates tables)
cd backend
source venv/bin/activate
python -c "from main import engine; from models import Base; Base.metadata.create_all(bind=engine)"

# Reset database (WARNING: Deletes all data)
rm backend/transactions.db

# Backup database
cp backend/transactions.db backend/transactions_backup_$(date +%Y%m%d_%H%M%S).db

# View database contents
sqlite3 backend/transactions.db ".tables"
sqlite3 backend/transactions.db "SELECT * FROM transactions LIMIT 10;"
```

### Testing Scripts
```bash
# Run backend tests
cd backend
source venv/bin/activate
pytest

# Run tests with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_api.py

# Run tests with verbose output
pytest -v

# Run integration tests
pytest tests/integration/
```

### Utility Scripts
```bash
# Check backend health
curl http://localhost:8000/health

# Test contract analysis
curl -X POST http://localhost:8000/api/analyze-contract \
  -H "Content-Type: application/json" \
  -d '{"contract_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"}'

# Get transaction statistics
curl http://localhost:8000/api/stats

# List recent transactions
curl "http://localhost:8000/api/transactions?page=1&page_size=5"
```

## 🤖 Contract Analyzer Scripts

### Development Scripts
```bash
# Start analyzer service
cd contract-analyzer
source venv/bin/activate
python main.py

# Start with custom configuration
GEMINI_API_KEY=your_key PORT=8001 python main.py

# Start with debug logging
LOG_LEVEL=DEBUG python main.py
```

### Testing Scripts
```bash
# Test analyzer health
curl http://localhost:8001/

# Submit contract for analysis
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{"contract_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"}'

# Check analysis status
curl http://localhost:8001/status/TASK_ID

# Get analysis results
curl http://localhost:8001/results/TASK_ID

# Cleanup old results
curl -X DELETE http://localhost:8001/cleanup
```

### Maintenance Scripts
```bash
# Clean up old analysis results
curl -X DELETE http://localhost:8001/cleanup

# Monitor memory usage
ps aux | grep python | grep main.py

# Check Gemini API connectivity
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

## 🐳 Docker Scripts

### Build Scripts
```bash
# Build all services
docker-compose build

# Build specific service
docker build -t eth-tracker-backend ./backend
docker build -t eth-tracker-analyzer ./contract-analyzer
docker build -t eth-tracker-frontend .
```

### Run Scripts
```bash
# Start all services with Docker Compose
docker-compose up

# Start in detached mode
docker-compose up -d

# Start specific service
docker-compose up backend
docker-compose up analyzer
docker-compose up frontend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Maintenance Scripts
```bash
# View logs
docker-compose logs
docker-compose logs backend
docker-compose logs analyzer

# Follow logs in real-time
docker-compose logs -f

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec analyzer python -c "import main"

# Remove unused Docker resources
docker system prune
docker image prune
docker volume prune
```

## 🔄 Automation Scripts

### Setup Scripts

**setup.sh** - Complete project setup
```bash
#!/bin/bash
set -e

echo "🚀 Setting up Ethereum Transaction Tracker..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Setup backend
echo "🔧 Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup contract analyzer
echo "🤖 Setting up contract analyzer..."
cd contract-analyzer
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "✅ Setup complete!"
echo "📚 See README.md for usage instructions"
```

**start-all.sh** - Start all services
```bash
#!/bin/bash

# Function to start service in new terminal
start_service() {
    local service_name=$1
    local command=$2
    local directory=$3
    
    echo "🚀 Starting $service_name..."
    
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --tab --title="$service_name" --working-directory="$directory" -- bash -c "$command; exec bash"
    elif command -v osascript &> /dev/null; then
        osascript -e "tell application \"Terminal\" to do script \"cd $directory && $command\""
    else
        echo "⚠️  Please start $service_name manually:"
        echo "   cd $directory"
        echo "   $command"
    fi
}

# Start contract analyzer
start_service "Contract Analyzer" "source venv/bin/activate && python main.py" "$(pwd)/contract-analyzer"

# Wait for analyzer to start
sleep 3

# Start backend
start_service "Backend" "source venv/bin/activate && USE_MOCK_ANALYZER=false uvicorn main:app --host 0.0.0.0 --port 8000 --reload" "$(pwd)/backend"

# Wait for backend to start
sleep 3

# Start frontend
start_service "Frontend" "npm run dev" "$(pwd)"

echo "✅ All services started!"
echo "🌐 Frontend: http://localhost:8081"
echo "🔧 Backend: http://localhost:8000"
echo "🤖 Analyzer: http://localhost:8001"
```

**stop-all.sh** - Stop all services
```bash
#!/bin/bash

echo "🛑 Stopping all services..."

# Kill processes by port
echo "Stopping frontend (port 8081)..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

echo "Stopping backend (port 8000)..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo "Stopping analyzer (port 8001)..."
lsof -ti:8001 | xargs kill -9 2>/dev/null || true

# Kill by process name
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "python main.py" 2>/dev/null || true

echo "✅ All services stopped!"
```

### Development Scripts

**dev-setup.sh** - Development environment setup
```bash
#!/bin/bash

# Install development tools
npm install -g @typescript-eslint/eslint-plugin
npm install -g prettier
npm install -g @vitejs/plugin-react

# Setup Git hooks
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
npx husky add .husky/pre-push "npm run test"

# Create environment files
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_DEBUG=true
EOF
fi

if [ ! -f backend/.env ]; then
    cat > backend/.env << EOF
USE_MOCK_ANALYZER=false
CONTRACT_ANALYZER_URL=http://localhost:8001
USE_REAL_ETHEREUM=false
ETHEREUM_RPC_URL=https://eth.public-rpc.com
DATABASE_URL=sqlite:///./transactions.db
LOG_LEVEL=INFO
EOF
fi

if [ ! -f contract-analyzer/.env ]; then
    cat > contract-analyzer/.env << EOF
GEMINI_API_KEY=your_gemini_api_key_here
HOST=0.0.0.0
PORT=8001
LOG_LEVEL=INFO
EOF
fi

echo "✅ Development environment setup complete!"
```

**test-all.sh** - Run all tests
```bash
#!/bin/bash
set -e

echo "🧪 Running all tests..."

# Frontend tests
echo "Testing frontend..."
npm run test:coverage

# Backend tests
echo "Testing backend..."
cd backend
source venv/bin/activate
pytest --cov=. --cov-report=term-missing
cd ..

# Contract analyzer tests
echo "Testing contract analyzer..."
cd contract-analyzer
source venv/bin/activate
python -m pytest tests/ 2>/dev/null || echo "No tests found for analyzer"
cd ..

# Integration tests
echo "Running integration tests..."
npm run test:e2e

echo "✅ All tests completed!"
```

### Deployment Scripts

**build-all.sh** - Build all services for production
```bash
#!/bin/bash
set -e

echo "🏗️  Building all services for production..."

# Build frontend
echo "Building frontend..."
npm run build

# Build backend Docker image
echo "Building backend Docker image..."
cd backend
docker build -t eth-tracker-backend .
cd ..

# Build analyzer Docker image
echo "Building analyzer Docker image..."
cd contract-analyzer
docker build -t eth-tracker-analyzer .
cd ..

# Build frontend Docker image
echo "Building frontend Docker image..."
docker build -t eth-tracker-frontend .

echo "✅ All services built successfully!"
```

**deploy.sh** - Deploy to production
```bash
#!/bin/bash
set -e

# Load environment variables
source .env.production

echo "🚀 Deploying to production..."

# Build all services
./scripts/build-all.sh

# Push Docker images
docker tag eth-tracker-backend $DOCKER_REGISTRY/eth-tracker-backend:latest
docker tag eth-tracker-analyzer $DOCKER_REGISTRY/eth-tracker-analyzer:latest
docker tag eth-tracker-frontend $DOCKER_REGISTRY/eth-tracker-frontend:latest

docker push $DOCKER_REGISTRY/eth-tracker-backend:latest
docker push $DOCKER_REGISTRY/eth-tracker-analyzer:latest
docker push $DOCKER_REGISTRY/eth-tracker-frontend:latest

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deployment complete!"
echo "🌐 Application available at: $PRODUCTION_URL"
```

## 🔍 Monitoring Scripts

### Health Check Scripts

**health-check.sh** - Check all services health
```bash
#!/bin/bash

check_service() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name... "
    
    if curl -s "$url" > /dev/null; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
        return 1
    fi
}

echo "🏥 Health Check Report"
echo "====================="

check_service "Frontend" "http://localhost:8081"
check_service "Backend" "http://localhost:8000/health"
check_service "Analyzer" "http://localhost:8001"

echo ""
echo "WebSocket Test:"
echo -n "Checking WebSocket connection... "
if wscat -c ws://localhost:8000/ws --execute "ping" 2>/dev/null; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi
```

**monitor.sh** - Continuous monitoring
```bash
#!/bin/bash

monitor_service() {
    local name=$1
    local url=$2
    
    while true; do
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        
        if curl -s "$url" > /dev/null; then
            echo "[$timestamp] $name: ✅ OK"
        else
            echo "[$timestamp] $name: ❌ DOWN"
            # Send alert (email, Slack, etc.)
            # send_alert "$name is down"
        fi
        
        sleep 30
    done
}

echo "🔍 Starting continuous monitoring..."

# Monitor all services in parallel
monitor_service "Backend" "http://localhost:8000/health" &
monitor_service "Analyzer" "http://localhost:8001" &
monitor_service "Frontend" "http://localhost:8081" &

wait
```

### Performance Scripts

**performance-test.sh** - Load testing
```bash
#!/bin/bash

echo "⚡ Running performance tests..."

# Install artillery if not present
if ! command -v artillery &> /dev/null; then
    npm install -g artillery
fi

# Backend load test
echo "Testing backend API..."
artillery quick --count 100 --num 10 http://localhost:8000/health

# WebSocket load test
echo "Testing WebSocket connections..."
artillery quick --count 50 --num 5 ws://localhost:8000/ws

# Frontend load test
echo "Testing frontend..."
artillery quick --count 200 --num 20 http://localhost:8081

echo "✅ Performance tests completed!"
```

**benchmark.sh** - Benchmark analysis performance
```bash
#!/bin/bash

echo "📊 Benchmarking contract analysis..."

# Test contracts
contracts=(
    "0xdAC17F958D2ee523a2206206994597C13D831ec7"  # USDT
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"  # USDC
    "0x6b175474e89094c44da98b954eedeac495271d0f"  # DAI
)

total_time=0
successful_analyses=0

for contract in "${contracts[@]}"; do
    echo "Analyzing $contract..."
    
    start_time=$(date +%s.%N)
    
    # Submit analysis
    response=$(curl -s -X POST http://localhost:8000/api/analyze-contract \
        -H "Content-Type: application/json" \
        -d "{\"contract_address\": \"$contract\"}")
    
    task_id=$(echo $response | jq -r '.task_id')
    
    # Wait for completion
    while true; do
        status=$(curl -s http://localhost:8000/api/analysis-status/$task_id | jq -r '.status')
        
        if [ "$status" = "completed" ] || [ "$status" = "failed" ]; then
            break
        fi
        
        sleep 1
    done
    
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc)
    
    echo "  Time: ${duration}s"
    
    if [ "$status" = "completed" ]; then
        total_time=$(echo "$total_time + $duration" | bc)
        successful_analyses=$((successful_analyses + 1))
    fi
done

if [ $successful_analyses -gt 0 ]; then
    average_time=$(echo "scale=2; $total_time / $successful_analyses" | bc)
    echo "📈 Average analysis time: ${average_time}s"
else
    echo "❌ No successful analyses"
fi
```

## 🔧 Utility Scripts

### Database Management

**db-backup.sh** - Backup database
```bash
#!/bin/bash

backup_dir="backups"
timestamp=$(date +%Y%m%d_%H%M%S)
backup_file="$backup_dir/transactions_$timestamp.db"

mkdir -p $backup_dir

echo "💾 Creating database backup..."
cp backend/transactions.db $backup_file

echo "✅ Backup created: $backup_file"

# Keep only last 10 backups
ls -t $backup_dir/transactions_*.db | tail -n +11 | xargs rm -f 2>/dev/null || true
```

**db-restore.sh** - Restore database from backup
```bash
#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    echo "Available backups:"
    ls -la backups/transactions_*.db 2>/dev/null || echo "No backups found"
    exit 1
fi

backup_file=$1

if [ ! -f "$backup_file" ]; then
    echo "❌ Backup file not found: $backup_file"
    exit 1
fi

echo "🔄 Restoring database from $backup_file..."

# Stop backend service
./scripts/stop-all.sh

# Restore database
cp "$backup_file" backend/transactions.db

echo "✅ Database restored successfully!"
echo "🚀 Restart services with: ./scripts/start-all.sh"
```

### Log Management

**logs.sh** - View service logs
```bash
#!/bin/bash

case $1 in
    "backend")
        tail -f backend/logs/app.log 2>/dev/null || echo "No backend logs found"
        ;;
    "analyzer")
        tail -f contract-analyzer/logs/app.log 2>/dev/null || echo "No analyzer logs found"
        ;;
    "frontend")
        # Frontend logs are in browser console
        echo "Frontend logs are available in browser developer console"
        ;;
    "all")
        echo "=== Backend Logs ==="
        tail -n 50 backend/logs/app.log 2>/dev/null || echo "No backend logs"
        echo ""
        echo "=== Analyzer Logs ==="
        tail -n 50 contract-analyzer/logs/app.log 2>/dev/null || echo "No analyzer logs"
        ;;
    *)
        echo "Usage: $0 [backend|analyzer|frontend|all]"
        ;;
esac
```

**clean-logs.sh** - Clean old log files
```bash
#!/bin/bash

echo "🧹 Cleaning old log files..."

# Clean logs older than 7 days
find backend/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
find contract-analyzer/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true

# Rotate current logs if they're too large (>100MB)
for log_file in backend/logs/app.log contract-analyzer/logs/app.log; do
    if [ -f "$log_file" ] && [ $(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null || echo 0) -gt 104857600 ]; then
        mv "$log_file" "${log_file}.$(date +%Y%m%d_%H%M%S)"
        touch "$log_file"
        echo "Rotated large log file: $log_file"
    fi
done

echo "✅ Log cleanup completed!"
```

## 📋 Script Usage Examples

### Daily Development Workflow
```bash
# Start development environment
./scripts/start-all.sh

# Run tests before committing
./scripts/test-all.sh

# Check code quality
npm run lint && npm run type-check

# Stop services at end of day
./scripts/stop-all.sh
```

### Production Deployment
```bash
# Build and test
./scripts/build-all.sh
./scripts/test-all.sh

# Deploy to production
./scripts/deploy.sh

# Monitor deployment
./scripts/health-check.sh
```

### Troubleshooting
```bash
# Check service health
./scripts/health-check.sh

# View logs
./scripts/logs.sh all

# Restart services
./scripts/stop-all.sh
./scripts/start-all.sh

# Performance check
./scripts/performance-test.sh
```

### Maintenance
```bash
# Backup database
./scripts/db-backup.sh

# Clean logs
./scripts/clean-logs.sh

# Update dependencies
npm update
cd backend && pip install -r requirements.txt --upgrade
cd ../contract-analyzer && pip install -r requirements.txt --upgrade
```

## 🔐 Security Scripts

**security-check.sh** - Security audit
```bash
#!/bin/bash

echo "🔒 Running security audit..."

# Frontend security audit
echo "Checking frontend dependencies..."
npm audit

# Backend security check
echo "Checking backend dependencies..."
cd backend
source venv/bin/activate
pip-audit 2>/dev/null || pip install pip-audit && pip-audit
cd ..

# Check for exposed secrets
echo "Checking for exposed secrets..."
if command -v truffleHog &> /dev/null; then
    truffleHog --regex --entropy=False .
else
    echo "Install truffleHog for secret scanning: pip install truffleHog"
fi

# Check file permissions
echo "Checking file permissions..."
find . -name "*.env*" -exec ls -la {} \;
find . -name "*.key" -exec ls -la {} \;

echo "✅ Security audit completed!"
```

This comprehensive scripts documentation covers all the automation, development, testing, deployment, and maintenance scripts for the Ethereum Transaction Tracker project. Each script is designed to simplify common tasks and ensure consistent operations across different environments.

