"""
Database connection and session management for Mini Palantir Gotham.
Supports both SQLite (development) and PostgreSQL (production).
"""

import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gotham.db")

# Create SQLAlchemy engine
if DATABASE_URL.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # Needed for SQLite
        echo=False  # Set to True for SQL query logging
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Set to True for SQL query logging
        pool_size=20,
        max_overflow=30,
        pool_pre_ping=True
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base
Base = declarative_base()

# Metadata for database operations
metadata = MetaData()


def get_db():
    """
    Dependency function to get database session.
    Used with FastAPI's Depends() for automatic session management.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Create all tables in the database.
    Call this when initializing the application.
    """
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """
    Drop all tables in the database.
    Use with caution - this will delete all data!
    """
    Base.metadata.drop_all(bind=engine)


def get_db_info():
    """
    Get database connection information for health checks.
    """
    return {
        "database_url": DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else DATABASE_URL,
        "engine": str(engine.url),
        "driver": engine.name
    } 