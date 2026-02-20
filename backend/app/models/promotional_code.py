"""
Promotional Code Model
Manages promotional/referral codes for the platform
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class CodeStatus(str, enum.Enum):
    """Code status enumeration"""
    PENDING = "pending"
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"
    DISABLED = "disabled"


class CodeType(str, enum.Enum):
    """Code type enumeration"""
    AUTOFINISH = "autofinish"
    REFERRAL = "referral"
    PROMOTION = "promotion"
    BONUS = "bonus"
    DISCOUNT = "discount"


class PromotionalCode(Base):
    """
    Promotional Code Model
    Stores and manages promotional/referral codes
    """
    __tablename__ = "promotional_codes"

    id = Column(Integer, primary_key=True, index=True)
    
    # Code identification
    code = Column(String(50), unique=True, index=True, nullable=False)
    code_type = Column(SQLEnum(CodeType), default=CodeType.AUTOFINISH, nullable=False)
    sequence_number = Column(Integer, index=True)  # For AUTOFINISH: 1-550
    
    # Status and lifecycle
    status = Column(SQLEnum(CodeStatus), default=CodeStatus.PENDING, nullable=False)
    is_active = Column(Boolean, default=False)
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    max_uses = Column(Integer, default=1)  # How many times can be used
    
    # Benefits
    discount_percentage = Column(Float, default=0.0)  # Percentage discount (0-100)
    bonus_amount = Column(Float, default=0.0)  # Fixed bonus amount
    referral_bonus = Column(Float, default=0.0)  # Referral bonus for code owner
    
    # Validity period
    valid_from = Column(DateTime, nullable=True)
    valid_until = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    activated_at = Column(DateTime, nullable=True)
    first_used_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by = relationship("User", foreign_keys=[created_by_id], backref="created_codes")
    
    # Metadata
    description = Column(String(500), nullable=True)
    metadata = Column(String(1000), nullable=True)  # JSON string for additional data
    
    # Processing info
    batch_id = Column(String(50), nullable=True)  # For batch generation tracking
    processing_order = Column(Integer, nullable=True)  # Order in processing queue
    
    def __repr__(self):
        return f"<PromotionalCode(code='{self.code}', type='{self.code_type}', status='{self.status}')>"
    
    def is_valid(self) -> bool:
        """Check if code is currently valid for use"""
        if self.status != CodeStatus.ACTIVE:
            return False
        
        if not self.is_active:
            return False
        
        if self.usage_count >= self.max_uses:
            return False
        
        now = datetime.utcnow()
        
        if self.valid_from and now < self.valid_from:
            return False
        
        if self.valid_until and now > self.valid_until:
            return False
        
        return True
    
    def can_process(self) -> bool:
        """Check if code can be processed (activated)"""
        return self.status == CodeStatus.PENDING
    
    def activate(self):
        """Activate the code"""
        if self.can_process():
            self.status = CodeStatus.ACTIVE
            self.is_active = True
            self.activated_at = datetime.utcnow()
            self.processed_at = datetime.utcnow()
    
    def use(self):
        """Mark code as used"""
        if self.is_valid():
            self.usage_count += 1
            if not self.first_used_at:
                self.first_used_at = datetime.utcnow()
            self.last_used_at = datetime.utcnow()
            
            if self.usage_count >= self.max_uses:
                self.status = CodeStatus.USED
    
    def disable(self):
        """Disable the code"""
        self.status = CodeStatus.DISABLED
        self.is_active = False
    
    def expire(self):
        """Mark code as expired"""
        self.status = CodeStatus.EXPIRED
        self.is_active = False
