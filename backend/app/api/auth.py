"""
Authentication API routes - login, register, 2FA, JWT tokens.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import security
from app.models import User, UserRole, AuditLog
from app.core.config import settings


router = APIRouter(prefix="/api/auth", tags=["authentication"])
security_scheme = HTTPBearer()


# Pydantic models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone_number: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    totp_code: Optional[str] = None


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class Enable2FA(BaseModel):
    totp_code: str


class Verify2FA(BaseModel):
    totp_code: str


# Dependency for getting current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token."""
    token = credentials.credentials
    payload = security.verify_token(token)
    
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user


@router.post("/register", response_model=Token)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user account."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        hashed_password=security.hash_password(user_data.password),
        full_name=user_data.full_name,
        phone_number=user_data.phone_number,
        role=UserRole.USER
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Log registration
    audit_log = AuditLog(
        user_id=user.id,
        action="user_registered",
        resource_type="user",
        resource_id=str(user.id),
        status="success"
    )
    db.add(audit_log)
    db.commit()
    
    # Create tokens
    access_token = security.create_access_token({"sub": user.id})
    refresh_token = security.create_refresh_token({"sub": user.id})
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Authenticate user and return JWT tokens."""
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not security.verify_password(credentials.password, user.hashed_password):
        # Log failed attempt
        audit_log = AuditLog(
            action="login_failed",
            details=f"Failed login attempt for {credentials.email}",
            status="failure"
        )
        db.add(audit_log)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Verify 2FA if enabled
    if user.two_fa_enabled:
        if not credentials.totp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="2FA code required"
            )
        
        if not security.verify_2fa_token(user.two_fa_secret, credentials.totp_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid 2FA code"
            )
    
    # Update last login
    user.last_login = datetime.utcnow()
    
    # Log successful login
    audit_log = AuditLog(
        user_id=user.id,
        action="user_login",
        resource_type="user",
        resource_id=str(user.id),
        status="success"
    )
    db.add(audit_log)
    db.commit()
    
    # Create tokens
    access_token = security.create_access_token({"sub": user.id})
    refresh_token = security.create_refresh_token({"sub": user.id})
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone_number": current_user.phone_number,
        "role": current_user.role.value,
        "kyc_status": current_user.kyc_status.value,
        "two_fa_enabled": current_user.two_fa_enabled,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at
    }


@router.post("/2fa/enable")
async def enable_2fa(
    data: Enable2FA,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable 2FA for current user."""
    if current_user.two_fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA already enabled"
        )
    
    # Generate secret if not exists
    if not current_user.two_fa_secret:
        current_user.two_fa_secret = security.generate_2fa_secret()
    
    # Verify the provided code
    if not security.verify_2fa_token(current_user.two_fa_secret, data.totp_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code"
        )
    
    # Enable 2FA
    current_user.two_fa_enabled = True
    db.commit()
    
    return {"message": "2FA enabled successfully"}


@router.get("/2fa/setup")
async def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get 2FA setup information (QR code URI)."""
    if current_user.two_fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA already enabled"
        )
    
    # Generate secret if not exists
    if not current_user.two_fa_secret:
        current_user.two_fa_secret = security.generate_2fa_secret()
        db.commit()
    
    # Get QR code URI
    qr_uri = security.get_2fa_qr_uri(current_user.two_fa_secret, current_user.email)
    
    return {
        "secret": current_user.two_fa_secret,
        "qr_uri": qr_uri
    }


@router.post("/2fa/disable")
async def disable_2fa(
    data: Verify2FA,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable 2FA for current user."""
    if not current_user.two_fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not enabled"
        )
    
    # Verify code before disabling
    if not security.verify_2fa_token(current_user.two_fa_secret, data.totp_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code"
        )
    
    # Disable 2FA
    current_user.two_fa_enabled = False
    current_user.two_fa_secret = None
    db.commit()
    
    return {"message": "2FA disabled successfully"}
