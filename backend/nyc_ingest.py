# nyc_ingest.py

'''
this is our data ingestion layer,  this script will:
    connect NYC's open Data API, 
    fetch the latest crime compalaints,
    convert them into python objects, 
    and then save them into SQLite db (crime_events table)
'''


import requests
from datetime import datetime
from sqlalchemy.orm import Session
from db import sessionLocal, engine
from models import CrimeEvent
from models import base


# create the table in db (just one time, it checks if table exitsts, if not it creates one)
base.metadata.create_all(bind=engine)

def fetchCrimeData():
    url = "https://data.cityofnewyork.us/resource/qgea-i56i.json"
    params = {
        "$limit": 100,  # Get only 100 records for now
        "$order": "cmplnt_fr_dt DESC",  # Sort by most recent
        "$where": "cmplnt_fr_dt > '2024-07-01T00:00:00'"  # Only recent events
    }
    
    response = requests.get(url, params=params)
    data = response.json()  # convert json to python list
    return data


# function to insert the deteched data into SQLite db
def storeToDb(data):
    db : Session = sessionLocal()
    
    for item in data:
        try:
            # parse fiels with fallback / default values
            offense = item.get("ofns_desc", "unknown")
            borough = item.get("boro_nm", "unknown")
            dateStr = item.get*("cmplnt_fr_dt", None)
            lat = item.get("latitude", None)
            lng = item.get("longitude", None)

            
            # Skip rows that are missing critical info
            if not dateStr or not lat or not lng:
                continue
        
            # convert date string to datetime object
            complaintDate = datetime.fromisoformat(dateStr)
            
            
            # create a new crimeEvent row
            event = CrimeEvent(
                offense = offense,
                borough = borough,
                complaintDate = complaintDate,
                latitude = float(lat),
                longitude = float(lng)
            )
            
            
            db.add(event)   # add session
        except Exception as e:
            print("Skipping one row due to an error: ", e)
    db.commit()
    db.close()
    print("Date succesfully saved to the database.")


if __name__ == "__main__":
    crimeData = fetchCrimeData()
    storeToDb(crimeData)