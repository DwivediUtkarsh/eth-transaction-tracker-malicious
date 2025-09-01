# 🔧 Backend Service Documentation

FastAPI-based backend service for Ethereum transaction tracking and smart contract security analysis integration.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Contract        │
│   WebSocket     │◄──►│   FastAPI       │◄──►│ Analyzer        │
│   HTTP API      │    │   SQLAlchemy    │    │ (External)      │
└─────────────────┘    │   WebSocket     │    └─────────────────┘
                       │   Background    │
                       │   Tasks         │
                       └─────────────────┘
                               │
                    ┌─────────────────┐
                    │   Database      │
                    │   (SQLite)      │
                    └─────────────────┘
                               │
                    ┌─────────────────┐
                    │   Ethereum      │
                    │   Network       │
                    └─────────────────┘
```

## 🚀 Quick Start

### Installation
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Running the Service

**Development Mode:**
```bash
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Production Mode:**
```bash
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**With Real Ethereum:**
```bash
USE_REAL_ETHEREUM=true ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 📊 Features

### 🔄 Transaction Management
- **Real-time Transaction Processing**: Handles both mock and real Ethereum transactions
- **Database Storage**: SQLAlchemy ORM with SQLite (production: PostgreSQL)
- **WebSocket Broadcasting**: Real-time updates to connected clients
- **Pagination & Filtering**: Efficient transaction querying

### 🤖 Contract Analysis Integration
- **External Analyzer Client**: Integrates with contract analyzer service
- **Async Processing**: Background task management for long-running analyses
- **Result Caching**: 24-hour cache for analysis results
- **Fallback Logic**: Graceful degradation to mock analyzer

### 🌐 Real-time Communication
- **WebSocket Manager**: Handles multiple client connections
- **Event Broadcasting**: Transaction updates, analysis completion, security alerts
- **Connection Management**: Auto-reconnection and error handling

### 📈 Dashboard Statistics
- **Live Metrics**: Transaction counts, analysis stats, security metrics
- **Caching**: Optimized performance with TTL-based caching
- **Real-time Updates**: WebSocket-based stat broadcasting

## 🛠️ Configuration

### Environment Variables

```bash
# API Settings
API_HOST=0.0.0.0
API_PORT=8000

# External Services
CONTRACT_ANALYZER_URL=http://localhost:8001
USE_MOCK_ANALYZER=false

# Database
DATABASE_URL=sqlite:///./transactions.db

# Ethereum Network
USE_REAL_ETHEREUM=false
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key

# CORS Settings
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:8081"]

# Caching
CACHE_TTL=300

# Logging
LOG_LEVEL=INFO
```

### Configuration Files

**config.py** - Central configuration management
```python
# Load environment variables
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
USE_REAL_ETHEREUM = os.getenv("USE_REAL_ETHEREUM", "false").lower() == "true"
```

## 📁 File Structure

```
backend/
├── main.py                    # FastAPI application entry point
├── config.py                  # Configuration management
├── models.py                  # SQLAlchemy database models
├── schemas.py                 # Pydantic request/response schemas
├── websocket_manager.py       # WebSocket connection management
├── requirements.txt           # Python dependencies
├── 
├── services/                  # Business logic services
│   ├── __init__.py
│   ├── ethereum.py            # Mock Ethereum transaction service
│   ├── ethereum_real.py       # Real Ethereum network integration
│   ├── contract_analyzer.py   # Contract analyzer client
│   └── cache.py              # Caching utilities
│
└── venv/                     # Virtual environment
```

## 🔌 API Endpoints

### Health & Status
```http
GET /health
```
Returns service health status and connected services.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-01T16:30:17.293765",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "websocket": "0 connections",
    "analyzer": "available"
  }
}
```

### Transaction Management

#### List Transactions
```http
GET /api/transactions?page=1&page_size=20&min_value=100&max_value=10000
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 20, max: 100)
- `min_value` (float): Minimum transaction value
- `max_value` (float): Maximum transaction value

