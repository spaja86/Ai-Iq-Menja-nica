"""
Trading engine with order matching and execution.
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from decimal import Decimal
from datetime import datetime

from app.models import Order, Trade, OrderSide, OrderStatus, OrderType
from app.core.config import settings


class TradingEngine:
    """Production-grade trading engine with FIFO matching."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def submit_order(self, order: Order) -> Order:
        """
        Submit a new order and attempt to match it.
        
        Args:
            order: New order to submit
            
        Returns:
            Order with updated status
        """
        # Validate order
        if order.quantity <= 0:
            order.status = OrderStatus.REJECTED
            self.db.commit()
            return order
        
        if order.order_type == OrderType.MARKET:
            # Execute market order immediately
            order.status = OrderStatus.OPEN
            self.db.add(order)
            self.db.commit()
            self._match_market_order(order)
        elif order.order_type == OrderType.LIMIT:
            # Add limit order to order book
            order.status = OrderStatus.OPEN
            self.db.add(order)
            self.db.commit()
            self._match_limit_order(order)
        
        self.db.refresh(order)
        return order
    
    def _match_market_order(self, order: Order) -> None:
        """Match a market order against existing limit orders."""
        opposite_side = OrderSide.SELL if order.side == OrderSide.BUY else OrderSide.BUY
        
        # Get matching orders sorted by price (best first)
        matching_orders = self.db.query(Order).filter(
            Order.trading_pair == order.trading_pair,
            Order.side == opposite_side,
            Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]),
            Order.order_type == OrderType.LIMIT
        ).order_by(
            Order.price.asc() if order.side == OrderSide.BUY else Order.price.desc()
        ).all()
        
        remaining_qty = order.remaining_quantity
        
        for matching_order in matching_orders:
            if remaining_qty <= 0:
                break
            
            # Calculate trade quantity
            trade_qty = min(remaining_qty, matching_order.remaining_quantity)
            trade_price = matching_order.price
            
            # Execute trade
            self._execute_trade(order, matching_order, trade_qty, trade_price)
            
            remaining_qty -= trade_qty
        
        # Update order status
        if order.is_complete:
            order.status = OrderStatus.FILLED
            order.filled_at = datetime.utcnow()
        elif order.filled_quantity > 0:
            order.status = OrderStatus.PARTIALLY_FILLED
        
        self.db.commit()
    
    def _match_limit_order(self, order: Order) -> None:
        """Match a limit order against existing orders."""
        opposite_side = OrderSide.SELL if order.side == OrderSide.BUY else OrderSide.BUY
        
        # Get matching orders that meet price requirements
        if order.side == OrderSide.BUY:
            # Buy order matches with sell orders at or below limit price
            matching_orders = self.db.query(Order).filter(
                Order.trading_pair == order.trading_pair,
                Order.side == opposite_side,
                Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]),
                Order.order_type == OrderType.LIMIT,
                Order.price <= order.price
            ).order_by(Order.price.asc(), Order.created_at.asc()).all()
        else:
            # Sell order matches with buy orders at or above limit price
            matching_orders = self.db.query(Order).filter(
                Order.trading_pair == order.trading_pair,
                Order.side == opposite_side,
                Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]),
                Order.order_type == OrderType.LIMIT,
                Order.price >= order.price
            ).order_by(Order.price.desc(), Order.created_at.asc()).all()
        
        remaining_qty = order.remaining_quantity
        
        for matching_order in matching_orders:
            if remaining_qty <= 0:
                break
            
            # Calculate trade quantity and price
            trade_qty = min(remaining_qty, matching_order.remaining_quantity)
            trade_price = matching_order.price  # Price taker gets maker's price
            
            # Execute trade
            self._execute_trade(order, matching_order, trade_qty, trade_price)
            
            remaining_qty -= trade_qty
        
        # Update order status
        if order.is_complete:
            order.status = OrderStatus.FILLED
            order.filled_at = datetime.utcnow()
        elif order.filled_quantity > 0:
            order.status = OrderStatus.PARTIALLY_FILLED
        
        self.db.commit()
    
    def _execute_trade(
        self,
        taker_order: Order,
        maker_order: Order,
        quantity: float,
        price: float
    ) -> Trade:
        """
        Execute a trade between two orders.
        
        Args:
            taker_order: Order taking liquidity
            maker_order: Order providing liquidity
            quantity: Trade quantity
            price: Trade price
            
        Returns:
            Created trade object
        """
        total_value = quantity * price
        
        # Calculate fees
        taker_fee = total_value * (taker_order.fee_percent / 100)
        maker_fee = total_value * (maker_order.fee_percent / 100)
        
        # Create trades for both parties
        taker_trade = Trade(
            order_id=taker_order.id,
            user_id=taker_order.user_id,
            trading_pair=taker_order.trading_pair,
            price=price,
            quantity=quantity,
            total_value=total_value,
            fee=taker_fee,
            counterparty_order_id=maker_order.id,
            counterparty_user_id=maker_order.user_id
        )
        
        maker_trade = Trade(
            order_id=maker_order.id,
            user_id=maker_order.user_id,
            trading_pair=maker_order.trading_pair,
            price=price,
            quantity=quantity,
            total_value=total_value,
            fee=maker_fee,
            counterparty_order_id=taker_order.id,
            counterparty_user_id=taker_order.user_id
        )
        
        # Update order filled quantities and fees
        taker_order.filled_quantity += quantity
        taker_order.total_fee += taker_fee
        maker_order.filled_quantity += quantity
        maker_order.total_fee += maker_fee
        
        # Update maker order status
        if maker_order.is_complete:
            maker_order.status = OrderStatus.FILLED
            maker_order.filled_at = datetime.utcnow()
        else:
            maker_order.status = OrderStatus.PARTIALLY_FILLED
        
        # Save trades
        self.db.add(taker_trade)
        self.db.add(maker_trade)
        self.db.commit()
        
        return taker_trade
    
    def cancel_order(self, order_id: int, user_id: int) -> Optional[Order]:
        """
        Cancel an open order.
        
        Args:
            order_id: Order ID to cancel
            user_id: User ID for authorization
            
        Returns:
            Cancelled order or None if not found
        """
        order = self.db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id,
            Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED])
        ).first()
        
        if order:
            order.status = OrderStatus.CANCELLED
            order.cancelled_at = datetime.utcnow()
            self.db.commit()
        
        return order
    
    def get_order_book(
        self,
        trading_pair: str,
        depth: int = 20
    ) -> dict:
        """
        Get current order book for a trading pair.
        
        Args:
            trading_pair: Trading pair symbol
            depth: Number of price levels to return
            
        Returns:
            Order book with bids and asks
        """
        # Get buy orders (bids)
        bids = self.db.query(Order).filter(
            Order.trading_pair == trading_pair,
            Order.side == OrderSide.BUY,
            Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]),
            Order.order_type == OrderType.LIMIT
        ).order_by(Order.price.desc()).limit(depth).all()
        
        # Get sell orders (asks)
        asks = self.db.query(Order).filter(
            Order.trading_pair == trading_pair,
            Order.side == OrderSide.SELL,
            Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]),
            Order.order_type == OrderType.LIMIT
        ).order_by(Order.price.asc()).limit(depth).all()
        
        return {
            "bids": [
                {"price": order.price, "quantity": order.remaining_quantity}
                for order in bids
            ],
            "asks": [
                {"price": order.price, "quantity": order.remaining_quantity}
                for order in asks
            ]
        }
