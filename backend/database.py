import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Swap this one line to switch to Postgres in production, e.g.:
# DATABASE_URL = "postgresql://user:password@localhost/rog_upaattam"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rog_upaattam.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
