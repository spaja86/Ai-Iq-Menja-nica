"""Application configuration settings."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    app_name: str = "Ai IQ Menjačnica"
    environment: str = "development"
    log_level: str = "info"
    
    # Domain
    public_base_url: str = "http://localhost:7777"
    domain: str = "localhost"
    
    # Database
    database_url: str = "postgresql+asyncpg://spaja:password@localhost:5432/spaja"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Security
    jwt_secret_key: str = "dev_secret_key_change_in_production"
    ed25519_seed_b64: Optional[str] = None
    access_token_expire_minutes: int = 20
    refresh_token_expire_days: int = 14
    
    # Stripe
    stripe_api_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    
    # PayPal
    paypal_client_id: Optional[str] = None
    paypal_client_secret: Optional[str] = None
    paypal_env: str = "sandbox"
    
    # Email
    sendgrid_api_key: Optional[str] = None
    sendgrid_from_email: str = "noreply@localhost"
    
    # Monitoring
    sentry_dsn: Optional[str] = None
    
    # CORS
    cors_origins: str = "*"
    
    # Admin
    admin_email: str = "admin@localhost"
    admin_password: str = "admin"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
