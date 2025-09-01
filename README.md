# 🔍 Ethereum Transaction Tracker with Smart Contract Security Analysis

A comprehensive real-time Ethereum transaction monitoring system with AI-powered smart contract security analysis using Google's Gemini AI.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Contract        │
│   (React)       │◄──►│   (FastAPI)     │◄──►│ Analyzer        │
│   Port: 8081    │    │   Port: 8000    │    │ (Gemini AI)     │
│                 │    │                 │    │ Port: 8001      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │              ┌─────────────────┐              │
        │              │   Database      │              │
        └──────────────►│   (SQLite)     │◄─────────────┘
                       │                 │
                       └─────────────────┘
                               │
                    ┌─────────────────┐
                    │   Ethereum      │
                    │   Network       │
                    │   (Web3 RPC)    │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd eth-transaction-tracker-malicious
```

### 2. Start All Services

**Terminal 1 - Contract Analyzer:**
```bash
cd contract-analyzer
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Backend:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
USE_MOCK_ANALYZER=false uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 3 - Frontend:**
```bash
npm install
npm run dev
```

### 3. Access the Application
- **Frontend UI**: http://localhost:8081
- **Backend API**: http://localhost:8000
- **Contract Analyzer**: http://localhost:8001
- **API Documentation**: http://localhost:8000/docs

## 📊 Features

### 🔄 Real-Time Transaction Monitoring
- Live Ethereum transaction stream
- WebSocket-based real-time updates
- Support for both mock and real Ethereum data
- Automatic contract detection

### 🤖 AI-Powered Security Analysis
- Google Gemini AI integration
- Smart contract vulnerability detection
- Detailed security explanations
- Risk scoring and categorization

### 🎨 Modern Web Interface
- React 18 with TypeScript
- Real-time dashboard with live stats
- Interactive transaction explorer
- Responsive design with dark theme

### 🔒 Security Features
- Malicious contract detection
- Real-time security alerts
- Visual risk indicators
- Comprehensive analysis reports

## 🛠️ Configuration

### Environment Variables

**Backend (.env or environment):**
```bash
# Ethereum Network
USE_REAL_ETHEREUM=false
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Analyzer
USE_MOCK_ANALYZER=false
CONTRACT_ANALYZER_URL=http://localhost:8001

# Database
DATABASE_URL=sqlite:///./transactions.db

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
```

**Contract Analyzer:**
```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Server
HOST=0.0.0.0
PORT=8001
```

## 📁 Project Structure

```
eth-transaction-tracker-malicious/
├── README.md                          # Main documentation
├── package.json                       # Frontend dependencies
├── 
├── frontend/                          # React frontend
│   ├── src/
│   │   ├── components/               # UI components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities and API clients
│   │   └── types/                    # TypeScript definitions
│   └── public/                       # Static assets
│
├── backend/                          # FastAPI backend
│   ├── main.py                       # Main application
│   ├── models.py                     # Database models
│   ├── schemas.py                    # API schemas
│   ├── config.py                     # Configuration
│   ├── websocket_manager.py          # WebSocket handling
│   ├── services/                     # Business logic
│   │   ├── ethereum.py               # Mock Ethereum service
│   │   ├── ethereum_real.py          # Real Ethereum integration
│   │   ├── contract_analyzer.py      # Analyzer client
│   │   └── cache.py                  # Caching utilities
│   └── requirements.txt              # Python dependencies
│
└── contract-analyzer/                # AI Analysis service
    ├── main.py                       # FastAPI analyzer service
    ├── config.py                     # Configuration
    └── requirements.txt              # Dependencies
```

## 🔧 Development

### Running in Development Mode

**With Mock Data (Default):**
```bash
# Backend with mock transactions
cd backend && source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**With Real Ethereum Data:**
```bash
# Backend with real Ethereum
cd backend && source venv/bin/activate
USE_REAL_ETHEREUM=true ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Testing the API

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Analyze a Contract:**
```bash
curl -X POST http://localhost:8000/api/analyze-contract \
  -H "Content-Type: application/json" \
  -d '{"contract_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"}'
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration:**
   - Set production environment variables
   - Configure real Ethereum RPC endpoints
   - Set up proper database (PostgreSQL recommended)

2. **Security:**
   - Enable HTTPS
   - Set up proper CORS policies
   - Implement rate limiting
   - Secure API keys

3. **Scaling:**
   - Use Redis for caching
   - Implement load balancing
   - Set up monitoring and logging

## 📚 API Documentation

Visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

- `GET /health` - Service health check
- `GET /api/transactions` - List transactions
- `POST /api/analyze-contract` - Submit contract for analysis
- `GET /api/analysis-status/{task_id}` - Check analysis status
- `WebSocket /ws` - Real-time updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation in each service directory
2. Review the API documentation at `/docs`
3. Check the logs for error messages
4. Open an issue on GitHub

---

## 📖 Service Documentation

- [Backend Documentation](backend/README.md)
- [Contract Analyzer Documentation](contract-analyzer/README.md)
- [Frontend Documentation](src/README.md)