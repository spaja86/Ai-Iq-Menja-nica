"""
Payment router - handles payment webhooks and deposit/withdrawal requests
Supports Stripe, PayPal, Coinbase Commerce, and BitPay
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status, Header
from sqlalchemy.orm import Session
from typing import Optional
import json
import hmac
import hashlib

from app.db.session import get_db
from app.db.models import Payment, User, Asset, Balance, WebhookEvent, PaymentProvider, PaymentStatus, AuditLog
from app.api.schemas import PaymentCreate, PaymentResponse
from app.core.config import settings
from decimal import Decimal

router = APIRouter(prefix="/payments", tags=["payments"])


def log_audit(db: Session, user_id: Optional[int], action: str, success: bool, details: str = None):
    """Helper to log audit events"""
    log = AuditLog(
        user_id=user_id,
        action=action,
        success=success,
        details=details
    )
    db.add(log)
    db.commit()


def check_webhook_duplicate(db: Session, provider: str, event_id: str) -> bool:
    """
    Check if webhook event was already processed (idempotency)
    
    Returns:
        True if event is duplicate, False otherwise
    """
    existing = db.query(WebhookEvent).filter(
        WebhookEvent.provider == provider,
        WebhookEvent.event_id == event_id
    ).first()
    
    return existing is not None


def mark_webhook_processed(db: Session, provider: str, event_id: str, event_type: str, payload: dict):
    """Mark webhook event as processed"""
    from datetime import datetime
    
    webhook_event = WebhookEvent(
        provider=provider,
        event_id=event_id,
        event_type=event_type,
        processed=True,
        processed_at=datetime.utcnow(),
        payload=json.dumps(payload)
    )
    db.add(webhook_event)
    db.commit()


# Stripe Webhooks
@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Stripe webhook handler
    
    Handles payment_intent.succeeded events
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe not configured"
        )
    
    # Get raw body
    payload = await request.body()
    
    # Verify signature
    try:
        import stripe
        event = stripe.Webhook.construct_event(
            payload,
            stripe_signature,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Check for duplicate
    if check_webhook_duplicate(db, "stripe", event['id']):
        return {"status": "duplicate"}
    
    # Handle event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        # Extract metadata
        user_id = payment_intent.get('metadata', {}).get('user_id')
        asset_symbol = payment_intent.get('metadata', {}).get('asset', 'USD')
        
        if not user_id:
            log_audit(db, None, "stripe_webhook", False, "Missing user_id in metadata")
            raise HTTPException(status_code=400, detail="Missing user_id")
        
        user_id = int(user_id)
        
        # Find asset
        asset = db.query(Asset).filter(Asset.symbol == asset_symbol).first()
        if not asset:
            raise HTTPException(status_code=400, detail=f"Asset {asset_symbol} not found")
        
        # Create payment record
        amount = Decimal(payment_intent['amount']) / Decimal('100')  # Stripe uses cents
        
        payment = Payment(
            user_id=user_id,
            provider=PaymentProvider.STRIPE,
            external_id=payment_intent['id'],
            asset_id=asset.id,
            amount=amount,
            status=PaymentStatus.COMPLETED,
            is_deposit=True,
            metadata=json.dumps(payment_intent)
        )
        db.add(payment)
        
        # Credit user balance
        balance = db.query(Balance).filter(
            Balance.user_id == user_id,
            Balance.asset_id == asset.id
        ).first()
        
        if not balance:
            balance = Balance(user_id=user_id, asset_id=asset.id, available=Decimal('0'), reserved=Decimal('0'))
            db.add(balance)
            db.flush()
        
        balance.available += amount
        
        db.commit()
        
        # Mark webhook as processed
        mark_webhook_processed(db, "stripe", event['id'], event['type'], event)
        
        log_audit(db, user_id, "stripe_deposit", True, f"Deposited {amount} {asset_symbol}")
    
    return {"status": "success"}


# PayPal Webhooks
@router.post("/webhooks/paypal")
async def paypal_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    PayPal webhook handler
    
    Handles PAYMENT.CAPTURE.COMPLETED events
    """
    if not settings.PAYPAL_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PayPal not configured"
        )
    
    payload = await request.json()
    
    # Check for duplicate
    event_id = payload.get('id')
    if check_webhook_duplicate(db, "paypal", event_id):
        return {"status": "duplicate"}
    
    # Handle event
    event_type = payload.get('event_type')
    
    if event_type == 'PAYMENT.CAPTURE.COMPLETED':
        resource = payload.get('resource', {})
        
        # Extract details
        capture_id = resource.get('id')
        amount_data = resource.get('amount', {})
        amount = Decimal(amount_data.get('value', '0'))
        currency = amount_data.get('currency_code', 'USD')
        
        # Get user from custom_id
        custom_id = resource.get('custom_id')
        if not custom_id:
            raise HTTPException(status_code=400, detail="Missing custom_id")
        
        user_id = int(custom_id)
        
        # Find asset
        asset = db.query(Asset).filter(Asset.symbol == currency).first()
        if not asset:
            raise HTTPException(status_code=400, detail=f"Asset {currency} not found")
        
        # Create payment
        payment = Payment(
            user_id=user_id,
            provider=PaymentProvider.PAYPAL,
            external_id=capture_id,
            asset_id=asset.id,
            amount=amount,
            status=PaymentStatus.COMPLETED,
            is_deposit=True,
            metadata=json.dumps(payload)
        )
        db.add(payment)
        
        # Credit balance
        balance = db.query(Balance).filter(
            Balance.user_id == user_id,
            Balance.asset_id == asset.id
        ).first()
        
        if not balance:
            balance = Balance(user_id=user_id, asset_id=asset.id, available=Decimal('0'), reserved=Decimal('0'))
            db.add(balance)
            db.flush()
        
        balance.available += amount
        
        db.commit()
        
        mark_webhook_processed(db, "paypal", event_id, event_type, payload)
        log_audit(db, user_id, "paypal_deposit", True, f"Deposited {amount} {currency}")
    
    return {"status": "success"}


