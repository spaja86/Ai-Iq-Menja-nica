"""
WebSocket API for real-time price feeds and order book updates.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
from datetime import datetime


router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.subscriptions: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket):
        """Accept and store new connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove connection."""
        self.active_connections.remove(websocket)
        # Remove from all subscriptions
        for channel in self.subscriptions.values():
            if websocket in channel:
                channel.remove(websocket)
    
    def subscribe(self, channel: str, websocket: WebSocket):
        """Subscribe connection to a channel."""
        if channel not in self.subscriptions:
            self.subscriptions[channel] = []
        if websocket not in self.subscriptions[channel]:
            self.subscriptions[channel].append(websocket)
    
    def unsubscribe(self, channel: str, websocket: WebSocket):
        """Unsubscribe connection from a channel."""
        if channel in self.subscriptions and websocket in self.subscriptions[channel]:
            self.subscriptions[channel].remove(websocket)
    
    async def broadcast_to_channel(self, channel: str, message: dict):
        """Broadcast message to all subscribers of a channel."""
        if channel not in self.subscriptions:
            return
        
        disconnected = []
        for connection in self.subscriptions[channel]:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        
        # Clean up disconnected websockets
        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates.
    
    Messages format:
    - Subscribe: {"action": "subscribe", "channel": "orderbook:BTC/USD"}
    - Unsubscribe: {"action": "unsubscribe", "channel": "orderbook:BTC/USD"}
    """
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            action = message.get("action")
            channel = message.get("channel")
            
            if action == "subscribe" and channel:
                manager.subscribe(channel, websocket)
                await websocket.send_json({
                    "type": "subscription",
                    "status": "subscribed",
                    "channel": channel
                })
            
            elif action == "unsubscribe" and channel:
                manager.unsubscribe(channel, websocket)
                await websocket.send_json({
                    "type": "subscription",
                    "status": "unsubscribed",
                    "channel": channel
                })
            
            elif action == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)


async def broadcast_price_update(trading_pair: str, price: float, volume: float):
    """Broadcast price update to subscribers."""
    message = {
        "type": "price_update",
        "trading_pair": trading_pair,
        "price": price,
        "volume": volume,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.broadcast_to_channel(f"price:{trading_pair}", message)


async def broadcast_orderbook_update(trading_pair: str, orderbook: dict):
    """Broadcast order book update to subscribers."""
    message = {
        "type": "orderbook_update",
        "trading_pair": trading_pair,
        "orderbook": orderbook,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.broadcast_to_channel(f"orderbook:{trading_pair}", message)


async def broadcast_trade(trade_data: dict):
    """Broadcast new trade to subscribers."""
    message = {
        "type": "trade",
        "data": trade_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    trading_pair = trade_data.get("trading_pair")
    if trading_pair:
        await manager.broadcast_to_channel(f"trades:{trading_pair}", message)
