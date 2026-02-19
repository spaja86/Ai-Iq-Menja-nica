"""
Wallet API routes - balance, transactions, deposits, withdrawals.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models import Wallet, Transaction, User
from app.services.wallet_service import WalletService
from app.api.auth import get_current_user


router = APIRouter(prefix="/api/wallet", tags=["wallet"])


# Pydantic models
class WalletResponse(BaseModel):
    id: int
    currency: str
    balance: float
    locked_balance: float
    available_balance: float
    
    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: int
    transaction_type: str
    amount: float
    balance_after: float
    status: str
    description: str | None
    created_at: str
    
    class Config:
        from_attributes = True


@router.get("/balances", response_model=List[WalletResponse])
async def get_balances(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all wallet balances for current user."""
    wallet_service = WalletService(db)
    wallets = wallet_service.get_user_wallets(current_user.id)
    
    return [
        WalletResponse(
            id=wallet.id,
            currency=wallet.currency,
            balance=wallet.balance,
            locked_balance=wallet.locked_balance,
            available_balance=wallet.available_balance
        )
        for wallet in wallets
    ]


@router.get("/balance/{currency}", response_model=WalletResponse)
async def get_balance(
    currency: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get wallet balance for specific currency."""
    wallet_service = WalletService(db)
    wallet = wallet_service.get_or_create_wallet(current_user.id, currency)
    
    return WalletResponse(
        id=wallet.id,
        currency=wallet.currency,
        balance=wallet.balance,
        locked_balance=wallet.locked_balance,
        available_balance=wallet.available_balance
    )


@router.get("/transactions/{currency}", response_model=List[TransactionResponse])
async def get_transactions(
    currency: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transaction history for a currency."""
    wallet = db.query(Wallet).filter(
        Wallet.user_id == current_user.id,
        Wallet.currency == currency
    ).first()
    
    if not wallet:
        return []
    
    transactions = db.query(Transaction).filter(
        Transaction.wallet_id == wallet.id
    ).order_by(Transaction.created_at.desc()).limit(limit).all()
    
    return [
        TransactionResponse(
            id=tx.id,
            transaction_type=tx.transaction_type,
            amount=tx.amount,
            balance_after=tx.balance_after,
            status=tx.status,
            description=tx.description,
            created_at=tx.created_at.isoformat()
        )
        for tx in transactions
    ]


@router.get("/addresses")
async def get_deposit_addresses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get deposit addresses for all cryptocurrencies."""
    # In production, generate actual blockchain addresses
    wallets = db.query(Wallet).filter(
        Wallet.user_id == current_user.id,
        Wallet.currency.in_(["BTC", "ETH"])
    ).all()
    
    addresses = {}
    for wallet in wallets:
        if wallet.address:
            addresses[wallet.currency] = wallet.address
        else:
            # Generate new address (placeholder)
            addresses[wallet.currency] = f"generated_{wallet.currency.lower()}_address_{wallet.id}"
    
    return {"addresses": addresses}
