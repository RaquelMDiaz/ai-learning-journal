"""
schemas/contact.py
------------------
Pydantic models for the contact form.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator


class ContactCreate(BaseModel):
    name:    str
    email:   EmailStr
    message: str

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name must not be empty.")
        return v.strip()

    @field_validator("message")
    @classmethod
    def message_min_length(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Message must be at least 10 characters.")
        return v.strip()


class ContactResponse(BaseModel):
    id:           int
    name:         str
    email:        str
    message:      str
    submitted_at: datetime

    model_config = {"from_attributes": True}
