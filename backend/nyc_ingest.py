"""
NYC Crime Data Ingestion Script for Mini Palantir Gotham
Handles data ingestion from CSV files and creates sample data if needed.
"""

import pandas as pd
import os
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from db import engine, create_tables
from models import CrimeEvent, Borough
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create session
Session = sessionmaker(bind=engine)


def create_sample_data():
    """
    Create sample NYC crime data for demonstration purposes.
    This generates realistic-looking crime data for all 5 NYC boroughs.
    """
    logger.info("Creating sample crime data...")
    
    # NYC Boroughs with their approximate centers and bounds
    boroughs_info = {
        "MANHATTAN": {
            "center": (40.7831, -73.9712),
            "bounds": {"lat_range": (40.700, 40.880), "lng_range": (-74.020, -73.910)}
        },
        "BROOKLYN": {
            "center": (40.6782, -73.9442),
            "bounds": {"lat_range": (40.570, 40.740), "lng_range": (-74.060, -73.840)}
        },
        "QUEENS": {
            "center": (40.7282, -73.7949),
            "bounds": {"lat_range": (40.540, 40.800), "lng_range": (-73.960, -73.700)}
        },
        "BRONX": {
            "center": (40.8448, -73.8648),
            "bounds": {"lat_range": (40.790, 40.920), "lng_range": (-73.930, -73.760)}
        },
        "STATEN ISLAND": {
            "center": (40.5795, -74.1502),
            "bounds": {"lat_range": (40.470, 40.650), "lng_range": (-74.260, -74.050)}
        }
    }
    
    # Crime types and categories
    crime_types = [
        ("ASSAULT", "FELONY", "Assault 3 & Related Offenses"),
        ("BURGLARY", "FELONY", "Burglary"),
        ("ROBBERY", "FELONY", "Robbery"),
        ("GRAND LARCENY", "FELONY", "Grand Larceny"),
        ("PETIT LARCENY", "MISDEMEANOR", "Petit Larceny"),
        ("CRIMINAL MISCHIEF", "MISDEMEANOR", "Criminal Mischief & Related Offenses"),
        ("HARASSMENT", "VIOLATION", "Harassment 2"),
        ("DRUG POSSESSION", "MISDEMEANOR", "Dangerous Drugs"),
        ("VEHICLE THEFT", "FELONY", "Grand Larceny of Motor Vehicle"),
        ("FRAUD", "FELONY", "Forgery"),
        ("DOMESTIC VIOLENCE", "FELONY", "Felony Assault"),
        ("VANDALISM", "MISDEMEANOR", "Criminal Mischief"),
        ("TRESPASSING", "VIOLATION", "Trespass"),
        ("DISORDERLY CONDUCT", "VIOLATION", "Disorderly Conduct"),
        ("WEAPONS POSSESSION", "FELONY", "Dangerous Weapons")
    ]
    
    # Location types
    location_types = [
        "STREET", "RESIDENCE - APT HOUSE", "COMMERCIAL BUILDING", 
        "PARK/PLAYGROUND", "TRANSIT - NYC SUBWAY", "STORE UNCLASSIFIED",
        "RESTAURANT/DINER", "SCHOOL", "PARKING LOT/GARAGE", "HOSPITAL"
    ]
    
    # Demographics
    age_groups = ["<18", "18-24", "25-44", "45-64", "65+", "UNKNOWN"]
    genders = ["M", "F", "U"]
    races = ["BLACK", "WHITE", "HISPANIC", "ASIAN", "OTHER", "UNKNOWN"]
    
    sample_data = []
    
    # Generate 1000 sample records
    for i in range(1000):
        # Random borough
        borough = random.choice(list(boroughs_info.keys()))
        borough_info = boroughs_info[borough]
        
        # Random coordinates within borough bounds
        lat_range = borough_info["bounds"]["lat_range"]
        lng_range = borough_info["bounds"]["lng_range"]
        latitude = round(random.uniform(lat_range[0], lat_range[1]), 6)
        longitude = round(random.uniform(lng_range[0], lng_range[1]), 6)
        
        # Random crime type
        offense_desc, law_cat, specific_offense = random.choice(crime_types)
        
        # Random dates (within last 2 years)
        days_ago = random.randint(1, 730)
        occurrence_date = datetime.now() - timedelta(days=days_ago)
        report_date = occurrence_date + timedelta(days=random.randint(0, 7))
        
        # Random precinct (simplified)
        precinct = random.randint(1, 123)
        
        record = {
            "complaint_number": f"2024{str(i+1).zfill(6)}",
            "occurrence_date": occurrence_date,
            "report_date": report_date,
            "offense_description": offense_desc,
            "law_category": law_cat,
            "specific_offense": specific_offense,
            "borough": borough,
            "precinct": precinct,
            "latitude": latitude,
            "longitude": longitude,
            "location_description": random.choice(["INSIDE", "OUTSIDE", "FRONT OF", "REAR OF"]),
            "premises_type": random.choice(location_types),
            "status": random.choice(["COMPLETED", "OPEN", "CLOSED"]),
            "arrest_made": random.choice([True, False]),
            "victim_age_group": random.choice(age_groups),
            "victim_gender": random.choice(genders),
            "victim_race": random.choice(races),
            "suspect_age_group": random.choice(age_groups) if random.random() > 0.3 else None,
            "suspect_gender": random.choice(genders) if random.random() > 0.3 else None,
            "suspect_race": random.choice(races) if random.random() > 0.3 else None,
            "data_source": "SAMPLE_DATA"
        }
        
        sample_data.append(record)
    
    # Create DataFrame and save as CSV
    df = pd.DataFrame(sample_data)
    
    # Ensure data directory exists
    os.makedirs("../data", exist_ok=True)
    
    csv_path = "../data/sample_crime_data.csv"
    df.to_csv(csv_path, index=False)
    logger.info(f"Sample data saved to {csv_path}")
    
    return df


