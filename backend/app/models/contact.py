"""
models/contact.py
-----------------
Stores messages submitted through the contact form.
Not linked to a user account — anyone can submit.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base


class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    email        = Column(String, nullable=False, index=True)
    message      = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<ContactSubmission id={self.id} email={self.email!r}>"
