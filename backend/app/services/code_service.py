"""
Promotional Code Service
Handles generation, processing, and management of promotional codes
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import secrets
import string
from fastapi import HTTPException

from app.models.promotional_code import PromotionalCode, CodeStatus, CodeType
from app.models.audit_log import AuditLog


class CodeGeneratorService:
    """Service for generating and managing promotional codes"""
    
    @staticmethod
    def generate_code(length: int = 12, prefix: str = "AUTOFINISH") -> str:
        """
        Generate a unique promotional code
        
        Args:
            length: Length of the random part
            prefix: Prefix for the code
        
        Returns:
            Generated code string
        """
        # Generate random alphanumeric string
        chars = string.ascii_uppercase + string.digits
        random_part = ''.join(secrets.choice(chars) for _ in range(length))
        
        return f"{prefix}-{random_part}"
    
    @staticmethod
    def generate_sequential_code(sequence_number: int, prefix: str = "AUTOFINISH") -> str:
        """
        Generate a sequential promotional code
        
        Args:
            sequence_number: Sequence number (1-550)
            prefix: Prefix for the code
        
        Returns:
            Generated code string
        """
        # Format: AUTOFINISH-001, AUTOFINISH-002, etc.
        return f"{prefix}-{sequence_number:03d}"
    
    @staticmethod
    def create_code(
        db: Session,
        code: str,
        code_type: CodeType = CodeType.AUTOFINISH,
        sequence_number: Optional[int] = None,
        discount_percentage: float = 0.0,
        bonus_amount: float = 0.0,
        max_uses: int = 1,
        valid_days: Optional[int] = None,
        description: Optional[str] = None,
        batch_id: Optional[str] = None,
        created_by_id: Optional[int] = None,
    ) -> PromotionalCode:
        """
        Create a single promotional code
        
        Args:
            db: Database session
            code: Code string
            code_type: Type of code
            sequence_number: Sequence number for ordering
            discount_percentage: Discount percentage (0-100)
            bonus_amount: Fixed bonus amount
            max_uses: Maximum number of uses
            valid_days: Number of days code is valid (None = no expiry)
            description: Code description
            batch_id: Batch ID for tracking
            created_by_id: User ID who created the code
        
        Returns:
            Created PromotionalCode instance
        """
        # Check if code already exists
        existing = db.query(PromotionalCode).filter(PromotionalCode.code == code).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Code {code} already exists")
        
        # Set validity period
        valid_from = datetime.utcnow()
        valid_until = None
        if valid_days:
            valid_until = valid_from + timedelta(days=valid_days)
        
        # Create code
        promo_code = PromotionalCode(
            code=code,
            code_type=code_type,
            sequence_number=sequence_number,
            status=CodeStatus.PENDING,
            is_active=False,
            discount_percentage=discount_percentage,
            bonus_amount=bonus_amount,
            max_uses=max_uses,
            valid_from=valid_from,
            valid_until=valid_until,
            description=description,
            batch_id=batch_id,
            created_by_id=created_by_id,
        )
        
        db.add(promo_code)
        db.commit()
        db.refresh(promo_code)
        
        return promo_code
    
    @staticmethod
    def generate_autofinish_batch(
        db: Session,
        count: int = 550,
        discount_percentage: float = 10.0,
        bonus_amount: float = 0.0,
        max_uses: int = 1,
        valid_days: Optional[int] = 365,
        created_by_id: Optional[int] = None,
    ) -> List[PromotionalCode]:
        """
        Generate a batch of AUTOFINISH codes
        
        Args:
            db: Database session
            count: Number of codes to generate (default: 550)
            discount_percentage: Discount percentage for all codes
            bonus_amount: Bonus amount for all codes
            max_uses: Maximum uses per code
            valid_days: Validity period in days
            created_by_id: User ID who created the batch
        
        Returns:
            List of created PromotionalCode instances
        """
        batch_id = f"AUTOFINISH-BATCH-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        codes = []
        
        for i in range(1, count + 1):
            try:
                code_str = CodeGeneratorService.generate_sequential_code(i, "AUTOFINISH")
                
                promo_code = CodeGeneratorService.create_code(
                    db=db,
                    code=code_str,
                    code_type=CodeType.AUTOFINISH,
                    sequence_number=i,
                    discount_percentage=discount_percentage,
                    bonus_amount=bonus_amount,
                    max_uses=max_uses,
                    valid_days=valid_days,
                    description=f"AUTOFINISH code #{i} of {count}",
                    batch_id=batch_id,
                    created_by_id=created_by_id,
                )
                
                codes.append(promo_code)
                
            except HTTPException as e:
                # Code already exists, skip
                print(f"Skipping code {i}: {e.detail}")
                continue
        
        # Log the batch generation
        if created_by_id:
            audit = AuditLog(
                user_id=created_by_id,
                action="generate_autofinish_batch",
                resource_type="promotional_codes",
                resource_id=batch_id,
                details=f"Generated {len(codes)} AUTOFINISH codes in batch {batch_id}",
            )
            db.add(audit)
            db.commit()
        
        return codes
    
    @staticmethod
    def process_code(db: Session, code_id: int) -> PromotionalCode:
        """
        Process (activate) a single code
        
        Args:
            db: Database session
            code_id: Code ID to process
        
        Returns:
            Processed PromotionalCode instance
        """
        code = db.query(PromotionalCode).filter(PromotionalCode.id == code_id).first()
        
        if not code:
            raise HTTPException(status_code=404, detail="Code not found")
        
        if not code.can_process():
            raise HTTPException(
                status_code=400,
                detail=f"Code cannot be processed. Current status: {code.status}"
            )
        
        code.activate()
        db.commit()
        db.refresh(code)
        
        return code
    
    @staticmethod
    def process_batch_sequential(
        db: Session,
        batch_id: str,
        delay_seconds: int = 0,
    ) -> List[PromotionalCode]:
        """
        Process codes in a batch sequentially
        
        Args:
            db: Database session
            batch_id: Batch ID to process
            delay_seconds: Delay between processing each code (for demo purposes)
        
        Returns:
            List of processed codes
        """
        # Get all pending codes in batch, ordered by sequence_number
        codes = db.query(PromotionalCode).filter(
            PromotionalCode.batch_id == batch_id,
            PromotionalCode.status == CodeStatus.PENDING
        ).order_by(PromotionalCode.sequence_number).all()
        
        processed_codes = []
        
        for code in codes:
            try:
                code.activate()
                db.commit()
                db.refresh(code)
                processed_codes.append(code)
            except Exception as e:
                print(f"Error processing code {code.code}: {str(e)}")
                db.rollback()
                continue
        
        return processed_codes
    
    @staticmethod
    def get_codes(
        db: Session,
        code_type: Optional[CodeType] = None,
        status: Optional[CodeStatus] = None,
        batch_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[PromotionalCode]:
        """
        Get promotional codes with filters
        
        Args:
            db: Database session
            code_type: Filter by code type
            status: Filter by status
            batch_id: Filter by batch ID
            skip: Number of records to skip
            limit: Maximum number of records to return
        
        Returns:
            List of PromotionalCode instances
        """
        query = db.query(PromotionalCode)
        
        if code_type:
            query = query.filter(PromotionalCode.code_type == code_type)
        
        if status:
            query = query.filter(PromotionalCode.status == status)
        
        if batch_id:
            query = query.filter(PromotionalCode.batch_id == batch_id)
        
        return query.order_by(PromotionalCode.sequence_number).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_batch_stats(db: Session, batch_id: str) -> Dict[str, Any]:
        """
        Get statistics for a batch
        
        Args:
            db: Database session
            batch_id: Batch ID
        
        Returns:
            Dictionary with batch statistics
        """
        codes = db.query(PromotionalCode).filter(PromotionalCode.batch_id == batch_id).all()
        
        stats = {
            "batch_id": batch_id,
            "total_codes": len(codes),
            "pending": sum(1 for c in codes if c.status == CodeStatus.PENDING),
            "active": sum(1 for c in codes if c.status == CodeStatus.ACTIVE),
            "used": sum(1 for c in codes if c.status == CodeStatus.USED),
            "expired": sum(1 for c in codes if c.status == CodeStatus.EXPIRED),
            "disabled": sum(1 for c in codes if c.status == CodeStatus.DISABLED),
            "total_usage": sum(c.usage_count for c in codes),
        }
        
        return stats
    
    @staticmethod
    def validate_and_use_code(
        db: Session,
        code_str: str,
        user_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Validate and use a promotional code
        
        Args:
            db: Database session
            code_str: Code string to validate
            user_id: User ID using the code
        
        Returns:
            Dictionary with code benefits and usage result
        """
        code = db.query(PromotionalCode).filter(PromotionalCode.code == code_str).first()
        
        if not code:
            raise HTTPException(status_code=404, detail="Code not found")
        
        if not code.is_valid():
            raise HTTPException(
                status_code=400,
                detail=f"Code is not valid. Status: {code.status}"
            )
        
        # Use the code
        code.use()
        db.commit()
        db.refresh(code)
        
        # Log the usage
        if user_id:
            audit = AuditLog(
                user_id=user_id,
                action="use_promotional_code",
                resource_type="promotional_code",
                resource_id=str(code.id),
                details=f"Used code {code.code}",
            )
            db.add(audit)
            db.commit()
        
        return {
            "code": code.code,
            "discount_percentage": code.discount_percentage,
            "bonus_amount": code.bonus_amount,
            "referral_bonus": code.referral_bonus,
            "usage_count": code.usage_count,
            "max_uses": code.max_uses,
            "status": code.status,
        }
