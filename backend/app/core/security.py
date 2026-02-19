"""
Security utilities for authentication, encryption, and authorization.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
import pyotp
import secrets
from cryptography.fernet import Fernet
import hashlib

from app.core.config import settings


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Encryption for sensitive data
encryption_key = settings.SECRET_KEY.encode()[:32].ljust(32, b'0')
cipher_suite = Fernet(Fernet.generate_key())


class SecurityManager:
    """Centralized security operations."""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """Create a JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def generate_2fa_secret() -> str:
        """Generate a TOTP secret for 2FA."""
        return pyotp.random_base32()
    
    @staticmethod
    def verify_2fa_token(secret: str, token: str) -> bool:
        """Verify a TOTP token."""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)
    
    @staticmethod
    def get_2fa_qr_uri(secret: str, email: str) -> str:
        """Get QR code URI for 2FA setup."""
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=email, issuer_name=settings.APP_NAME)
    
    @staticmethod
    def encrypt_data(data: str) -> str:
        """Encrypt sensitive data."""
        return cipher_suite.encrypt(data.encode()).decode()
    
    @staticmethod
    def decrypt_data(encrypted_data: str) -> str:
        """Decrypt sensitive data."""
        return cipher_suite.decrypt(encrypted_data.encode()).decode()
    
    @staticmethod
    def generate_api_key() -> str:
        """Generate a secure API key."""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def hash_api_key(api_key: str) -> str:
        """Hash an API key for storage."""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    @staticmethod
    def generate_verification_code() -> str:
        """Generate a 6-digit verification code."""
        return str(secrets.randbelow(1000000)).zfill(6)


# Global security manager instance
security = SecurityManager()
