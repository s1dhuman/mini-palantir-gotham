"""
Mini Palantir Gotham - FastAPI Backend
A powerful data intelligence API for crime analytics and visualization.
"""

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

# Local imports
from db import get_db, create_tables, get_db_info
from models import CrimeEvent, Borough, CrimeStats

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Mini Palantir Gotham API",
    description="A powerful data intelligence platform for crime analytics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup."""
    create_tables()
    logger.info("Database tables created successfully")


# Health check and info endpoints
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "Mini Palantir Gotham API is running",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health", tags=["Health"])
async def health_check(db: Session = Depends(get_db)):
    """Detailed health check including database connectivity."""
    try:
        # Test database connection
        crime_count = db.query(CrimeEvent).count()
        db_info = get_db_info()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": {
                "connected": True,
                "crime_records": crime_count,
                **db_info
            },
            "api": {
                "version": "1.0.0",
                "endpoints": len(app.routes)
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


# Crime data endpoints
@app.get("/crimes", tags=["Crime Data"])
async def get_crimes(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    borough: Optional[str] = Query(None, description="Filter by borough"),
    offense: Optional[str] = Query(None, description="Filter by offense type"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    lat_min: Optional[float] = Query(None, description="Minimum latitude for bounding box"),
    lat_max: Optional[float] = Query(None, description="Maximum latitude for bounding box"),
    lng_min: Optional[float] = Query(None, description="Minimum longitude for bounding box"),
    lng_max: Optional[float] = Query(None, description="Maximum longitude for bounding box")
):
    """
    Get crime events with optional filtering and pagination.
    Supports geographic bounding box, date range, and text filters.
    """
    try:
        query = db.query(CrimeEvent)
        
        # Apply filters
        if borough:
            query = query.filter(CrimeEvent.borough.ilike(f"%{borough}%"))
        
        if offense:
            query = query.filter(CrimeEvent.offense_description.ilike(f"%{offense}%"))
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(CrimeEvent.occurrence_date >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(CrimeEvent.occurrence_date <= end_dt)
        
        # Geographic bounding box filter
        if all([lat_min, lat_max, lng_min, lng_max]):
            query = query.filter(
                and_(
                    CrimeEvent.latitude >= lat_min,
                    CrimeEvent.latitude <= lat_max,
                    CrimeEvent.longitude >= lng_min,
                    CrimeEvent.longitude <= lng_max
                )
            )
        
        # Get total count for pagination info
        total = query.count()
        
        # Apply pagination and get results
        crimes = query.offset(skip).limit(limit).all()
        
        return {
            "data": [crime.to_dict() for crime in crimes],
            "pagination": {
                "total": total,
                "skip": skip,
                "limit": limit,
                "pages": (total + limit - 1) // limit
            },
            "filters": {
                "borough": borough,
                "offense": offense,
                "start_date": start_date,
                "end_date": end_date,
                "bounding_box": {
                    "lat_min": lat_min,
                    "lat_max": lat_max,
                    "lng_min": lng_min,
                    "lng_max": lng_max
                } if all([lat_min, lat_max, lng_min, lng_max]) else None
            }
        }
    
    except Exception as e:
        logger.error(f"Error fetching crimes: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/crimes/{crime_id}", tags=["Crime Data"])
async def get_crime_by_id(crime_id: int, db: Session = Depends(get_db)):
    """Get a specific crime event by ID."""
    crime = db.query(CrimeEvent).filter(CrimeEvent.id == crime_id).first()
    
    if not crime:
        raise HTTPException(status_code=404, detail="Crime not found")
    
    return crime.to_dict()


# Analytics and statistics endpoints
@app.get("/stats/summary", tags=["Analytics"])
async def get_crime_summary(db: Session = Depends(get_db)):
    """Get overall crime statistics summary."""
    try:
        total_crimes = db.query(CrimeEvent).count()
        
        # Crime by borough
        borough_stats = db.query(
            CrimeEvent.borough,
            func.count(CrimeEvent.id).label('count')
        ).group_by(CrimeEvent.borough).all()
        
        # Crime by category
        offense_stats = db.query(
            CrimeEvent.law_category,
            func.count(CrimeEvent.id).label('count')
        ).group_by(CrimeEvent.law_category).all()
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_crimes = db.query(CrimeEvent).filter(
            CrimeEvent.occurrence_date >= thirty_days_ago
        ).count()
        
        return {
            "total_crimes": total_crimes,
            "recent_crimes_30d": recent_crimes,
            "borough_breakdown": [
                {"borough": stat[0], "count": stat[1]} 
                for stat in borough_stats if stat[0]
            ],
            "offense_breakdown": [
                {"category": stat[0], "count": stat[1]} 
                for stat in offense_stats if stat[0]
            ],
            "last_updated": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error generating summary stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating statistics")


@app.get("/stats/boroughs", tags=["Analytics"])
async def get_borough_stats(db: Session = Depends(get_db)):
    """Get detailed statistics for each borough."""
    try:
        borough_data = db.query(
            CrimeEvent.borough,
            func.count(CrimeEvent.id).label('total_crimes'),
            func.count(func.distinct(CrimeEvent.offense_description)).label('unique_offenses'),
            func.avg(CrimeEvent.latitude).label('avg_lat'),
            func.avg(CrimeEvent.longitude).label('avg_lng')
        ).group_by(CrimeEvent.borough).all()
        
        return {
            "boroughs": [
                {
                    "name": data[0],
                    "total_crimes": data[1],
                    "unique_offenses": data[2],
                    "center_coordinates": {
                        "lat": float(data[3]) if data[3] else None,
                        "lng": float(data[4]) if data[4] else None
                    }
                }
                for data in borough_data if data[0]
            ]
        }
    
    except Exception as e:
        logger.error(f"Error generating borough stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating borough statistics")


@app.get("/stats/timeline", tags=["Analytics"])
async def get_crime_timeline(
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365, description="Number of days to include")
):
    """Get crime count timeline for the specified number of days."""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Group by date
        timeline_data = db.query(
            func.date(CrimeEvent.occurrence_date).label('date'),
            func.count(CrimeEvent.id).label('count')
        ).filter(
            CrimeEvent.occurrence_date >= start_date
        ).group_by(
            func.date(CrimeEvent.occurrence_date)
        ).order_by('date').all()
        
        return {
            "timeline": [
                {
                    "date": str(data[0]),
                    "count": data[1]
                }
                for data in timeline_data
            ],
            "period_days": days,
            "start_date": start_date.isoformat(),
            "end_date": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error generating timeline: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating timeline")


# Geographic endpoints
@app.get("/geo/heatmap", tags=["Geographic"])
async def get_heatmap_data(
    db: Session = Depends(get_db),
    borough: Optional[str] = Query(None, description="Filter by borough")
):
    """Get coordinate data for heatmap visualization."""
    try:
        query = db.query(
            CrimeEvent.latitude,
            CrimeEvent.longitude,
            CrimeEvent.offense_description
        ).filter(
            and_(
                CrimeEvent.latitude.isnot(None),
                CrimeEvent.longitude.isnot(None)
            )
        )
        
        if borough:
            query = query.filter(CrimeEvent.borough.ilike(f"%{borough}%"))
        
        coordinates = query.all()
        
        return {
            "heatmap_points": [
                {
                    "lat": float(coord[0]),
                    "lng": float(coord[1]),
                    "offense": coord[2]
                }
                for coord in coordinates
                if coord[0] and coord[1]
            ],
            "total_points": len(coordinates),
            "filter": {"borough": borough}
        }
    
    except Exception as e:
        logger.error(f"Error generating heatmap data: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating heatmap data")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
