"""
Trading router - handles order placement, cancellation, and balance queries
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from app.db.session import get_db
from app.db.models import User, Order, Trade, Balance, Market, Asset, OrderStatus, AuditLog
from app.api.schemas import OrderCreate, OrderResponse, TradeResponse, BalanceResponse

router = APIRouter(prefix="/trading", tags=["trading"])


def get_current_user(db: Session = Depends(get_db)) -> User:
    """
    Dependency to get current authenticated user
    
    In production, this should decode JWT token from Authorization header
    For now, returning a placeholder
    """
    # TODO: Implement proper JWT authentication
    # This is a placeholder - replace with actual JWT validation
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required"
    )


@router.get("/balances", response_model=List[BalanceResponse])
def get_balances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's balances for all assets
    
    Returns available, reserved, and total balance for each asset
    """
    balances = db.query(Balance).filter(
        Balance.user_id == current_user.id
    ).all()
    
    # Add asset information
    result = []
    for balance in balances:
        result.append({
            **balance.__dict__,
            "total": balance.available + balance.reserved
        })
    
    return result


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new trading order
    
    Args:
        order_data: Order details (market_id, type, side, price, quantity)
    
    Returns:
        Created order
    
    Order Types:
        - limit: Order at specific price
        - market: Order at best available price
    
    Sides:
        - buy: Buy base asset with quote asset
        - sell: Sell base asset for quote asset
    """
    # Verify market exists
    market = db.query(Market).filter(Market.id == order_data.market_id).first()
    if not market or not market.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Market not found or inactive"
        )
    
    # Validate order size
    if order_data.quantity < market.min_order_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order size below minimum: {market.min_order_size}"
        )
    
    if market.max_order_size and order_data.quantity > market.max_order_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order size above maximum: {market.max_order_size}"
        )
    
    # Check user balance (simplified - full implementation in matching engine)
    # For buy orders: need quote asset (USD to buy BTC)
    # For sell orders: need base asset (BTC to sell for USD)
    
    if order_data.side == "buy":
        required_asset_id = market.quote_asset_id
        if order_data.order_type == "limit":
            required_amount = order_data.quantity * order_data.price
        else:
            # For market orders, estimate with current market price
            # This is simplified - real implementation would use orderbook
            required_amount = order_data.quantity * 50000  # Placeholder
    else:  # sell
        required_asset_id = market.base_asset_id
        required_amount = order_data.quantity
    
    # Get user balance
    balance = db.query(Balance).filter(
        Balance.user_id == current_user.id,
        Balance.asset_id == required_asset_id
    ).first()
    
    if not balance or balance.available < required_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance"
        )
    
    # Create order
    new_order = Order(
        user_id=current_user.id,
        market_id=order_data.market_id,
        order_type=order_data.order_type,
        side=order_data.side,
        price=order_data.price,
        quantity=order_data.quantity,
        status=OrderStatus.PENDING
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Log order creation
    audit_log = AuditLog(
        user_id=current_user.id,
        action="order_created",
        success=True,
        details=f"Order {new_order.id}: {order_data.side} {order_data.quantity} @ {order_data.price}"
    )
    db.add(audit_log)
    db.commit()
    
    # TODO: Send order to matching engine
    
    return new_order


@router.get("/orders", response_model=List[OrderResponse])
def get_orders(
    market_id: int = None,
    status: str = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's orders
    
    Args:
        market_id: Filter by market (optional)
        status: Filter by status (optional)
        limit: Max results (default 50)
    """
    query = db.query(Order).filter(Order.user_id == current_user.id)
    
    if market_id:
        query = query.filter(Order.market_id == market_id)
    
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    
    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific order by ID"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order


@router.delete("/orders/{order_id}")
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel an open order
    
    Only pending or open orders can be cancelled
    """
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if order can be cancelled
    if order.status not in [OrderStatus.PENDING, OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order with status: {order.status}"
        )
    
    # Cancel order
    order.status = OrderStatus.CANCELLED
    from datetime import datetime
    order.cancelled_at = datetime.utcnow()
    
    db.commit()
    
    # Log cancellation
    audit_log = AuditLog(
        user_id=current_user.id,
        action="order_cancelled",
        success=True,
        details=f"Order {order_id} cancelled"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Order cancelled successfully", "order_id": order_id}


@router.get("/trades", response_model=List[TradeResponse])
def get_trades(
    market_id: int = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's trade history
    
    Args:
        market_id: Filter by market (optional)
        limit: Max results (default 50)
    """
    # Get trades where user is buyer or seller
    query = db.query(Trade).filter(
        (Trade.buyer_id == current_user.id) | (Trade.seller_id == current_user.id)
    )
    
    if market_id:
        query = query.filter(Trade.market_id == market_id)
    
    trades = query.order_by(Trade.created_at.desc()).limit(limit).all()
    
    return trades
