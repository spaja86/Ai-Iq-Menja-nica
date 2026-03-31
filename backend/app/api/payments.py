"""
Payment API routes - deposits, withdrawals, Stripe/PayPal integration.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models import Payment, PaymentMethod, PaymentStatus, User
from app.services.payment_service import PaymentService
from app.api.auth import get_current_user


router = APIRouter(prefix="/api/payments", tags=["payments"])


# Pydantic models
class DepositRequest(BaseModel):
    amount: float
    currency: str
    payment_method: PaymentMethod


class WithdrawalRequest(BaseModel):
    amount: float
    currency: str
    payment_method: PaymentMethod


class PaymentResponse(BaseModel):
    id: int
    payment_method: str
    payment_type: str
    amount: float
    currency: str
    status: str
    provider_transaction_id: str | None
    created_at: str
    
    class Config:
        from_attributes = True


@router.post("/deposit", response_model=PaymentResponse)
async def create_deposit(
    deposit_data: DepositRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a fiat deposit."""
    if deposit_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deposit amount must be positive"
        )
    
    payment_service = PaymentService(db)
    payment = payment_service.create_deposit(
        user_id=current_user.id,
        amount=deposit_data.amount,
        currency=deposit_data.currency,
        payment_method=deposit_data.payment_method
    )
    
    return PaymentResponse(
        id=payment.id,
        payment_method=payment.payment_method.value,
        payment_type=payment.payment_type,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status.value,
        provider_transaction_id=payment.provider_transaction_id,
        created_at=payment.created_at.isoformat()
    )


@router.post("/withdraw", response_model=PaymentResponse)
async def create_withdrawal(
    withdrawal_data: WithdrawalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a fiat withdrawal."""
    if withdrawal_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Withdrawal amount must be positive"
        )
    
    payment_service = PaymentService(db)
    payment = payment_service.create_withdrawal(
        user_id=current_user.id,
        amount=withdrawal_data.amount,
        currency=withdrawal_data.currency,
        payment_method=withdrawal_data.payment_method
    )
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds"
        )
    
    return PaymentResponse(
        id=payment.id,
        payment_method=payment.payment_method.value,
        payment_type=payment.payment_type,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status.value,
        provider_transaction_id=payment.provider_transaction_id,
        created_at=payment.created_at.isoformat()
    )


@router.get("/history", response_model=List[PaymentResponse])
async def get_payment_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment history for current user."""
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).limit(limit).all()
    
    return [
        PaymentResponse(
            id=payment.id,
            payment_method=payment.payment_method.value,
            payment_type=payment.payment_type,
            amount=payment.amount,
            currency=payment.currency,
            status=payment.status.value,
            provider_transaction_id=payment.provider_transaction_id,
            created_at=payment.created_at.isoformat()
        )
        for payment in payments
    ]


@router.post("/webhooks/stripe")
async def stripe_webhook(
    # In production, verify stripe signature
    db: Session = Depends(get_db)
):
    """Handle Stripe payment webhooks."""
    # Placeholder for Stripe webhook handling
    # In production: verify signature, process event, update payment status
    return {"status": "received"}


@router.post("/webhooks/paypal")
async def paypal_webhook(
    db: Session = Depends(get_db)
):
    """Handle PayPal payment webhooks."""
    # Placeholder for PayPal webhook handling
    return {"status": "received"}
