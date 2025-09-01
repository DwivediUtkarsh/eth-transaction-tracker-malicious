import time
import json
import logging
from typing import Any, Optional, Dict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SimpleCache:
    """
    Simple in-memory cache with TTL support.
    In production, this should be replaced with Redis or similar.
    """
    
    def __init__(self, default_ttl: int = 300):
        self.cache: Dict[str, Dict] = {}
        self.default_ttl = default_ttl
        
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired."""
        if key not in self.cache:
            return None
            
        entry = self.cache[key]
        
        # Check if expired
        if datetime.utcnow() > entry["expires_at"]:
            del self.cache[key]
            return None
            
        logger.debug(f"Cache hit for key: {key}")
        return entry["value"]
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with TTL."""
        if ttl is None:
            ttl = self.default_ttl
            
        expires_at = datetime.utcnow() + timedelta(seconds=ttl)
        
        self.cache[key] = {
            "value": value,
            "expires_at": expires_at,
            "created_at": datetime.utcnow()
        }
        
        logger.debug(f"Cache set for key: {key}, TTL: {ttl}s")
    
    def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if key in self.cache:
            del self.cache[key]
            logger.debug(f"Cache deleted key: {key}")
            return True
        return False
    
    def clear(self) -> None:
        """Clear all cache entries."""
        self.cache.clear()
        logger.info("Cache cleared")
    
    def cleanup_expired(self) -> int:
        """Remove expired entries and return count of removed items."""
        now = datetime.utcnow()
        expired_keys = [
            key for key, entry in self.cache.items()
            if now > entry["expires_at"]
        ]
        
        for key in expired_keys:
            del self.cache[key]
            
        if expired_keys:
            logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")
            
        return len(expired_keys)
    
    def get_stats(self) -> Dict:
        """Get cache statistics."""
        now = datetime.utcnow()
        active_entries = sum(
            1 for entry in self.cache.values()
            if now <= entry["expires_at"]
        )
        
        return {
            "total_entries": len(self.cache),
            "active_entries": active_entries,
            "expired_entries": len(self.cache) - active_entries
        }

# Cache instances for different purposes
transaction_cache = SimpleCache(default_ttl=300)  # 5 minutes
analysis_cache = SimpleCache(default_ttl=86400)   # 24 hours
stats_cache = SimpleCache(default_ttl=60)         # 1 minute

