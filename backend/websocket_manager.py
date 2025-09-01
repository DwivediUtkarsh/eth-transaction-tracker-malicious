import json
import logging
from typing import List, Dict, Any
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class ConnectionManager:
    """WebSocket connection manager for real-time updates."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Send welcome message
        await self.send_personal_message(
            {
                "type": "connected",
                "message": "Connected to transaction stream",
                "timestamp": datetime.utcnow().isoformat()
            },
            websocket
        )
        
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send a message to a specific WebSocket connection."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Failed to send personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all connected clients."""
        if not self.active_connections:
            return
            
        # Add timestamp if not present
        if "timestamp" not in message:
            message["timestamp"] = datetime.utcnow().isoformat()
        
        disconnected = []
        
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                disconnected.append(connection)
            except Exception as e:
                logger.error(f"Failed to send broadcast message: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
        
        if disconnected:
            logger.info(f"Removed {len(disconnected)} disconnected clients")
    
    async def broadcast_transaction(self, transaction: Dict[str, Any]):
        """Broadcast new transaction to all connected clients."""
        message = {
            "type": "new_transaction",
            "data": {
                "transaction": transaction
            }
        }
        
        await self.broadcast(message)
        logger.debug(f"Broadcasted new transaction: {transaction.get('hash', 'unknown')}")
    
    async def broadcast_analysis_started(self, contract_address: str, task_id: str):
        """Broadcast when a contract analysis starts."""
        message = {
            "type": "analysis_started",
            "data": {
                "contract_address": contract_address,
                "task_id": task_id,
                "status": "processing"
            }
        }
        
        await self.broadcast(message)
        logger.info(f"Broadcasted analysis started: {contract_address}")
    
    async def broadcast_analysis_complete(self, analysis: Dict[str, Any]):
        """Broadcast when a contract analysis completes."""
        message = {
            "type": "analysis_complete",
            "data": analysis
        }
        
        await self.broadcast(message)
        
        # If malicious, send alert
        if analysis.get("verdict") == "MALICIOUS":
            await self.broadcast_alert(analysis)
        
        logger.info(f"Broadcasted analysis complete: {analysis.get('contract_address')} - {analysis.get('verdict')}")
    
    async def broadcast_alert(self, analysis: Dict[str, Any]):
        """Broadcast security alert for malicious contracts."""
        message = {
            "type": "alert",
            "data": {
                "severity": "high",
                "title": "🚨 MALICIOUS CONTRACT DETECTED",
                "contract_address": analysis.get("contract_address"),
                "verdict": analysis.get("verdict"),
                "explanation": analysis.get("explanation"),
                "security_score": analysis.get("security_score"),
                "attack_vectors": analysis.get("attack_vectors", [])
            }
        }
        
        await self.broadcast(message)
        logger.warning(f"🚨 MALICIOUS CONTRACT ALERT: {analysis.get('contract_address')}")
    
    async def broadcast_stats_update(self, stats: Dict[str, Any]):
        """Broadcast updated dashboard statistics."""
        message = {
            "type": "stats_update",
            "data": {
                "stats": stats
            }
        }
        
        await self.broadcast(message)
        logger.debug("Broadcasted stats update")
    
    def get_connection_count(self) -> int:
        """Get the number of active connections."""
        return len(self.active_connections)
    
    def get_connection_info(self) -> Dict[str, Any]:
        """Get information about active connections."""
        return {
            "active_connections": len(self.active_connections),
            "connection_details": [
                {
                    "client": getattr(conn.client, 'host', 'unknown') if hasattr(conn, 'client') else 'unknown',
                    "state": conn.client_state.name if hasattr(conn, 'client_state') else 'unknown'
                }
                for conn in self.active_connections
            ]
        }

# Global connection manager instance
manager = ConnectionManager()

