"""
Bootstrap database with default data (assets, markets, admin user)
"""

from sqlalchemy.orm import Session
from app.db.models import Asset, Market, User
from app.core.security import get_password_hash
from app.core.config import settings


def create_default_assets(db: Session):
    """Create default assets (currencies)"""
    
    default_assets = [
        # Cryptocurrencies
        {"symbol": "BTC", "name": "Bitcoin", "is_crypto": True, "decimals": 8, "min_withdrawal": 0.0001, "withdrawal_fee": 0.0005},
        {"symbol": "ETH", "name": "Ethereum", "is_crypto": True, "decimals": 8, "min_withdrawal": 0.001, "withdrawal_fee": 0.005},
        {"symbol": "USDT", "name": "Tether", "is_crypto": True, "decimals": 2, "min_withdrawal": 10, "withdrawal_fee": 1},
        {"symbol": "USDC", "name": "USD Coin", "is_crypto": True, "decimals": 2, "min_withdrawal": 10, "withdrawal_fee": 1},
        
        # Fiat currencies
        {"symbol": "USD", "name": "US Dollar", "is_fiat": True, "decimals": 2, "min_withdrawal": 10, "withdrawal_fee": 2},
        {"symbol": "EUR", "name": "Euro", "is_fiat": True, "decimals": 2, "min_withdrawal": 10, "withdrawal_fee": 2},
        {"symbol": "RSD", "name": "Serbian Dinar", "is_fiat": True, "decimals": 2, "min_withdrawal": 1000, "withdrawal_fee": 100},
    ]
    
    for asset_data in default_assets:
        existing = db.query(Asset).filter(Asset.symbol == asset_data["symbol"]).first()
        if not existing:
            asset = Asset(**asset_data)
            db.add(asset)
    
    db.commit()


def create_default_markets(db: Session):
    """Create default trading markets"""
    
    # Get assets
    btc = db.query(Asset).filter(Asset.symbol == "BTC").first()
    eth = db.query(Asset).filter(Asset.symbol == "ETH").first()
    usdt = db.query(Asset).filter(Asset.symbol == "USDT").first()
    usd = db.query(Asset).filter(Asset.symbol == "USD").first()
    eur = db.query(Asset).filter(Asset.symbol == "EUR").first()
    rsd = db.query(Asset).filter(Asset.symbol == "RSD").first()
    
    if not all([btc, eth, usdt, usd, eur, rsd]):
        return
    
    default_markets = [
        # Crypto/USD pairs
        {"base_asset_id": btc.id, "quote_asset_id": usd.id, "symbol": "BTC-USD", "min_order_size": 0.0001},
        {"base_asset_id": eth.id, "quote_asset_id": usd.id, "symbol": "ETH-USD", "min_order_size": 0.001},
        
        # Crypto/EUR pairs
        {"base_asset_id": btc.id, "quote_asset_id": eur.id, "symbol": "BTC-EUR", "min_order_size": 0.0001},
        {"base_asset_id": eth.id, "quote_asset_id": eur.id, "symbol": "ETH-EUR", "min_order_size": 0.001},
        
        # Crypto/RSD pairs (Serbian market)
        {"base_asset_id": btc.id, "quote_asset_id": rsd.id, "symbol": "BTC-RSD", "min_order_size": 0.0001},
        {"base_asset_id": eth.id, "quote_asset_id": rsd.id, "symbol": "ETH-RSD", "min_order_size": 0.001},
        
        # Crypto/USDT pairs
        {"base_asset_id": btc.id, "quote_asset_id": usdt.id, "symbol": "BTC-USDT", "min_order_size": 0.0001},
        {"base_asset_id": eth.id, "quote_asset_id": usdt.id, "symbol": "ETH-USDT", "min_order_size": 0.001},
    ]
    
    for market_data in default_markets:
        existing = db.query(Market).filter(Market.symbol == market_data["symbol"]).first()
        if not existing:
            market = Market(**market_data)
            db.add(market)
    
    db.commit()


def create_admin_user(db: Session):
    """Create default admin user"""
    
    admin_email = settings.ADMIN_EMAIL
    existing = db.query(User).filter(User.email == admin_email).first()
    
    if not existing:
        admin_password = settings.ADMIN_PASSWORD or "ChangeMe123!"
        
        admin = User(
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            full_name="Admin User",
            is_active=True,
            is_verified=True,
            is_admin=True
        )
        db.add(admin)
        db.commit()
        
        print(f"Admin user created: {admin_email}")
        print(f"Default password: {admin_password}")
        print("CHANGE THIS PASSWORD IMMEDIATELY!")


def bootstrap_database(db: Session):
    """Run all bootstrap functions"""
    create_default_assets(db)
    create_default_markets(db)
    create_admin_user(db)
    print("Database bootstrap completed!")
