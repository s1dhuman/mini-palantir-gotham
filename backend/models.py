"""
SQLAlchemy models for Mini Palantir Gotham.
Defines the database schema for crime events and related data.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from db import Base
import datetime


class CrimeEvent(Base):
    """
    Crime event model representing individual crime incidents.
    Based on NYC Open Data crime structure with additional analytics fields.
    """
    __tablename__ = "crime_events"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Crime identification
    complaint_number = Column(String(20), unique=True, index=True)
    
    # Date and time information
    occurrence_date = Column(DateTime, index=True)
    report_date = Column(DateTime, index=True)
    
    # Crime classification
    offense_description = Column(String(100), index=True)
    law_category = Column(String(50), index=True)  # FELONY, MISDEMEANOR, VIOLATION
    specific_offense = Column(String(100))
    
    # Location information
    borough = Column(String(20), index=True)
    precinct = Column(Integer, index=True)
    jurisdiction = Column(String(50))
    
    # Detailed address
    address = Column(String(200))
    intersection = Column(String(200))
    
    # Coordinates (critical for mapping)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    
    # Additional location details
    location_description = Column(String(100))  # INSIDE, OUTSIDE, etc.
    premises_type = Column(String(100))  # RESIDENCE, STREET, etc.
    
    # Crime status and outcome
    status = Column(String(20), default="OPEN")  # OPEN, CLOSED, PENDING
    arrest_made = Column(Boolean, default=False)
    
    # Victim and suspect demographics (anonymized)
    victim_age_group = Column(String(20))
    victim_gender = Column(String(10))
    victim_race = Column(String(50))
    
    suspect_age_group = Column(String(20))
    suspect_gender = Column(String(10))
    suspect_race = Column(String(50))
    
    # Additional details
    case_notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Data source tracking
    data_source = Column(String(50), default="NYC_OPENDATA")
    data_quality_score = Column(Float, default=1.0)  # 0.0 to 1.0
    
    def __repr__(self):
        return f"<CrimeEvent(id={self.id}, offense='{self.offense_description}', borough='{self.borough}')>"
    
    def to_dict(self):
        """Convert crime event to dictionary for API responses."""
        return {
            "id": self.id,
            "complaint_number": self.complaint_number,
            "occurrence_date": self.occurrence_date.isoformat() if self.occurrence_date else None,
            "report_date": self.report_date.isoformat() if self.report_date else None,
            "offense_description": self.offense_description,
            "law_category": self.law_category,
            "specific_offense": self.specific_offense,
            "borough": self.borough,
            "precinct": self.precinct,
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "location_description": self.location_description,
            "premises_type": self.premises_type,
            "status": self.status,
            "arrest_made": self.arrest_made,
            "victim_age_group": self.victim_age_group,
            "victim_gender": self.victim_gender,
            "victim_race": self.victim_race,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "data_source": self.data_source
        }


class Borough(Base):
    """
    Borough information and statistics.
    """
    __tablename__ = "boroughs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(20), unique=True, index=True)
    population = Column(Integer)
    area_sq_miles = Column(Float)
    
    # Crime statistics (updated periodically)
    total_crimes = Column(Integer, default=0)
    crime_rate_per_1000 = Column(Float, default=0.0)
    
    # Geographic bounds for mapping
    north_bound = Column(Float)
    south_bound = Column(Float)
    east_bound = Column(Float)
    west_bound = Column(Float)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "population": self.population,
            "area_sq_miles": self.area_sq_miles,
            "total_crimes": self.total_crimes,
            "crime_rate_per_1000": self.crime_rate_per_1000,
            "bounds": {
                "north": self.north_bound,
                "south": self.south_bound,
                "east": self.east_bound,
                "west": self.west_bound
            }
        }


class CrimeStats(Base):
    """
    Aggregated crime statistics for analytics dashboard.
    """
    __tablename__ = "crime_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Time period
    stat_date = Column(DateTime, index=True)
    period_type = Column(String(20))  # DAILY, WEEKLY, MONTHLY, YEARLY
    
    # Geographic scope
    borough = Column(String(20), index=True)
    precinct = Column(Integer)
    
    # Crime type
    offense_category = Column(String(100), index=True)
    
    # Statistics
    crime_count = Column(Integer, default=0)
    arrest_count = Column(Integer, default=0)
    clearance_rate = Column(Float, default=0.0)
    
    # Trends
    change_from_previous = Column(Float, default=0.0)  # Percentage change
    trend_direction = Column(String(10))  # UP, DOWN, STABLE
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "stat_date": self.stat_date.isoformat() if self.stat_date else None,
            "period_type": self.period_type,
            "borough": self.borough,
            "precinct": self.precinct,
            "offense_category": self.offense_category,
            "crime_count": self.crime_count,
            "arrest_count": self.arrest_count,
            "clearance_rate": self.clearance_rate,
            "change_from_previous": self.change_from_previous,
            "trend_direction": self.trend_direction
        }

