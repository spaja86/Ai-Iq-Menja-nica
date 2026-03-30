"""Authentication API endpoints."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """User login endpoint."""
    # TODO: Implement actual authentication logic
    return {
        "access_token": "mock_access_token",
        "refresh_token": "mock_refresh_token",
        "token_type": "bearer"
    }


@router.post("/register")
async def register(request: LoginRequest):
    """User registration endpoint."""
    # TODO: Implement actual registration logic
    return {"message": "User registered successfully"}


@router.post("/refresh")
async def refresh_token():
    """Refresh access token."""
    # TODO: Implement token refresh logic
    return {"access_token": "new_mock_access_token"}


@router.post("/logout")
async def logout():
    """User logout endpoint."""
    # TODO: Implement logout logic
    return {"message": "Logged out successfully"}
