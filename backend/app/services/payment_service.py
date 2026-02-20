"""
Payment processing service for Stripe and PayPal integration.
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.models import Payment, PaymentMethod, PaymentStatus, Wallet
from app.core.config import settings


class PaymentService:
    """Service for payment processing."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_deposit(
        self,
        user_id: int,
        amount: float,
        currency: str,
        payment_method: PaymentMethod
    ) -> Payment:
        """
        Create a deposit payment.
        
        Args:
            user_id: User ID
            amount: Deposit amount
            currency: Currency code
            payment_method: Payment method
            
        Returns:
            Created payment
        """
        payment = Payment(
            user_id=user_id,
            payment_method=payment_method,
            payment_type="deposit",
            amount=amount,
            currency=currency,
            status=PaymentStatus.PENDING
        )
        
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        
        # In production, integrate with payment providers
        # if payment_method == PaymentMethod.STRIPE:
        #     self._process_stripe_payment(payment)
        # elif payment_method == PaymentMethod.PAYPAL:
        #     self._process_paypal_payment(payment)
        
        return payment
    
    def process_deposit(
        self,
        payment_id: int,
        provider_transaction_id: str
    ) -> Optional[Payment]:
        """
        Process a successful deposit and credit user wallet.
        
        Args:
            payment_id: Payment ID
            provider_transaction_id: External transaction ID
            
        Returns:
            Updated payment
        """
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        
        if payment and payment.status == PaymentStatus.PENDING:
            payment.status = PaymentStatus.COMPLETED
            payment.provider_transaction_id = provider_transaction_id
            
            # Credit user wallet
            wallet = self.db.query(Wallet).filter(
                Wallet.user_id == payment.user_id,
                Wallet.currency == payment.currency
            ).first()
            
            if wallet:
                wallet.balance += payment.amount
            else:
                # Create wallet if doesn't exist
                wallet = Wallet(
                    user_id=payment.user_id,
                    currency=payment.currency,
                    balance=payment.amount
                )
                self.db.add(wallet)
            
            self.db.commit()
            self.db.refresh(payment)
        
        return payment
    
    def create_withdrawal(
        self,
        user_id: int,
        amount: float,
        currency: str,
        payment_method: PaymentMethod
    ) -> Optional[Payment]:
        """
        Create a withdrawal payment.
        
        Args:
            user_id: User ID
            amount: Withdrawal amount
            currency: Currency code
            payment_method: Payment method
            
        Returns:
            Created payment or None if insufficient funds
        """
        # Check wallet balance
        wallet = self.db.query(Wallet).filter(
            Wallet.user_id == user_id,
            Wallet.currency == currency
        ).first()
        
        if not wallet or wallet.available_balance < amount:
            return None
        
        # Lock funds
        wallet.locked_balance += amount
        
        payment = Payment(
            user_id=user_id,
            payment_method=payment_method,
            payment_type="withdrawal",
            amount=amount,
            currency=currency,
            status=PaymentStatus.PROCESSING
        )
        
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        
        # In production, initiate withdrawal with payment provider
        
        return payment
    
    def complete_withdrawal(
        self,
        payment_id: int,
        provider_transaction_id: str
    ) -> Optional[Payment]:
        """
        Complete a withdrawal and deduct from user wallet.
        
        Args:
            payment_id: Payment ID
            provider_transaction_id: External transaction ID
            
        Returns:
            Updated payment
        """
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        
        if payment and payment.status == PaymentStatus.PROCESSING:
            payment.status = PaymentStatus.COMPLETED
            payment.provider_transaction_id = provider_transaction_id
            
            # Deduct from wallet
            wallet = self.db.query(Wallet).filter(
                Wallet.user_id == payment.user_id,
                Wallet.currency == payment.currency
            ).first()
            
            if wallet:
                wallet.balance -= payment.amount
                wallet.locked_balance -= payment.amount
            
            self.db.commit()
            self.db.refresh(payment)
        
        return payment
