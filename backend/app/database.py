from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Determine database engine parameters based on URL (e.g. SQLite requires special connect_args)
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True  # Automatically checks connection health before utilizing from pool
)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base
Base = declarative_base()

# DB Dependency injection helper
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