def ingest_csv_data(csv_path):
    """
    Ingest crime data from CSV file into the database.
    """
    logger.info(f"Starting data ingestion from {csv_path}")
    
    # Check if file exists
    if not os.path.exists(csv_path):
        logger.warning(f"CSV file not found at {csv_path}")
        logger.info("Creating sample data...")
        df = create_sample_data()
        csv_path = "../data/sample_crime_data.csv"
    else:
        # Read CSV file
        try:
            df = pd.read_csv(csv_path)
            logger.info(f"Loaded {len(df)} records from CSV")
        except Exception as e:
            logger.error(f"Error reading CSV file: {str(e)}")
            return False
    
    # Create database session
    session = Session()
    
    try:
        # Clear existing data
        logger.info("Clearing existing crime data...")
        session.query(CrimeEvent).delete()
        session.commit()
        
        # Process each row
        successful_inserts = 0
        failed_inserts = 0
        
        for index, row in df.iterrows():
            try:
                # Create CrimeEvent object
                crime_event = CrimeEvent(
                    complaint_number=str(row.get('complaint_number', f"UNK_{index}")),
                    occurrence_date=pd.to_datetime(row.get('occurrence_date')) if pd.notna(row.get('occurrence_date')) else None,
                    report_date=pd.to_datetime(row.get('report_date')) if pd.notna(row.get('report_date')) else None,
                    offense_description=str(row.get('offense_description', '')),
                    law_category=str(row.get('law_category', '')),
                    specific_offense=str(row.get('specific_offense', '')),
                    borough=str(row.get('borough', '')),
                    precinct=int(row.get('precinct', 0)) if pd.notna(row.get('precinct')) else None,
                    address=str(row.get('address', '')) if pd.notna(row.get('address')) else None,
                    latitude=float(row.get('latitude')) if pd.notna(row.get('latitude')) else None,
                    longitude=float(row.get('longitude')) if pd.notna(row.get('longitude')) else None,
                    location_description=str(row.get('location_description', '')) if pd.notna(row.get('location_description')) else None,
                    premises_type=str(row.get('premises_type', '')) if pd.notna(row.get('premises_type')) else None,
                    status=str(row.get('status', 'OPEN')),
                    arrest_made=bool(row.get('arrest_made', False)) if pd.notna(row.get('arrest_made')) else False,
                    victim_age_group=str(row.get('victim_age_group', '')) if pd.notna(row.get('victim_age_group')) else None,
                    victim_gender=str(row.get('victim_gender', '')) if pd.notna(row.get('victim_gender')) else None,
                    victim_race=str(row.get('victim_race', '')) if pd.notna(row.get('victim_race')) else None,
                    suspect_age_group=str(row.get('suspect_age_group', '')) if pd.notna(row.get('suspect_age_group')) else None,
                    suspect_gender=str(row.get('suspect_gender', '')) if pd.notna(row.get('suspect_gender')) else None,
                    suspect_race=str(row.get('suspect_race', '')) if pd.notna(row.get('suspect_race')) else None,
                    data_source=str(row.get('data_source', 'CSV_IMPORT'))
                )
                
                session.add(crime_event)
                successful_inserts += 1
                
                # Commit every 100 records to avoid memory issues
                if successful_inserts % 100 == 0:
                    session.commit()
                    logger.info(f"Processed {successful_inserts} records...")
                
            except Exception as e:
                logger.warning(f"Failed to insert row {index}: {str(e)}")
                failed_inserts += 1
                session.rollback()
        
        # Final commit
        session.commit()
        
        logger.info(f"Data ingestion completed!")
        logger.info(f"Successfully inserted: {successful_inserts} records")
        logger.info(f"Failed inserts: {failed_inserts} records")
        
        return True
        
    except Exception as e:
        logger.error(f"Error during data ingestion: {str(e)}")
        session.rollback()
        return False
        
    finally:
        session.close()


