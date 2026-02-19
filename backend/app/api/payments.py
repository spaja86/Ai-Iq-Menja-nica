"""Payment API endpoints."""
from fastapi import APIRouter, Request
from pydantic import BaseModel
from decimal import Decimal

router = APIRouter()


class PaymentRequest(BaseModel):
    amount: Decimal
    currency: str
    method: str  # stripe, paypal, etc


@router.post("/deposit")
async def create_deposit(request: PaymentRequest):
    """Create a deposit."""
    # TODO: Implement deposit logic with payment providers
    return {
        "payment_id": "pay_123",
        "amount": request.amount,
        "currency": request.currency,
        "status": "pending"
    }


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks."""
    # TODO: Implement Stripe webhook handling
    return {"status": "received"}


@router.post("/paypal/webhook")
async def paypal_webhook(request: Request):
    """Handle PayPal webhooks."""
    # TODO: Implement PayPal webhook handling
    return {"status": "received"}


@router.get("/transactions")
async def get_transactions():
    """Get payment transactions."""
    # TODO: Implement transaction listing
    return {"transactions": []}
