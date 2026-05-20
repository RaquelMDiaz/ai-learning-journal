"""
routers/chat.py
---------------
AI chat endpoint — uses Google Gemini, saves full conversation history per session.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import google.generativeai as genai

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

    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set.")

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

    # Gemini uses 'model' instead of 'assistant' for the AI role
    # and requires history and the new message to be separated
    gemini_history = [
        {
            "role": "user" if m.role == "user" else "model",
            "parts": [m.content]
        }
        for m in history[:-1]  # all messages except the last (which we just added)
    ]

    # Configure Gemini
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=(
            f"You are a helpful learning assistant for {current_user.name}. "
            f"The topic of this journal session is: '{session.topic}'. "
            "Help the user understand, explore, and reflect on this topic."
        )
    )

    # Start chat with history and send the latest message
    chat_session = model.start_chat(history=gemini_history)
    response = chat_session.send_message(payload.content)
    reply_text = response.text

    # Save Gemini's reply
    assistant_msg = Message(session_id=session_id, role="assistant", content=reply_text)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg