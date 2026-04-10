"""
Market router - handles assets, markets, and orderbook queries
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.db.session import get_db
from app.db.models import Asset, Market, Order, Trade, OrderStatus, OrderSide
from app.api.schemas import AssetResponse, MarketResponse, MarketWithAssets, OrderbookResponse, OrderbookEntry

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/assets", response_model=List[AssetResponse])
def get_assets(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Get all available assets/currencies
    
    - Returns list of tradeable assets (BTC, ETH, USD, etc.)
    """
    query = db.query(Asset)
    
    if active_only:
        query = query.filter(Asset.is_active == True)
    
    assets = query.all()
    return assets


@router.get("/assets/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    """Get specific asset by ID"""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )
    
    return asset


@router.get("/markets", response_model=List[MarketWithAssets])
def get_markets(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Get all trading markets
    
    - Returns list of available trading pairs (BTC-USD, ETH-EUR, etc.)
    """
    query = db.query(Market)
    
    if active_only:
        query = query.filter(Market.is_active == True)
    
    markets = query.all()
    return markets


@router.get("/markets/{market_id}", response_model=MarketWithAssets)
def get_market(market_id: int, db: Session = Depends(get_db)):
    """Get specific market by ID"""
    market = db.query(Market).filter(Market.id == market_id).first()
    
    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Market not found"
        )
    
    return market


@router.get("/markets/{market_id}/orderbook", response_model=OrderbookResponse)
def get_orderbook(
    market_id: int,
    depth: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get orderbook for a market
    
    Args:
        market_id: Market ID
        depth: Number of price levels to return (default 20)
    
    Returns:
        Bids (buy orders) and asks (sell orders) with price/quantity
    """
    # Verify market exists
    market = db.query(Market).filter(Market.id == market_id).first()
    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Market not found"
        )
    
    # Get open buy orders (bids) - descending price
    buy_orders = db.query(Order).filter(
        Order.market_id == market_id,
        Order.side == OrderSide.BUY,
        Order.status == OrderStatus.OPEN
    ).order_by(desc(Order.price)).limit(depth).all()
    
    # Get open sell orders (asks) - ascending price
    sell_orders = db.query(Order).filter(
        Order.market_id == market_id,
        Order.side == OrderSide.SELL,
        Order.status == OrderStatus.OPEN
    ).order_by(Order.price).limit(depth).all()
    
    # Aggregate by price level
    bids = []
    asks = []
    
    # Group buy orders by price
    buy_prices = {}
    for order in buy_orders:
        price = float(order.price)
        remaining_qty = float(order.quantity - order.filled_quantity)
        
        if price not in buy_prices:
            buy_prices[price] = 0
        buy_prices[price] += remaining_qty
    
    for price, qty in sorted(buy_prices.items(), reverse=True):
        bids.append(OrderbookEntry(
            price=price,
            quantity=qty,
            total=price * qty
        ))
    
    # Group sell orders by price
    sell_prices = {}
    for order in sell_orders:
        price = float(order.price)
        remaining_qty = float(order.quantity - order.filled_quantity)
        
        if price not in sell_prices:
            sell_prices[price] = 0
        sell_prices[price] += remaining_qty
    
    for price, qty in sorted(sell_prices.items()):
        asks.append(OrderbookEntry(
            price=price,
            quantity=qty,
            total=price * qty
        ))
    
    # Get last trade price
    last_trade = db.query(Trade).filter(
        Trade.market_id == market_id
    ).order_by(desc(Trade.created_at)).first()
    
    last_trade_price = float(last_trade.price) if last_trade else None
    
    return OrderbookResponse(
        market_id=market_id,
        market_symbol=market.symbol,
        bids=bids,
        asks=asks,
        last_trade_price=last_trade_price
    )
