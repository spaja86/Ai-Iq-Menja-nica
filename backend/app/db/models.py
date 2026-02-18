"""
SQLAlchemy database models for Ai IQ Menjačnica Exchange
Implements User, Balance, Market, Order, Trade, Payment, Ledger, and Audit tables
"""

from datetime import datetime
from typing import Optional
from decimal import Decimal

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Numeric, 
    ForeignKey, Enum, Text, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()


# Enums
class OrderType(str, enum.Enum):
    LIMIT = "limit"
    MARKET = "market"


class OrderSide(str, enum.Enum):
    BUY = "buy"
    SELL = "sell"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    OPEN = "open"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentProvider(str, enum.Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    COINBASE = "coinbase"
    BITPAY = "bitpay"
    CRYPTO_DEPOSIT = "crypto_deposit"


# Models
class User(Base):
    """User account model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    
    # 2FA
    totp_secret = Column(String(32), nullable=True)
    is_2fa_enabled = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    balances = relationship("Balance", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")


class Asset(Base):
    """Asset/Currency model (e.g., BTC, ETH, USD, EUR)"""
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(10), unique=True, index=True, nullable=False)  # BTC, ETH, USD
    name = Column(String(100), nullable=False)  # Bitcoin, Ethereum, US Dollar
    
    is_crypto = Column(Boolean, default=False)
    is_fiat = Column(Boolean, default=False)
    
    # Precision for amounts (e.g., 8 for BTC, 2 for USD)
    decimals = Column(Integer, default=8)
    
    # Withdrawal settings
    min_withdrawal = Column(Numeric(20, 8), default=0)
    withdrawal_fee = Column(Numeric(20, 8), default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    markets_base = relationship("Market", foreign_keys="Market.base_asset_id", back_populates="base_asset")
    markets_quote = relationship("Market", foreign_keys="Market.quote_asset_id", back_populates="quote_asset")
    balances = relationship("Balance", back_populates="asset")


class Market(Base):
    """Trading market/pair model (e.g., BTC/USD)"""
    __tablename__ = "markets"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Assets in the pair
    base_asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    quote_asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    
    # Market info
    symbol = Column(String(20), unique=True, index=True, nullable=False)  # BTC-USD
    is_active = Column(Boolean, default=True)
    
    # Trading limits
    min_order_size = Column(Numeric(20, 8), default=0)
    max_order_size = Column(Numeric(20, 8), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    base_asset = relationship("Asset", foreign_keys=[base_asset_id], back_populates="markets_base")
    quote_asset = relationship("Asset", foreign_keys=[quote_asset_id], back_populates="markets_quote")
    orders = relationship("Order", back_populates="market")
    
    __table_args__ = (
        UniqueConstraint('base_asset_id', 'quote_asset_id', name='uq_market_pair'),
    )


class Balance(Base):
    """User balance for each asset"""
    __tablename__ = "balances"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    
    # Available balance (can be used for trading/withdrawal)
    available = Column(Numeric(20, 8), default=0, nullable=False)
    
    # Reserved balance (locked in open orders)
    reserved = Column(Numeric(20, 8), default=0, nullable=False)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="balances")
    asset = relationship("Asset", back_populates="balances")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'asset_id', name='uq_user_asset_balance'),
        Index('idx_user_balance', 'user_id', 'asset_id'),
    )


class Order(Base):
    """Trading order model"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    
    # Order details
    order_type = Column(Enum(OrderType), nullable=False)
    side = Column(Enum(OrderSide), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    
    # Pricing
    price = Column(Numeric(20, 8), nullable=True)  # Null for market orders
    quantity = Column(Numeric(20, 8), nullable=False)
    filled_quantity = Column(Numeric(20, 8), default=0, nullable=False)
    
    # Fees
    fee_amount = Column(Numeric(20, 8), default=0)
    fee_asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    filled_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    market = relationship("Market", back_populates="orders")
    trades = relationship("Trade", foreign_keys="Trade.order_id", back_populates="order")
    
    __table_args__ = (
        Index('idx_order_status', 'status'),
        Index('idx_order_market', 'market_id', 'status'),
        Index('idx_order_user', 'user_id'),
    )


class Trade(Base):
    """Executed trade model (result of matched orders)"""
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Orders involved
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    matching_order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=False)
    
    # Trade details
    price = Column(Numeric(20, 8), nullable=False)
    quantity = Column(Numeric(20, 8), nullable=False)
    
    # Parties
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Fees
    buyer_fee = Column(Numeric(20, 8), default=0)
    seller_fee = Column(Numeric(20, 8), default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    order = relationship("Order", foreign_keys=[order_id], back_populates="trades")
    matching_order = relationship("Order", foreign_keys=[matching_order_id])
    buyer = relationship("User", foreign_keys=[buyer_id])
    seller = relationship("User", foreign_keys=[seller_id])
    
    __table_args__ = (
        Index('idx_trade_market', 'market_id', 'created_at'),
    )


class Payment(Base):
    """Payment/deposit/withdrawal model"""
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Payment details
    provider = Column(Enum(PaymentProvider), nullable=False)
    external_id = Column(String(255), unique=True, index=True, nullable=True)  # Provider's transaction ID
    
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    amount = Column(Numeric(20, 8), nullable=False)
    
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Type
    is_deposit = Column(Boolean, default=True)  # True for deposit, False for withdrawal
    
    # Provider data
    provider_data = Column(Text, nullable=True)  # JSON string for provider-specific data
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="payments")
    asset = relationship("Asset")
    
    __table_args__ = (
        Index('idx_payment_user', 'user_id', 'status'),
    )


class WebhookEvent(Base):
    """Webhook event tracking for idempotency"""
    __tablename__ = "webhook_events"
    
    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False)
    event_id = Column(String(255), unique=True, index=True, nullable=False)
    event_type = Column(String(100), nullable=True)
    
    processed = Column(Boolean, default=False)
    processed_at = Column(DateTime, nullable=True)
    
    payload = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class LedgerEntry(Base):
    """Transaction ledger with digital stamps"""
    __tablename__ = "ledger_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Reference
    transaction_type = Column(String(50), nullable=False)  # trade, deposit, withdrawal, fee
    reference_id = Column(Integer, nullable=False)  # ID of related record
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    
    amount = Column(Numeric(20, 8), nullable=False)
    balance_after = Column(Numeric(20, 8), nullable=False)
    
    # Digital stamp
    signature = Column(String(255), nullable=True)  # Ed25519 signature (base64)
    public_key = Column(String(255), nullable=True)  # Public key used (base64)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User")
    asset = relationship("Asset")
    
    __table_args__ = (
        Index('idx_ledger_user', 'user_id', 'created_at'),
        Index('idx_ledger_reference', 'transaction_type', 'reference_id'),
    )


class AuditLog(Base):
    """Audit log for all sensitive actions"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # login, register, trade, withdraw, etc.
    
    # Context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Details
    details = Column(Text, nullable=True)  # JSON string
    
    success = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        Index('idx_audit_user', 'user_id', 'created_at'),
        Index('idx_audit_action', 'action', 'created_at'),
    )
