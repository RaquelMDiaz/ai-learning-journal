"""
schemas/user.py
---------------
Pydantic models for request validation and response serialisation.
These are separate from the SQLAlchemy ORM models.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Payload accepted when registering a new user."""
    name:     str
    email:    EmailStr
    password: str


class UserResponse(BaseModel):
    """Shape of user data returned by the API (never includes password)."""
    id:         int
    name:       str
    email:      str
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}
