"""
Order Matching Engine - Core trading logic for the exchange
Implements FIFO matching, balance management, and fee calculation
"""

from decimal import Decimal
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.models import Order, Trade, Balance, Market, OrderType, OrderSide, OrderStatus, LedgerEntry
from app.core.config import settings


class MatchingEngine:
    """
    Order matching engine for the exchange
    
    Features:
    - FIFO (First-In-First-Out) matching
    - Limit and market orders
    - Balance reservation and release
    - Fee calculation (maker/taker)
    - Atomic trade execution
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def place_order(self, order: Order) -> Order:
        """
        Place an order and attempt to match it
        
        Args:
            order: Order object to place
        
        Returns:
            Updated order with matching results
        """
        # Reserve funds
        self._reserve_funds(order)
        
        # Set order status to OPEN
        order.status = OrderStatus.OPEN
        self.db.add(order)
        self.db.commit()
        
        # Try to match the order
        if order.order_type == OrderType.MARKET:
            self._match_market_order(order)
        else:  # LIMIT
            self._match_limit_order(order)
        
        self.db.refresh(order)
        return order
    
    def cancel_order(self, order: Order) -> None:
        """
        Cancel an order and release reserved funds
        
        Args:
            order: Order to cancel
        """
        # Release reserved funds
        self._release_funds(order)
        
        # Update order status
        order.status = OrderStatus.CANCELLED
        order.cancelled_at = datetime.utcnow()
        self.db.commit()
    
    def _reserve_funds(self, order: Order) -> None:
        """
        Reserve funds for an order
        
        For BUY orders: Reserve quote asset (e.g., USD to buy BTC)
        For SELL orders: Reserve base asset (e.g., BTC to sell)
        """
        market = self.db.query(Market).filter(Market.id == order.market_id).first()
        
        if order.side == OrderSide.BUY:
            # Need quote asset
            asset_id = market.quote_asset_id
            if order.order_type == OrderType.LIMIT:
                amount = order.quantity * order.price
            else:
                # For market orders, estimate with high price
                # In production, calculate from orderbook
                amount = order.quantity * Decimal('999999999')
        else:  # SELL
            # Need base asset
            asset_id = market.base_asset_id
            amount = order.quantity
        
        # Get user balance
        balance = self.db.query(Balance).filter(
            Balance.user_id == order.user_id,
            Balance.asset_id == asset_id
        ).first()
        
        if not balance:
            # Create balance if doesn't exist
            balance = Balance(
                user_id=order.user_id,
                asset_id=asset_id,
                available=Decimal('0'),
                reserved=Decimal('0')
            )
            self.db.add(balance)
            self.db.commit()
        
        # Check sufficient funds
        if balance.available < amount:
            raise ValueError(f"Insufficient balance: need {amount}, have {balance.available}")
        
        # Reserve funds
        balance.available -= amount
        balance.reserved += amount
        self.db.commit()
    
    def _release_funds(self, order: Order) -> None:
        """
        Release reserved funds when order is cancelled or filled
        
        Args:
            order: Order whose funds to release
        """
        market = self.db.query(Market).filter(Market.id == order.market_id).first()
        
        if order.side == OrderSide.BUY:
            asset_id = market.quote_asset_id
            # Calculate unfilled amount
            if order.order_type == OrderType.LIMIT:
                unfilled = (order.quantity - order.filled_quantity) * order.price
            else:
                unfilled = (order.quantity - order.filled_quantity) * Decimal('999999999')
        else:  # SELL
            asset_id = market.base_asset_id
            unfilled = order.quantity - order.filled_quantity
        
        # Release funds
        balance = self.db.query(Balance).filter(
            Balance.user_id == order.user_id,
            Balance.asset_id == asset_id
        ).first()
        
        if balance and unfilled > 0:
            balance.reserved -= unfilled
            balance.available += unfilled
            self.db.commit()
    
    def _match_limit_order(self, order: Order) -> None:
        """
        Match a limit order against existing orders
        
        BUY orders match with SELL orders at or below the limit price
        SELL orders match with BUY orders at or above the limit price
        """
        # Get opposite side orders
        if order.side == OrderSide.BUY:
            # Match with sell orders at or below our price
            opposite_orders = self.db.query(Order).filter(
                Order.market_id == order.market_id,
                Order.side == OrderSide.SELL,
                Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]),
                Order.price <= order.price
            ).order_by(Order.price, Order.created_at).all()
        else:  # SELL
            # Match with buy orders at or above our price
            opposite_orders = self.db.query(Order).filter(
                Order.market_id == order.market_id,
                Order.side == OrderSide.BUY,
                Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]),
                Order.price >= order.price
            ).order_by(Order.price.desc(), Order.created_at).all()
        
        # Try to fill the order
        for opposite_order in opposite_orders:
            if order.filled_quantity >= order.quantity:
                break
            
            # Calculate trade quantity
            remaining = order.quantity - order.filled_quantity
            opposite_remaining = opposite_order.quantity - opposite_order.filled_quantity
            trade_qty = min(remaining, opposite_remaining)
            
            # Execute trade
            self._execute_trade(order, opposite_order, trade_qty)
    
    def _match_market_order(self, order: Order) -> None:
        """
        Match a market order at the best available price
        
        Market orders execute immediately at the best available price
        """
        # Get opposite side orders
        if order.side == OrderSide.BUY:
            # Match with best sell orders
            opposite_orders = self.db.query(Order).filter(
                Order.market_id == order.market_id,
                Order.side == OrderSide.SELL,
                Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED])
            ).order_by(Order.price, Order.created_at).all()
        else:  # SELL
            # Match with best buy orders
            opposite_orders = self.db.query(Order).filter(
                Order.market_id == order.market_id,
                Order.side == OrderSide.BUY,
                Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED])
            ).order_by(Order.price.desc(), Order.created_at).all()
        
        # Fill the order
        for opposite_order in opposite_orders:
            if order.filled_quantity >= order.quantity:
                break
            
            remaining = order.quantity - order.filled_quantity
            opposite_remaining = opposite_order.quantity - opposite_order.filled_quantity
            trade_qty = min(remaining, opposite_remaining)
            
            self._execute_trade(order, opposite_order, trade_qty)
    
    def _execute_trade(self, taker_order: Order, maker_order: Order, quantity: Decimal) -> Trade:
        """
        Execute a trade between two orders
        
        Args:
            taker_order: Order that initiated the match (pays taker fee)
            maker_order: Order that was already in the book (pays maker fee)
            quantity: Amount to trade
        
        Returns:
            Created Trade object
        """
        # Trade price is the maker's price
        trade_price = maker_order.price
        
        # Calculate fees
        trade_value = quantity * trade_price
        taker_fee = trade_value * (Decimal(settings.TAKER_FEE_PERCENT) / Decimal('100'))
        maker_fee = trade_value * (Decimal(settings.MAKER_FEE_PERCENT) / Decimal('100'))
        
        # Determine buyer and seller
        if taker_order.side == OrderSide.BUY:
            buyer_id = taker_order.user_id
            seller_id = maker_order.user_id
            buyer_fee = taker_fee
            seller_fee = maker_fee
        else:
            buyer_id = maker_order.user_id
            seller_id = taker_order.user_id
            buyer_fee = maker_fee
            seller_fee = taker_fee
        
        # Create trade record
        trade = Trade(
            order_id=taker_order.id,
            matching_order_id=maker_order.id,
            market_id=taker_order.market_id,
            price=trade_price,
            quantity=quantity,
            buyer_id=buyer_id,
            seller_id=seller_id,
            buyer_fee=buyer_fee,
            seller_fee=seller_fee
        )
        self.db.add(trade)
        
        # Update orders
        taker_order.filled_quantity += quantity
        maker_order.filled_quantity += quantity
        
        if taker_order.filled_quantity >= taker_order.quantity:
            taker_order.status = OrderStatus.FILLED
            taker_order.filled_at = datetime.utcnow()
        else:
            taker_order.status = OrderStatus.PARTIALLY_FILLED
        
        if maker_order.filled_quantity >= maker_order.quantity:
            maker_order.status = OrderStatus.FILLED
            maker_order.filled_at = datetime.utcnow()
        else:
            maker_order.status = OrderStatus.PARTIALLY_FILLED
        
        # Update balances
        market = self.db.query(Market).filter(Market.id == taker_order.market_id).first()
        self._settle_balances(trade, market)
        
        self.db.commit()
        
        return trade
    
    def _settle_balances(self, trade: Trade, market: Market) -> None:
        """
        Settle balances after a trade
        
        Transfers base asset from seller to buyer
        Transfers quote asset from buyer to seller
        Deducts fees
        """
        # Get balances
        buyer_base_balance = self._get_balance(trade.buyer_id, market.base_asset_id)
        buyer_quote_balance = self._get_balance(trade.buyer_id, market.quote_asset_id)
        seller_base_balance = self._get_balance(trade.seller_id, market.base_asset_id)
        seller_quote_balance = self._get_balance(trade.seller_id, market.quote_asset_id)
        
        trade_value = trade.quantity * trade.price
        
        # Buyer: Release quote reserved, receive base
        buyer_quote_balance.reserved -= trade_value + trade.buyer_fee
        buyer_base_balance.available += trade.quantity
        
        # Seller: Release base reserved, receive quote
        seller_base_balance.reserved -= trade.quantity
        seller_quote_balance.available += trade_value - trade.seller_fee
        
        self.db.commit()
    
    def _get_balance(self, user_id: int, asset_id: int) -> Balance:
        """Get or create user balance for an asset"""
        balance = self.db.query(Balance).filter(
            Balance.user_id == user_id,
            Balance.asset_id == asset_id
        ).first()
        
        if not balance:
            balance = Balance(
                user_id=user_id,
                asset_id=asset_id,
                available=Decimal('0'),
                reserved=Decimal('0')
            )
            self.db.add(balance)
            self.db.commit()
        
        return balance
