"""
models/__init__.py
------------------
Import all models here so that:
  1. Alembic can discover them all via `from app.models import *`
  2. The User model gets its `sessions` relationship registered
     before SQLAlchemy resolves back_populates.
"""

from app.models.user import User
from app.models.session import JournalSession
from app.models.message import Message
from app.models.contact import ContactSubmission

# Wire up the reverse relationship on User here to keep model files clean
from sqlalchemy.orm import relationship
User.sessions = relationship("JournalSession", back_populates="user",
                             cascade="all, delete-orphan")

__all__ = ["User", "JournalSession", "Message", "ContactSubmission"]
