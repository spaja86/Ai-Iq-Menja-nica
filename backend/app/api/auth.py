"""
Authentication API routes - login, register, 2FA, JWT tokens, email verification.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import security
from app.core.email import email_service
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


class VerifyEmail(BaseModel):
    token: str


class RequestPasswordReset(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str


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
    
    # Create verification token
    verification_token = security.create_access_token(
        {"sub": user.id, "type": "verification"},
        expires_delta=timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
    )
    
    # Send verification email
    email_service.send_verification_email(user.email, verification_token)
    
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


@router.post("/verify-email")
async def verify_email(
    data: VerifyEmail,
    db: Session = Depends(get_db)
):
    """Verify user email with token."""
    # Verify token
    payload = security.verify_token(data.token)
    
    if not payload or payload.get("type") != "verification":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        return {"message": "Email already verified"}
    
    # Mark user as verified
    user.is_verified = True
    db.commit()
    
    # Send welcome email
    email_service.send_welcome_email(user.email, user.full_name or "User")
    
    # Log verification
    audit_log = AuditLog(
        user_id=user.id,
        action="email_verified",
        resource_type="user",
        resource_id=str(user.id),
        status="success"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification(
    email: EmailStr,
    db: Session = Depends(get_db)
):
    """Resend verification email."""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a verification link has been sent"}
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Create verification token
    verification_token = security.create_access_token(
        {"sub": user.id, "type": "verification"},
        expires_delta=timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)
    )
    
    # Send verification email
    email_service.send_verification_email(user.email, verification_token)
    
    return {"message": "Verification email sent"}


@router.post("/request-password-reset")
async def request_password_reset(
    data: RequestPasswordReset,
    db: Session = Depends(get_db)
):
    """Request password reset email."""
    user = db.query(User).filter(User.email == data.email).first()
    
    # Don't reveal if email exists
    if not user:
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Create reset token
    reset_token = security.create_access_token(
        {"sub": user.id, "type": "password_reset"},
        expires_delta=timedelta(hours=settings.RESET_TOKEN_EXPIRE_HOURS)
    )
    
    # Send reset email
    email_service.send_password_reset_email(user.email, reset_token)
    
    # Log password reset request
    audit_log = AuditLog(
        user_id=user.id,
        action="password_reset_requested",
        resource_type="user",
        resource_id=str(user.id),
        status="success"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    data: ResetPassword,
    db: Session = Depends(get_db)
):
    """Reset password with token."""
    # Verify token
    payload = security.verify_token(data.token)
    
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = security.hash_password(data.new_password)
    db.commit()
    
    # Log password change
    audit_log = AuditLog(
        user_id=user.id,
        action="password_changed",
        resource_type="user",
        resource_id=str(user.id),
        status="success"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Password reset successfully"}
