"""
Authentication router - handles registration, login, 2FA, and token refresh
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import base64

from app.db.session import get_db
from app.db.models import User, AuditLog
from app.api.schemas import UserRegister, UserLogin, Token, TokenRefresh, User2FASetup, User2FAVerify, UserResponse
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_totp_secret,
    verify_totp,
    generate_totp_qr_code
)

router = APIRouter(prefix="/auth", tags=["auth"])


def log_audit(db: Session, user_id: int, action: str, success: bool, details: str = None):
    """Helper to log audit events"""
    log = AuditLog(
        user_id=user_id,
        action=action,
        success=success,
        details=details
    )
    db.add(log)
    db.commit()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user
    
    - Email must be unique
    - Password must be at least 8 characters
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        is_active=True,
        is_verified=False  # Require email verification in production
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log registration
    log_audit(db, new_user.id, "register", True, f"User registered: {user_data.email}")
    
    return new_user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password
    
    - Returns access and refresh tokens
    - Requires 2FA code if enabled
    """
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        log_audit(db, None, "login", False, f"Failed login attempt: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        log_audit(db, user.id, "login", False, "Invalid password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if account is active
    if not user.is_active:
        log_audit(db, user.id, "login", False, "Account inactive")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Verify 2FA if enabled
    if user.is_2fa_enabled:
        if not credentials.totp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA code required"
            )
        
        if not verify_totp(user.totp_secret, credentials.totp_code):
            log_audit(db, user.id, "login", False, "Invalid 2FA code")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid 2FA code"
            )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create tokens
    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Log successful login
    log_audit(db, user.id, "login", True, "Successful login")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token
    """
    # Decode refresh token
    payload = decode_token(token_data.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/2fa/setup", response_model=User2FASetup)
def setup_2fa(db: Session = Depends(get_db), current_user: User = None):
    """
    Setup 2FA for user account
    
    Returns:
        - TOTP secret
        - QR code as base64 image
    """
    # In production, use proper authentication dependency
    # For now, using a placeholder
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    # Generate TOTP secret
    secret = generate_totp_secret()
    
    # Generate QR code
    qr_buffer = generate_totp_qr_code(secret, current_user.email)
    qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode('utf-8')
    
    # Save secret (not enabled yet)
    current_user.totp_secret = secret
    db.commit()
    
    return {
        "secret": secret,
        "qr_code_url": f"data:image/png;base64,{qr_base64}"
    }


@router.post("/2fa/verify")
def verify_2fa(verify_data: User2FAVerify, db: Session = Depends(get_db), current_user: User = None):
    """
    Verify and enable 2FA
    """
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    if not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not set up. Call /2fa/setup first"
        )
    
    # Verify code
    if not verify_totp(current_user.totp_secret, verify_data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code"
        )
    
    # Enable 2FA
    current_user.is_2fa_enabled = True
    db.commit()
    
    log_audit(db, current_user.id, "2fa_enabled", True, "2FA enabled")
    
    return {"message": "2FA enabled successfully"}


@router.post("/2fa/disable")
def disable_2fa(verify_data: User2FAVerify, db: Session = Depends(get_db), current_user: User = None):
    """
    Disable 2FA (requires verification code)
    """
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    if not current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled"
        )
    
    # Verify code
    if not verify_totp(current_user.totp_secret, verify_data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code"
        )
    
    # Disable 2FA
    current_user.is_2fa_enabled = False
    current_user.totp_secret = None
    db.commit()
    
    log_audit(db, current_user.id, "2fa_disabled", True, "2FA disabled")
    
    return {"message": "2FA disabled successfully"}
