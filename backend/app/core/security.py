"""
Security utilities for authentication, encryption, and digital signatures
Implements JWT, Argon2, TOTP 2FA, and Ed25519 signing
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets
import base64

from passlib.context import CryptContext
from jose import JWTError, jwt
import pyotp
import qrcode
from io import BytesIO
import nacl.signing
import nacl.encoding

from app.core.config import settings


# Password hashing with Argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password using Argon2"""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    
    Args:
        data: Payload to encode in the token
        expires_delta: Custom expiration time
    
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": secrets.token_urlsafe(16)  # JWT ID for token tracking
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token with longer expiration"""
    expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return create_access_token(data, expires_delta)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate JWT token
    
    Args:
        token: JWT token to decode
    
    Returns:
        Decoded payload or None if invalid
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


# TOTP 2FA Functions
def generate_totp_secret() -> str:
    """Generate a random TOTP secret"""
    return pyotp.random_base32()


def verify_totp(secret: str, code: str) -> bool:
    """
    Verify a TOTP code
    
    Args:
        secret: User's TOTP secret
        code: 6-digit code from authenticator app
    
    Returns:
        True if code is valid
    """
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)  # Allow 1 step before/after for clock skew


def generate_totp_qr_code(secret: str, email: str) -> BytesIO:
    """
    Generate QR code for TOTP setup
    
    Args:
        secret: TOTP secret
        email: User's email
    
    Returns:
        BytesIO object containing QR code image
    """
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=email,
        issuer_name=settings.APP_NAME
    )
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    
    return buffer


# Ed25519 Digital Signatures (for ledger stamps)
class Ed25519Signer:
    """Ed25519 signature manager for transaction stamps"""
    
    def __init__(self, seed_b64: Optional[str] = None):
        """
        Initialize signer with seed
        
        Args:
            seed_b64: Base64-encoded 32-byte seed (if None, generates new)
        """
        if seed_b64:
            seed = base64.b64decode(seed_b64)
        else:
            seed = secrets.token_bytes(32)
        
        self.signing_key = nacl.signing.SigningKey(seed)
        self.verify_key = self.signing_key.verify_key
    
    def sign(self, message: bytes) -> bytes:
        """
        Sign a message
        
        Args:
            message: Message to sign
        
        Returns:
            Signature bytes
        """
        signed = self.signing_key.sign(message)
        return signed.signature
    
    def get_public_key(self) -> str:
        """Get public key as base64 string"""
        return base64.b64encode(
            self.verify_key.encode()
        ).decode('utf-8')
    
    @staticmethod
    def verify_signature(message: bytes, signature: bytes, public_key_b64: str) -> bool:
        """
        Verify a signature
        
        Args:
            message: Original message
            signature: Signature to verify
            public_key_b64: Base64-encoded public key
        
        Returns:
            True if signature is valid
        """
        try:
            public_key_bytes = base64.b64decode(public_key_b64)
            verify_key = nacl.signing.VerifyKey(public_key_bytes)
            verify_key.verify(message, signature)
            return True
        except Exception:
            return False


# Global signer instance
_signer: Optional[Ed25519Signer] = None


def get_signer() -> Ed25519Signer:
    """Get or create global Ed25519 signer"""
    global _signer
    if _signer is None:
        _signer = Ed25519Signer(settings.ED25519_SEED_B64)
    return _signer


def generate_api_key() -> str:
    """Generate a random API key"""
    return secrets.token_urlsafe(32)
