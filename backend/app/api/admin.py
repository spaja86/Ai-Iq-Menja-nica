"""
Admin API routes - user management, KYC review, system monitoring.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from app.core.database import get_db
from app.models import User, UserRole, KYCSubmission, VerificationStatus, Order, Trade
from app.services.kyc_service import KYCService
from app.api.auth import get_current_user


router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user is admin."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# Pydantic models
class KYCReviewRequest(BaseModel):
    submission_id: int
    approved: bool
    rejection_reason: Optional[str] = None


@router.get("/users")
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all users (admin only)."""
    users = db.query(User).offset(skip).limit(limit).all()
    
    return {
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value,
                "kyc_status": user.kyc_status.value,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat()
            }
            for user in users
        ],
        "total": db.query(User).count()
    }


@router.get("/kyc/pending")
async def get_pending_kyc(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get pending KYC submissions (admin only)."""
    submissions = db.query(KYCSubmission).filter(
        KYCSubmission.status == VerificationStatus.PENDING
    ).all()
    
    return {
        "submissions": [
            {
                "id": sub.id,
                "user_id": sub.user_id,
                "first_name": sub.first_name,
                "last_name": sub.last_name,
                "document_type": sub.document_type.value,
                "submitted_at": sub.submitted_at.isoformat()
            }
            for sub in submissions
        ]
    }


@router.post("/kyc/review")
async def review_kyc(
    review: KYCReviewRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Review and approve/reject KYC submission (admin only)."""
    kyc_service = KYCService(db)
    
    if review.approved:
        submission = kyc_service.approve_kyc(review.submission_id, current_user.id)
    else:
        if not review.rejection_reason:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rejection reason required"
            )
        submission = kyc_service.reject_kyc(
            review.submission_id,
            current_user.id,
            review.rejection_reason
        )
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="KYC submission not found"
        )
    
    return {"message": "KYC reviewed successfully", "status": submission.status.value}


@router.get("/analytics")
async def get_analytics(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get platform analytics (admin only)."""
    total_users = db.query(func.count(User.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_trades = db.query(func.count(Trade.id)).scalar()
    
    # Trading volume (last 24 hours)
    from datetime import datetime, timedelta
    yesterday = datetime.utcnow() - timedelta(days=1)
    daily_volume = db.query(func.sum(Trade.total_value)).filter(
        Trade.executed_at >= yesterday
    ).scalar() or 0
    
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_trades": total_trades,
        "daily_trading_volume": daily_volume,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Activate a user account (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": "User activated successfully"}


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Deactivate a user account (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}
