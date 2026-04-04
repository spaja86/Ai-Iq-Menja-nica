"""Admin API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

router = APIRouter()


def verify_admin():
    """Verify admin access."""
    # TODO: Implement admin verification
    pass


@router.get("/users", dependencies=[Depends(verify_admin)])
async def get_users():
    """Get all users (admin only)."""
    # TODO: Implement user listing
    return {"users": []}


@router.get("/stats", dependencies=[Depends(verify_admin)])
async def get_stats():
    """Get platform statistics."""
    # TODO: Implement stats collection
    return {
        "total_users": 0,
        "total_volume": "0",
        "active_orders": 0
    }


@router.post("/maintenance", dependencies=[Depends(verify_admin)])
async def toggle_maintenance(enabled: bool):
    """Toggle maintenance mode."""
    # TODO: Implement maintenance mode
    return {"maintenance_mode": enabled}
