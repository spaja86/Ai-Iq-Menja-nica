"""
KYC verification service.
"""
from typing import Optional
from sqlalchemy.orm import Session

from app.models import User, KYCSubmission, KYCStatus, VerificationStatus
from app.core.config import settings


class KYCService:
    """Service for KYC/AML verification."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def submit_kyc(
        self,
        user_id: int,
        submission_data: dict
    ) -> KYCSubmission:
        """
        Submit KYC documentation for verification.
        
        Args:
            user_id: User ID
            submission_data: KYC form data
            
        Returns:
            Created KYC submission
        """
        # Create KYC submission
        submission = KYCSubmission(
            user_id=user_id,
            **submission_data
        )
        
        self.db.add(submission)
        
        # Update user KYC status
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.kyc_status = KYCStatus.PENDING
        
        self.db.commit()
        self.db.refresh(submission)
        
        # In production, integrate with KYC provider (Sumsub, Onfido, etc.)
        # self._submit_to_provider(submission)
        
        return submission
    
    def approve_kyc(
        self,
        submission_id: int,
        reviewer_id: int
    ) -> Optional[KYCSubmission]:
        """
        Approve a KYC submission.
        
        Args:
            submission_id: KYC submission ID
            reviewer_id: Admin user ID
            
        Returns:
            Updated submission
        """
        submission = self.db.query(KYCSubmission).filter(
            KYCSubmission.id == submission_id
        ).first()
        
        if submission:
            submission.status = VerificationStatus.APPROVED
            submission.reviewed_by = reviewer_id
            
            # Update user KYC status
            user = self.db.query(User).filter(User.id == submission.user_id).first()
            if user:
                user.kyc_status = KYCStatus.APPROVED
            
            self.db.commit()
            self.db.refresh(submission)
        
        return submission
    
    def reject_kyc(
        self,
        submission_id: int,
        reviewer_id: int,
        reason: str
    ) -> Optional[KYCSubmission]:
        """
        Reject a KYC submission.
        
        Args:
            submission_id: KYC submission ID
            reviewer_id: Admin user ID
            reason: Rejection reason
            
        Returns:
            Updated submission
        """
        submission = self.db.query(KYCSubmission).filter(
            KYCSubmission.id == submission_id
        ).first()
        
        if submission:
            submission.status = VerificationStatus.REJECTED
            submission.reviewed_by = reviewer_id
            submission.rejection_reason = reason
            
            # Update user KYC status
            user = self.db.query(User).filter(User.id == submission.user_id).first()
            if user:
                user.kyc_status = KYCStatus.REJECTED
            
            self.db.commit()
            self.db.refresh(submission)
        
        return submission
