from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.gzip import GZipMiddleware
import logging.config
from app.core.config import settings
from app.core.logging import LOGGING_CONFIG
from app.api import auth, trading, wallet, payments, admin, websocket
from app.db.database import engine, Base

# Setup logging
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Ai IQ Menjačnica API",
    description="Professional crypto exchange platform",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json"
)

# Security middleware
if settings.environment == "prod":
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=["xn--aiiqmenjanica-xvb.com", "*.xn--aiiqmenjanica-xvb.com"]
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://xn--aiiqmenjanica-xvb.com",
        "https://www.xn--aiiqmenjanica-xvb.com",
    ] if settings.environment == "prod" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=3600,
)

# Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(trading.router, prefix="/api/v1/trading", tags=["trading"])
app.include_router(wallet.router, prefix="/api/v1/wallet", tags=["wallet"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(websocket.router, prefix="/ws", tags=["websocket"])

@app.on_event("startup")
async def startup():
    logger.info("✅ Ai IQ Menjačnica API starting up...")
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Initialize connections
    pass

@app.on_event("shutdown")
async def shutdown():
    logger.info("🛑 Ai IQ Menjačnica API shutting down...")
    # Close connections
    pass

@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "environment": settings.environment
    }

@app.get("/")
async def root():
    return {
        "message": "Ai IQ Menjačnica API",
        "docs": "/api/v1/docs",
        "status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=7777,
        workers=4,
        reload=settings.environment != "prod"
    )
