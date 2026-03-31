"""
Trading API routes - order placement, cancellation, order book.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models import Order, Trade, OrderSide, OrderType, OrderStatus, User
from app.services.trading_engine import TradingEngine
from app.api.auth import get_current_user


router = APIRouter(prefix="/api/trading", tags=["trading"])


# Pydantic models
class OrderCreate(BaseModel):
    trading_pair: str
    side: OrderSide
    order_type: OrderType
    price: Optional[float] = None
    quantity: float


class OrderResponse(BaseModel):
    id: int
    trading_pair: str
    side: str
    order_type: str
    status: str
    price: Optional[float]
    quantity: float
    filled_quantity: float
    remaining_quantity: float
    total_fee: float
    created_at: datetime
    
    class Config:
        from_attributes = True


class TradeResponse(BaseModel):
    id: int
    trading_pair: str
    price: float
    quantity: float
    total_value: float
    fee: float
    executed_at: datetime
    
    class Config:
        from_attributes = True


@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Place a new trading order."""
    # Validate order
    if order_data.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order quantity must be positive"
        )
    
    if order_data.order_type == OrderType.LIMIT and not order_data.price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit orders require a price"
        )
    
    if order_data.order_type == OrderType.LIMIT and order_data.price <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Price must be positive"
        )
    
    # Create order
    order = Order(
        user_id=current_user.id,
        trading_pair=order_data.trading_pair,
        side=order_data.side,
        order_type=order_data.order_type,
        price=order_data.price,
        quantity=order_data.quantity
    )
    
    # Submit to trading engine
    engine = TradingEngine(db)
    order = engine.submit_order(order)
    
    return OrderResponse(
        id=order.id,
        trading_pair=order.trading_pair,
        side=order.side.value,
        order_type=order.order_type.value,
        status=order.status.value,
        price=order.price,
        quantity=order.quantity,
        filled_quantity=order.filled_quantity,
        remaining_quantity=order.remaining_quantity,
        total_fee=order.total_fee,
        created_at=order.created_at
    )


@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    trading_pair: Optional[str] = None,
    status_filter: Optional[OrderStatus] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's orders."""
    query = db.query(Order).filter(Order.user_id == current_user.id)
    
    if trading_pair:
        query = query.filter(Order.trading_pair == trading_pair)
    
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    
    return [
        OrderResponse(
            id=order.id,
            trading_pair=order.trading_pair,
            side=order.side.value,
            order_type=order.order_type.value,
            status=order.status.value,
            price=order.price,
            quantity=order.quantity,
            filled_quantity=order.filled_quantity,
            remaining_quantity=order.remaining_quantity,
            total_fee=order.total_fee,
            created_at=order.created_at
        )
        for order in orders
    ]


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific order."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return OrderResponse(
        id=order.id,
        trading_pair=order.trading_pair,
        side=order.side.value,
        order_type=order.order_type.value,
        status=order.status.value,
        price=order.price,
        quantity=order.quantity,
        filled_quantity=order.filled_quantity,
        remaining_quantity=order.remaining_quantity,
        total_fee=order.total_fee,
        created_at=order.created_at
    )


@router.delete("/orders/{order_id}")
async def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel an open order."""
    engine = TradingEngine(db)
    order = engine.cancel_order(order_id, current_user.id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or already completed"
        )
    
    return {"message": "Order cancelled successfully", "order_id": order.id}


@router.get("/trades", response_model=List[TradeResponse])
async def get_trades(
    trading_pair: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's trade history."""
    query = db.query(Trade).filter(Trade.user_id == current_user.id)
    
    if trading_pair:
        query = query.filter(Trade.trading_pair == trading_pair)
    
    trades = query.order_by(Trade.executed_at.desc()).limit(limit).all()
    
    return [
        TradeResponse(
            id=trade.id,
            trading_pair=trade.trading_pair,
            price=trade.price,
            quantity=trade.quantity,
            total_value=trade.total_value,
            fee=trade.fee,
            executed_at=trade.executed_at
        )
        for trade in trades
    ]


@router.get("/orderbook/{trading_pair}")
async def get_order_book(
    trading_pair: str,
    depth: int = 20,
    db: Session = Depends(get_db)
):
    """Get current order book for a trading pair."""
    engine = TradingEngine(db)
    order_book = engine.get_order_book(trading_pair, depth)
    
    return {
        "trading_pair": trading_pair,
        "bids": order_book["bids"],
        "asks": order_book["asks"],
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/pairs")
async def get_trading_pairs():
    """Get available trading pairs."""
    # In production, this would come from a database or configuration
    return {
        "pairs": [
            {"symbol": "BTC/USD", "base": "BTC", "quote": "USD"},
            {"symbol": "ETH/USD", "base": "ETH", "quote": "USD"},
            {"symbol": "BTC/EUR", "base": "BTC", "quote": "EUR"},
            {"symbol": "ETH/EUR", "base": "ETH", "quote": "EUR"},
        ]
    }
