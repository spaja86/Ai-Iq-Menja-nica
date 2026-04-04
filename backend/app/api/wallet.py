"""Wallet API endpoints."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from decimal import Decimal

router = APIRouter()


class Balance(BaseModel):
    currency: str
    available: Decimal
    locked: Decimal


class WalletAddress(BaseModel):
    currency: str
    address: str
    network: str


@router.get("/balances", response_model=List[Balance])
async def get_balances():
    """Get user's wallet balances."""
    # TODO: Implement balance retrieval logic
    return [
        {"currency": "BTC", "available": Decimal("1.5"), "locked": Decimal("0.1")},
        {"currency": "ETH", "available": Decimal("10.0"), "locked": Decimal("0.5")},
    ]


@router.get("/addresses", response_model=List[WalletAddress])
async def get_addresses():
    """Get deposit addresses."""
    # TODO: Implement address generation logic
    return [
        {"currency": "BTC", "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "network": "bitcoin"},
        {"currency": "ETH", "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "network": "ethereum"},
    ]


@router.post("/withdraw")
async def withdraw(currency: str, amount: Decimal, address: str):
    """Withdraw funds."""
    # TODO: Implement withdrawal logic
    return {
        "message": "Withdrawal request submitted",
        "currency": currency,
        "amount": amount,
        "address": address
    }
