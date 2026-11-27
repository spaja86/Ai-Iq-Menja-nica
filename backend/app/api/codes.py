"""
Promotional Codes API
Endpoints for managing promotional/referral codes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.user import User
from app.models.promotional_code import PromotionalCode, CodeStatus, CodeType
from app.services.code_service import CodeGeneratorService


router = APIRouter(prefix="/api/codes", tags=["promotional_codes"])


# Pydantic models for request/response
class CodeCreate(BaseModel):
    """Schema for creating a single code"""
    code: Optional[str] = None  # If None, will be auto-generated
    code_type: CodeType = CodeType.AUTOFINISH
    sequence_number: Optional[int] = None
    discount_percentage: float = Field(0.0, ge=0, le=100)
    bonus_amount: float = Field(0.0, ge=0)
    max_uses: int = Field(1, ge=1)
    valid_days: Optional[int] = None
    description: Optional[str] = None


class BatchGenerateRequest(BaseModel):
    """Schema for batch code generation"""
    count: int = Field(550, ge=1, le=1000, description="Number of codes to generate")
    code_type: CodeType = CodeType.AUTOFINISH
    discount_percentage: float = Field(10.0, ge=0, le=100)
    bonus_amount: float = Field(0.0, ge=0)
    max_uses: int = Field(1, ge=1)
    valid_days: Optional[int] = Field(365, description="Validity period in days")


class CodeResponse(BaseModel):
    """Schema for code response"""
    id: int
    code: str
    code_type: CodeType
    sequence_number: Optional[int]
    status: CodeStatus
    is_active: bool
    usage_count: int
    max_uses: int
    discount_percentage: float
    bonus_amount: float
    valid_from: Optional[datetime]
    valid_until: Optional[datetime]
    created_at: datetime
    activated_at: Optional[datetime]
    batch_id: Optional[str]
    description: Optional[str]
    
    class Config:
        from_attributes = True


class BatchStatsResponse(BaseModel):
    """Schema for batch statistics"""
    batch_id: str
    total_codes: int
    pending: int
    active: int
    used: int
    expired: int
    disabled: int
    total_usage: int


class CodeUseRequest(BaseModel):
    """Schema for using a code"""
    code: str


class CodeUseResponse(BaseModel):
    """Schema for code use response"""
    code: str
    discount_percentage: float
    bonus_amount: float
    referral_bonus: float
    usage_count: int
    max_uses: int
    status: CodeStatus


# Admin endpoints - require admin role
@router.post("/generate", response_model=CodeResponse)
async def create_single_code(
    request: CodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Create a single promotional code (Admin only)
    """
    # Generate code if not provided
    code_str = request.code
    if not code_str:
        if request.sequence_number:
            code_str = CodeGeneratorService.generate_sequential_code(
                request.sequence_number,
                prefix=request.code_type.value.upper()
            )
        else:
            code_str = CodeGeneratorService.generate_code(
                prefix=request.code_type.value.upper()
            )
    
    code = CodeGeneratorService.create_code(
        db=db,
        code=code_str,
        code_type=request.code_type,
        sequence_number=request.sequence_number,
        discount_percentage=request.discount_percentage,
        bonus_amount=request.bonus_amount,
        max_uses=request.max_uses,
        valid_days=request.valid_days,
        description=request.description,
        created_by_id=current_user.id,
    )
    
    return code


