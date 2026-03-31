"""
KYC (Know Your Customer) verification model.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class DocumentType(str, enum.Enum):
    """KYC document type enumeration."""
    PASSPORT = "passport"
    DRIVERS_LICENSE = "drivers_license"
    NATIONAL_ID = "national_id"
    RESIDENCE_PERMIT = "residence_permit"


class VerificationStatus(str, enum.Enum):
    """Verification status enumeration."""
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    RESUBMIT = "resubmit"


class KYCSubmission(Base):
    """KYC submission and verification model."""
    
    __tablename__ = "kyc_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Personal information
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    nationality = Column(String, nullable=False)
    
    # Address
    country = Column(String, nullable=False)
    city = Column(String, nullable=False)
    address_line1 = Column(String, nullable=False)
    address_line2 = Column(String, nullable=True)
    postal_code = Column(String, nullable=False)
    
    # Document information
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    document_number = Column(String, nullable=False)
    document_expiry = Column(DateTime, nullable=True)
    
    # File uploads
    document_front_url = Column(String, nullable=True)
    document_back_url = Column(String, nullable=True)
    selfie_url = Column(String, nullable=True)
    
    # Verification
    status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING, index=True)
    provider_verification_id = Column(String, nullable=True, index=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Review information
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="kyc_submissions", foreign_keys=[user_id])
    
    def __repr__(self):
        return f"<KYCSubmission user_id={self.user_id} status={self.status.value}>"
