"""
routers/contact.py
------------------
Contact form — public endpoint with Pydantic validation.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.contact import ContactSubmission
from app.schemas.contact import ContactCreate, ContactResponse
from app.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def submit_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    """Public endpoint — no login required to submit a contact form."""
    submission = ContactSubmission(
        name=payload.name,
        email=payload.email,
        message=payload.message,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/", response_model=list[ContactResponse])
def list_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # must be logged in
):
    """Protected — only logged-in users can view submissions (add admin check later)."""
    return db.query(ContactSubmission).order_by(ContactSubmission.submitted_at.desc()).all()
