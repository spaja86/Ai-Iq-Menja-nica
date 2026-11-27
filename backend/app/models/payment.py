"""
Payment processing models for fiat deposits and withdrawals.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class PaymentMethod(str, enum.Enum):
    """Payment method enumeration."""
    STRIPE = "stripe"
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"


class PaymentStatus(str, enum.Enum):
    """Payment status enumeration."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Payment(Base):
    """Payment model for fiat transactions."""
    
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Payment details
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    payment_type = Column(String, nullable=False)  # deposit or withdrawal
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)  # USD, EUR, etc.
    
    # Status
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, index=True)
    
    # External provider information
    provider_transaction_id = Column(String, nullable=True, index=True)
    provider_fee = Column(Float, default=0.0)
    
    # Bank/Card information (encrypted)
    payment_details_encrypted = Column(String, nullable=True)
    
    # Metadata
    description = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<Payment {self.payment_type} {self.amount} {self.currency} via {self.payment_method.value}>"
