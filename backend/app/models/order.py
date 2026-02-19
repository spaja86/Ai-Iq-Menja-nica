"""
Order model for buy/sell orders.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SQLEnum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class OrderSide(str, enum.Enum):
    """Order side enumeration."""
    BUY = "buy"
    SELL = "sell"


class OrderType(str, enum.Enum):
    """Order type enumeration."""
    MARKET = "market"
    LIMIT = "limit"
    STOP_LOSS = "stop_loss"


class OrderStatus(str, enum.Enum):
    """Order status enumeration."""
    PENDING = "pending"
    OPEN = "open"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class Order(Base):
    """Trading order model."""
    
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Order details
    trading_pair = Column(String, nullable=False, index=True)  # e.g., "BTC/USD"
    side = Column(SQLEnum(OrderSide), nullable=False)
    order_type = Column(SQLEnum(OrderType), nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, index=True)
    
    # Pricing
    price = Column(Float, nullable=True)  # Null for market orders
    stop_price = Column(Float, nullable=True)  # For stop-loss orders
    quantity = Column(Float, nullable=False)
    filled_quantity = Column(Float, default=0.0)
    
    # Fees
    fee_percent = Column(Float, default=0.1)
    total_fee = Column(Float, default=0.0)
    
    # Metadata
    client_order_id = Column(String, nullable=True, index=True)
    is_hidden = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    filled_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    trades = relationship("Trade", back_populates="order", cascade="all, delete-orphan")
    
    @property
    def remaining_quantity(self):
        """Calculate remaining unfilled quantity."""
        return self.quantity - self.filled_quantity
    
    @property
    def is_complete(self):
        """Check if order is completely filled."""
        return self.filled_quantity >= self.quantity
    
    def __repr__(self):
        return f"<Order {self.id} {self.side.value} {self.quantity} {self.trading_pair}>"