# Coinbase Commerce Webhooks
@router.post("/webhooks/coinbase")
async def coinbase_webhook(
    request: Request,
    x_cc_webhook_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Coinbase Commerce webhook handler
    
    Handles charge:confirmed events for crypto deposits
    """
    if not settings.COINBASE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Coinbase not configured"
        )
    
    payload = await request.body()
    
    # Verify signature
    computed_signature = hmac.new(
        settings.COINBASE_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(computed_signature, x_cc_webhook_signature or ""):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    event = json.loads(payload)
    
    # Check for duplicate
    event_id = event.get('id')
    if check_webhook_duplicate(db, "coinbase", event_id):
        return {"status": "duplicate"}
    
    # Handle event
    event_type = event.get('type')
    
    if event_type == 'charge:confirmed':
        charge = event.get('data', {})
        
        # Extract details
        charge_id = charge.get('id')
        metadata = charge.get('metadata', {})
        user_id = metadata.get('user_id')
        
        if not user_id:
            raise HTTPException(status_code=400, detail="Missing user_id")
        
        user_id = int(user_id)
        
        # Get payment details
        pricing = charge.get('pricing', {})
        local_amount = pricing.get('local', {})
        amount = Decimal(local_amount.get('amount', '0'))
        currency = local_amount.get('currency', 'USD')
        
        # Find asset
        asset = db.query(Asset).filter(Asset.symbol == currency).first()
        if not asset:
            # Try crypto
            crypto_currency = charge.get('payments', [{}])[0].get('value', {}).get('crypto', {}).get('currency')
            asset = db.query(Asset).filter(Asset.symbol == crypto_currency).first()
        
        if not asset:
            raise HTTPException(status_code=400, detail="Asset not found")
        
        # Create payment
        payment = Payment(
            user_id=user_id,
            provider=PaymentProvider.COINBASE,
            external_id=charge_id,
            asset_id=asset.id,
            amount=amount,
            status=PaymentStatus.COMPLETED,
            is_deposit=True,
            metadata=json.dumps(event)
        )
        db.add(payment)
        
        # Credit balance
        balance = db.query(Balance).filter(
            Balance.user_id == user_id,
            Balance.asset_id == asset.id
        ).first()
        
        if not balance:
            balance = Balance(user_id=user_id, asset_id=asset.id, available=Decimal('0'), reserved=Decimal('0'))
            db.add(balance)
            db.flush()
        
        balance.available += amount
        
        db.commit()
        
        mark_webhook_processed(db, "coinbase", event_id, event_type, event)
        log_audit(db, user_id, "coinbase_deposit", True, f"Deposited {amount} {asset.symbol}")
    
    return {"status": "success"}


# BitPay Webhooks
@router.post("/webhooks/bitpay")
async def bitpay_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    BitPay webhook handler
    
    Handles invoice confirmed events
    """
    if not settings.BITPAY_API_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="BitPay not configured"
        )
    
    payload = await request.json()
    
    event_id = payload.get('id')
    
    # Check for duplicate
    if check_webhook_duplicate(db, "bitpay", event_id):
        return {"status": "duplicate"}
    
    # Handle event
    status_event = payload.get('event', {}).get('name')
    
    if status_event == 'invoice_confirmed':
        invoice = payload.get('data')
        invoice_id = invoice.get('id')
        
        # Extract user from posData
        pos_data = json.loads(invoice.get('posData', '{}'))
        user_id = pos_data.get('user_id')
        
        if not user_id:
            raise HTTPException(status_code=400, detail="Missing user_id")
        
        user_id = int(user_id)
        
        # Get amount
        amount = Decimal(invoice.get('price', '0'))
        currency = invoice.get('currency', 'USD')
        
        # Find asset
        asset = db.query(Asset).filter(Asset.symbol == currency).first()
        if not asset:
            raise HTTPException(status_code=400, detail=f"Asset {currency} not found")
        
        # Create payment
        payment = Payment(
            user_id=user_id,
            provider=PaymentProvider.BITPAY,
            external_id=invoice_id,
            asset_id=asset.id,
            amount=amount,
            status=PaymentStatus.COMPLETED,
            is_deposit=True,
            metadata=json.dumps(payload)
        )
        db.add(payment)
        
        # Credit balance
        balance = db.query(Balance).filter(
            Balance.user_id == user_id,
            Balance.asset_id == asset.id
        ).first()
        
        if not balance:
            balance = Balance(user_id=user_id, asset_id=asset.id, available=Decimal('0'), reserved=Decimal('0'))
            db.add(balance)
            db.flush()
        
        balance.available += amount
        
        db.commit()
        
        mark_webhook_processed(db, "bitpay", event_id, status_event, payload)
        log_audit(db, user_id, "bitpay_deposit", True, f"Deposited {amount} {currency}")
    
    return {"status": "success"}