**Response:**
```json
{
  "transactions": [
    {
      "hash": "0x...",
      "from_address": "0x...",
      "to_address": "0x...",
      "value": 1000.50,
      "value_usd": 1000.50,
      "eth_value": 0.476190,
      "block_number": 18500123,
      "timestamp": "2025-09-01T16:30:17.293765",
      "is_contract": true,
      "gas_used": 21000,
      "gas_price": 20.5,
      "analysis_status": "completed",
      "verdict": "BENIGN",
      "security_score": 85
    }
  ],
  "total": 1247,
  "page": 1,
  "page_size": 20,
  "has_next": true
}
```

#### Get Single Transaction
```http
GET /api/transaction/{tx_hash}
```

### Contract Analysis

#### Submit Contract for Analysis
```http
POST /api/analyze-contract
Content-Type: application/json

{
  "contract_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "transaction_hash": "0x..." // optional
}
```

**Response:**
```json
{
  "task_id": "uuid-string",
  "status": "submitted",
  "message": "Analysis started"
}
```

#### Check Analysis Status
```http
GET /api/analysis-status/{task_id}
```

**Response:**
```json
{
  "task_id": "uuid-string",
  "status": "completed",
  "verdict": "MALICIOUS",
  "explanation": "Contract contains wallet draining functionality...",
  "security_score": 15,
  "attack_vectors": ["Token Draining", "Approval Abuse"],
  "analyzed_at": "2025-09-01T16:30:17.293765"
}
```

#### Get Analysis Results
```http
GET /api/analysis-result/{task_id}
```

### Dashboard Statistics
```http
GET /api/stats
```

**Response:**
```json
{
  "total_transactions": 24789,
  "today_transactions": 1247,
  "malicious_contracts": 3,
  "contracts_analyzed_today": 156,
  "is_live": true
}
```

### WebSocket Connection
```
WebSocket: ws://localhost:8000/ws
```

**Message Types:**
- `connected`: Connection established
- `new_transaction`: New transaction broadcast
- `analysis_started`: Analysis initiated
- `analysis_complete`: Analysis finished
- `alert`: Security alert for malicious contracts
- `stats_update`: Dashboard statistics update

## 🗄️ Database Models

### Transaction Model
```python
class Transaction(Base):
    __tablename__ = "transactions"
    
    hash = Column(String(66), primary_key=True, index=True)
    from_address = Column(String(42), nullable=False, index=True)
    to_address = Column(String(42), nullable=False, index=True)
    value = Column(Float, nullable=False)  # USDT value
    eth_value = Column(Float, nullable=False)  # ETH value
    block_number = Column(Integer, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    is_contract = Column(Boolean, nullable=False, default=False)
    gas_used = Column(Integer, nullable=False)
    gas_price = Column(Float, nullable=False)  # in Gwei
```

### Contract Analysis Model
```python
class ContractAnalysis(Base):
    __tablename__ = "contract_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    contract_address = Column(String(42), nullable=False, index=True)
    task_id = Column(String(100), nullable=False, unique=True, index=True)
    status = Column(String(20), nullable=False, default="pending")
    verdict = Column(String(20), nullable=True)  # MALICIOUS/SUSPICIOUS/BENIGN
    explanation = Column(Text, nullable=True)
    security_score = Column(Integer, nullable=True)  # 0-100
    attack_vectors = Column(Text, nullable=True)  # JSON string
    analyzed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    transaction_hash = Column(String(66), ForeignKey("transactions.hash"), nullable=True)
```

## 🔄 Services

### Ethereum Service (Mock)
**File:** `services/ethereum.py`

**Features:**
- Mock transaction generation
- Realistic USDT/ETH values
- Known contract addresses
- Exchange wallet simulation

**Key Methods:**
```python
def generate_mock_transaction() -> Dict
def is_contract_address(address: str) -> bool
def get_contract_name(address: str) -> Optional[str]
```

### Real Ethereum Service
**File:** `services/ethereum_real.py`

**Features:**
- Web3.py integration
- Real-time block monitoring
- ERC-20 token detection
- Contract bytecode analysis

**Key Methods:**
```python
async def get_latest_block_number() -> int
async def get_block_transactions(block_number: int) -> List[Dict]
async def is_contract_address(address: str) -> bool
async def start_real_time_monitoring(callback_func)
```

### Contract Analyzer Client
**File:** `services/contract_analyzer.py`

