#!/usr/bin/env python3
"""
Startup script for the Ethereum Transaction Tracker backend.
"""

import uvicorn
import logging
from main import app
from config import API_HOST, API_PORT, LOG_LEVEL

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("🚀 Starting Ethereum Transaction Tracker Backend")
    logger.info(f"📡 Server will run on http://{API_HOST}:{API_PORT}")
    logger.info("📊 Mock transaction generation enabled")
    logger.info("🔍 Contract analysis service integration ready")
    
    uvicorn.run(
        app,
        host=API_HOST,
        port=API_PORT,
        reload=True,  # Enable auto-reload for development
        access_log=True
    )

