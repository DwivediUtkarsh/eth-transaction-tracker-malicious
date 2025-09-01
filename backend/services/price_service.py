"""
Real-time cryptocurrency price service using CoinGecko API.
"""
import asyncio
import logging
import httpx
from datetime import datetime, timedelta
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class PriceService:
    def __init__(self):
        self.base_url = "https://api.coingecko.com/api/v3"
        self.cache = {}
        self.cache_duration = timedelta(minutes=1)  # Cache prices for 1 minute
        
    async def get_eth_price_usd(self) -> float:
        """Get current ETH price in USD."""
        return await self._get_price("ethereum")
    
    async def get_token_price_usd(self, token_symbol: str) -> float:
        """Get current token price in USD."""
        token_map = {
            "usdt": "tether",
            "usdc": "usd-coin", 
            "dai": "dai",
            "eth": "ethereum"
        }
        
        coin_id = token_map.get(token_symbol.lower())
        if not coin_id:
            logger.warning(f"Unknown token symbol: {token_symbol}")
            return 1.0  # Default to $1 for unknown tokens
            
        return await self._get_price(coin_id)
    
    async def _get_price(self, coin_id: str) -> float:
        """Get price for a specific coin ID with caching."""
        now = datetime.utcnow()
        
        # Check cache first
        if coin_id in self.cache:
            cached_data = self.cache[coin_id]
            if now - cached_data["timestamp"] < self.cache_duration:
                return cached_data["price"]
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/simple/price",
                    params={
                        "ids": coin_id,
                        "vs_currencies": "usd"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    price = data.get(coin_id, {}).get("usd", 0.0)
                    
                    # Cache the result
                    self.cache[coin_id] = {
                        "price": price,
                        "timestamp": now
                    }
                    
                    logger.debug(f"Fetched {coin_id} price: ${price}")
                    return price
                else:
                    logger.error(f"CoinGecko API error: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Error fetching price for {coin_id}: {e}")
        
        # Fallback prices if API fails
        fallback_prices = {
            "ethereum": 2400.0,
            "tether": 1.0,
            "usd-coin": 1.0,
            "dai": 1.0
        }
        
        fallback_price = fallback_prices.get(coin_id, 1.0)
        logger.warning(f"Using fallback price for {coin_id}: ${fallback_price}")
        return fallback_price
    
    def clear_cache(self):
        """Clear the price cache."""
        self.cache.clear()
        logger.info("Price cache cleared")

# Global instance
price_service = PriceService()
