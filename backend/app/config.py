"""
app/config.py
-------------
Centralised settings loaded from environment variables.
Copy .env.example to .env and fill in your values.
"""
import os
from dotenv import load_dotenv
from functools import lru_cache

load_dotenv()  # loads .env before os.getenv() calls are made

class Settings:
    # ── JWT ──────────────────────────────────────────────────────────────────
    # Generate a strong secret with: python -c "import secrets; print(secrets.token_hex(32))"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # ── Anthropic ────────────────────────────────────────────────────────────
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # ── Google OAuth (optional) ──────────────────────────────────────────────
    # Register at: https://console.cloud.google.com/apis/credentials
    # Set Authorised redirect URI to: http://localhost:8000/api/auth/google/callback
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv(
        "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback"
    )

    # ── App ──────────────────────────────────────────────────────────────────
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5500")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
