import os
from dotenv import load_dotenv

load_dotenv()

# API Settings
API_HOST = "0.0.0.0"
API_PORT = 8000

# External Services
CONTRACT_ANALYZER_URL = os.getenv("CONTRACT_ANALYZER_URL", "http://localhost:8001")
USE_MOCK_ANALYZER = os.getenv("USE_MOCK_ANALYZER", "false").lower() == "true"

# Database
DATABASE_URL = "sqlite:///./transactions.db"

# Real Ethereum Settings
USE_REAL_ETHEREUM = os.getenv("USE_REAL_ETHEREUM", "false").lower() == "true"
ETHEREUM_RPC_URL = os.getenv("ETHEREUM_RPC_URL", "https://eth.public-rpc.com")
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY", "")

# Mock Data Settings (fallback)
MOCK_TRANSACTION_INTERVAL = 5  # seconds
DISABLE_MOCK_TRANSACTIONS = os.getenv("DISABLE_MOCK_TRANSACTIONS", "false").lower() == "true"
MOCK_ADDRESSES = [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
    "0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed",
    "0x8ba1f109551bD432803012645Hac136c22C177ec",
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "0x1234567890123456789012345678901234567890",  # Known malicious for testing
    "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",  # Known malicious for testing
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",  # USDC
    "0xdac17f958d2ee523a2206206994597c13d831ec7",  # USDT
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",  # Uniswap V2
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",  # UNI Token
    "0x6b175474e89094c44da98b954eedeac495271d0f",  # DAI
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",  # WBTC
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",  # WETH
    "0x514910771af9ca656af840dff83e8264ecf986ca",  # LINK
    "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",  # SHIB
]

# Cache Settings
CACHE_TTL = 300  # 5 minutes

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# CORS Settings
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
]
