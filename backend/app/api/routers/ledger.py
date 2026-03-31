"""
Ledger router - handles transaction stamps with Ed25519 signatures and QR codes
Provides public verification of transaction authenticity
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import json
import base64
from io import BytesIO
from datetime import datetime

from app.db.session import get_db
from app.db.models import LedgerEntry, User, Asset, Trade, Payment
from app.api.schemas import LedgerEntryResponse
from app.core.security import get_signer
import qrcode
from PIL import Image, ImageDraw, ImageFont

router = APIRouter(prefix="/ledger", tags=["ledger"])


def create_transaction_stamp(
    ledger_entry: LedgerEntry,
    db: Session
) -> LedgerEntry:
    """
    Create digital stamp for a ledger entry
    
    Generates Ed25519 signature and stores public key
    
    Args:
        ledger_entry: LedgerEntry to stamp
        db: Database session
    
    Returns:
        Updated ledger entry with signature
    """
    # Get signer
    signer = get_signer()
    
    # Create message to sign
    message_data = {
        "id": ledger_entry.id,
        "type": ledger_entry.transaction_type,
        "reference_id": ledger_entry.reference_id,
        "user_id": ledger_entry.user_id,
        "asset_id": ledger_entry.asset_id,
        "amount": str(ledger_entry.amount),
        "balance_after": str(ledger_entry.balance_after),
        "timestamp": ledger_entry.created_at.isoformat()
    }
    
    message = json.dumps(message_data, sort_keys=True).encode('utf-8')
    
    # Sign message
    signature = signer.sign(message)
    signature_b64 = base64.b64encode(signature).decode('utf-8')
    
    # Get public key
    public_key = signer.get_public_key()
    
    # Update ledger entry
    ledger_entry.signature = signature_b64
    ledger_entry.public_key = public_key
    
    db.commit()
    
    return ledger_entry


def generate_stamp_qr(
    ledger_entry: LedgerEntry,
    asset: Asset,
    format: str = "png",
    theme: str = "light"
) -> BytesIO:
    """
    Generate QR code for transaction stamp
    
    Args:
        ledger_entry: LedgerEntry with signature
        asset: Asset for the transaction
        format: Image format (png or jpeg)
        theme: Color theme (light or dark)
    
    Returns:
        BytesIO buffer containing image
    """
    # Create verification URL
    verification_data = {
        "id": ledger_entry.id,
        "signature": ledger_entry.signature,
        "public_key": ledger_entry.public_key,
        "amount": str(ledger_entry.amount),
        "asset": asset.symbol,
        "timestamp": ledger_entry.created_at.isoformat()
    }
    
    verification_url = f"https://aiiq.exchange/verify/{ledger_entry.id}"
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    
    qr.add_data(verification_url)
    qr.make(fit=True)
    
    # Create image
    if theme == "dark":
        fill_color = "white"
        back_color = "black"
    else:
        fill_color = "black"
        back_color = "white"
    
    img = qr.make_image(fill_color=fill_color, back_color=back_color)
    
    # Add text below QR code
    img_with_text = Image.new('RGB', (img.size[0], img.size[1] + 100), back_color)
    img_with_text.paste(img, (0, 0))
    
    draw = ImageDraw.Draw(img_with_text)
    
    # Add text
    text_lines = [
        f"Transaction ID: {ledger_entry.id}",
        f"Amount: {ledger_entry.amount} {asset.symbol}",
        f"Date: {ledger_entry.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
        "Digitally signed and verified"
    ]
    
    y_offset = img.size[1] + 10
    for line in text_lines:
        # Simple text drawing (in production, use proper font)
        draw.text((10, y_offset), line, fill=fill_color)
        y_offset += 20
    
    # Save to buffer
    buffer = BytesIO()
    img_with_text.save(buffer, format=format.upper())
    buffer.seek(0)
    
    return buffer


@router.get("/entries/{entry_id}", response_model=LedgerEntryResponse)
def get_ledger_entry(
    entry_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific ledger entry
    
    Returns transaction details with digital signature
    """
    entry = db.query(LedgerEntry).filter(LedgerEntry.id == entry_id).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ledger entry not found"
        )
    
    return entry


@router.get("/entries/{entry_id}/qr")
def get_ledger_qr(
    entry_id: int,
    format: str = "png",
    theme: str = "light",
    db: Session = Depends(get_db)
):
    """
    Get QR code for ledger entry
    
    Args:
        entry_id: Ledger entry ID
        format: Image format (png or jpeg)
        theme: Color theme (light or dark)
    
    Returns:
        QR code image
    """
    entry = db.query(LedgerEntry).filter(LedgerEntry.id == entry_id).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ledger entry not found"
        )
    
    asset = db.query(Asset).filter(Asset.id == entry.asset_id).first()
    
    # Generate QR code
    qr_buffer = generate_stamp_qr(entry, asset, format, theme)
    
    media_type = f"image/{format}"
    
    return StreamingResponse(qr_buffer, media_type=media_type)


@router.get("/verify/{entry_id}")
def verify_ledger_entry(
    entry_id: int,
    db: Session = Depends(get_db)
):
    """
    Public verification endpoint for ledger entries
    
    Verifies Ed25519 signature and returns transaction details
    
    Returns:
        Verification result with transaction details
    """
    entry = db.query(LedgerEntry).filter(LedgerEntry.id == entry_id).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ledger entry not found"
        )
    
    if not entry.signature or not entry.public_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Entry has no digital signature"
        )
    
    # Reconstruct message
    message_data = {
        "id": entry.id,
        "type": entry.transaction_type,
        "reference_id": entry.reference_id,
        "user_id": entry.user_id,
        "asset_id": entry.asset_id,
        "amount": str(entry.amount),
        "balance_after": str(entry.balance_after),
        "timestamp": entry.created_at.isoformat()
    }
    
    message = json.dumps(message_data, sort_keys=True).encode('utf-8')
    
    # Verify signature
    from app.core.security import Ed25519Signer
    
    signature = base64.b64decode(entry.signature)
    is_valid = Ed25519Signer.verify_signature(
        message,
        signature,
        entry.public_key
    )
    
    # Get asset details
    asset = db.query(Asset).filter(Asset.id == entry.asset_id).first()
    
    return {
        "valid": is_valid,
        "entry_id": entry.id,
        "transaction_type": entry.transaction_type,
        "amount": str(entry.amount),
        "asset": asset.symbol if asset else "Unknown",
        "timestamp": entry.created_at.isoformat(),
        "signature": entry.signature,
        "public_key": entry.public_key,
        "message": "Transaction signature is valid" if is_valid else "Invalid signature"
    }


@router.get("/public-key")
def get_public_key():
    """
    Get the exchange's public Ed25519 key
    
    This key can be used to verify transaction signatures
    """
    signer = get_signer()
    
    return {
        "public_key": signer.get_public_key(),
        "algorithm": "Ed25519",
        "usage": "Transaction signature verification"
    }
