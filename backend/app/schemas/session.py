"""
schemas/session.py
------------------
Pydantic models for journal sessions and their messages.
"""

from datetime import datetime
from pydantic import BaseModel


# ── Message schemas ──────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    role:    str   # 'user' | 'assistant'
    content: str


class MessageResponse(BaseModel):
    id:         int
    role:       str
    content:    str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Session schemas ──────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    topic: str


class SessionResponse(BaseModel):
    id:         int
    user_id:    int
    topic:      str
    created_at: datetime
    updated_at: datetime
    messages:   list[MessageResponse] = []

    model_config = {"from_attributes": True}


class SessionSummary(BaseModel):
    """Lightweight version used when listing sessions (no messages)."""
    id:         int
    topic:      str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
