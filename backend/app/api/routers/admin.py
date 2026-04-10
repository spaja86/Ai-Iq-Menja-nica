"""
Admin router - handles administrative functions
User management, audit logs, system statistics
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta

from app.db.session import get_db
from app.db.models import User, Order, Trade, Payment, AuditLog, Balance, Asset
from app.api.schemas import UserResponse, AdminUserUpdate
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"])


def get_current_admin(db: Session = Depends(get_db)) -> User:
    """
    Dependency to verify admin access
    
    In production, this should decode JWT and verify is_admin=True
    """
    # TODO: Implement proper JWT authentication
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Admin authentication required"
    )


@router.get("/users", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    List all users
    
    Args:
        skip: Pagination offset
        limit: Max results
        is_active: Filter by active status
    """
    query = db.query(User)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.offset(skip).limit(limit).all()
    
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Get user details"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    update_data: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Update user account
    
    Admin can modify:
    - is_active
    - is_verified
    - is_admin
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    if update_data.is_active is not None:
        user.is_active = update_data.is_active
    
    if update_data.is_verified is not None:
        user.is_verified = update_data.is_verified
    
    if update_data.is_admin is not None:
        user.is_admin = update_data.is_admin
    
    db.commit()
    db.refresh(user)
    
    # Log action
    audit = AuditLog(
        user_id=current_admin.id,
        action="admin_user_update",
        success=True,
        details=f"Updated user {user_id}"
    )
    db.add(audit)
    db.commit()
    
    return user


@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Get system statistics
    
    Returns:
        - Total users
        - Active users (logged in last 30 days)
        - Total trades
        - Total volume
        - Pending orders
    """
    # Total users
    total_users = db.query(func.count(User.id)).scalar()
    
    # Active users (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = db.query(func.count(User.id)).filter(
        User.last_login >= thirty_days_ago
    ).scalar()
    
    # Total trades
    total_trades = db.query(func.count(Trade.id)).scalar()
    
    # Total trade volume (sum of all trade values)
    total_volume = db.query(
        func.sum(Trade.quantity * Trade.price)
    ).scalar() or 0
    
    # Pending orders
    from app.db.models import OrderStatus
    pending_orders = db.query(func.count(Order.id)).filter(
        Order.status.in_([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED])
    ).scalar()
    
    # Total payments
    total_deposits = db.query(func.count(Payment.id)).filter(
        Payment.is_deposit == True
    ).scalar()
    
    return {
        "total_users": total_users,
        "active_users_30d": active_users,
        "total_trades": total_trades,
        "total_volume": float(total_volume),
        "pending_orders": pending_orders,
        "total_deposits": total_deposits
    }


@router.get("/audit-logs")
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Get audit logs
    
    Args:
        skip: Pagination offset
        limit: Max results
        user_id: Filter by user
        action: Filter by action type
    """
    query = db.query(AuditLog)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    if action:
        query = query.filter(AuditLog.action == action)
    
    logs = query.order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "success": log.success,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]


@router.get("/balances")
def get_all_balances(
    asset_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Get all user balances
    
    Useful for auditing and reconciliation
    """
    query = db.query(Balance)
    
    if asset_id:
        query = query.filter(Balance.asset_id == asset_id)
    
    balances = query.all()
    
    # Calculate totals
    total_available = sum(float(b.available) for b in balances)
    total_reserved = sum(float(b.reserved) for b in balances)
    
    return {
        "total_available": total_available,
        "total_reserved": total_reserved,
        "total": total_available + total_reserved,
        "count": len(balances),
        "balances": [
            {
                "user_id": b.user_id,
                "asset_id": b.asset_id,
                "available": float(b.available),
                "reserved": float(b.reserved),
                "total": float(b.available + b.reserved)
            }
            for b in balances
        ]
    }


@router.post("/reset-password/{user_id}")
def reset_user_password(
    user_id: int,
    new_password: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Reset user password (admin function)
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    # Log action
    audit = AuditLog(
        user_id=current_admin.id,
        action="admin_password_reset",
        success=True,
        details=f"Reset password for user {user_id}"
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Password reset successfully"}
