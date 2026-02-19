"""
Trade model for executed trades.
"""
from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Trade(Base):
    """Executed trade model."""
    
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Order references
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Trade details
    trading_pair = Column(String, nullable=False, index=True)
    price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    total_value = Column(Float, nullable=False)
    
    # Fee information
    fee = Column(Float, default=0.0)
    
    # Counterparty
    counterparty_order_id = Column(Integer, nullable=True)
    counterparty_user_id = Column(Integer, nullable=True)
    
    # Timestamp
    executed_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    order = relationship("Order", back_populates="trades")
    user = relationship("User", back_populates="trades", foreign_keys=[user_id])
    
    def __repr__(self):
        return f"<Trade {self.id} {self.quantity} {self.trading_pair} @ {self.price}>"