def initialize_boroughs():
    """
    Initialize borough reference data.
    """
    logger.info("Initializing borough data...")
    
    boroughs_data = [
        {
            "name": "MANHATTAN",
            "population": 1694251,
            "area_sq_miles": 22.83,
            "north_bound": 40.88,
            "south_bound": 40.70,
            "east_bound": -73.91,
            "west_bound": -74.02
        },
        {
            "name": "BROOKLYN",
            "population": 2736074,
            "area_sq_miles": 69.50,
            "north_bound": 40.74,
            "south_bound": 40.57,
            "east_bound": -73.84,
            "west_bound": -74.06
        },
        {
            "name": "QUEENS",
            "population": 2405464,
            "area_sq_miles": 108.53,
            "north_bound": 40.80,
            "south_bound": 40.54,
            "east_bound": -73.70,
            "west_bound": -73.96
        },
        {
            "name": "BRONX",
            "population": 1472654,
            "area_sq_miles": 42.00,
            "north_bound": 40.92,
            "south_bound": 40.79,
            "east_bound": -73.76,
            "west_bound": -73.93
        },
        {
            "name": "STATEN ISLAND",
            "population": 495747,
            "area_sq_miles": 57.50,
            "north_bound": 40.65,
            "south_bound": 40.47,
            "east_bound": -74.05,
            "west_bound": -74.26
        }
    ]
    
    session = Session()
    
    try:
        # Clear existing borough data
        session.query(Borough).delete()
        session.commit()
        
        # Insert borough data
        for borough_data in boroughs_data:
            borough = Borough(**borough_data)
            session.add(borough)
        
        session.commit()
        logger.info("Borough data initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing borough data: {str(e)}")
        session.rollback()
    
    finally:
        session.close()


def main():
    """
    Main function to run the data ingestion process.
    """
    logger.info("Starting Mini Palantir Gotham data ingestion...")
    
    # Create tables
    create_tables()
    
    # Initialize borough data
    initialize_boroughs()
    
    # Try to ingest from existing CSV, or create sample data
    csv_path = "../data/nyc_crime_data.csv"
    
    if not os.path.exists(csv_path):
        logger.info("No existing crime data found. Creating sample data...")
        create_sample_data()
        csv_path = "../data/sample_crime_data.csv"
    
    # Ingest the data
    success = ingest_csv_data(csv_path)
    
    if success:
        logger.info("🎉 Data ingestion completed successfully!")
        logger.info("You can now start the FastAPI server with: uvicorn main:app --reload")
    else:
        logger.error("❌ Data ingestion failed!")


if __name__ == "__main__":
    main()