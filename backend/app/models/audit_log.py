"""
Audit logging model for compliance and security.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class AuditLog(Base):
    """Audit log for tracking all user actions."""
    
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Action details
    action = Column(String, nullable=False, index=True)  # login, trade, withdrawal, etc.
    resource_type = Column(String, nullable=True)  # order, wallet, user, etc.
    resource_id = Column(String, nullable=True)
    
    # Request information
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    # Additional data
    details = Column(Text, nullable=True)  # JSON string with additional context
    
    # Result
    status = Column(String, default="success")  # success, failure, error
    error_message = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = relationship("User", back_populates="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog {self.action} by user_id={self.user_id}>"
