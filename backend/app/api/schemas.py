"""
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    totp_code: Optional[str] = None  # 6-digit 2FA code


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class User2FASetup(BaseModel):
    secret: str
    qr_code_url: str


class User2FAVerify(BaseModel):
    code: str


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    is_admin: bool
    is_2fa_enabled: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Asset Schemas
class AssetBase(BaseModel):
    symbol: str
    name: str
    is_crypto: bool = False
    is_fiat: bool = False
    decimals: int = 8


class AssetResponse(AssetBase):
    id: int
    is_active: bool
    min_withdrawal: Decimal
    withdrawal_fee: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True


# Market Schemas
class MarketBase(BaseModel):
    symbol: str
    base_asset_id: int
    quote_asset_id: int


class MarketResponse(MarketBase):
    id: int
    is_active: bool
    min_order_size: Decimal
    max_order_size: Optional[Decimal] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class MarketWithAssets(MarketResponse):
    base_asset: AssetResponse
    quote_asset: AssetResponse


# Balance Schemas
class BalanceResponse(BaseModel):
    id: int
    asset_id: int
    asset: AssetResponse
    available: Decimal
    reserved: Decimal
    total: Decimal
    
    @validator('total', always=True)
    def calculate_total(cls, v, values):
        return values.get('available', 0) + values.get('reserved', 0)
    
    class Config:
        from_attributes = True


# Order Schemas
class OrderCreate(BaseModel):
    market_id: int
    order_type: str  # "limit" or "market"
    side: str  # "buy" or "sell"
    price: Optional[Decimal] = None  # Required for limit orders
    quantity: Decimal = Field(..., gt=0)
    
    @validator('order_type')
    def validate_order_type(cls, v):
        if v not in ['limit', 'market']:
            raise ValueError('order_type must be "limit" or "market"')
        return v
    
    @validator('side')
    def validate_side(cls, v):
        if v not in ['buy', 'sell']:
            raise ValueError('side must be "buy" or "sell"')
        return v
    
    @validator('price')
    def validate_price(cls, v, values):
        if values.get('order_type') == 'limit' and v is None:
            raise ValueError('price is required for limit orders')
        if v is not None and v <= 0:
            raise ValueError('price must be positive')
        return v


class OrderResponse(BaseModel):
    id: int
    user_id: int
    market_id: int
    order_type: str
    side: str
    status: str
    price: Optional[Decimal]
    quantity: Decimal
    filled_quantity: Decimal
    fee_amount: Decimal
    created_at: datetime
    updated_at: datetime
    filled_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Trade Schemas
class TradeResponse(BaseModel):
    id: int
    order_id: int
    market_id: int
    price: Decimal
    quantity: Decimal
    buyer_id: int
    seller_id: int
    buyer_fee: Decimal
    seller_fee: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True


# Payment Schemas
class PaymentCreate(BaseModel):
    provider: str  # "stripe", "paypal", "coinbase", "bitpay"
    asset_id: int
    amount: Decimal = Field(..., gt=0)


class PaymentResponse(BaseModel):
    id: int
    user_id: int
    provider: str
    external_id: Optional[str]
    asset_id: int
    amount: Decimal
    status: str
    is_deposit: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Ledger Schemas
class LedgerEntryResponse(BaseModel):
    id: int
    transaction_type: str
    reference_id: int
    user_id: int
    asset_id: int
    amount: Decimal
    balance_after: Decimal
    signature: Optional[str]
    public_key: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Orderbook Schema
class OrderbookEntry(BaseModel):
    price: Decimal
    quantity: Decimal
    total: Decimal


class OrderbookResponse(BaseModel):
    market_id: int
    market_symbol: str
    bids: List[OrderbookEntry]  # Buy orders (descending price)
    asks: List[OrderbookEntry]  # Sell orders (ascending price)
    last_trade_price: Optional[Decimal] = None


# Admin Schemas
class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_admin: Optional[bool] = None
