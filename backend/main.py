"""
main.py — AI Learning Journal API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app import models  # noqa: F401
from app.routers import users, sessions, contact, chat, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Learning Journal API",
    description="Personal AI-powered learning journal — FastAPI + SQLite + Groq.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api")
app.include_router(users.router,    prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(contact.router,  prefix="/api")
app.include_router(chat.router,     prefix="/api")


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "version": "1.0.0"}
