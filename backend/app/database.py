"""
database.py
-----------
Creates the SQLAlchemy engine and session factory.
All other modules import `SessionLocal` (to open a DB session)
and `Base` (to define ORM models).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite file will be created at backend/journal.db
# For PostgreSQL later, swap this for:
#   postgresql+psycopg2://user:password@localhost/dbname
import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./journal.db")

engine = create_engine(
    DATABASE_URL,
    # Required for SQLite only — allows the same connection to be used
    # across multiple threads (FastAPI uses a thread pool)
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Each instance of SessionLocal is a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All ORM models inherit from this Base
Base = declarative_base()


# ---------------------------------------------------------------------------
# Dependency — used in FastAPI route functions via Depends(get_db)
# ---------------------------------------------------------------------------

def get_db():
    """
    Yields a database session and guarantees it is closed afterwards,
    even if an exception occurs.

    Usage in a route:
        @app.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
