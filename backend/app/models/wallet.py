"""
Wallet model for cryptocurrency and fiat balances.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Wallet(Base):
    """User wallet for crypto and fiat currencies."""
    
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Currency information
    currency = Column(String, nullable=False, index=True)  # BTC, ETH, USD, EUR, etc.
    balance = Column(Float, default=0.0, nullable=False)
    locked_balance = Column(Float, default=0.0, nullable=False)  # Funds in open orders
    
    # Blockchain information (for crypto wallets)
    address = Column(String, nullable=True, unique=True, index=True)
    private_key_encrypted = Column(String, nullable=True)  # Encrypted private key
    
    # Metadata
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="wallets")
    transactions = relationship("Transaction", back_populates="wallet", cascade="all, delete-orphan")
    
    @property
    def available_balance(self):
        """Calculate available balance (total - locked)."""
        return self.balance - self.locked_balance
    
    def __repr__(self):
        return f"<Wallet {self.currency} balance={self.balance}>"


class Transaction(Base):
    """Wallet transaction history."""
    
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False, index=True)
    
    # Transaction details
    transaction_type = Column(String, nullable=False)  # deposit, withdrawal, trade, fee
    amount = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    
    # External reference
    external_id = Column(String, nullable=True, index=True)  # Blockchain tx hash or payment ID
    description = Column(String, nullable=True)
    
    # Metadata
    status = Column(String, default="pending")  # pending, confirmed, failed
    confirmations = Column(Integer, default=0)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    confirmed_at = Column(DateTime, nullable=True)
    
    # Relationship
    wallet = relationship("Wallet", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction {self.transaction_type} {self.amount}>"
