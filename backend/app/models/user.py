"""
models/user.py
--------------
Represents a registered user.
Supports both email/password and Google OAuth sign-in.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    email          = Column(String, unique=True, index=True, nullable=False)
    name           = Column(String, nullable=False)

    # Nullable: users who sign in via Google won't have a password
    hashed_password = Column(String, nullable=True)

    # Nullable: users who sign up with email won't have a Google ID
    google_id      = Column(String, unique=True, nullable=True, index=True)

    is_active      = Column(Boolean, default=True)
    created_at     = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<User id={self.id} email={self.email!r}>"
