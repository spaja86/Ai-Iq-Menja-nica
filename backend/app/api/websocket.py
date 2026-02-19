"""WebSocket API endpoints."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio

router = APIRouter()


class ConnectionManager:
    """Manage WebSocket connections."""
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass


manager = ConnectionManager()


@router.websocket("/ticker")
async def websocket_ticker(websocket: WebSocket):
    """WebSocket for real-time ticker updates."""
    await manager.connect(websocket)
    try:
        while True:
            # TODO: Send real ticker data
            await websocket.send_json({
                "type": "ticker",
                "symbol": "BTC/USD",
                "price": "50000",
                "timestamp": "2024-01-01T00:00:00Z"
            })
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.websocket("/orders")
async def websocket_orders(websocket: WebSocket):
    """WebSocket for order updates."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # TODO: Process order updates
            await websocket.send_json({"status": "received"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
