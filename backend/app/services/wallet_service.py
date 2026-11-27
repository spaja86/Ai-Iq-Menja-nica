"""
Wallet management service.
"""
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Wallet, Transaction, User


class WalletService:
    """Service for wallet management and transactions."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_or_create_wallet(
        self,
        user_id: int,
        currency: str
    ) -> Wallet:
        """
        Get existing wallet or create new one.
        
        Args:
            user_id: User ID
            currency: Currency code
            
        Returns:
            Wallet instance
        """
        wallet = self.db.query(Wallet).filter(
            Wallet.user_id == user_id,
            Wallet.currency == currency
        ).first()
        
        if not wallet:
            wallet = Wallet(
                user_id=user_id,
                currency=currency,
                balance=0.0
            )
            self.db.add(wallet)
            self.db.commit()
            self.db.refresh(wallet)
        
        return wallet
    
    def get_user_wallets(self, user_id: int) -> List[Wallet]:
        """
        Get all wallets for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of wallets
        """
        return self.db.query(Wallet).filter(
            Wallet.user_id == user_id,
            Wallet.is_active == True
        ).all()
    
    def record_transaction(
        self,
        wallet_id: int,
        transaction_type: str,
        amount: float,
        description: Optional[str] = None,
        external_id: Optional[str] = None
    ) -> Transaction:
        """
        Record a wallet transaction.
        
        Args:
            wallet_id: Wallet ID
            transaction_type: Transaction type
            amount: Transaction amount
            description: Optional description
            external_id: Optional external reference
            
        Returns:
            Created transaction
        """
        wallet = self.db.query(Wallet).filter(Wallet.id == wallet_id).first()
        
        if not wallet:
            raise ValueError("Wallet not found")
        
        # Create transaction
        transaction = Transaction(
            wallet_id=wallet_id,
            transaction_type=transaction_type,
            amount=amount,
            balance_after=wallet.balance,
            description=description,
            external_id=external_id,
            status="confirmed"
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        
        return transaction
    
    def lock_funds(
        self,
        user_id: int,
        currency: str,
        amount: float
    ) -> bool:
        """
        Lock funds in a wallet (e.g., for open orders).
        
        Args:
            user_id: User ID
            currency: Currency code
            amount: Amount to lock
            
        Returns:
            True if successful, False if insufficient funds
        """
        wallet = self.get_or_create_wallet(user_id, currency)
        
        if wallet.available_balance < amount:
            return False
        
        wallet.locked_balance += amount
        self.db.commit()
        
        return True
    
    def unlock_funds(
        self,
        user_id: int,
        currency: str,
        amount: float
    ) -> bool:
        """
        Unlock previously locked funds.
        
        Args:
            user_id: User ID
            currency: Currency code
            amount: Amount to unlock
            
        Returns:
            True if successful
        """
        wallet = self.get_or_create_wallet(user_id, currency)
        
        wallet.locked_balance = max(0, wallet.locked_balance - amount)
        self.db.commit()
        
        return True
    
    def transfer_funds(
        self,
        from_wallet_id: int,
        to_wallet_id: int,
        amount: float
    ) -> bool:
        """
        Transfer funds between wallets.
        
        Args:
            from_wallet_id: Source wallet ID
            to_wallet_id: Destination wallet ID
            amount: Amount to transfer
            
        Returns:
            True if successful
        """
        from_wallet = self.db.query(Wallet).filter(Wallet.id == from_wallet_id).first()
        to_wallet = self.db.query(Wallet).filter(Wallet.id == to_wallet_id).first()
        
        if not from_wallet or not to_wallet:
            return False
        
        if from_wallet.available_balance < amount:
            return False
        
        # Execute transfer
        from_wallet.balance -= amount
        to_wallet.balance += amount
        
        # Record transactions
        self.record_transaction(
            from_wallet_id,
            "transfer_out",
            -amount,
            f"Transfer to wallet {to_wallet_id}"
        )
        self.record_transaction(
            to_wallet_id,
            "transfer_in",
            amount,
            f"Transfer from wallet {from_wallet_id}"
        )
        
        self.db.commit()
        
        return True