@router.post("/generate-batch", response_model=List[CodeResponse])
async def generate_code_batch(
    request: BatchGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Generate a batch of promotional codes (Admin only)
    Generates 550 AUTOFINISH codes by default
    """
    if request.code_type == CodeType.AUTOFINISH:
        codes = CodeGeneratorService.generate_autofinish_batch(
            db=db,
            count=request.count,
            discount_percentage=request.discount_percentage,
            bonus_amount=request.bonus_amount,
            max_uses=request.max_uses,
            valid_days=request.valid_days,
            created_by_id=current_user.id,
        )
    else:
        # For other code types, generate with random codes
        batch_id = f"{request.code_type.value.upper()}-BATCH-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        codes = []
        for i in range(1, request.count + 1):
            code_str = CodeGeneratorService.generate_code(
                prefix=request.code_type.value.upper()
            )
            code = CodeGeneratorService.create_code(
                db=db,
                code=code_str,
                code_type=request.code_type,
                sequence_number=i,
                discount_percentage=request.discount_percentage,
                bonus_amount=request.bonus_amount,
                max_uses=request.max_uses,
                valid_days=request.valid_days,
                batch_id=batch_id,
                created_by_id=current_user.id,
            )
            codes.append(code)
    
    return codes


@router.post("/process/{code_id}", response_model=CodeResponse)
async def process_code(
    code_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Process (activate) a single code (Admin only)
    """
    code = CodeGeneratorService.process_code(db=db, code_id=code_id)
    return code


@router.post("/process-batch/{batch_id}", response_model=List[CodeResponse])
async def process_batch(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Process (activate) all codes in a batch sequentially (Admin only)
    """
    codes = CodeGeneratorService.process_batch_sequential(db=db, batch_id=batch_id)
    return codes


@router.get("/", response_model=List[CodeResponse])
async def list_codes(
    code_type: Optional[CodeType] = None,
    status: Optional[CodeStatus] = None,
    batch_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    List promotional codes with filters (Admin only)
    """
    codes = CodeGeneratorService.get_codes(
        db=db,
        code_type=code_type,
        status=status,
        batch_id=batch_id,
        skip=skip,
        limit=limit,
    )
    return codes


@router.get("/batch/{batch_id}/stats", response_model=BatchStatsResponse)
async def get_batch_stats(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get statistics for a batch (Admin only)
    """
    stats = CodeGeneratorService.get_batch_stats(db=db, batch_id=batch_id)
    return stats


@router.get("/{code_id}", response_model=CodeResponse)
async def get_code(
    code_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get a specific code by ID (Admin only)
    """
    code = db.query(PromotionalCode).filter(PromotionalCode.id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    return code


@router.patch("/{code_id}", response_model=CodeResponse)
async def update_code(
    code_id: int,
    status: Optional[CodeStatus] = None,
    is_active: Optional[bool] = None,
    discount_percentage: Optional[float] = None,
    bonus_amount: Optional[float] = None,
    description: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Update a promotional code (Admin only)
    Allows updating through patches as requested
    """
    code = db.query(PromotionalCode).filter(PromotionalCode.id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    
    # Update fields if provided
    if status is not None:
        code.status = status
    if is_active is not None:
        code.is_active = is_active
    if discount_percentage is not None:
        code.discount_percentage = discount_percentage
    if bonus_amount is not None:
        code.bonus_amount = bonus_amount
    if description is not None:
        code.description = description
    
    db.commit()
    db.refresh(code)
    
    return code


@router.delete("/{code_id}")
async def delete_code(
    code_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Delete a promotional code (Admin only)
    """
    code = db.query(PromotionalCode).filter(PromotionalCode.id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    
    db.delete(code)
    db.commit()
    
    return {"message": f"Code {code.code} deleted successfully"}


# Public endpoint - users can use codes
@router.post("/use", response_model=CodeUseResponse)
async def use_promotional_code(
    request: CodeUseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Use a promotional code (Authenticated users)
    """
    result = CodeGeneratorService.validate_and_use_code(
        db=db,
        code_str=request.code,
        user_id=current_user.id,
    )
    return result


@router.get("/validate/{code_str}")
async def validate_code(
    code_str: str,
    db: Session = Depends(get_db),
):
    """
    Validate a promotional code without using it (Public)
    """
    code = db.query(PromotionalCode).filter(PromotionalCode.code == code_str).first()
    
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    
    return {
        "code": code.code,
        "is_valid": code.is_valid(),
        "status": code.status,
        "discount_percentage": code.discount_percentage,
        "bonus_amount": code.bonus_amount,
        "valid_until": code.valid_until,
    }
