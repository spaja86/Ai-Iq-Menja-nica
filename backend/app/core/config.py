"""
Core configuration settings for Ai IQ Menjačnica Exchange Platform
Manages environment variables and application settings
"""

from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, validator
import secrets


class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # App Info
    APP_NAME: str = "Ai IQ Menjačnica"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Ed25519 Signing (for ledger stamps)
    ED25519_SEED_B64: Optional[str] = None  # Base64 encoded 32-byte seed
    
    # Database
    DATABASE_URL: str = "sqlite:///./exchange.db"
    DATABASE_ECHO: bool = False
    
    # PostgreSQL (production)
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    POSTGRES_PORT: int = 5432
    
    @property
    def postgres_url(self) -> Optional[str]:
        if all([self.POSTGRES_SERVER, self.POSTGRES_USER, self.POSTGRES_PASSWORD, self.POSTGRES_DB]):
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return None
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    LOGIN_RATE_LIMIT: str = "10/minute"
    REGISTER_RATE_LIMIT: str = "5/minute"
    API_RATE_LIMIT: str = "100/minute"
    
    # Payment Providers
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    
    PAYPAL_MODE: str = "sandbox"  # sandbox or live
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    
    COINBASE_API_KEY: Optional[str] = None
    COINBASE_WEBHOOK_SECRET: Optional[str] = None
    
    BITPAY_API_TOKEN: Optional[str] = None
    BITPAY_ENVIRONMENT: str = "test"  # test or prod
    
    # Blockchain Nodes
    BITCOIN_RPC_USER: Optional[str] = None
    BITCOIN_RPC_PASSWORD: Optional[str] = None
    BITCOIN_RPC_HOST: str = "localhost"
    BITCOIN_RPC_PORT: int = 8332
    
    ETHEREUM_RPC_URL: Optional[str] = None
    
    # Trading Fees
    MAKER_FEE_PERCENT: float = 0.1  # 0.1%
    TAKER_FEE_PERCENT: float = 0.2  # 0.2%
    
    # Email (optional, for notifications)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: str = "noreply@aiiqmenjacnica.com"
    
    # Admin
    ADMIN_EMAIL: str = "spajicn@yahoo.com"
    ADMIN_PASSWORD: Optional[str] = None  # Set on first run
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )


# Global settings instance
settings = Settings()