**Features:**
- HTTP client for analyzer service
- Async analysis submission
- Result polling with exponential backoff
- Fallback to mock analyzer

**Key Methods:**
```python
async def analyze_contract(contract_address: str) -> Dict
async def get_analysis_status(task_id: str) -> Dict
async def get_analysis_result(task_id: str) -> Dict
```

### Caching Service
**File:** `services/cache.py`

**Features:**
- In-memory TTL cache
- Multiple cache instances
- Automatic cleanup
- Statistics tracking

**Cache Types:**
- `transaction_cache`: 5-minute TTL
- `analysis_cache`: 24-hour TTL  
- `stats_cache`: 1-minute TTL

## 🌐 WebSocket Manager

**File:** `websocket_manager.py`

**Features:**
- Multiple client connection management
- Message broadcasting
- Connection health monitoring
- Automatic cleanup of dead connections

**Key Methods:**
```python
async def connect(websocket: WebSocket)
async def broadcast(message: Dict[str, Any])
async def broadcast_transaction(transaction: Dict)
async def broadcast_analysis_complete(analysis: Dict)
async def broadcast_alert(analysis: Dict)
```

## 🔧 Background Tasks

### Transaction Processing
- **Mock Mode**: Generates transactions every 5 seconds
- **Real Mode**: Monitors Ethereum blocks every 12 seconds
- **Processing**: Saves to database and broadcasts via WebSocket

### Analysis Polling
- Polls contract analyzer for results every 5 seconds
- Updates database when analysis completes
- Broadcasts completion via WebSocket
- Handles timeouts and failures

## 🚀 Deployment

### Development
```bash
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Production
```bash
# Using Gunicorn with Uvicorn workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or with Docker
docker build -t eth-tracker-backend .
docker run -p 8000:8000 -e DATABASE_URL=postgresql://... eth-tracker-backend
```

### Environment Setup
```bash
# Production environment variables
export USE_REAL_ETHEREUM=true
export ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
export DATABASE_URL=postgresql://user:pass@localhost/dbname
export USE_MOCK_ANALYZER=false
export CONTRACT_ANALYZER_URL=http://analyzer-service:8001
```

## 🔍 Monitoring & Logging

### Health Checks
- `/health` endpoint for service monitoring
- Database connection status
- External service availability
- WebSocket connection count

### Logging
- Structured logging with timestamps
- Different log levels (DEBUG, INFO, WARNING, ERROR)
- Request/response logging
- Error tracking and alerting

### Metrics
- Transaction processing rate
- Analysis completion time
- WebSocket connection metrics
- Database query performance

## 🛠️ Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check database file permissions
ls -la transactions.db

# Reset database
rm transactions.db
# Restart service to recreate tables
```

**WebSocket Connection Issues:**
```bash
# Check if port is available
netstat -tulpn | grep :8000

# Test WebSocket connection
wscat -c ws://localhost:8000/ws
```

**External Service Connectivity:**
```bash
# Test contract analyzer
curl http://localhost:8001/

# Test Ethereum RPC
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://mainnet.infura.io/v3/YOUR_KEY
```

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=DEBUG uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 📚 Dependencies

### Core Dependencies
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **SQLAlchemy**: ORM
- **Pydantic**: Data validation
- **WebSockets**: Real-time communication
- **HTTPX**: HTTP client
- **Web3.py**: Ethereum integration

### Development Dependencies
- **pytest**: Testing framework
- **black**: Code formatting
- **flake8**: Linting
- **mypy**: Type checking

## 🔒 Security Considerations

### Input Validation
- All API inputs validated with Pydantic schemas
- Ethereum address format validation
- SQL injection prevention with ORM

### Rate Limiting
- Implement rate limiting for analysis endpoints
- WebSocket connection limits
- API key authentication for production

### CORS Configuration
- Configured allowed origins
- Secure headers
- HTTPS enforcement in production

## 🧪 Testing

### Unit Tests
```bash
# Run tests
pytest tests/

# With coverage
pytest --cov=. tests/
```

### Integration Tests
```bash
# Test with real services
pytest tests/integration/
```

### Load Testing
```bash
# Using locust
locust -f tests/load_test.py --host=http://localhost:8000
```

