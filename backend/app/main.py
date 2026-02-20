"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.config import settings
from app.core.database import init_db
from app.api import auth, trading, wallet, payments, admin, websocket, codes


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise-grade cryptocurrency exchange platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Trusted host middleware (production security)
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )


# Include routers
app.include_router(auth.router)
app.include_router(trading.router)
app.include_router(wallet.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(websocket.router)
app.include_router(codes.router)


# Prometheus metrics (if enabled)
if settings.PROMETHEUS_ENABLED:
    Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    # Initialize database tables
    # init_db()  # Uncomment when ready to create tables
    pass


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    pass


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


@app.get("/api/v1/info")
async def api_info():
    """API information endpoint."""
    return {
        "version": settings.APP_VERSION,
        "features": [
            "JWT Authentication",
            "2FA (TOTP)",
            "KYC/AML Verification",
            "Trading Engine",
            "Multi-Currency Wallets",
            "Payment Processing",
            "Real-time WebSocket Feeds",
            "Admin Dashboard"
        ],
        "trading_pairs": ["BTC/USD", "ETH/USD", "BTC/EUR", "ETH/EUR"],
        "supported_currencies": ["BTC", "ETH", "USD", "EUR"]
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
