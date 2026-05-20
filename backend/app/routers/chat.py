"""
routers/chat.py
---------------
AI chat endpoint — uses Groq, saves full conversation history per session.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from groq import Groq

from app.database import get_db
from app.models.session import JournalSession
from app.models.message import Message
from app.models.user import User
from app.auth import get_current_user
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str

    model_config = {"from_attributes": True}


@router.post("/{session_id}", response_model=ChatMessageResponse)
def chat(
    session_id: int,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify session belongs to current user
    session = db.query(JournalSession).filter(
        JournalSession.id == session_id,
        JournalSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set.")

    # Save user message
    user_msg = Message(session_id=session_id, role="user", content=payload.content)
    db.add(user_msg)
    db.commit()

    # Load full history for multi-turn context
    history = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at)
        .all()
    )

    # Build messages list for Groq (same format as OpenAI)
    messages = [
        {
            "role": "system",
            "content": (
                f"You are a helpful learning assistant for {current_user.name}. "
                f"The topic of this journal session is: '{session.topic}'. "
                "Help the user understand, explore, and reflect on this topic."
            )
        }
    ] + [
        {"role": m.role, "content": m.content}
        for m in history
    ]

    # Call Groq
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=1024,
    )
    reply_text = response.choices[0].message.content

    # Save reply
    assistant_msg = Message(session_id=session_id, role="assistant", content=reply_text)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg